"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Loader2 } from "lucide-react";

/**
 * Redirecting legacy invite page to new centralized referrals system.
 */
export default function InvitePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/referrals");
  }, [router]);

  return (
    <AppShell>
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[5px] animate-pulse">
            Transitioning to Referral Hub
        </p>
      </div>
    </AppShell>
  );
}
