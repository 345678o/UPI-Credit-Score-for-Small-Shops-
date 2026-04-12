
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, Filter, ArrowUpRight, 
  Crown, Star, UserPlus, MoreHorizontal,
  TrendingUp, Calendar, CreditCard, ShoppingBag,
  Download, Mail, Phone, ExternalLink
} from "lucide-react";
import { useUser, useCollection, useMemoFirebase } from "@/firebase";
import { getFirestore, collection, query, orderBy } from "firebase/firestore";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Customer {
  id: string;
  name: string;
  totalSpent: number;
  visitCount: number;
  lastVisit: any;
  loyaltyLevel: "Gold" | "Silver" | "Bronze" | "Platinum";
  phone?: string;
  email?: string;
}

export default function CustomersPage() {
  const { user } = useUser();
  const db = getFirestore();
  const [searchQuery, setSearchQuery] = useState("");

  const customersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "users", user.uid, "customers"),
      orderBy("lastVisit", "desc")
    );
  }, [user]);

  const { data: customers, isLoading } = useCollection(customersQuery);
  const [loyaltyFilter, setLoyaltyFilter] = useState<string>("All");

  const filteredCustomers = (customers || []).filter((c: any) => {
    const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.phone?.includes(searchQuery);
    const matchesLoyalty = loyaltyFilter === "All" || c.loyaltyLevel === loyaltyFilter;
    return matchesSearch && matchesLoyalty;
  });

  const exportToCSV = () => {
    if (!filteredCustomers.length) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = ["Name", "Phone", "Email", "Loyalty Level", "Total Spent", "Visit Count", "Last Visit"];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.phone || "N/A",
      c.email || "N/A",
      c.loyaltyLevel || "Bronze",
      c.totalSpent || 0,
      c.visitCount || 0,
      c.lastVisit?.toDate ? c.lastVisit.toDate().toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Successful", description: "CSV file has been downloaded." });
  };

  const stats = [
    { label: "Total Customers", value: customers?.length || 0, icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { label: "Elite Members", value: (customers || []).filter((c: any) => c.loyaltyLevel === "Gold" || c.loyaltyLevel === "Platinum").length, icon: Crown, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { label: "Avg. Visit Frequency", value: "3.2 / mo", icon: TrendingUp, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { label: "Retention Rate", value: "78%", icon: Star, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  ];

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Customer CRM</h1>
          <p className="text-[10px] font-black text-zinc-500 mt-2 uppercase tracking-[4px]">Manage your business relationships</p>
        </div>
        <div className="flex gap-3">
          <Button className="h-14 px-8 rounded-2xl bg-zinc-900 border border-white/5 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-2xl active:scale-95 transition-all hover:bg-zinc-800">
            <UserPlus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <Card key={i} className="premium-card p-6 bg-zinc-900 border-white/5 flex items-center gap-5">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bgColor)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <h2 className="text-2xl font-black text-white tracking-tighter mt-1">{stat.value}</h2>
            </div>
          </Card>
        ))}
      </div>

      <Card className="premium-card bg-zinc-950 border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="Search by name or phone..." 
              className="pl-12 h-14 bg-zinc-900 border-white/5 rounded-2xl text-xs font-bold text-white placeholder:text-zinc-600 focus:ring-emerald-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-14 px-6 rounded-2xl border-white/5 bg-zinc-900 text-zinc-400 font-bold text-xs uppercase tracking-widest gap-3">
                  <Filter className="w-4 h-4" />
                  {loyaltyFilter === "All" ? "Filter" : loyaltyFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-white/5 text-white">
                <DropdownMenuLabel className="text-zinc-500 text-[10px] uppercase tracking-widest">Loyalty Tiers</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                {["All", "Platinum", "Gold", "Silver", "Bronze"].map(level => (
                  <DropdownMenuItem 
                    key={level} 
                    className="hover:bg-white/10 cursor-pointer text-xs"
                    onClick={() => setLoyaltyFilter(level)}
                  >
                    {level}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="h-14 px-6 rounded-2xl border-white/5 bg-zinc-900 text-zinc-400 font-bold text-xs uppercase tracking-widest gap-3"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Customer Details</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Loyalty Tier</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Value</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Last Visit</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-40 bg-zinc-900 rounded-lg" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-20 bg-zinc-900 rounded-lg" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-24 bg-zinc-900 rounded-lg" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-6 w-32 bg-zinc-900 rounded-lg" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-10 ml-auto bg-zinc-900 rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center font-black text-indigo-500 text-sm">
                          {customer.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{customer.name}</p>
                          <p className="text-[10px] font-bold text-zinc-600 mt-1 uppercase tracking-tighter">{customer.phone || "No Phone Contact"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        customer.loyaltyLevel === "Gold" ? "bg-amber-500/10 text-amber-500" :
                        customer.loyaltyLevel === "Platinum" ? "bg-blue-500/10 text-blue-500" :
                        customer.loyaltyLevel === "Silver" ? "bg-zinc-400/10 text-zinc-400" :
                        "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {customer.loyaltyLevel || "Bronze"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white">₹{(customer.totalSpent || 0).toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter mt-1">{customer.visitCount || 0} Visits</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-xs font-bold text-zinc-400">
                          {customer.lastVisit?.toDate ? customer.lastVisit.toDate().toLocaleDateString() : (customer.lastVisit instanceof Date ? customer.lastVisit.toLocaleDateString() : "Never")}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/5 text-white w-48">
                          <DropdownMenuLabel className="text-zinc-500 text-[10px] uppercase tracking-widest">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem className="hover:bg-white/10 cursor-pointer gap-2 py-3">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="text-xs">View Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-white/10 cursor-pointer gap-2 py-3 text-emerald-500">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="text-xs">Contact (WA)</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-white/10 cursor-pointer gap-2 py-3">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="text-xs">Send Email</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-700">
                        <Users className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-black text-white">No customers found</h3>
                      <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                        Initialize demo data in the admin panel or record your first sale.
                      </p>
                      <Link href="/admin/seed">
                        <Button className="mt-4 bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-12">
                          Seed Demo Data
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* 4. CRM INSIGHTS SECTION */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
         <Card className="premium-card bg-zinc-900 p-8 border-white/5 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Churn Risk Analysis</h3>
               <TrendingUp className="w-4 h-4 text-rose-500 rotate-180" />
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                     <span className="text-[10px] font-black text-zinc-400 uppercase">Rahul Mehta</span>
                  </div>
                  <span className="text-[9px] font-black text-rose-500 uppercase">High Risk</span>
               </div>
               <p className="text-[9px] font-bold text-zinc-600 leading-relaxed italic">
                  * Customer hasn't visited in 14 days. Suggest sending a re-engagement offer.
               </p>
            </div>
         </Card>

         <Card className="premium-card bg-zinc-900 p-8 border-white/5 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Top Contributors</h3>
               <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-xs">P</div>
                     <span className="text-[10px] font-black text-zinc-400 uppercase">Priya Das</span>
                  </div>
                  <span className="text-[9px] font-black text-amber-500 uppercase">₹12,400 / mo</span>
               </div>
               <p className="text-[9px] font-bold text-zinc-600 leading-relaxed italic">
                  * Platinum tier candidate. Increase credit limit recommend.
               </p>
            </div>
         </Card>

         <Card className="premium-card bg-emerald-500 p-8 border-none space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20">
               <Star className="w-16 h-16 text-black" />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-widest relative z-10">Loyalty Campaign</h3>
            <div className="space-y-4 relative z-10">
               <p className="text-xl font-black text-black tracking-tighter leading-tight italic">
                  Run a cashback weekend for Silver members?
               </p>
               <Button className="w-full bg-black text-white font-black text-[10px] uppercase tracking-widest h-12 rounded-xl active:scale-95 transition-all">
                  Launch via AI Agent
               </Button>
            </div>
         </Card>
      </div>
    </AppShell>
  );
}
