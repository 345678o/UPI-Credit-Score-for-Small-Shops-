
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet, IndianRupee, ShieldCheck, RefreshCw, Eye, EyeOff,
  TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight,
  CreditCard, Banknote, Coins, ChevronRight, Activity
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, getFirestore, collection, query, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from "react";

export default function BalancePage() {
  const { user } = useUser();
  const [hidden, setHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  const db = getFirestore();

  const summaryRef = useMemoFirebase(
    () => (user ? doc(db, "users", user.uid, "userAnalyticsSummary", "current") : null),
    [user]
  );
  const { data: summary, isLoading: isSummaryLoading } = useDoc(summaryRef);

  const userRef = useMemoFirebase(
    () => (user ? doc(db, "users", user.uid) : null),
    [user]
  );
  const { data: merchant, isLoading: isMerchantLoading } = useDoc(userRef);

  const txnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "ledgerNodes"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
  }, [user]);
  const { data: transactions, isLoading: isTxnsLoading } = useCollection(txnsQuery);

  const isLoading = isSummaryLoading || isMerchantLoading;

  const totalEarnings = summary?.totalEarningsOverall || 0;
  const totalExpenses = summary?.totalExpensesOverall || 0;
  const netBalance = totalEarnings - totalExpenses;
  const walletBalance = Math.max(0, Math.round(netBalance * 0.3));
  const creditScore = merchant?.creditScore || 742;
  const creditLimit = merchant?.loanEligibleAmount
    ? merchant.loanEligibleAmount * 5
    : creditScore > 500
    ? 50000
    : 0;
  const creditUsed = summary?.activeLoanAmount || 0;
  const availableCredit = Math.max(0, creditLimit - creditUsed);
  const creditUtilization = creditLimit > 0 ? Math.round((creditUsed / creditLimit) * 100) : 0;

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshedAt(new Date());
    }, 1800);
  }

  const mask = (val: string) => hidden ? "₹ ••••••" : val;

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">
            Check Balance
          </h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">
            Last refreshed · {refreshedAt.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setHidden((h) => !h)}
            className="h-12 px-6 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-400 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-zinc-800 transition-all"
          >
            {hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {hidden ? "Show" : "Hide"}
          </Button>
          <Button
            onClick={handleRefresh}
            className="h-12 px-6 rounded-2xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest gap-3 active:scale-95 transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="space-y-10 pb-36">

        {/* Primary Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

          {/* Net Business Balance */}
          <Card className="premium-card col-span-1 md:col-span-1 bg-emerald-500 border-none p-8 lg:p-10 relative overflow-hidden shadow-2xl shadow-emerald-500/20">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-black/10 rounded-full blur-xl" />
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">
                Net Business Balance
              </p>
              <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-black" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-16 w-48 bg-black/20 rounded-2xl" />
            ) : (
              <h2 className="text-5xl lg:text-6xl font-black text-black tracking-tighter tabular-nums">
                {mask(`₹${netBalance.toLocaleString()}`)}
              </h2>
            )}
            <div className="mt-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-black/70" />
              <span className="text-[10px] font-black text-black/70 uppercase tracking-widest">
                Earnings − Expenses
              </span>
            </div>
          </Card>

          {/* UPI Wallet Balance */}
          <Card className="premium-card bg-zinc-900 border border-white/5 p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-indigo-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                UPI Wallet
              </p>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-12 w-40 bg-zinc-800 rounded-2xl" />
            ) : (
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter tabular-nums">
                {mask(`₹${walletBalance.toLocaleString()}`)}
              </h2>
            )}
            <div className="mt-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                Linked to Hub Terminal
              </span>
            </div>
            <Link href="/payments?mode=credit">
              <Button className="mt-8 w-full h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-indigo-500/20 transition-all">
                Add Money <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>

          {/* Available Credit */}
          <Card className="premium-card bg-zinc-900 border border-white/5 p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Available Credit
              </p>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-12 w-40 bg-zinc-800 rounded-2xl" />
            ) : (
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter tabular-nums">
                {mask(`₹${availableCredit.toLocaleString()}`)}
              </h2>
            )}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                <span className="text-zinc-600">Utilization</span>
                <span className="text-amber-400">{creditUtilization}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: `${creditUtilization}%` }}
                />
              </div>
            </div>
            <Link href="/credit">
              <Button className="mt-8 w-full h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-amber-500/20 transition-all">
                View Loans <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[
            {
              label: "Total Earned",
              value: `₹${totalEarnings.toLocaleString()}`,
              icon: ArrowDownLeft,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Total Spent",
              value: `₹${totalExpenses.toLocaleString()}`,
              icon: ArrowUpRight,
              color: "text-rose-500",
              bg: "bg-rose-500/10",
            },
            {
              label: "Credit Limit",
              value: `₹${creditLimit.toLocaleString()}`,
              icon: Coins,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              label: "Credit Score",
              value: String(creditScore),
              icon: ShieldCheck,
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
            },
          ].map((item, i) => (
            <Card
              key={i}
              className="premium-card bg-zinc-900 border border-white/5 p-6 lg:p-8 flex flex-col gap-4"
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", item.bg)}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                  {item.label}
                </p>
                {isLoading ? (
                  <Skeleton className="h-7 w-24 bg-zinc-800 rounded-lg mt-2" />
                ) : (
                  <p className="text-xl font-black text-white tabular-nums tracking-tighter mt-1">
                    {hidden ? "••••••" : item.value}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl lg:text-2xl font-black text-white">Recent Transactions</h3>
            <Link href="/transactions">
              <Button
                variant="ghost"
                className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-emerald-500 gap-2"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {isTxnsLoading
              ? [1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-[2rem] bg-zinc-900" />
                ))
              : transactions?.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-6 lg:p-8 bg-zinc-950 border border-white/5 rounded-[2rem] hover:bg-zinc-900 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                          tx.type === "credit"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                        )}
                      >
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="w-6 h-6" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[160px] lg:max-w-xs">
                          {tx.payerIdentifier || "Merchant Vault"}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                          {tx.category || "General"} · {tx.method}
                        </p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "text-xl lg:text-2xl font-black tabular-nums tracking-tighter",
                        tx.type === "credit" ? "text-emerald-500" : "text-rose-500"
                      )}
                    >
                      {hidden
                        ? (tx.type === "credit" ? "+" : "-") + "₹ ••••"
                        : `${tx.type === "credit" ? "+" : "-"}₹${tx.amount.toLocaleString()}`}
                    </p>
                  </div>
                ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link href="/payments/scan">
            <Button className="w-full h-20 rounded-[2rem] bg-zinc-900 border border-white/5 text-white font-black text-sm uppercase tracking-widest gap-4 hover:bg-zinc-800 hover:border-emerald-500/20 transition-all group">
              <Banknote className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              Scan &amp; Pay
            </Button>
          </Link>
          <Link href="/payments?mode=credit">
            <Button className="w-full h-20 rounded-[2rem] bg-zinc-900 border border-white/5 text-white font-black text-sm uppercase tracking-widest gap-4 hover:bg-zinc-800 hover:border-indigo-500/20 transition-all group">
              <IndianRupee className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
              Receive Payment
            </Button>
          </Link>
        </section>

      </div>
    </AppShell>
  );
}
