'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Copy,
  Clipboard,
  FileCode2,
  Check,
  Minimize2,
  Maximize2,
  Undo,
  Redo,
  Moon,
  Sun,
} from 'lucide-react'

import { ModeSelect } from './mode-select'
import { ProviderSelect } from './provider-select'
import { ProviderBadge } from './provider-badge'
import { LineBreakPopover } from './line-break-popover'
import { StorageMenu } from './storage-menu'
import { SavePopover } from './save-popover'

import type { ProviderDetectionResult, AIProvider } from '@/lib/ai-providers'
import type { LineBreakOptions } from '@/lib/utils'

interface EditorToolbarProps {
  mode: string
  onModeChange: (mode: string) => void
  manualProvider: AIProvider | null
  onManualProviderChange: (provider: AIProvider | null) => void
  detectionResult: ProviderDetectionResult | null
  lineCount: number
  lineEndings: string
  isFlattened: boolean
  onCopy: () => void
  onPaste: () => void
  onFormat: () => void
  onValidate: () => void
  onFlattenToggle: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onSave: (name: string) => void
  savedKeys: string[]
  onLoad: (key: string) => void
  onRefreshKeys: () => void
  lineBreakOptions: LineBreakOptions
  onLineBreakOptionsChange: React.Dispatch<React.SetStateAction<LineBreakOptions>>
  onResetOptions: () => void
  onSmartProcess: () => void
  lastOperation: string | null
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" onClick={onClick} disabled={disabled}>
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function ToolbarSeparator() {
  return <Separator orientation="vertical" className="h-6 mx-0.5" />
}

export function EditorToolbar({
  mode,
  onModeChange,
  manualProvider,
  onManualProviderChange,
  detectionResult,
  lineCount,
  lineEndings,
  isFlattened,
  onCopy,
  onPaste,
  onFormat,
  onValidate,
  onFlattenToggle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  savedKeys,
  onLoad,
  onRefreshKeys,
  lineBreakOptions,
  onLineBreakOptionsChange,
  onResetOptions,
  onSmartProcess,
  lastOperation,
  isDarkMode,
  onToggleDarkMode,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border flex-shrink-0 overflow-x-auto scrollbar-none min-h-[44px]">
      {/* Mode & Provider */}
      <ModeSelect mode={mode} onModeChange={onModeChange} />
      <ProviderSelect manualProvider={manualProvider} onManualProviderChange={onManualProviderChange} />
      <ProviderBadge manualProvider={manualProvider} detectionResult={detectionResult} />

      <ToolbarSeparator />

      {/* Clipboard */}
      <ToolbarButton icon={Copy} label="Copy" onClick={onCopy} />
      <ToolbarButton icon={Clipboard} label="Paste" onClick={onPaste} />

      <ToolbarSeparator />

      {/* Format & Validate */}
      <ToolbarButton icon={FileCode2} label="Format" onClick={onFormat} />
      <ToolbarButton icon={Check} label="Validate" onClick={onValidate} />

      <ToolbarSeparator />

      {/* Transform */}
      <ToolbarButton
        icon={isFlattened ? Maximize2 : Minimize2}
        label={isFlattened ? 'Unflatten' : 'Flatten'}
        onClick={onFlattenToggle}
      />
      <LineBreakPopover
        lineCount={lineCount}
        lineEndings={lineEndings}
        options={lineBreakOptions}
        onOptionsChange={onLineBreakOptionsChange}
        onReset={onResetOptions}
        onProcess={onSmartProcess}
        lastOperation={lastOperation}
        canUndo={canUndo}
      />

      <ToolbarSeparator />

      {/* History */}
      <ToolbarButton icon={Undo} label="Undo" onClick={onUndo} disabled={!canUndo} />
      <ToolbarButton icon={Redo} label="Redo" onClick={onRedo} disabled={!canRedo} />

      <ToolbarSeparator />

      {/* Storage */}
      <SavePopover onSave={onSave} />
      <StorageMenu savedKeys={savedKeys} onLoad={onLoad} onRefresh={onRefreshKeys} />

      <ToolbarSeparator />

      {/* Theme */}
      <ToolbarButton
        icon={isDarkMode ? Sun : Moon}
        label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        onClick={onToggleDarkMode}
      />
    </div>
  )
}
