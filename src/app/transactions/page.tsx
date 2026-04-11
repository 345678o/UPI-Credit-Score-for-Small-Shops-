"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Filter, ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, getFirestore } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const db = getFirestore();
  const txnsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("timestamp", "desc")
    );
  }, [user]);

  const { data: transactions, isLoading } = useCollection(txnsQuery);

  const filteredTransactions = transactions?.filter(tx => {
    const matchesSearch = tx.payerIdentifier?.toLowerCase().includes(search.toLowerCase()) || 
                          tx.method?.toLowerCase().includes(search.toLowerCase()) ||
                          tx.amount.toString().includes(search);
    const matchesFilter = filter === "all" || tx.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell>
      <header className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link href="/"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-xl font-extrabold font-headline text-primary">Transaction History</h1>
      </header>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="h-12 bg-white border-none shadow-sm rounded-2xl pl-11 font-bold" 
            placeholder="Search transactions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["all", "credit", "debit"] as const).map((t) => (
            <Button
              key={t}
              variant={filter === t ? "default" : "outline"}
              className={cn(
                "rounded-full px-6 h-10 text-[10px] font-black uppercase tracking-widest",
                filter === t ? "indigo-gradient border-none shadow-md" : "bg-white border-gray-100"
              )}
              onClick={() => setFilter(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pb-12">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-[1.75rem]" />)
        ) : filteredTransactions && filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <Link key={tx.id} href={`/transactions/${tx.id}`}>
              <div className="flex items-center justify-between p-4 bg-white rounded-[1.75rem] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-50/50 active:scale-[0.98] transition-all mb-3">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {tx.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-primary">{tx.payerIdentifier || "Customer"}</p>
                    <p className="text-[10px] text-muted-foreground font-bold opacity-70">
                      {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Recently"} • {tx.method}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={cn("text-base font-black tabular-nums tracking-tighter", tx.type === "credit" ? "text-emerald-600" : "text-primary")}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{tx.status}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px]">No matching transactions</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
