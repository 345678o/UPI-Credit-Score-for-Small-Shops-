
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowDownLeft, ArrowUpRight, ChevronRight, Activity, TrendingUp, TrendingDown, Plus, Download, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, getFirestore } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const db = getFirestore();
  const txnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("timestamp", "desc")
    );
  }, [user]);

  const { data: transactions, isLoading } = useCollection(txnsQuery);

  const filteredTransactions = transactions?.filter(tx => {
    const matchesSearch = tx.payerIdentifier?.toLowerCase().includes(search.toLowerCase()) || 
                          tx.category?.toLowerCase().includes(search.toLowerCase()) ||
                          tx.description?.toLowerCase().includes(search.toLowerCase()) ||
                          tx.amount.toString().includes(search);
    const matchesFilter = filter === "all" || tx.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell>
      <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
        <div className="text-center md:text-left">
           <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Business Ledger</h1>
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px] mt-2">Authenticated Financial Pulse</p>
        </div>
        <div className="flex gap-4">
          <Link href="/payments" className="w-full md:w-auto">
            <Button className="w-full md:w-auto rounded-2xl h-14 px-8 bg-zinc-950 border border-white/10 text-white font-black text-xs gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest hover:bg-white/5 group">
               <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
               Log Manual Entry
            </Button>
          </Link>
        </div>
      </header>

      <div className="space-y-8 lg:space-y-12 pb-32">
        {/* Responsive Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="relative flex-1">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                className="h-16 bg-zinc-900/50 border-white/5 rounded-[2rem] pl-16 pr-6 font-bold text-white placeholder:text-zinc-700 focus:ring-1 ring-emerald-500/50 transition-all" 
                placeholder="Search ref, notes or categories..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex bg-zinc-900/50 p-1.5 rounded-[2rem] border border-white/5 shrink-0">
              {["all", "credit", "debit"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === f ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                  )}
                >
                  {f === "all" ? "Full Trace" : f === "credit" ? "Inflow" : "Outflow"}
                </button>
              ))}
           </div>
        </div>

        {/* Professional Ledger Column Headers - Visible on md+ */}
        <div className="hidden md:grid grid-cols-12 gap-6 px-10 text-[9px] font-black text-zinc-600 uppercase tracking-widest opacity-60 border-b border-white/5 pb-6">
           <div className="col-span-3">Reference & Timestamp</div>
           <div className="col-span-5">Audit Details</div>
           <div className="col-span-2 text-center">Protocol</div>
           <div className="col-span-2 text-right">Value (INR)</div>
        </div>

        <div className="space-y-3 lg:space-y-4">
          {isLoading ? (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 bg-zinc-900/50 animate-pulse rounded-[2.5rem]" />)
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <Link key={tx.id} href={`/transactions/${tx.id}`}>
                <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6 items-center p-5 md:p-10 bg-zinc-900/10 rounded-[2rem] md:rounded-[3rem] border border-white/5 hover:bg-zinc-900/30 transition-all group">
                  
                  {/* Ref & Date */}
                  <div className="col-span-1 md:col-span-3 flex items-center gap-6">
                    <div className={cn(
                      "w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.75rem] flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110",
                      tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {tx.type === "credit" ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm md:text-lg font-black text-white truncate uppercase tracking-tighter">{tx.payerIdentifier || "Merchant"}</p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1 tracking-widest">
                        {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' }) : "Recently"}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Details (Desktop Only Detail) */}
                  <div className="hidden md:block col-span-5 min-w-0">
                      <p className="text-xs font-bold text-zinc-400 leading-relaxed line-clamp-2 italic pr-6 group-hover:text-zinc-200 transition-colors">
                        {tx.description || "Automated sync record captured in secure infrastructure."}
                      </p>
                  </div>

                  {/* Category */}
                  <div className="hidden md:flex col-span-2 justify-center">
                     <div className="px-4 py-2 rounded-xl bg-zinc-800 text-[8px] font-black text-zinc-400 uppercase tracking-widest border border-white/5 group-hover:text-white group-hover:border-white/20 transition-all">
                        {tx.category || (tx.type === 'credit' ? 'Sales' : 'Misc')}
                     </div>
                  </div>

                  {/* Value */}
                  <div className="col-span-1 md:col-span-2 text-right">
                    <p className={cn("text-xl md:text-3xl font-black tabular-nums tracking-tighter transition-all group-hover:tracking-normal", tx.type === "credit" ? "text-emerald-500" : "text-rose-500")}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-1">Audit Success</p>
                  </div>

                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-40 rounded-[3rem] bg-zinc-950/40 border border-dashed border-zinc-900">
              <Activity className="w-20 h-20 text-zinc-900 mx-auto mb-8 animate-pulse" />
              <p className="text-caption uppercase tracking-[0.5em]">No Pulse Active</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
