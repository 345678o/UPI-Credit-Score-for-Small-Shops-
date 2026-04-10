"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, TrendingUp, History, Sparkles, ChevronRight, IndianRupee, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { creditScoreImprovementRecommendations, type CreditScoreImprovementRecommendationsOutput } from "@/ai/flows/credit-score-improvement-recommendations";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CreditPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecs() {
      try {
        const result = await creditScoreImprovementRecommendations({
          currentCreditScore: 745,
          transactionVolume: 125000,
          paymentConsistency: 95,
          revenueGrowth: 15,
        });
        setRecommendations(result.recommendations);
      } catch (e) {
        setRecommendations([
          { title: "Maintain Transaction Volume", description: "Keep your daily transaction volume consistent to build trust with lenders." },
          { title: "On-time Utility Payments", description: "Your digital bill payments contribute significantly to your business credit profile." }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadRecs();
  }, []);

  return (
    <AppShell>
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold font-headline text-primary">Credit Dashboard</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Status: High Eligibility</p>
      </header>

      <div className="space-y-6 pb-8">
        <Card className="indigo-gradient text-white border-none shadow-2xl overflow-hidden relative rounded-[2rem]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
          <CardContent className="p-10 flex flex-col items-center text-center">
            <p className="text-white/60 text-[10px] font-extrabold uppercase tracking-[3px] mb-8">Current Score</p>
            
            <div className="relative w-56 h-56 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_15px_rgba(30,163,102,0.3)]">
                  <circle
                    cx="112"
                    cy="112"
                    r="96"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="14"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="96"
                    fill="transparent"
                    stroke="#1EA366"
                    strokeWidth="14"
                    strokeDasharray={603}
                    strokeDashoffset={603 - (603 * 745 / 900)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-extrabold tracking-tighter tabular-nums">745</span>
                  <span className="text-emerald-400 font-black text-xs uppercase tracking-[2px] mt-1">Excellent</span>
               </div>
            </div>
            
            <div className="mt-8 flex gap-12 text-[10px] font-black text-white/40 tracking-widest">
               <span>300</span>
               <span>RANGE</span>
               <span>900</span>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-3 gap-3">
          {[
            { label: "Volume", value: "92%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Consistency", value: "98%", icon: History, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Growth", value: "15%", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
          ].map((item) => (
            <div key={item.label} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-50 flex flex-col gap-2 transition-transform active:scale-95">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", item.bg)}>
                 <item.icon className={cn("w-4 h-4", item.color)} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase">{item.label}</p>
                <p className="text-sm font-black text-primary tabular-nums">{item.value}</p>
              </div>
            </div>
          ))}
        </section>

        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
          <CardContent className="p-0">
             <div className="bg-emerald-500 p-6 flex justify-between items-center text-white">
                <div>
                   <h3 className="font-black text-xl tracking-tight">Loan Pre-Approved!</h3>
                   <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider">Unlock Instant Capital</p>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                   <IndianRupee className="w-8 h-8 text-white" />
                </div>
             </div>
             <div className="p-6">
                <div className="flex justify-between items-end mb-6">
                   <div>
                      <p className="text-muted-foreground text-[10px] font-extrabold uppercase mb-1">Eligible Amount</p>
                      <p className="text-4xl font-extrabold text-primary tracking-tighter tabular-nums">₹2,50,000</p>
                   </div>
                   <div className="text-right">
                      <p className="text-muted-foreground text-[10px] font-extrabold uppercase mb-1">Low EMI from</p>
                      <p className="text-xl font-black text-primary tabular-nums">₹8,450<span className="text-xs font-bold text-muted-foreground">/mo</span></p>
                   </div>
                </div>
                <Button className="w-full h-16 rounded-2xl indigo-gradient text-white font-black text-lg shadow-xl uppercase tracking-widest active:scale-95 transition-all" asChild>
                   <Link href="/credit/apply">Get Loan Now</Link>
                </Button>
             </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
               <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-black text-primary">Expert Recommendations</h3>
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              [1, 2].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-3xl" />)
            ) : (
              recommendations.map((rec, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm flex gap-4 items-start">
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-extrabold text-sm text-primary mb-1">{rec.title}</h4>
                      <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                        {rec.description}
                      </p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
