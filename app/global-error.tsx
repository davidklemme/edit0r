'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px', padding: '32px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ fontSize: '14px', color: '#666', maxWidth: '400px' }}>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '6px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
