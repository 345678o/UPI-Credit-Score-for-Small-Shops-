
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRightLeft, Landmark, Clock, ArrowRight, ShieldCheck, 
  ChevronLeft, ArrowUpRight, History, Zap, CheckCircle2,
  AlertCircle, Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { getFirestore, doc } from "firebase/firestore";

/**
 * STRATEGIC MODULE: Digital Settlement Engine (T+1 Logic)
 * Visualizes the capital movement from digital collection to physical bank settlement.
 */
export default function SettlementPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = getFirestore();

  // Fetch summary for real-time balances
  const summaryRef = useMemoFirebase(() => user ? doc(db, "users", user.uid, "userAnalyticsSummary", "current") : null, [user]);
  const { data: summary } = useDoc(summaryRef);

  const [settlementProgress, setSettlementProgress] = useState(65);

  const totalEarnings = summary?.totalEarningsOverall || 0;
  const inTransit = summary?.dailyEarnings || 0;
  
  const settlements = [
    { date: "April 10, 2024", amount: 18450, status: "Settled", node: "HDFC • 4281" },
    { date: "April 09, 2024", amount: 22100, status: "Settled", node: "HDFC • 4281" },
    { date: "April 08, 2024", amount: 15600, status: "Settled", node: "HDFC • 4281" },
  ];

  return (
    <AppShell>
      <header className="mb-14 flex items-center gap-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5">
          <ChevronLeft className="w-6 h-6 text-zinc-400" />
        </Button>
        <div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Financial Velocity</p>
          <h1 className="text-3xl font-black text-white tracking-tighter">Settlement Hub</h1>
        </div>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* 1. NEXT PAYOUT HERO CARD */}
        <section>
           <Card className="premium-card bg-zinc-950 border-white/5 p-12 lg:p-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.03] rounded-full -mr-48 -mt-48 blur-[100px]" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                 <div className="space-y-6 text-center md:text-left">
                    <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full inline-flex items-center gap-3">
                       <Clock className="w-3.5 h-3.5 text-indigo-500" />
                       <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Next Clearing: Tomorrow, 10:00 AM</span>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Funds in Transit</p>
                       <h2 className="text-6xl lg:text-8xl font-black text-white tracking-tighter tabular-nums">₹{inTransit.toLocaleString()}</h2>
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full border-8 border-zinc-900 flex items-center justify-center relative">
                       <div className="absolute inset-0 rounded-full border-t-8 border-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
                       <Landmark className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Clearing Stage: 3/4</p>
                 </div>
              </div>

              <div className="mt-14 space-y-4 relative z-10">
                 <div className="flex justify-between items-end">
                    <p className="text-[11px] font-bold text-zinc-400 italic">Progress to Settlement Node</p>
                    <span className="text-sm font-black text-white">{settlementProgress}%</span>
                 </div>
                 <Progress value={settlementProgress} className="h-2 bg-zinc-900" />
              </div>
           </Card>
        </section>

        {/* 2. SETTLEMENT DESTINATION & ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           <div className="lg:col-span-12">
              <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4 px-2">
                 <History className="w-6 h-6 text-zinc-500" />
                 Settlement History
              </h3>
              
           <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden">
              <div className="w-full overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-white/5 bg-zinc-900/40">
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date</th>
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Node / Destination</th>
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Settled Amount</th>
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {settlements.map((s, i) => (
                          <tr key={i} className="group hover:bg-zinc-900/40 transition-all">
                             <td className="px-8 py-6">
                                <p className="text-sm font-black text-white">{s.date}</p>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.node}</p>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <p className="text-lg font-black text-white tabular-nums tracking-tighter">₹{s.amount.toLocaleString()}</p>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex justify-center">
                                   <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      {s.status}
                                   </div>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
           </div>

           <div className="lg:col-span-12">
              <Card className="premium-card p-10 bg-indigo-500 border-none relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-black/10 flex items-center justify-center">
                          <Landmark className="w-8 h-8 text-black" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-black tracking-tight">Anamika's Payout Node</h3>
                          <p className="text-xs font-bold text-black/60 mt-1 uppercase tracking-widest leading-none">HDFC Bank • Account ending in 4281</p>
                       </div>
                    </div>
                    <Button className="h-16 px-10 rounded-[1.5rem] bg-black text-white font-black text-sm uppercase tracking-widest gap-4 group">
                       Change Destination Account <ArrowRight className="w-4 h-4" />
                    </Button>
                 </div>
              </Card>
           </div>

        </div>

        {/* 3. SETTLEMENT LOGIC EXPLAINER */}
        <section className="bg-zinc-900/40 border border-white/5 p-12 rounded-[3.5rem] relative group">
           <div className="flex items-center gap-6 mb-8">
              <Info className="w-6 h-6 text-indigo-500" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">The T+1 Settlement Protocol</h3>
           </div>
           <p className="text-sm font-bold text-zinc-500 leading-relaxed max-w-2xl">
              To ensure maximum capital security, CrediPay operates on a <span className="text-white italic">standard T+1 clearing cycle</span>. All UPI collections from today are aggregated, verified by our hub, and batched for physical transfer to your linked bank account by 10 AM the next business day. 
           </p>
           <div className="mt-10 flex items-center gap-4">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[4px]">Verified Institutional Payout System</span>
           </div>
        </section>

      </div>
    </AppShell>
  );
}
