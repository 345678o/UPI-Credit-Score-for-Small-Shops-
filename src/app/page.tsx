"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, QrCode, ChevronRight, TrendingUp, Sparkles, Bell, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, limit, orderBy, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/onboarding");
    }
  }, [user, isUserLoading, router]);

  const db = getFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [user]);

  const { data: merchantData } = useDoc(userRef);

  const summaryRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid, "userAnalyticsSummary", "current");
  }, [user]);

  const { data: summaryData } = useDoc(summaryRef);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("timestamp", "desc"),
      limit(4)
    );
  }, [user]);

  const { data: transactions } = useCollection(transactionsQuery);

  // Fetch aggregates for sparkline
  const sparklineQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "dailyBusinessAggregates"),
      orderBy("date", "desc"),
      limit(7)
    );
  }, [user]);

  const { data: aggregates } = useCollection(sparklineQuery);

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pulseValue = summaryData?.weeklyEarnings || 0;
  
  // Transform aggregates into sparkline data, or use a default flat line if no data
  const sparklineData = aggregates?.length ? 
    aggregates.map(agg => ({ value: agg.totalEarnings })).reverse() : 
    [{ value: 0 }, { value: 0 }];

  return (
    <AppShell>
      <header className="mb-6 flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[2px]">Welcome back,</p>
          <h1 className="text-2xl font-black font-headline text-primary tracking-tight">
            {merchantData?.businessName || "Your Store"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/notifications">
            <Button variant="outline" size="icon" className="rounded-2xl h-11 w-11 border-gray-100 shadow-sm">
              <Bell className="w-5 h-5 text-primary" />
            </Button>
          </Link>
        </div>
      </header>

      <Card className="indigo-gradient text-white border-none shadow-2xl mb-8 overflow-hidden relative rounded-[2rem]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/60 text-[10px] font-extrabold uppercase tracking-[3px] mb-1">Weekly Pulse</p>
              <h2 className="text-4xl font-black font-headline tracking-tighter tabular-nums">
                ₹{pulseValue.toLocaleString()}
              </h2>
            </div>
            <div className="bg-emerald-500/20 p-2.5 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          
          <div className="h-20 w-full -mx-8 mb-6">
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
          
          <div className="flex items-center gap-2 text-[10px] font-black py-2 px-4 bg-white/10 w-fit rounded-full text-emerald-300 uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI scoring active</span>
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
            <div className={cn("w-16 h-16 rounded-[1.75rem] shadow-sm flex items-center justify-center transition-transform active:scale-90", item.color)}>
              <item.icon className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </div>

      <Card className="mb-8 border-none bg-indigo-50 shadow-sm rounded-[2rem] overflow-hidden group active:scale-[0.98] transition-all">
        <Link href="/credit">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-0.5">Live Credit Score</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-primary tabular-nums tracking-tighter">
                    {merchantData?.creditScore || 300}
                  </h3>
                  <span className={cn(
                    "text-[9px] text-white px-2.5 py-1 rounded-full font-black uppercase tracking-tighter",
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

      <section className="pb-12">
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="font-black font-headline text-lg text-primary tracking-tight">Recent Activity</h3>
          <Button variant="link" className="text-[11px] p-0 h-auto font-black text-secondary uppercase tracking-widest hover:no-underline" asChild>
            <Link href="/transactions">View All History</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {transactions?.map((tx: any) => (
            <Link key={tx.id} href={`/transactions/${tx.id}`}>
              <div className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-50/50 active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {tx.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-primary">{tx.payerIdentifier || "Customer"}</p>
                    <p className="text-[11px] text-muted-foreground font-bold opacity-70">
                      {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"} • {tx.method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-base font-black tabular-nums tracking-tighter", tx.type === "credit" ? "text-emerald-600" : "text-primary")}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{tx.status}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-10 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px]">No Transactions Yet</p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
