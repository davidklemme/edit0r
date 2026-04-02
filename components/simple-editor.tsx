'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import type { Ace } from 'ace-builds'
import { TooltipProvider } from '@/components/ui/tooltip'
import { toast } from '@/hooks/use-toast'
import { detectLineEndings } from '@/lib/utils'

import { EditorToolbar } from './editor/editor-toolbar'
import { EditorArea } from './editor/editor-area'
import { EditorStatusBar } from './editor/editor-status-bar'
import { EditorEmptyState } from './editor/editor-empty-state'

import { useEditorContent } from '@/hooks/use-editor-content'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { useProviderDetection } from '@/hooks/use-provider-detection'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useLineBreakOptions } from '@/hooks/use-line-break-options'

import {
  formatContent,
  validateContent,
  copyToClipboard,
  pasteFromClipboard,
  processLineBreaks,
  flattenContent,
  unflattenContent,
} from '@/lib/editor-actions'

export default function SimpleEditor() {
  const [mode, setMode] = useState('text')
  const editorRef = useRef<Ace.Editor | null>(null)

  const { content, setContent, isFlattened, setIsFlattened, addToHistory, handleUndo, handleRedo, canUndo, canRedo, lastOperation } =
    useEditorContent()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { detectionResult, manualProvider, setManualProvider, validationResult } = useProviderDetection(
    content,
    mode,
    editorRef
  )
  const { savedKeys, saveContent, loadContent, refreshKeys } = useLocalStorage()
  const { lineBreakOptions, setLineBreakOptions, resetOptions } = useLineBreakOptions()

  const lineCount = useMemo(() => content.split('\n').length, [content])
  const lineEndings = useMemo(() => detectLineEndings(content), [content])

  // Warn before closing tab with content
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (content) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [content])

  const handleCopy = async () => {
    const result = await copyToClipboard(content)
    if (result.ok) {
      toast({ title: 'Copied to clipboard' })
    } else {
      toast({ title: 'Copy failed', description: result.error, variant: 'destructive' })
    }
  }

  const handlePaste = async () => {
    const result = await pasteFromClipboard()
    if (result.ok) {
      setContent(result.text)
      toast({ title: 'Pasted from clipboard' })
    } else {
      toast({ title: 'Paste failed', description: result.error, variant: 'destructive' })
    }
  }

  const handleFormat = () => {
    try {
      const formatted = formatContent(content, mode)
      setContent(formatted)
      toast({ title: 'Formatted successfully' })
    } catch (error) {
      toast({
        title: 'Format failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleValidate = () => {
    const result = validateContent(content, mode)
    if (result.valid) {
      toast({ title: 'Valid', description: `${mode.toUpperCase()} content is valid.` })
    } else {
      toast({ title: 'Invalid', description: result.error, variant: 'destructive' })
    }
  }

  const handleFlattenToggle = () => {
    try {
      if (isFlattened) {
        const result = unflattenContent(content, mode)
        setContent(result)
        setIsFlattened(false)
        toast({ title: 'Content unflattened' })
      } else {
        const result = flattenContent(content, lineBreakOptions)
        addToHistory(result, 'Flatten')
        setIsFlattened(true)
        toast({ title: 'Content flattened' })
      }
    } catch (error) {
      toast({
        title: 'Operation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleSmartProcess = () => {
    try {
      const processed = processLineBreaks(content, lineBreakOptions)
      addToHistory(processed, 'Line Break Processing')
      setIsFlattened(false)
      toast({ title: 'Line breaks processed' })
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleSave = (name: string) => {
    const result = saveContent(name, content)
    if (result.ok) {
      toast({ title: 'Saved', description: `Saved as "${name}"` })
    } else if (result.error) {
      toast({ title: 'Save failed', description: result.error, variant: 'destructive' })
    }
  }

  const handleLoad = (key: string) => {
    const value = loadContent(key)
    if (value !== null) {
      setContent(value)
      toast({ title: 'Loaded', description: `Loaded "${key}"` })
    }
  }

  const handleUndoWithToast = () => {
    const op = handleUndo()
    if (op) toast({ title: 'Undone', description: `Reverted: ${op}` })
  }

  const handleRedoWithToast = () => {
    const op = handleRedo()
    if (op) toast({ title: 'Redone', description: `Reapplied: ${op}` })
  }

  // Keyboard shortcuts — must be after handler declarations
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 's') {
        e.preventDefault()
        handleSave('_quicksave')
      } else if (mod && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        handleFormat()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`flex flex-col h-full w-full ${isDarkMode ? 'dark' : ''}`}>
        <EditorToolbar
          mode={mode}
          onModeChange={setMode}
          manualProvider={manualProvider}
          onManualProviderChange={setManualProvider}
          detectionResult={detectionResult}
          lineCount={lineCount}
          lineEndings={lineEndings}
          isFlattened={isFlattened}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onFormat={handleFormat}
          onValidate={handleValidate}
          onFlattenToggle={handleFlattenToggle}
          onUndo={handleUndoWithToast}
          onRedo={handleRedoWithToast}
          canUndo={canUndo}
          canRedo={canRedo}
          onSave={handleSave}
          savedKeys={savedKeys}
          onLoad={handleLoad}
          onRefreshKeys={refreshKeys}
          lineBreakOptions={lineBreakOptions}
          onLineBreakOptionsChange={setLineBreakOptions}
          onResetOptions={resetOptions}
          onSmartProcess={handleSmartProcess}
          lastOperation={lastOperation}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        <EditorArea
          content={content}
          onContentChange={setContent}
          mode={mode}
          isDarkMode={isDarkMode}
          editorRef={editorRef}
          detectionResult={detectionResult}
        >
          {!content && <EditorEmptyState />}
        </EditorArea>
        <EditorStatusBar content={content} validationResult={validationResult} />
      </div>
    </TooltipProvider>
  )
}
