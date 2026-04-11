"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, Users, TrendingUp, Share2, Copy, CheckCircle2, 
  ExternalLink, Eye, EyeOff, QrCode, Smartphone,
  Mail, MessageCircle, Zap, Trophy, Star, ArrowUpRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { 
  createReferralCode, 
  getUserReferralInfo, 
  trackReferralClick,
  getReferralAnalytics,
  processReferralCode
} from "@/lib/referral-system";

export default function ReferralsPage() {
  const { user } = useUser();
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [referralCode, setReferralCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (user) {
      loadReferralInfo();
      loadAnalytics();
    }
  }, [user]);

  const loadReferralInfo = async () => {
    if (!user) return;
    const info = await getUserReferralInfo(user.uid);
    setReferralInfo(info);
  };

  const loadAnalytics = async () => {
    if (!user) return;
    const data = await getReferralAnalytics(user.uid);
    setAnalytics(data);
  };

  const handleCreateCode = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const result = await createReferralCode(user.uid);
      if (result.success) {
        setReferralCode(result.code || "");
        setShowCode(true);
        await loadReferralInfo();
      } else {
        alert(result.error || "Failed to create referral code");
      }
    } catch (error) {
      console.error('Error creating referral code:', error);
      alert("Failed to create referral code");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;
    
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!referralInfo?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(referralInfo.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShareWhatsApp = () => {
    if (!referralInfo?.shareUrl) return;
    
    const message = `Join CrediPay using my referral code: ${referralCode}\n\n${referralInfo.shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    if (!referralInfo?.shareUrl) return;
    
    const subject = "Join CrediPay - Exclusive Invitation";
    const body = `Hi!\n\nI've been using CrediPay for my business and it's been amazing. I'd like to invite you to join too.\n\nUse my referral code: ${referralCode}\n\nSign up here: ${referralInfo.shareUrl}\n\nLet me know if you have any questions!\n\nBest regards`;
    
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const handleReferralSubmit = async (code: string) => {
    if (!user) {
      alert("Please login to use referral code");
      return;
    }

    try {
      const result = await processReferralCode(code, user.uid);
      if (result.success) {
        alert(`🎉 Referral successful! You earned ₹${result.reward} bonus!`);
        window.location.reload();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error processing referral:', error);
      alert("Failed to process referral. Please try again.");
    }
  };

  if (!user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Gift className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-zinc-400 mb-2">Please Login</h2>
            <p className="text-zinc-600">You need to be logged in to access referrals.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14">
        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Referrals</h1>
        <p className="text-sm font-bold text-zinc-500 mt-2">Invite friends and earn rewards together</p>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* Referral Code Generation */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <Gift className="w-6 h-6 text-indigo-500" />
            Your Referral Code
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="premium-card bg-zinc-900 border-white/5 p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-black text-white">Generate Code</h4>
                  {referralInfo?.code && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Active
                    </Badge>
                  )}
                </div>
                
                {!referralInfo?.code ? (
                  <Button
                    onClick={handleCreateCode}
                    disabled={isCreating}
                    className="w-full h-14 rounded-2xl bg-indigo-500 text-white font-black text-sm uppercase tracking-widest gap-3 hover:bg-indigo-400 transition-all"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Generate Referral Code
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Your Code</span>
                        <Button
                          onClick={() => setShowCode(!showCode)}
                          variant="ghost"
                          className="p-2 text-zinc-400 hover:text-white"
                        >
                          {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      {showCode && (
                        <div className="text-center">
                          <div className="text-4xl font-black text-emerald-500 tracking-tighter mb-4">
                            {referralInfo.code}
                          </div>
                          <Button
                            onClick={handleCopyCode}
                            className="w-full h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-sm uppercase tracking-widest gap-3 hover:bg-emerald-500/20 transition-all"
                          >
                            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy Code"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="premium-card bg-zinc-900 border-white/5 p-8">
              <div className="space-y-6">
                <h4 className="text-lg font-black text-white mb-6">Share Your Link</h4>
                
                {referralInfo?.shareUrl && (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl">
                      <p className="text-sm font-black text-zinc-400 break-all mb-3">
                        {referralInfo.shareUrl}
                      </p>
                      <Button
                        onClick={handleCopyLink}
                        className="w-full h-12 rounded-xl bg-zinc-800 border border-white/5 text-white font-black text-sm uppercase tracking-widest gap-3 hover:bg-zinc-700 transition-all"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy Link"}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={handleShareWhatsApp}
                        className="h-12 rounded-xl bg-green-500 text-white font-black text-sm uppercase tracking-widest gap-3 hover:bg-green-400 transition-all"
                      >
                        <Smartphone className="w-4 h-4" />
                        WhatsApp
                      </Button>
                      
                      <Button
                        onClick={handleShareEmail}
                        className="h-12 rounded-xl bg-blue-500 text-white font-black text-sm uppercase tracking-widest gap-3 hover:bg-blue-400 transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Referral Stats */}
        {analytics && (
          <section className="space-y-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              Your Referral Stats
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="premium-card bg-zinc-900 border-white/5 p-6">
                <div className="text-center">
                  <Users className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                  <p className="text-3xl font-black text-white tabular-nums">
                    {analytics.totalReferrals}
                  </p>
                  <p className="text-sm font-black text-zinc-600">Total Referrals</p>
                </div>
              </Card>

              <Card className="premium-card bg-zinc-900 border-white/5 p-6">
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <p className="text-3xl font-black text-white tabular-nums">
                    ₹{analytics.totalEarned.toLocaleString()}
                  </p>
                  <p className="text-sm font-black text-zinc-600">Total Earned</p>
                </div>
              </Card>

              <Card className="premium-card bg-zinc-900 border-white/5 p-6">
                <div className="text-center">
                  <Zap className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  <p className="text-3xl font-black text-white tabular-nums">
                    {analytics.pendingRewards}
                  </p>
                  <p className="text-sm font-black text-zinc-600">Pending Rewards</p>
                </div>
              </Card>
            </div>

            {analytics.recentReferrals.length > 0 && (
              <Card className="premium-card bg-zinc-900 border-white/5 p-8">
                <h4 className="text-lg font-black text-white mb-6">Recent Referrals</h4>
                <div className="space-y-4">
                  {analytics.recentReferrals.map((referral: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-zinc-950 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Star className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">Code: {referral.code}</p>
                          <p className="text-[10px] font-black text-zinc-600">
                            {referral.usedAt ? `Used ${new Date(referral.usedAt).toLocaleDateString()}` : 'Pending'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-500">
                          +₹{referral.rewardAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </section>
        )}

        {/* Apply Referral Code */}
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <ExternalLink className="w-6 h-6 text-rose-500" />
            Apply Referral Code
          </h3>
          
          <Card className="premium-card bg-gradient-to-br from-rose-500/10 to-orange-500/5 border-rose-500/20 p-8">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <QrCode className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <p className="text-sm font-black text-rose-500">Have a referral code? Enter it below</p>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="h-16 bg-zinc-950 border border-white/5 rounded-2xl text-2xl font-black text-white placeholder:text-zinc-700 text-center"
                  maxLength={10}
                />
                
                <Button
                  onClick={() => handleReferralSubmit(referralCode)}
                  disabled={!referralCode.trim()}
                  className="w-full h-16 rounded-2xl bg-rose-500 text-white font-black text-lg uppercase tracking-widest gap-3 hover:bg-rose-400 transition-all"
                >
                  Apply Referral Code
                  <ArrowUpRight className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                  New users get ₹250 bonus • Referrers get ₹500 bonus
                </p>
              </div>
            </div>
          </Card>
        </section>

      </div>
    </AppShell>
  );
}
