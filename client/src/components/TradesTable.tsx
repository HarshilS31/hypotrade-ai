import { useState } from 'react'
import type { TradeRecord } from '../types'

interface Props {
  trades: TradeRecord[]
}

const PAGE_SIZE = 10

function formatDate(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' })
}

export function TradesTable({ trades }: Props) {
  const [showAll, setShowAll] = useState(false)

  if (trades.length === 0) {
    return (
      <section className="trades">
        <h2 className="record-title">Trade log</h2>
        <p className="empty-state">No entries matched this hypothesis in the last five years of data.</p>
      </section>
    )
  }

  const visible = showAll ? trades : trades.slice(0, PAGE_SIZE)

  return (
    <section className="trades">
      <h2 className="record-title">Trade log</h2>
      <table className="trades-table">
        <thead>
          <tr>
            <th>Entry</th>
            <th>Exit</th>
            <th>Entry price</th>
            <th>Exit price</th>
            <th>Return</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((t, i) => (
            <tr key={i}>
              <td>{formatDate(t.entryDate)}</td>
              <td>{formatDate(t.exitDate)}</td>
              <td className="num">{t.entryPrice.toFixed(2)}</td>
              <td className="num">{t.exitPrice.toFixed(2)}</td>
              <td className={`num ${t.profitPercentage >= 0 ? 'positive' : 'negative'}`}>
                {t.profitPercentage > 0 ? '+' : ''}
                {t.profitPercentage.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {trades.length > PAGE_SIZE && (
        <button className="btn-text" onClick={() => setShowAll((s) => !s)}>
          {showAll ? 'Show fewer trades' : `Show all ${trades.length} trades`}
        </button>
      )}
    </section>
  )
}
