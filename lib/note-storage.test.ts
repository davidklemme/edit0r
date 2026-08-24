import { beforeEach, describe, expect, it } from 'vitest'
import { listNoteSnapshots, saveNoteSnapshot } from './note-storage'

describe('note snapshots', () => {
  beforeEach(() => localStorage.clear())

  it('keeps every save made with the same name', () => {
    saveNoteSnapshot(localStorage, 'scratch', 'first', new Date('2026-01-01T10:00:00Z'))
    saveNoteSnapshot(localStorage, 'scratch', 'second', new Date('2026-01-01T11:00:00Z'))

    expect(listNoteSnapshots(localStorage).map(({ name, content }) => ({ name, content }))).toEqual([
      { name: 'scratch', content: 'second' },
      { name: 'scratch', content: 'first' },
    ])
  })

  it('continues to expose saves from the old storage format', () => {
    localStorage.setItem('edit0r:old note', 'legacy content')

    expect(listNoteSnapshots(localStorage)).toContainEqual({
      id: 'edit0r:old note',
      name: 'old note',
      content: 'legacy content',
      savedAt: '',
    })
  })
})
