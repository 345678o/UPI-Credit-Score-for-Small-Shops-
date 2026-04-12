"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Search, Filter, ArrowDownLeft, ArrowUpRight, 
  ChevronRight, Activity, TrendingUp, TrendingDown, 
  Plus, Download, Info, ShieldCheck, Zap, 
  Clock, History, PlusCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, getFirestore } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useTransactions, BASELINE_EARNINGS } from "@/context/TransactionContext";
import { generateAndStoreCrediPayInsight, AIInsight } from "@/lib/agent";
import { backend } from "@/lib/backend-core";
import { useEffect } from "react";

export default function TransactionsPage() {
  const { user } = useUser();
  const { transactions: simulatedTx, totalEarnings, addTransaction } = useTransactions();
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");
  
  // Entry Form State
  const [quickAmount, setQuickAmount] = useState("");
  const [quickName, setQuickName] = useState("");
  const [quickType, setQuickType] = useState<"credit" | "debit">("credit");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const db = getFirestore();
  const txnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("timestamp", "desc")
    );
  }, [user]);

  const { data: dbTx, isLoading } = useCollection(txnsQuery);

  // Combine DB and Simulated Transactions
  const allTransactions = [
    ...(simulatedTx || []).map(tx => ({ ...tx, id: `sim-${tx.time}`, payerIdentifier: tx.name })),
    ...(dbTx || [])
  ];

  // AI Generation on data change
  useEffect(() => {
    async function getInsight() {
      if (user) {
        setIsAiLoading(true);
        try {
          const res = await generateAndStoreCrediPayInsight(user.uid, {
            income: BASELINE_EARNINGS + totalEarnings,
            expenses: 0,
            creditScore: 742,
            transactionActivity: allTransactions.length > 5 ? "high" : "medium",
            previousIncome: BASELINE_EARNINGS
          });
          setInsight(res);
        } catch (e) {
          console.error(e);
        } finally {
          setIsAiLoading(false);
        }
      }
    }
    getInsight();
  }, [user, totalEarnings, allTransactions.length]);

  const filteredTransactions = allTransactions.filter(tx => {
    const matchesSearch = (tx.payerIdentifier || "").toLowerCase().includes(search.toLowerCase()) || 
                          (tx.category || "").toLowerCase().includes(search.toLowerCase()) ||
                          (tx.description || "").toLowerCase().includes(search.toLowerCase()) ||
                          tx.amount.toString().includes(search);
    const matchesFilter = filter === "all" || tx.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleQuickCommit = async () => {
    if (!quickAmount || !quickName || !user) return;
    
    // 1. Persist to Real Backend
    await backend.recordTransaction({
      userId: user.uid,
      amount: parseFloat(quickAmount),
      type: quickType,
      category: "Manual Ledger",
      payerIdentifier: quickName,
      description: "Manually entered through Ledger Node portal"
    });

    // 2. Update Simulation Layer
    addTransaction({
      name: quickName,
      amount: parseFloat(quickAmount),
      type: quickType
    });

    setQuickAmount("");
    setQuickName("");
    setIsFormVisible(false);
  };

  return (
    <AppShell>
      <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
        <div className="text-center md:text-left">
           <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter italic">Ledger Node</h1>
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px] mt-2">Authenticated Infrastructure Pulse</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="w-full md:w-auto rounded-2xl h-14 px-8 bg-emerald-500 text-black font-black text-xs gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest hover:bg-emerald-400 group"
          >
             <Plus className={cn("w-4 h-4 transition-transform", isFormVisible && "rotate-45")} />
             {isFormVisible ? "Cancel Protocol" : "New Ledger Entry"}
          </Button>
        </div>
      </header>

      <div className="space-y-8 lg:space-y-12 pb-32">
        
        {/* LEDGER ENTRY PORTAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          <div className="lg:col-span-8">
            {isFormVisible ? (
              <div className="bg-zinc-950 border-2 border-emerald-500/20 rounded-[3rem] p-8 lg:p-12 relative overflow-hidden h-full">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <PlusCircle className="w-32 h-32 text-emerald-500" />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    <div className="md:col-span-2 lg:col-span-3 mb-4">
                       <h2 className="text-3xl font-black text-white tracking-tighter">Initiate Ledger Entry</h2>
                    </div>
                    
                    <div className="space-y-3">
                       <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">Type</p>
                       <div className="flex bg-zinc-900 rounded-2xl p-1.5 border border-white/5">
                          <button onClick={() => setQuickType("credit")} className={cn("flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", quickType === "credit" ? "bg-emerald-500 text-black" : "text-zinc-500")}>Inflow</button>
                          <button onClick={() => setQuickType("debit")} className={cn("flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", quickType === "debit" ? "bg-rose-500 text-white" : "text-zinc-500")}>Outflow</button>
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                       <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">Value (INR)</p>
                       <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-black">₹</span>
                          <input type="number" value={quickAmount} onChange={(e) => setQuickAmount(e.target.value)} placeholder="0.00" className="w-full h-14 bg-zinc-900/50 border border-white/5 rounded-2xl pl-10 pr-6 text-white font-black text-lg focus:outline-none focus:border-emerald-500/50" />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">Counterparty</p>
                       <input type="text" value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="Entity Name" className="w-full h-14 bg-zinc-900/50 border border-white/5 rounded-2xl px-6 text-xs text-white font-bold focus:outline-none focus:border-emerald-500/50" />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 pt-4">
                       <Button onClick={handleQuickCommit} className="w-full h-16 rounded-[2rem] bg-emerald-500 text-black font-black text-sm uppercase tracking-widest gap-4 shadow-2xl active:scale-95 transition-all">
                          <ShieldCheck className="w-5 h-5" /> Commit Entry
                       </Button>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="h-full bg-zinc-950/20 border border-white/5 border-dashed rounded-[3rem] p-12 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-zinc-900/20 transition-all" onClick={() => setIsFormVisible(true)}>
                 <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-zinc-600" />
                 </div>
                 <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Standby / Ready for Entry</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
             <Card className="premium-card bg-emerald-500 p-8 flex flex-col justify-between h-full border-none shadow-2xl shadow-emerald-500/10">
                <div>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
                         <Zap className="w-5 h-5 text-black" />
                      </div>
                      <p className="text-[10px] font-black text-black uppercase tracking-widest">AI Ledger Audit</p>
                   </div>
                   
                   {isAiLoading ? (
                     <div className="space-y-3">
                        <div className="h-4 bg-black/5 rounded-full animate-pulse w-full" />
                        <div className="h-4 bg-black/5 rounded-full animate-pulse w-4/5" />
                        <div className="h-4 bg-black/5 rounded-full animate-pulse w-3/4" />
                     </div>
                   ) : insight ? (
                     <div className="space-y-4">
                        <p className="text-2xl font-black text-black tracking-tighter italic leading-tight">
                           "{insight.insight}"
                        </p>
                        <p className="text-[10px] font-bold text-black/60 uppercase tracking-wider">
                           Protocol: {insight.action}
                        </p>
                     </div>
                   ) : (
                     <p className="text-sm font-bold text-black/40 italic">Waiting for transaction pulse...</p>
                   )}
                </div>

                <div className="mt-8 pt-6 border-t border-black/10 flex items-center justify-between">
                   <span className="text-[9px] font-black text-black/40 uppercase">CrediPay Agent V1.2</span>
                   <ShieldCheck className="w-4 h-4 text-black/40" />
                </div>
             </Card>
          </div>
        </div>

        {/* Responsive Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="relative flex-1">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                className="h-16 bg-zinc-900/50 border-white/5 rounded-[2rem] pl-16 pr-6 font-bold text-white placeholder:text-zinc-700 focus:ring-1 ring-emerald-500/50 transition-all" 
                placeholder="Search audit IDs, nodes or protocols..." 
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

        {/* Ledger Column Headers */}
        <div className="hidden md:grid grid-cols-12 gap-6 px-10 text-[9px] font-black text-zinc-600 uppercase tracking-widest opacity-60 border-b border-white/5 pb-6">
           <div className="col-span-3">Entity & Timestamp</div>
           <div className="col-span-5">Audit Notes</div>
           <div className="col-span-2 text-center">Status</div>
           <div className="col-span-2 text-right">Value (INR)</div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-zinc-900/50 animate-pulse rounded-[3rem]" />)
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx: any, idx: number) => (
              <div key={tx.id || idx} className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6 items-center p-6 md:p-10 bg-zinc-950/40 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 hover:bg-zinc-900/40 hover:border-white/10 transition-all group relative overflow-hidden">
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-all",
                  tx.type === "credit" ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                )} />

                {/* Ref & Date */}
                <div className="col-span-1 md:col-span-3 flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2.25rem] flex items-center justify-center shrink-0 shadow-xl transition-transform group-hover:scale-105",
                    tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {tx.type === "credit" ? <TrendingUp className="w-8 h-8 md:w-10 md:h-10" /> : <TrendingDown className="w-8 h-8 md:w-10 md:h-10" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base md:text-xl font-black text-white truncate uppercase tracking-tighter">{tx.payerIdentifier || tx.name || "Entity Node"}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <Clock className="w-3 h-3 text-zinc-700" />
                       <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[2px]">
                          {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' }) : (tx.time || "Recently Logged")}
                       </p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="hidden md:block col-span-5 min-w-0 px-4">
                    <p className="text-[11px] font-bold text-zinc-500 leading-relaxed line-clamp-2 pr-6 group-hover:text-zinc-300 transition-colors">
                      {tx.description || `Automatic ledger synchronization for protocol ${tx.id?.slice(0, 8).toUpperCase() || 'EXTERNAL'}. Verified by CrediPay Infrastructure Layer.`}
                    </p>
                </div>

                {/* Status */}
                <div className="hidden md:flex col-span-2 justify-center">
                   <div className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 border border-white/5 text-[9px] font-black uppercase tracking-[2px]",
                      tx.type === 'credit' ? "text-emerald-500" : "text-rose-400"
                   )}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {tx.type === 'credit' ? 'Secured' : 'Debit'}
                   </div>
                </div>

                {/* Value */}
                <div className="col-span-1 md:col-span-2 text-right">
                  <p className={cn("text-2xl md:text-4xl font-black tabular-nums tracking-tighter transition-all group-hover:scale-110 origin-right", tx.type === "credit" ? "text-emerald-500" : "text-rose-500")}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-2 flex items-center justify-end gap-1.5 group-hover:text-zinc-400 transition-colors">
                    Verified <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  </p>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-48 rounded-[4rem] bg-zinc-950/40 border-2 border-dashed border-zinc-900 flex flex-col items-center justify-center">
              <Activity className="w-24 h-24 text-zinc-900 mb-10 animate-pulse" />
              <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[1em]">Immutable Pulse Offline</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
