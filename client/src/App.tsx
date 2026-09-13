import { useState } from 'react'
import { analyzePrompt, ApiError } from './api/client'
import type { AnalyzeResponse } from './types'
import { PromptInput } from './components/PromptInput'
import { ExperimentRecord } from './components/ExperimentRecord'
import { MetricsRow } from './components/MetricsRow'
import { TradesTable } from './components/TradesTable'
import { StatusMessage } from './components/StatusMessage'

export default function App() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(prompt: string) {
    setIsRunning(true)
    setError(null)
    try {
      const response = await analyzePrompt(prompt)
      setResult(response)
    } catch (err) {
      setResult(null)
      setError(err instanceof ApiError ? err.message : 'Something went wrong running that experiment.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">HYPO-TRADE</h1>
        <p className="page-subtitle">Turn a plain-language trading idea into a five-year backtest.</p>
      </header>

      <PromptInput onSubmit={handleSubmit} isRunning={isRunning} />

      <div className="results">
        {isRunning && <StatusMessage kind="loading" message="Parsing hypothesis and running the backtest…" />}
        {error && !isRunning && <StatusMessage kind="error" message={error} />}
        {result && !isRunning && !error && (
          <>
            <ExperimentRecord experiment={result.experiment} />
            <MetricsRow results={result.results} />
            <TradesTable trades={result.results.trades} />
          </>
        )}
      </div>
    </div>
  )
}
