
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, AreaChart, Area, Legend } from "recharts";
import { Sparkles, TrendingUp, Users, ChevronRight, Activity, Zap, TrendingDown, DollarSign, PieChart, Target, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getBusinessPerformanceInsights } from "@/ai/flows/business-performance-insights";
import { useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { cn } from "@/lib/utils";
import { collection, query, orderBy, limit, getFirestore, doc } from "firebase/firestore";

export default function AnalyticsPage() {
  const { user } = useUser();
  const [insights, setInsights] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(true);

  const db = getFirestore();

  const aggregatesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "dailyBusinessAggregates"),
      orderBy("date", "desc"),
      limit(10)
    );
  }, [user]);

  const { data: aggregates, isLoading: isAggregatesLoading } = useCollection(aggregatesQuery);

  const summaryRef = useMemoFirebase(() => user ? doc(db, "users", user.uid, "userAnalyticsSummary", "current") : null, [user]);
  const { data: summary } = useDoc(summaryRef);

  const customersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "customers"),
      orderBy("totalSpent", "desc"),
      limit(12)
    );
  }, [user]);
  const { data: customers } = useCollection(customersQuery);

  useEffect(() => {
    async function loadInsights() {
      if (user && summary) {
        setIsAiLoading(true);
        try {
          const res = await getBusinessPerformanceInsights({
            currentWeekEarnings: summary.totalEarningsOverall || 0,
            previousWeekEarnings: summary.previousWeekEarnings || 0,
            expenses: summary.totalExpensesOverall || 0,
            netProfit: (summary.totalEarningsOverall || 0) - (summary.totalExpensesOverall || 0),
            dailyEarnings: [],
            hourlySales: []
          });
          setInsights(res.insights || []);
        } catch (e) {
          console.error(e);
        } finally {
          setIsAiLoading(false);
        }
      }
    }
    loadInsights();
  }, [user, summary]);

  const chartData = aggregates?.map(dot => ({
    name: new Date(dot.date).toLocaleDateString([], { weekday: 'short' }),
    income: dot.totalEarnings || 0,
    expenses: dot.totalExpenses || 0,
    profit: dot.netEarnings || 0,
  })).reverse() || [];

  const totalEarnings = summary?.totalEarningsOverall || 0;
  const totalExpenses = summary?.totalExpensesOverall || 0;
  const netProfit = totalEarnings - totalExpenses;

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14 flex flex-col md:flex-row justify-between items-center gap-6 text-center lg:text-left">
        <div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Strategic Infrastructure</p>
          <h1 className="text-4xl lg:text-6xl mt-2 tracking-tighter font-black text-white">Performance Audit</h1>
        </div>
        <Link href="/analytics/weekly-report">
          <Button className="h-14 px-8 rounded-2xl bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest gap-3 shadow-2xl hover:bg-zinc-800 transition-all group">
            <BarChart3 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            Detailed Weekly Report
          </Button>
        </Link>
      </header>

      <div className="space-y-10 lg:space-y-16 pb-32">
        
        {/* Core Stats Overview - Responsive Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-10">
          <Card className="premium-card p-6 lg:p-10 bg-zinc-900/40 border-emerald-500/10 hover:bg-zinc-900 transition-all group">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Gross Inflow</p>
            <h3 className="text-3xl lg:text-5xl font-black tabular-nums tracking-tighter text-white">₹{totalEarnings.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-2 text-zinc-500 group-hover:text-emerald-500 transition-colors">
               <TrendingUp className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Active Velocity</span>
            </div>
          </Card>
          
          <Card className="premium-card p-6 lg:p-10 bg-zinc-900/40 border-rose-500/10 hover:bg-zinc-900 transition-all group">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">Total Outflow</p>
            <h3 className="text-3xl lg:text-5xl font-black tabular-nums tracking-tighter text-white">₹{totalExpenses.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-2 text-zinc-500 group-hover:text-rose-500 transition-colors">
               <TrendingDown className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Capital Leakage</span>
            </div>
          </Card>

          <Card className="premium-card p-6 lg:p-10 bg-emerald-500 border-none shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all group cursor-pointer">
            <p className="text-[10px] font-black text-black uppercase tracking-widest mb-3 opacity-60">Net Profitability</p>
            <h3 className="text-3xl lg:text-5xl font-black tabular-nums tracking-tighter text-black">₹{netProfit.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-2 text-black/60 group-hover:text-black transition-colors">
               <Zap className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Operating Gain</span>
            </div>
          </Card>
        </div>

        {/* AI Performance Narrative - Wide on Desktop */}
        <Card className="premium-card p-10 lg:p-14 bg-zinc-900 border-emerald-500/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.03] rounded-full -mr-48 -mt-48 blur-[100px]" />
           <div className="flex items-center gap-4 mb-12">
              <span className="w-6 h-6"><Sparkles className="w-full h-full text-emerald-500" /></span>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Strategic Intelligence Feed</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {isAiLoading ? (
                 [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2rem] bg-zinc-800" />)
              ) : (
                insights.map((insight, idx) => (
                  <div key={idx} className="flex flex-col gap-6 p-8 bg-zinc-950/50 rounded-[2rem] border border-white/5 hover:border-emerald-500/10 transition-all">
                     <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <span className="text-[10px] font-black text-emerald-500">{idx + 1}</span>
                     </div>
                     <p className="text-sm lg:text-base font-bold text-zinc-300 leading-relaxed italic pr-4">"{insight}"</p>
                  </div>
                ))
              )}
           </div>
        </Card>

        {/* Financial Velocity Chart - High Fidelity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
           <Card className="lg:col-span-8 premium-card p-6 lg:p-14 bg-zinc-950 border-white/5 relative">
              <div className="flex justify-between items-center mb-10 lg:mb-14">
                 <div>
                    <h3 className="text-base lg:text-lg font-black text-white tracking-widest uppercase">Monetary Velocity</h3>
                    <p className="text-[9px] font-black text-zinc-600 mt-1 uppercase tracking-[0.2em]">10-Day Audit Cycle</p>
                 </div>
              </div>
              <div className="h-[300px] lg:h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 900, fill: '#3f3f46', textAnchor: 'middle'}}
                      dy={15}
                   />
                   <YAxis hide />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '1.5rem', transition: 'all 0.2s', fontSize: '11px', fontWeight: 900 }}
                     itemStyle={{textTransform: 'uppercase'}}
                   />
                   <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={4} />
                   <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={4} />
                 </AreaChart>
               </ResponsiveContainer>
              </div>
           </Card>

           <div className="lg:col-span-4 space-y-8 lg:space-y-12">
              <Card className="premium-card p-10 bg-zinc-900 border-white/5 relative overflow-hidden group h-full">
                 <div className="flex items-center gap-4 mb-10">
                    <Target className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Efficiency Audit</h3>
                 </div>
                 
                 <div className="space-y-12">
                    <div>
                       <div className="flex justify-between items-baseline mb-4">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Net Reliability</p>
                          <span className="text-lg font-black text-white">{((netProfit / (totalEarnings || 1)) * 100).toFixed(0)}%</span>
                       </div>
                       <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, (netProfit / (totalEarnings || 1)) * 100)}%` }} />
                       </div>
                    </div>

                    <div>
                       <div className="flex justify-between items-baseline mb-4">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Operational Drag</p>
                          <span className="text-lg font-black text-rose-500">{((totalExpenses / (totalEarnings || 1)) * 100).toFixed(0)}%</span>
                       </div>
                       <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${Math.min(100, (totalExpenses / (totalEarnings || 1)) * 100)}%` }} />
                       </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/5">
                       <p className="text-caption leading-relaxed text-zinc-500">
                          Infrastructure detected healthy capital velocity. Maintain inflow consistency to reach eligible limit of ₹75,000.
                       </p>
                    </div>
                 </div>
              </Card>
           </div>
        </div>

        {/* Customer Network Grid - Professional Workspace Style */}
        <section className="space-y-10 pb-16">
           <div className="flex justify-between items-center px-6">
              <h3 className="text-2xl font-black text-white tracking-widest uppercase">Network Participants</h3>
              <div className="flex gap-4">
                 <div className="px-5 py-2 rounded-full bg-zinc-950 border border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    Sorted by Intensity
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {customers?.map((customer: any, idx) => (
                 <div key={customer.id} className="p-8 bg-zinc-900/10 rounded-[2.5rem] border border-white/5 hover:bg-zinc-900/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12" />
                    <div className="flex items-center gap-5 mb-8">
                       <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-2xl text-zinc-500 group-hover:text-emerald-500 transition-colors">
                          {customer.name[0]}
                       </div>
                       <div>
                          <p className="text-lg font-black text-white tracking-tighter truncate max-w-[100px]">{customer.name}</p>
                          {customer.visitCount > 1 && (
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Loyalty High</span>
                          )}
                       </div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-white/5">
                       <div className="flex justify-between">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">LTV</span>
                          <span className="text-sm font-black text-white tabular-nums">₹{customer.totalSpent.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Frequency</span>
                          <span className="text-xs font-black text-zinc-300">{customer.visitCount} Hits</span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </section>
      </div>
    </AppShell>
  );
}
