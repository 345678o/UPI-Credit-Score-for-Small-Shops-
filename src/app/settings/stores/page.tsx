"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, Store, MapPin, Phone, Trash2, 
  ChevronLeft, AlertCircle, CheckCircle2,
  Building2, ArrowRight, Settings2, TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { useStore } from "@/context/StoreContext";
import { createStore, archiveStore, Store as StoreType } from "@/lib/store-management";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function StoreManagementPage() {
  const { user } = useUser();
  const { stores, refreshStores, isLoading: isContextLoading } = useStore();
  const router = useRouter();

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    location: "",
    address: "",
    category: "Retail",
    contactNumber: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createStore(user.uid, newStore);
      await refreshStores();
      setIsAdding(false);
      setNewStore({ name: "", location: "", address: "", category: "Retail", contactNumber: "" });
    } catch (error) {
      console.error("Failed to create store", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (storeId: string) => {
    if (!user || !confirm("Are you sure you want to archive this store location? Historical data will be preserved.")) return;
    try {
      await archiveStore(user.uid, storeId);
      await refreshStores();
    } catch (error) {
      console.error("Failed to archive store", error);
    }
  };

  return (
    <AppShell>
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5">
              <ChevronLeft className="w-6 h-6 text-zinc-400" />
           </Button>
           <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Enterprise Hub</p>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Manage Locations</h1>
           </div>
        </div>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="h-14 px-8 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-widest gap-3 shadow-xl active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3px]" /> Add Store
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-32">
        {/* Stores List */}
        <div className="lg:col-span-8 space-y-5">
           {isContextLoading ? (
             [...Array(2)].map((_, i) => (
               <div key={i} className="h-48 bg-zinc-950 border border-white/5 rounded-[2.5rem] animate-pulse" />
             ))
           ) : stores.length === 0 && !isAdding ? (
             <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-950/40 border-2 border-dashed border-white/5 rounded-[3rem]">
                <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-8">
                   <Building2 className="w-10 h-10 text-zinc-700" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">No secondary stores yet</h3>
                <p className="text-zinc-600 text-sm font-bold max-w-xs mb-10">
                   Scale your business by adding your physical shop locations to CrediPay for unified auditing.
                </p>
                <Button onClick={() => setIsAdding(true)} className="h-16 px-10 rounded-2xl bg-emerald-500 text-black font-black gap-3">
                   Initialize First Store <ArrowRight className="w-5 h-5" />
                </Button>
             </div>
           ) : (
             stores.map((store) => (
               <Card key={store.id} className="premium-card bg-zinc-950 border-white/5 p-8 lg:p-10 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Store className="w-24 h-24 text-white" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <Store className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="text-xl font-black text-white tracking-tight">{store.name}</h3>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{store.category} Store</p>
                           </div>
                        </div>
                        
                        <div className="space-y-2 pt-4">
                           <div className="flex items-center gap-3 text-zinc-400">
                              <MapPin className="w-4 h-4 text-zinc-600" />
                              <span className="text-xs font-bold">{store.location} — {store.address}</span>
                           </div>
                           <div className="flex items-center gap-3 text-zinc-400">
                              <Phone className="w-4 h-4 text-zinc-600" />
                              <span className="text-xs font-bold">{store.contactNumber}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-row md:flex-col gap-3 justify-end">
                        <Button variant="outline" className="h-12 w-12 md:w-auto md:px-6 rounded-xl border-white/5 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                           <Settings2 className="w-4 h-4" />
                           <span className="hidden md:ml-3 md:block text-[10px] uppercase font-black tracking-widest">Edit</span>
                        </Button>
                        <Button 
                          onClick={() => handleArchive(store.id)}
                          variant="outline" 
                          className="h-12 w-12 md:w-auto md:px-6 rounded-xl border-white/5 bg-zinc-900 text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all border-rose-500/10"
                        >
                           <Trash2 className="w-4 h-4" />
                           <span className="hidden md:ml-3 md:block text-[10px] uppercase font-black tracking-widest">Archive</span>
                        </Button>
                     </div>
                  </div>
               </Card>
             ))
           )}
        </div>

        {/* Add Store Form / Sidebar */}
        <div className="lg:col-span-4">
           {isAdding ? (
             <Card className="premium-card bg-zinc-900 border-emerald-500/20 p-10 lg:p-12 animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-black text-white mb-10 tracking-tight">New Entity Details</h3>
                <form onSubmit={handleCreate} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Store Name</label>
                      <input 
                        required
                        value={newStore.name} 
                        onChange={e => setNewStore({...newStore, name: e.target.value})}
                        className="w-full h-14 bg-zinc-950 border border-white/5 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all" 
                        placeholder="e.g. South Extension Branch"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">City/Area</label>
                      <input 
                        required
                        value={newStore.location} 
                        onChange={e => setNewStore({...newStore, location: e.target.value})}
                        className="w-full h-14 bg-zinc-950 border border-white/5 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all" 
                        placeholder="e.g. New Delhi"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Address</label>
                      <textarea 
                        required
                        value={newStore.address} 
                        onChange={e => setNewStore({...newStore, address: e.target.value})}
                        className="w-full h-32 bg-zinc-950 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all resize-none" 
                        placeholder="B-42, South Extension II..."
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Business Contact</label>
                      <input 
                        required
                        value={newStore.contactNumber} 
                        onChange={e => setNewStore({...newStore, contactNumber: e.target.value})}
                        className="w-full h-14 bg-zinc-950 border border-white/5 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all" 
                        placeholder="+91 XXXXX XXXXX"
                      />
                   </div>
                   
                   <div className="pt-8 flex gap-3">
                      <Button 
                        type="button"
                        variant="ghost" 
                        onClick={() => setIsAdding(false)}
                        className="flex-1 h-16 rounded-2xl text-zinc-500 font-black text-xs uppercase tracking-widest"
                      >
                         Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] h-16 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/10 active:scale-95 transition-all"
                      >
                        {isSubmitting ? "Provisioning..." : "Confirm & Registry"}
                      </Button>
                   </div>
                </form>
             </Card>
           ) : (
             <Card className="premium-card bg-zinc-950 border-white/5 p-10 lg:p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <TrendingUp className="w-12 h-12 text-emerald-500" />
                </div>
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px] mb-8">Aggregation Utility</h4>
                <div className="space-y-8">
                   <div>
                      <h3 className="text-xl font-black text-white mb-3 tracking-tight">Enterprise Scaling</h3>
                      <p className="text-[11px] font-bold text-zinc-500 leading-relaxed italic">
                         Add multiple stores to unlock **Aggregated Credit Eligibility**. Your combined transaction volume across all locations increases your safe capital limit by up to 3x.
                      </p>
                   </div>
                   <div className="h-px bg-white/5" />
                   <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                         <AlertCircle className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                         <p className="text-xs font-black text-white">Cross-Entity Benchmarking</p>
                         <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-1">Compare store health side-by-side using Gemini AI.</p>
                      </div>
                   </div>
                </div>
             </Card>
           )}
        </div>
      </div>
    </AppShell>
  );
}
