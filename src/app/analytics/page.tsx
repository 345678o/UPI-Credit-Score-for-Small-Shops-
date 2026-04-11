"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";
import { Sparkles, Calendar, TrendingUp, Users, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getBusinessPerformanceInsights } from "@/ai/flows/business-performance-insights";
import { useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
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
      limit(7)
    );
  }, [user]);

  const { data: aggregates } = useCollection(aggregatesQuery);

  const summaryRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid, "userAnalyticsSummary", "current");
  }, [user]);
  const { data: summaryData } = useDoc(summaryRef);

  const chartData = aggregates?.map(agg => ({
    day: new Date(agg.date).toLocaleDateString([], { weekday: 'short' }),
    earnings: agg.totalEarnings,
    date: agg.date,
    hourly: agg.hourlyTransactionCounts || {}
  })).reverse() || [];

  const totalThisWeek = summaryData?.weeklyEarnings || 0;

  useEffect(() => {
    async function loadInsights() {
      if (!user || chartData.length === 0) return;
      setIsAiLoading(true);
      try {
        const hourlySales = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          salesCount: chartData.reduce((acc, day) => acc + (day.hourly[i] || 0), 0)
        }));

        const result = await getBusinessPerformanceInsights({
          currentWeekEarnings: totalThisWeek,
          previousWeekEarnings: summaryData?.monthlyEarnings ? summaryData.monthlyEarnings / 4 : 0,
          dailyEarnings: chartData.map(d => ({ day: d.day, earnings: d.earnings })),
          hourlySales: hourlySales,
        });
        setInsights(result.insights);
      } catch (e) {
        setInsights(["Analyzing trends...", "Unlock growth with more data."]);
      } finally {
        setIsAiLoading(false);
      }
    }
    loadInsights();
  }, [user, chartData.length, totalThisWeek, summaryData?.monthlyEarnings]);

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-primary tracking-tight">Dashboard</h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Business Stats</p>
      </header>

      <div className="space-y-6 pb-8">
        <Card className="premium-card p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Balance</p>
              <h2 className="text-4xl font-black text-primary tracking-tighter">₹{totalThisWeek.toLocaleString()}</h2>
            </div>
            <div className="bg-primary/5 p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 800 }} dy={10} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9', radius: 10 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 800, color: '#1d4ed8' }}
                />
                <Bar dataKey="earnings" radius={[10, 10, 10, 10]} barSize={20}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#3b82f6' : '#E2E8F0'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <section className="grid grid-cols-2 gap-4">
           <Card className="premium-card p-6">
              <div className="flex items-center gap-2 mb-4">
                 <Users className="w-4 h-4 text-primary" />
                 <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Customers</h3>
              </div>
              <p className="text-2xl font-black text-primary">+12%</p>
              <p className="text-[9px] font-bold text-muted-foreground mt-1">Growth this month</p>
           </Card>
           <Card className="premium-card p-6">
              <div className="flex items-center gap-2 mb-4">
                 <TrendingUp className="w-4 h-4 text-emerald-500" />
                 <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Retention</h3>
              </div>
              <p className="text-2xl font-black text-emerald-500">88%</p>
              <p className="text-[9px] font-bold text-muted-foreground mt-1">Returning users</p>
           </Card>
        </section>

        <Card className="premium-card blue-gradient text-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-lg">AI Business Insights</h3>
          </div>
          <div className="space-y-4">
            {isAiLoading ? (
              <div className="h-20 bg-white/10 animate-pulse rounded-2xl" />
            ) : insights.map((insight, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-2" />
                <p className="text-xs font-bold text-white/90 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
