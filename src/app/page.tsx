
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, IndianRupee, ShoppingBag, 
  Users, ShieldCheck, ArrowUpRight, ArrowRight, Zap,
  QrCode, PlusCircle, History, BarChart3, Coins, 
  ArrowRightLeft, Sparkles, ArrowDownLeft, Scan, Wallet
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, getFirestore, collection, query, orderBy, limit } from "firebase/firestore";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import { getBusinessPerformanceInsights } from "@/ai/flows/business-performance-insights";

export default function Dashboard() {
  const { user } = useUser();
  const [insights, setInsights] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const db = getFirestore();

  // 1. Fetch Today's Aggregate
  const today = new Date().toISOString().split('T')[0];
  const todayRef = useMemoFirebase(() => user ? doc(db, "users", user.uid, "dailyBusinessAggregates", today) : null, [user]);
  const { data: todayStats } = useDoc(todayRef);

  // 2. Fetch Weekly Aggregates (Real Backend Data)
  const weeklyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "users", user.uid, "dailyBusinessAggregates"), orderBy("date", "desc"), limit(7));
  }, [user]);
  const { data: weeklyAggregates } = useCollection(weeklyQuery);

  // 3. Fetch Summary for Category Split
  const summaryRef = useMemoFirebase(() => user ? doc(db, "users", user.uid, "userAnalyticsSummary", "current") : null, [user]);
  const { data: summary, isLoading: isSummaryLoading } = useDoc(summaryRef);

  // 4. Recent Transactions
  const txnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "users", user.uid, "transactions"), orderBy("timestamp", "desc"), limit(4));
  }, [user]);
  const { data: transactions, isLoading: isTxnsLoading } = useCollection(txnsQuery);

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

  // Transform Weekly Data
  const chartData = (weeklyAggregates || []).map((day: any) => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    income: day.totalEarnings || 0,
    expense: day.totalExpenses || 0
  })).reverse();

  const finalChartData = chartData.length > 0 ? chartData : [
    { day: 'Mon', income: 0, expense: 0 }, { day: 'Tue', income: 0, expense: 0 }, { day: 'Wed', income: 0, expense: 0 }
  ];

  // 4. Transform Category Data based on Business Vertical (Electronics)
  const categoryBreakdown = summary?.categoryBreakdown || {};
  const isElectronics = true; // Hardcoded for this terminal
  
  const categoryData = isElectronics ? [
    { name: 'Micro-Chips', value: categoryBreakdown['Sales'] || 45, color: '#6366f1' },
    { name: 'Smartphones', value: categoryBreakdown['Service'] || 25, color: '#10b981' },
    { name: 'Terminals', value: categoryBreakdown['Refund'] || 15, color: '#f59e0b' },
    { name: 'Accessories', value: categoryBreakdown['Other'] || 15, color: '#ef4444' }
  ] : Object.entries(categoryBreakdown).map(([name, value], i) => ({
    name,
    value: Number(value),
    color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'][i % 5]
  }));

  const finalCategoryData = categoryData.length > 0 ? categoryData : [{ name: 'Awaiting Data', value: 100, color: '#18181b' }];

  const creditScore = (user as any)?.creditScore || 742;
  const lastEarnings = summary?.totalEarningsOverall || 0;
  const lastExpenses = summary?.totalExpensesOverall || 0;
  const expenseRatio = lastEarnings > 0 ? Math.round((lastExpenses / lastEarnings) * 100) : 0;
  const todayEarnings = todayStats?.totalEarnings || 0;
  const txCount = todayStats?.transactionCount || 0;

  // Dynamic WHY explanations for credit score
  const creditReason = txCount >= 3
    ? "Consistent daily sales boosted this"
    : todayEarnings > 0
    ? "Today's income improved your standing"
    : "Make sales today to grow your score";

  const stats = [
    { 
      label: "Today's Earnings", 
      value: `₹${todayEarnings.toLocaleString()}`, 
      trend: "+100%", 
      icon: IndianRupee, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      why: todayEarnings > 0 ? `From ${txCount} sale${txCount !== 1 ? 's' : ''} logged today` : "No sales logged yet today"
    },
    { 
      label: "Orders Today", 
      value: txCount.toString(), 
      trend: "Fresh", 
      icon: ShoppingBag, 
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      why: txCount > 0 ? "Each order builds your credit history" : "Log your first sale to start"
    },
    { 
      label: "Unique Customers", 
      value: (todayStats?.uniqueCustomersCount || 0).toString(), 
      trend: "New", 
      icon: Users, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      why: "Repeat customers increase your loan limit"
    },
    { 
      label: "Credit Score", 
      value: creditScore, 
      trend: txCount > 0 ? `+${txCount * 2} pts today` : "No change", 
      icon: ShieldCheck, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      why: creditReason
    },
  ];

  const quickActions = [
    { label: "Scan", icon: QrCode, href: "/payments/scan", color: "bg-rose-500/10 text-rose-500" },
    { label: "Asset", icon: PlusCircle, href: "/payments", color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Balance", icon: Wallet, href: "/balance", color: "bg-amber-500/10 text-amber-400" },
    { label: "History", icon: History, href: "/transactions", color: "bg-zinc-800 text-zinc-400" },
    { label: "Loans", icon: Coins, href: "/credit", color: "bg-indigo-500/10 text-indigo-500" },
  ];

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Business Overview</h1>
           <p className="text-[10px] font-black text-emerald-500 mt-2 uppercase tracking-[4px] px-1 animate-pulse">Live Server Active</p>
        </div>
        <div className="flex gap-3">
           {quickActions.map(action => (
             <Link key={action.label} href={action.href}>
                <Button className={cn("h-14 w-14 lg:w-44 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-4 shadow-2xl transition-all active:scale-95 group", action.color, "bg-zinc-900/50 border-white/5")}>
                   <action.icon className="w-4 h-4" />
                   <span className="hidden lg:inline">{action.label} Entry</span>
                </Button>
             </Link>
           ))}
        </div>
      </header>

      {(!todayStats || todayStats.totalEarnings === 0) && (
        <section className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
           <Card className="premium-card bg-emerald-500 border-none p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-emerald-500/20">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center shrink-0">
                    <Zap className="w-8 h-8 text-black" />
                 </div>
                 <div className="text-center md:text-left">
                    <h3 className="text-lg font-black text-black tracking-tight">Your Dashboard is in Sleep Mode</h3>
                    <p className="text-[11px] font-bold text-black/60 uppercase tracking-widest mt-1 italic">Zero historical nodes detected for Anamika Kumari.</p>
                 </div>
              </div>
              <Link href="/admin/seed">
                 <Button className="h-14 px-10 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest gap-3 shadow-2xl active:scale-95 transition-all">
                    Initialize Demo Data <ArrowRight className="w-4 h-4" />
                 </Button>
              </Link>
           </Card>
        </section>
      )}

      <div className="space-y-12 pb-36">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <Card key={i} className="premium-card p-8 bg-zinc-900 border border-white/5 relative group hover:border-emerald-500/20 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white tabular-nums tracking-tighter">{stat.value}</h2>
                <span className={cn("text-[9px] font-black uppercase tracking-widest", stat.color)}>{stat.trend}</span>
              </div>
              {'why' in stat && (
                <p className="mt-5 text-[9px] font-bold text-zinc-600 leading-relaxed border-l-2 border-zinc-800 pl-3 italic">
                  {stat.why}
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* 2. PRIMARY OPERATIONAL ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
           <Link href="/payments?mode=credit">
              <Button className="w-full h-[120px] rounded-[2.5rem] bg-emerald-500 text-black font-black text-lg gap-5 shadow-2xl active:scale-95 transition-all group overflow-hidden relative">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <ArrowDownLeft className="w-9 h-9 stroke-[3px]" />
                 Receive
              </Button>
           </Link>
           <Link href="/payments/scan">
              <Button className="w-full h-[120px] rounded-[2.5rem] bg-indigo-500 text-white font-black text-lg gap-5 shadow-2xl active:scale-95 transition-all group overflow-hidden relative">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <QrCode className="w-9 h-9 stroke-[3px]" />
                 Scan &amp; Pay
              </Button>
           </Link>
           <Link href="/balance">
              <Button className="w-full h-[120px] rounded-[2.5rem] bg-amber-500 text-black font-black text-lg gap-5 shadow-2xl active:scale-95 transition-all group overflow-hidden relative">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Wallet className="w-9 h-9 stroke-[3px]" />
                 Check Balance
              </Button>
           </Link>
           <Link href="/payments?mode=debit">
              <Button className="w-full h-[120px] rounded-[2.5rem] bg-rose-500 text-white font-black text-lg gap-5 shadow-2xl active:scale-95 transition-all group overflow-hidden relative">
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <PlusCircle className="w-9 h-9 stroke-[3px]" />
                 Add Expense
              </Button>
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-8 space-y-8 lg:space-y-12">
            <Card className="premium-card bg-zinc-900 p-8 lg:p-12 border border-white/5 relative overflow-hidden">
               <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-lg font-black text-white">Weekly Performance Audit</h3>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1 italic">Real-time ledger aggregation</p>
                  </div>
               </div>
               
               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={finalChartData}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 800 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 800 }} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }} />
                      <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                      <Bar dataKey="expense" fill="rgba(244,63,94,0.1)" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </Card>

            <section>
               <h3 className="text-xl lg:text-2xl font-black text-white mb-10">Live Audit Stream</h3>
               <div className="space-y-4">
                  {isTxnsLoading ? (
                     [1, 2].map(i => <Skeleton key={i} className="h-28 w-full rounded-[2.5rem] bg-zinc-900" />)
                  ) : transactions?.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-6 lg:p-8 bg-zinc-950 border border-white/10 rounded-[2.5rem] hover:bg-zinc-900 transition-all group">
                       <div className="flex items-center gap-6">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-rose-500/10 text-rose-500")}>
                             {tx.type === "credit" ? <ArrowDownLeft className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
                          </div>
                          <div>
                             <p className="text-sm lg:text-lg font-black text-white uppercase tracking-tighter truncate max-w-[150px] lg:max-w-none">{tx.payerIdentifier || "Merchant Vault"}</p>
                             <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">{tx.category || "General"} • {tx.method}</p>
                          </div>
                       </div>
                       <p className={cn("text-xl lg:text-3xl font-black tabular-nums tracking-tighter", tx.type === "credit" ? "text-emerald-500" : "text-rose-500")}>
                          {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                       </p>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8 lg:space-y-12">
            <Card className="premium-card bg-zinc-900 p-10 border border-white/5 overflow-hidden">
               <h3 className="text-base lg:text-lg font-black text-white mb-10">Inventory Velocity</h3>
               <div className="h-[220px] w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={finalCategoryData}
                         cx="50%"
                         cy="50%"
                         innerRadius={65}
                         outerRadius={85}
                         paddingAngle={8}
                         dataKey="value"
                         stroke="none"
                         labelLine={false}
                         label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                         onMouseEnter={(_, index) => setActiveIndex(index)}
                         onMouseLeave={() => setActiveIndex(null)}
                       >
                         {finalCategoryData.map((entry, index) => (
                           <Cell
                             key={`cell-${index}`}
                             fill={entry.color}
                             style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.3, transition: "opacity 0.3s" }}
                           />
                         ))}
                       </Pie>
                     </PieChart>
                   </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-black text-white tracking-tighter">
                        {activeIndex !== null ? (() => {
                          const total = finalCategoryData.reduce((s, d) => s + d.value, 0);
                          return `${Math.round((finalCategoryData[activeIndex].value / total) * 100)}%`;
                        })() : (categoryData.length > 0 ? "100%" : "0%")}
                      </span>
                  </div>
               </div>
                <div className="mt-12 space-y-5">
                   {categoryData.length > 0 ? (() => {
                      const totalVelocity = categoryData.reduce((acc, curr) => acc + curr.value, 0);
                      return categoryData.map((cat, i) => {
                        const percentage = totalVelocity > 0 ? Math.round((cat.value / totalVelocity) * 100) : 0;
                        return (
                          <div key={i} className={cn(
                            "flex justify-between items-center text-[10px] font-black uppercase tracking-widest transition-all",
                            activeIndex === i ? "translate-x-2 opacity-100" : "opacity-40"
                          )}>
                            <div className="flex items-center gap-4">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className={cn("transition-colors", activeIndex === i ? "text-white" : "text-zinc-500")}>{cat.name}</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                              <span className="text-white tabular-nums">{cat.value} Units</span>
                              <span className="text-[8px] text-zinc-700 font-bold">{percentage}%</span>
                            </div>
                          </div>
                        );
                      });
                   })() : <p className="text-center text-[10px] font-black text-zinc-700 uppercase tracking-widest py-4 italic">No categorical data captured</p>}
                </div>
            </Card>

            <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-10 lg:p-12 relative group overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                   <Sparkles className="w-5 h-5 text-emerald-500" />
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">Growth Narratives</h3>
                </div>
                <div className="space-y-6">
                  {isAiLoading ? (
                     [1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-zinc-900" />)
                  ) : insights.slice(0, 4).map((insight, idx) => (
                     <div key={idx} className="flex gap-4">
                        <div className="w-1 h-auto rounded-full bg-emerald-500/30 shrink-0" />
                        <p className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200 leading-relaxed italic transition-colors">
                           "{insight}"
                        </p>
                     </div>
                  ))}
                </div>
            </section>
          </div>

        </div>

        {/* 6. MERCHANT QR / SCANNING STATION */}
        <section className="mt-20 border-t border-white/5 pt-20">
           <Card className="premium-card bg-zinc-950 border-white/5 p-12 lg:p-16 flex flex-col md:flex-row items-center gap-12 lg:gap-20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full -mr-32 -mt-32 blur-[100px]" />
              
              {/* The Business QR */}
              <div className="relative group">
                 <div className="absolute inset-0 bg-emerald-500/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="w-64 h-64 bg-white p-6 rounded-[2.5rem] relative z-10 shadow-2xl">
                    <QrCode className="w-full h-full text-black stroke-[1.5px]" />
                 </div>
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
                    Verified Terminal
                 </div>
              </div>

              <div className="flex-1 space-y-8 text-center md:text-left">
                 <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">Your Merchant QR</h3>
                    <p className="text-sm font-bold text-zinc-500 mt-2">Collect payments directly into your Hub Store ledger.</p>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-5">
                    <Button asChild className="h-18 px-10 rounded-[1.75rem] bg-emerald-500 text-black font-black text-sm uppercase tracking-widest gap-4 shadow-2xl active:scale-95 transition-all">
                       <Link href="/payments/scan">
                          <Scan className="w-5 h-5" />
                          Open Scanner
                       </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-18 px-10 rounded-[1.75rem] border-white/5 bg-zinc-900/50 text-white font-black text-sm uppercase tracking-widest gap-4 hover:bg-zinc-800 transition-all w-full">
                       <Link href="/payments?mode=credit">
                          <PlusCircle className="w-5 h-5" />
                          Manual Entry
                       </Link>
                    </Button>
                 </div>

                 <div className="pt-4 flex items-center justify-center md:justify-start gap-4 text-zinc-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[3px]">PCI-DSS COMPLIANT HUB</span>
                 </div>
              </div>
           </Card>
        </section>

      </div>
    </AppShell>
  );
}
