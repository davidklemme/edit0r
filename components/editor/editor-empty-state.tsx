'use client'

import { useMemo } from 'react'

export function EditorEmptyState() {
  const pasteHint = useMemo(() => {
    if (typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)) {
      return 'Cmd+V to paste'
    }
    return 'Ctrl+V to paste'
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="text-center max-w-md space-y-3">
        <h2 className="text-2xl font-semibold text-muted-foreground/80 tracking-tight">edit0r</h2>
        <p className="text-sm text-muted-foreground/60 leading-relaxed">
          Paste, format, validate, and transform text, JSON, HTML, and CSV.
          <br />
          Auto-detects AI provider configs with inline validation.
          <br />
          No cookies, no tracking, no server-side processing.
        </p>
        <div className="flex gap-3 justify-center text-xs text-muted-foreground/40 pt-1">
          <span>{pasteHint}</span>
          <span aria-hidden="true">&middot;</span>
          <span>Just start typing</span>
        </div>
      </div>
    </div>
  )
}
