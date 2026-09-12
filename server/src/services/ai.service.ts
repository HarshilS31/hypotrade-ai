import { GoogleGenAI, Type } from "@google/genai";
import { StructuredExperiment } from "../types/interfaces.js";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function parseTradingPrompt(userPrompt: string): Promise<StructuredExperiment> {
  const systemInstruction = `
    You are an elite quantitative trading researcher. 
    Take the user's natural language question and extract the parameters into a strict experiment schema.
    If a parameter like "drop percentage" or "holding period" is vague (e.g., "sharp fall"), return null for that value, explicitly list it in missingParameters, and state your default assumption in assumptionsMade.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze this prompt: "${userPrompt}"`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instrument: { 
            type: Type.STRING, 
            description: "Target asset (e.g., NIFTY). Default to NIFTY." 
          },
          dropPercentage: { 
            type: Type.NUMBER, 
            nullable: true, 
            description: "Exact percentage drop for entry. Null if vague." 
          },
          holdingPeriodDays: { 
            type: Type.NUMBER, 
            nullable: true, 
            description: "Holding days. Null if unspecified." 
          },
          missingParameters: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Crucial variables missing from the prompt."
          },
          assumptionsMade: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Default assumptions applied by the system."
          },
          hypothesesSummary: {
            type: Type.STRING,
            description: "A 1-sentence summary of the hypothesis being tested."
          }
        },
        required: ["instrument", "missingParameters", "assumptionsMade", "hypothesesSummary"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Empty response from AI");
  }

  return JSON.parse(response.text) as StructuredExperiment;
}