"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Copy, Users, IndianRupee } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

export default function InvitePage() {
  const referralCode = "CREDI-7729-PAY";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Code Copied",
      description: "Share this code with other merchants to earn rewards.",
    });
  };

  return (
    <AppShell>
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link href="/profile"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-xl font-extrabold font-headline">Invite Others</h1>
      </header>

      <div className="space-y-8 pb-12">
        <div className="bg-emerald-600 p-10 rounded-[3rem] text-white text-center relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
           <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10">
              <Users className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-black tracking-tighter mb-2">Grow Together</h2>
           <p className="text-emerald-100 text-sm font-bold opacity-80">
             Invite a fellow merchant and get <br/> <span className="text-white text-lg">₹500 Credit Bonus</span>
           </p>
        </div>

        <section className="space-y-6">
           <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px] mb-4">Your Referral Code</p>
              <div className="flex items-center gap-2 justify-center">
                 <div className="bg-white px-8 py-5 rounded-2xl border-2 border-dashed border-gray-200 font-black text-xl tracking-[4px] text-primary shadow-sm">
                    {referralCode}
                 </div>
                 <Button size="icon" className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100" onClick={handleCopy}>
                    <Copy className="w-6 h-6" />
                 </Button>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center gap-2">
                 <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                 </div>
                 <p className="text-[20px] font-black text-primary">0</p>
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Invited</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center gap-2">
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                 </div>
                 <p className="text-[20px] font-black text-primary">₹0</p>
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Earned</p>
              </div>
           </div>
        </section>

        <Button className="w-full h-16 rounded-3xl indigo-gradient text-white font-black text-lg gap-3 shadow-xl mt-4">
           <Share2 className="w-6 h-6" />
           Share Referral Link
        </Button>
      </div>
    </AppShell>
  );
}
