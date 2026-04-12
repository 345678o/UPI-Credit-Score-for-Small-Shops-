"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactions } from "@/context/TransactionContext";
import { ArrowLeft, IndianRupee, User, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { backend } from "@/lib/backend-core";

export default function PayPage() {
  const { user } = useUser();
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const { addTransaction } = useTransactions();
  const router = useRouter();

  const handleConfirm = async () => {
    if (!customerName || !amount || !user) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;

    // 1. Record in Real Backend
    await backend.recordTransaction({
      userId: user.uid,
      amount: numAmount,
      type: "credit",
      category: "Sales",
      payerIdentifier: customerName,
      description: "Payment collected via Terminal simulation"
    });

    // 2. Update Simulation Layer
    addTransaction({
      name: customerName,
      amount: numAmount,
      type: "credit",
    });

    // Pass data to success page via query params or state (here using query params for simplicity in simulation)
    const params = new URLSearchParams({
      name: customerName,
      amount: amount,
    });
    router.push(`/success?${params.toString()}`);
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto space-y-8 pb-20">
        <header className="flex items-center gap-4">
          <Link href="/receive">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-800 transition-colors">
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </Button>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Payment Detail</h1>
        </header>

        <Card className="premium-card bg-zinc-900 border-white/5 p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <ShieldCheck className="w-5 h-5 text-emerald-500/20" />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Customer Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-14 pl-12 bg-zinc-950 border-white/5 rounded-2xl text-white font-bold focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Amount (₹)</Label>
              <div className="relative group">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 pl-12 bg-zinc-950 border-white/5 rounded-2xl text-white font-bold focus:border-emerald-500/50 transition-all text-lg"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={!customerName || !amount}
            className="w-full h-16 rounded-[1.25rem] bg-emerald-500 text-black font-black text-xs uppercase tracking-widest gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            Confirm Payment
          </Button>
        </Card>

        <div className="flex items-center justify-center gap-3 text-zinc-600">
           <div className="h-px w-8 bg-white/5" />
           <p className="text-[9px] font-black uppercase tracking-[0.2em]">End-to-end encrypted</p>
           <div className="h-px w-8 bg-white/5" />
        </div>
      </div>
    </AppShell>
  );
}
