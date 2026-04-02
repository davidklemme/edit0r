'use client'

import { useState, useEffect } from 'react'
import type { Ace } from 'ace-builds'
import { providerDetector, providerValidator } from '@/lib/ai-providers'
import type { ProviderDetectionResult, ValidationResult, AIProvider } from '@/lib/ai-providers'

export function useProviderDetection(
  content: string,
  mode: string,
  editorRef: React.RefObject<Ace.Editor | null>
) {
  const [detectionResult, setDetectionResult] = useState<ProviderDetectionResult | null>(null)
  const [manualProvider, setManualProvider] = useState<AIProvider | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  // Detect AI provider when content changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode !== 'json' || !content.trim()) {
        setDetectionResult(null)
        setValidationResult(null)
        return
      }

      try {
        const result = providerDetector.detect(content)
        if (result.confidence >= 0.3) {
          setDetectionResult(result)
        } else {
          setDetectionResult(null)
        }
      } catch {
        setDetectionResult(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [content, mode])

  // Validate content when provider or content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode !== 'json' || !content.trim()) {
        setValidationResult(null)
        return
      }

      try {
        const config = JSON.parse(content)
        const provider = manualProvider || detectionResult?.provider

        if (provider && provider !== 'generic') {
          const result = providerValidator.validate(config, provider)
          setValidationResult(result)
        } else {
          setValidationResult(null)
        }
      } catch {
        setValidationResult(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [content, mode, manualProvider, detectionResult])

  // Update editor annotations when validation changes
  useEffect(() => {
    if (!editorRef.current) return

    const findLineForField = (fieldPath: string): number => {
      const lines = content.split('\n')
      const fieldName = fieldPath.split('.').pop()?.replace(/\[.*\]/, '') || fieldPath

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`"${fieldName}"`)) {
          return i
        }
      }

      const parentField = fieldPath.split('[')[0]
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`"${parentField}"`)) {
          return i
        }
      }

      return 0
    }

    const annotations: Ace.Annotation[] = []

    if (validationResult) {
      validationResult.errors.forEach((error) => {
        annotations.push({
          row: findLineForField(error.field),
          column: 0,
          text: `${error.field}: ${error.message}`,
          type: 'error',
        })
      })

      validationResult.warnings.forEach((warning) => {
        annotations.push({
          row: findLineForField(warning.field),
          column: 0,
          text: `${warning.field}: ${warning.message}`,
          type: 'warning',
        })
      })
    }

    editorRef.current.getSession().setAnnotations(annotations)
  }, [validationResult, content, editorRef])

  return {
    detectionResult,
    manualProvider,
    setManualProvider,
    validationResult,
  }
}
