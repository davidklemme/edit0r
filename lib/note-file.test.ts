import { describe, expect, it } from 'vitest'
import { appendCaptureBlock, type NoteFileHandle } from './note-file'
import { parseCaptureBlocks } from './note-capture'

/**
 * Minimal stand-in for a FileSystemFileHandle. Positions are byte offsets; the
 * fake indexes a string instead, which is equivalent for the ASCII fixtures used
 * here and keeps the position arithmetic under test visible.
 */
function fakeHandle(initial = '') {
  const state = { data: initial, writes: [] as Array<{ position: number; data: string }> }

  const handle: NoteFileHandle = {
    name: 'edit0r-inbox.md',
    async getFile() {
      return new File([state.data], 'edit0r-inbox.md', { type: 'text/markdown' })
    },
    async createWritable() {
      return {
        async write(chunk) {
          state.writes.push(chunk)
          state.data = state.data.slice(0, chunk.position) + chunk.data
        },
        async close() {},
      }
    },
  }

  return { handle, state }
}

describe('appendCaptureBlock', () => {
  it('writes the first block at position zero', async () => {
    const { handle, state } = fakeHandle()

    const result = await appendCaptureBlock(handle, 'first note', { project: 'alpha' })

    expect(result.ok).toBe(true)
    expect(state.writes).toEqual([{ type: 'write', position: 0, data: state.data }])
    expect(parseCaptureBlocks(state.data)).toEqual([
      expect.objectContaining({ id: result.id, project: 'alpha', body: 'first note' }),
    ])
  })

  it('appends at the end of the existing file without overwriting it', async () => {
    const { handle, state } = fakeHandle('earlier content\n')

    await appendCaptureBlock(handle, 'later note')

    expect(state.writes[0].position).toBe('earlier content\n'.length)
    expect(state.data.startsWith('earlier content\n')).toBe(true)
  })

  it('separates the sentinel from a file that does not end with a newline', async () => {
    const { handle, state } = fakeHandle('no trailing newline')

    await appendCaptureBlock(handle, 'later note')

    expect(state.data).toContain('no trailing newline\n<!-- edit0r:snapshot ')
    expect(parseCaptureBlocks(state.data)[0].body).toBe('no trailing newline')
  })

  it('keeps every block parseable across repeated appends', async () => {
    const { handle, state } = fakeHandle()

    await appendCaptureBlock(handle, 'one', { name: 'a' })
    await appendCaptureBlock(handle, 'two', { name: 'b' })
    await appendCaptureBlock(handle, 'three', { name: 'c' })

    expect(parseCaptureBlocks(state.data).map((block) => block.body)).toEqual(['one', 'two', 'three'])
  })

  it('refuses whitespace-only content instead of writing an empty block', async () => {
    const { handle, state } = fakeHandle('existing\n')

    const result = await appendCaptureBlock(handle, '   \n  ')

    expect(result.ok).toBe(false)
    expect(state.writes).toHaveLength(0)
  })

  it('reports a withdrawn permission as recoverable rather than throwing', async () => {
    const { handle } = fakeHandle('existing\n')
    handle.createWritable = async () => {
      throw new DOMException('denied', 'NotAllowedError')
    }

    const result = await appendCaptureBlock(handle, 'note')

    expect(result.ok).toBe(false)
    expect(result.error).toContain('Reconnect')
  })
})
