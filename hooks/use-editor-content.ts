'use client'

import { useState, useRef, useCallback } from 'react'
import { ProcessingHistoryManager } from '@/lib/utils'

interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  lastOperation: string | null
}

export function useEditorContent() {
  const [content, setContent] = useState('')
  const [isFlattened, setIsFlattened] = useState(false)
  const [historyState, setHistoryState] = useState<HistoryState>({
    canUndo: false,
    canRedo: false,
    lastOperation: null,
  })
  const managerRef = useRef<ProcessingHistoryManager | null>(null)
  if (managerRef.current == null) {
    managerRef.current = new ProcessingHistoryManager()
  }

  const syncHistoryState = useCallback(() => {
    const mgr = managerRef.current!
    setHistoryState({
      canUndo: mgr.canUndo(),
      canRedo: mgr.canRedo(),
      lastOperation: mgr.getCurrentEntry()?.operation ?? null,
    })
  }, [])

  const addToHistory = useCallback(
    (newContent: string, operation: string) => {
      managerRef.current!.addToHistory(content, operation)
      setContent(newContent)
      syncHistoryState()
    },
    [content, syncHistoryState]
  )

  const handleUndo = useCallback(() => {
    const entry = managerRef.current!.undo()
    if (entry) {
      setContent(entry.content)
      syncHistoryState()
      return entry.operation
    }
    return null
  }, [syncHistoryState])

  const handleRedo = useCallback(() => {
    const entry = managerRef.current!.redo()
    if (entry) {
      setContent(entry.content)
      syncHistoryState()
      return entry.operation
    }
    return null
  }, [syncHistoryState])

  return {
    content,
    setContent,
    isFlattened,
    setIsFlattened,
    addToHistory,
    handleUndo,
    handleRedo,
    ...historyState,
  }
}
