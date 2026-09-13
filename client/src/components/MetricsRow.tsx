import type { BacktestResult } from '../types'

interface Props {
  results: BacktestResult
}

export function MetricsRow({ results }: Props) {
  const returnSign = results.averageReturn > 0 ? 'positive' : results.averageReturn < 0 ? 'negative' : ''
  const hasWins = results.averageWinReturn !== 0
  const hasLosses = results.averageLossReturn !== 0

  return (
    <section>
      <div className="metrics">
        <div className="metric">
          <span className="metric-value">{results.totalTrades}</span>
          <span className="metric-label">Signals fired</span>
        </div>
        <div className="metric">
          <span className="metric-value">{results.winRate.toFixed(2)}%</span>
          <span className="metric-label">Win rate</span>
        </div>
        <div className="metric">
          <span className={`metric-value ${returnSign}`}>
            {results.averageReturn > 0 ? '+' : ''}
            {results.averageReturn.toFixed(2)}%
          </span>
          <span className="metric-label">Average return per trade</span>
        </div>
        <div className="metric">
          <span className="metric-value negative">{results.largestLoss.toFixed(2)}%</span>
          <span className="metric-label">Largest single loss</span>
        </div>
      </div>

      {(hasWins || hasLosses) && (
        <p className="returns-breakdown">
          Wins averaged <span className="positive">+{results.averageWinReturn.toFixed(2)}%</span>, losses averaged{' '}
          <span className="negative">{results.averageLossReturn.toFixed(2)}%</span> per trade.
        </p>
      )}
    </section>
  )
}