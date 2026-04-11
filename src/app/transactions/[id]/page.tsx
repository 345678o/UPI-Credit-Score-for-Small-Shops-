"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ArrowDownLeft, ArrowUpRight, Download, Share2, CheckCircle2, Clock, IndianRupee, ShieldCheck } from "lucide-react";
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
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!txn) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h2 className="text-xl font-black">Transaction not found</h2>
          <Button asChild className="mt-4"><Link href="/transactions">Back to History</Link></Button>
        </div>
      </AppShell>
    );
  }

  const isCredit = txn.type === "credit";

  return (
    <AppShell>
      <header className="mb-8 flex items-center justify-between">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link href="/transactions"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-lg font-black font-headline text-primary uppercase tracking-widest">Receipt</h1>
        <div className="w-10 h-10" />
      </header>

      <div className="flex flex-col items-center mb-8">
        <div className={cn(
          "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg",
          isCredit ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
        )}>
          {isCredit ? <ArrowDownLeft className="w-10 h-10" /> : <ArrowUpRight className="w-10 h-10" />}
        </div>
        <h2 className="text-5xl font-black text-primary tracking-tighter tabular-nums mb-2">
          {isCredit ? "+" : "-"}₹{txn.amount.toLocaleString()}
        </h2>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100">
           <CheckCircle2 className="w-4 h-4" />
           <span className="text-[10px] font-black uppercase tracking-widest">{txn.status}</span>
        </div>
      </div>

      <Card className="premium-card overflow-hidden mb-8 border border-gray-100">
        <CardContent className="p-8 space-y-6">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Payer Details</p>
                 <p className="text-lg font-black text-primary">{txn.payerIdentifier || "Customer"}</p>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-2xl">
                 <IndianRupee className="w-5 h-5 text-primary" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8 pt-6 border-t border-dashed border-gray-100">
              <div>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Method</p>
                 <p className="text-sm font-black text-primary">{txn.method}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Time</p>
                 <p className="text-sm font-black text-primary">
                    {txn.timestamp?.toDate ? txn.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                 </p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Date</p>
                 <p className="text-sm font-black text-primary">
                    {txn.timestamp?.toDate ? txn.timestamp.toDate().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                 </p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">TXN ID</p>
                 <p className="text-[10px] font-mono font-black text-primary uppercase tracking-tighter">
                    {txn.id.substring(0, 16).toUpperCase()}
                 </p>
              </div>
           </div>

           {txn.description && (
             <div className="pt-6 border-t border-dashed border-gray-100">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Notes</p>
                <p className="text-xs font-bold text-primary opacity-80 leading-relaxed italic">
                   &quot;{txn.description}&quot;
                </p>
             </div>
           )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
         <Button className="flex-1 h-16 rounded-2xl bg-gray-50 text-primary border-none font-black flex items-center justify-center gap-3 hover:bg-gray-100 shadow-sm transition-all active:scale-95">
           <Download className="w-5 h-5" />
           Download
         </Button>
         <Button className="flex-1 h-16 rounded-2xl indigo-gradient text-white font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95">
           <Share2 className="w-5 h-5" />
           Share
         </Button>
      </div>

      <div className="mt-12 py-8 flex items-center justify-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-[3px] opacity-40">
        <ShieldCheck className="w-4 h-4" />
        Verified by CrediPay Secure
      </div>
    </AppShell>
  );
}
