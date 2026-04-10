"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Lock, ShieldCheck, Fingerprint, Eye } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SecuritySettingsPage() {
  return (
    <AppShell>
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link href="/profile"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-xl font-extrabold font-headline">Security</h1>
      </header>

      <div className="space-y-6 pb-12">
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl mb-8">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
           <Lock className="w-10 h-10 mb-4 opacity-50" />
           <h2 className="text-2xl font-black tracking-tight">Your data is <br/> encrypted</h2>
           <p className="text-white/60 text-xs font-bold mt-2 uppercase tracking-widest">AES-256 Bit Security</p>
        </div>

        <section className="space-y-4">
           {[
             { label: "Biometric Login", description: "Use fingerprint or face ID to unlock", icon: Fingerprint, defaultChecked: true },
             { label: "Transaction Pin", description: "Required for every payment over ₹5,000", icon: ShieldCheck, defaultChecked: true },
             { label: "Privacy Mode", description: "Hide balance on dashboard", icon: Eye, defaultChecked: false },
           ].map((item) => (
             <div key={item.label} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                   <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                   </div>
                   <div>
                      <Label className="text-sm font-black text-primary block">{item.label}</Label>
                      <p className="text-[10px] text-muted-foreground font-bold leading-tight">{item.description}</p>
                   </div>
                </div>
                <Switch defaultChecked={item.defaultChecked} />
             </div>
           ))}
        </section>

        <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-gray-100 font-black gap-3 mt-8">
           Change Login PIN
        </Button>
      </div>
    </AppShell>
  );
}
