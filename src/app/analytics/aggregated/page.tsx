"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Legend
} from "recharts";
import { 
  ChevronLeft, TrendingUp, TrendingDown, Store, 
  LayoutGrid, ArrowUpRight, ArrowDownRight, Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { useStore } from "@/context/StoreContext";
import { getAggregatedStoreStats } from "@/lib/store-management";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AggregatedAnalyticsPage() {
  const { user } = useUser();
  const { stores } = useStore();
  const router = useRouter();
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setIsLoading(true);
      const data = await getAggregatedStoreStats(user.uid);
      setBenchmarks(data);
      setIsLoading(false);
    }
    load();
  }, [user]);

  // Chart data: Store vs Store Revenue
  const chartData = benchmarks.map(b => ({
    name: b.store.name,
    revenue: Math.round(b.dailyRevenue),
    health: Math.round(b.healthScore),
  }));

  return (
    <AppShell>
      <header className="mb-10 flex items-center gap-6">
        <button onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
           <ChevronLeft className="w-6 h-6 text-zinc-400" />
        </button>
        <div>
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Enterprise Portfolio</p>
           <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Aggregated Analytics</h1>
        </div>
      </header>

      <div className="space-y-12 pb-32">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="premium-card bg-zinc-900/40 p-10 border-white/5">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Portfolio Footprint</p>
              <div className="flex items-end justify-between">
                 <h2 className="text-5xl font-black text-white">{stores.length}</h2>
                 <p className="text-xs font-bold text-emerald-500 uppercase mb-2">Active Locations</p>
              </div>
           </Card>
           <Card className="premium-card bg-emerald-500 p-10 border-none shadow-2xl shadow-emerald-500/10">
              <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-4">Combined Daily Inflow</p>
              <div className="flex items-end justify-between">
                 <h2 className="text-5xl font-black text-black">₹{chartData.reduce((s, b) => s + b.revenue, 0).toLocaleString()}</h2>
                 <p className="text-xs font-bold text-black/60 uppercase mb-2">+12.4% vs LW</p>
              </div>
           </Card>
           <Card className="premium-card bg-indigo-600 p-10 border-none shadow-2xl shadow-indigo-600/10">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Enterprise Credit score</p>
              <div className="flex items-end justify-between">
                 <h2 className="text-5xl font-black text-white">786</h2>
                 <p className="text-xs font-bold text-white/60 uppercase mb-2">Prime Plus</p>
              </div>
           </Card>
        </div>

        {/* Benchmarking Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <Card className="lg:col-span-8 premium-card bg-zinc-950/40 border-white/5 p-10 overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Revenue Benchmark (Individual Entities)</h3>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-emerald-500" />
                       <span className="text-[9px] font-black text-zinc-400 uppercase">Daily Sales</span>
                    </div>
                 </div>
              </div>
              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                       <XAxis 
                         dataKey="name" 
                         stroke="#52525b" 
                         fontSize={10} 
                         fontWeight="bold" 
                         axisLine={false} 
                         tickLine={false} 
                       />
                       <YAxis 
                         stroke="#52525b" 
                         fontSize={10} 
                         fontWeight="bold" 
                         axisLine={false} 
                         tickLine={false}
                         tickFormatter={(v) => `₹${v/1000}k`}
                       />
                       <Tooltip 
                         cursor={{fill: '#18181b'}}
                         contentStyle={{backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px'}}
                         itemStyle={{color: '#10b981', fontWeight: 'bold'}}
                       />
                       <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* Health Stats */}
           <Card className="lg:col-span-4 premium-card bg-zinc-900/20 border-white/5 p-10 flex flex-col items-center justify-center relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <TrendingUp className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="text-center space-y-4">
                 <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Portfolio Health Avg</h4>
                 <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                       <circle cx="80" cy="80" r="70" fill="transparent" stroke="#18181b" strokeWidth="10" />
                       <circle 
                         cx="80" cy="80" r="70" 
                         fill="transparent" 
                         stroke="#10b981" 
                         strokeWidth="10" 
                         strokeDasharray={440} 
                         strokeDashoffset={440 - (440 * 82 / 100)} 
                         strokeLinecap="round" 
                       />
                    </svg>
                    <span className="absolute text-5xl font-black text-white">82%</span>
                 </div>
                 <p className="text-[11px] font-bold text-zinc-500 leading-relaxed max-w-[200px] mx-auto">
                    Your South Extension branch is driving 40% of your total revenue. Excellent cross-store stability.
                 </p>
              </div>
           </Card>
        </div>

        {/* Individual Store Breakdown Cards */}
        <section className="space-y-6">
           <h3 className="text-2xl font-black text-white ml-2">Location Health Index</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benchmarks.map((b, i) => (
                <Card key={i} className="premium-card bg-zinc-950 border-white/5 p-8 group hover:border-emerald-500/20 transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center">
                         <Store className="w-6 h-6 text-zinc-500" />
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        b.weeklyGrowth > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                         {b.weeklyGrowth > 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                         {Math.abs(Math.round(b.weeklyGrowth))}%
                      </div>
                   </div>
                   <h4 className="text-lg font-black text-white tracking-tight truncate">{b.store.name}</h4>
                   <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{b.store.location}</p>
                   
                   <div className="mt-8 space-y-4">
                      <div className="flex justify-between items-baseline">
                         <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Efficiency</span>
                         <span className="text-sm font-black text-zinc-400">{Math.round(b.healthScore)}%</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${b.healthScore}%` }} />
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </section>
      </div>
    </AppShell>
  );
}
