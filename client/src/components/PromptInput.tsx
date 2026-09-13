import { FormEvent, useState } from 'react'

interface Props {
  onSubmit: (prompt: string) => void
  isRunning: boolean
}

const EXAMPLES = [
  'What happens if NIFTY drops more than 2% in a day, holding for 5 days?',
  'Test buying Tesla after a sharp fall and holding for a week.',
]

export function PromptInput({ onSubmit, isRunning }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || isRunning) return
    onSubmit(trimmed)
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <label htmlFor="hypothesis" className="prompt-label">
        Describe the hypothesis you want to test
      </label>
      <textarea
        id="hypothesis"
        className="prompt-input"
        placeholder={EXAMPLES[0]}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        disabled={isRunning}
      />
      <div className="prompt-row">
        <span className="prompt-hint">e.g. “{EXAMPLES[1]}”</span>
        <button type="submit" className="btn-primary" disabled={isRunning || !value.trim()}>
          {isRunning ? 'Running…' : 'Run experiment'}
        </button>
      </div>
    </form>
  )
}
