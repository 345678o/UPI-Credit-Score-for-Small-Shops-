"use client";

import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, IndianRupee, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Customer";
  const amount = searchParams.get("amount") || "0";
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  return (
    <AppShell>
      <div className="max-w-md mx-auto space-y-8 pb-20 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full animate-pulse" />
          <CheckCircle2 className="w-24 h-24 text-emerald-500 relative z-10" />
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-white tracking-tighter">Payment Received</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Transaction Successful</p>
        </div>

        <Card className="premium-card bg-zinc-900 border-white/5 w-full p-10 flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-baseline gap-1">
              <IndianRupee className="w-6 h-6 text-emerald-500" />
              <span className="text-6xl font-black text-white tracking-tighter tabular-nums">
                {parseFloat(amount).toLocaleString()}
              </span>
            </div>
            <p className="text-zinc-400 font-bold text-sm">from {name}</p>
          </div>

          <div className="w-full h-px bg-white/5" />

          <div className="grid grid-cols-2 gap-8 w-full">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Time</p>
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Calendar className="w-3 h-3 text-emerald-500/50" />
                {time}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Status</p>
              <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified
              </div>
            </div>
          </div>

          <Link href="/" className="w-full">
            <Button className="w-full h-16 rounded-[1.25rem] bg-white text-black font-black text-xs uppercase tracking-widest gap-3 shadow-2xl active:scale-95 transition-all group-hover:bg-emerald-500 transition-colors">
              Back to Home <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>

        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[4px] italic">CrediPay Secure Ledger</p>
      </div>
    </AppShell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
