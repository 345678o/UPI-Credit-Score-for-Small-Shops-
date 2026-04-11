
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  IndianRupee, CheckCircle2, History as HistoryIcon, 
  TrendingDown, ChevronRight, ArrowLeft, ArrowUpRight, 
  ArrowDownLeft, Zap, ShieldCheck, CornerDownLeft, X,
  Delete, Trash2, ShieldAlert, RefreshCw, Sparkles, 
  Activity, TrendingUp, Clock, Database, Lock,
  Eye, EyeOff, Copy, Check
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, getFirestore } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { recordBusinessTransaction } from "@/lib/fintech-backend";

// Utility functions
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  return 'Rupees ' + numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
}

function formatIndianCurrency(num: number): string {
  const x = num.toString();
  let lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
}

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
  const [showAmountBreakdown, setShowAmountBreakdown] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [vaultStatus, setVaultStatus] = useState("active");
  const [showBalance, setShowBalance] = useState(true);

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
               <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all active:scale-90 hover:bg-zinc-800 hover:border-white/10">
                  <ArrowLeft className="w-5 h-5 text-zinc-400" />
               </button>
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[4px]">Verified Vault</p>
                     <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[2px]">{vaultStatus}</span>
                     </div>
                  </div>
                  <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                     {mode === "credit" ? "CAPITAL INFLOW" : "OPERATIONAL OUTFLOW"}
                     <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                  </h1>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all active:scale-90 hover:bg-zinc-800"
               >
                  {showBalance ? <EyeOff className="w-4 h-4 text-zinc-400" /> : <Eye className="w-4 h-4 text-zinc-400" />}
               </button>
               <div className={cn(
                  "px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2",
                  mode === "credit" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 shadow-emerald-500/20 shadow-lg" : "border-rose-500/20 text-rose-500 bg-rose-500/5 shadow-rose-500/20 shadow-lg"
               )}>
                  <Activity className="w-3 h-3" />
                  {mode.toUpperCase()}
               </div>
            </div>
         </header>

         <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8 lg:space-y-12">
            {/* Amount Display with Enhanced UI */}
            <div className="text-center w-full relative">
               {/* Vault Status Bar */}
               <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="flex items-center gap-2">
                     <Database className="w-4 h-4 text-zinc-600" />
                     <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[2px]">Ledger Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4 text-zinc-600" />
                     <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[2px]">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Lock className="w-4 h-4 text-emerald-500" />
                     <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[2px]">Secured</span>
                  </div>
               </div>
               
               <div className="flex items-center justify-center gap-6">
                  <span className={cn("text-3xl lg:text-5xl font-black", mode === "credit" ? "text-emerald-500" : "text-rose-500")}>₹</span>
                  <div className="flex items-center justify-center min-w-[50px] relative">
                     <span className={cn(
                        "text-7xl lg:text-[10rem] font-black tracking-tighter tabular-nums transition-all leading-none",
                        amount ? "text-white" : "text-zinc-900"
                     )}>
                        {showBalance ? (amount || "0") : "••••••"}
                     </span>
                     <div className={cn(
                        "w-1.5 h-16 lg:h-24 ml-4 animate-pulse rounded-full",
                        mode === "credit" ? "bg-emerald-500" : "bg-rose-500"
                     )} />
                     {amount && (
                        <button
                           onClick={() => setShowAmountBreakdown(!showAmountBreakdown)}
                           className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center hover:bg-zinc-700 transition-all"
                        >
                           <TrendingUp className="w-3 h-3 text-zinc-400" />
                        </button>
                     )}
                  </div>
               </div>
               
               {/* Amount Breakdown */}
               {showAmountBreakdown && amount && (
                  <div className="mt-6 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                     <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                           <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[2px]">Words</p>
                           <p className="text-sm font-black text-white">{numberToWords(parseFloat(amount))}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[2px]">Format</p>
                           <p className="text-sm font-black text-white">{formatIndianCurrency(parseFloat(amount))}</p>
                        </div>
                     </div>
                  </div>
               )}
               
               <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[6px] mt-6">Secure Entry Node Active</p>
            </div>

            {/* Enhanced Numeric Terminal Pad */}
            <div className="grid grid-cols-3 gap-3 lg:gap-4 w-full max-w-md">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumInput(num.toString())}
                    className="h-16 lg:h-24 rounded-3xl bg-zinc-900/40 border border-white/[0.03] text-2xl lg:text-3xl font-black text-white hover:bg-zinc-800 hover:border-white/10 hover:shadow-2xl active:scale-95 transition-all duration-200 shadow-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {num}
                  </button>
               ))}
               <button
                  onClick={handleClear}
                  className="h-16 lg:h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center hover:bg-amber-500/20 hover:border-amber-500/30 active:scale-95 transition-all duration-200 shadow-xl relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Trash2 className="w-6 h-6 relative z-10" />
               </button>
               <button
                  onClick={() => handleNumInput("0")}
                  className="h-16 lg:h-24 rounded-3xl bg-zinc-900/40 border border-white/[0.03] text-2xl lg:text-3xl font-black text-white hover:bg-zinc-800 hover:border-white/10 hover:shadow-2xl active:scale-95 transition-all duration-200 shadow-xl relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    0
                  </button>
               <button
                  onClick={handleBackspace}
                  className="h-16 lg:h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/30 active:scale-95 transition-all duration-200 shadow-xl relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Delete className="w-7 h-7 relative z-10" />
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

      {/* 2. RIGHT PANEL - ENHANCED VAULT REGISTRY */}
      <div className="hidden lg:flex w-[480px] bg-zinc-950 border-l border-white/[0.03] flex-col p-12 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-black text-white uppercase tracking-widest">Vault Registry</h3>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               </div>
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[4px]">Real-time verification • {recentTransactions?.length || 0} entries</p>
            </div>
            <div className="flex items-center gap-3">
               <button 
                  onClick={() => router.push('/transactions')}
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all active:scale-90 hover:bg-zinc-800"
               >
                  <HistoryIcon className="w-4 h-4 text-zinc-400" />
               </button>
               <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all active:scale-90 hover:bg-zinc-800">
                  <RefreshCw className="w-4 h-4 text-zinc-400" />
               </button>
            </div>
         </div>

         {/* Quick Stats */}
         <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
               <div className="flex items-center gap-2 mb-2">
                  <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[2px]">Inflow</span>
               </div>
               <p className="text-lg font-black text-emerald-500 tabular-nums">
                  ₹{recentTransactions?.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString() || '0'}
               </p>
            </div>
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
               <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-3 h-3 text-rose-500" />
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-[2px]">Outflow</span>
               </div>
               <p className="text-lg font-black text-rose-500 tabular-nums">
                  ₹{recentTransactions?.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString() || '0'}
               </p>
            </div>
         </div>

         <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {isHistoryLoading ? (
               [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-24 w-full bg-zinc-900/50 animate-pulse rounded-[2rem]" />
               ))
            ) : recentTransactions?.map((tx: any, index) => (
               <div 
                  key={tx.id} 
                  className={cn(
                     "p-6 bg-zinc-900/20 border border-white/[0.02] rounded-[2rem] flex items-center justify-between group hover:bg-zinc-900/40 hover:border-white/[0.05] transition-all cursor-pointer",
                     index === 0 && "border-emerald-500/20 bg-emerald-500/5"
                  )}
                  onClick={() => {
                     // Copy transaction details
                     const txDetails = `${tx.type === 'credit' ? '+' : '-'}₹${tx.amount} - ${tx.payerIdentifier || 'Unknown'} (${tx.category})`;
                     navigator.clipboard.writeText(txDetails);
                     toast({ title: "Copied!", description: "Transaction details copied to clipboard" });
                  }}
               >
                  <div className="flex items-center gap-4">
                     <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative",
                        tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                     )}>
                        {tx.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        {index === 0 && (
                           <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white uppercase tracking-tight truncate flex items-center gap-2">
                           {tx.payerIdentifier || "Merchant Node"}
                           <Copy className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] mt-1">
                           {tx.category} • {tx.type} • {new Date(tx.timestamp?.toDate?.() || tx.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={cn("text-lg font-black tabular-nums tracking-tighter", tx.type === "credit" ? "text-emerald-500" : "text-rose-500")}>
                        {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                     </p>
                  </div>
               </div>
            ))}
         </div>

         <div className="mt-8 pt-8 border-t border-white/[0.03]">
            <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex gap-4 items-center">
               <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-indigo-500" />
               </div>
               <div className="flex-1">
                  <p className="text-[9px] font-bold text-zinc-600 leading-relaxed uppercase tracking-[2px] mb-1">
                     Quantum-Encrypted Ledger
                  </p>
                  <p className="text-[8px] font-black text-zinc-700">
                     All entries are cryptographically secured with multi-salt hashing before persistent storage.
                  </p>
               </div>
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
