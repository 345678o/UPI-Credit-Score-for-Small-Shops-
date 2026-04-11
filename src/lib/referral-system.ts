/**
 * Referral System for CrediPay
 * 
 * This module handles the complete referral system including:
 * - Referral code generation
 * - Referral tracking and validation
 * - Reward distribution
 * - Referral analytics
 */

import { getFirestore, collection, doc, serverTimestamp, increment, addDoc, setDoc, updateDoc, getDoc, getDocs, query, orderBy, limit, where, runTransaction } from "firebase/firestore";

export interface ReferralCode {
  id: string;
  code: string;
  referrerId: string;
  referredUserId?: string;
  status: 'active' | 'used' | 'expired';
  rewardAmount: number;
  rewardPoints: number;
  createdAt: Date;
  usedAt?: Date;
  expiresAt: Date;
}

export interface ReferralLink {
  id: string;
  userId: string;
  referralCode: string;
  customMessage?: string;
  shareUrl: string;
  totalClicks: number;
  uniqueClicks: number;
  successfulReferrals: number;
  createdAt: Date;
  isActive: boolean;
}

export interface ReferralReward {
  id: string;
  userId: string;
  referralCodeId: string;
  type: 'referrer' | 'referred';
  amount: number;
  points: number;
  description: string;
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

/**
 * Generate a unique referral code for a user
 */
export function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new referral code for a user
 */
export async function createReferralCode(userId: string): Promise<{ success: boolean; code?: string; error?: string; shareUrl?: string }> {
  try {
    const db = getFirestore();
    const code = generateReferralCode(userId);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6); // Expires in 6 months

    const referralCodeRef = await addDoc(collection(db, "referralCodes"), {
      code,
      referrerId: userId,
      status: 'active',
      rewardAmount: 500, // ₹500 reward for successful referral
      rewardPoints: 500,
      createdAt: serverTimestamp(),
      expiresAt
    });

    // Create referral link
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://credipay.app'}/ref?code=${code}`;
    
    await addDoc(collection(db, "referralLinks"), {
      userId,
      referralCode: code,
      shareUrl,
      totalClicks: 0,
      uniqueClicks: 0,
      successfulReferrals: 0,
      createdAt: serverTimestamp(),
      isActive: true
    });

    return { success: true, code, shareUrl };
  } catch (error) {
    console.error('Error creating referral code:', error);
    return { success: false, error: 'Failed to create referral code' };
  }
}

/**
 * Get user's referral code and link
 */
