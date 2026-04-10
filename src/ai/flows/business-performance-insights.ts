'use server';
/**
 * @fileOverview A Genkit flow for generating business performance insights.
 *
 * - getBusinessPerformanceInsights - A function that handles the generation of business performance insights.
 * - BusinessPerformanceInsightsInput - The input type for the getBusinessPerformanceInsights function.
 * - BusinessPerformanceInsightsOutput - The return type for the getBusinessPerformanceInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BusinessPerformanceInsightsInputSchema = z.object({
  currentWeekEarnings: z.number().describe('Total earnings for the current week.'),
  previousWeekEarnings: z.number().describe('Total earnings for the previous week.'),
  dailyEarnings: z.array(z.object({
    day: z.string().describe('Day of the week, e.g., Monday'),
    earnings: z.number().describe('Earnings for that day'),
  })).describe('Earnings for each day of the last 7 days.'),
  hourlySales: z.array(z.object({
    hour: z.number().describe('Hour of the day (0-23)'),
    salesCount: z.number().describe('Number of sales during that hour'),
  })).describe('Sales count for each hour of the day.'),
});
export type BusinessPerformanceInsightsInput = z.infer<typeof BusinessPerformanceInsightsInputSchema>;

const BusinessPerformanceInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('A list of business performance insights, each as a single sentence.'),
});
export type BusinessPerformanceInsightsOutput = z.infer<typeof BusinessPerformanceInsightsOutputSchema>;

export async function getBusinessPerformanceInsights(input: BusinessPerformanceInsightsInput): Promise<BusinessPerformanceInsightsOutput> {
  return businessPerformanceInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'businessPerformanceInsightsPrompt',
  input: { schema: BusinessPerformanceInsightsInputSchema },
  output: { schema: BusinessPerformanceInsightsOutputSchema },
  prompt: `You are an expert business analyst for small merchants. Your goal is to provide concise, easy-to-understand performance insights based on the provided business data. Focus on trends, comparisons, and actionable observations. Generate 3-5 key insights.

Here is the business data:
Current Week Earnings: {{{currentWeekEarnings}}}
Previous Week Earnings: {{{previousWeekEarnings}}}

Daily Earnings (last 7 days):
{{#each dailyEarnings}}- {{this.day}}: {{this.earnings}}
{{/each}}

Hourly Sales:
{{#each hourlySales}}- Hour {{this.hour}}: {{this.salesCount}}
{{/each}}

Generate a JSON array of strings, where each string is a single business insight. Do not include any other text besides the JSON array.`,
});

const businessPerformanceInsightsFlow = ai.defineFlow(
  {
    name: 'businessPerformanceInsightsFlow',
    inputSchema: BusinessPerformanceInsightsInputSchema,
    outputSchema: BusinessPerformanceInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
