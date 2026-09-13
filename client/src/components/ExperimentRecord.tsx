import type { StructuredExperiment } from '../types'

interface Props {
  experiment: StructuredExperiment
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="field-row">
      <span className="field-label">{label}</span>
      <span className="field-value">{value}</span>
    </div>
  )
}

export function ExperimentRecord({ experiment }: Props) {
  return (
    <section className="record">
      <h2 className="record-title">Experiment record</h2>
      <p className="record-summary">{experiment.hypothesesSummary}</p>

      <div className="field-grid">
        <Field label="Instrument" value={experiment.instrument} />
        <Field label="Ticker" value={experiment.ticker} />
        <Field
          label="Drop threshold"
          value={experiment.dropPercentage != null ? `${experiment.dropPercentage}%` : 'not specified'}
        />
        <Field
          label="Holding period"
          value={experiment.holdingPeriodDays != null ? `${experiment.holdingPeriodDays} days` : 'not specified'}
        />
      </div>

      {experiment.assumptionsMade.length > 0 && (
        <div className="note-block">
          <span className="note-label">Assumptions applied</span>
          <ul className="note-list">
            {experiment.assumptionsMade.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {experiment.missingParameters.length > 0 && (
        <div className="note-block note-block--warn">
          <span className="note-label">Left unspecified</span>
          <ul className="note-list">
            {experiment.missingParameters.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
