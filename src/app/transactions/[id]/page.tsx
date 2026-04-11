
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ArrowDownLeft, ArrowUpRight, Download, Share2, CheckCircle2, Clock, IndianRupee, ShieldCheck, Zap, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, getFirestore } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function TransactionDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const db = getFirestore();

  const txnRef = useMemoFirebase(() => {
    if (!user || !id) return null;
    return doc(db, "users", user.uid, "transactions", id as string);
  }, [user, id]);

  const { data: txn, isLoading } = useDoc(txnRef);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
         <div className="w-16 h-16 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!txn) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h2 className="text-xl font-black text-white">Transaction not found</h2>
          <Button asChild className="mt-8 bg-zinc-900 border border-white/10 rounded-2xl h-14 px-8">
            <Link href="/transactions">Back to History</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const isCredit = txn.type === "credit";

  return (
    <AppShell>
      <header className="mb-10 flex items-center justify-between">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-all">
           <Link href="/transactions"><ChevronLeft className="w-6 h-6 text-zinc-400" /></Link>
        </Button>
        <div className="flex flex-col items-center">
           <h1 className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Verified Receipt</h1>
           <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Ref: {txn.id.substring(0, 8).toUpperCase()}</p>
        </div>
        <div className="w-10 h-10" />
      </header>

      <div className="flex flex-col items-center mb-10">
        <div className={cn(
          "w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl relative",
          isCredit ? "bg-emerald-500 text-black shadow-emerald-500/20" : "bg-red-500 text-black shadow-red-500/20"
        )}>
          {isCredit ? <ArrowDownLeft className="w-10 h-10" /> : <ArrowUpRight className="w-10 h-10" />}
          <div className="absolute -bottom-2 right-[-2px] bg-black p-1 rounded-full">
             <CheckCircle2 className={cn("w-6 h-6", isCredit ? "text-emerald-500" : "text-red-500")} />
          </div>
        </div>
        <div className="text-center">
           <h2 className={cn("text-6xl font-black tracking-tighter tabular-nums mb-2", isCredit ? "text-white" : "text-red-500")}>
             {isCredit ? "+" : "-"}₹{txn.amount.toLocaleString()}
           </h2>
           <p className="text-zinc-500 font-bold uppercase tracking-[2px] text-[11px]">{isCredit ? "Payment Received" : "Expense Recorded"}</p>
        </div>
      </div>

      <Card className="premium-card bg-zinc-900/40 border border-white/5 overflow-hidden mb-10">
        <CardContent className="p-8 space-y-8">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[3px] mb-2">{isCredit ? "Payer" : "Recipient"}</p>
                 <p className="text-2xl font-black text-white tracking-tight">{txn.payerIdentifier || "Merchant"}</p>
              </div>
              <div className="w-14 h-14 bg-zinc-800/10 rounded-[1.5rem] flex items-center justify-center border border-white/5">
                 <ReceiptText className={cn("w-6 h-6", isCredit ? "text-emerald-500" : "text-red-500")} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-y-10 pt-10 border-t border-dashed border-zinc-800">
              <div>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[2px] mb-2">Category</p>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-sm font-black text-white uppercase tracking-widest">{txn.category || (isCredit ? "Sales" : "Misc")}</p>
                 </div>
              </div>
              <div>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[2px] mb-2">Timestamp</p>
                 <p className="text-sm font-black text-white">
                    {txn.timestamp?.toDate ? txn.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                 </p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[2px] mb-2">Date</p>
                 <p className="text-sm font-black text-white">
                    {txn.timestamp?.toDate ? txn.timestamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                 </p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[2px] mb-2">Payment Mode</p>
                 <p className="text-sm font-black text-white uppercase tracking-widest">{txn.method || "UPI"}</p>
              </div>
           </div>

           {txn.description && (
             <div className="pt-10 border-t border-dashed border-zinc-800">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[3px] mb-2">Description</p>
                <div className="bg-black/40 p-5 rounded-[1.75rem] border border-white/5">
                   <p className="text-xs font-bold text-zinc-400 leading-relaxed italic">
                      &quot;{txn.description}&quot;
                   </p>
                </div>
             </div>
           )}

           <div className="pt-10 border-t border-dashed border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-500" />
                 </div>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Trust Impact Score</p>
              </div>
              <span className="text-sm font-black text-emerald-500">+4 Points</span>
           </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
         <Button className="flex-1 h-20 rounded-[2.25rem] bg-zinc-900 text-zinc-300 border border-white/5 font-black flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl">
           <Download className="w-6 h-6" />
           Download
         </Button>
         <Button className="flex-1 h-20 rounded-[2.25rem] bg-emerald-500 text-black font-black flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all active:scale-95">
           <Share2 className="w-6 h-6 stroke-[2.5px]" />
           Share
         </Button>
      </div>

      <div className="mt-16 pb-12 py-8 flex items-center justify-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[5px] opacity-60">
        <ShieldCheck className="w-4 h-4" />
        Verified by CrediPay Engine
      </div>
    </AppShell>
  );
}
