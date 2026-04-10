"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save, Landmark, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { getFirestore, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function BankAccountPage() {
  const { user } = useUser();
  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(getFirestore(), "users", user.uid);
  }, [user]);

  const { data: userData } = useDoc(userRef);
  const [formData, setFormData] = useState({
    bankAccountNumber: "",
    ifscCode: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        bankAccountNumber: userData.bankAccountNumber || "",
        ifscCode: userData.ifscCode || "",
      });
    }
  }, [userData]);

  const handleSave = () => {
    if (!userRef) return;
    updateDocumentNonBlocking(userRef, formData);
    toast({
      title: "Bank Details Updated",
      description: "Your financial information has been securely updated.",
    });
  };

  return (
    <AppShell>
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link href="/profile"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-xl font-extrabold font-headline">Bank Account</h1>
      </header>

      <div className="space-y-6 pb-12">
        <div className="bg-emerald-50 p-5 rounded-[2rem] border border-emerald-100 flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-black text-emerald-950 text-sm">Secure Linking</h4>
            <p className="text-[11px] text-emerald-800 font-bold leading-tight mt-0.5 opacity-80">
              This account is used for loan disbursals and automated credit score validation.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                className="h-14 pl-12 rounded-2xl border-none bg-white shadow-sm font-bold tracking-widest" 
                placeholder="XXXX XXXX XXXX XXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">IFSC Code</Label>
            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                className="h-14 pl-12 rounded-2xl border-none bg-white shadow-sm font-black uppercase tracking-[3px]" 
                placeholder="IFSC0001234"
                maxLength={11}
              />
            </div>
          </div>
        </div>

        <Button 
          className="w-full h-16 rounded-2xl indigo-gradient text-white font-black text-lg gap-3 shadow-xl active:scale-95 transition-all mt-8"
          onClick={handleSave}
        >
          <Save className="w-5 h-5" />
          Update Bank Info
        </Button>

        <div className="text-center pt-8">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            PCI-DSS & RBI Compliant
          </p>
        </div>
      </div>
    </AppShell>
  );
}
