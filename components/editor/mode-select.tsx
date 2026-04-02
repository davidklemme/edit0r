'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ModeSelectProps {
  mode: string
  onModeChange: (mode: string) => void
}

export function ModeSelect({ mode, onModeChange }: ModeSelectProps) {
  return (
    <Select value={mode} onValueChange={onModeChange}>
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <SelectValue placeholder="Select mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="text">Plain Text</SelectItem>
        <SelectItem value="json">JSON</SelectItem>
        <SelectItem value="html">HTML</SelectItem>
        <SelectItem value="csv">CSV</SelectItem>
      </SelectContent>
    </Select>
  )
}
