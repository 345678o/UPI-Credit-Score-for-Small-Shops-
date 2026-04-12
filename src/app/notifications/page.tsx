
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { 
  ChevronLeft, 
  Bell, 
  BellOff, 
  ArrowUpRight, 
  CheckCircle2, 
  IndianRupee, 
  Sparkles,
  Mail,
  Smartphone,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useUser, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { getFirestore, collection, query, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";
import { useState } from "react";
import { EmailService } from "@/lib/email-service";
import { toast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const { user } = useUser();
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  
  const notificationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(getFirestore(), "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  }, [user]);

  const { data: notifications, isLoading } = useCollection(notificationsQuery);

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      await EmailService.triggerAlert('high_value', { 
        amount: 25000, 
        email: user?.email 
      });
      toast({
        title: "Test Alert Dispatched",
        description: `A simulated security alert has been sent to ${user?.email || 'your registered mail'}.`,
      });
    } catch (e) {
      toast({
        title: "Dispatch Failed",
        description: "Could not establish connection to mail server.",
        variant: "destructive"
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const markAsRead = (id: string) => {
    if (!user) return;
    const ref = doc(getFirestore(), "users", user.uid, "notifications", id);
    updateDocumentNonBlocking(ref, { isRead: true });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'credit_score_increase': return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'loan_approved': return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case 'transaction_successful': return <IndianRupee className="w-5 h-5 text-emerald-600" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'credit_score_increase': return 'bg-emerald-50';
      case 'loan_approved': return 'bg-primary/5';
      case 'transaction_successful': return 'bg-emerald-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <AppShell>
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
             <Link href="/profile"><ChevronLeft className="w-6 h-6" /></Link>
          </Button>
          <h1 className="text-3xl font-black text-primary tracking-tighter italic">Alert Center</h1>
        </div>
        
        <div className="flex items-center gap-3">
           <div className={cn(
             "px-6 py-3 rounded-full border transition-all flex items-center gap-3 cursor-pointer",
             isEmailEnabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-gray-100 border-gray-200 text-gray-400"
           )} onClick={() => setIsEmailEnabled(!isEmailEnabled)}>
              <Mail className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Email Alerts {isEmailEnabled ? "ON" : "OFF"}</span>
           </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-4 pb-12">
         <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[5px] mb-6 px-4">Recent Transmissions</h3>
      {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-[2rem]" />)
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notif: any) => (
            <div 
              key={notif.id} 
              onClick={() => markAsRead(notif.id)}
              className={cn(
                "p-5 rounded-[2rem] border transition-all active:scale-[0.98] relative overflow-hidden",
                notif.isRead ? "bg-white border-gray-100 opacity-60" : "bg-white border-primary/20 shadow-md"
              )}
            >
              {!notif.isRead && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />}
              <div className="flex gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", getBg(notif.type))}>
                   {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Recently'}
                  </p>
                  <p className="text-sm font-black text-primary leading-tight">{notif.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6">
               <BellOff className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-primary">Quiet for now</h3>
            <p className="text-sm text-muted-foreground font-bold mt-1 leading-relaxed">
              We&apos;ll notify you here about <br/> payments and credit growth.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
