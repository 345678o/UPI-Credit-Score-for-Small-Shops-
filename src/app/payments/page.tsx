
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Scan, IndianRupee, CheckCircle2, Download, Share2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser, addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, getFirestore, serverTimestamp, doc, getDoc, increment } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function PaymentsPage() {
  const { user } = useUser();
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    if (!amount || !user) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid payment amount." });
      return;
    }

    setIsProcessing(true);

    const db = getFirestore();
    const txnsRef = collection(db, "users", user.uid, "transactions");
    const userRef = doc(db, "users", user.uid);
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];

    // 1. Record the transaction (Data Generation)
    addDocumentNonBlocking(txnsRef, {
      userId: user.uid,
      amount: amountNum,
      type: "credit",
      status: "success",
      timestamp: serverTimestamp(),
      method: "UPI",
      payerIdentifier: payer || "Customer",
      description: "Payment received via Merchant QR",
    });

    // 2. Update Daily Aggregates (Fast Analytics Layer)
    const aggregateRef = doc(db, "users", user.uid, "dailyBusinessAggregates", today);
    const hourlyUpdate: Record<string, any> = {};
    hourlyUpdate[`hourlyTransactionCounts.${currentHour}`] = increment(1);
    
    setDocumentNonBlocking(aggregateRef, {
      id: today,
      userId: user.uid,
      date: today,
      totalEarnings: increment(amountNum),
      totalExpenses: 0,
      netEarnings: increment(amountNum),
      transactionCount: increment(1),
    }, { merge: true });
    updateDocumentNonBlocking(aggregateRef, hourlyUpdate);

    // 3. Update Fast Analytics Summary
    const summaryRef = doc(db, "users", user.uid, "userAnalyticsSummary", "current");
    setDocumentNonBlocking(summaryRef, {
      userId: user.uid,
      totalTransactionsCount: increment(1),
      totalEarningsOverall: increment(amountNum),
      weeklyEarnings: increment(amountNum),
      monthlyEarnings: increment(amountNum),
      lastUpdatedAt: serverTimestamp()
    }, { merge: true });

    // 4. Update Credit Score & Rewards (Simulated Backend Trigger)
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const prevScore = userData.creditScore || 300;
        
        // Scoring logic: higher volume + consistency = higher score
        const scoreGain = amountNum > 500 ? 3 : 1;
        const newScore = Math.min(900, prevScore + scoreGain);
        
        // Eligibility logic: Tiers based on score
        let newEligible = 10000;
        if (newScore > 750) newEligible = 500000;
        else if (newScore > 650) newEligible = 250000;
        else if (newScore > 550) newEligible = 100000;
        else if (newScore > 450) newEligible = 50000;

        updateDocumentNonBlocking(userRef, {
          creditScore: newScore,
          loanEligibleAmount: newEligible,
          rewardPoints: increment(Math.floor(amountNum / 100)),
          lastLoginAt: serverTimestamp()
        });

        // 5. Trigger Notifications
        const notifRef = collection(db, "users", user.uid, "notifications");
        
        // Payment Alert
        addDocumentNonBlocking(notifRef, {
          userId: user.uid,
          type: "transaction_successful",
          message: `Received ₹${amountNum.toLocaleString()} from ${payer || "Customer"}`,
          isRead: false,
          createdAt: serverTimestamp()
        });

        // Score Alert (if threshold crossed)
        if (Math.floor(newScore / 50) > Math.floor(prevScore / 50)) {
          addDocumentNonBlocking(notifRef, {
            userId: user.uid,
            type: "credit_score_increase",
            message: `Milestone reached! Your credit score is now ${newScore}. Check your new loan limit!`,
            isRead: false,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (e) {
      console.error("Scoring update failed", e);
    }

    setTimeout(() => {
      setShowSuccess(true);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-primary tracking-tight">Payments</h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Accept Digital Payments</p>
      </header>

      <div className="space-y-6 pb-12">
        <Card className="premium-card overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-primary tracking-tight">Store QR Code</h2>
              <p className="text-xs text-muted-foreground font-extrabold uppercase tracking-widest mt-1">Scan to pay Anamika Store</p>
            </div>
            
            <div className="relative w-64 h-64 bg-white p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 mb-8 flex items-center justify-center">
               <div className="w-full h-full bg-gray-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
                 <QrCode className="w-40 h-40 text-primary/5" />
                 <div className="absolute inset-0 flex items-center justify-center p-2">
                    <Image 
                        src="https://picsum.photos/seed/merchant-qr/400/400" 
                        alt="Merchant QR" 
                        width={240} 
                        height={240}
                        className="rounded-2xl"
                        data-ai-hint="QR Code"
                    />
                 </div>
               </div>
            </div>

            <div className="flex items-center gap-4 w-full">
               <Button variant="outline" className="flex-1 h-14 rounded-2xl border-gray-100 font-black gap-2">
                 <Download className="w-5 h-5" />
                 Save
               </Button>
               <Button variant="outline" className="flex-1 h-14 rounded-2xl border-gray-100 font-black gap-2">
                 <Share2 className="w-5 h-5" />
                 Share
               </Button>
            </div>
          </CardContent>
        </Card>

        <section className="premium-card p-6 border border-gray-50">
          <h3 className="font-black text-primary mb-5 px-1">Simulate Receipt</h3>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-focus-within:bg-primary/10 transition-colors">
                <IndianRupee className="w-4 h-4 text-primary" />
              </div>
              <Input 
                className="h-16 bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-16 pr-6 font-black text-2xl tracking-tighter tabular-nums transition-all" 
                placeholder="0.00" 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="relative">
              <Input 
                className="h-14 bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-5 font-extrabold transition-all" 
                placeholder="Customer Name (Optional)" 
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
              />
            </div>
            <Button 
              className={cn(
                "w-full h-16 rounded-2xl font-black text-white text-lg mt-2 transition-all shadow-xl active:scale-95",
                amount && !isProcessing ? "blue-gradient" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
              onClick={handlePay}
              disabled={!amount || isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Score...
                </div>
              ) : "Receive Payment"}
            </Button>
          </div>
        </section>

        <Button className="w-full h-16 rounded-3xl bg-primary text-white font-black text-lg gap-3 shadow-xl active:scale-95">
          <Scan className="w-6 h-6" />
          Scan & Pay
        </Button>

        {showSuccess && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
             <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center mb-8 success-check-animation">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 stroke-[3.5px]" />
             </div>
             <h2 className="text-4xl font-black text-primary mb-2 tabular-nums">₹{parseFloat(amount).toFixed(2)}</h2>
             <p className="text-emerald-600 font-black mb-12 uppercase tracking-[3px] text-xs">Payment Received</p>
             
             <Card className="w-full border-2 border-dashed border-gray-100 bg-gray-50/30 rounded-3xl">
               <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground font-extrabold uppercase tracking-wider text-[10px]">Payer</span>
                     <span className="font-black text-primary">{payer || "Customer"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground font-extrabold uppercase tracking-wider text-[10px]">Impact</span>
                     <span className="font-black text-emerald-600">+ Score Improvement</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground font-extrabold uppercase tracking-wider text-[10px]">Date</span>
                     <span className="font-black text-primary">{new Date().toLocaleTimeString()}</span>
                  </div>
               </CardContent>
             </Card>
             
             <Button 
               className="mt-12 w-full h-16 rounded-2xl blue-gradient font-black text-white text-lg shadow-xl active:scale-95" 
               onClick={() => {
                 setShowSuccess(false);
                 setAmount("");
                 setPayer("");
               }}
             >
               Return to Store
             </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
