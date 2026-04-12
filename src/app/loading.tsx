import { TowerLoader } from "@/components/ui/TowerLoader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <TowerLoader />
      <p className="mt-20 text-[10px] font-black text-emerald-500 uppercase tracking-[8px] animate-pulse">Syncing Ledger...</p>
    </div>
  );
}
