"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, ArrowUpRight, ChevronRight, Info, 
  Clock, CheckCircle2, Sparkles, Building2, Star,
  TrendingUp, Award, Zap, Filter, Search, IndianRupee
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, getFirestore } from "firebase/firestore";
import { 
  getNBFCPartners, 
  getPersonalizedOffers, 
  NBFCPartner,
  submitLoanApplication 
} from "@/lib/nbfc-integration";

export default function CreditMarketplacePage() {
  const { user } = useUser();
  const [selectedAmount, setSelectedAmount] = useState(250000);
  const [selectedTenure, setSelectedTenure] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [personalizedOffers, setPersonalizedOffers] = useState<any[]>([]);
  const [nbfcPartners, setNbfcPartners] = useState<NBFCPartner[]>([]);
  
  const db = getFirestore();
  const userRef = useMemoFirebase(() => user ? doc(db, "users", user.uid) : null, [user]);
  const { data: merchant } = useDoc(userRef);

  const loanAmounts = [50000, 100000, 250000, 500000, 1000000];
  const loanTenures = [6, 12, 18, 24, 36];

  useEffect(() => {
    if (merchant) {
      setIsLoading(true);
      
      // Load NBFC partners
      const partners = getNBFCPartners();
      setNbfcPartners(partners);
      
      // Get personalized offers
      const offers = getPersonalizedOffers(
        merchant.creditScore || 742,
        merchant.monthlyRevenue || 75000,
        merchant.businessAge || 12,
        selectedAmount
      );
      setPersonalizedOffers(offers);
      
      setIsLoading(false);
    }
  }, [merchant, selectedAmount]);

  const filteredPartners = nbfcPartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || partner.specializingIn.includes(selectedCategory as any);
    return matchesSearch && matchesCategory;
  });

  const handleApplyNow = async (partnerId: string, offer: any) => {
    if (!user || !merchant) return;
    
    try {
      const result = await submitLoanApplication({
        userId: user.uid,
        merchantId: user.uid,
        nbfcPartner: partnerId,
        loanType: 'working_capital',
        requestedAmount: selectedAmount,
        tenure: selectedTenure,
        purpose: 'Business expansion and working capital',
        creditScore: merchant.creditScore || 742,
        monthlyRevenue: merchant.monthlyRevenue || 75000,
        businessAge: merchant.businessAge || 12,
        transactionVolume: merchant.totalTransactions || 150,
        expenseRatio: 0.35
      });
      
      if (result.success) {
        // Navigate to application status page
        window.location.href = `/credit/application/${result.applicationId}`;
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to submit application. Please try again.');
    }
  };

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Credit Marketplace</h1>
            <p className="text-sm font-bold text-zinc-500 mt-2">Direct integration with leading NBFCs and lenders</p>
          </div>
          <Link href="/credit">
            <Button variant="outline" className="border-white/10 bg-zinc-900/50 text-white hover:bg-zinc-800">
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Credit
            </Button>
          </Link>
        </div>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* Loan Configuration */}
        <Card className="premium-card bg-zinc-900 border-white/5 p-8 lg:p-12">
          <h3 className="text-xl font-black text-white mb-8">Configure Your Loan</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Loan Amount Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-5 h-5 text-emerald-500" />
                <h4 className="text-lg font-black text-white">Loan Amount</h4>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  {selectedAmount.toLocaleString('en-IN')}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {loanAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={cn(
                      "p-4 rounded-xl border font-black text-sm transition-all",
                      selectedAmount === amount
                        ? "bg-emerald-500 border-emerald-500 text-black"
                        : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10"
                    )}
                  >
                    {amount >= 100000 ? `${amount/100000}L` : `${amount/1000}K`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-500" />
                <h4 className="text-lg font-black text-white">Repayment Period</h4>
                <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                  {selectedTenure} months
                </Badge>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {loanTenures.map((tenure) => (
                  <button
                    key={tenure}
                    onClick={() => setSelectedTenure(tenure)}
                    className={cn(
                      "p-4 rounded-xl border font-black text-sm transition-all",
                      selectedTenure === tenure
                        ? "bg-indigo-500 border-indigo-500 text-white"
                        : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10"
                    )}
                  >
                    {tenure}M
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Personalized Offers */}
        {!isLoading && personalizedOffers.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <h3 className="text-2xl font-black text-white">Personalized Offers</h3>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                {personalizedOffers.length} Best Matches
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalizedOffers.map((item, index) => (
                <Card key={index} className="premium-card bg-gradient-to-br from-emerald-600/10 to-indigo-600/10 border-emerald-500/20 p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-xl" />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-black text-white">{item.partner.name}</h4>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          {item.offer.approvalProbability}% Approval Rate
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-3 h-3", i < 4 ? "text-yellow-500 fill-yellow-500" : "text-zinc-600")} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Interest Rate</span>
                      <span className="text-lg font-black text-emerald-500">{item.offer.interestRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Monthly EMI</span>
                      <span className="text-lg font-black text-white">¥{item.offer.emi.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Processing Fee</span>
                      <span className="text-sm font-black text-zinc-400">¥{item.offer.processingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Turnaround</span>
                      <span className="text-sm font-black text-indigo-500">{item.offer.turnaroundTime}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-widest gap-3 hover:bg-emerald-400 transition-all"
                    onClick={() => handleApplyNow(item.partner.id, item.offer)}
                  >
                    Apply Now <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All NBFC Partners */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="w-6 h-6 text-zinc-400" />
              <h3 className="text-2xl font-black text-white">All Lending Partners</h3>
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">
                {filteredPartners.length} Available
              </Badge>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search lenders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-white placeholder:text-zinc-600 focus:border-emerald-500/20 outline-none"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-white focus:border-emerald-500/20 outline-none"
              >
                <option value="all">All Types</option>
                <option value="working_capital">Working Capital</option>
                <option value="term_loan">Term Loan</option>
                <option value="emergency_credit">Emergency Credit</option>
                <option value="inventory_financing">Inventory Financing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <Card key={partner.id} className="premium-card bg-zinc-900 border-white/5 p-8 hover:border-white/10 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-lg">{partner.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("w-3 h-3", i < 4 ? "text-yellow-500 fill-yellow-500" : "text-zinc-600")} />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-zinc-600">{partner.approvalRate}% approval</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Interest Rate</span>
                    <span className="text-sm font-black text-white">{partner.interestRates.min}% - {partner.interestRates.max}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Loan Amount</span>
                    <span className="text-sm font-black text-white">
                      ¥{partner.loanAmounts.min.toLocaleString()} - ¥{partner.loanAmounts.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Processing Time</span>
                    <span className="text-sm font-black text-indigo-500">{partner.processingTime}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {partner.specializingIn.map((specialty) => (
                    <Badge key={specialty} className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                      {specialty.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full h-12 rounded-xl bg-zinc-800 border border-white/5 text-white font-black text-sm uppercase tracking-widest hover:bg-zinc-700 transition-all">
                  View Details <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  );
}