export async function getUserReferralInfo(userId: string): Promise<{ code?: string; shareUrl?: string; referralStats?: any }> {
  try {
    const db = getFirestore();
    
    // Get referral code
    const codeQuery = query(
      collection(db, "referralCodes"),
      where("referrerId", "==", userId),
      where("status", "==", "active"),
      limit(1)
    );
    
    const codeSnapshot = await getDocs(codeQuery);
    const referralCode = codeSnapshot.empty ? null : codeSnapshot.docs[0].data();

    if (!referralCode) {
      return {};
    }

    // Get referral link stats
    const linkQuery = query(
      collection(db, "referralLinks"),
      where("userId", "==", userId),
      limit(1)
    );
    
    const linkSnapshot = await getDocs(linkQuery);
    const referralLink = linkSnapshot.empty ? null : linkSnapshot.docs[0].data();

    // Get referral stats
    const rewardsQuery = query(
      collection(db, "referralRewards"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    
    const rewardsSnapshot = await getDocs(rewardsQuery);
    const rewards = rewardsSnapshot.docs.map(doc => doc.data());

    return {
      code: referralCode.code,
      shareUrl: referralLink?.shareUrl || '',
      referralStats: {
        totalClicks: referralLink?.totalClicks || 0,
        uniqueClicks: referralLink?.uniqueClicks || 0,
        successfulReferrals: referralLink?.successfulReferrals || 0,
        totalRewards: rewards.reduce((sum, reward) => sum + (reward.amount || 0), 0),
        totalPoints: rewards.reduce((sum, reward) => sum + (reward.points || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error getting referral info:', error);
    return {};
  }
}

/**
 * Validate and process a referral code
 */
export async function processReferralCode(code: string, referredUserId: string, ipAddress?: string): Promise<{ success: boolean; message: string; reward?: number }> {
  try {
    const db = getFirestore();
    
    // Find the referral code
    const codeQuery = query(
      collection(db, "referralCodes"),
      where("code", "==", code),
      where("status", "==", "active"),
      limit(1)
    );
    
    const codeSnapshot = await getDocs(codeQuery);
    
    if (codeSnapshot.empty) {
      return { success: false, message: "Invalid referral code" };
    }

    const referralCodeData = codeSnapshot.docs[0].data();
    const now = new Date();

    // Check if code has expired
    if (referralCodeData.expiresAt.toDate() < now) {
      return { success: false, message: "Referral code has expired" };
    }

    // Check if user is trying to refer themselves
    if (referralCodeData.referrerId === referredUserId) {
      return { success: false, message: "Cannot use your own referral code" };
    }

    // Process the referral in a transaction
    const result = await runTransaction(db, async (transaction) => {
      const codeRef = doc(db, "referralCodes", codeSnapshot.docs[0].id);
      const codeDoc = await transaction.get(codeRef);
      
      if (!codeDoc.exists()) {
        throw new Error("Referral code not found");
      }

      const currentCodeData = codeDoc.data();
      
      // Update referral code as used
      transaction.update(codeRef, {
        status: 'used',
        referredUserId,
        usedAt: serverTimestamp()
      });

      // Track click
      const linkQuery = query(
        collection(db, "referralLinks"),
        where("referralCode", "==", code),
        limit(1)
      );
      
      const linkSnapshot = await getDocs(linkQuery);
      if (!linkSnapshot.empty) {
        const linkRef = doc(db, "referralLinks", linkSnapshot.docs[0].id);
        const linkDoc = await transaction.get(linkRef);
        
        if (linkDoc.exists()) {
          const linkData = linkDoc.data() as any;
          const uniqueClicks = new Set((linkData.uniqueClicks || []).map((click: any) => click.ipAddress));
          uniqueClicks.add(ipAddress);
          
          transaction.update(linkRef, {
            totalClicks: increment(1),
            uniqueClicks: Array.from(uniqueClicks).length,
            successfulReferrals: increment(1)
          });
        }
      }

      // Create rewards for both parties
      const referrerRewardRef = doc(collection(db, "referralRewards"));
      transaction.set(referrerRewardRef, {
        userId: currentCodeData.referrerId,
        referralCodeId: codeSnapshot.docs[0].id,
        type: 'referrer',
        amount: currentCodeData.rewardAmount,
        points: currentCodeData.rewardPoints,
        description: `Referral bonus for referring new user`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      const referredRewardRef = doc(collection(db, "referralRewards"));
      transaction.set(referredRewardRef, {
        userId: referredUserId,
        referralCodeId: codeSnapshot.docs[0].id,
        type: 'referred',
        amount: 250, // ₹250 bonus for being referred
        points: 250,
        description: `Welcome bonus for joining via referral`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      return {
        referrerReward: referrerRewardRef.id,
        referredReward: referredRewardRef.id,
        rewardAmount: currentCodeData.rewardAmount
      };
    });

    // Process the rewards (update user points, etc.)
    await processReferralRewards(result.referrerReward, result.referredReward);

    return { 
      success: true, 
      message: "Referral successfully processed!", 
      reward: result.rewardAmount 
    };

  } catch (error) {
    console.error('Error processing referral:', error);
    return { success: false, message: "Failed to process referral" };
  }
}

/**
 * Process pending referral rewards
 */
async function processReferralRewards(referrerRewardId: string, referredRewardId: string): Promise<void> {
  const db = getFirestore();
  
  // Update referrer's reward points
  const referrerDoc = await getDoc(doc(db, "referralRewards", referrerRewardId));
  const referrerUserId = referrerDoc.data()?.userId;
  if (referrerUserId) {
    const referrerUserRef = doc(db, "users", referrerUserId);
    setDoc(referrerUserRef, {
      rewardPoints: increment(500),
      lastReferralAt: serverTimestamp()
    }, { merge: true });
  }

  // Update referred user's reward points
  const referredDoc = await getDoc(doc(db, "referralRewards", referredRewardId));
  const referredUserId = referredDoc.data()?.userId;
  if (referredUserId && referrerUserId) {
    const referredUserRef = doc(db, "users", referredUserId);
    setDoc(referredUserRef, {
      rewardPoints: increment(250),
      referredBy: referrerUserId
    }, { merge: true });
  }

  // Mark rewards as processed
  await Promise.all([
    updateDoc(doc(db, "referralRewards", referrerRewardId), { status: 'processed', processedAt: serverTimestamp() }),
    updateDoc(doc(db, "referralRewards", referredRewardId), { status: 'processed', processedAt: serverTimestamp() })
  ]);
}

/**
 * Track referral link clicks
 */
export async function trackReferralClick(code: string, ipAddress: string, userAgent?: string): Promise<void> {
  try {
    const db = getFirestore();
    
    // Find the referral link
    const linkQuery = query(
      collection(db, "referralLinks"),
      where("referralCode", "==", code),
      limit(1)
    );
    
    const linkSnapshot = await getDocs(linkQuery);
    
    if (!linkSnapshot.empty) {
      const linkRef = doc(db, "referralLinks", linkSnapshot.docs[0].id);
      const linkDoc = await getDoc(linkRef);
      
      if (linkDoc.exists()) {
        const linkData = linkDoc.data();
        const existingClicks = linkData.uniqueClicks || [];
        
        // Check if this IP has already clicked (unique click)
        const isUniqueClick = !existingClicks.some((click: any) => click.ipAddress === ipAddress);
        
        const updatedClicks = isUniqueClick ? [...existingClicks, { ipAddress, timestamp: new Date(), userAgent }] : existingClicks;
        
        await updateDoc(linkRef, {
          totalClicks: increment(1),
          uniqueClicks: updatedClicks
        });
      }
    }
  } catch (error) {
    console.error('Error tracking referral click:', error);
  }
}

/**
 * Get referral analytics for a user
 */
export async function getReferralAnalytics(userId: string): Promise<{
  totalReferrals: number;
  pendingRewards: number;
  totalEarned: number;
  recentReferrals: any[];
}> {
  try {
    const db = getFirestore();
    
    // Get all referral rewards for this user (as referrer)
    const rewardsQuery = query(
      collection(db, "referralRewards"),
      where("userId", "==", userId),
      where("type", "==", "referrer"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    
    const rewardsSnapshot = await getDocs(rewardsQuery);
    const rewards = rewardsSnapshot.docs.map(doc => doc.data());
    
    const pendingRewards = rewards.filter(r => r.status === 'pending').length;
    const totalEarned = rewards.filter(r => r.status === 'processed').reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // Get recent successful referrals
    const codesQuery = query(
      collection(db, "referralCodes"),
      where("referrerId", "==", userId),
      where("status", "==", "used"),
      orderBy("usedAt", "desc"),
      limit(10)
    );
    
    const codesSnapshot = await getDocs(codesQuery);
    const recentReferrals = codesSnapshot.docs.map(doc => ({
      code: doc.data().code,
      referredUserId: doc.data().referredUserId,
      usedAt: doc.data().usedAt?.toDate(),
      rewardAmount: doc.data().rewardAmount
    }));

    return {
      totalReferrals: rewards.length,
      pendingRewards,
      totalEarned,
      recentReferrals
    };
  } catch (error) {
    console.error('Error getting referral analytics:', error);
    return {
      totalReferrals: 0,
      pendingRewards: 0,
      totalEarned: 0,
      recentReferrals: []
    };
  }
}
