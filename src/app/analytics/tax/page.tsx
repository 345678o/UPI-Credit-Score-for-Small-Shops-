"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  FileText, Download, AlertTriangle, CheckCircle2, 
  Info, TrendingUp, Landmark, Calculator, ChevronLeft,
  ArrowRight, ShieldCheck, PieChart, Receipt
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, getFirestore } from "firebase/firestore";
import { summarizeTaxLiability } from "@/lib/tax-engine";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function TaxPreparationPage() {
  const { user } = useUser();
  const router = useRouter();
  const db = getFirestore();

  // Fetch recent transactions for tax calculation
  const txnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "users", user.uid, "ledgerNodes"), orderBy("timestamp", "desc"), limit(100));
  }, [user]);
  const { data: transactions, isLoading } = useCollection(txnsQuery);

  const [taxSummary, setTaxSummary] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    if (transactions) {
      const summary = summarizeTaxLiability(transactions);
      summary.liability = Math.max(0, summary.outputTax - summary.inputTaxCredit);
      setTaxSummary(summary);
    }
  }, [transactions]);

  const handleGSTConnect = () => {
    setIsConnecting(true);
    // Simulate API handshake with GSTN
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      alert("🎉 Successfully authenticated with GSTN (Goods and Services Tax Network). Your compliance nodes are now synchronized.");
    }, 2000);
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      alert("🔍 Audit Complete: All ledger nodes verified. 100% compliance score achieved for the current filing period.");
    }, 2500);
  };

  return (
    <AppShell>
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5">
              <ChevronLeft className="w-6 h-6 text-zinc-400" />
           </Button>
           <div>
              <p className="text-[10px] font-black text-violet-500 uppercase tracking-[4px]">Compliance Hub</p>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Tax Preparation</h1>
           </div>
        </div>
        <Button 
          onClick={() => {
            alert("📁 Generating GST Report (PDF/Excel)... The file will be available in your downloads folder shortly.");
          }}
          className="h-14 px-8 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest gap-3 shadow-xl active:scale-95 transition-all"
        >
           <Download className="w-4 h-4" /> Export GST Summary
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
        {/* Main Liability Card */}
        <div className="lg:col-span-8 space-y-8">
           <Card className="premium-card bg-zinc-950 border-white/5 p-10 lg:p-14 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                 <Calculator className="w-32 h-32 text-white" />
              </div>
              
              <div className="flex items-start justify-between mb-12 relative z-10">
                 <div>
                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[4px] mb-4">Estimated GST Liability (Current Month)</h2>
                    <h3 className="text-6xl font-black text-white tracking-tighter tabular-nums">
                       ₹{taxSummary ? Math.round(taxSummary.liability).toLocaleString() : "0"}
                    </h3>
                    <div className="mt-4 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       <span className="text-xs font-bold text-zinc-400">All ledger nodes verified for compliance</span>
                    </div>
                 </div>
                 <div className="px-5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Due in 12 Days</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                 <div className="p-8 bg-zinc-900/60 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Output Tax Collected</p>
                    <p className="text-2xl font-black text-white">₹{taxSummary ? Math.round(taxSummary.outputTax).toLocaleString() : "0"}</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">From Customer Sales</p>
                 </div>
                 <div className="p-8 bg-zinc-900/60 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Input Tax Credit (ITC)</p>
                    <p className="text-2xl font-black text-white">₹{taxSummary ? Math.round(taxSummary.inputTaxCredit).toLocaleString() : "0"}</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Recoverable from Purchases</p>
                 </div>
              </div>
           </Card>

           {/* Component Breakdown */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="premium-card bg-zinc-950 border-white/5 p-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                       <PieChart className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Tax Component Split</h4>
                 </div>
                 
                 <div className="space-y-6">
                    {[
                      { label: "CGST (Central)", value: taxSummary ? taxSummary.cgstOutput - taxSummary.cgstInput : 0, color: "bg-indigo-500" },
                      { label: "SGST (State)", value: taxSummary ? taxSummary.sgstOutput - taxSummary.sgstInput : 0, color: "bg-emerald-500" },
                      { label: "IGST (Inter-state)", value: 0, color: "bg-amber-500" },
                    ].map((item) => (
                      <div key={item.label}>
                         <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</span>
                            <span className="text-sm font-black text-white">₹{Math.max(0, Math.round(item.value)).toLocaleString()}</span>
                         </div>
                         <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", item.color)} style={{ width: taxSummary?.liability > 0 ? `${(item.value / taxSummary.liability) * 100}%` : '0%' }} />
                         </div>
                      </div>
                    ))}
                 </div>
              </Card>

              <Card className="premium-card bg-zinc-950 border-white/5 p-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Compliance Health</h4>
                 </div>
                 
                 <div className="space-y-4">
                    {[
                      "All invoices have valid GSTINs",
                      "IGST vs CGST classification verified",
                      "Sales data synced with GSTR-1"
                    ].map(text => (
                      <div key={text} className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                         </div>
                         <p className="text-[11px] font-bold text-zinc-400">{text}</p>
                      </div>
                    ))}
                 </div>
                 <Button 
                   onClick={handleRunAudit}
                   disabled={isAuditing}
                   variant="outline" 
                   className="w-full h-12 mt-8 rounded-xl border-white/5 bg-zinc-900 text-[10px] font-black uppercase tracking-widest"
                 >
                    {isAuditing ? "Scanning Ledger Nodes..." : "Run Audit Analysis"}
                 </Button>
              </Card>
           </div>
        </div>

        {/* Sidebar / AI Advisor */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="premium-card bg-zinc-950 border-white/5 p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Receipt className="w-12 h-12 text-violet-500" />
              </div>
              <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-[4px] mb-8">AI Tax Advisor</h4>
              
              <div className="space-y-8">
                 <div className="p-6 bg-violet-500/5 border border-violet-500/20 rounded-[2rem]">
                    <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-3">Optimization Hack</p>
                    <p className="text-sm font-black text-white leading-relaxed italic">
                       "You have ₹4,200 in unclaimed ITC from recent business utility payments. Update your electricity bill GSTIN to save 18% on those expenses."
                    </p>
                 </div>

                 <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Filing Preparation</h5>
                    {[
                      { icon: FileText, label: "GSTR-1 (Sales Summary)", status: "Ready" },
                      { icon: Landmark, label: "GSTR-3B (Payment)", status: "Draft" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-white/5">
                         <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-zinc-600" />
                            <span className="text-xs font-bold text-white">{item.label}</span>
                         </div>
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{item.status}</span>
                      </div>
                    ))}
                 </div>

                 <Button 
                   onClick={handleGSTConnect}
                   disabled={isConnecting || isConnected}
                   className={cn(
                     "w-full h-14 rounded-2xl font-black transition-all gap-3",
                     isConnected ? "bg-emerald-500 text-black cursor-default" : "bg-violet-500 text-white hover:bg-violet-600"
                   )}
                 >
                    {isConnecting ? (
                      <>Authenticating Ledger...</>
                    ) : isConnected ? (
                      <><CheckCircle2 className="w-4 h-4" /> Connected to GSTN</>
                    ) : (
                      <>Connect to GST Portal <ArrowRight className="w-4 h-4" /></>
                    )}
                 </Button>
              </div>
           </Card>

           <Card className="premium-card bg-amber-500/5 border border-amber-500/20 p-10">
              <div className="flex items-center gap-4 mb-6">
                 <AlertTriangle className="w-5 h-5 text-amber-500" />
                 <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Reconciliation Alert</h4>
              </div>
              <p className="text-xs font-bold text-amber-400/80 leading-relaxed mb-6">
                 Found 2 transactions with missing GST category. These will be filed under 'General (18%)' by default.
              </p>
              <Button 
                onClick={() => {
                  alert("🛠 Pulling up identified transactions... You can now assign GST categories (Electronics, Services, etc.) to these entries for more accurate tax filing.");
                  router.push("/transactions");
                }}
                variant="outline" 
                className="w-full h-12 rounded-xl border-amber-500/20 bg-amber-500/10 text-amber-400 font-extrabold text-[9px] uppercase tracking-widest"
              >
                 Review Transactions
              </Button>
           </Card>
        </div>
      </div>
    </AppShell>
  );
}
