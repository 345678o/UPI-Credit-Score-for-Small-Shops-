"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, IndianRupee, BarChart3, ShieldCheck, User } from "lucide-react";
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
    <div className="flex flex-col h-full w-full pb-28">
      <main className="flex-1 overflow-y-auto px-5 pt-8">
        {children}
      </main>
      
      <div className="nav-pill">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all p-2 rounded-full",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              {isActive && (
                <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
