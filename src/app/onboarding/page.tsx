"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ShieldCheck, IndianRupee, ArrowRight, Building2, Store, Mail, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, initiateAnonymousSignIn } from "@/firebase";
import { doc, setDoc, getFirestore, serverTimestamp } from "firebase/firestore";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user && step < 3) {
      setStep(3);
    }
  }, [user, isUserLoading, step]);

  const handleSendCode = () => {
    if (email.includes("@")) {
      setStep(2);
    }
  };

  const handleVerifyCode = () => {
    // Simulation: Signs in anonymously for the prototype
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
      email: email,
      phoneNumber: "",
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
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <Input 
                   className="h-16 bg-gray-50 border-2 border-transparent focus:border-indigo-600/10 focus:bg-white rounded-2xl flex-1 pl-12 pr-6 text-lg font-black transition-all" 
                   placeholder="Email Address" 
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
              </div>
              <Button 
                className="w-full h-16 rounded-2xl indigo-gradient text-white font-black text-lg gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                onClick={handleSendCode}
                disabled={!email.includes("@")}
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
             <div>
              <h2 className="text-2xl font-black text-primary mb-2">Verify Simulation</h2>
              <p className="text-sm text-muted-foreground font-bold leading-relaxed">
                Enter any 6-digit code. In this prototype, real emails are not sent.
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
              onClick={handleVerifyCode}
            >
              Verify & Continue
            </Button>
            
            <div className="flex items-center gap-2 justify-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-[10px] font-bold text-blue-800 leading-tight">
                PROTOTYPE MODE: Verification is simulated. No real email will be sent to <b>{email}</b>.
              </p>
            </div>
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
