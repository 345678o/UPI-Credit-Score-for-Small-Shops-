"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, Info, CheckCircle2, Calendar, IndianRupee } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoanApplyPage() {
  const [amount, setAmount] = useState([50000]);
  const [tenure, setTenure] = useState(12);
  const [step, setStep] = useState(1);

  const emi = Math.round((amount[0] * 1.12) / tenure);

  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 success-check-animation">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 stroke-[3px]" />
        </div>
        <h2 className="text-3xl font-extrabold text-primary mb-3">Loan Applied!</h2>
        <p className="text-muted-foreground font-medium mb-12">
          Your request for <span className="text-primary font-bold">₹{amount[0].toLocaleString()}</span> has been submitted. Funds will be credited to your linked bank account within 2 hours.
        </p>
        
        <Card className="w-full mb-12 bg-gray-50/50 border-dashed border-2">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-semibold">Reference ID</span>
              <span className="font-mono font-bold text-primary">LN-8823910</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-semibold">Monthly EMI</span>
              <span className="font-bold text-primary">₹{emi.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-14 rounded-2xl indigo-gradient text-white font-extrabold text-lg shadow-xl" asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <AppShell>
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link href="/credit"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-xl font-extrabold font-headline">Loan Application</h1>
      </header>

      <div className="space-y-8">
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Loan Amount</p>
              <h2 className="text-4xl font-extrabold text-primary tracking-tighter tabular-nums">₹{amount[0].toLocaleString()}</h2>
            </div>
            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Low Interest Rate</p>
          </div>

          <Slider 
            value={amount} 
            onValueChange={setAmount} 
            max={250000} 
            min={10000} 
            step={5000}
            className="py-4"
          />
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>₹10K</span>
            <span>Max: ₹2.5L</span>
          </div>
        </section>

        <section>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Repayment Period</p>
          <div className="grid grid-cols-3 gap-3">
            {[6, 12, 18, 24].map((m) => (
              <button
                key={m}
                onClick={() => setTenure(m)}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1",
                  tenure === m 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                    : "border-gray-100 bg-white text-muted-foreground"
                )}
              >
                <Calendar className="w-5 h-5 mb-1" />
                <span className="text-sm font-extrabold">{m} Months</span>
              </button>
            ))}
          </div>
        </section>

        <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-muted-foreground">Estimated EMI</span>
                   <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-lg font-extrabold text-primary">₹{emi.toLocaleString()} / mo</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">Processing Fee</span>
                <span className="text-sm font-bold text-primary">₹999.00</span>
             </div>
             <div className="pt-4 border-t border-dashed flex justify-between items-center">
                <span className="text-sm font-extrabold text-primary">Total Disbursal</span>
                <span className="text-sm font-extrabold text-primary">₹{(amount[0] - 999).toLocaleString()}</span>
             </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 py-6">
          <Button variant="outline" className="h-14 flex-1 rounded-2xl border-gray-200 font-bold" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button className="h-14 flex-[2] rounded-2xl indigo-gradient text-white font-extrabold text-lg shadow-lg" onClick={() => setStep(3)}>
            Apply Now
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
