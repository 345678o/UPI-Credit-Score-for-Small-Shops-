
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShieldCheck, ArrowUpRight, ChevronRight, Info, 
  History, Calendar, IndianRupee, Zap, Clock, CheckCircle2,
  Sparkles, Target, Activity
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { creditScoreImprovementRecommendations } from "@/ai/flows/credit-score-improvement-recommendations";
import { doc, getFirestore, collection, query, orderBy, limit } from "firebase/firestore";

export default function CreditPage() {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(true);
  
  const db = getFirestore();

  // 1. Merchant Profile & Score
  const userRef = useMemoFirebase(() => user ? doc(db, "users", user.uid) : null, [user]);
  const { data: merchant, isLoading: isMerchantLoading } = useDoc(userRef);

  // 2. Summary for Score Breakdown
  const summaryRef = useMemoFirebase(() => user ? doc(db, "users", user.uid, "userAnalyticsSummary", "current") : null, [user]);
  const { data: summary } = useDoc(summaryRef);

  // 3. Weekly Aggregates for Consistency Heuristic
  const weeklyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "users", user.uid, "dailyBusinessAggregates"), orderBy("date", "desc"), limit(7));
  }, [user]);
  const { data: weeklyData } = useCollection(weeklyQuery);

  // 4. Loan History
  const historyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "users", user.uid, "loanApplications"), orderBy("appliedAt", "desc"), limit(5));
  }, [user]);
  const { data: loanHistory, isLoading: isHistoryLoading } = useCollection(historyQuery);

  useEffect(() => {
    async function loadRecs() {
      if (!merchant || !summary) return;
      setIsAiLoading(true);
      try {
        const income = summary?.totalEarningsOverall || 0;
        const expenses = summary?.totalExpensesOverall || 0;
        const result = await creditScoreImprovementRecommendations({
          currentCreditScore: merchant.creditScore || 742,
          transactionVolume: income,
          netIncome: income - expenses,
          expenseStability: 85,
          paymentConsistency: 95, 
          revenueGrowth: 15,
        });
        setRecommendations(result.recommendations || []);
      } catch (e) {
        setRecommendations([
          { title: "Accept more digital payments", description: "Convert cash sales to digital to build your verifiable revenue history." },
          { title: "Consistent daily volume", description: "Regular daily transactions are better than large, irregular spikes." }
        ]);
      } finally {
        setIsAiLoading(false);
      }
    }
    loadRecs();
  }, [merchant, summary]);

  // Backend Heuristics for Score Breakdown
  const daysWithTxns = weeklyData?.filter((d: any) => d.transactionCount > 0).length || 0;
  const consistencyScore = Math.round((daysWithTxns / 7) * 100);
  
  const turnoverScore = Math.min(100, Math.floor((summary?.totalEarningsOverall || 0) / 1000));
  const volumeScore = Math.min(100, (summary?.totalTransactionsCount || 0) * 2);
  
  const createdAt = merchant?.createdAt?.toDate ? merchant.createdAt.toDate() : new Date();
  const ageDays = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
  const ageScore = Math.min(100, ageDays * 5); // 20 days = 100%

  const breakdown = [
    { label: "Payment Consistency", value: consistencyScore || 10, color: "bg-emerald-500" },
    { label: "Monthly Turnover", value: turnoverScore || 15, color: "bg-indigo-500" },
    { label: "Account Age", value: ageScore || 5, color: "bg-indigo-500" },
    { label: "Transaction Volume", value: volumeScore || 8, color: "bg-emerald-500" },
  ];

  const score = merchant?.creditScore || 742;
  const readinessPercentage = Math.round(Math.min(100, ((score - 300) / (900 - 300)) * 100));

  const eligibleAmount = merchant?.loanEligibleAmount || (score > 500 ? 50000 : 0);

  const loanOffers = [
    { 
      type: "Working Capital Loan", 
      badge: "In-Review", 
      amount: `₹${(eligibleAmount * 5).toLocaleString()}`, 
      rate: "1.5% / month", 
      tenure: "12 months", 
      emi: `₹${Math.round((eligibleAmount * 5 * 1.15)/12).toLocaleString()}`,
      primary: true,
      eligible: eligibleAmount > 0
    },
    { 
      type: "Short-Term Loan", 
      badge: "Eligible", 
      amount: `₹${eligibleAmount.toLocaleString()}`, 
      rate: "1.2% / month", 
      tenure: "6 months", 
      emi: `₹${Math.round((eligibleAmount * 1.08)/6).toLocaleString()}`,
      primary: false,
      eligible: eligibleAmount > 0
    },
    { 
      type: "Emergency Credit", 
      badge: "Instant", 
      amount: "₹25,000", 
      rate: "1.8% / month", 
      tenure: "3 months", 
      emi: "₹8,833",
      primary: false,
      eligible: score > 400
    },
  ];

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14">
        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Loans & Credit</h1>
        <p className="text-sm font-bold text-zinc-500 mt-2">Strategic capital infrastructure powered by your transaction history.</p>
      </header>

      <div className="space-y-12 pb-32">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-4">
             <Card className="premium-card bg-zinc-900 border-white/5 p-8 lg:p-12 h-full flex flex-col items-center">
                <p className="text-sm font-black text-white uppercase tracking-widest mb-10 w-full text-center lg:text-left">Your Credit Score</p>
                <div className="relative w-56 h-56 flex items-center justify-center">
                   <svg className="w-full h-full -rotate-90">
                      <circle cx="112" cy="112" r="100" fill="transparent" stroke="#18181b" strokeWidth="12" />
                      <circle cx="112" cy="112" r="100" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray={628} strokeDashoffset={628 - (628 * readinessPercentage / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out shadow-[0_0_20px_#10b981]" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-7xl font-black text-white tracking-tighter tabular-nums">{score}</span>
                      <span className="text-zinc-600 font-bold text-xs uppercase tracking-widest mt-1">/ 900</span>
                   </div>
                </div>
                <div className="mt-12 text-center space-y-4 w-full px-4">
                   <div className="flex items-center gap-2 justify-center">
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verifiable Trust Engine Active</span>
                   </div>
                   <div className="w-full h-1.5 bg-zinc-800 rounded-full relative overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-0 bg-emerald-500 transition-all duration-1000" style={{ width: `${readinessPercentage}%` }} />
                   </div>
                </div>
             </Card>
          </div>

          <div className="lg:col-span-8">
             <Card className="premium-card bg-zinc-900 border-white/5 p-8 lg:p-12 h-full relative overflow-hidden">
                <h3 className="text-xl font-black text-white tracking-tight mb-12">Score Breakdown</h3>
                <div className="space-y-10">
                   {breakdown.map((item, i) => (
                     <div key={i} className="space-y-4">
                        <div className="flex justify-between items-baseline">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</span>
                           <span className="text-xs font-black text-white tabular-nums">{item.value}/100</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                           <div className={cn("h-full rounded-full transition-all duration-1000 shadow-md", item.color)} style={{ width: `${item.value}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-12 p-6 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[1.5rem] flex items-start gap-4">
                   <Info className="w-5 h-5 text-emerald-500 shrink-0" />
                   <p className="text-[11px] font-bold text-zinc-500 leading-relaxed italic">
                      SYSTEM CAPTION: Your Account Age is currently at {ageScore}%. Continue digital auditing for {Math.max(0, 20 - ageDays)} more days to maximize this score pillar.
                   </p>
                </div>
             </Card>
          </div>
        </div>

        <section className="space-y-8">
           <div className="flex items-center justify-between">
             <h3 className="text-2xl font-black text-white">Available Loan Offers</h3>
             <Link href="/credit/marketplace">
               <Button variant="outline" className="border-white/10 bg-zinc-900/50 text-white hover:bg-zinc-800">
                 Explore Marketplace <ChevronRight className="w-4 h-4 ml-2" />
               </Button>
             </Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {loanOffers.map((offer, i) => (
                <Card key={i} className={cn("premium-card p-8 lg:p-10 border transition-all hover:scale-[1.02] flex flex-col", offer.primary ? "bg-indigo-600 border-indigo-500/50 text-white shadow-2xl shadow-indigo-600/20" : "bg-zinc-900 border-white/5 text-zinc-400")}>
                   <div className="flex justify-between items-start mb-10">
                      <h4 className="text-lg font-black tracking-tight text-white max-w-[120px]">{offer.type}</h4>
                      <div className={cn("px-3 py-1 rounded-full", offer.primary ? "bg-black/20" : "bg-emerald-500/10")}>
                         <span className={cn("text-[9px] font-black uppercase tracking-widest", offer.primary ? "text-white" : "text-emerald-500")}>{offer.badge}</span>
                      </div>
                   </div>
                   <div className="space-y-10 mt-auto">
                      <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter tabular-nums">{offer.amount}</h3>
                      <div className="space-y-4">
                         <div className="flex justify-between text-[11px] font-bold"><span>Rate</span><span className="text-white">{offer.rate}</span></div>
                         <div className="flex justify-between text-[11px] font-bold"><span>Tenure</span><span className="text-white">{offer.tenure}</span></div>
                         <div className="flex justify-between text-[11px] font-bold"><span>EMI</span><span className="text-white font-black">{offer.emi}</span></div>
                      </div>
                      <Button className={cn("w-full h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-widest gap-3 transition-all", offer.primary ? "bg-white text-indigo-600 shadow-xl" : "bg-indigo-600 text-white hover:bg-indigo-500")} asChild={offer.eligible} disabled={!offer.eligible}>
                         {offer.eligible ? <Link href="/credit/apply">Apply Now <ChevronRight className="w-5 h-5" /></Link> : <span>Minimum Hub Activity Required</span>}
                      </Button>
                   </div>
                </Card>
              ))}
           </div>
        </section>

        <section className="space-y-8">
           <div className="flex items-center gap-4">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <h3 className="text-2xl font-black text-white">Trust Engine Intelligence</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isAiLoading ? (
                 [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2.5rem] bg-zinc-900" />)
              ) : recommendations.map((rec, i) => (
                <Card key={i} className="premium-card bg-zinc-950 border-white/5 p-8 flex gap-6 items-start">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-emerald-500" />
                   </div>
                   <div>
                      <h4 className="font-black text-white text-sm mb-2">{rec.title}</h4>
                      <p className="text-[11px] font-bold text-zinc-500 leading-relaxed italic">{rec.description}</p>
                   </div>
                </Card>
              ))}
           </div>
        </section>

        <section className="space-y-8">
           <h3 className="text-2xl font-black text-white">Settlement History</h3>
           <Card className="premium-card bg-zinc-900 border-white/5 p-8 lg:p-12">
              <div className="space-y-4">
                 {isHistoryLoading ? (
                    <Skeleton className="h-40 w-full bg-zinc-800 rounded-3xl" />
                 ) : loanHistory && loanHistory.length > 0 ? (
                    loanHistory.map((loan: any) => (
                       <div key={loan.id} className="flex items-center justify-between p-6 lg:p-8 bg-black/20 rounded-[2rem] border border-white/5 hover:bg-black/40 transition-all">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                             <div>
                                <p className="text-lg font-black text-white tracking-tight">Working Capital Injection</p>
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Disbursed on {loan.appliedAt?.toDate ? loan.appliedAt.toDate().toLocaleDateString() : "Just Now"}</p>
                             </div>
                          </div>
                          <p className="text-xl font-black text-white tabular-nums tracking-tighter">₹{(loan.requestedAmount || 25000).toLocaleString()}</p>
                       </div>
                    ))
                 ) : (
                    <div className="py-20 text-center opacity-30"><p className="text-caption font-black tracking-[0.3em]">No Historical Settlements Found</p></div>
                 )}
              </div>
           </Card>
        </section>

      </div>
    </AppShell>
  );
}
