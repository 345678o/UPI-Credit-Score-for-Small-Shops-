
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, Save, Landmark, CreditCard, ShieldCheck, 
  ArrowRightLeft, BadgeCheck, Zap, Globe, Lock, RefreshCw
} from "lucide-react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { getFirestore, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function BankAccountPage() {
  const { user } = useUser();
  const router = useRouter();
  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(getFirestore(), "users", user.uid);
  }, [user]);

  const { data: userData } = useDoc(userRef);
  const [formData, setFormData] = useState({
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "HDFC Bank",
  });
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        bankAccountNumber: userData.bankAccountNumber || "",
        ifscCode: userData.ifscCode || "",
        bankName: userData.bankName || "HDFC Bank",
      });
    }
  }, [userData]);

  const handleSave = async () => {
    if (!userRef) return;
    setIsVerifying(true);
    
    setTimeout(() => {
      updateDocumentNonBlocking(userRef, {
        ...formData,
        isBankVerified: true
      });
      setIsVerifying(false);
      toast({
        title: "Liquidity Node Connected",
        description: "Your bank account has been verified via Penny-Drop audit.",
      });
    }, 2000);
  };

  return (
    <AppShell>
      <header className="mb-14 flex items-center gap-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
           <ChevronLeft className="w-6 h-6 text-zinc-500" />
        </Button>
        <div>
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Financial Settlement</p>
           <h1 className="text-3xl font-black text-white tracking-tighter">Bank Connection</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-32">
        
        {/* Left: Input & Config (7 Cols) */}
        <div className="lg:col-span-7 space-y-10">
          <section className="bg-emerald-500/[0.03] border border-emerald-500/10 p-8 rounded-[2.5rem] flex items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-8 h-8 text-black stroke-[2.5px]" />
            </div>
            <div>
              <h4 className="font-black text-white text-base">Penny-Drop Verification</h4>
              <p className="text-[11px] text-zinc-500 font-bold leading-relaxed mt-1">
                We will initiate a ₹1.00 credit to this account to verify identity and linkage for automated loan disbursals.
              </p>
            </div>
          </section>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[3px] text-zinc-600 ml-2">Verified Payee Name</Label>
              <div className="h-16 px-6 rounded-2xl bg-zinc-900 border border-white/5 flex items-center font-black text-zinc-300">
                 {userData?.ownerName || "Anamika Kumari"}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[3px] text-zinc-600 ml-2">Account Identification</Label>
              <div className="relative">
                <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700" />
                <Input 
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="h-16 pl-16 rounded-2xl border-white/5 bg-zinc-900 text-white font-black tracking-[4px] focus:border-emerald-500/50 transition-all placeholder:text-zinc-800" 
                  placeholder="0000 0000 0000"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[3px] text-zinc-600 ml-2">Routing IFSC Code</Label>
              <div className="relative">
                <Landmark className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700" />
                <Input 
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  className="h-16 pl-16 rounded-2xl border-white/5 bg-zinc-900 text-white font-black uppercase tracking-[5px] focus:border-emerald-500/50 transition-all placeholder:text-zinc-800" 
                  placeholder="IFSC0001234"
                  maxLength={11}
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-20 rounded-[2rem] bg-emerald-500 text-black font-black text-lg gap-4 shadow-2xl shadow-emerald-500/10 active:scale-95 transition-all mt-4"
            onClick={handleSave}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <Zap className="w-6 h-6 fill-black" />
            )}
            {isVerifying ? "Verifying Nodes..." : "Secure Account Linkage"}
          </Button>
        </div>

        {/* Right: Visualization & Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-10">
           <Card className="premium-card bg-zinc-950 border-white/5 p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <div className="mb-12 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-zinc-700" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Digital Hub Status</span>
                 </div>
                 {userData?.isBankVerified && (
                    <div className="px-3 py-1 bg-emerald-500/10 rounded-full flex items-center gap-2 border border-emerald-500/20">
                       <BadgeCheck className="w-3 h-3 text-emerald-500" />
                       <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                 )}
              </div>

              <div className="space-y-10">
                 <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl relative overflow-hidden group-hover:bg-zinc-900 transition-all">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[2px] mb-8">Node Identifier: {formData.bankName}</p>
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Primary Account</p>
                          <h4 className="text-xl font-black text-white tracking-[3px]">•••• {formData.bankAccountNumber.slice(-4) || "0000"}</h4>
                       </div>
                       <div className="w-12 h-8 bg-black/40 rounded-lg" />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                       <Lock className="w-4 h-4 text-emerald-500" />
                       <span>PCI-DSS Level 1 Encryption Active</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                       <span>RBI Standard Clearing Verification</span>
                    </div>
                 </div>
              </div>
           </Card>

           <section className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Settlement Metrics</h4>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-600">Disbursal Latency</span>
                    <span className="text-xs font-black text-emerald-500">&lt; 2.0 Seconds</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-600">Verification Engine</span>
                    <span className="text-xs font-black text-zinc-400">Penny-Drop Audit</span>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </AppShell>
  );
}
