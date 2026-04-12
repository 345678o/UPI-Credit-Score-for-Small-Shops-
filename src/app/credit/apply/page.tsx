"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft, ArrowRight, ShieldCheck, Zap, CheckCircle2,
  Building2, TrendingUp, Clock, Star, IndianRupee, AlertCircle,
  BadgeCheck, Calendar, Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import {
  getPersonalizedOffers, NBFC_PARTNERS, calculateEMI,
  NBFCPartner, LoanApplication
} from "@/lib/nbfc-integration";
import { backend } from "@/lib/backend-core";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTransactions } from "@/context/TransactionContext";

const LOAN_PURPOSES = [
  { id: "working_capital", label: "Working Capital", desc: "Day-to-day operations & inventory", icon: "🏪" },
  { id: "inventory_financing", label: "Inventory Purchase", desc: "Stock up before peak season", icon: "📦" },
  { id: "emergency_credit", label: "Emergency Credit", desc: "Urgent cash requirement", icon: "⚡" },
  { id: "term_loan", label: "Business Expansion", desc: "Open new branch or upgrade store", icon: "🏗️" },
];

export default function LoanApplyPage() {
  const { user } = useUser();
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState([75000]);
  const [purpose, setPurpose] = useState("working_capital");
  const [selectedPartner, setSelectedPartner] = useState<NBFCPartner | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [selectedTenure, setSelectedTenure] = useState<number>(12);
  const [kycAgreed, setKycAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disbursedLoanId, setDisbursedLoanId] = useState<string | null>(null);
  const [offers, setOffers] = useState<ReturnType<typeof getPersonalizedOffers>>([]);
  const [creditScore] = useState(742); // From user profile / backend

  useEffect(() => {
    // Recalculate offers when amount changes
    const freshOffers = getPersonalizedOffers(creditScore, 120000, 365, amount[0]);
    setOffers(freshOffers);
    setError(null);
  }, [amount, creditScore]);

  const handleSelectOffer = (partner: NBFCPartner, offer: any) => {
    setSelectedPartner(partner);
    setSelectedOffer(offer);
    setSelectedTenure(offer.tenure);
    setError(null);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!user || !selectedPartner || !selectedOffer) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const emi = calculateEMI(amount[0], selectedOffer.interestRate, selectedTenure);

      const res = await fetch("/api/nbfc/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email || "",
          nbfcPartnerId: selectedPartner.id,
          nbfcPartnerName: selectedPartner.name,
          loanType: purpose,
          requestedAmount: amount[0],
          tenure: selectedTenure,
          interestRate: selectedOffer.interestRate,
          emi,
          processingFee: selectedOffer.processingFee,
          purpose,
          creditScore,
          monthlyRevenue: 120000,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process application");
      }

      if (data.success) {
        // Record disbursal in main ledger (Non-blocking)
        backend.recordTransaction({
          userId: user.uid,
          amount: amount[0],
          type: "credit",
          category: "Loan Disbursal",
          payerIdentifier: selectedPartner.name,
          description: `Loan disbursed by ${selectedPartner.name} (${selectedTenure} months)`,
        }).catch(err => console.error("Ledger sync failed:", err));

        // Sync with Live UI Mock State
        try {
          addTransaction({
            name: selectedPartner.name,
            amount: amount[0],
            type: "credit"
          });
        } catch (e) {
          console.warn("Failed to inject to simulator mock state", e);
        }

        // Create in-app notification (Non-blocking)
        const db = getFirestore();
        addDoc(collection(db, "users", user.uid, "notifications"), {
          userId: user.uid,
          type: "loan_approved",
          message: `₹${amount[0].toLocaleString("en-IN")} loan from ${selectedPartner.name} has been disbursed to your account.`,
          isRead: false,
          createdAt: serverTimestamp(),
        }).catch(err => console.error("Notification failed:", err));

        setDisbursedLoanId(data.loanId);
        setStep(5);
      }
    } catch (err: any) {
      console.error("Loan submission failed", err);
      setError(err.message || "An unexpected error occurred during disbursal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 5: Success Screen ──────────────────────────────────────────────────
  if (step === 5) {
    const finalEmi = calculateEMI(amount[0], selectedOffer?.interestRate || 14, selectedTenure);
    return (
      <div className="fixed inset-0 bg-zinc-950 z-[100] flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-black stroke-[3px]" />
        </div>

        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[5px] mb-4">Disbursal Confirmed</p>
        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">
          ₹{amount[0].toLocaleString("en-IN")}
        </h2>
        <p className="text-zinc-400 font-bold mb-2 text-sm">Credited by {selectedPartner?.name}</p>
        <p className="text-zinc-600 font-bold mb-12 max-w-sm text-xs leading-relaxed">
          Amount has been added to your Business Ledger. First EMI of ₹{finalEmi.toLocaleString("en-IN")} due in 30 days.
        </p>

        <div className="w-full max-w-sm space-y-4 mb-10">
          {[
            { label: "Monthly EMI", value: `₹${finalEmi.toLocaleString("en-IN")}` },
            { label: "Interest Rate", value: `${selectedOffer?.interestRate}% p.a.` },
            { label: "Tenure", value: `${selectedTenure} Months` },
            { label: "Processing Fee", value: `₹${selectedOffer?.processingFee?.toLocaleString("en-IN")}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center p-5 bg-zinc-900/60 border border-white/5 rounded-2xl">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
              <span className="text-sm font-black text-white">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 w-full max-w-sm">
          <Button className="flex-1 h-16 rounded-2xl bg-emerald-500 text-black font-black gap-3 active:scale-95 transition-all" onClick={() => router.push("/credit")}>
            View My Loans <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="flex-1 h-16 rounded-2xl border-white/10 text-white font-black hover:bg-zinc-900 transition-all" onClick={() => router.push("/")}>
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="mb-10 flex items-center gap-6">
        <Button
          variant="ghost" size="icon"
          onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
          className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-400" />
        </Button>
        <div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">
            Step {step} of 4 — {["", "Loan Details", "Choose Lender", "Confirm & Sign", "Processing"][step]}
          </p>
          <h1 className="text-3xl font-black text-white tracking-tighter">Instant Capital</h1>
        </div>

        {/* Progress dots */}
        <div className="ml-auto flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={cn(
              "h-2 rounded-full transition-all duration-500",
              s < step ? "w-6 bg-emerald-500" : s === step ? "w-8 bg-emerald-500" : "w-2 bg-zinc-800"
            )} />
          ))}
        </div>
      </header>

      {/* ── Step 1: Amount + Purpose ────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-zinc-950 border border-white/5 rounded-[3rem] p-10 lg:p-14">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">How much do you need?</p>
            <h2 className="text-6xl lg:text-7xl font-black text-white tracking-tighter tabular-nums mb-10">
              ₹{amount[0].toLocaleString("en-IN")}
            </h2>
            <Slider value={amount} onValueChange={setAmount} min={25000} max={500000} step={5000} className="py-6" />
            <div className="flex justify-between text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-2">
              <span>₹25,000</span>
              <span>₹5,00,000</span>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 px-2">What is this loan for?</p>
            <div className="grid grid-cols-2 gap-4">
              {LOAN_PURPOSES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPurpose(p.id)}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 text-left transition-all",
                    purpose === p.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-white/5 bg-zinc-950 hover:border-white/10"
                  )}
                >
                  <span className="text-2xl mb-3 block">{p.icon}</span>
                  <p className={cn("text-sm font-black", purpose === p.id ? "text-emerald-400" : "text-white")}>{p.label}</p>
                  <p className="text-[10px] text-zinc-600 font-bold mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <Button
            className="w-full h-18 rounded-[2rem] bg-emerald-500 text-black font-black text-lg gap-4 shadow-xl active:scale-95 transition-all"
            onClick={() => setStep(2)}
          >
            See My Offers <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
          </Button>
        </div>
      )}

      {/* ── Step 2: Lender Comparison ────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white">Personalized Offers</h2>
              <p className="text-xs text-zinc-500 font-bold mt-1">Based on your credit score of {creditScore} · ₹{amount[0].toLocaleString("en-IN")}</p>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{offers.length} Offers Available</span>
            </div>
          </div>

          <div className="space-y-6">
            {offers.map(({ partner, offer }, idx) => (
              <div key={partner.id} className={cn(
                "relative bg-zinc-950 border rounded-[2.5rem] p-8 lg:p-10 transition-all group cursor-pointer hover:border-emerald-500/30",
                idx === 0 ? "border-emerald-500/40" : "border-white/5"
              )}
                onClick={() => handleSelectOffer(partner, offer)}
              >
                {idx === 0 && (
                  <div className="absolute -top-3 left-8 px-4 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                    Best Rate
                  </div>
                )}

                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center text-white font-black text-lg" style={{ background: partner.color }}>
                      {partner.name[0]}
                    </div>
                    <h3 className="text-lg font-black text-white">{partner.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold mt-1">{partner.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white tabular-nums">{offer.interestRate}%</p>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">per annum</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Monthly EMI", value: `₹${offer.emi.toLocaleString("en-IN")}` },
                    { label: "Tenure", value: `${offer.tenure} months` },
                    { label: "Processing", value: `₹${offer.processingFee.toLocaleString("en-IN")}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-zinc-900/60 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-sm font-black text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {partner.features.map(f => (
                    <span key={f} className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-full text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-wider">{partner.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${offer.approvalProbability}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-emerald-500">{Math.round(offer.approvalProbability)}% approval</span>
                  </div>
                  <Button className="h-10 px-6 rounded-xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider gap-2 group-hover:scale-105 transition-transform">
                    Select <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 3: Confirm & KYC ────────────────────────────────────────────── */}
      {step === 3 && selectedPartner && selectedOffer && (
        <div className="max-w-2xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-zinc-950 border border-emerald-500/20 rounded-[3rem] p-10">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl" style={{ background: selectedPartner.color }}>
                {selectedPartner.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{selectedPartner.name}</h3>
                <p className="text-[10px] text-zinc-500 font-bold">{selectedPartner.tagline}</p>
              </div>
              <BadgeCheck className="w-6 h-6 text-emerald-500 ml-auto" />
            </div>

            <div className="space-y-5">
              {[
                { label: "Loan Amount", value: `₹${amount[0].toLocaleString("en-IN")}` },
                { label: "Interest Rate", value: `${selectedOffer.interestRate}% p.a.` },
                { label: "Tenure", value: `${selectedTenure} months` },
                { label: "Monthly EMI", value: `₹${calculateEMI(amount[0], selectedOffer.interestRate, selectedTenure).toLocaleString("en-IN")}`, highlight: true },
                { label: "Processing Fee", value: `₹${selectedOffer.processingFee.toLocaleString("en-IN")}` },
                { label: "Total Repayment", value: `₹${(calculateEMI(amount[0], selectedOffer.interestRate, selectedTenure) * selectedTenure).toLocaleString("en-IN")}` },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={cn("flex justify-between items-center py-3", highlight ? "border-y border-white/5" : "")}>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
                  <span className={cn("font-black tabular-nums", highlight ? "text-emerald-400 text-xl" : "text-white text-sm")}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Adjust Repayment Period</p>
            <div className="grid grid-cols-4 gap-3">
              {selectedPartner.tenures.slice(0, 4).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTenure(t)}
                  className={cn(
                    "p-5 rounded-2xl border-2 transition-all font-black text-sm",
                    selectedTenure === t ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/5 bg-zinc-950 text-zinc-500 hover:border-white/10"
                  )}
                >
                  {t}M
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setKycAgreed(k => !k)}
            className={cn(
              "w-full p-6 rounded-2xl border-2 text-left transition-all flex items-start gap-4",
              kycAgreed ? "border-emerald-500 bg-emerald-500/5" : "border-white/5 bg-zinc-950"
            )}
          >
            <div className={cn("w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors", kycAgreed ? "border-emerald-500 bg-emerald-500" : "border-zinc-600")}>
              {kycAgreed && <CheckCircle2 className="w-4 h-4 text-black stroke-[3px]" />}
            </div>
            <div>
              <p className="text-sm font-black text-white mb-1">I agree to the Loan Agreement & Digital KYC</p>
              <p className="text-[10px] text-zinc-600 font-bold leading-relaxed">
                By proceeding, you authorize {selectedPartner.name} to access your CrediPay transaction data for credit assessment.
              </p>
            </div>
          </button>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-rose-500 uppercase tracking-widest">Disbursal Blocked</p>
                <p className="text-[11px] font-bold text-rose-400/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          <Button
            className="w-full h-18 rounded-[2rem] bg-emerald-500 text-black font-black text-lg gap-4 shadow-xl active:scale-95 transition-all disabled:opacity-40"
            disabled={!kycAgreed || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Syncing Trust...
              </span>
            ) : (
              <>Confirm & Disburse <ArrowRight className="w-5 h-5 stroke-[2.5px]" /></>
            )}
          </Button>

          <p className="text-center text-[9px] text-zinc-700 font-black uppercase tracking-widest">
            🔒 AES-256 Encrypted · RBI Regulated · No Hidden Charges
          </p>
        </div>
      )}
    </AppShell>
  );
}
