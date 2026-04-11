
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  BarChart3, 
  Globe, 
  Target, 
  Layers, 
  TrendingUp, 
  ArrowRight, 
  PieChart, 
  ShieldCheck, 
  Zap,
  IndianRupee,
  Users,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * STRATEGIC MODULE: Investor Hub & Vision Roadmap
 * Refined with an interactive 'Growth Protocol' to simulate equity events and scale-up vision.
 */
export default function VisionPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleLaunch = () => {
    setIsInitializing(true);
    // Simulate complex infrastructure initialization
    setTimeout(() => {
      setIsInitializing(false);
      setShowSuccess(true);
    }, 2800);
  };

  return (
    <AppShell>
      <header className="mb-14 text-center">
        <div className="inline-flex items-center gap-3 mb-6 bg-zinc-900/50 p-2 pr-6 rounded-full border border-white/5 shadow-2xl">
           <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black">
              <Rocket className="w-5 h-5" />
           </div>
           <h1 className="text-sm font-black text-white uppercase tracking-[4px]">Investor Hub</h1>
        </div>
        <p className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">Strategic Roadmap</p>
      </header>

      <div className="space-y-12 pb-32">
        {/* Powerful One-Liner - UI KIT Vision Block */}
        <Card className="premium-card bg-emerald-500 text-black p-12 lg:p-20 relative overflow-hidden text-center shadow-[0_30px_100px_rgba(34,197,94,0.3)] border-none group">
           <div className="absolute top-0 left-0 w-96 h-96 bg-black/10 rounded-full -ml-48 -mt-48 blur-[100px] group-hover:bg-black/20 transition-all opacity-50" />
           <div className="relative z-10 space-y-10">
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter italic">
                “CrediPay converts daily transactions into financial trust, enabling millions of small businesses.”
              </h2>
              <div className="w-32 h-2 bg-black/20 mx-auto rounded-full" />
              <p className="text-[12px] font-black text-black/60 uppercase tracking-[6px] animate-pulse">The Scale Engine</p>
           </div>
        </Card>

        {/* Market Positioning Grid */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 px-2">
              <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center">
                 <Layers className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-black text-white text-xl tracking-tight uppercase tracking-widest text-[10px]">Market Positioning</h3>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2">
              {[
                { title: "Infrastructure", desc: "The foundational layer for 40M+ small merchants.", icon: Globe },
                { title: "Intelligence", desc: "Transforms raw UPI data into institutional credit scores.", icon: ShieldCheck },
                { title: "Inclusion", desc: "Digital credit access for the underserved SME sector.", icon: Users },
              ].map((item) => (
                <div key={item.title} className="bg-zinc-950 p-10 rounded-[3rem] border border-white/5 flex flex-col items-center text-center gap-8 transition-all hover:bg-zinc-900 group hover:-translate-y-2">
                   <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
                      <item.icon className="w-10 h-10 text-emerald-500" />
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-xl font-black text-white">{item.title}</h4>
                      <p className="text-xs text-zinc-600 font-bold leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Opportunity Pulse Card */}
           <div className="bg-zinc-950 border border-emerald-500/10 rounded-[3rem] overflow-hidden">
              <div className="w-full overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-white/5 bg-emerald-500/5">
                          <th className="px-10 py-8 text-[11px] font-black text-emerald-500 uppercase tracking-[4px]">Market Dynamic</th>
                          <th className="px-10 py-8 text-[11px] font-black text-emerald-500 uppercase tracking-[4px]">Institutional Scale</th>
                          <th className="px-10 py-8 text-[11px] font-black text-emerald-500 uppercase tracking-[4px]">Strategic Growth</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       <tr className="group hover:bg-zinc-900/40">
                          <td className="px-10 py-10">
                             <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">UPI Transactions</h4>
                             <p className="text-[10px] text-zinc-600 font-bold">Monthly volume in India</p>
                          </td>
                          <td className="px-10 py-10 font-black text-4xl text-white tracking-tighter">1.2B+</td>
                          <td className="px-10 py-10 text-[10px] font-black text-emerald-500 uppercase tracking-widest">+45% YoY</td>
                       </tr>
                       <tr className="group hover:bg-zinc-900/40">
                          <td className="px-10 py-10">
                             <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">SME Credit Gap</h4>
                             <p className="text-[10px] text-zinc-600 font-bold">Underserved capital need</p>
                          </td>
                          <td className="px-10 py-10 font-black text-4xl text-white tracking-tighter">₹40B</td>
                          <td className="px-10 py-10 text-[10px] font-black text-emerald-500 uppercase tracking-widest">High Potential</td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
           
           <div className="mt-12 p-10 bg-zinc-900/40 rounded-[2.5rem] border border-white/5">
              <p className="text-lg lg:text-2xl leading-relaxed font-black text-zinc-500 border-l-8 border-emerald-500 pl-10 italic">
                 "Massive UPI adoption exists, but formal credit access remains broken. Small merchants are digitally active but invisible to legacy banks."
              </p>
           </div>

        {/* Roadmap - Immersive Vertical Hub */}
        <section className="space-y-10">
           <div className="flex items-center gap-4 px-2">
              <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center">
                 <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-black text-white text-xl tracking-tight uppercase tracking-widest text-[10px]">Strategic Roadmap</h3>
           </div>
           <div className="bg-zinc-950 rounded-[4rem] border border-white/5 p-12 lg:p-20 space-y-20 relative overflow-hidden">
              <div className="absolute left-[79px] lg:left-[119px] top-20 bottom-20 w-1 bg-zinc-900 rounded-full" />
              {[
                { phase: "PHASE 1", title: "Infrastructure", items: ["Payments Core", "Credit Score Engine"], status: "Active" },
                { phase: "PHASE 2", title: "Loan System", items: ["Lending Rails", "Notifications"], status: "Scaling" },
                { phase: "PHASE 3", title: "Advanced AI", items: ["BI Suite", "Growth AI"], status: "Research" },
                { phase: "PHASE 4", title: "Regional Scale", items: ["Full Disbursement", "NBFC Nodes"], status: "Vision" },
              ].map((item, idx) => (
                <div key={item.phase} className="relative flex gap-12 lg:gap-20 group">
                   <div className="w-12 h-12 lg:w-20 lg:h-20 rounded-full border-4 lg:border-8 border-emerald-500 bg-black relative z-10 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform">
                      <p className="text-white text-sm lg:text-2xl font-black">{idx + 1}</p>
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[6px]">{item.phase}</h4>
                         <span className="text-[8px] font-black text-zinc-500 border border-white/10 px-3 py-1 rounded-full">{item.status}</span>
                      </div>
                      <h5 className="font-black text-white text-2xl lg:text-4xl mb-6 tracking-tighter italic">{item.title}</h5>
                      <div className="flex flex-wrap gap-3">
                        {item.items.map(i => (
                          <span key={i} className="text-[9px] font-black bg-zinc-900 text-zinc-500 border border-white/5 px-6 py-3 rounded-full uppercase tracking-widest">{i}</span>
                        ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Initialize Growth Action */}
        <div className="px-2">
           <Button 
              className={cn(
                 "w-full h-24 rounded-[3rem] text-black font-black text-2xl shadow-[0_30px_100px_rgba(34,197,94,0.3)] uppercase tracking-[6px] active:scale-95 transition-all mb-10 overflow-hidden relative group",
                 isInitializing ? "bg-zinc-800" : "bg-emerald-500"
              )}
              onClick={handleLaunch}
              disabled={isInitializing}
           >
              {isInitializing ? (
                <>
                  <RefreshCw className="w-8 h-8 animate-spin mr-6" />
                  Orchestrating Growth...
                </>
              ) : (
                <>
                  Initialize Growth Protocol
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
           </Button>
        </div>

        {/* SUCCESS OVERLAY */}
        {showSuccess && (
           <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-[50px] flex flex-col items-center justify-center p-12 lg:p-24 animate-in fade-in zoom-in duration-1000">
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/20 rounded-full blur-[200px]" />
                 <Sparkles className="absolute top-1/4 left-1/4 w-32 h-32 text-emerald-500/20 animate-pulse" />
              </div>

              <div className="w-56 h-56 rounded-[4rem] bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center mb-16 relative scale-110">
                 <CheckCircle2 className="w-32 h-32 text-emerald-500 stroke-[3px]" />
                 <div className="absolute inset-0 blur-[80px] bg-emerald-500/30 animate-pulse rounded-full" />
              </div>
              
              <p className="text-xs font-black text-emerald-500 uppercase tracking-[12px] mb-8">Protocol Successfully Initialized</p>
              <h2 className="text-6xl lg:text-[10rem] font-black text-white mb-20 tabular-nums tracking-tighter leading-none italic text-center">
                 GROWTH MODE: ACTIVE
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-20">
                 <div className="p-10 bg-zinc-900/50 border border-white/5 rounded-[3rem] text-center space-y-4">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Projected Scaling</p>
                    <p className="text-5xl font-black text-white tracking-widest flex items-center justify-center gap-4">
                       12.5x <ArrowUpRight className="w-10 h-10 text-emerald-500" />
                    </p>
                 </div>
                 <div className="p-10 bg-zinc-900/50 border border-white/5 rounded-[3rem] text-center space-y-4">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Disbursement Node</p>
                    <p className="text-5xl font-black text-white tracking-tighter uppercase italic">LIVE ENV</p>
                 </div>
              </div>
              
              <Button 
                 className="w-full max-w-md h-24 rounded-[3rem] bg-emerald-500 text-black font-black text-2xl hover:bg-emerald-400 transition-all shadow-2xl active:scale-95" 
                 onClick={() => router.push('/')}
              >
                 Enter Pro Terminal
              </Button>
           </div>
        )}

      </div>
    </AppShell>
  );
}
