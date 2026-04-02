'use client'

import { getProviderConfig } from '@/lib/ai-providers'
import type { ProviderDetectionResult, AIProvider } from '@/lib/ai-providers'

interface ProviderBadgeProps {
  manualProvider: AIProvider | null
  detectionResult: ProviderDetectionResult | null
}

export function ProviderBadge({ manualProvider, detectionResult }: ProviderBadgeProps) {
  if (!manualProvider && !detectionResult) return null

  const provider = manualProvider || detectionResult!.provider
  const config = getProviderConfig(provider)

  return (
    <div
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badgeStyles}`}
      title={
        detectionResult
          ? `Confidence: ${(detectionResult.confidence * 100).toFixed(0)}% - ${detectionResult.indicators.join(', ')}`
          : 'Manually selected'
      }
    >
      {config.displayName}
      {!manualProvider && detectionResult && ` (${(detectionResult.confidence * 100).toFixed(0)}%)`}
    </div>
  )
}
