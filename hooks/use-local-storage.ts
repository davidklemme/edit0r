'use client'

import { useState, useCallback } from 'react'
import { listNoteSnapshots, saveNoteSnapshot, type SavedNote } from '@/lib/note-storage'

export function useLocalStorage() {
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])

  const refreshKeys = useCallback(() => {
    setSavedNotes(listNoteSnapshots(localStorage))
  }, [])

  const saveContent = useCallback(
    (name: string, content: string): { ok: boolean; error?: string } => {
      try {
        saveNoteSnapshot(localStorage, name, content)
        refreshKeys()
        return { ok: true }
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
    [refreshKeys]
  )

  const loadContent = useCallback(
    (id: string): string | null => listNoteSnapshots(localStorage).find((note) => note.id === id)?.content ?? null,
    []
  )

  return { savedNotes, saveContent, loadContent, refreshKeys }
}
