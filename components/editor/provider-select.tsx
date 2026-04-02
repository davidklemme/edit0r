'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSupportedProviders, getProviderConfig } from '@/lib/ai-providers'
import type { AIProvider } from '@/lib/ai-providers'

interface ProviderSelectProps {
  manualProvider: AIProvider | null
  onManualProviderChange: (provider: AIProvider | null) => void
}

export function ProviderSelect({ manualProvider, onManualProviderChange }: ProviderSelectProps) {
  return (
    <Select
      value={manualProvider || 'auto'}
      onValueChange={(value) => onManualProviderChange(value === 'auto' ? null : (value as AIProvider))}
    >
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue placeholder="Provider (auto)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto-detect</SelectItem>
        {getSupportedProviders()
          .filter((p) => p !== 'generic')
          .map((provider) => (
            <SelectItem key={provider} value={provider}>
              {getProviderConfig(provider).displayName}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
