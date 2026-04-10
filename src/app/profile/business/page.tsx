"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save, Building2, Store, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import { useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { getFirestore, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function BusinessDetailsPage() {
  const { user } = useUser();
  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(getFirestore(), "users", user.uid);
  }, [user]);

  const { data: userData } = useDoc(userRef);
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    businessType: "",
    address: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        businessName: userData.businessName || "",
        ownerName: userData.ownerName || "",
        businessType: userData.businessType || "",
        address: userData.address || "",
      });
    }
  }, [userData]);

  const handleSave = () => {
    if (!userRef) return;
    updateDocumentNonBlocking(userRef, formData);
    toast({
      title: "Settings Saved",
      description: "Your business details have been updated successfully.",
    });
  };

  return (
    <AppShell>
      <header className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link href="/profile"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-xl font-extrabold font-headline">Business Details</h1>
      </header>

      <div className="space-y-6 pb-12">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Business Name</Label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="h-14 pl-12 rounded-2xl border-none bg-white shadow-sm font-bold" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Owner Name</Label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="h-14 pl-12 rounded-2xl border-none bg-white shadow-sm font-bold" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Business Category</Label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="h-14 pl-12 rounded-2xl border-none bg-white shadow-sm font-bold" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Address</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
              <textarea 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full min-h-[100px] p-4 pl-12 rounded-2xl border-none bg-white shadow-sm font-bold text-sm resize-none focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter business address..."
              />
            </div>
          </div>
        </div>

        <Button 
          className="w-full h-16 rounded-2xl indigo-gradient text-white font-black text-lg gap-3 shadow-xl active:scale-95 transition-all mt-8"
          onClick={handleSave}
        >
          <Save className="w-5 h-5" />
          Update Details
        </Button>
      </div>
    </AppShell>
  );
}
