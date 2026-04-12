"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { trackReferralClick } from "@/lib/referral-system";
import { Loader2 } from "lucide-react";

/**
 * Referral Redirect & Tracking Component
 */
function ReferralHandler() {
    const { firestore } = useFirebase();
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get("code");

    useEffect(() => {
        async function handleReferral() {
            if (code && firestore) {
                // 1. Store code for onboarding
                sessionStorage.setItem("referral_code", code);
                
                // 2. Track click (optional, but good for analytics)
                try {
                    // Note: We don't have IP here easily on client, 
                    // but trackReferralClick handles empty IP internally or we can use a placeholder
                    await trackReferralClick(firestore, code, "Client-Redirect");
                } catch (e) {
                    console.error("Referral tracking failed", e);
                }
            }
            
            // 3. Redirect to onboarding
            router.push("/onboarding?ref=" + code);
        }

        handleReferral();
    }, [code, router, firestore]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center animate-bounce">
                <Loader2 className="w-8 h-8 text-black animate-spin" />
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[5px] animate-pulse">
                Validating CrediPay Invite
            </p>
        </div>
    );
}

export default function RefPage() {
    return (
        <Suspense fallback={null}>
            <ReferralHandler />
        </Suspense>
    );
}
