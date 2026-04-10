"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ShieldCheck, IndianRupee, ArrowRight, Building2, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser, initiateAnonymousSignIn } from "@/firebase";
import { doc, setDoc, getFirestore, serverTimestamp } from "firebase/firestore";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user && step < 3) {
      setStep(3);
    }
  }, [user, isUserLoading, step]);

  const handleSendOTP = () => {
    if (phone.length === 10) {
      setStep(2);
    }
  };

  const handleVerifyOTP = () => {
    // Simulate OTP verification by signing in anonymously
    // In production, this would use signInWithPhoneNumber
    initiateAnonymousSignIn(auth);
  };

  const handleCompleteOnboarding = async () => {
    if (!user) return;
    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
    
    await setDoc(userRef, {
      id: user.uid,
      businessName: businessName || "My Store",
      ownerName: "Merchant",
      phoneNumber: `+91${phone}`,
      bankAccountNumber: "XXXXXXXXXXXX",
      ifscCode: "IFSC0001234",
      businessType: "General Store",
      creditScore: 300,
      loanEligibleAmount: 0,
      createdAt: serverTimestamp(),
    }, { merge: true });

    router.push("/");
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-white h-full">
      <div className="mt-12 mb-12">
        <div className="w-20 h-20 rounded-[2rem] indigo-gradient flex items-center justify-center mb-8 shadow-2xl shadow-indigo-100">
           <IndianRupee className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-black text-primary font-headline tracking-tighter">
          CrediPay
        </h1>
        <p className="text-muted-foreground font-bold mt-2 uppercase tracking-[2px] text-xs">
          Smart Merchant Credit
        </p>
      </div>

      <div className="flex-1 space-y-6">
        {step === 1 ? (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-2xl font-black text-primary mb-2">Login / Register</h2>
              <p className="text-sm text-muted-foreground font-bold leading-relaxed">
                Empowering small business owners across India with digital growth.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                 <div className="w-16 h-16 bg-gray-50 border-2 border-transparent rounded-2xl flex items-center justify-center font-black text-xl text-primary">
                    +91
                 </div>
                 <Input 
                   className="h-16 bg-gray-50 border-2 border-transparent focus:border-indigo-600/10 focus:bg-white rounded-2xl flex-1 px-6 text-xl font-black tabular-nums transition-all" 
                   placeholder="Mobile Number" 
                   type="tel"
                   maxLength={10}
                   value={phone}
                   onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                 />
              </div>
              <Button 
                className="w-full h-16 rounded-2xl indigo-gradient text-white font-black text-lg gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                onClick={handleSendOTP}
                disabled={phone.length !== 10}
              >
                Send OTP
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
             <div>
              <h2 className="text-2xl font-black text-primary mb-2">Verify OTP</h2>
              <p className="text-sm text-muted-foreground font-bold leading-relaxed">
                Enter any 6-digit code (Simulation Mode).
              </p>
            </div>

            <div className="flex justify-between gap-3">
               {[1,2,3,4,5,6].map(i => (
                 <input 
                   key={i} 
                   className="w-full h-16 bg-gray-50 border-2 border-transparent rounded-2xl text-center text-2xl font-black focus:border-indigo-600 focus:bg-white outline-none transition-all tabular-nums" 
                   maxLength={1}
                 />
               ))}
            </div>

            <Button 
              className="w-full h-16 rounded-2xl indigo-gradient text-white font-black text-lg shadow-xl active:scale-95 transition-all"
              onClick={handleVerifyOTP}
            >
              Verify & Continue
            </Button>
            
            <p className="text-center text-xs font-black uppercase tracking-widest text-muted-foreground">
               Didn't receive? <button className="text-indigo-600 underline ml-1">Resend in 30s</button>
            </p>
          </div>
        ) : (
           <div className="space-y-8 animate-in slide-in-from-right duration-300">
             <div>
               <h2 className="text-2xl font-black text-primary mb-2">Business Info</h2>
               <p className="text-sm text-muted-foreground font-bold leading-relaxed">
                 Help us set up your digital storefront.
               </p>
             </div>

             <div className="space-y-4">
                <div className="relative">
                   <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <Input 
                    className="h-16 bg-gray-50 border-none rounded-2xl pl-12 font-black" 
                    placeholder="Business Name" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                   />
                </div>
                <div className="relative">
                   <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <Input className="h-16 bg-gray-50 border-none rounded-2xl pl-12 font-black" placeholder="GST Number (Optional)" />
                </div>
             </div>

             <Button 
               className="w-full h-16 rounded-2xl gradient-cta text-white font-black text-lg shadow-xl active:scale-95 transition-all disabled:opacity-50"
               onClick={handleCompleteOnboarding}
               disabled={!businessName}
             >
               Get Started
             </Button>
           </div>
        )}
      </div>

      <div className="mt-auto py-8 flex items-center justify-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-[3px]">
        <div className="bg-emerald-50 p-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>
        PCI-DSS Compliant
      </div>
    </div>
  );
}
