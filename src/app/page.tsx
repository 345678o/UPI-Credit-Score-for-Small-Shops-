
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, QrCode, ChevronRight, TrendingUp, Sparkles, Bell } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, limit, orderBy, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const sparklineData = [
  { value: 400 }, { value: 300 }, { value: 600 }, { value: 450 }, { value: 700 }, { value: 900 }, { value: 1100 },
];

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/onboarding");
    }
  }, [user, isUserLoading, router]);

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(getFirestore(), "users", user.uid);
  }, [user]);

  const { data: merchantData } = useDoc(userRef);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(getFirestore(), "users", user.uid, "transactions"),
      orderBy("timestamp", "desc"),
      limit(4)
    );
  }, [user]);

  const { data: transactions } = useCollection(transactionsQuery);

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppShell>
      <header className="mb-6 flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Good Morning,</p>
          <h1 className="text-2xl font-extrabold font-headline text-primary">
            {merchantData?.businessName || "Your Store"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/notifications">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200">
              <Bell className="w-5 h-5 text-primary" />
            </Button>
          </Link>
        </div>
      </header>

      <Card className="indigo-gradient text-white border-none shadow-2xl mb-8 overflow-hidden relative rounded-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <CardContent className="p-6 pt-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/70 text-sm font-semibold mb-1">Business Pulse</p>
              <h2 className="text-4xl font-extrabold font-headline tracking-tighter tabular-nums">
                ₹{(merchantData?.creditScore ? 1000 + (merchantData.creditScore * 10) : 4280.50).toLocaleString()}
              </h2>
            </div>
            <div className="bg-emerald-500/20 p-2.5 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          
          <div className="h-20 w-full -mx-6 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1EA366" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1EA366" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1EA366" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold py-1 px-3 bg-white/10 w-fit rounded-full text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Credit scoring active</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Receive", icon: ArrowDownLeft, href: "/payments", color: "bg-emerald-50 text-emerald-600" },
          { label: "Send", icon: ArrowUpRight, href: "/payments", color: "bg-indigo-50 text-indigo-600" },
          { label: "QR Code", icon: QrCode, href: "/payments", color: "bg-gray-50 text-gray-700" }
        ].map((item) => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-3">
            <div className={cn("w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center transition-transform active:scale-95", item.color)}>
              <item.icon className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-primary">{item.label}</span>
          </Link>
        ))}
      </div>

      <Card className="mb-8 border-none bg-indigo-50/40 rounded-3xl overflow-hidden group active:scale-[0.98] transition-all">
        <Link href="/credit">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-0.5">Live Credit Score</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-extrabold text-primary tabular-nums">
                    {merchantData?.creditScore || 300}
                  </h3>
                  <span className={cn(
                    "text-[10px] text-white px-2 py-0.5 rounded-full font-bold",
                    (merchantData?.creditScore || 0) > 700 ? "bg-emerald-600" : "bg-indigo-600"
                  )}>
                    {(merchantData?.creditScore || 0) > 700 ? "Excellent" : "Developing"}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-indigo-600 opacity-50 group-hover:opacity-100 transition-opacity" />
          </CardContent>
        </Link>
      </Card>

      <section className="pb-8">
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="font-extrabold font-headline text-lg text-primary">Recent Activity</h3>
          <Button variant="link" className="text-sm p-0 h-auto font-bold text-secondary hover:no-underline" asChild>
            <Link href="/analytics">View Insights</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {transactions?.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-50/50">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center",
                  tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                )}>
                  {tx.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-primary">{tx.payerIdentifier || "Customer"}</p>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"} • {tx.method}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-base font-extrabold tabular-nums", tx.type === "credit" ? "text-emerald-600" : "text-primary")}>
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-tighter">{tx.status}</p>
                </div>
              </div>
            </div>
          ))}
          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-8 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No Transactions Recorded</p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
