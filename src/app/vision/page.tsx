"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  IndianRupee,
  BarChart3,
  Target,
  Globe,
  Briefcase,
  Zap,
  Building,
  Presentation,
  FileText,
  X,
  Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { getFirestore, doc } from "firebase/firestore";
import { useTransactions, BASELINE_EARNINGS, BASELINE_CREDIT } from "@/context/TransactionContext";
import { TowerLoader } from "@/components/ui/TowerLoader";
import { Mail, Loader2 } from "lucide-react";
import { EmailService } from "@/lib/email-service";
import { toast } from "@/hooks/use-toast";

export default function VisionPage() {
  const { user } = useUser();
  const db = getFirestore();
  const userRef = useMemoFirebase(() => user ? doc(db, "users", user.uid) : null, [user]);
  const { data: userData } = useDoc(userRef);
  
  const { totalEarnings, creditScore: simulatedCreditScore, merchantsCount } = useTransactions();
  const [activeTab, setActiveTab] = useState<"traction" | "roadmap" | "pitch">("traction");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [targetEmail, setTargetEmail] = useState("24r21a67d2@mlrit.ac.in");
  const [isSharing, setIsSharing] = useState(false);

  const handleGeneratePitch = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPitch(true);
    }, 3500);
  };

  const handleShareByEmail = async () => {
    if (!targetEmail) return;
    setIsSharing(true);
    
    try {
      await EmailService.send({
        to: targetEmail,
        subject: `Investment Opportunity: ${userData?.businessName || 'Merchant'} Performance Proof`,
        body: `Hello, I am sharing the updated business traction and roadmap for ${userData?.businessName || 'my business'}...`,
        template: 'reward'
      });
      
      toast({
        title: "Proposal Transmitted",
        description: `Your investment memo has been securely sent to ${targetEmail}`,
      });
    } catch (e) {
      toast({
        title: "Transmission Error",
        description: "Institutional bridge failed to reach the recipient.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const businessName = userData?.businessName || "My Business";
  const finalScore = BASELINE_CREDIT + simulatedCreditScore;
  const earnings = BASELINE_EARNINGS + totalEarnings;
  const customers = 420 + merchantsCount; // Simulated customer base growth

  const milestones = [
    { label: "Stability", goal: "Current", status: "Achieved", desc: "Established digital ledger & verified trust score.", isDone: true },
    { label: "Modernization", goal: "Q3 2026", status: "Active", desc: "Implement AI-driven inventory and automated vendor payouts.", isDone: false },
    { label: "Expansion", goal: "2027", status: "Planning", desc: "Launch secondary branch in new municipality.", isDone: false },
    { label: "Institution", goal: "Vision", status: "Long Term", desc: "Scale to multi-state retail network.", isDone: false },
  ];

  return (
    <AppShell>
      <header className="mb-14 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 rounded-[2rem] bg-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <Presentation className="w-10 h-10 text-white" />
           </div>
           <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[5px] mb-2">Investor Vision Card</p>
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter italic">
                {businessName}'s <br className="md:hidden" /> Roadmap
              </h1>
           </div>
        </div>

        <div className="flex bg-zinc-900/50 p-1.5 rounded-[2rem] border border-white/5 backdrop-blur-xl">
           {["traction", "roadmap", "pitch"].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={cn(
                 "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                 activeTab === tab ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
               )}
             >
               {tab}
             </button>
           ))}
        </div>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* TAB 1: TRACTION (The User's Real Work) */}
        {activeTab === "traction" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="lg:col-span-8 space-y-8">
                <Card className="premium-card bg-zinc-950/40 p-10 lg:p-14 border-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp className="w-48 h-48 text-emerald-500" />
                   </div>
                   
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[4px] mb-12">Performance Proof</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                      <div>
                         <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Gross Digital Velocity</h4>
                         <div className="flex items-baseline gap-3">
                            <span className="text-6xl font-black text-white tracking-tighter tabular-nums">₹{(earnings/1000).toFixed(1)}k</span>
                            <span className="text-[10px] font-black text-emerald-500">↑ 12.4%</span>
                         </div>
                         <p className="text-xs font-medium text-zinc-600 mt-4 leading-relaxed">
                            Validated aggregate revenue processed through the CrediPay unified terminal in the last 180 days.
                         </p>
                      </div>
                      
                      <div>
                         <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Verified Trust Integrity</h4>
                         <div className="flex items-baseline gap-3">
                            <span className="text-6xl font-black text-indigo-400 tracking-tighter tabular-nums">{finalScore}</span>
                            <span className="text-[10px] font-black text-indigo-500">Tier: Prime</span>
                         </div>
                         <p className="text-xs font-medium text-zinc-600 mt-4 leading-relaxed">
                            Proprietary CrediPay Credit Score reflects strong repayment consistency and digital financial maturity.
                         </p>
                      </div>
                   </div>
                   
                   <div className="mt-16 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div>
                         <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-2">Daily Stability</p>
                         <p className="text-xl font-black text-zinc-300">92%</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-2">Repeat Customers</p>
                         <p className="text-xl font-black text-zinc-300">64%</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-2">Network Reach</p>
                         <p className="text-xl font-black text-zinc-300">{customers}+</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-2">Risk Rating</p>
                         <p className="text-xl font-black text-emerald-500 italic">Ultra Low</p>
                      </div>
                   </div>
                </Card>
             </div>

             <div className="lg:col-span-4 space-y-8">
                <Card className="premium-card bg-emerald-500 p-10 flex flex-col justify-between h-full border-none shadow-2xl shadow-emerald-500/20">
                   <div>
                      <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center mb-10">
                         <Sparkles className="w-7 h-7 text-black" />
                      </div>
                      <h3 className="text-3xl font-black text-black tracking-tighter italic leading-none mb-6">
                        Investor Readiness Grade
                      </h3>
                      <p className="text-sm font-black text-black/60 leading-relaxed uppercase tracking-widest">
                        Based on your real-time performance, you are categorized as an <span className="underline decoration-black decoration-2 underline-offset-4">Elite Growth Entity</span>.
                      </p>
                   </div>
                   
                   <div className="mt-12 space-y-6">
                      <div className="flex justify-between items-center text-[10px] font-black text-black/40 uppercase">
                         <span>Alpha Potential</span>
                         <span>98th Percentile</span>
                      </div>
                      <Button 
                        onClick={handleGeneratePitch}
                        className="w-full h-16 rounded-[1.5rem] bg-black text-white font-black text-xs uppercase tracking-[4px] gap-3"
                      >
                         Generate Digital Pitch
                         <FileText className="w-4 h-4" />
                      </Button>
                   </div>
                </Card>
             </div>
          </div>
        )}

        {/* TAB 2: ROADMAP (The User's Future Work) */}
        {activeTab === "roadmap" && (
          <div className="animate-in fade-in zoom-in-95 duration-700">
             <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {milestones.map((m, i) => (
                     <Card key={i} className={cn("p-8 rounded-[2.5rem] border transition-all", m.isDone ? "bg-zinc-900 border-emerald-500/20" : "bg-black border-white/5 opacity-60")}>
                        <div className="flex items-center justify-between mb-6">
                           <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{m.goal}</span>
                           {m.isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <h4 className="text-lg font-black text-white mb-3 italic">{m.label}</h4>
                        <p className="text-[10px] font-medium text-zinc-600 leading-relaxed">{m.desc}</p>
                     </Card>
                   ))}
                </div>

                <section className="bg-zinc-950 rounded-[4rem] border border-white/5 p-12 lg:p-20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-20 opacity-5">
                      <Building className="w-64 h-64 text-indigo-500" />
                   </div>
                   
                   <div className="max-w-2xl space-y-10">
                      <div>
                         <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4 italic">Expanding the Footprint</h3>
                         <p className="text-lg text-zinc-500 font-bold leading-relaxed">
                            {businessName} is currently evaluating high-traffic node locations in the metropolitan area for a second branch deployment. Digital sales velocity justifies a 2.5x expansion of current operational capacity.
                         </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                         <div className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-full flex items-center gap-3">
                            <Target className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Target ROAS: 4.2x</span>
                         </div>
                         <div className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-full flex items-center gap-3">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">New Customer Target: 1,500</span>
                         </div>
                      </div>
                   </div>
                </section>
             </div>
          </div>
        )}

        {/* TAB 3: PITCH (The Investor Presentation) */}
        {activeTab === "pitch" && (
           <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-8 duration-700">
              <section className="text-center space-y-6">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[6px] mb-4">Investment Proposal v1.0</p>
                 <h2 className="text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none italic">
                    The Next Scale <br /> of {businessName.split(' ')[0]}.
                 </h2>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="premium-card bg-zinc-900/40 p-10 border-white/5">
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">Market Problem</h4>
                    <p className="text-xl font-bold text-zinc-300 leading-tight">
                       Traditional retail in our sector suffers from inefficient credit access and lack of digital visibility.
                    </p>
                 </Card>
                 <Card className="premium-card bg-zinc-900/40 p-10 border-white/5">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6">Our Solution</h4>
                    <p className="text-xl font-bold text-zinc-300 leading-tight">
                       We've digitized our entire node ledger via CrediPay, creating a proven, reproducible financial blueprint.
                    </p>
                 </Card>
              </div>

              <Card className="bg-gradient-to-br from-indigo-500/20 via-emerald-500/10 to-transparent p-12 rounded-[3.5rem] border border-white/10 text-center space-y-10">
                 <div className="max-w-md mx-auto space-y-4">
                    <h3 className="text-3xl font-black text-white tracking-tighter italic">Join Our Growth Journey</h3>
                    <p className="text-sm font-bold text-zinc-500 leading-relaxed">
                       We are seeking strategic capital to initialize our Phase 2 expansion protocol. Become a node-level investor today.
                    </p>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      onClick={handleGeneratePitch}
                      className="h-20 px-12 rounded-[2rem] bg-indigo-500 text-white font-black text-lg gap-4 shadow-2xl active:scale-95 transition-all"
                    >
                       Download Deck <Zap className="w-5 h-5 fill-white" />
                    </Button>
                    <a 
                      href={`mailto:investor-relations@credipay.app?subject=Interest in ${businessName}&body=Hi ${userData?.ownerName || 'Merchant'}, I am interested in learning more about your business growth...`}
                      className="h-20 px-12 rounded-[2rem] bg-zinc-950 border border-white/10 text-zinc-400 font-black text-lg gap-4 active:scale-95 transition-all flex items-center justify-center"
                    >
                       Talk to Owner <Globe className="w-5 h-5" />
                    </a>
                 </div>
              </Card>

              <div className="flex flex-col items-center py-12 opacity-30">
                 <div className="flex items-center gap-4 mb-4">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-[5px]">Credentialed by CrediPay Alpha</span>
                 </div>
              </div>
           </div>
        )}

        {/* GENERATING OVERLAY */}
        {isGenerating && (
          <div className="fixed inset-0 z-[150] bg-zinc-950 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
            <div className="scale-75 mb-20">
              <TowerLoader />
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[10px] animate-pulse">
              Compiling Institutional Pitch
            </p>
            <p className="text-zinc-600 text-[9px] mt-4 font-bold uppercase tracking-widest">
              Hashing transaction proofs & validating growth velocity
            </p>
          </div>
        )}

        {/* DIGITAL PITCH DECK OVERLAY */}
        {showPitch && (
          <div className="fixed inset-0 z-[200] bg-white text-black overflow-y-auto animate-in slide-in-from-bottom-20 duration-700">
            <div className="max-w-4xl mx-auto py-20 px-8 lg:px-20 space-y-16">

              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-10">
                    <IndianRupee className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter italic uppercase mb-2">Investment Memo</h1>
                  <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[5px]">Proprietary &amp; Confidential v2026.04</p>
                </div>
                <button
                  onClick={() => setShowPitch(false)}
                  className="p-4 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* 01 Entity Overview */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">01 / Entity Overview</p>
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-400 mb-1">Business</p>
                    <p className="text-2xl font-black tracking-tight">{businessName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-400 mb-1">Sector</p>
                    <p className="text-2xl font-black tracking-tight">{userData?.businessType ?? 'Retail'}</p>
                  </div>
                </div>
              </div>

              {/* 02 Growth Analytics */}
              <div className="space-y-8 bg-zinc-50 p-12 rounded-[2.5rem]">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">02 / Growth Analytics</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                  <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4">Volume (6m)</p>
                    <p className="text-3xl font-black tracking-tighter">₹{(earnings / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4">Trust Score</p>
                    <p className="text-3xl font-black tracking-tighter">{finalScore}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4">Integrity</p>
                    <p className="text-3xl font-black tracking-tighter text-emerald-600">A+</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4">Nodes</p>
                    <p className="text-3xl font-black tracking-tighter">1</p>
                  </div>
                </div>
              </div>

              {/* 03 Executive Statement */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">03 / Executive Statement</p>
                <p className="text-2xl font-medium leading-tight">
                  &ldquo;{businessName} represents a new high-frequency retail node in the {userData?.businessType ?? 'General Store'} sector.
                  Our transition to a fully digital ledger has optimized our debt eligibility and provided 4x
                  visibility into local market demand.&rdquo;
                </p>
              </div>

              {/* Share Section */}
              <div className="flex flex-col gap-6 p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-200">
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-400 mb-2">Share With Institutional Partner</h4>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                    Securely transmit this investment memo to a verified external stakeholder.
                  </p>
                </div>
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="investor@example.com"
                    className="flex-1 h-14 px-6 rounded-xl border border-zinc-200 bg-white text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                  />
                  <Button
                    onClick={handleShareByEmail}
                    disabled={isSharing}
                    className="h-14 px-10 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Share Memo
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-10 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Verified by CrediPay Institutional Bridge</p>
                </div>
                <Button className="h-14 px-8 rounded-xl bg-black text-white font-black text-xs uppercase tracking-widest gap-4">
                  <Printer className="w-4 h-4" />
                  Print Memo
                </Button>
              </div>

            </div>
          </div>
        )}


      </div>
    </AppShell>
  );
}
