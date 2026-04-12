"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft, CheckCircle2, Clock, AlertCircle,
  IndianRupee, Calendar, ShieldCheck, ArrowRight,
  TrendingDown, TrendingUp, Info, Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { getLoan, LoanApplication, RepaymentInstalment } from "@/lib/nbfc-integration";

export default function LoanRepaymentPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const loanId = params.loanId as string;

  const [loan, setLoan] = useState<(LoanApplication & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      if (!user || !loanId) return;
      setIsLoading(true);
      const data = await getLoan(user.uid, loanId);
      setLoan(data);
      setIsLoading(false);
    }
    load();
  }, [user, loanId]);

  const handlePayEmi = async (instalment: RepaymentInstalment) => {
    if (!user || !loan) return;
    setIsPaying(instalment.instalmentNumber);

    try {
      const res = await fetch(`/api/nbfc/status/${loanId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          instalmentNumber: instalment.instalmentNumber,
          instalmentAmount: instalment.amount
        }),
      });

      if (res.ok) {
        // Refresh loan data
        const data = await getLoan(user.uid, loanId);
        setLoan(data);
      }
    } catch (err) {
      console.error("Payment failed", err);
    } finally {
      setIsPaying(null);
    }
  };

  if (isLoading) return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="h-40 bg-zinc-950 rounded-[2.5rem] animate-pulse" />
        <div className="h-96 bg-zinc-950 rounded-[2.5rem] animate-pulse" />
      </div>
    </AppShell>
  );

  if (!loan) return (
    <AppShell>
      <div className="flex flex-col items-center justify-center py-32">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
        <h2 className="text-2xl font-black text-white">Loan not found</h2>
        <Button onClick={() => router.back()} className="mt-8 h-14 px-8 rounded-2xl bg-zinc-900">Go Back</Button>
      </div>
    </AppShell>
  );

  const pendingEmi = loan.repaymentSchedule?.find(i => i.status === "pending");
  const paidCount = loan.repaymentSchedule?.filter(i => i.status === "paid").length || 0;
  const totalCount = loan.repaymentSchedule?.length || 0;

  return (
    <AppShell>
      <header className="mb-10 flex items-center gap-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5">
          <ChevronLeft className="w-6 h-6 text-zinc-400" />
        </Button>
        <div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Investment Details</p>
          <h1 className="text-3xl font-black text-white tracking-tighter">{loan.nbfcPartnerName}</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-32">
        {/* Left: Summary & Pay Next EMI */}
        <div className="lg:col-span-12 space-y-8">
           <Card className="premium-card bg-zinc-900 border-white/5 p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5">
                 <ShieldCheck className="w-32 h-32 text-emerald-500" />
              </div>
              
              <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
                 <div className="space-y-6">
                    <div>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Total Injection</p>
                       <h2 className="text-5xl font-black text-white tracking-tighter">₹{(loan.approvedAmount || loan.requestedAmount).toLocaleString("en-IN")}</h2>
                    </div>
                    <div className="flex gap-10">
                       <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Interest</p>
                          <p className="text-lg font-black text-white">{loan.interestRate}% <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">p.a.</span></p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tenure</p>
                          <p className="text-lg font-black text-white">{loan.tenure} <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Months</span></p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-zinc-950/50 rounded-[2.5rem] p-8 md:w-96 flex flex-col justify-between border border-white/5">
                    <div>
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Current Outstanding</p>
                       <h3 className="text-4xl font-black text-rose-400 tracking-tighter">₹{(loan.outstandingAmount || 0).toLocaleString("en-IN")}</h3>
                    </div>
                    <div className="mt-8 space-y-2">
                       <div className="flex justify-between text-[10px] font-black">
                          <span className="text-zinc-600 uppercase tracking-widest">Cycle Progress</span>
                          <span className="text-zinc-400">{paidCount}/{totalCount} PAID</span>
                       </div>
                       <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(paidCount/totalCount)*100}%` }} />
                       </div>
                    </div>
                 </div>
              </div>
           </Card>

           {pendingEmi && (
             <Card className="bg-emerald-500 border-none p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-emerald-500/10">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-black/10 flex items-center justify-center shadow-inner">
                      <Calendar className="w-8 h-8 text-black" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-black tracking-tight">Next EMI: ₹{pendingEmi.amount.toLocaleString("en-IN")}</h3>
                      <p className="text-xs font-bold text-black/60 uppercase tracking-widest mt-1">Due on {new Date(pendingEmi.dueDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   </div>
                </div>
                <Button 
                   onClick={() => handlePayEmi(pendingEmi)}
                   disabled={isPaying !== null}
                   className="h-16 px-12 rounded-[1.5rem] bg-black text-white font-black hover:scale-105 transition-all text-xs uppercase tracking-[2px] shadow-2xl"
                >
                   {isPaying === pendingEmi.instalmentNumber ? "Syncing Trust..." : "Settle Now"}
                </Button>
             </Card>
           )}
        </div>

        {/* Repayment Timeline */}
        <div className="lg:col-span-8">
           <h3 className="text-xl font-black text-white mb-8 ml-4">Repayment Timeline</h3>
           <div className="space-y-4">
              {loan.repaymentSchedule?.map((inst, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between p-6 lg:p-8 rounded-[2rem] border transition-all",
                  inst.status === "paid" ? "bg-zinc-950 border-emerald-500/20" : "bg-zinc-900/40 border-white/5 opacity-60"
                )}>
                   <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        inst.status === "paid" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-600"
                      )}>
                         {inst.status === "paid" ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                         <p className="text-sm font-black text-white uppercase tracking-widest">EMI #{inst.instalmentNumber}</p>
                         <p className="text-[10px] font-bold text-zinc-600 mt-1">Due: {new Date(inst.dueDate).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-black text-white tabular-nums">₹{inst.amount.toLocaleString("en-IN")}</p>
                      {inst.status === "paid" && <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Paid {new Date(inst.paidAt!).toLocaleDateString()}</p>}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Trust Impact Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="premium-card bg-zinc-950 border-white/5 p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <TrendingUp className="w-12 h-12 text-emerald-500" />
              </div>
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px] mb-8">Trust Indicator</h4>
              <div className="space-y-6">
                 <div>
                    <h3 className="text-xl font-black text-white mb-2">Score Appreciation</h3>
                    <p className="text-[11px] font-bold text-zinc-500 leading-relaxed italic">
                       Each on-time EMI payment adds <span className="text-emerald-500">+12 points</span> to your CrediPay Trust Score.
                    </p>
                 </div>
                 <div className="h-px bg-white/5" />
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                       <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-white">Institutional Grade</p>
                       <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-1">Reporting to Bureau Sim</p>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="premium-card bg-zinc-900 p-10 border-white/5">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8">Loan Documents</h4>
              <div className="space-y-4">
                 {[
                   { name: "Sanction Letter", date: "v1.2" },
                   { name: "EMI Schedule", date: "PDF" },
                   { name: "Digital KYC Proof", date: "Encrypted" }
                 ].map((doc, i) => (
                   <div key={i} className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-white/5">
                      <span className="text-[11px] font-bold text-zinc-400">{doc.name}</span>
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{doc.date}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </AppShell>
  );
}
