
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee, CheckCircle2, History as HistoryIcon, TrendingDown, ChevronRight, ArrowLeft } from "lucide-react";
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
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [category, setCategory] = useState("Inventory");
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const db = getFirestore();
  const recentTxnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
  }, [user]);

  const { data: recentTransactions, isLoading: isHistoryLoading } = useCollection(recentTxnsQuery);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setPayer(ref);
    }
  }, [searchParams]);

  const handlePay = async () => {
    if (!amount || !user) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid expense amount." });
      return;
    }

    setIsProcessing(true);

    try {
      await recordBusinessTransaction({
        userId: user.uid,
        amount: amountNum,
        type: "debit",
        category,
        payerIdentifier: payer || "Vendor/Expense",
        description: description || `Expense: ${category}`,
      });

      setTimeout(() => {
        setShowSuccess(true);
        setIsProcessing(false);
      }, 800);
    } catch (e) {
      console.error("Payment recording failed", e);
      toast({ variant: "destructive", title: "Audit Failed", description: "Could not finalize the transaction record." });
      setIsProcessing(false);
    }
  };

  return (
    <>
      <header className="mb-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all active:scale-90">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
           </button>
           <div>
              <p className="text-caption">Manual Log</p>
              <h1 className="text-2xl mt-1">Audit Vault</h1>
           </div>
        </div>
        <Link href="/transactions">
           <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl border border-white/5 bg-zinc-900/40">
              <HistoryIcon className="w-5 h-5 text-zinc-500" />
           </Button>
        </Link>
      </header>

      <div className="space-y-12 pb-32 px-4">
        {/* Input Control Area */}
        <section className="premium-card p-10 bg-zinc-900/30 border border-white/5">
          <h3 className="text-caption text-center mb-10 !text-zinc-600">
             Audit Entry Parameters
          </h3>
          <div className="space-y-10">
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center group-focus-within:border-rose-500/30 transition-all">
                <IndianRupee className="w-6 h-6 text-rose-500" />
              </div>
              <Input 
                className="h-24 bg-black/40 border-none focus-visible:ring-1 focus-visible:ring-rose-500/20 rounded-[2.5rem] pl-24 pr-10 font-black text-5xl tracking-tighter tabular-nums text-white" 
                placeholder="0.00" 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               {["Inventory", "Rent", "Salary", "Utilities", "Maintenance", "Tax"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "py-5 rounded-[1.75rem] border text-caption transition-all",
                      category === cat ? "border-rose-500 bg-rose-500/10 text-rose-500" : "border-white/5 bg-black/40 text-zinc-600 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
               ))}
            </div>

            <div className="space-y-4">
               <Input 
                  className="h-16 bg-zinc-900/60 border border-white/5 rounded-[1.75rem] px-8 font-bold text-sm text-white placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-rose-500/20" 
                  placeholder="Official Recipient" 
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                />
                <Input 
                  className="h-16 bg-zinc-900/60 border border-white/5 rounded-[1.75rem] px-8 font-bold text-sm text-white placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-rose-500/20" 
                  placeholder="Detailed context/notes" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <Button 
              className={cn(
                "w-full h-20 rounded-[2.5rem] font-black text-lg transition-all shadow-2xl active:scale-95",
                !amount || isProcessing 
                  ? "bg-zinc-800 text-zinc-600 grayscale" 
                  : "bg-rose-500 text-white shadow-rose-500/30"
              )}
              onClick={handlePay}
              disabled={!amount || isProcessing}
            >
              {isProcessing ? "Validating Audit..." : "Commit To Ledger"}
            </Button>
          </div>
        </section>

        {/* Audit Stream Snippet */}
        <section className="space-y-8">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-lg font-black text-white">Recent Entries</h3>
              <Link href="/transactions" className="text-caption !text-zinc-500">View Feed</Link>
           </div>
           
           <div className="space-y-4 px-2">
              {isHistoryLoading ? (
                 [1, 2].map(i => <div key={i} className="h-24 bg-zinc-900/50 animate-pulse rounded-[2rem]" />)
              ) : recentTransactions && recentTransactions.length > 0 ? (
                 recentTransactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-6 bg-zinc-900/20 rounded-[2.25rem] border border-white/5">
                       <div className="flex items-center gap-5">
                          <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                             tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                             {tx.type === "credit" ? <ChevronRight className="w-6 h-6 rotate-[-45deg]" /> : <TrendingDown className="w-6 h-6" />}
                          </div>
                          <div>
                             <p className="text-sm font-black text-white uppercase tracking-tighter">{tx.payerIdentifier || "Manual Entry"}</p>
                             <p className="text-caption !text-zinc-700 mt-1">
                                {tx.category} • {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Recently"}
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={cn("text-lg font-black tabular-nums tracking-tighter uppercase", tx.type === "credit" ? "text-emerald-500" : "text-rose-500")}>
                             {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                          </p>
                       </div>
                    </div>
                 ))
              ) : (
                <div className="text-center py-16 rounded-[2.5rem] border border-dashed border-zinc-900">
                    <p className="text-caption">Pulse Monitor Active</p>
                </div>
              )}
           </div>
        </section>

        {showSuccess && (
          <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-12 animate-in fade-in zoom-in duration-600">
             <div className="w-36 h-36 rounded-2xl flex items-center justify-center mb-12 bg-rose-500/10 border border-rose-500/20 relative">
                <CheckCircle2 className="w-20 h-20 text-rose-500 stroke-[3px]" />
                <div className="absolute inset-0 bg-rose-500/5 blur-3xl animate-pulse" />
             </div>
             <p className="text-caption text-rose-500 mb-6">Entry Finalized</p>
             <h2 className="text-8xl font-black text-white mb-20 tabular-nums tracking-tighter">-₹{parseFloat(amount).toFixed(2)}</h2>
             
             <Card className="w-full bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-3xl">
               <CardContent className="p-12 space-y-10">
                  <div className="flex justify-between items-center">
                     <span className="text-caption">Counterparty</span>
                     <span className="font-black text-white uppercase text-sm">{payer || "Vendor"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-caption">Audit Tag</span>
                     <span className="font-black text-white uppercase text-[12px] border border-white/10 px-4 py-1.5 rounded-full">{category}</span>
                  </div>
               </CardContent>
             </Card>
             
             <Button 
                className="mt-16 w-full h-20 rounded-[2.5rem] bg-zinc-900 text-white font-black text-lg border border-white/10 active:scale-95 transition-all shadow-3xl" 
                onClick={() => {
                  setShowSuccess(false);
                  setAmount("");
                  setPayer("");
                  setDescription("");
                }}
              >
                Return To Vault
              </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default function PaymentsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-zinc-500 font-black uppercase tracking-widest animate-pulse">Initializing Vault...</div>}>
        <PaymentsContent />
      </Suspense>
    </AppShell>
  );
}
