import { GoogleGenAI, Type } from "@google/genai"
import { StructuredExperiment } from '../types/interfaces.js'
import dotenv from "dotenv"

dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })

export async function parseTradingPrompt(userPrompt: string): Promise<StructuredExperiment> {
  const systemInstruction = `
    You are an elite quantitative trading researcher.
    Take the user's natural language question and extract the parameters into a strict experiment schema.

    For each of dropPercentage and holdingPeriodDays:
    - If the prompt states an exact number, use it.
    - If the prompt is vague but a reasonable default exists (e.g. "sharp fall" -> 5% drop,
      "a week" -> 5 trading days, "a big drop" -> 3%), FILL THE FIELD with that default
      value and explain your reasoning in assumptionsMade. Never describe an assumed
      number in assumptionsMade without also putting that same number in the field —
      the field is what actually runs in the backtest, so it must match what you tell the user.
    - Only return null for a field, and list it in missingParameters, if there is truly no
      reasonable default to apply (e.g. the request gives no hint at all about direction
      or magnitude). null should be rare, not the default behavior.
  `
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: `Analyze this prompt: "${userPrompt}"`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instrument: {
            type: Type.STRING,
            description: "Target asset human-readable name (e.g., NIFTY, Tesla, Reliance). Default to NIFTY."
          },
          ticker: {
            type: Type.STRING,
            description: "The exact Yahoo Finance ticker symbol (e.g., ^NSEI for NIFTY, TSLA for Tesla, AAPL for Apple, RELIANCE.NS for Reliance, ^NSEBANK for Bank Nifty). Always resolve this correctly."
          },
          dropPercentage: {
            type: Type.NUMBER,
            nullable: true,
            description: "Percentage drop for entry. If the prompt is vague (e.g. 'sharp fall'), fill this with your best-judgment default (e.g. 5) and explain it in assumptionsMade — do not leave this null just because the prompt didn't give an exact number. Only null if there is no reasonable default at all."
          },
          holdingPeriodDays: {
            type: Type.NUMBER,
            nullable: true,
            description: "Holding period in trading days. If the prompt is vague (e.g. 'a week'), fill this with your best-judgment default (e.g. 5) and explain it in assumptionsMade — do not leave this null just because the prompt didn't give an exact number. Only null if there is no reasonable default at all."
          },
          missingParameters: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Only parameters left as null because no reasonable default could be applied. Should usually be empty."
          },
          assumptionsMade: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Default values you applied and why. Every number mentioned here must match the value actually set in the corresponding field."
          },
          hypothesesSummary: {
            type: Type.STRING,
            description: "A 1-sentence summary of the hypothesis being tested."
          }
        },
        required: ["instrument", "ticker", "missingParameters", "assumptionsMade", "hypothesesSummary"]
      }
    }
  })

  if (!response.text) {
    throw new Error("Empty response from AI")
  }
  const parsed = JSON.parse(response.text) as StructuredExperiment

  return reconcileDefaults(parsed)
}

/**
 * Safety net in case the model still returns a null field while describing an
 * assumed number in prose (LLM instruction-following isn't guaranteed). This
 * guarantees the field the backtest actually uses always matches what the UI
 * tells the user, even if the model's output is inconsistent.
 */
const FALLBACK_DROP_PERCENTAGE = 2
const FALLBACK_HOLDING_DAYS = 5

function reconcileDefaults(experiment: StructuredExperiment): StructuredExperiment {
  const result = { ...experiment }
  result.assumptionsMade = [...(result.assumptionsMade ?? [])]
  result.missingParameters = [...(result.missingParameters ?? [])]

  if (result.dropPercentage == null) {
    result.dropPercentage = FALLBACK_DROP_PERCENTAGE
    result.assumptionsMade.push(
      `No drop threshold was specified or inferable, so a default of ${FALLBACK_DROP_PERCENTAGE}% was used.`
    )
    result.missingParameters = result.missingParameters.filter((p) => p !== 'dropPercentage')
  }
  if (result.holdingPeriodDays == null) {
    result.holdingPeriodDays = FALLBACK_HOLDING_DAYS
    result.assumptionsMade.push(
      `No holding period was specified or inferable, so a default of ${FALLBACK_HOLDING_DAYS} trading days was used.`
    )
    result.missingParameters = result.missingParameters.filter((p) => p !== 'holdingPeriodDays')
  }

  return result
}