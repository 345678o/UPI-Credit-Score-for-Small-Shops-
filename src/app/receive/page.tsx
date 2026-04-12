"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import Link from "next/link";
import { QrCode as QrIcon, ArrowLeft } from "lucide-react";

export default function ReceivePage() {
  const shopName = "Kirana Store";
  const upiId = "shop@upi";
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}`;

  return (
    <AppShell>
      <div className="max-w-md mx-auto space-y-8 pb-20">
        <header className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-800 transition-colors">
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </Button>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Receive Payment</h1>
        </header>

        <Card className="premium-card bg-zinc-900 border-white/5 p-8 flex flex-col items-center gap-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tighter">{shopName}</h2>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">{upiId}</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="bg-white p-6 rounded-[2.5rem] relative z-10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <QRCode value={upiUrl} size={200} />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex items-center gap-3 text-zinc-400">
              <QrIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Scan to pay</span>
            </div>

            <Link href="/pay" className="w-full">
              <Button className="w-full h-16 rounded-[1.25rem] bg-emerald-500 text-black font-black text-xs uppercase tracking-widest gap-3 shadow-2xl active:scale-95 transition-all">
                Simulate Payment
              </Button>
            </Link>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
            This is a secure UPI terminal simulation.<br/>No real money will be deducted.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
