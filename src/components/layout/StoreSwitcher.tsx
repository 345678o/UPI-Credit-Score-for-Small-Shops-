"use client";

import { useStore } from "@/context/StoreContext";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Store, ChevronDown, Check, LayoutGrid, Plus, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function StoreSwitcher({ className, isCollapsed = false }: { className?: string, isCollapsed?: boolean }) {
  const { stores, selectedStore, setSelectedStore } = useStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full h-14 rounded-2xl bg-zinc-900 border-white/5 flex items-center transition-all hover:bg-zinc-800",
            isCollapsed ? "px-0 justify-center" : "px-4 justify-between gap-3 text-left",
            className
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                {selectedStore ? <Store className="w-4 h-4 text-emerald-500" /> : <LayoutGrid className="w-4 h-4 text-emerald-500" />}
             </div>
             {!isCollapsed && (
               <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black text-white truncate uppercase tracking-widest leading-none">
                    {selectedStore ? selectedStore.name : "All Locations"}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">
                    {selectedStore ? selectedStore.location : `${stores.length} Stores Active`}
                  </span>
               </div>
             )}
          </div>
          {!isCollapsed && <ChevronDown className="w-4 h-4 text-zinc-600 shrink-0" />}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 bg-zinc-950 border-white/10 rounded-2xl p-2 shadow-2xl animate-in zoom-in-95 duration-200" align="start">
        <div className="px-2 py-3">
           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Switch Entity</p>
        </div>
        
        <DropdownMenuItem 
          onClick={() => setSelectedStore(null)}
          className={cn(
            "h-12 rounded-xl mb-1 gap-3 px-3 cursor-pointer",
            !selectedStore ? "bg-emerald-500/10 text-emerald-500" : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="flex-1 text-xs font-black uppercase tracking-widest">Aggregated View</span>
          {!selectedStore && <Check className="w-4 h-4" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/5 my-2" />
        
        <div className="max-h-[250px] overflow-y-auto pr-1">
           {stores.length === 0 && (
             <div className="py-8 text-center px-4">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No individual stores</p>
             </div>
           )}
           
           {stores.map((store) => (
             <DropdownMenuItem 
               key={store.id}
               onClick={() => setSelectedStore(store)}
               className={cn(
                 "h-12 rounded-xl mb-1 gap-3 px-3 cursor-pointer",
                 selectedStore?.id === store.id ? "bg-emerald-500/10 text-emerald-500" : "text-zinc-400 hover:text-white hover:bg-white/5"
               )}
             >
               <Store className="w-4 h-4" />
               <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-xs font-black uppercase tracking-widest truncate">{store.name}</span>
                  <span className="text-[9px] font-bold text-zinc-600 truncate">{store.location}</span>
               </div>
               {selectedStore?.id === store.id && <Check className="w-4 h-4 shrink-0" />}
             </DropdownMenuItem>
           ))}
        </div>

        <DropdownMenuSeparator className="bg-white/5 my-2" />
        
        <Link href="/settings/stores">
          <DropdownMenuItem className="h-12 rounded-xl gap-3 px-3 text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer">
             <Plus className="w-4 h-4" />
             <span className="text-xs font-black uppercase tracking-widest">Manage Stores</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
