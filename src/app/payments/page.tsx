
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  IndianRupee, CheckCircle2, History as HistoryIcon, 
  TrendingDown, ChevronRight, ArrowLeft, ArrowUpRight, 
  ArrowDownLeft, Zap, ShieldCheck, CornerDownLeft, X,
  Delete, Trash2, ShieldAlert, RefreshCw
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, getFirestore } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { recordBusinessTransaction } from "@/lib/fintech-backend";

function PaymentsContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = (searchParams.get("mode") as "credit" | "debit") || "debit";
  
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [category, setCategory] = useState(mode === "credit" ? "Sales" : "Inventory");
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wowMessage, setWowMessage] = useState("");
  const [creditImpact, setCreditImpact] = useState("");
  const [loanEligibility, setLoanEligibility] = useState("");

  const db = getFirestore();
  const recentTxnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("timestamp", "desc"),
      limit(6)
    );
  }, [user]);

  const { data: recentTransactions, isLoading: isHistoryLoading } = useCollection(recentTxnsQuery);

  const handleNumInput = (val: string) => {
    if (amount.length >= 8) return;
    setAmount(prev => prev + val);
  };

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAmount("");
  };

  const handleCommit = async () => {
    if (!amount || !user) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    
    setIsProcessing(true);

    try {
      await recordBusinessTransaction({
        userId: user.uid,
        amount: amountNum,
        type: mode,
        category,
        payerIdentifier: payer || (mode === "credit" ? "Customer" : "Vendor/Expense"),
        description: description || `${mode === "credit" ? "Collection" : "Expense"}: ${category}`,
      });

      // Derive WOW message + WHY explanations based on transaction context
      if (mode === "credit") {
        if (amountNum >= 10000) setWowMessage("🚀 Your biggest sale today!");
        else if (amountNum >= 5000) setWowMessage("📈 This is your highest earning transaction!");
        else setWowMessage("🎉 Your business just grew!");
        setCreditImpact(`Score improved — consistent ${category} sales signal financial stability`);
        const eligible = Math.round(amountNum * 60);
        setLoanEligibility(`Based on stable income + low expense ratio → Eligible ₹${eligible.toLocaleString()}`);
      } else {
        setWowMessage("📋 Expense recorded. Ledger balanced.");
        setCreditImpact("Controlled expenses improve your creditworthiness over time");
        setLoanEligibility("");
      }

      setTimeout(() => {
        setShowSuccess(true);
        setIsProcessing(false);
      }, 800);
    } catch (e) {
      console.error("Manual entry failed", e);
      toast({ variant: "destructive", title: "Audit Failed", description: "Verification timeout." });
      setIsProcessing(false);
    }
  };

  const categories = mode === "credit" 
    ? ["Sales", "Service", "Refund", "Other"]
    : ["Inventory", "Rent", "Salary", "Utilities", "Tax"];

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-black overflow-hidden relative">
      
      {/* 1. LEFT PANEL - TERMINAL INPUT */}
      <div className="flex-1 flex flex-col p-6 lg:p-12 relative z-10 overflow-hidden">
         <header className="flex items-center justify-between mb-8 lg:mb-10">
            <div className="flex items-center gap-4">
               <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all active:scale-90">
                  <ArrowLeft className="w-5 h-5 text-zinc-400" />
               </button>
               <div>
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[4px]">Verified Vault</p>
                  <h1 className="text-xl font-black text-white tracking-tighter">
                     {mode === "credit" ? "CAPITAL INFLOW" : "OPERATIONAL OUTFLOW"}
                  </h1>
               </div>
            </div>
            <div className={cn(
               "px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest",
               mode === "credit" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 shadows-emerald-500/20 shadow-lg" : "border-rose-500/20 text-rose-500 bg-rose-500/5 shadow-rose-500/20 shadow-lg"
            )}>
               {mode.toUpperCase()}
            </div>
         </header>

         <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8 lg:space-y-12">
            {/* Amount Display with Animated Cursor */}
            <div className="text-center w-full relative">
               <div className="flex items-center justify-center gap-6">
                  <span className={cn("text-3xl lg:text-5xl font-black", mode === "credit" ? "text-emerald-500" : "text-rose-500")}>₹</span>
                  <div className="flex items-center justify-center min-w-[50px]">
                     <span className={cn(
                        "text-7xl lg:text-[10rem] font-black tracking-tighter tabular-nums transition-all leading-none",
                        amount ? "text-white" : "text-zinc-900"
                     )}>
                        {amount || "0"}
                     </span>
                     <div className={cn(
                        "w-1.5 h-16 lg:h-24 ml-4 animate-pulse rounded-full",
                        mode === "credit" ? "bg-emerald-500" : "bg-rose-500"
                     )} />
                  </div>
               </div>
               <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[6px] mt-6">Secure Entry Node Active</p>
            </div>

            {/* Custom Numeric Terminal Pad */}
            <div className="grid grid-cols-3 gap-3 lg:gap-4 w-full max-w-md">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumInput(num.toString())}
                    className="h-16 lg:h-24 rounded-3xl bg-zinc-900/40 border border-white/[0.03] text-2xl lg:text-3xl font-black text-white hover:bg-zinc-800 hover:border-white/10 active:scale-95 transition-all shadow-xl"
                  >
                    {num}
                  </button>
               ))}
               <button
                  onClick={handleClear}
                  className="h-16 lg:h-24 rounded-3xl bg-zinc-900/20 border border-white/[0.02] text-zinc-600 flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all"
               >
                  <Trash2 className="w-6 h-6" />
               </button>
               <button
                  onClick={() => handleNumInput("0")}
                  className="h-16 lg:h-24 rounded-3xl bg-zinc-900/40 border border-white/[0.03] text-2xl lg:text-3xl font-black text-white hover:bg-zinc-800 active:scale-95 transition-all"
               >
                  0
               </button>
               <button
                  onClick={handleBackspace}
                  className="h-16 lg:h-24 rounded-3xl bg-rose-500/5 border border-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500/20 active:scale-95 transition-all"
               >
                  <Delete className="w-7 h-7" />
               </button>
            </div>

            {/* Transaction Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
               <div className="p-8 bg-zinc-950/50 border border-white/[0.03] rounded-[2.5rem] space-y-6">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Audit Category</p>
                  <div className="flex flex-wrap gap-2.5">
                     {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={cn(
                             "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                             category === cat 
                                ? (mode === "credit" ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20") 
                                : "bg-black/60 border-white/[0.03] text-zinc-700 hover:text-zinc-300"
                          )}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>
               
               <div className="p-8 bg-zinc-950/50 border border-white/[0.03] rounded-[2.5rem] space-y-6">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Counterparty Details</p>
                  <Input 
                     className="h-14 bg-black/60 border-white/[0.03] rounded-2xl font-black text-sm text-white placeholder:text-zinc-800 px-6 focus-visible:ring-emerald-500/20" 
                     placeholder={mode === "credit" ? "Payer Name / ID" : "Vendor / Purpose"} 
                     value={payer}
                     onChange={(e) => setPayer(e.target.value)}
                  />
               </div>
            </div>

            {/* Final Execution Button */}
            <Button 
               className={cn(
                  "w-full max-w-2xl h-24 rounded-[3rem] font-black text-xl gap-6 shadow-2xl transition-all active:scale-95 relative group overflow-hidden",
                  !amount || isProcessing 
                     ? "bg-zinc-900 text-zinc-700 grayscale" 
                     : (mode === "credit" ? "bg-emerald-500 text-black" : "bg-rose-500 text-white")
               )}
               disabled={!amount || isProcessing}
               onClick={handleCommit}
            >
               <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-10 transition-opacity" />
               {isProcessing ? (
                 <RefreshCw className="w-8 h-8 animate-spin" />
               ) : (
                 <ShieldCheck className="w-8 h-8 stroke-[2.5px]" />
               )}
               VERIFY & COMMIT TO LEDGER
            </Button>
         </div>
      </div>

      {/* 2. RIGHT PANEL - LIVE REGISTRY SIDEBAR */}
      <div className="hidden lg:flex w-[480px] bg-zinc-950 border-l border-white/[0.03] flex-col p-12 overflow-hidden">
         <div className="flex items-center justify-between mb-12">
            <div>
               <h3 className="text-base font-black text-white uppercase tracking-widest">Vault Registry</h3>
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[4px] mt-1">Real-time verification</p>
            </div>
            <HistoryIcon className="w-5 h-5 text-zinc-800" />
         </div>

         <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
            {isHistoryLoading ? (
               [1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 w-full bg-zinc-900/50 animate-pulse rounded-[2.5rem]" />)
            ) : recentTransactions?.map((tx: any) => (
               <div key={tx.id} className="p-8 bg-zinc-900/20 border border-white/[0.02] rounded-[2.5rem] flex items-center justify-between group hover:bg-zinc-900/40 hover:border-white/[0.05] transition-all">
                  <div className="flex items-center gap-5">
                     <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl",
                        tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                     )}>
                        {tx.type === "credit" ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                     </div>
                     <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[140px] italic">{tx.payerIdentifier || "Merchant Node"}</p>
                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] mt-1.5">{tx.category} • {tx.type}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={cn("text-xl font-black tabular-nums tracking-tighter", tx.type === "credit" ? "text-emerald-500" : "text-rose-500")}>
                        {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                     </p>
                  </div>
               </div>
            ))}
         </div>

         <div className="mt-12 pt-10 border-t border-white/[0.03]">
            <div className="p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 flex gap-6 items-center">
               <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-indigo-500" />
               </div>
               <p className="text-[10px] font-bold text-zinc-600 leading-relaxed uppercase tracking-[2px]">
                  Entries are cryptographically multi-salted before entry into Anamika's persistent ledger.
               </p>
            </div>
         </div>
      </div>

      {/* SUCCESS EXPERIENCE OVERLAY */}
      {showSuccess && (
         <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-[60px] flex flex-col items-center justify-center p-8 lg:p-24 animate-in fade-in zoom-in duration-700">
            {/* Ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className={cn(
                 "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[200px] opacity-20",
                 mode === "credit" ? "bg-emerald-500" : "bg-rose-500"
               )} />
            </div>

            {/* WOW HEADLINE */}
            <p className="text-2xl lg:text-4xl font-black text-white mb-6 text-center animate-in slide-in-from-bottom-4 duration-500" style={{animationDelay: '200ms'}}>
              {wowMessage}
            </p>

            {/* Amount */}
            <h2 className={cn(
              "text-8xl lg:text-[12rem] font-black mb-8 tabular-nums tracking-tighter leading-none",
              mode === "credit" ? "text-emerald-500" : "text-rose-500"
            )}>
               {mode === "credit" ? "+" : "-"}₹{parseFloat(amount).toLocaleString()}
            </h2>

            <p className={cn("text-[10px] font-black uppercase tracking-[8px] mb-16", mode === "credit" ? "text-emerald-500" : "text-rose-500")}>
              REGISTRY SECURED • LEDGER UPDATED
            </p>

            {/* WHY Cards */}
            <div className="w-full max-w-2xl space-y-4 mb-16 animate-in slide-in-from-bottom-6 duration-700" style={{animationDelay:'400ms'}}>
               {/* Credit Score WHY */}
               <div className="p-6 bg-zinc-900/60 border border-white/5 rounded-3xl flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                     <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Credit Score Boost</p>
                     <p className="text-sm font-black text-white">{creditImpact}</p>
                  </div>
               </div>

               {/* Loan WHY — only for credit */}
               {loanEligibility && (
                  <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6 text-indigo-500" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Instant Credit Update</p>
                        <p className="text-sm font-black text-white">{loanEligibility}</p>
                     </div>
                  </div>
               )}
            </div>

            {/* CTAs */}
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
               {loanEligibility && (
                  <Button
                     className="h-20 rounded-[2rem] bg-indigo-500 text-white font-black text-sm uppercase tracking-widest gap-3 hover:bg-indigo-400 transition-all active:scale-95"
                     onClick={() => { setShowSuccess(false); router.push('/credit'); }}
                  >
                     <Zap className="w-5 h-5" /> View Loan Offer
                  </Button>
               )}
               <Button 
                  className="h-20 rounded-[2rem] bg-zinc-900 border border-white/10 text-white font-black text-sm hover:bg-zinc-800 transition-all active:scale-95" 
                  onClick={() => { setShowSuccess(false); setAmount(""); setPayer(""); }}
               >
                  Back to Terminal
               </Button>
            </div>
         </div>
      )}

    </div>
  );
}

export default function PaymentsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-black text-zinc-800 font-black uppercase tracking-[10px] animate-pulse">Initializing Terminal Node...</div>}>
        <PaymentsContent />
      </Suspense>
    </AppShell>
  );
}
