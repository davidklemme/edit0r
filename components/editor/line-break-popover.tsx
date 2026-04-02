'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Settings } from 'lucide-react'
import type { LineBreakOptions, LineEndingType } from '@/lib/utils'

interface LineBreakPopoverProps {
  lineCount: number
  lineEndings: string
  options: LineBreakOptions
  onOptionsChange: React.Dispatch<React.SetStateAction<LineBreakOptions>>
  onReset: () => void
  onProcess: () => void
  lastOperation: string | null
  canUndo: boolean
}

export function LineBreakPopover({
  lineCount,
  lineEndings,
  options,
  onOptionsChange,
  onReset,
  onProcess,
  lastOperation,
  canUndo,
}: LineBreakPopoverProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  const trigger = (
    <PopoverTrigger asChild>
      <Button size="icon" variant="ghost">
        <Settings />
      </Button>
    </PopoverTrigger>
  )

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      {popoverOpen ? (
        trigger
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>Line Break Options</TooltipContent>
        </Tooltip>
      )}

      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Line Break Options</h3>
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Detected: {lineEndings} | Lines: {lineCount}
          </div>

          <div className="space-y-3">
            {([
              ['preserveParagraphs', 'Preserve paragraphs'],
              ['preserveCodeBlocks', 'Preserve code blocks'],
              ['preserveLists', 'Preserve lists'],
              ['removeEmptyLines', 'Remove empty lines'],
              ['intelligentSpacing', 'Intelligent spacing'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center space-x-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[key] as boolean}
                  onChange={(e) =>
                    onOptionsChange((prev: LineBreakOptions) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="rounded h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">Line endings:</label>
            <Select
              value={options.normalizeLineEndings}
              onValueChange={(value: LineEndingType) =>
                onOptionsChange((prev: LineBreakOptions) => ({ ...prev, normalizeLineEndings: value }))
              }
            >
              <SelectTrigger className="w-full h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LF">LF (Unix)</SelectItem>
                <SelectItem value="CRLF">CRLF (Windows)</SelectItem>
                <SelectItem value="CR">CR (Mac)</SelectItem>
                <SelectItem value="MIXED">Keep as is</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <Button size="sm" className="flex-1" onClick={() => { onProcess(); setPopoverOpen(false) }}>
              Process
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={onReset}>
              Reset
            </Button>
          </div>

          {canUndo && lastOperation && (
            <div className="text-xs text-muted-foreground pt-1 font-medium">Last: {lastOperation}</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
