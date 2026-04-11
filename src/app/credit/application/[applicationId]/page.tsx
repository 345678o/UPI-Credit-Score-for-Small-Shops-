"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, CheckCircle2, Clock, AlertCircle, 
  Download, Share2, Eye, EyeOff, RefreshCw,
  Calendar, FileText, Building2, Phone, Mail,
  ShieldCheck, TrendingUp, Info
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, getFirestore, collection, query, orderBy, limit, getDoc, updateDoc } from "firebase/firestore";
import { checkApplicationStatus, LoanApplication, NBFCResponse } from "@/lib/nbfc-integration";

export default function ApplicationStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [nbfcResponse, setNbfcResponse] = useState<NBFCResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const db = getFirestore();
  const applicationId = params.applicationId as string;
  const userRef = useMemoFirebase(() => user ? doc(db, "users", user.uid) : null, [user]);
  const { data: merchant } = useDoc(userRef);

  useEffect(() => {
    if (!applicationId || !user) return;
    
    loadApplicationStatus();
    
    // Auto-refresh every 30 seconds if pending
    const interval = setInterval(() => {
      if (autoRefresh && (!nbfcResponse || nbfcResponse?.status === 'pending')) {
        loadApplicationStatus();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [applicationId, user, autoRefresh, nbfcResponse?.status]);

  const loadApplicationStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check local database first
      const applicationRef = doc(db, "users", user!.uid, "loanApplications", applicationId);
      const applicationSnap = await getDoc(applicationRef);
      
      if (applicationSnap.exists()) {
        const appData = applicationSnap.data() as LoanApplication;
        setApplication(appData);
        
        // Check NBFC status if application is pending
        if (appData.status === 'pending') {
          const nbfcStatus = await checkApplicationStatus(applicationId, appData.nbfcPartner);
          if (nbfcStatus) {
            setNbfcResponse(nbfcStatus);
            
            // Update local application with NBFC response
            await updateDoc(applicationRef, {
              nbfcResponse: nbfcStatus,
              decisionAt: new Date(),
              status: nbfcStatus.status === 'approved' ? 'approved' : 
                     nbfcStatus.status === 'rejected' ? 'rejected' : 
                     nbfcStatus.status === 'disbursed' ? 'disbursed' : 'pending'
            });
          }
        } else {
          setNbfcResponse(appData.nbfcResponse);
        }
      }
    } catch (error) {
      console.error('Error loading application status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'disbursed': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'manual_review': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5" />;
      case 'rejected': return <AlertCircle className="w-5 h-5" />;
      case 'disbursed': return <TrendingUp className="w-5 h-5" />;
      case 'manual_review': return <Clock className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5 animate-pulse" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Application Approved';
      case 'rejected': return 'Application Rejected';
      case 'disbursed': return 'Loan Disbursed';
      case 'manual_review': return 'Under Manual Review';
      default: return 'Under Review';
    }
  };

  const handleDownloadOffer = () => {
    if (!nbfcResponse) return;
    
    const offerContent = `
LOAN OFFER LETTER
==================

Application ID: ${applicationId}
Date: ${new Date().toLocaleDateString()}
Applicant: ${merchant?.businessName || 'Merchant'}
NBFC Partner: ${application?.nbfcPartner}

Loan Details:
- Approved Amount: ₹${nbfcResponse.approvedAmount?.toLocaleString()}
- Interest Rate: ${nbfcResponse.interestRate}%
- Tenure: ${nbfcResponse.tenure} months
- Monthly EMI: ₹${nbfcResponse.emi?.toLocaleString()}
- Processing Fee: ₹${nbfcResponse.processingFee?.toLocaleString()}

Status: ${getStatusText(nbfcResponse.status)}
Next Steps: ${nbfcResponse.nextSteps || 'Processing...'}

This is an automated loan offer letter. Please contact the NBFC partner for confirmation.
    `.trim();
    
    const blob = new Blob([offerContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-offer-${applicationId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-6" />
            <p className="text-lg font-black text-white">Loading application status...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!application) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-white mb-4">Application Not Found</h2>
            <p className="text-zinc-400 mb-8">The loan application you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => router.push('/credit/marketplace')} className="bg-emerald-500 text-black">
              Go to Marketplace
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-10 lg:mb-14">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all active:scale-90 hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Application Status</h1>
            <p className="text-sm font-bold text-zinc-500 mt-2">Track your loan application in real-time</p>
          </div>
        </div>
      </header>

      <div className="space-y-12 pb-32">
        
        {/* Application Overview */}
        <Card className="premium-card bg-zinc-900 border-white/5 p-8 lg:p-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white">Application Overview</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                  autoRefresh ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-zinc-800 border-white/5 text-zinc-400"
                )}
              >
                <RefreshCw className={cn("w-3 h-3", autoRefresh && "animate-spin")} />
                Auto-refresh
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center transition-all active:scale-90"
              >
                {showDetails ? <EyeOff className="w-4 h-4 text-zinc-400" /> : <Eye className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Application ID</p>
                <p className="text-lg font-black text-white font-mono">{applicationId}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Applied Amount</p>
                <p className="text-2xl font-black text-emerald-500">₹{application.requestedAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Purpose</p>
                <p className="text-lg font-black text-white">{application.purpose}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Applied On</p>
                <p className="text-lg font-black text-white">
                  {(application.appliedAt as any)?.toDate?.()?.toLocaleDateString() || 'Just now'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Business Name</p>
                <p className="text-lg font-black text-white">{merchant?.businessName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Credit Score Used</p>
                <p className="text-2xl font-black text-indigo-500">{application.creditScore}</p>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="mt-8 p-6 bg-zinc-950/50 border border-white/5 rounded-2xl">
              <h4 className="text-lg font-black text-white mb-4">Additional Details</h4>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Monthly Revenue</p>
                  <p className="font-black text-white">₹{application.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Business Age</p>
                  <p className="font-black text-white">{application.businessAge} months</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Transaction Volume</p>
                  <p className="font-black text-white">{application.transactionVolume} transactions</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Expense Ratio</p>
                  <p className="font-black text-white">{(application.expenseRatio * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* NBFC Response */}
        {nbfcResponse && (
          <Card className="premium-card bg-zinc-900 border-white/5 p-8 lg:p-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white">Lender Decision</h3>
              <Badge className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                getStatusColor(nbfcResponse.status)
              )}>
                {getStatusIcon(nbfcResponse.status)}
                {getStatusText(nbfcResponse.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {nbfcResponse.approvedAmount && (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Approved Amount</p>
                    <p className="text-3xl font-black text-emerald-500">₹{nbfcResponse.approvedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Interest Rate</p>
                    <p className="text-2xl font-black text-white">{nbfcResponse.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Monthly EMI</p>
                    <p className="text-2xl font-black text-indigo-500">₹{nbfcResponse.emi?.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {nbfcResponse.tenure && (
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Loan Tenure</p>
                    <p className="text-2xl font-black text-white">{nbfcResponse.tenure} months</p>
                  </div>
                )}
                {nbfcResponse.processingFee && (
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Processing Fee</p>
                    <p className="text-2xl font-black text-amber-500">₹{nbfcResponse.processingFee.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Turnaround Time</p>
                  <p className="text-lg font-black text-indigo-500">{nbfcResponse.turnaroundTime}</p>
                </div>
              </div>
            </div>

            {nbfcResponse.nextSteps && (
              <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <div className="flex gap-4">
                  <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Next Steps</p>
                    <p className="text-sm font-black text-white leading-relaxed">{nbfcResponse.nextSteps}</p>
                  </div>
                </div>
              </div>
            )}

            {nbfcResponse.rejectionReason && (
              <div className="mt-8 p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                <div className="flex gap-4">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Rejection Reason</p>
                    <p className="text-sm font-black text-white leading-relaxed">{nbfcResponse.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <Button
                onClick={handleDownloadOffer}
                className="flex-1 h-14 rounded-2xl bg-zinc-800 border border-white/5 text-white font-black text-sm uppercase tracking-widest gap-3 hover:bg-zinc-700 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Offer Letter
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-widest gap-3 hover:bg-emerald-400 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share Application
              </Button>
            </div>
          </Card>
        )}

      </div>
    </AppShell>
  );
}
