"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TowerLoader } from "./TowerLoader";

export function TransitionOverlay() {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Show loader on pathname change
    setIsTransitioning(true);
    
    // Hide after a small delay to simulate "lazy" loading
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
      <TowerLoader />
      <p className="mt-20 text-[10px] font-black text-emerald-500 uppercase tracking-[8px] animate-pulse">Switching Terminal...</p>
    </div>
  );
}
