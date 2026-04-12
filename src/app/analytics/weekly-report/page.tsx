
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, Calendar, IndianRupee, TrendingUp, 
  TrendingDown, Download, FileText, ArrowRight,
  Filter, BarChart3, Receipt, ShoppingBag, ArrowUpRight, ArrowDownLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, orderBy, getFirestore, doc, limit } from "firebase/firestore";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * STRATEGIC MODULE: Weekly Wise Report
 * Provides an institutional-grade financial audit of the merchant's 7-day performance cycles.
 */
export default function WeeklyReportPage() {
  const { user } = useUser();
  const router = useRouter();
  const db = getFirestore();

  // Calculated Date Ranges
  const today = new Date();
  const lastWeekStart = new Date();
  lastWeekStart.setDate(today.getDate() - 7);

  // 1. Fetch Transactions for the last week
  const weeklyTxnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "ledgerNodes"),
      where("timestamp", ">=", lastWeekStart),
      orderBy("timestamp", "desc")
    );
  }, [user]);

  const { data: transactions, isLoading: isTxnsLoading } = useCollection(weeklyTxnsQuery);

  // 2. Fetch Historical Aggregates for comparison
  const aggregatesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "dailyBusinessAggregates"),
      orderBy("date", "desc"),
      limit(7)
    );
  }, [user]);

  const { data: weeklyAggregates } = useCollection(aggregatesQuery);

  // Logic: Calculate Totals
  const totals = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, count: 0 };
    return transactions.reduce((acc: any, txn: any) => {
      if (txn.type === "credit") acc.income += txn.amount;
      else acc.expense += txn.amount;
      acc.count += 1;
      return acc;
    }, { income: 0, expense: 0, count: 0 });
  }, [transactions]);

  return (
    <AppShell>
      <header className="mb-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5">
            <ChevronLeft className="w-6 h-6 text-zinc-400" />
          </Button>
          <div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Financial Auditing</p>
            <h1 className="text-3xl font-black text-white tracking-tighter">Weekly Wise Report</h1>
          </div>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest gap-3 hidden lg:flex">
          <Download className="w-4 h-4" />
          Export Ledger
        </Button>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* 1. WEEKLY PERFORMANCE SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          <Card className="premium-card p-10 bg-zinc-900 border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4"><div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-500" /></div></div>
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Weekly Inflow</p>
             <h2 className="text-4xl font-black text-white tabular-nums tracking-tighter">₹{totals.income.toLocaleString()}</h2>
             <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-4">Verified Digital Revenue</p>
          </Card>
          
          <Card className="premium-card p-10 bg-zinc-900 border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4"><div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-rose-500" /></div></div>
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Weekly Outflow</p>
             <h2 className="text-4xl font-black text-white tabular-nums tracking-tighter">₹{totals.expense.toLocaleString()}</h2>
             <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-4">Operational Drag</p>
          </Card>

          <Card className="premium-card p-10 bg-emerald-500 border-none relative overflow-hidden">
             <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-4">Weekly Net Gain</p>
             <h2 className="text-4xl font-black text-black tabular-nums tracking-tighter">₹{(totals.income - totals.expense).toLocaleString()}</h2>
             <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest mt-4">Retained Liquidity</p>
          </Card>
        </div>

        {/* 2. ACTIVITY VIZ & CATEGORIES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
           
           <div className="lg:col-span-12">
              <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4">
                 <FileText className="w-6 h-6 text-zinc-500" />
                 7-Day Transaction Audit
              </h3>
              
              <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden">
                 <div className="hidden lg:grid grid-cols-4 p-6 border-b border-white/5 text-[9px] font-black text-zinc-600 uppercase tracking-[3px]">
                    <div className="px-4">Date / Identifier</div>
                    <div className="px-4 text-center">Category / Method</div>
                    <div className="px-4 text-center">Reference Node</div>
                    <div className="px-4 text-right">Audit Amount</div>
                 </div>

                 <div className="divide-y divide-white/5">
                    {isTxnsLoading ? (
                       [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full bg-zinc-900 rounded-none shrink-0" />)
                    ) : (transactions?.length ?? 0) > 0 ? (
                       transactions?.map((tx: any) => (
                          <div key={tx.id} className="grid grid-cols-1 lg:grid-cols-4 p-8 hover:bg-zinc-900/40 transition-all group items-center gap-6 lg:gap-0 shrink-0">
                             <div className="px-4 flex items-center gap-4">
                                <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                   tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                )}>
                                   {tx.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-white tracking-tight">{tx.payerIdentifier || "Merchant Payout"}</p>
                                   <p className="text-[9px] font-bold text-zinc-600 uppercase mt-0.5">{tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString() : "Just Now"}</p>
                                </div>
                             </div>
                             
                             <div className="px-4 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest hidden lg:block">
                                {tx.category || "General"} • {tx.method}
                             </div>

                             <div className="px-4 text-center hidden lg:block">
                                <span className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-full text-[8px] font-black text-zinc-500 tracking-widest uppercase">
                                   ID: {tx.id.substring(0, 8).toUpperCase()}
                                </span>
                             </div>

                             <div className="px-4 text-right">
                                <p className={cn(
                                   "text-xl font-black tabular-nums tracking-tighter",
                                   tx.type === "credit" ? "text-emerald-500" : "text-rose-500"
                                )}>
                                   {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                                </p>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="py-24 text-center opacity-20"><p className="text-[10px] font-black uppercase tracking-[6px]">No Transactions in selected cycle</p></div>
                    )}
                 </div>
              </div>
           </div>

        </div>

        {/* 3. GROWTH NUGGETS */}
        <section className="bg-zinc-900/40 border border-white/5 p-10 lg:p-14 rounded-[3rem] relative overflow-hidden group">
           <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
              <div className="space-y-4 text-center md:text-left">
                 <h3 className="text-2xl font-black text-white tracking-tight">Need a capital injection?</h3>
                 <p className="text-sm font-bold text-zinc-500 max-w-md">Your weekly turnover of ₹{totals.income.toLocaleString()} unlocks a pre-approved credit limit of ₹1,50,000.</p>
              </div>
              <Button asChild className="h-20 px-12 rounded-[2rem] bg-emerald-500 text-black font-black text-lg gap-4 shadow-2xl active:scale-95 transition-all">
                 <Link href="/credit">Unlock Capital <ArrowRight className="w-5 h-5 stroke-[2.5px]" /></Link>
              </Button>
           </div>
        </section>

      </div>
    </AppShell>
  );
}
