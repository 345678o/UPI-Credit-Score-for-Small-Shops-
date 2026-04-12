"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Plus, ArrowRight, CheckCircle2, Clock, AlertCircle,
  IndianRupee, TrendingDown, Calendar, ChevronRight, Zap,
  ShieldCheck, BadgeCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { getUserLoans, LoanApplication } from "@/lib/nbfc-integration";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending:   { label: "Under Review", color: "text-amber-400", icon: Clock, bg: "bg-amber-500/10" },
  approved:  { label: "Approved", color: "text-emerald-400", icon: CheckCircle2, bg: "bg-emerald-500/10" },
  disbursed: { label: "Disbursed", color: "text-indigo-400", icon: BadgeCheck, bg: "bg-indigo-500/10" },
  repayment: { label: "Active EMI", color: "text-purple-400", icon: TrendingDown, bg: "bg-purple-500/10" },
  rejected:  { label: "Rejected", color: "text-rose-400", icon: AlertCircle, bg: "bg-rose-500/10" },
  closed:    { label: "Fully Repaid", color: "text-zinc-400", icon: CheckCircle2, bg: "bg-zinc-800" },
};

export default function MyLoansPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loans, setLoans] = useState<(LoanApplication & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setIsLoading(true);
      const data = await getUserLoans(user.uid);
      setLoans(data);
      setIsLoading(false);
    }
    load();
  }, [user]);

  const activeLoans = loans.filter(l => ["disbursed", "repayment", "approved"].includes(l.status));
  const totalOutstanding = activeLoans.reduce((s, l) => s + (l.outstandingAmount || 0), 0);
  const nextEmi = activeLoans[0]?.repaymentSchedule?.find(i => i.status === "pending");

  return (
    <AppShell>
      <header className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Phase 4 · NBFC Integration</p>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">My Loans</h1>
        </div>
        <Button asChild className="h-14 px-6 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-widest gap-3 shadow-xl active:scale-95 transition-all">
          <Link href="/credit/apply">
            <Plus className="w-4 h-4 stroke-[3px]" /> New Loan
          </Link>
        </Button>
      </header>

      {/* Summary Cards */}
      {activeLoans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {[
            {
              label: "Total Outstanding",
              value: `₹${totalOutstanding.toLocaleString("en-IN")}`,
              icon: IndianRupee,
              color: "text-rose-400",
              bg: "bg-rose-500/10"
            },
            {
              label: "Active Loans",
              value: activeLoans.length.toString(),
              icon: BadgeCheck,
              color: "text-indigo-400",
              bg: "bg-indigo-500/10"
            },
            {
              label: "Next EMI Due",
              value: nextEmi ? `₹${nextEmi.amount.toLocaleString("en-IN")}` : "—",
              icon: Calendar,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              sub: nextEmi ? new Date(nextEmi.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "No pending EMIs"
            },
          ].map(({ label, value, icon: Icon, color, bg, sub }) => (
            <div key={label} className="bg-zinc-950 border border-white/5 rounded-[2rem] p-8">
              <div className="flex justify-between items-start mb-5">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
              </div>
              <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</p>
              {sub && <p className="text-[10px] font-bold text-zinc-600 mt-2">{sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Loans List */}
      <section className="space-y-5 pb-32">
        {isLoading && (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-zinc-950 border border-white/5 rounded-[2.5rem] animate-pulse" />
          ))
        )}

        {!isLoading && loans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-8">
              <IndianRupee className="w-12 h-12 text-zinc-700" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">No loans yet</h3>
            <p className="text-zinc-600 text-sm font-bold max-w-xs mb-10">
              Apply for your first business loan from our NBFC partner network with competitive rates.
            </p>
            <Button asChild className="h-16 px-10 rounded-2xl bg-emerald-500 text-black font-black gap-3">
              <Link href="/credit/apply">
                <Zap className="w-5 h-5" /> Apply Now — Instant Approval
              </Link>
            </Button>
          </div>
        )}

        {!isLoading && loans.map(loan => {
          const status = STATUS_CONFIG[loan.status] || STATUS_CONFIG.pending;
          const StatusIcon = status.icon;
          const paidCount = loan.repaymentSchedule?.filter(i => i.status === "paid").length || 0;
          const totalCount = loan.repaymentSchedule?.length || 0;
          const progressPct = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

          return (
            <div
              key={loan.id}
              onClick={() => router.push(`/credit/repay/${loan.id}`)}
              className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 lg:p-10 cursor-pointer hover:border-emerald-500/20 transition-all group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">{loan.nbfcPartnerName}</p>
                  <h3 className="text-2xl font-black text-white tracking-tighter">
                    ₹{(loan.approvedAmount || loan.requestedAmount).toLocaleString("en-IN")}
                  </h3>
                  <p className="text-xs text-zinc-500 font-bold mt-1">
                    {loan.interestRate}% p.a. · {loan.tenure} months
                  </p>
                </div>
                <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border", status.bg, "border-white/5")}>
                  <StatusIcon className={cn("w-3.5 h-3.5", status.color)} />
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", status.color)}>{status.label}</span>
                </div>
              </div>

              {/* EMI Progress */}
              {totalCount > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Repayment progress</span>
                    <span className="text-[9px] font-black text-zinc-400">{paidCount}/{totalCount} EMIs paid</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Monthly EMI</p>
                    <p className="text-base font-black text-white">₹{loan.emi.toLocaleString("en-IN")}</p>
                  </div>
                  {loan.outstandingAmount !== undefined && (
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Outstanding</p>
                      <p className="text-base font-black text-rose-400">₹{loan.outstandingAmount.toLocaleString("en-IN")}</p>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </section>
    </AppShell>
  );
}
