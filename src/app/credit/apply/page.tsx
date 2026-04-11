
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, Info, CheckCircle2, Calendar, Zap, ArrowRight, ShieldCheck, IndianRupee } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser, addDocumentNonBlocking } from "@/firebase";
import { recordBusinessTransaction } from "@/lib/fintech-backend";
import { collection, getFirestore, serverTimestamp } from "firebase/firestore";

export default function LoanApplyPage() {
  const { user } = useUser();
  const [amount, setAmount] = useState([50000]);
  const [tenure, setTenure] = useState(12);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const emi = Math.round((amount[0] * 1.08) / tenure); // Using 8% interest for premium merchants

  const handleApply = async () => {
    if (!user) return;
    setIsSubmitting(true);

    const db = getFirestore();
    const loanRef = collection(db, "users", user.uid, "loanApplications");

    // 1. Persist Application
    addDocumentNonBlocking(loanRef, {
      userId: user.uid,
      requestedAmount: amount[0],
      approvedAmount: amount[0],
      status: "approved", // Set to approved for high-fidelity demo
      emiAmount: emi,
      durationMonths: tenure,
      appliedAt: serverTimestamp(),
      outstandingAmount: amount[0]
    });

    // 2. Record as Inflow in Ledger (Capital Injection)
    await recordBusinessTransaction({
      userId: user.uid,
      amount: amount[0],
      type: "credit",
      category: "Loan Disbursal",
      payerIdentifier: "CrediPay Capital",
      description: `Instant Capital Disbursement (${tenure} Mo tenure)`
    });

    // 3. Create Notification
    const notifRef = collection(db, "users", user.uid, "notifications");
    addDocumentNonBlocking(notifRef, {
      userId: user.uid,
      type: "loan_approved",
      message: `Capital Injection of ₹${amount[0].toLocaleString()} approved and settled in your ledger.`,
      isRead: false,
      createdAt: serverTimestamp()
    });

    setTimeout(() => {
      setStep(3);
      setIsSubmitting(false);
    }, 1500);
  };

  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in duration-700">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="w-32 h-32 bg-emerald-500 flex items-center justify-center mb-10 rounded-[2.5rem] success-check-animation shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="w-16 h-16 text-black stroke-[3.5px]" />
        </div>
        
        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[5px] mb-4">Verification Success</p>
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tighter">Capital Disbursed</h2>
        <p className="text-zinc-500 font-bold mb-12 max-w-sm leading-relaxed">
          The requested amount of <span className="text-white">₹{amount[0].toLocaleString()}</span> has been settled in your Business Pulse. 
          First EMI starts in 30 days.
        </p>
        
        <Card className="w-full max-w-md mb-12 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
          <CardContent className="p-10 space-y-6">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Monthly Commitment</span>
              <span className="text-2xl font-black text-white tracking-tighter tabular-nums">₹{emi.toLocaleString()}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Tenure Period</span>
              <span className="text-lg font-black text-zinc-300 uppercase underline decoration-emerald-500/50 underline-offset-4">{tenure} Months</span>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full max-w-md h-20 rounded-[2rem] bg-emerald-500 text-black font-black text-lg gap-4 active:scale-95 transition-all shadow-2xl shadow-emerald-500/10" asChild>
          <Link href="/">
             Back to Overview
             <ArrowRight className="w-5 h-5 stroke-[3px]" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <AppShell>
      <header className="mb-14 flex items-center gap-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
           <ChevronLeft className="w-6 h-6 text-zinc-500" />
        </Button>
        <div>
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Credit Issuance</p>
           <h1 className="text-3xl font-black text-white tracking-tighter">Instant Capital</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-32">
        <div className="lg:col-span-7 space-y-12">
          {/* Amount Selector */}
          <section className="premium-card p-10 lg:p-14 bg-zinc-950/40 border-white/5">
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Requested Investment</p>
                <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter tabular-nums">₹{amount[0].toLocaleString()}</h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                 <Zap className="w-3 h-3 text-emerald-500" />
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Prime Rates</span>
              </div>
            </div>

            <Slider 
              value={amount} 
              onValueChange={setAmount} 
              max={250000} 
              min={10000} 
              step={5000}
              className="py-10"
            />
            <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              <span>Limit: ₹10,000</span>
              <span>Elite Cap: ₹2.5L</span>
            </div>
          </section>

          {/* Tenure Grid */}
          <section>
            <p className="text-caption mb-8 ml-4">Repayment Cycle</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 px-2 lg:px-0">
              {[6, 12, 18, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setTenure(m)}
                  className={cn(
                    "p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                    tenure === m 
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/5 text-xs" 
                      : "border-white/5 bg-zinc-900/10 text-zinc-600 hover:text-zinc-200"
                  )}
                >
                  <Calendar className={cn("w-6 h-6", tenure === m ? "text-emerald-500" : "text-zinc-700")} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{m} Mo</span>
                  {tenure === m && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Audit Sidebar / Confirmation */}
        <div className="lg:col-span-5">
           <Card className="premium-card bg-zinc-900/40 p-10 lg:p-12 h-full relative group">
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Issuance Audit</h3>
                 <ShieldCheck className="w-5 h-5 text-zinc-700" />
              </div>
              
              <div className="space-y-10">
                 <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Estimated EMI</span>
                    <span className="text-2xl font-black text-emerald-500 tracking-tighter tabular-nums">₹{emi.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Processing</span>
                    <span className="text-sm font-black text-zinc-400">₹0.00 <span className="text-[8px] text-emerald-500 ml-1 italic">(Waived)</span></span>
                 </div>
                 <div className="pt-10 border-t border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black text-zinc-200">TOTAL DISBURSAL</span>
                       <span className="text-xl font-black text-white tabular-nums">₹{amount[0].toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-600 leading-relaxed italic">
                       Capital will be injected directly into your master ledger upon signing. Total interest estimated at {((emi * tenure / amount[0]) - 1).toFixed(2)}x of principal.
                    </p>
                 </div>

                 <Button 
                    className="w-full h-20 rounded-[2rem] bg-emerald-500 text-black font-black text-lg shadow-xl shadow-emerald-500/10 active:scale-95 transition-all group font-sans mt-8" 
                    onClick={handleApply}
                    disabled={isSubmitting}
                 >
                    {isSubmitting ? "Syncing Trust..." : "Initialize Injection"}
                    <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </AppShell>
  );
}
