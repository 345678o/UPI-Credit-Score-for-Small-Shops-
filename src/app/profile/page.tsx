"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Settings, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  LogOut,
  Bell,
  CreditCard,
  Share2,
  Lock,
  MessageSquare
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
    { icon: Building2, label: "Business Details", color: "text-blue-600", bg: "bg-blue-50", href: "/profile/business" },
    { icon: CreditCard, label: "Bank Account", color: "text-emerald-600", bg: "bg-emerald-50", href: "/profile/bank" },
    { icon: Bell, label: "Notifications", color: "text-orange-500", bg: "bg-orange-50", href: "/notifications" },
    { icon: Lock, label: "Security", color: "text-purple-600", bg: "bg-purple-50", href: "/profile/security" },
    { icon: Share2, label: "Invite Others", color: "text-pink-600", bg: "bg-pink-50", href: "/profile/invite" },
    { icon: MessageSquare, label: "Help & Support", color: "text-gray-600", bg: "bg-gray-50", href: "/profile/support" },
  ];

  return (
    <AppShell>
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold font-headline text-primary">Account</h1>
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-100 shadow-sm">
           <Settings className="w-5 h-5 text-primary" />
        </Button>
      </header>

      <div className="space-y-8 pb-12">
        <Card className="premium-card overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="relative">
                <Avatar className="w-20 h-20 rounded-[1.75rem] border-4 border-indigo-50 shadow-xl">
                  <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/400/400`} data-ai-hint="Merchant Profile" />
                  <AvatarFallback className="bg-indigo-600 text-white font-black text-xl">
                    {userData?.businessName?.[0] || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary tracking-tight">{userData?.businessName || "My Store"}</h2>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Verified Business</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  ID: {user?.uid.substring(0, 10).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-1">Owner</p>
                <p className="text-sm font-black text-primary truncate">{userData?.ownerName || "Merchant"}</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-1">Type</p>
                <p className="text-sm font-black text-primary truncate">{userData?.businessType || "Store"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-5">
           <h3 className="font-black text-primary text-lg px-1">Business Management</h3>
           <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
             {navItems.map((item, idx, arr) => (
               <Link 
                 key={item.label} 
                 href={item.href} 
                 className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 ${idx !== arr.length - 1 ? 'border-b border-gray-50/50' : ''}`}
               >
                 <div className="flex items-center gap-5">
                   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.bg)}>
                      <item.icon className={cn("w-5 h-5", item.color)} />
                   </div>
                   <span className="text-[15px] font-black text-primary">{item.label}</span>
                 </div>
                 <ChevronRight className="w-5 h-5 text-gray-300" />
               </Link>
             ))}
           </div>
        </section>

        <Button 
          variant="outline" 
          className="w-full h-16 rounded-2xl border-2 border-red-50 text-red-600 font-black gap-3 mt-6 hover:bg-red-50 hover:text-red-700 active:scale-95 transition-all"
          onClick={handleLogout}
        >
           <LogOut className="w-5 h-5" />
           Logout Account
        </Button>

        <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[3px] py-12">
           CrediPay v2.4.0 • Made with ❤️ in India
        </p>
      </div>
    </AppShell>
  );
}
