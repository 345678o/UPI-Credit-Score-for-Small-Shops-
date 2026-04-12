
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, TrendingUp, TrendingDown, Target, 
  Zap, BrainCircuit, ArrowRight, IndianRupee,
  PieChart, BarChart3, Info, CheckCircle2,
  ChevronRight, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, getFirestore } from "firebase/firestore";
import { runBusinessInsights, BusinessInsightsOutput } from "@/ai/flows/business-insights";

export default function BusinessInsightsPage() {
  const { user } = useUser();
  const db = getFirestore();
  const [insights, setInsights] = useState<BusinessInsightsOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Date Range: Last 30 days for better insights
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const txnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "transactions"),
      where("timestamp", ">=", thirtyDaysAgo),
      orderBy("timestamp", "desc")
    );
  }, [user]);

  const { data: transactions, isLoading: isTxnsLoading } = useCollection(txnsQuery);

  // Calculate Metrics for AI
  const metrics = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, categories: [] as any[], count: 0 };
    
    let income = 0;
    let expense = 0;
    const catMap: Record<string, number> = {};

    transactions.forEach((tx: any) => {
      if (tx.type === "credit") income += tx.amount;
      else {
        expense += tx.amount;
        const cat = tx.category || "General";
        catMap[cat] = (catMap[cat] || 0) + tx.amount;
      }
    });

    const categories = Object.entries(catMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return { income, expense, categories, count: transactions.length };
  }, [transactions]);

  const loadInsights = async () => {
    if (metrics.count === 0 && !isTxnsLoading) return;
    setIsAiLoading(true);
    try {
      const result = await runBusinessInsights({
        totalIncome: metrics.income,
        totalExpenses: metrics.expense,
        topExpenseCategories: metrics.categories.slice(0, 5),
        transactionFrequency: Math.round(metrics.count / 4), // roughly per week
        businessType: "Retail Merchant"
      });
      setInsights(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (metrics.count > 0 && !insights && !isAiLoading) {
      loadInsights();
    }
  }, [metrics, insights, isAiLoading]);

  return (
    <AppShell>
      <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
               <BrainCircuit className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">AI Business Intelligence</p>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Strategic Insights</h1>
          <p className="text-sm font-bold text-zinc-500 mt-2 max-w-xl">
            Real-time analysis of your cash flow, spending patterns, and growth opportunities powered by CrediPay AI.
          </p>
        </div>
        <Button 
          onClick={() => loadInsights()} 
          disabled={isAiLoading || isTxnsLoading}
          className="h-14 px-8 rounded-2xl bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest gap-3"
        >
          <RefreshCw className={cn("w-4 h-4", isAiLoading && "animate-spin")} />
          Recalculate Insights
        </Button>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* 1. HEALTH SCORE & OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
             <Card className="premium-card bg-zinc-900 border-white/5 p-10 h-full flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-10">Business Health Score</p>
                <div className="relative w-48 h-48 flex items-center justify-center">
                   <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="86" fill="transparent" stroke="#18181b" strokeWidth="12" />
                      <circle 
                        cx="96" cy="96" r="86" fill="transparent" 
                        stroke="#10b981" strokeWidth="12" 
                        strokeDasharray={540} 
                        strokeDashoffset={540 - (540 * (insights?.overallHealthScore || 0) / 100)} 
                        strokeLinecap="round" 
                        className="transition-all duration-1000 ease-out shadow-[0_0_20px_#10b981]" 
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {isAiLoading ? (
                        <Skeleton className="h-16 w-20 bg-zinc-800" />
                      ) : (
                        <>
                          <span className="text-6xl font-black text-white tracking-tighter tabular-nums">{insights?.overallHealthScore || "--"}</span>
                          <span className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest mt-1">Optimal: 85+</span>
                        </>
                      )}
                   </div>
                </div>
                <div className="mt-10 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                   <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                     {insights?.overallHealthScore && insights.overallHealthScore > 70 ? "Healthy Operations" : "Optimization Needed"}
                   </p>
                </div>
             </Card>
          </div>

          <div className="lg:col-span-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <Card className="premium-card bg-zinc-900 border-white/5 p-8 flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><TrendingUp className="w-5 h-5" /></div>
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">30-Day Inflow</span>
                   </div>
                   <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums mb-2">₹{metrics.income.toLocaleString()}</h3>
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-auto">Verified Digital Revenue</p>
                </Card>
                
                <Card className="premium-card bg-zinc-900 border-white/5 p-8 flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><TrendingDown className="w-5 h-5" /></div>
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">30-Day Outflow</span>
                   </div>
                   <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums mb-2">₹{metrics.expense.toLocaleString()}</h3>
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-auto">Operational Expenditures</p>
                </Card>

                <Card className="premium-card bg-zinc-900 border-white/5 p-8 col-span-1 md:col-span-2 relative overflow-hidden">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><PieChart className="w-5 h-5" /></div>
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Spending Analysis</h4>
                   </div>
                   {isAiLoading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                        <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                     </div>
                   ) : (
                     <div className="space-y-4">
                        <p className="text-sm font-bold text-zinc-400 leading-relaxed italic border-l-2 border-amber-500/20 pl-4">
                          "{insights?.spendingAnalysis.summary}"
                        </p>
                        <div className="flex flex-wrap gap-2">
                           {insights?.spendingAnalysis.hotspots.map((h, i) => (
                             <span key={i} className="px-3 py-1 bg-zinc-800 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                               🔥 {h}
                             </span>
                           ))}
                        </div>
                     </div>
                   )}
                </Card>
             </div>
          </div>
        </div>

        {/* 2. SAVINGS & GROWTH */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          
          {/* Savings Section */}
          <section className="space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                   <Target className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white tracking-tight">Reduce Expenses</h3>
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Optimization Opportunities</p>
                </div>
             </div>

             <div className="space-y-4">
                {isAiLoading ? (
                   [1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-[2rem] bg-zinc-900" />)
                ) : insights?.savingsOpportunities.map((op, i) => (
                  <Card key={i} className="premium-card bg-zinc-950 border-white/5 p-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Save {op.estimatedSavings}</span>
                        </div>
                     </div>
                     <h4 className="text-lg font-black text-white mb-3">{op.title}</h4>
                     <p className="text-xs font-bold text-zinc-500 leading-relaxed italic">{op.description}</p>
                     <div className="mt-6 flex items-center gap-2 text-emerald-500">
                        <Zap className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">High Impact Action</span>
                     </div>
                  </Card>
                ))}
             </div>
          </section>

          {/* Growth Section */}
          <section className="space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                   <Sparkles className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white tracking-tight">Business Growth</h3>
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Revenue Expansion Strategies</p>
                </div>
             </div>

             <div className="space-y-4">
                {isAiLoading ? (
                   [1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-[2rem] bg-zinc-900" />)
                ) : insights?.growthStrategies.map((st, i) => (
                  <Card key={i} className="premium-card bg-zinc-950 border-white/5 p-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6">
                        <div className={cn(
                          "px-3 py-1 rounded-full border",
                          st.difficulty === "low" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                          st.difficulty === "medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                          "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        )}>
                           <span className="text-[9px] font-black uppercase tracking-widest">Difficulty: {st.difficulty}</span>
                        </div>
                     </div>
                     <h4 className="text-lg font-black text-white mb-3">{st.title}</h4>
                     <p className="text-xs font-bold text-zinc-500 leading-relaxed">{st.description}</p>
                     <Button variant="ghost" className="mt-6 p-0 h-auto text-[9px] font-black text-blue-500 uppercase tracking-[3px] hover:bg-transparent gap-2 group/btn">
                        Learn Implementation <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                     </Button>
                  </Card>
                ))}
             </div>
          </section>
        </div>

        {/* 3. CTA: CREDIT ACCESS */}
        <section className="bg-zinc-900/40 border border-white/5 p-10 lg:p-14 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
               <div className="space-y-4 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                     <h3 className="text-2xl font-black text-white tracking-tight">Strategy needs capital.</h3>
                  </div>
                  <p className="text-sm font-bold text-zinc-500 max-w-md">Based on your {insights?.overallHealthScore || 0}% health score, you have improved credit eligibility for growth loans.</p>
               </div>
               <Button asChild className="h-20 px-12 rounded-[2rem] bg-emerald-500 text-black font-black text-lg gap-4 shadow-2xl active:scale-95 transition-all">
                  <Link href="/credit">Explore Growth Capital <ChevronRight className="w-5 h-5 stroke-[2.5px]" /></Link>
               </Button>
            </div>
        </section>

      </div>
    </AppShell>
  );
}
