/**
 * Append-to-disk sink for the notes file.
 *
 * The editor stays stateless: no API keys, no fetch, no CORS. It appends note
 * blocks to a file the user picked, and a local watcher takes it from there.
 *
 * Chromium only — Firefox and Safari have no `showSaveFilePicker`, so callers
 * must feature-detect with `isNoteFileSupported()` and hide the affordance
 * rather than let it throw.
 */

import { buildCaptureBlock, type CaptureMeta } from '@/lib/note-capture'

/** Structural types, so this file does not depend on which lib.dom ships the FS Access API. */
interface NoteFileWritable {
  write(data: { type: 'write'; position: number; data: string }): Promise<void>
  close(): Promise<void>
}

export interface NoteFileHandle {
  name: string
  getFile(): Promise<File>
  createWritable(options?: { keepExistingData?: boolean }): Promise<NoteFileWritable>
  queryPermission?(descriptor: { mode: 'readwrite' }): Promise<PermissionState>
  requestPermission?(descriptor: { mode: 'readwrite' }): Promise<PermissionState>
}

interface SaveFilePickerWindow {
  showSaveFilePicker(options?: {
    suggestedName?: string
    types?: Array<{ description?: string; accept: Record<string, string[]> }>
  }): Promise<NoteFileHandle>
}

export const DEFAULT_NOTES_FILENAME = 'edit0r-inbox.md'

const DB_NAME = 'edit0r'
const DB_VERSION = 1
const STORE_NAME = 'handles'
const HANDLE_KEY = 'notes-file'

export function isNoteFileSupported(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'indexedDB' in window
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME))
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }).finally(() => db.close())
  )
}

/**
 * A FileSystemFileHandle is structured-cloneable, so IndexedDB can hold it
 * across reloads. localStorage cannot — it only stores strings.
 */
export function persistNoteFileHandle(handle: NoteFileHandle): Promise<void> {
  return withStore('readwrite', (store) => store.put(handle, HANDLE_KEY)).then(() => undefined)
}

export function readPersistedNoteFileHandle(): Promise<NoteFileHandle | null> {
  return withStore<NoteFileHandle | undefined>('readonly', (store) => store.get(HANDLE_KEY))
    .then((handle) => handle ?? null)
    .catch(() => null)
}

export function forgetNoteFileHandle(): Promise<void> {
  return withStore('readwrite', (store) => store.delete(HANDLE_KEY))
    .then(() => undefined)
    .catch(() => undefined)
}

/** Returns null when the user cancels the picker — a cancel is not an error. */
export async function pickNoteFile(suggestedName = DEFAULT_NOTES_FILENAME): Promise<NoteFileHandle | null> {
  try {
    return await (window as unknown as SaveFilePickerWindow).showSaveFilePicker({
      suggestedName,
      types: [{ description: 'Markdown or text notes', accept: { 'text/markdown': ['.md'], 'text/plain': ['.txt'] } }],
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null
    throw error
  }
}

export async function noteFilePermission(handle: NoteFileHandle): Promise<PermissionState> {
  if (!handle.queryPermission) return 'granted'
  return handle.queryPermission({ mode: 'readwrite' })
}

/** Must be called from a user gesture, or the browser rejects it outright. */
export async function requestNoteFilePermission(handle: NoteFileHandle): Promise<PermissionState> {
  if (!handle.requestPermission) return 'granted'
  return handle.requestPermission({ mode: 'readwrite' })
}

export interface AppendResult {
  ok: boolean
  id?: string
  error?: string
}

/**
 * Append one capture block at the current end of the file.
 *
 * Assumes this tab is the only writer, which is the design: the watcher on the
 * other side only ever reads. `keepExistingData` means the browser copies the
 * file into a swap first, so an interrupted write cannot truncate it.
 */
export async function appendCaptureBlock(
  handle: NoteFileHandle,
  content: string,
  meta: CaptureMeta = {}
): Promise<AppendResult> {
  if (!content.trim()) return { ok: false, error: 'Nothing to append — the editor is empty.' }

  try {
    const file = await handle.getFile()
    const size = file.size

    // Every block after the first gets a leading newline, rather than reading the
    // file's last byte back to find out whether it needs one. One extra blank
    // line between blocks is free; a joined line would corrupt the sentinel.
    const block = buildCaptureBlock(content, meta, new Date(), size > 0)

    const writable = await handle.createWritable({ keepExistingData: true })
    await writable.write({ type: 'write', position: size, data: block.text })
    await writable.close()

    return { ok: true, id: block.id }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      return { ok: false, error: 'Write permission was withdrawn. Reconnect the notes file.' }
    }
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
