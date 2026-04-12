
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Home, IndianRupee, Gift, ShieldCheck, User, 
  BarChart3, Users, Settings, LogOut, Bell, Search, Command,
  Menu, ChevronLeft, ChevronRight, X, BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { TransitionOverlay } from "@/components/ui/TransitionOverlay";

const navItems = [
  { label: "Overview", icon: Home, href: "/", desktopOnly: false },
  { label: "Ledger", icon: BarChart3, href: "/transactions", desktopOnly: false },
  { label: "Customers", icon: Users, href: "/customers", desktopOnly: false },
  { label: "Insights", icon: BrainCircuit, href: "/insights", desktopOnly: false },
  { label: "Credit", icon: ShieldCheck, href: "/credit", desktopOnly: false },
  { label: "Profile", icon: User, href: "/profile", desktopOnly: false },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/onboarding");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden relative">
      <TransitionOverlay />
      
      {/* 1. Desktop Sidebar (Collapsible) */}
      <aside className={cn(
        "hidden md:flex flex-col h-full bg-zinc-950 border-r border-white/5 p-6 relative z-50 transition-all duration-300 ease-in-out shadow-2xl",
        isCollapsed ? "w-24 p-4" : "w-72"
      )}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-zinc-950 hover:scale-110 active:scale-95 transition-all z-[60]"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-black" /> : <ChevronLeft className="w-4 h-4 text-black" />}
        </button>

        <div className={cn("flex items-center gap-3 mb-12 px-2 transition-all", isCollapsed && "justify-center")}>
           <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <span className="font-black text-black text-xl italic">C</span>
           </div>
           {!isCollapsed && (
             <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-xl font-black text-white tracking-widest text-caption">CrediPay</h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Infrastructure Layer</p>
             </div>
           )}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center rounded-2xl transition-all group overflow-hidden",
                  isCollapsed ? "justify-center w-full aspect-square" : "gap-4 px-4 py-4 w-full",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110 shrink-0", isActive && "stroke-[2.5px]")} />
                {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{item.label}</span>}
                {!isCollapsed && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
           <div className={cn(
             "flex items-center rounded-2xl bg-zinc-900/50 border border-white/5 transition-all overflow-hidden",
             isCollapsed ? "justify-center p-2" : "gap-4 px-4 py-3"
           )}>
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                  <User className="w-5 h-5 text-zinc-500" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{user?.email?.split('@')[0] || "Merchant"}</p>
                   <p className="text-[9px] font-bold text-zinc-500 uppercase">Pro Account</p>
                </div>
              )}
           </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-10 h-24 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5 shrink-0">
           <div className="flex items-center gap-4 bg-zinc-900 px-6 py-3 rounded-[1.25rem] border border-white/5 w-96 group">
              <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search audits..." 
                className="bg-transparent border-none outline-none text-xs font-bold text-zinc-300 w-full placeholder:text-zinc-700"
              />
              <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800 border border-white/5">
                 <Command className="w-3 h-3 text-zinc-600" />
                 <span className="text-[9px] font-black text-zinc-600">K</span>
              </div>
           </div>

           <div className="flex items-center gap-8">
              <Link href="/notifications" className="relative group p-2">
                 <Bell className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                 <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-zinc-950" />
              </Link>
              <Link href="/credit">
                <Button className="h-12 px-8 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-emerald-500/10 active:scale-95 transition-all">
                   <IndianRupee className="w-4 h-4 stroke-[3px]" />
                   Issue Credit
                </Button>
              </Link>
           </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-[1400px] mx-auto w-full pt-6 md:pt-12 px-3 md:px-12 pb-36 md:pb-12">
            {children}
          </div>
        </main>

        {/* 3. Mobile Navigation (Hidden on md+) */}
        <div className="md:hidden nav-pill">
          {navItems.filter(i => !i.desktopOnly).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all p-3 rounded-full",
                  isActive ? "text-primary scale-110" : "text-white/40 hover:text-white"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]")} />
                {isActive && (
                  <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
