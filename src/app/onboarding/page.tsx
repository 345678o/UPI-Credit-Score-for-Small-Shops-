
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ShieldCheck, IndianRupee, ArrowRight, Store, Mail, Info, User as UserIcon, Briefcase, Zap, Link as LinkIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, initiateAnonymousSignIn, setDocumentNonBlocking } from "@/firebase";
import { doc, getFirestore, serverTimestamp, getDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessType, setBusinessType] = useState("Kirana");
  const [onboardingType, setOnboardingType] = useState<"new" | "existing" | null>(null);
  const [existingId, setExistingId] = useState("");
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  // Redirect if already onboarded
  useEffect(() => {
    async function checkExisting() {
        if (!isUserLoading && user) {
            const db = getFirestore();
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists() && snap.data().businessName) {
                router.push("/");
            } else {
                setStep(3);
            }
        }
    }
    checkExisting();
  }, [user, isUserLoading, router]);

  const handleSendCode = () => {
    if (email.includes("@")) {
      setStep(2);
    }
  };

  const handleVerifyCode = () => {
    initiateAnonymousSignIn(auth);
  };

  const handleCompleteOnboarding = () => {
    if (!user) return;
    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
    
    setDocumentNonBlocking(userRef, {
      id: user.uid,
      businessName: businessName || "My Store",
      ownerName: ownerName || "Merchant",
      email: email,
      phoneNumber: "Not Provided",
      bankAccountNumber: "XXXXXXXXXXXX",
      ifscCode: "IFSC0001234",
      businessType: businessType,
      creditScore: 350,
      loanEligibleAmount: 10000,
      rewardPoints: 100,
      createdAt: serverTimestamp(),
    }, { merge: true });

    router.push("/");
  };

  const handleLinkAccount = async () => {
    if (!user || !existingId) return;
    // Logic to "combine" or link would go here. 
    // For this prototype, we'll simulate a successful link.
    const db = getFirestore();
    const existingRef = doc(db, "users", existingId);
    const existingSnap = await getDoc(existingRef);
    
    if (existingSnap.exists()) {
        const data = existingSnap.data();
        setDocumentNonBlocking(doc(db, "users", user.uid), {
            ...data,
            id: user.uid, // Maintain new auth UID but copy data
            linkedFrom: existingId,
            linkedAt: serverTimestamp()
        }, {});
        router.push("/");
    } else {
        alert("Business ID not found.");
    }
  };

  return (
    <div className="flex flex-col p-10 bg-black min-h-[100dvh] w-full relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-[100px]" />

      <div className="mt-16 mb-16 relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
           <IndianRupee className="w-12 h-12 text-black stroke-[2.5px]" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">CrediPay</h1>
        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[4px] mt-2">Financial Trust Engine</p>
      </div>

      <div className="flex-1 space-y-8 relative z-10 max-w-sm mx-auto w-full">
        {step === 1 ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white mb-2">Access Portal</h2>
              <p className="text-sm text-zinc-500 font-bold leading-relaxed">
                Connect your business to the network of digital trust.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                 <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                 <Input 
                   className="h-20 bg-zinc-900/50 border-white/5 focus-visible:ring-emerald-500/30 rounded-[2rem] pl-16 pr-8 text-lg font-black text-white transition-all" 
                   placeholder="Merchant Email" 
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
              </div>
              <Button 
                className="w-full h-20 rounded-[2.5rem] bg-emerald-500 text-black font-black text-lg gap-4 shadow-xl active:scale-95 disabled:opacity-50 transition-all font-sans"
                onClick={handleSendCode}
                disabled={!email.includes("@")}
              >
                Log In
                <ArrowRight className="w-5 h-5 stroke-[3px]" />
              </Button>

              <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                 <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[4px] bg-black px-4 text-zinc-700">Audit Only</div>
              </div>

              <Button 
                variant="outline"
                className="w-full h-20 rounded-[2.5rem] border-zinc-800 text-emerald-500 font-black text-xs gap-4 hover:bg-emerald-500/5 active:scale-95 transition-all uppercase tracking-[3px]"
                onClick={() => {
                  initiateAnonymousSignIn(auth);
                  // The useEffect will catch the user and move to Step 3 or Dashboard
                }}
              >
                <Zap className="w-4 h-4 fill-emerald-500" />
                Quickstart Demo Hub
              </Button>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center">
              <h2 className="text-2xl font-black text-white mb-2">Authentication</h2>
              <p className="text-sm text-zinc-500 font-bold leading-relaxed">
                Enter the simulation code sent to your email.
              </p>
            </div>

            <div className="flex justify-between gap-3 px-2">
               {[1,2,3,4].map(i => (
                 <input 
                   key={i} 
                   className="w-16 h-20 bg-zinc-900/50 border border-white/5 rounded-[1.5rem] text-center text-3xl font-black text-emerald-500 focus:border-emerald-500 focus:bg-zinc-900 outline-none transition-all tabular-nums" 
                   maxLength={1}
                   placeholder="•"
                 />
               ))}
            </div>

            <Button 
              className="w-full h-20 rounded-[2.5rem] bg-emerald-500 text-black font-black text-lg shadow-xl active:scale-95 transition-all"
              onClick={handleVerifyCode}
            >
              Verify
            </Button>
            
            <div className="flex items-center gap-3 bg-zinc-900 p-6 rounded-[2rem] border border-white/5">
              <Info className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-[10px] font-bold text-zinc-400 leading-snug">
                SIMULATION: Any code will work in the current testing environment.
              </p>
            </div>
          </div>
        ) : onboardingType === null ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-white mb-2">Setup Preference</h2>
                    <p className="text-sm text-zinc-500 font-bold">How would you like to build your profile?</p>
                </div>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => setOnboardingType("new")}
                        className="w-full p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 text-left transition-all group flex items-center gap-6"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                            <Plus className="w-6 h-6 text-emerald-500 group-hover:text-black" />
                        </div>
                        <div>
                            <h3 className="font-black text-white">Create New Business</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Start from zero</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setOnboardingType("existing")}
                        className="w-full p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 text-left transition-all group flex items-center gap-6"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                            <LinkIcon className="w-6 h-6 text-zinc-500 group-hover:text-black" />
                        </div>
                        <div>
                            <h3 className="font-black text-white">Connect To Existing</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Link with Business ID</p>
                        </div>
                    </button>
                </div>
            </div>
        ) : onboardingType === "new" ? (
           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center">
               <h2 className="text-2xl font-black text-white mb-2">New Store</h2>
               <p className="text-sm text-zinc-500 font-bold leading-relaxed">
                 Configure your primary business identity.
               </p>
             </div>

             <div className="space-y-4">
                <div className="relative">
                   <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                   <Input 
                    className="h-20 bg-zinc-900/50 border-white/5 rounded-[2rem] pl-16 font-black text-white" 
                    placeholder="Owner Name" 
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                   />
                </div>
                <div className="relative">
                   <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                   <Input 
                    className="h-20 bg-zinc-900/50 border-white/5 rounded-[2rem] pl-16 font-black text-white" 
                    placeholder="Business Name" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                   />
                </div>
                <div className="relative">
                   <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 z-10" />
                   <Select value={businessType} onValueChange={setBusinessType}>
                     <SelectTrigger className="h-20 bg-zinc-900/50 border-white/5 rounded-[2rem] pl-16 font-black text-white text-left">
                       <SelectValue placeholder="Category" />
                     </SelectTrigger>
                     <SelectContent className="rounded-[1.5rem] font-black bg-zinc-900 border-white/10 text-white">
                       <SelectItem value="Kirana">General Store</SelectItem>
                       <SelectItem value="Restaurant">Restaurant</SelectItem>
                       <SelectItem value="Salon">Salon / Spa</SelectItem>
                       <SelectItem value="Electronics">Electronics</SelectItem>
                       <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
             </div>

             <Button 
               className="w-full h-20 rounded-[2.5rem] bg-emerald-500 text-black font-black text-lg shadow-xl active:scale-95 transition-all disabled:opacity-50"
               onClick={handleCompleteOnboarding}
               disabled={!businessName || !ownerName}
             >
               Initialize Store
             </Button>

             <button onClick={() => setOnboardingType(null)} className="w-full text-center text-[10px] font-black text-zinc-500 uppercase tracking-[2px]">
                Back to Options
             </button>
           </div>
        ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-white mb-2">Connect Profile</h2>
                    <p className="text-sm text-zinc-500 font-bold">Sync your multi-store identity.</p>
                </div>
                
                <div className="space-y-4">
                    <div className="relative">
                        <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                        <Input 
                            className="h-20 bg-zinc-900/50 border-white/5 rounded-[2rem] pl-16 font-black text-white uppercase" 
                            placeholder="EXISTING BUSINESS ID" 
                            value={existingId}
                            onChange={(e) => setExistingId(e.target.value)}
                        />
                    </div>
                    <Button 
                        className="w-full h-20 rounded-[2.5rem] bg-emerald-500 text-black font-black text-lg shadow-xl active:scale-95 transition-all disabled:opacity-50"
                        onClick={handleLinkAccount}
                        disabled={!existingId}
                    >
                        Link Account
                    </Button>
                </div>
                <button onClick={() => setOnboardingType(null)} className="w-full text-center text-[10px] font-black text-zinc-500 uppercase tracking-[2px]">
                    Back to Options
                </button>
            </div>
        )}
      </div>

      <div className="mt-auto py-12 flex items-center justify-center gap-4 text-[10px] font-black text-zinc-700 uppercase tracking-[5px]">
        <ShieldCheck className="w-5 h-5" />
        Verified Protocol
      </div>
    </div>
  );
}
