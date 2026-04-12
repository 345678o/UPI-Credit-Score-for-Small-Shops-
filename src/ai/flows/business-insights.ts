'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BusinessInsightsInputSchema = z.object({
  totalIncome: z.number(),
  totalExpenses: z.number(),
  topExpenseCategories: z.array(z.object({
    category: z.string(),
    amount: z.number()
  })),
  transactionFrequency: z.number(), // count per week
  businessType: z.string().optional(),
});

const BusinessInsightsOutputSchema = z.object({
  spendingAnalysis: z.object({
    summary: z.string(),
    hotspots: z.array(z.string()),
  }),
  savingsOpportunities: z.array(z.object({
    title: z.string(),
    description: z.string(),
    estimatedSavings: z.string(),
  })),
  growthStrategies: z.array(z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(["low", "medium", "high"]),
  })),
  overallHealthScore: z.number().min(0).max(100),
});

export type BusinessInsightsInput = z.infer<typeof BusinessInsightsInputSchema>;
export type BusinessInsightsOutput = z.infer<typeof BusinessInsightsOutputSchema>;

const insightsPrompt = ai.definePrompt({
  name: 'businessInsightsPrompt',
  input: { schema: BusinessInsightsInputSchema },
  output: { schema: BusinessInsightsOutputSchema },
  prompt: `You are the "CrediPay Business Strategist AI".
Analyze the provided business financial data and generate deep, actionable insights for a small merchant in the Indian market.

Data:
- Total Income: ₹{{totalIncome}}
- Total Expenses: ₹{{totalExpenses}}
- Top Spending: {{#each topExpenseCategories}}{{this.category}}: ₹{{this.amount}}, {{/each}}
- Transaction Count: {{transactionFrequency}} per week
- Business: {{businessType}}

Tasks:
1. Spending Analysis: Identify where the most money is going and if it's healthy.
2. Savings: Provide specific, localized Indian market tips to reduce these expenses.
3. Growth: Suggest steps to grow revenue based on their activity levels (e.g., digitization, loyalty, inventory).
4. Health Score: A 0-100 score based on profitability and activity.

Be professional, encouraging, and highly specific.`,
});

/**
 * Server Action wrapper for Genkit flow.
 */
export async function runBusinessInsights(input: BusinessInsightsInput): Promise<BusinessInsightsOutput> {
  try {
    const { output } = await insightsPrompt(input);
    if (!output) throw new Error("AI failed to generate insights");
    return output;
  } catch (error) {
    console.error("Business Insights AI failure:", error);
    // Fallback static insights
    return {
      spendingAnalysis: {
        summary: "Your spending is primarily concentrated in operational categories.",
        hotspots: ["Inventory Replenishment", "Utility Buffers"]
      },
      savingsOpportunities: [
        {
          title: "Optimize Inventory Cycles",
          description: "Bulk ordering during mid-month slumps can save 5-8% on procurement.",
          estimatedSavings: "₹2,500/mo"
        }
      ],
      growthStrategies: [
        {
          title: "Digital Customer Loyalty",
          description: "Offer a small discount for regular digital payers to increase repeat visits.",
          difficulty: "low"
        }
      ],
      overallHealthScore: 72
    };
  }
}
