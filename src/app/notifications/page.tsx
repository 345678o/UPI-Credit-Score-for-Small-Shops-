"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Bell, BellOff, ArrowUpRight, CheckCircle2, IndianRupee, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { getFirestore, collection, query, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";

export default function NotificationsPage() {
  const { user } = useUser();
  
  const notificationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(getFirestore(), "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );
  }, [user]);

  const { data: notifications, isLoading } = useCollection(notificationsQuery);

  const markAsRead = (id: string) => {
    if (!user) return;
    const ref = doc(getFirestore(), "users", user.uid, "notifications", id);
    updateDocumentNonBlocking(ref, { isRead: true });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'credit_score_increase': return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'loan_approved': return <CheckCircle2 className="w-5 h-5 text-indigo-600" />;
      case 'transaction_successful': return <IndianRupee className="w-5 h-5 text-emerald-600" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'credit_score_increase': return 'bg-emerald-50';
      case 'loan_approved': return 'bg-indigo-50';
      case 'transaction_successful': return 'bg-emerald-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <AppShell>
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link href="/profile"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-xl font-extrabold font-headline text-primary">Notifications</h1>
      </header>

      <div className="space-y-4 pb-12">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-3xl" />)
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notif: any) => (
            <div 
              key={notif.id} 
              onClick={() => markAsRead(notif.id)}
              className={cn(
                "p-5 rounded-[2rem] border transition-all active:scale-[0.98] relative overflow-hidden",
                notif.isRead ? "bg-white border-gray-100 opacity-70" : "bg-white border-indigo-100 shadow-md"
              )}
            >
              {!notif.isRead && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-600" />}
              <div className="flex gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", getBg(notif.type))}>
                   {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}
                  </p>
                  <p className="text-sm font-black text-primary leading-snug">{notif.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6">
               <BellOff className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-primary">All caught up!</h3>
            <p className="text-sm text-muted-foreground font-bold mt-1">
              You&apos;ll get notified about your <br/> business growth here.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
