
import { getFirestore, collection, doc, serverTimestamp, increment, runTransaction, DocumentReference, setDoc, updateDoc } from "firebase/firestore";
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";

export interface TransactionEntry {
  userId: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  payerIdentifier: string;
  description?: string;
}

/**
 * Centrally manages business transaction recording and aggregate updates.
 * Optimized for real-time analytics dashboards.
 */
export async function recordBusinessTransaction(entry: TransactionEntry) {
  const db = getFirestore();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentHour = now.getHours();

  // 1. Core Transaction Record
  const txnsRef = collection(db, "users", entry.userId, "ledgerNodes");
  const txnId = await addDocumentNonBlocking(txnsRef, {
    ...entry,
    status: "success",
    timestamp: serverTimestamp(),
    method: "Digital",
    createdAt: serverTimestamp(),
  });

  // 2. Daily Business Aggregate Update
  const aggregateRef = doc(db, "users", entry.userId, "dailyBusinessAggregates", today);
  const hourlyUpdateKey = `hourlyTransactionCounts.${currentHour}`;
  
  const aggregateData: Record<string, any> = {
    id: today,
    userId: entry.userId,
    date: today,
    transactionCount: increment(1),
    [hourlyUpdateKey]: increment(1),
    lastUpdatedAt: serverTimestamp(),
  };

  if (entry.type === "debit") {
    aggregateData.totalExpenses = increment(entry.amount);
    aggregateData.netEarnings = increment(-entry.amount);
  } else {
    aggregateData.totalEarnings = increment(entry.amount);
    aggregateData.netEarnings = increment(entry.amount);
    // Simple heuristic for unique customers (increment if not a 'General' payer)
    if (entry.payerIdentifier !== "General") {
      aggregateData.uniqueCustomersCount = increment(1);
    }
  }

  setDocumentNonBlocking(aggregateRef, aggregateData, { merge: true });

  // 3. Lifetime Analytics Summary Update
  const summaryRef = doc(db, "users", entry.userId, "userAnalyticsSummary", "current");
  const categoryKey = `categoryBreakdown.${entry.category || "General"}`;
  
  const summaryData: Record<string, any> = {
    userId: entry.userId,
    totalTransactionsCount: increment(1),
    lastUpdatedAt: serverTimestamp(),
    [categoryKey]: increment(1),
  };

  if (entry.type === "debit") {
    summaryData.totalExpensesOverall = increment(entry.amount);
  } else {
    summaryData.totalEarningsOverall = increment(entry.amount);
    summaryData.dailyEarnings = increment(entry.amount); // For Today's Earnings stat
  }

  setDocumentNonBlocking(summaryRef, summaryData, { merge: true });

  // 4. Trigger Scoring Adjustment
  await updateBusinessTrustScore(entry.userId, entry.amount, entry.type);

  return txnId;
}

/**
 * Calculates and updates the merchant's Trust/Credit Score based on financial velocity.
 */
export async function updateBusinessTrustScore(userId: string, amount: number, type: "credit" | "debit") {
  const db = getFirestore();
  const userRef = doc(db, "users", userId);
  
  const scoreBoost = type === "credit" ? Math.min(5, Math.floor(amount / 1000)) : 1;
  
  // 🛡️ Resilient Score Update (Create user doc if first transaction)
  setDocumentNonBlocking(userRef, {
    creditScore: increment(scoreBoost),
    lastFinancialActivity: serverTimestamp()
  }, { merge: true });
}
