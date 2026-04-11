"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, QrCode, ChevronRight, TrendingUp, Sparkles, Bell, ShieldCheck, Plus } from "lucide-react";
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

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const weeklyPulse = summaryData?.weeklyEarnings || 0;

  return (
    <AppShell>
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-primary tracking-tight">
            Hello {merchantData?.ownerName?.split(' ')[0] || "Merchant"}
          </h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Good Morning</p>
        </div>
        <Link href="/notifications">
          <Button variant="outline" size="icon" className="rounded-full h-11 w-11 border-white shadow-sm bg-white">
            <Bell className="w-5 h-5 text-primary" />
          </Button>
        </Link>
      </header>

      <Card className="blue-gradient text-white border-none shadow-2xl mb-8 overflow-hidden relative rounded-[2.5rem]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <CardContent className="p-8">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[2px] mb-2">Available Balance</p>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black tracking-tighter tabular-nums mb-4">
                ₹{weeklyPulse.toLocaleString()}
              </h2>
              <div className="flex items-center gap-2 text-[9px] font-black py-1.5 px-3 bg-white/20 w-fit rounded-full text-white uppercase tracking-widest backdrop-blur-md">
                <Sparkles className="w-3 h-3" />
                <span>AI Scoring Active</span>
              </div>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Transfer", icon: ArrowUpRight, href: "/payments", color: "bg-white text-primary" },
          { label: "Topup", icon: Plus, href: "/payments", color: "bg-white text-primary" },
          { label: "History", icon: TrendingUp, href: "/transactions", color: "bg-white text-primary" },
          { label: "QR", icon: QrCode, href: "/payments", color: "bg-white text-primary" }
        ].map((item) => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2">
            <div className={cn("w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center transition-transform active:scale-90", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </div>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="font-black text-lg text-primary tracking-tight">Transactions</h3>
          <Button variant="link" className="text-[10px] p-0 h-auto font-black text-primary uppercase tracking-widest hover:no-underline" asChild>
            <Link href="/transactions">View All</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {transactions?.map((tx: any) => (
            <Link key={tx.id} href={`/transactions/${tx.id}`}>
              <div className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {tx.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-primary">{tx.payerIdentifier || "Customer"}</p>
                    <p className="text-[10px] text-muted-foreground font-bold opacity-70">
                      {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-base font-black tabular-nums tracking-tighter", tx.type === "credit" ? "text-emerald-600" : "text-red-600")}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Card className="premium-card bg-primary text-white p-6 shadow-xl mb-8">
        <Link href="/credit" className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-0.5">Credit Status</p>
                 <h3 className="text-xl font-black tracking-tight">Live Score: {merchantData?.creditScore || 300}</h3>
              </div>
           </div>
           <ChevronRight className="w-5 h-5 text-white/50" />
        </Link>
      </Card>
    </AppShell>
  );
}
