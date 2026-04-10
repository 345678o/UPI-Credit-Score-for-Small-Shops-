'use server';
/**
 * @fileOverview A Genkit flow for generating personalized credit score improvement recommendations for small business owners.
 *
 * - creditScoreImprovementRecommendations - A function that provides AI-generated recommendations to improve credit score.
 * - CreditScoreImprovementRecommendationsInput - The input type for the creditScoreImprovementRecommendations function.
 * - CreditScoreImprovementRecommendationsOutput - The return type for the creditScoreImprovementRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreditScoreImprovementRecommendationsInputSchema = z.object({
  currentCreditScore: z
    .number()
    .describe('The current credit score of the business owner.'),
  transactionVolume: z
    .number()
    .describe(
      'The average monthly transaction volume in currency units.'
    ),
  paymentConsistency: z
    .number()
    .describe(
      'A score (0-100) representing the consistency of payments, where 100 is perfectly consistent.'
    ),
  revenueGrowth: z
    .number()
    .describe(
      'The percentage of revenue growth over the last quarter.'
    ),
});
export type CreditScoreImprovementRecommendationsInput = z.infer<
  typeof CreditScoreImprovementRecommendationsInputSchema
>;

const RecommendationSchema = z.object({
  title: z.string().describe('A brief title for the recommendation.'),
  description: z.string().describe('Detailed explanation of the recommendation.'),
});

const CreditScoreImprovementRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(RecommendationSchema)
    .describe(
      'A list of personalized recommendations to improve the business credit score.'
    ),
});
export type CreditScoreImprovementRecommendationsOutput = z.infer<
  typeof CreditScoreImprovementRecommendationsOutputSchema
>;

export async function creditScoreImprovementRecommendations(
  input: CreditScoreImprovementRecommendationsInput
): Promise<CreditScoreImprovementRecommendationsOutput> {
  return creditScoreImprovementRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'creditScoreImprovementRecommendationsPrompt',
  input: {schema: CreditScoreImprovementRecommendationsInputSchema},
  output: {schema: CreditScoreImprovementRecommendationsOutputSchema},
  prompt: `You are an expert financial advisor specializing in small business credit scores in India. Your goal is to provide actionable, personalized recommendations to improve a merchant's credit score based on their financial activity.

Analyze the following business financial data:
- Current Credit Score: {{{currentCreditScore}}}
- Average Monthly Transaction Volume: {{{transactionVolume}}}
- Payment Consistency (0-100): {{{paymentConsistency}}}
- Quarterly Revenue Growth: {{{revenueGrowth}}}%

Provide 3-5 clear and concise recommendations. Each recommendation should have a title and a description explaining how it helps improve the credit score and how the merchant can implement it. Focus on practical steps related to transaction consistency, volume, timely payments, and business growth.
`,
});

const creditScoreImprovementRecommendationsFlow = ai.defineFlow(
  {
    name: 'creditScoreImprovementRecommendationsFlow',
    inputSchema: CreditScoreImprovementRecommendationsInputSchema,
    outputSchema: CreditScoreImprovementRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate credit score recommendations.');
    }
    return output;
  }
);
