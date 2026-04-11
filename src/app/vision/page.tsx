
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
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VisionPage() {
  return (
    <AppShell>
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-3 mb-4 bg-zinc-900/50 p-2 pr-6 rounded-full border border-white/5">
           <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black">
              <Rocket className="w-5 h-5" />
           </div>
           <h1 className="text-sm font-black text-white uppercase tracking-[4px]">Investor Hub</h1>
        </div>
        <p className="text-3xl font-black text-white tracking-tighter">Strategic Roadmap</p>
      </header>

      <div className="space-y-12 pb-32">
        {/* Powerful One-Liner - UI KIT Vision Block */}
        <Card className="premium-card bg-emerald-500 text-black p-12 relative overflow-hidden text-center shadow-[0_30px_70px_rgba(34,197,94,0.3)]">
           <div className="absolute top-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mt-32 blur-3xl opacity-50" />
           <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8 tracking-tighter">
                “CrediPay converts daily transactions into financial trust, enabling small businesses to access credit and grow.”
              </h2>
              <div className="w-20 h-1.5 bg-black/20 mx-auto rounded-full mb-8" />
              <p className="text-[11px] font-black text-black/60 uppercase tracking-[4px]">The Growth engine</p>
           </div>
        </Card>

        {/* Market Positioning Grid */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                 <Layers className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-black text-white text-lg tracking-tight">Market Positioning</h3>
           </div>
           <div className="grid grid-cols-1 gap-4 px-2">
              {[
                { title: "Financial Infrastructure", desc: "Not just a payment app, but the foundational layer for small merchants.", icon: Globe },
                { title: "Credit Intelligence", desc: "Transforms raw UPI transaction data into reliable credit scores.", icon: ShieldCheck },
                { title: "Financial Inclusion", desc: "Enabling credit access for millions of underserved small businesses.", icon: Users },
              ].map((item) => (
                <div key={item.title} className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 flex items-start gap-6 transition-all hover:bg-zinc-900/60 group">
                   <div className="w-16 h-16 rounded-[1.75rem] bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 shadow-xl">
                      <item.icon className="w-7 h-7 text-emerald-500" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-white mb-2">{item.title}</h4>
                      <p className="text-sm text-zinc-500 font-bold leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Opportunity Pulse Card */}
        <Card className="premium-card bg-zinc-900 border border-emerald-500/20 p-10">
           <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                 <BarChart3 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-black text-xl text-white tracking-tight">The Opportunity</h3>
           </div>
           <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-black/50 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-4xl font-black tabular-nums text-white">1.2B+</p>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">Monthly UPI Pulse</p>
                 </div>
                 <div className="bg-black/50 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-4xl font-black tabular-nums text-white">40M+</p>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">SME Credit Gap</p>
                 </div>
              </div>
              <p className="text-sm leading-relaxed font-bold text-zinc-400 border-l-4 border-emerald-500 pl-6 italic">
                 "Massive UPI adoption exists, but formal credit access remains broken. Small merchants are digitally active but invisible to legacy banks."
              </p>
           </div>
        </Card>

        {/* Business Model Grid */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                 <PieChart className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-black text-white text-lg tracking-tight">Monetization Engine</h3>
           </div>
           <div className="grid grid-cols-1 gap-4 px-2">
              {[
                { title: "Loan Commissions", desc: "Success fees from NBFC/Banking partners on every loan disbursed.", icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { title: "Freemium SaaS", desc: "Advanced analytics and credit builder tools for a monthly subscription.", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
                { title: "Premium Services", desc: "Value-added merchant services and data insight products.", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
              ].map((item) => (
                <div key={item.title} className="bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between transition-all hover:bg-zinc-900/60">
                   <div className="flex items-center gap-5">
                      <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center", item.bg)}>
                         <item.icon className={cn("w-6 h-6", item.color)} />
                      </div>
                      <div>
                         <h4 className="font-black text-white text-base mb-1">{item.title}</h4>
                         <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{item.desc}</p>
                      </div>
                   </div>
                   <ArrowRight className="w-5 h-5 text-zinc-700" />
                </div>
              ))}
           </div>
        </section>

        {/* Roadmap - Immersive Vertical Hub */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                 <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-black text-white text-lg tracking-tight">Strategic Roadmap</h3>
           </div>
           <div className="bg-zinc-900/50 rounded-[3rem] border border-white/5 p-10 space-y-12 relative overflow-hidden">
              <div className="absolute left-[59px] top-10 bottom-10 w-0.5 bg-zinc-800" />
              {[
                { phase: "PHASE 1", title: "Infrastructure", items: ["Payments Core", "Credit Score Engine"] },
                { phase: "PHASE 2", title: "Loan System", items: ["Basic Lending", "Notifications Hub"] },
                { phase: "PHASE 3", title: "Advanced AI", items: ["Business Intelligence", "Growth Suite"] },
                { phase: "PHASE 4", title: "Scale Deployment", items: ["Lender Integrations", "Full Disbursement"] },
              ].map((item, idx) => (
                <div key={item.phase} className="relative flex gap-10">
                   <div className="w-10 h-10 rounded-full border-4 border-emerald-500 bg-black relative z-10 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                      <p className="text-white text-[10px] font-black">{idx + 1}</p>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[4px] mb-3">{item.phase}</h4>
                      <h5 className="font-black text-white text-xl mb-4 tracking-tight">{item.title}</h5>
                      <div className="flex flex-wrap gap-2">
                        {item.items.map(i => (
                          <span key={i} className="text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-white/5 px-4 py-2 rounded-full uppercase tracking-wider">{i}</span>
                        ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <section className="grid grid-cols-1 gap-6 px-2">
           <Card className="premium-card p-10 bg-zinc-900/80 border border-emerald-500/30 shadow-[0_20px_50px_rgba(34,197,94,0.1)]">
              <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[4px] mb-6">Unit Economics</h4>
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">Base Cost</span>
                    <span className="font-black text-white">CLOUD NATIVE</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">CAC Profile</span>
                    <span className="font-black text-white">HYPER-LOCAL</span>
                 </div>
                 <div className="w-full h-px bg-zinc-800" />
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-black uppercase tracking-widest">LTV MULTIPLIER</span>
                    <span className="text-3xl font-black text-emerald-500 tracking-tighter">12.5x</span>
                 </div>
              </div>
           </Card>
        </section>

        <Button className="w-full h-20 rounded-[2.5rem] bg-emerald-500 text-black font-black text-xl shadow-[0_20px_50px_rgba(34,197,94,0.3)] uppercase tracking-[4px] active:scale-95 transition-all mb-10">
           Initialize Growth
        </Button>
      </div>
    </AppShell>
  );
}
