
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Settings, 
  ChevronRight, 
  LogOut,
  Bell,
  CreditCard,
  Share2,
  Lock,
  MessageSquare,
  TrendingUp,
  Database
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser, useAuth, useDoc, useMemoFirebase } from "@/firebase";
import { getFirestore, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(getFirestore(), "users", user.uid);
  }, [user]);

  const { data: userData } = useDoc(userRef);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/onboarding");
  };

  const navItems = [
    { icon: Building2, label: "Business Details", color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/profile/business" },
    { icon: CreditCard, label: "Bank Account", color: "text-blue-500", bg: "bg-blue-500/10", href: "/profile/bank" },
    { icon: Bell, label: "Notifications", color: "text-orange-500", bg: "bg-orange-500/10", href: "/notifications" },
    { icon: Lock, label: "Security", color: "text-purple-500", bg: "bg-purple-500/10", href: "/profile/security" },
    { icon: Share2, label: "Invite Others", color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/profile/invite" },
    { icon: TrendingUp, label: "Investor Vision", color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/vision" },
    { icon: MessageSquare, label: "Help & Support", color: "text-zinc-500", bg: "bg-zinc-500/10", href: "/profile/support" },
  ];

  return (
    <AppShell>
      <header className="mb-8 flex justify-between items-center px-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Account</h1>
        <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-white/5 bg-zinc-900/50 backdrop-blur-xl">
           <Settings className="w-5 h-5 text-zinc-400" />
        </Button>
      </header>

      <div className="space-y-8 pb-32 px-1">
        <Card className="premium-card overflow-hidden bg-zinc-900/40 border border-white/5">
          <CardContent className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <Avatar className="w-24 h-24 rounded-3xl border-4 border-zinc-800 shadow-2xl">
                  <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/400/400`} data-ai-hint="Merchant Profile" />
                  <AvatarFallback className="bg-emerald-500 text-black font-black text-2xl">
                    {userData?.businessName?.[0] || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-black flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-white tracking-tighter truncate">{userData?.businessName || "My Store"}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[2px]">Verified Merchant</p>
                </div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2 truncate">
                  ID: {user?.uid.substring(0, 12).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 p-5 rounded-[1.75rem] border border-white/5">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[2px] mb-2">Owner</p>
                <p className="text-sm font-black text-white truncate">{userData?.ownerName || "Merchant"}</p>
              </div>
              <div className="bg-zinc-900/50 p-5 rounded-[1.75rem] border border-white/5">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[2px] mb-2">Category</p>
                <p className="text-sm font-black text-white truncate">{userData?.businessType || "Retail"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-6">
           <h3 className="font-black text-white text-lg px-2 tracking-tight">Business Systems</h3>
           <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden">
             {navItems.map((item, idx, arr) => (
               <Link 
                 key={item.label} 
                 href={item.href} 
                 className={cn(
                   "flex items-center justify-between p-6 hover:bg-zinc-900/50 transition-colors active:bg-zinc-900",
                   idx !== arr.length - 1 && "border-b border-white/5"
                 )}
               >
                 <div className="flex items-center gap-5">
                    <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg", item.bg)}>
                       <item.icon className={cn("w-6 h-6", item.color)} />
                    </div>
                    <span className="text-[16px] font-black text-zinc-200">{item.label}</span>
                 </div>
                 <ChevronRight className="w-5 h-5 text-zinc-700" />
               </Link>
             ))}
           </div>
        </section>

        <section className="space-y-6">
           <h3 className="font-black text-rose-500/60 text-[10px] px-4 uppercase tracking-[40%] text-center">Developer Utility</h3>
           <div className="bg-rose-500/5 rounded-[2.5rem] border border-rose-500/10 p-2">
              <Link href="/admin/seed">
                <Button variant="ghost" className="w-full h-18 py-8 rounded-[2rem] text-rose-500 font-black gap-4 hover:bg-rose-500/10 transition-all text-xs uppercase tracking-widest">
                   <Database className="w-5 h-5" />
                   Seed Production Data
                </Button>
              </Link>
           </div>
        </section>

        <Button 
          variant="outline" 
          className="w-full h-18 py-8 rounded-[2rem] border-zinc-800 text-red-500 font-black gap-3 mt-8 bg-zinc-900/20 hover:bg-red-500/10 hover:border-red-500/20 active:scale-95 transition-all text-lg uppercase tracking-widest"
          onClick={handleLogout}
        >
           <LogOut className="w-6 h-6" />
           Terminate Session
        </Button>

        <div className="flex flex-col items-center py-16">
           <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[5px] mb-2">
              CrediPay v2.6.0
           </p>
           <p className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">
              Secured by Alternative Credit Engine
           </p>
        </div>
      </div>
    </AppShell>
  );
}