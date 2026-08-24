'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { STORAGE_PREFIX } from '@/lib/constants'
import {
  appendCaptureBlock,
  forgetNoteFileHandle,
  isNoteFileSupported,
  noteFilePermission,
  persistNoteFileHandle,
  pickNoteFile,
  readPersistedNoteFileHandle,
  requestNoteFilePermission,
  type AppendResult,
  type NoteFileHandle,
} from '@/lib/note-file'
import type { CaptureMeta } from '@/lib/note-capture'

const META_KEY = `${STORAGE_PREFIX}notefile:meta`

export type NoteFileStatus =
  /** No File System Access API — hide the affordance entirely. */
  | 'unsupported'
  /** Supported, but no file chosen yet. */
  | 'disconnected'
  /** A file is remembered, but the permission needs a fresh user gesture. */
  | 'needs-permission'
  | 'ready'

function readStoredMeta(): CaptureMeta {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? (JSON.parse(raw) as CaptureMeta) : {}
  } catch {
    return {}
  }
}

export function useNoteFile() {
  const [status, setStatus] = useState<NoteFileStatus>('unsupported')
  const [fileName, setFileName] = useState<string | null>(null)
  const [meta, setMeta] = useState<CaptureMeta>({})
  const [isAppending, setIsAppending] = useState(false)

  const handleRef = useRef<NoteFileHandle | null>(null)
  // Appends are chained so two fast clicks cannot compute the same write
  // position and clobber each other.
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    if (!isNoteFileSupported()) return

    let cancelled = false
    setMeta(readStoredMeta())

    readPersistedNoteFileHandle().then(async (handle) => {
      if (cancelled) return
      if (!handle) {
        setStatus('disconnected')
        return
      }
      handleRef.current = handle
      setFileName(handle.name)
      // Only query here. Asking for permission without a user gesture fails.
      const permission = await noteFilePermission(handle).catch(() => 'prompt' as PermissionState)
      if (cancelled) return
      setStatus(permission === 'granted' ? 'ready' : 'needs-permission')
    })

    return () => {
      cancelled = true
    }
  }, [])

  const persistMeta = useCallback((next: CaptureMeta) => {
    setMeta(next)
    try {
      localStorage.setItem(META_KEY, JSON.stringify(next))
    } catch {
      // A full quota should not stop the append itself.
    }
  }, [])

  /** Call from a user gesture. Reconnects a remembered file, or picks a new one. */
  const connect = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      if (handleRef.current) {
        const permission = await requestNoteFilePermission(handleRef.current)
        if (permission === 'granted') {
          setStatus('ready')
          return { ok: true }
        }
        // Denied: drop the stale handle so the next click offers the picker.
        handleRef.current = null
        setFileName(null)
        await forgetNoteFileHandle()
        setStatus('disconnected')
        return { ok: false, error: 'Write permission was denied.' }
      }

      const handle = await pickNoteFile()
      if (!handle) return { ok: false }

      handleRef.current = handle
      setFileName(handle.name)
      await persistNoteFileHandle(handle)
      setStatus('ready')
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }, [])

  const disconnect = useCallback(async () => {
    handleRef.current = null
    setFileName(null)
    setStatus('disconnected')
    await forgetNoteFileHandle()
  }, [])

  const append = useCallback(
    async (content: string, next?: CaptureMeta): Promise<AppendResult> => {
      const handle = handleRef.current
      if (!handle) return { ok: false, error: 'No notes file connected.' }
      if (next) persistMeta(next)

      const run = queueRef.current.then(async () => {
        setIsAppending(true)
        try {
          const result = await appendCaptureBlock(handle, content, next ?? meta)
          // A withdrawn permission is recoverable, but only via a new gesture.
          if (!result.ok && result.error?.includes('permission')) setStatus('needs-permission')
          return result
        } finally {
          setIsAppending(false)
        }
      })

      queueRef.current = run.catch(() => undefined)
      return run
    },
    [meta, persistMeta]
  )

  return { status, fileName, meta, isAppending, connect, disconnect, append, setMeta: persistMeta }
}
