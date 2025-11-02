
import { GoogleGenAI } from "@google/genai";
import { Expense } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getFinancialTip = async (budget: number, expenses: Expense[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API key is not configured. Please set up your API key to use this feature.";
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
  }, {} as Record<string, number>);

  const categorySpending = Object.entries(expensesByCategory)
    .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
    .join('\n');

  const prompt = `
    You are a friendly and concise financial assistant.
    A user has a total budget of $${budget.toFixed(2)}.
    They have spent a total of $${totalExpenses.toFixed(2)}.
    
    Here is their spending breakdown by category:
    ${expenses.length > 0 ? categorySpending : "No expenses yet."}

    Based on this information, provide one short, simple, and encouraging financial tip.
    The tip should be practical and highlight spending in a specific category if one is particularly high.
    Keep the response under 50 words. Do not use markdown formatting.
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching financial tip:", error);
    return "Sorry, I couldn't generate a tip right now. Please try again later.";
  }
};
