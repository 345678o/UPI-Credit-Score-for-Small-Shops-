"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { Sparkles, ArrowUpRight, Clock, Calendar, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getBusinessPerformanceInsights, type BusinessPerformanceInsightsOutput } from "@/ai/flows/business-performance-insights";

const weeklyData = [
  { day: "Mon", earnings: 1200 },
  { day: "Tue", earnings: 2100 },
  { day: "Wed", earnings: 1800 },
  { day: "Thu", earnings: 2400 },
  { day: "Fri", earnings: 3200 },
  { day: "Sat", earnings: 4500 },
  { day: "Sun", earnings: 3800 },
];

const hourlyData = [
  { hour: 9, sales: 2 },
  { hour: 11, sales: 5 },
  { hour: 13, sales: 12 },
  { hour: 15, sales: 8 },
  { hour: 17, sales: 15 },
  { hour: 19, sales: 22 },
  { hour: 21, sales: 18 },
  { hour: 23, sales: 4 },
];

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const result = await getBusinessPerformanceInsights({
          currentWeekEarnings: 19000,
          previousWeekEarnings: 17000,
          dailyEarnings: weeklyData.map(d => ({ day: d.day, earnings: d.earnings })),
          hourlySales: hourlyData.map(h => ({ hour: h.hour, salesCount: h.sales })),
        });
        setInsights(result.insights);
      } catch (e) {
        setInsights(["Your earnings increased 12% this week.", "Most sales happen between 6–9 PM."]);
      } finally {
        setIsLoading(false);
      }
    }
    loadInsights();
  }, []);

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold font-headline text-primary">Business Insights</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Live Performance Data</p>
      </header>

      <Tabs defaultValue="weekly" className="w-full mb-8">
        <TabsList className="w-full bg-white border border-gray-100 h-14 rounded-2xl p-1.5 shadow-sm">
          <TabsTrigger value="daily" className="flex-1 rounded-xl font-bold h-full">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 rounded-xl font-bold h-full">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 rounded-xl font-bold h-full">Monthly</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="mt-6 space-y-6 pb-8">
          <Card className="premium-card overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-start">
                 <div>
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px] flex items-center gap-2 mb-2">
                      <Calendar className="w-3.5 h-3.5" /> Total Income
                    </CardTitle>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-black text-primary tracking-tighter tabular-nums">₹19,000</h2>
                      <span className="text-emerald-600 font-black text-xs flex items-center">
                        <ArrowUpRight className="w-4 h-4" /> 12%
                      </span>
                    </div>
                 </div>
                 <div className="bg-indigo-50 p-2.5 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                 </div>
              </div>
            </CardHeader>
            <CardContent className="h-64 p-0 pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Peak Sales Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="h-48 p-0 px-4 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }} dy={8} tickFormatter={(h) => `${h}h`} />
                  <Bar dataKey="sales" fill="#1EA366" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none bg-emerald-50 shadow-sm rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-emerald-600 p-2 rounded-2xl shadow-lg shadow-emerald-200">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-emerald-950">Smart Insights</h3>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-emerald-100 animate-pulse rounded-full w-3/4"></div>
                    <div className="h-4 bg-emerald-100 animate-pulse rounded-full w-1/2"></div>
                  </div>
                ) : (
                  insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-white/50 p-4 rounded-2xl border border-emerald-100">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      <p className="text-[13px] font-extrabold text-emerald-900 leading-tight">{insight}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
