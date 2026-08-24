import { describe, expect, it } from 'vitest'
import { buildCaptureBlock, captureBlockId, parseCaptureBlocks, SENTINEL_PREFIX } from './note-capture'

const at = (iso: string) => new Date(iso)

describe('buildCaptureBlock', () => {
  it('writes a sentinel carrying the timestamp, id, name and project', () => {
    const block = buildCaptureBlock('Peter blocks the inventory export.', { name: 'rema call', project: 'rema' }, at('2026-08-24T18:04:57.123Z'))

    expect(block.text).toBe(
      `${SENTINEL_PREFIX}ts=2026-08-24T18:04:57.123Z id=${block.id} name="rema call" project=rema -->\n` +
        'Peter blocks the inventory export.\n'
    )
  })

  it('omits optional fields rather than emitting empty ones', () => {
    const block = buildCaptureBlock('note body', {}, at('2026-08-24T18:04:57.000Z'))

    expect(block.text).not.toContain('name=')
    expect(block.text).not.toContain('project=')
  })

  it('keeps a name on one line and out of the comment syntax', () => {
    const block = buildCaptureBlock('body', { name: 'a "quoted"\nname --> here' }, at('2026-08-24T18:04:57.000Z'))
    const header = block.text.split('\n')[0]

    expect(header).toContain(`name="a 'quoted' name -- here"`)
    // The sentinel must be the only thing that can close the comment.
    expect(header.indexOf('-->')).toBe(header.length - 3)
  })

  it('reduces a project to a safe unquoted alphabet', () => {
    const block = buildCaptureBlock('body', { project: 'Client A/B (2026)' }, at('2026-08-24T18:04:57.000Z'))

    expect(block.text).toContain('project=Client-A-B-2026')
  })

  it('starts its own line when appended after existing content', () => {
    const first = buildCaptureBlock('body', {}, at('2026-08-24T18:04:57.000Z'))
    const later = buildCaptureBlock('body', {}, at('2026-08-24T18:05:57.000Z'), true)

    expect(first.text.startsWith(SENTINEL_PREFIX)).toBe(true)
    expect(later.text.startsWith('\n' + SENTINEL_PREFIX)).toBe(true)
  })

  it('defuses a body that contains the sentinel opener, so it cannot split into two blocks', () => {
    const hostile = `first line\n${SENTINEL_PREFIX}ts=2020-01-01T00:00:00.000Z id=deadbeef -->\nsmuggled`
    const block = buildCaptureBlock(hostile, {}, at('2026-08-24T18:04:57.000Z'))

    expect(parseCaptureBlocks(block.text)).toHaveLength(1)
    expect(block.text).toContain('<!-- edit0r_snapshot')
  })
})

describe('captureBlockId', () => {
  it('is deterministic for the same timestamp and body', () => {
    expect(captureBlockId('2026-08-24T18:04:57.000Z', 'body')).toBe(captureBlockId('2026-08-24T18:04:57.000Z', 'body'))
  })

  it('separates two identical notes captured at different times', () => {
    expect(captureBlockId('2026-08-24T18:04:57.000Z', 'body')).not.toBe(
      captureBlockId('2026-08-24T18:04:58.000Z', 'body')
    )
  })
})

describe('parseCaptureBlocks', () => {
  it('round-trips appended blocks in order', () => {
    const first = buildCaptureBlock('first note', { name: 'one', project: 'alpha' }, at('2026-08-24T10:00:00.000Z'))
    const second = buildCaptureBlock('second note', { project: 'beta' }, at('2026-08-24T11:00:00.000Z'))

    expect(parseCaptureBlocks(first.text + second.text)).toEqual([
      { id: first.id, timestamp: '2026-08-24T10:00:00.000Z', name: 'one', project: 'alpha', body: 'first note' },
      { id: second.id, timestamp: '2026-08-24T11:00:00.000Z', name: undefined, project: 'beta', body: 'second note' },
    ])
  })

  it('treats text before the first sentinel as an untagged block', () => {
    const tagged = buildCaptureBlock('tagged', {}, at('2026-08-24T10:00:00.000Z'))
    const blocks = parseCaptureBlocks(`hand-written note\n\n${tagged.text}`)

    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toEqual({ body: 'hand-written note' })
  })

  it('ignores a truncated sentinel instead of inventing a block', () => {
    expect(parseCaptureBlocks(`${SENTINEL_PREFIX}ts=2026-08-24T10:00:00.000Z id=abc`)).toEqual([])
  })
})
