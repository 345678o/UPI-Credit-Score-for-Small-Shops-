"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, IndianRupee, BarChart3, ShieldCheck, User, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Payments", icon: IndianRupee, href: "/payments" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Credit", icon: ShieldCheck, href: "/credit" },
  { label: "Profile", icon: User, href: "/profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-full pb-24">
      <main className="flex-1 overflow-y-auto px-5 pt-8">
        {children}
      </main>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 backdrop-blur-xl border border-gray-100/50 shadow-[0_15px_35px_rgba(0,0,0,0.1)] rounded-[2rem] flex justify-around items-center py-4 px-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all relative px-2 py-1",
                isActive ? "text-indigo-600 scale-110" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[9px] font-black uppercase tracking-widest", !isActive && "hidden")}>{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-indigo-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
