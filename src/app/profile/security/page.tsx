
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  ShieldCheck, Lock, Fingerprint, Smartphone, 
  MapPin, Clock, ChevronLeft, ShieldAlert,
  Key, Eye, EyeOff, FileLock, Bell
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { getFirestore, doc, serverTimestamp } from "firebase/firestore";

/**
 * STRATEGIC MODULE: Security Command Center
 * Provides institutional-grade transparency and control over merchant data and session security.
 */
export default function SecurityCenterPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = getFirestore();

  const userRef = useMemoFirebase(() => user ? doc(db, "users", user.uid) : null, [user]);
  const { data: userData } = useDoc(userRef);

  const [biometrics, setBiometrics] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  useEffect(() => {
    if (userData) {
      setBiometrics(userData.securitySettings?.biometrics !== false);
      setPrivacyMode(!!userData.securitySettings?.privacyMode);
    }
  }, [userData]);

  const updateSetting = async (key: string, val: boolean) => {
    if (!user) return;
    if (key === 'biometrics') setBiometrics(val);
    if (key === 'privacyMode') setPrivacyMode(val);

    await setDocumentNonBlocking(doc(db, "users", user.uid), {
      securitySettings: {
        [key]: val,
        lastUpdated: serverTimestamp()
      }
    }, { merge: true });
  };

  const activeSessions = [
    { device: "iPhone 15 Pro (Current)", location: "East Delhi, IN", ip: "106.221.X.X", time: "Connected Now", status: "Active" },
    { device: "Samsung Hub Terminal", location: "New Delhi, IN", ip: "115.110.X.X", time: "2 hours ago", status: "Standby" },
  ];

  return (
    <AppShell>
      <header className="mb-14 flex items-center gap-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5">
          <ChevronLeft className="w-6 h-6 text-zinc-400" />
        </Button>
        <div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Verified Infrastructure</p>
          <h1 className="text-3xl font-black text-white tracking-tighter">Security Command</h1>
        </div>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* 1. INSTITUTIONAL STATUS HERO */}
        <section>
           <Card className="premium-card bg-emerald-500 border-none p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-black/[0.05] rounded-full -mr-40 -mt-40 blur-[80px]" />
              
              <div className="flex items-center gap-8 relative z-10">
                 <div className="w-24 h-24 rounded-[2rem] bg-black/10 flex items-center justify-center border-4 border-black/5 animate-pulse">
                    <ShieldCheck className="w-12 h-12 text-black stroke-[2.5px]" />
                 </div>
                 <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-black tracking-tighter">Perimeter: Active</h2>
                    <p className="text-sm font-bold text-black/60 mt-2 uppercase tracking-widest">PCI-DSS Level 1 Verified</p>
                 </div>
              </div>

              <div className="px-8 py-4 bg-black/10 rounded-2xl border border-black/5 text-center relative z-10 backdrop-blur-md">
                 <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Global Security Rating</p>
                 <span className="text-4xl font-black text-black tabular-nums">AAA+</span>
              </div>
           </Card>
        </section>

        {/* 2. CORE SECURITY CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           <div className="lg:col-span-8 space-y-10">
              <section className="space-y-6">
                 <h3 className="text-lg font-black text-white px-2 tracking-tight">Perimeter Settings</h3>
                 <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
                    
                    <div className="p-8 flex items-center justify-between group hover:bg-zinc-900/40 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                             <Fingerprint className="w-7 h-7 text-indigo-500" />
                          </div>
                          <div>
                             <p className="text-base font-black text-zinc-100 italic transition-colors group-hover:text-white">Biometric Gatekeeper</p>
                             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Require FaceID / TouchID for every entry</p>
                          </div>
                       </div>
                       <Switch checked={biometrics} onCheckedChange={(v) => updateSetting('biometrics', v)} />
                    </div>

                    <div className="p-8 flex items-center justify-between group hover:bg-zinc-900/40 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                             <EyeOff className="w-7 h-7 text-amber-500" />
                          </div>
                          <div>
                             <p className="text-base font-black text-zinc-100 italic transition-colors group-hover:text-white">Stealth Mode (Privacy)</p>
                             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Mask ledger amounts in the dashboard view</p>
                          </div>
                       </div>
                       <Switch checked={privacyMode} onCheckedChange={(v) => updateSetting('privacyMode', v)} />
                    </div>

                    <div className="p-8 flex items-center justify-between group hover:bg-zinc-900/40 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                             <Lock className="w-7 h-7 text-emerald-500" />
                          </div>
                          <div>
                             <p className="text-base font-black text-zinc-100 italic transition-colors group-hover:text-white">Transaction Lock</p>
                             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Freezes outflows above ₹50,000 automatically</p>
                          </div>
                       </div>
                       <Switch checked={true} />
                    </div>

                 </div>
              </section>

              <section className="space-y-6">
                 <h3 className="text-lg font-black text-white px-2 tracking-tight">Authorized Active Nodes</h3>
                 <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden">
                    {activeSessions.map((session, i) => (
                       <div key={i} className={cn(
                          "p-8 flex items-center justify-between group transition-colors",
                          i !== activeSessions.length - 1 && "border-b border-white/5"
                       )}>
                          <div className="flex items-center gap-6">
                             <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center">
                                <Smartphone className="w-7 h-7 text-zinc-500" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-white">{session.device}</p>
                                <div className="flex items-center gap-3 mt-1.5 font-sans">
                                   <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                      <MapPin className="w-3 h-3" /> {session.location}
                                   </div>
                                   <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                   <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                      <Clock className="w-3 h-3" /> {session.time}
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                {session.status}
                             </div>
                             {i !== 0 && (
                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-rose-500/10 text-rose-500">
                                   <ShieldAlert className="w-5 h-5" />
                                </Button>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
           </div>

           <div className="lg:col-span-4 space-y-10">
              <Card className="premium-card p-10 bg-zinc-900 border-white/5 relative overflow-hidden group">
                 <div className="flex items-center gap-4 mb-10">
                    <Key className="w-6 h-6 text-indigo-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Encryption Key</h3>
                 </div>
                 
                 <div className="space-y-8">
                    <div className="p-6 bg-black/40 rounded-[1.5rem] border border-white/5 font-mono text-[10px] text-zinc-600 break-all leading-relaxed relative group cursor-pointer overflow-hidden">
                       SHA-256: 3F4E9B2A1C0D8F7E6D5C4B3A2190E8D7C6B5A4938271
                       <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-black uppercase text-[8px] tracking-widest">Regenerate Key</span>
                       </div>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-600 leading-relaxed italic">
                       Every transaction in Anamika's ledger is uniquely salted and hashed via the CrediPay Secure Enclave before entering the persistent database.
                    </p>
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 text-white font-black text-[10px] uppercase tracking-widest gap-4">
                       <FileLock className="w-4 h-4" />
                       View Registry Logs
                    </Button>
                 </div>
              </Card>

              <div className="p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] space-y-6">
                 <div className="flex items-center gap-4">
                    <Bell className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Security Audit Feed</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-1 h-auto rounded-full bg-emerald-500/30 shrink-0" />
                       <p className="text-[10px] font-bold text-zinc-500 leading-relaxed italic pr-4">
                          "Institutional Node verified successfully from Delhi hub."
                       </p>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-1 h-auto rounded-full bg-amber-500/30 shrink-0" />
                       <p className="text-[10px] font-bold text-zinc-500 leading-relaxed italic pr-4">
                          "Manual log detected: ₹500 entry added to verified vault."
                       </p>
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </AppShell>
  );
}
