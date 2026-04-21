"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, Suspense } from "react";
import {
  ShieldCheck, IndianRupee, ArrowRight, Store, Mail,
  Info, User as UserIcon, Briefcase, Zap, Link as LinkIcon,
  Plus, CheckCircle2, QrCode, Sparkles, Building2,
  Lock, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, initiateAnonymousSignIn, initiateEmailSignIn, setDocumentNonBlocking } from "@/firebase";
import { doc, getFirestore, serverTimestamp, getDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { processReferralCode } from "@/lib/referral-system";

function OnboardingContent() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessType, setBusinessType] = useState("Kirana");
  const [onboardingType, setOnboardingType] = useState<"new" | "existing" | null>(null);
  const [existingId, setExistingId] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, isUserLoading, userError } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appliedReferral, setAppliedReferral] = useState<string | null>(null);

  useEffect(() => {
    async function checkExisting() {
      if (!isUserLoading && user) {
        setIsLoading(false);
        const db = getFirestore();
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().businessName) {
          router.push("/");
        } else {
          setStep(3);
        }
      } else if (!isUserLoading && !user) {
        setIsLoading(false);
      }
    }
    checkExisting();
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const code = sessionStorage.getItem("referral_code") || searchParams.get("ref");
    if (code) {
      setAppliedReferral(code);
    }
  }, [searchParams]);

  useEffect(() => {
    if (userError) {
      setAuthError(userError.message);
      setIsLoading(false);
    }
  }, [userError]);

  const handleEmailSignIn = () => {
    if (!email || !password) {
      setAuthError("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    setAuthError("");
    
    try {
      initiateEmailSignIn(auth, email, password);
    } catch (error) {
      setAuthError("Failed to sign in. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = () => {
    setIsLoading(true);
    setAuthError("");
    
    try {
      initiateAnonymousSignIn(auth);
    } catch (error) {
      setAuthError("Failed to start sandbox session.");
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!user) return;
    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);

    await setDocumentNonBlocking(userRef, {
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
      rewardPoints: appliedReferral ? 350 : 100, // Extra 250 for referral
      createdAt: serverTimestamp(),
    }, { merge: true });

    if (appliedReferral) {
      try {
        await processReferralCode(db, appliedReferral, user.uid);
      } catch (e) {
        console.error("Referral application failed", e);
      }
      sessionStorage.removeItem("referral_code");
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="hidden lg:flex flex-col space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full w-fit backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[3px] text-zinc-400">Institutional Grade Ledger</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tight leading-[0.9]">
              Powering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">The Modern Merchant.</span>
            </h1>
            <p className="text-lg text-zinc-500 font-medium max-w-md">
              Secure payments, intelligent credit lines, and real-time business analytics for the next generation of commerce.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-sm">
              <Zap className="w-6 h-6 text-emerald-500 mb-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Instant Liquidity</h3>
              <p className="text-xs text-zinc-600">Access credit lines based on your sales velocity.</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-indigo-400 mb-4" />
              <h3 className="font-bold text-sm uppercase tracking-wider mb-1">AI Auditing</h3>
              <p className="text-xs text-zinc-600">Automated ledger reconciliation for peace of mind.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md bg-zinc-900/50 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500 opacity-50" />

            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-emerald-500 rounded-[1.75rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 group-hover:rotate-6 transition-transform duration-500">
                <IndianRupee className="w-10 h-10 text-black stroke-[3px]" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter mb-2">Merchant Access</h2>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Enter the financial infrastructure</p>
            </div>

            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {authError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold text-center">
                      {authError}
                    </div>
                  )}
                  
                  <div className="relative group/input">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within/input:text-emerald-500 transition-colors" />
                    <Input
                      className="h-18 bg-black/40 border-white/10 rounded-[1.5rem] pl-16 text-lg font-bold text-white transition-all focus:border-emerald-500/50"
                      placeholder="business@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                    />
                  </div>

                  <div className="relative group/input">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within/input:text-emerald-500 transition-colors" />
                    <Input
                      className="h-18 bg-black/40 border-white/10 rounded-[1.5rem] pl-16 text-lg font-bold text-white transition-all focus:border-emerald-500/50"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                    />
                  </div>

                  <Button
                    className="w-full h-18 rounded-[1.5rem] bg-emerald-500 text-black font-black text-lg gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                    disabled={!email.includes("@") || !password || isLoading}
                    onClick={handleEmailSignIn}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                    <ArrowRight className="w-5 h-5 stroke-[3px]" />
                  </Button>

                  <div className="flex items-center justify-center space-x-4 py-2">
                    <div className="h-[1px] flex-1 bg-white/5" />
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Or Quick Access</span>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full h-18 rounded-[1.5rem] border border-white/5 hover:bg-white/5 text-zinc-400 font-black text-xs uppercase tracking-[2px] transition-all"
                    disabled={isLoading}
                    onClick={handleAnonymousSignIn}
                  >
                    <Zap className="w-4 h-4 fill-emerald-500 mr-2" />
                    Launch Sandbox Terminal
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black tracking-tight">Profile Setup</h2>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">Initialize your business data</p>
                    {appliedReferral && (
                      <div className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full inline-flex items-center gap-2">
                        <Zap className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Referral Applied: {appliedReferral} (+₹250 Bonus)</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                      <Input
                        className="h-16 bg-black/40 border-white/10 rounded-[1.25rem] pl-16 text-sm font-bold"
                        placeholder="Owner Name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                      <Input
                        className="h-16 bg-black/40 border-white/10 rounded-[1.25rem] pl-16 text-sm font-bold"
                        placeholder="Business Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 z-10" />
                      <Select value={businessType} onValueChange={setBusinessType}>
                        <SelectTrigger className="h-16 bg-black/40 border-white/10 rounded-[1.25rem] pl-16 font-bold text-zinc-400">
                          <SelectValue placeholder="Industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-[1.25rem]">
                          <SelectItem value="Kirana">General Store</SelectItem>
                          <SelectItem value="Restaurant">Restaurant</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    className="w-full h-18 rounded-[1.5rem] bg-emerald-500 text-black font-black text-lg mt-4 shadow-2xl active:scale-95 transition-all"
                    onClick={handleCompleteOnboarding}
                    disabled={!businessName || !ownerName}
                  >
                    Confirm & Start
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-12 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 text-zinc-600">
                <Lock className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-[2px]">AES-256 Encrypted Traffic</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 opacity-30 flex items-center space-x-6 text-[10px] font-black uppercase tracking-[3px] text-zinc-400 relative z-10">
        <span>Public Beta 1.0</span>
        <div className="w-1 h-1 bg-zinc-700 rounded-full" />
        <span>Hub Node Active</span>
        <div className="w-1 h-1 bg-zinc-700 rounded-full" />
        <span>PCI Compliant</span>
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
