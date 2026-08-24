/**
 * Capture-block format for the local notes file.
 *
 * The editor appends immutable blocks to a plain file on disk. A local watcher
 * (the `notes-ingest` BMAD workflow) reads the file, splits on the sentinel and
 * pushes new blocks into a knowledge graph. Keeping the contract here — as pure
 * string functions — makes the format unit-testable without touching the File
 * System Access API.
 */

/** Exact opener the watcher splits on. Changing it is a breaking change. */
export const SENTINEL_PREFIX = '<!-- edit0r:snapshot '

export interface CaptureMeta {
  /** The user's save name. Becomes a tag hint on the ingest side. */
  name?: string
  /** Knowledge-graph project. Without it the watcher has to ask, or park the note. */
  project?: string
}

export interface CaptureBlock {
  id: string
  timestamp: string
  text: string
}

export interface ParsedCaptureBlock {
  id?: string
  timestamp?: string
  name?: string
  project?: string
  body: string
}

/**
 * FNV-1a-style hash over the timestamp and body, rendered as 16 hex chars.
 *
 * This is an idempotency key for the watcher's "already ingested" ledger, not a
 * security primitive — hence a plain hash rather than SubtleCrypto, which keeps
 * the function synchronous and deterministic in tests.
 */
export function captureBlockId(timestamp: string, content: string): string {
  const input = `${timestamp} ${content}`
  // Two 32-bit halves, because JS bitwise operators are 32-bit.
  let high = 0x811c9dc5
  let low = 0x01000193
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i)
    high = Math.imul(high ^ code, 0x01000193) >>> 0
    low = Math.imul(low ^ (code + i), 0x85ebca6b) >>> 0
  }
  return high.toString(16).padStart(8, '0') + low.toString(16).padStart(8, '0')
}

/** Keep a name on one line and out of the sentinel's syntax. */
function sanitizeName(name: string): string {
  return name
    .replace(/[\r\n]+/g, ' ')
    .replace(/"/g, "'")
    .replace(/>/g, '')
    .trim()
    .slice(0, 120)
}

/** Projects are unquoted in the sentinel, so restrict them to a safe alphabet. */
function sanitizeProject(project: string): string {
  return project
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

/**
 * A body that happens to contain the sentinel opener would split one block into
 * two on the watcher side. Break the match with a single visible character
 * rather than an invisible one — silently editing someone's notes is worse than
 * a documented one-character change to a string that is vanishingly rare.
 */
function escapeBody(content: string): string {
  return content.replace(/<!-- edit0r:snapshot/g, '<!-- edit0r_snapshot')
}

/**
 * Build the block to append.
 *
 * Pass `leadingNewline` when the block is not the first thing in the file. The
 * sentinel must start its own line, and callers cannot know whether the previous
 * byte was a newline without reading the file back — so append one
 * unconditionally. Block bodies already end in `\n`, which makes the result a
 * single blank line between blocks rather than a risk of a joined line.
 */
export function buildCaptureBlock(
  content: string,
  meta: CaptureMeta = {},
  timestamp: Date = new Date(),
  leadingNewline = false
): CaptureBlock {
  const ts = timestamp.toISOString()
  const body = escapeBody(content.replace(/\s+$/, ''))
  const id = captureBlockId(ts, body)

  const fields = [`ts=${ts}`, `id=${id}`]
  const name = meta.name ? sanitizeName(meta.name) : ''
  if (name) fields.push(`name="${name}"`)
  const project = meta.project ? sanitizeProject(meta.project) : ''
  if (project) fields.push(`project=${project}`)

  const lead = leadingNewline ? '\n' : ''
  const text = `${lead}${SENTINEL_PREFIX}${fields.join(' ')} -->\n${body}\n`

  return { id, timestamp: ts, text }
}

/** Parse a capture file back into blocks. Mirrors the watcher, so tests can assert round-trips. */
export function parseCaptureBlocks(fileContent: string): ParsedCaptureBlock[] {
  const parts = fileContent.split(SENTINEL_PREFIX)
  const blocks: ParsedCaptureBlock[] = []

  // Text before the first sentinel is an untagged block, not an error — notes
  // written into the file by hand still deserve to be ingested.
  const preamble = parts.shift()
  if (preamble?.trim()) blocks.push({ body: preamble.trim() })

  for (const part of parts) {
    const end = part.indexOf('-->')
    if (end === -1) continue
    const header = part.slice(0, end)
    blocks.push({
      id: /\bid=(\S+)/.exec(header)?.[1],
      timestamp: /\bts=(\S+)/.exec(header)?.[1],
      name: /\bname="([^"]*)"/.exec(header)?.[1],
      project: /\bproject=(\S+)/.exec(header)?.[1],
      body: part.slice(end + 3).trim(),
    })
  }

  return blocks
}
