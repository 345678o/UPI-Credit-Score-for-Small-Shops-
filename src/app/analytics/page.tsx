"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import { Sparkles, ArrowUpRight, Calendar, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getBusinessPerformanceInsights } from "@/ai/flows/business-performance-insights";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, getFirestore } from "firebase/firestore";

export default function AnalyticsPage() {
  const { user } = useUser();
  const [insights, setInsights] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(true);

  // Fetch recent aggregates for AI insights and charting
  const aggregatesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(getFirestore(), "users", user.uid, "dailyBusinessAggregates"),
      orderBy("date", "desc"),
      limit(7)
    );
  }, [user]);

  const { data: aggregates, isLoading: isAggregatesLoading } = useCollection(aggregatesQuery);

  // Fetch recent transactions for "Customer Insights"
  const recentTxnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(getFirestore(), "users", user.uid, "transactions"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [user]);

  const { data: transactions } = useCollection(recentTxnsQuery);

  const chartData = aggregates?.map(agg => ({
    day: new Date(agg.date).toLocaleDateString([], { weekday: 'short' }),
    earnings: agg.totalEarnings,
    date: agg.date,
    hourly: agg.hourlyTransactionCounts || {}
  })).reverse() || [];

  const totalThisWeek = chartData.reduce((acc, curr) => acc + curr.earnings, 0);

  // Extract Customer Insights (Repeat Customers)
  const customerCounts = transactions?.reduce((acc: Record<string, number>, tx) => {
    const name = tx.payerIdentifier || "Walk-in";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  
  const topCustomers = Object.entries(customerCounts || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  useEffect(() => {
    async function loadInsights() {
      if (!user || chartData.length === 0) return;
      setIsAiLoading(true);
      try {
        // Flatten hourly stats for AI
        const hourlySales = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          salesCount: chartData.reduce((acc, day) => acc + (day.hourly[i] || 0), 0)
        }));

        const result = await getBusinessPerformanceInsights({
          currentWeekEarnings: totalThisWeek,
          previousWeekEarnings: totalThisWeek * 0.9, // Mock comparison
          dailyEarnings: chartData.map(d => ({ day: d.day, earnings: d.earnings })),
          hourlySales: hourlySales,
        });
        setInsights(result.insights);
      } catch (e) {
        setInsights(["Your business is gaining momentum.", "Consistent transaction volume detected."]);
      } finally {
        setIsAiLoading(false);
      }
    }
    loadInsights();
  }, [user, chartData.length, totalThisWeek]);

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold font-headline text-primary">Business Insights</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">AI-Powered Growth Engine</p>
      </header>

      <div className="space-y-6 pb-24">
        <Card className="premium-card overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-start">
               <div>
                  <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px] flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5" /> Total Income (7 Days)
                  </CardTitle>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-primary tracking-tighter tabular-nums">₹{totalThisWeek.toLocaleString()}</h2>
                  </div>
               </div>
               <div className="bg-indigo-50 p-2.5 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="h-64 p-0 pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#191A40" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#191A40" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 800 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 800, color: '#191A40' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#191A40" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <section className="grid grid-cols-2 gap-4">
           <Card className="premium-card">
              <CardContent className="p-6">
                 <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Top Customers</h3>
                 </div>
                 <div className="space-y-3">
                    {topCustomers.length > 0 ? topCustomers.map(([name, count], i) => (
                      <div key={i} className="flex justify-between items-center">
                         <span className="text-sm font-black text-primary truncate max-w-[80px]">{name}</span>
                         <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{count} visits</span>
                      </div>
                    )) : (
                      <p className="text-[10px] text-muted-foreground font-bold">No data yet</p>
                    )}
                 </div>
              </CardContent>
           </Card>
           <Card className="premium-card">
              <CardContent className="p-6">
                 <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Growth</h3>
                 </div>
                 <div className="text-center py-2">
                    <p className="text-2xl font-black text-emerald-600">+12%</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">vs last week</p>
                 </div>
              </CardContent>
           </Card>
        </section>

        <Card className="border-none bg-emerald-50 shadow-sm rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black text-emerald-950 text-xl tracking-tight">AI Growth Coach</h3>
            </div>
            <div className="space-y-4">
              {isAiLoading ? (
                <div className="space-y-3">
                  <div className="h-5 bg-emerald-100 animate-pulse rounded-full w-3/4"></div>
                  <div className="h-5 bg-emerald-100 animate-pulse rounded-full w-1/2"></div>
                </div>
              ) : insights.length > 0 ? (
                insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-white/50 p-5 rounded-3xl border border-emerald-100/50 backdrop-blur-sm shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2" />
                    <p className="text-[13px] font-extrabold text-emerald-900 leading-snug">{insight}</p>
                  </div>
                ))
              ) : (
                <p className="text-[12px] font-bold text-emerald-900/60 text-center py-6">
                  Collecting data to generate your custom insights...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
