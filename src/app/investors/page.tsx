"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Users, DollarSign, Target, 
  Rocket, Shield, Globe, Zap, BarChart3,
  CheckCircle2, Clock, ArrowUpRight, Building2,
  CreditCard, Smartphone, Landmark, FileText,
  PieChart, Activity, ArrowRight, Download
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function InvestorHubPage() {
  const [activePhase, setActivePhase] = useState(1);

  const companyMetrics = {
    totalMerchants: "50,000+",
    monthlyTransactions: "₹2.5Cr",
    avgCreditScore: 742,
    loanDisbursed: "₹15Cr",
    growthRate: "340%",
    activeCities: 25
  };

  const roadmapPhases = [
    {
      id: 1,
      phase: "Phase 1",
      title: "Foundation & Core Platform",
      status: "completed",
      timeline: "Q1-Q2 2024",
      description: "Built the core credit infrastructure with UPI transaction tracking, credit scoring engine, and merchant dashboard.",
      achievements: [
        "Real-time transaction recording",
        "Automated credit score calculation",
        "Merchant onboarding & KYC",
        "Basic analytics dashboard",
        "Secure payment vault"
      ],
      metrics: { merchants: "10,000", transactions: "₹50L" }
    },
    {
      id: 2,
      phase: "Phase 2",
      title: "AI-Powered Insights",
      status: "completed",
      timeline: "Q3-Q4 2024",
      description: "Integrated Genkit AI for business intelligence, automated credit recommendations, and performance analytics.",
      achievements: [
        "AI business performance insights",
        "Credit score improvement recommendations",
        "Smart expense categorization",
        "Predictive cash flow analysis",
        "Genkit-powered reporting"
      ],
      metrics: { merchants: "25,000", transactions: "₹1.5Cr" }
    },
    {
      id: 3,
      phase: "Phase 3",
      title: "Advanced Financial Products",
      status: "in_progress",
      timeline: "Q1-Q2 2025",
      description: "Launch comprehensive lending marketplace, enhanced credit products, and merchant capital solutions.",
      achievements: [
        "NBFC/Lender API integration",
        "Credit marketplace launch",
        "Working capital loans",
        "Emergency credit lines",
        "Inventory financing"
      ],
      metrics: { merchants: "50,000", transactions: "₹2.5Cr" }
    },
    {
      id: 4,
      phase: "Phase 4",
      title: "Enterprise & Scale",
      status: "planned",
      timeline: "Q3-Q4 2025",
      description: "Multi-store aggregation for enterprise merchants, advanced treasury management, and corporate solutions.",
      achievements: [
        "Enterprise multi-store dashboard",
        "Franchise management tools",
        "Chain-wide analytics",
        "Corporate credit lines",
        "API platform for partners"
      ],
      metrics: { merchants: "100,000", transactions: "₹5Cr" }
    },
    {
      id: 5,
      phase: "Phase 5",
      title: "Full-Stack FinTech",
      status: "planned",
      timeline: "2026",
      description: "Complete financial ecosystem with tax automation, insurance, investments, and neobanking features.",
      achievements: [
        "Automated GST filing",
        "Merchant insurance products",
        "Investment platform",
        "Business neobank accounts",
        "Cross-border payments"
      ],
      metrics: { merchants: "250,000", transactions: "₹15Cr" }
    }
  ];

  const keyHighlights = [
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "PCI-DSS compliant, end-to-end encryption, and multi-factor authentication",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: Zap,
      title: "Real-Time Processing",
      description: "Sub-second transaction processing with 99.9% uptime SLA",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      icon: Users,
      title: "Growing Network",
      description: "50,000+ merchants across 25 cities with 340% YoY growth",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      icon: CreditCard,
      title: "Integrated Lending",
      description: "₹15Cr+ disbursed through partner NBFCs with 95% repayment rate",
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    }
  ];

  const financialProjections = [
    { year: "2024", revenue: "₹2.4Cr", merchants: "50,000", valuation: "$5M" },
    { year: "2025", revenue: "₹12Cr", merchants: "150,000", valuation: "$25M" },
    { year: "2026", revenue: "₹45Cr", merchants: "500,000", valuation: "$100M" },
    { year: "2027", revenue: "₹150Cr", merchants: "1.5M", valuation: "$400M" }
  ];

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Investor Hub</h1>
            <p className="text-sm font-bold text-zinc-500 mt-2">Strategic roadmap & company insights</p>
          </div>
          <Button className="bg-emerald-500 text-black font-black text-sm uppercase tracking-widest gap-3">
            <Download className="w-4 h-4" />
            Pitch Deck
          </Button>
        </div>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* Company Metrics */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-500" />
            Key Metrics
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(companyMetrics).map(([key, value]) => (
              <Card key={key} className="premium-card bg-zinc-900 border-white/5 p-6">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-3xl font-black text-white">{value}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Strategic Roadmap */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-500" />
            Strategic Roadmap
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Phase Navigator */}
            <div className="lg:col-span-4 space-y-4">
              {roadmapPhases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={cn(
                    "w-full p-6 rounded-2xl border text-left transition-all",
                    activePhase === phase.id
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {phase.phase}
                    </span>
                    <Badge className={cn(
                      "text-[10px] font-black uppercase",
                      phase.status === 'completed' ? "bg-emerald-500 text-black" :
                      phase.status === 'in_progress' ? "bg-amber-500 text-black" :
                      "bg-zinc-700 text-zinc-400"
                    )}>
                      {phase.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-black text-sm">{phase.title}</p>
                </button>
              ))}
            </div>

            {/* Phase Details */}
            <div className="lg:col-span-8">
              {roadmapPhases.map((phase) => (
                activePhase === phase.id && (
                  <Card key={phase.id} className="premium-card bg-zinc-900 border-white/5 p-8 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-2xl font-black text-white">{phase.title}</h4>
                        <p className="text-sm font-bold text-zinc-500 mt-1">{phase.timeline}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Target Metrics</p>
                        <p className="text-lg font-black text-emerald-500">{phase.metrics.merchants} merchants</p>
                        <p className="text-sm font-black text-zinc-400">{phase.metrics.transactions}/mo</p>
                      </div>
                    </div>

                    <p className="text-zinc-400 mb-8 leading-relaxed">{phase.description}</p>

                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Key Achievements</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {phase.achievements.map((achievement, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 bg-zinc-950 border border-white/5 rounded-xl">
                            <CheckCircle2 className={cn(
                              "w-5 h-5 shrink-0",
                              phase.status === 'completed' ? "text-emerald-500" :
                              phase.status === 'in_progress' ? "text-amber-500" :
                              "text-zinc-600"
                            )} />
                            <span className="text-sm font-bold text-white">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )
              ))}
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500" />
            Platform Highlights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {keyHighlights.map((highlight) => (
              <Card key={highlight.title} className="premium-card bg-zinc-900 border-white/5 p-8">
                <div className="flex items-start gap-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", highlight.bg)}>
                    <highlight.icon className={cn("w-7 h-7", highlight.color)} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white mb-2">{highlight.title}</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{highlight.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Financial Projections */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-rose-500" />
            Financial Projections
          </h3>
          
          <Card className="premium-card bg-zinc-900 border-white/5 p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Year</th>
                    <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Revenue</th>
                    <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Merchants</th>
                    <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Valuation</th>
                    <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {financialProjections.map((projection, idx) => (
                    <tr key={projection.year} className="border-b border-white/5 last:border-0">
                      <td className="py-6 px-4 font-black text-white">{projection.year}</td>
                      <td className="py-6 px-4 font-black text-emerald-500">{projection.revenue}</td>
                      <td className="py-6 px-4 font-black text-indigo-500">{projection.merchants}</td>
                      <td className="py-6 px-4 font-black text-amber-500">{projection.valuation}</td>
                      <td className="py-6 px-4">
                        {idx > 0 && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            {Math.round(((parseFloat(projection.revenue.replace(/[₹Cr]/g, '')) / parseFloat(financialProjections[idx-1].revenue.replace(/[₹Cr]/g, ''))) - 1) * 100)}%
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Investment Opportunity */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Investment Opportunity
          </h3>
          
          <Card className="premium-card bg-gradient-to-br from-emerald-600/20 to-indigo-600/10 border-emerald-500/20 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h4 className="text-2xl font-black text-white mb-4">Join the Mission</h4>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  CrediPay is revolutionizing access to credit for India's 63 million MSMEs. 
                  With our AI-powered platform, we're democratizing financial services for 
                  merchants who have been traditionally underserved by legacy banking.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-white">₹25 trillion MSME credit gap in India</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-white">95% merchant repayment rate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-white">340% YoY growth trajectory</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Current Round</p>
                  <p className="text-2xl font-black text-white">Series A</p>
                  <p className="text-sm text-zinc-400">Raising $5M</p>
                </div>
                
                <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Pre-Money Valuation</p>
                  <p className="text-2xl font-black text-emerald-500">$20M</p>
                  <p className="text-sm text-zinc-400">Post: $25M</p>
                </div>
                
                <Button className="w-full h-16 rounded-2xl bg-emerald-500 text-black font-black text-lg uppercase tracking-widest gap-3 hover:bg-emerald-400 transition-all">
                  Request Investment Deck
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </section>

      </div>
    </AppShell>
  );
}
