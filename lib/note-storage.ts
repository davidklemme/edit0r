import { STORAGE_PREFIX } from '@/lib/constants'

export interface SavedNote {
  id: string
  name: string
  content: string
  savedAt: string
}

const SNAPSHOT_PREFIX = `${STORAGE_PREFIX}snapshot:`

function snapshotId(name: string, savedAt: string) {
  const random = Math.random().toString(36).slice(2, 8)
  return `${savedAt}-${random}-${encodeURIComponent(name)}`
}

/** Save an immutable snapshot so saving the same note name never destroys an earlier copy. */
export function saveNoteSnapshot(storage: Storage, name: string, content: string, now = new Date()): SavedNote {
  const savedAt = now.toISOString()
  const note: SavedNote = {
    id: snapshotId(name, savedAt),
    name,
    content,
    savedAt,
  }
  storage.setItem(SNAPSHOT_PREFIX + note.id, JSON.stringify(note))
  return note
}

export function listNoteSnapshots(storage: Storage): SavedNote[] {
  const notes: SavedNote[] = []

  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index)
    if (!key?.startsWith(STORAGE_PREFIX)) continue

    const value = storage.getItem(key)
    if (value === null) continue

    if (key.startsWith(SNAPSHOT_PREFIX)) {
      try {
        const note = JSON.parse(value) as SavedNote
        if (note.id && note.name && typeof note.content === 'string' && note.savedAt) notes.push(note)
      } catch {
        // Ignore corrupt entries; one bad snapshot should not hide the others.
      }
      continue
    }

    // Preserve access to saves created before snapshots were introduced.
    const name = key.slice(STORAGE_PREFIX.length)
    notes.push({ id: key, name, content: value, savedAt: '' })
  }

  return notes.sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}
