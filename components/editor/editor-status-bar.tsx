'use client'

import TextStats from '@/components/stats'
import type { ValidationResult } from '@/lib/ai-providers'

interface EditorStatusBarProps {
  content: string
  validationResult: ValidationResult | null
}

export function EditorStatusBar({ content, validationResult }: EditorStatusBarProps) {
  return (
    <div className="px-4 py-2 border-t border-border flex-shrink-0">
      <TextStats content={content} />
      {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
        <div className="mt-2 space-y-1">
          {validationResult.errors.map((error, index) => (
            <div
              key={`error-${index}`}
              className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950 border-l-4 border-red-500 px-3 py-2 rounded"
            >
              <span className="text-red-600 dark:text-red-400 font-semibold">Error:</span>
              <div className="flex-1">
                <span className="font-mono text-xs text-red-700 dark:text-red-300">{error.field}</span>
                <span className="text-red-800 dark:text-red-200 ml-2">{error.message}</span>
              </div>
            </div>
          ))}
          {validationResult.warnings.map((warning, index) => (
            <div
              key={`warning-${index}`}
              className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 px-3 py-2 rounded"
            >
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Warning:</span>
              <div className="flex-1">
                <span className="font-mono text-xs text-amber-700 dark:text-amber-300">{warning.field}</span>
                <span className="text-amber-800 dark:text-amber-200 ml-2">{warning.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
