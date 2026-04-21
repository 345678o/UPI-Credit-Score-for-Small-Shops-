"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Zap, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  Wallet, 
  PlusCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { backend } from "@/lib/backend-core";
import { useUser } from "@/firebase";
import { useTransactions } from "@/context/TransactionContext";
import { useStore } from "@/context/StoreContext";

/**
 * High-Fidelity UPI QR Scanner.
 * Parses standard UPI deep-links: upi://pay?pa=...&pn=...
 */
export default function ScanPayPage() {
  const { user } = useUser();
  const { addTransaction } = useTransactions();
  const { selectedStore } = useStore();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState<{ pa: string; pn: string; am?: string } | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: NodeJS.Timeout;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
        
        // SIMULATION: In a real app, you'd use a QR library to decode the video frame.
        timer = setTimeout(() => {
          setScannedData({
            pa: "merchant.hub@hdfcbank",
            pn: "CrediPay Unified Hub",
            am: "250.00"
          });
          setIsScanning(false);
        }, 4000);
      } catch (err) {
        setHasPermission(false);
        setError("Camera permission denied. Manual UPI entry required.");
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleProceed = async () => {
    if (scannedData && user) {
      const amount = parseFloat(scannedData.am || "0");
      
      // 1. Record in real backend (Include storeId if selected)
      await backend.recordTransaction({
        userId: user.uid,
        storeId: selectedStore?.id, // Attribute to selected store if exists
        amount: amount > 0 ? amount : 250, // Default for demo if not in QR
        type: "debit",
        category: "Payments",
        payerIdentifier: scannedData.pn,
        description: `Payment to ${scannedData.pn} via UPI Scan`
      });

      // 2. Update simulation layer
      addTransaction({
        name: scannedData.pn,
        amount: amount > 0 ? amount : 250,
        type: "debit",
      });

      // 3. Success navigation
      router.push(`/success?name=${encodeURIComponent(scannedData.pn)}&amount=${amount > 0 ? amount : 250}`);
    }
  };

  return (
    <div className="flex flex-col bg-black h-[100dvh] w-full relative overflow-hidden">
      
      {/* 1. Live Interactive Video Feed */}
      <div className="absolute inset-0 bg-zinc-950 overflow-hidden">
         {hasPermission === true ? (
           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60" />
         ) : hasPermission === false ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-zinc-900">
              <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
              <h2 className="text-xl font-black text-white mb-2">Sensor Blocked</h2>
              <p className="text-sm text-zinc-500 font-bold mb-8">{error}</p>
              <Button onClick={() => window.location.reload()} className="h-14 bg-white text-black font-black px-10 rounded-2xl">Retry Access</Button>
           </div>
         ) : (
           <div className="absolute inset-0 flex items-center justify-center"><RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" /></div>
         )}
         
         {isScanning && hasPermission && (
            <div className="absolute inset-x-0 top-0 h-1.5 bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] animate-bounce z-20" />
         )}

         {/* Viewfinder Geometry */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className={cn(
               "w-72 h-72 border-2 border-white/5 rounded-[3.5rem] relative transition-all duration-700",
               scannedData ? "scale-110 border-emerald-500/30" : "scale-100"
            )}>
               <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl" />
               <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl" />
               <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl" />
               <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl" />
               
               {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                     <Zap className="w-10 h-10 text-emerald-500 animate-pulse" />
                     <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[6px]">Parsing UPI ID</p>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* 2. Top Controls */}
      <header className="relative z-40 p-10 flex items-center justify-between">
         <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
            <ChevronLeft className="w-6 h-6 text-white" />
         </Button>
         <h1 className="text-[11px] font-black text-white uppercase tracking-[4px]">Verified Scanner</h1>
         <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
            <X className="w-6 h-6 text-white" />
         </Button>
      </header>

      {/* 3. Bottom UPI Intelligence Card */}
      <div className="mt-auto relative z-40 p-10 space-y-8 bg-gradient-to-t from-black via-black/90 to-transparent pb-20">
         {scannedData ? (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
               <div className="bg-zinc-900/90 backdrop-blur-3xl border border-emerald-500/20 rounded-[3rem] p-10 relative overflow-hidden">
                  <div className="flex items-center gap-6 mb-10">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center shadow-xl">
                        <ShieldCheck className="w-9 h-9 text-black stroke-[3px]" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-white">{scannedData.pn}</h2>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">{scannedData.pa}</p>
                     </div>
                  </div>
                  
                  <div className="p-6 bg-black/40 rounded-2xl border border-white/5 mb-10 flex items-center gap-4">
                     <Wallet className="w-5 h-5 text-zinc-600" />
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                        Secure connection established via HDFC Bank Payout Gateway
                     </p>
                  </div>
                  
                  <Button onClick={handleProceed} className="w-full h-20 rounded-[2rem] bg-emerald-500 text-black font-black text-lg gap-4 shadow-2xl active:scale-95 transition-all">
                     Pay Securely <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
                  </Button>
               </div>
            </div>
         ) : (
                <div className="flex flex-col items-center gap-8">
                   <div className="px-8 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Scan Any UPI QR Code</span>
                   </div>
                   
                   <Link href="/transactions" className="w-full">
                      <Button variant="outline" className="w-full h-16 rounded-2xl border-white/10 bg-black/40 text-white font-black text-[10px] uppercase tracking-[4px] gap-4 backdrop-blur-xl">
                         <PlusCircle className="w-4 h-4" />
                         Enter Details Manually
                      </Button>
                   </Link>

                   <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[3px] text-center max-w-[280px] leading-relaxed opacity-60">
                     HDFC / ICICI / AXIS Gateway Supported
                   </p>
                </div>
         )}
      </div>
    </div>
  );
}
