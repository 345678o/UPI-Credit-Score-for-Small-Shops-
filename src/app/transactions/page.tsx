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
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-primary tracking-tight">Transactions</h1>
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-white shadow-sm bg-white">
          <Filter className="w-4 h-4 text-primary" />
        </Button>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          className="h-14 bg-white border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[1.25rem] pl-12 font-bold" 
          placeholder="Search transactions..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-[1.75rem]" />)
        ) : filteredTransactions?.map((tx) => (
          <Link key={tx.id} href={`/transactions/${tx.id}`}>
            <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.01)] active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                  {tx.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-black text-primary">{tx.payerIdentifier || "Customer"}</p>
                  <p className="text-[10px] text-muted-foreground font-bold opacity-70 mt-0.5">
                    {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Recently"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-base font-black tabular-nums tracking-tighter", tx.type === "credit" ? "text-emerald-600" : "text-red-600")}>
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                </p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter mt-0.5">{tx.status}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
