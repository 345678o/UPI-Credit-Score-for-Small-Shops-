/**
 * CrediPay AI Agent Workflow (Persistent)
 * 
 * This module integrates with Genkit flows and Firestore to store and retrieve
 * actionable business insights for small merchants.
 */

import { getFirestore, collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase";
import { runCrediPayAdvisor, CrediPayAdvisorInput, CrediPayAdvisorOutput } from "@/ai/flows/credipay-advisor";

export interface AIInsight extends CrediPayAdvisorOutput {
  timestamp?: any;
}

/**
 * Generates an insight using the AI Agent workflow and persists it to the backend.
 * Uses the CrediPay Advisor Server Action.
 */
export async function generateAndStoreCrediPayInsight(userId: string, data: CrediPayAdvisorInput): Promise<AIInsight> {
  // 1. Generate insight via Server Action
  const result = await runCrediPayAdvisor(data);
  const insight: AIInsight = {
    ...result,
    timestamp: serverTimestamp()
  };

  // 2. Persist to Firestore (Non-blocking)
  const db = getFirestore();
  const insightsRef = collection(db, "users", userId, "aiInsights");
  
  if (userId) {
    addDocumentNonBlocking(insightsRef, {
      ...insight,
      createdAt: serverTimestamp(),
      sourceData: {
        income: data.income,
        expenses: data.expenses,
        creditScore: data.creditScore
      }
    });
  }

  return result;
}

/**
 * Standard generate function (kept for backward compatibility)
 */
export async function generateCrediPayInsight(data: CrediPayAdvisorInput): Promise<AIInsight> {
  return runCrediPayAdvisor(data);
}

/**
 * Backward compatibility exports
 */
export type FinancialData = CrediPayAdvisorInput;
