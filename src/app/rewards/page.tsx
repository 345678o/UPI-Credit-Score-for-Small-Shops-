
"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Gift, Star, ArrowUpRight, Zap, Coins, ChevronRight, ExternalLink } from "lucide-react";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, getFirestore } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { getUserReferralInfo } from "@/lib/referral-system";
import { useState, useEffect } from "react";

export default function RewardsPage() {
  const { user } = useUser();
  const db = getFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [user]);

  const { data: userData } = useDoc(userRef);
  const [referralInfo, setReferralInfo] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getUserReferralInfo(user.uid).then(setReferralInfo);
    }
  }, [user]);

  const points = (userData as any)?.rewardPoints || 0;
  const nextTier = 1000;
  const progress = Math.min(100, (points / nextTier) * 100);

  const tasks = [
    { title: "First 5 Sales", progress: 60, reward: "100 pts", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
    { title: "Refer a Friend", progress: referralInfo?.referralStats?.successfulReferrals > 0 ? 100 : 0, reward: "500 pts", icon: Gift, color: "text-indigo-600", bg: "bg-indigo-50", action: "link", link: "/referrals" },
    { title: "Weekly Consistency", progress: 85, reward: "250 pts", icon: Star, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-primary tracking-tight">Rewards</h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Merchant Perks</p>
      </header>

      <div className="space-y-6 pb-8">
        <Card className="blue-gradient text-white border-none shadow-2xl overflow-hidden relative rounded-[2.5rem]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[2px] mb-2">Total Points</p>
            <h2 className="text-5xl font-black tracking-tighter tabular-nums mb-6">{points.toLocaleString()}</h2>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/80">
                <span>Silver Tier</span>
                <span>{nextTier - points} pts to Gold</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/20" />
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-lg text-primary tracking-tight">Daily Tasks</h3>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">3 Active</span>
          </div>
          
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.title} className="premium-card p-5 border border-gray-50 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", task.bg)}>
                    <task.icon className={cn("w-6 h-6", task.color)} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-primary text-sm">{task.title}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Reward: {task.reward}</p>
                  </div>
                  <div className="text-right">
                    {task.action === "link" ? (
                      <Button
                        onClick={() => window.location.href = task.link}
                        className="text-xs font-black text-primary hover:underline"
                      >
                        View
                      </Button>
                    ) : (
                      <span className="text-xs font-black text-primary">{task.progress}%</span>
                    )}
                  </div>
                </div>
                <Progress value={task.progress} className="h-1.5" />
              </Card>
            ))}
          </div>
        </section>

        <Card className="premium-card bg-emerald-500 text-white p-6 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
           <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h3 className="font-black text-lg tracking-tight">Redeem Cashback</h3>
                   <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Convert points to cash</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/10">
                 <ArrowUpRight className="w-6 h-6" />
              </Button>
           </div>
        </Card>

        <section className="space-y-4">
           <h3 className="font-black text-lg text-primary tracking-tight px-1">Recent Earnings</h3>
           <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
              {[
                { label: "Transaction Bonus", date: "Today, 10:30 AM", points: "+50", color: "text-emerald-600" },
                { label: "Daily Login", date: "Today, 09:00 AM", points: "+10", color: "text-emerald-600" },
                { label: "Referral Bonus", date: "Yesterday", points: "+500", color: "text-emerald-600" },
              ].map((item, idx, arr) => (
                <div key={idx} className={cn("flex justify-between items-center p-5", idx !== arr.length - 1 && "border-b border-gray-50")}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-primary">{item.label}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <span className={cn("font-black text-sm", item.color)}>{item.points} pts</span>
                </div>
              ))}
           </div>
        </section>
      </div>
    </AppShell>
  );
}
