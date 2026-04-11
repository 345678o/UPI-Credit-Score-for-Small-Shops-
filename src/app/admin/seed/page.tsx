
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Zap, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useUser, useMemoFirebase } from "@/firebase";
import { getFirestore, doc, writeBatch, collection, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * PRODUCTION UTILITY: Seed Dynamic Merchant Data
 * This internal tool populates the merchant hub with 7 days of historical performance records.
 */
export default function SeedDataPage() {
  const { user } = useUser();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const db = getFirestore();
  const router = useRouter();

  const seed = async () => {
    if (!user) return;
    setStatus("loading");
    
    try {
      const batch = writeBatch(db);
      const userId = user.uid;

      // 1. Generate 7 Days of Aggregates
      const categories = ["Electronics", "Fashion", "F&B", "Essentials", "Luxury"];
      const merchants = ["Aman Wholesalers", "Cloud Retail", "Nexus Logistics", "Swift Delivery", "Metro Mart"];
      
      let totalEarnings = 0;
      let totalExpenses = 0;
      let categoryBreakdown: Record<string, number> = {};

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayEarnings = Math.floor(Math.random() * 20000) + 15000;
        const dayExpenses = Math.floor(Math.random() * 8000) + 2000;
        const count = Math.floor(Math.random() * 20) + 10;
        
        totalEarnings += dayEarnings;
        totalExpenses += dayExpenses;

        const aggRef = doc(db, "users", userId, "dailyBusinessAggregates", dateStr);
        batch.set(aggRef, {
          date: dateStr,
          totalEarnings: dayEarnings,
          totalExpenses: dayExpenses,
          netEarnings: dayEarnings - dayExpenses,
          transactionCount: count,
          uniqueCustomersCount: Math.floor(count * 0.8),
          updatedAt: serverTimestamp()
        });

        // Add 2 Transactions per day to history
        const txnId1 = `txn_seed_${i}_1`;
        const txnRef1 = doc(db, "users", userId, "transactions", txnId1);
        const cat = categories[i % categories.length];
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

        batch.set(txnRef1, {
          amount: dayEarnings / 2,
          type: "credit",
          method: "UPI",
          category: cat,
          payerIdentifier: `Customer ${Math.floor(Math.random() * 100)}`,
          status: "completed",
          timestamp: date,
          userId
        });
      }

      // 2. Set Analytics Summary
      const summaryRef = doc(db, "users", userId, "userAnalyticsSummary", "current");
      batch.set(summaryRef, {
        totalEarningsOverall: totalEarnings,
        totalExpensesOverall: totalExpenses,
        totalTransactionsCount: 70,
        averageOrderValue: totalEarnings / 70,
        categoryBreakdown,
        dailyEarnings: 24500, // Simulated "Today"
        previousWeekEarnings: totalEarnings * 0.8,
        lastUpdated: serverTimestamp()
      });

      // 3. Seed Customers
      const customerNames = ["Rahul Mehta", "Sneha Kapoor", "Amit Shah", "Priya Das", "Vikram Singh"];
      customerNames.forEach((name, idx) => {
        const custRef = doc(db, "users", userId, "customers", `cust_${idx}`);
        batch.set(custRef, {
          name,
          totalSpent: Math.floor(Math.random() * 50000) + 10000,
          visitCount: Math.floor(Math.random() * 15) + 5,
          lastVisit: serverTimestamp(),
          loyaltyLevel: idx === 0 ? "Gold" : "Silver"
        });
      });

      // 4. Update Credit Profile securely (using set with merge to create if missing)
      const userRef = doc(db, "users", userId);
      batch.set(userRef, {
        creditScore: 785,
        loanEligibleAmount: 150000,
        businessAge: 42,
        isGuestDemo: true
      }, { merge: true });

      await batch.commit();
      setStatus("success");
      
      setTimeout(() => router.push('/'), 2000);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto py-20">
        <Card className="premium-card bg-zinc-900 border-white/5 p-12 text-center space-y-10">
           <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto">
              <Database className="w-10 h-10 text-indigo-500" />
           </div>
           
           <div className="space-y-4">
              <h1 className="text-3xl font-black text-white tracking-tighter">Data Seeding Engine</h1>
              <p className="text-sm font-bold text-zinc-500 leading-relaxed">
                 Initialize your merchant hub with 7 days of high-fidelity historical data, analytical aggregates, and customer segments.
              </p>
           </div>

           {status === "idle" && (
              <Button onClick={seed} className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black text-lg gap-4 shadow-2xl active:scale-95 transition-all">
                 <Zap className="w-6 h-6 fill-white" />
                 Initialize Prototype Data
              </Button>
           )}

           {status === "loading" && (
              <div className="flex flex-col items-center gap-6 py-4">
                 <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[4px]">Syncing Decentralized Nodes</p>
              </div>
           )}

           {status === "success" && (
              <div className="space-y-6">
                 <div className="flex items-center gap-4 justify-center text-emerald-500">
                    <CheckCircle2 className="w-8 h-8" />
                    <span className="text-2xl font-black">Success</span>
                 </div>
                 <p className="text-xs font-bold text-zinc-500">Hub data successfully persisted. Routing to Dashboard...</p>
              </div>
           )}

           {status === "error" && (
              <div className="space-y-6">
                 <div className="flex items-center gap-4 justify-center text-rose-500">
                    <AlertCircle className="w-8 h-8" />
                    <span className="text-2xl font-black">Sync Failure</span>
                 </div>
                 <p className="text-xs font-bold text-zinc-500 tracking-wider uppercase">Check console for Firestore permissions</p>
                 <Button onClick={() => setStatus("idle")} variant="ghost" className="text-zinc-400">Retry Manual Sync</Button>
              </div>
           )}

           <div className="pt-10 border-t border-white/5">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                 Authorized Personnel Only • Environment: Development
              </p>
           </div>
        </Card>
      </div>
    </AppShell>
  );
}
