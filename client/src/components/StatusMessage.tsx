interface Props {
  kind: 'loading' | 'error'
  message: string
}

export function StatusMessage({ kind, message }: Props) {
  return (
    <div className={`status status--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {kind === 'loading' && <span className="status-spinner" aria-hidden="true" />}
      <span>{message}</span>
    </div>
  )
}
