"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare, Phone, Mail, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  return (
    <AppShell>
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link href="/profile"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-xl font-extrabold font-headline">Help & Support</h1>
      </header>

      <div className="space-y-6 pb-12">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col items-center text-center">
           <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-indigo-600" />
           </div>
           <h2 className="text-xl font-black text-primary tracking-tight">How can we help?</h2>
           <p className="text-muted-foreground text-sm font-bold mt-2">
             Our expert support team is <br/> available 24/7 for you.
           </p>
        </div>

        <section className="space-y-4">
           {[
             { label: "Live Chat", icon: MessageSquare, sub: "Instant help from our team", color: "text-blue-600", bg: "bg-blue-50" },
             { label: "Call Us", icon: Phone, sub: "Toll Free: 1800-CREDIPAY", color: "text-emerald-600", bg: "bg-emerald-50" },
             { label: "Email Support", icon: Mail, sub: "support@credipay.in", color: "text-orange-500", bg: "bg-orange-50" },
           ].map((item) => (
             <div key={item.label} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex gap-4 items-center">
                   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.bg)}>
                      <item.icon className={cn("w-5 h-5", item.color)} />
                   </div>
                   <div>
                      <p className="text-sm font-black text-primary">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground font-bold leading-tight">{item.sub}</p>
                   </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
             </div>
           ))}
        </section>

        <section className="pt-6 space-y-4">
           <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[3px] px-1">Resources</h3>
           <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
              {[
                { label: "Terms of Service", icon: FileText },
                { label: "Privacy Policy", icon: FileText },
                { label: "Merchant Guidelines", icon: ExternalLink },
              ].map((item, idx, arr) => (
                <div key={item.label} className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${idx !== arr.length - 1 ? 'border-b border-gray-50/50' : ''}`}>
                   <div className="flex items-center gap-4">
                      <item.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-black text-primary">{item.label}</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              ))}
           </div>
        </section>
      </div>
    </AppShell>
  );
}
