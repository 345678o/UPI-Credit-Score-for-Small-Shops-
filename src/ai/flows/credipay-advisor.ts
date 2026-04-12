'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CrediPayAdvisorInputSchema = z.object({
  income: z.number(),
  expenses: z.number(),
  creditScore: z.number(),
  transactionActivity: z.enum(["low", "medium", "high"]),
  previousIncome: z.number().optional(),
});

const CrediPayAdvisorOutputSchema = z.object({
  insight: z.string(),
  reason: z.string(),
  action: z.string(),
});

export type CrediPayAdvisorInput = z.infer<typeof CrediPayAdvisorInputSchema>;
export type CrediPayAdvisorOutput = z.infer<typeof CrediPayAdvisorOutputSchema>;

const advisorPrompt = ai.definePrompt({
  name: 'credipayAdvisorPrompt',
  input: { schema: CrediPayAdvisorInputSchema },
  output: { schema: CrediPayAdvisorOutputSchema },
  prompt: `You are the "CrediPay Advisor", a sophisticated financial AI for small business merchants.
Analyze the following data and provide a short, clear insight, the reason behind it, and a specific actionable step.

Data:
- Income: ₹{{income}}
- Expenses: ₹{{expenses}}
- Credit Score: {{creditScore}}
- Activity: {{transactionActivity}}
- Previous Income: ₹{{previousIncome}}

Requirements:
- Short and clear output.
- Simple language.
- Include ₹ values in Action.
- Focus on business improvement and credit score growth.

Output should be a JSON object with:
- insight: (The "what")
- reason: (The "why")
- action: (The "how to fix/improve")`,
});

const crediPayAdvisorFlowInternal = ai.defineFlow(
  {
    name: 'crediPayAdvisorFlowLocal', // Renamed to avoid collision
    inputSchema: CrediPayAdvisorInputSchema,
    outputSchema: CrediPayAdvisorOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await advisorPrompt(input);
      if (!output) throw new Error("No output from AI");
      return output;
    } catch (e) {
      console.error('CrediPay Advisor Flow failed:', e);
      const profit = input.income - input.expenses;
      if (input.expenses >= input.income) {
        return {
          insight: "Business in high-risk zone",
          reason: "Expenses are exceeding your total income.",
          action: `Target a reduction of ₹${(input.expenses - input.income + 5000).toLocaleString()} this week.`
        };
      }
      return {
        insight: "Business health is stable",
        reason: "Your income covers expenses with moderate activity.",
        action: "Consider onboarding 5 new merchants to increase scale."
      };
    }
  }
);

/**
 * Server Action wrapper for Genkit flow.
 * Next.js 'use server' files can only export async functions.
 */
export async function runCrediPayAdvisor(input: CrediPayAdvisorInput): Promise<CrediPayAdvisorOutput> {
  return crediPayAdvisorFlowInternal(input);
}
