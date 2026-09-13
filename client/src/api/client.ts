import type { AnalyzeResponse, AnalyzeErrorResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export class ApiError extends Error {}

export async function analyzePrompt(userPrompt: string): Promise<AnalyzeResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPrompt }),
    })
  } catch {
    throw new ApiError(
      `Couldn't reach the backend at ${API_BASE_URL}. Confirm the server is running and CORS allows this origin.`
    )
  }

  const body = (await response.json().catch(() => null)) as
    | AnalyzeResponse
    | AnalyzeErrorResponse
    | null

  if (!response.ok || !body || body.success === false) {
    const message = body && 'error' in body ? body.error : `Request failed (${response.status}).`
    throw new ApiError(message)
  }

  return body
}
