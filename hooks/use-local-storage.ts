'use client'

import { useState, useCallback } from 'react'
import { STORAGE_PREFIX } from '@/lib/constants'

export function useLocalStorage() {
  const [savedKeys, setSavedKeys] = useState<string[]>([])

  const refreshKeys = useCallback(() => {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key.slice(STORAGE_PREFIX.length))
      }
    }
    setSavedKeys(keys)
  }, [])

  const saveContent = useCallback(
    (name: string, content: string): { ok: boolean; error?: string } => {
      try {
        localStorage.setItem(STORAGE_PREFIX + name, content)
        refreshKeys()
        return { ok: true }
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
    [refreshKeys]
  )

  const loadContent = useCallback((key: string): string | null => {
    return localStorage.getItem(STORAGE_PREFIX + key)
  }, [])

  return { savedKeys, saveContent, loadContent, refreshKeys }
}
