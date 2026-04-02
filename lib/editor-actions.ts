import Papa from 'papaparse'
import { smartRemoveLineBreaks, enhancedFlattenContent } from '@/lib/utils'
import type { LineBreakOptions } from '@/lib/utils'

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
])

const PRESERVE_ELEMENTS = new Set(['pre', 'code', 'script', 'style', 'textarea'])

export function formatHTML(html: string): string {
  const tab = '  '
  // Tokenize into tags and text, preserving content inside tags
  const tokens = html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g)
  if (!tokens) return html

  const result: string[] = []
  let indent = ''
  let preserveDepth = 0

  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue

    // HTML comments — pass through at current indent
    if (trimmed.startsWith('<!--')) {
      result.push(indent + trimmed)
      continue
    }

    // Not a tag — it's text content
    if (!trimmed.startsWith('<')) {
      if (preserveDepth > 0) {
        result.push(token) // preserve whitespace inside pre/code/script
      } else if (trimmed) {
        result.push(indent + trimmed)
      }
      continue
    }

    // Extract tag name
    const tagMatch = trimmed.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/)
    const tagName = tagMatch ? tagMatch[1].toLowerCase() : ''

    // Closing tag
    if (trimmed.startsWith('</')) {
      if (PRESERVE_ELEMENTS.has(tagName) && preserveDepth > 0) {
        preserveDepth--
      }
      if (preserveDepth === 0) {
        indent = indent.substring(tab.length)
        result.push(indent + trimmed)
      } else {
        result.push(token)
      }
      continue
    }

    // Opening tag (or self-closing)
    const isSelfClosing = trimmed.endsWith('/>') || VOID_ELEMENTS.has(tagName)

    if (preserveDepth > 0) {
      result.push(token)
      if (PRESERVE_ELEMENTS.has(tagName) && !isSelfClosing) {
        preserveDepth++
      }
      continue
    }

    result.push(indent + trimmed)

    if (!isSelfClosing) {
      if (PRESERVE_ELEMENTS.has(tagName)) {
        preserveDepth++
      } else {
        indent += tab
      }
    }
  }

  return result.join('\n')
}

export function formatContent(content: string, mode: string): string {
  if (mode === 'json') {
    return JSON.stringify(JSON.parse(content), null, 2)
  } else if (mode === 'html') {
    return formatHTML(content)
  } else if (mode === 'csv') {
    const parsed = Papa.parse(content, { header: true })
    return Papa.unparse(parsed.data, { quotes: true })
  }
  return content
}

export async function copyToClipboard(content: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await navigator.clipboard.writeText(content)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Clipboard write failed' }
  }
}

export async function pasteFromClipboard(): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    const text = await navigator.clipboard.readText()
    return { ok: true, text }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Clipboard read failed' }
  }
}

export function validateContent(content: string, mode: string): { valid: boolean; error?: string } {
  try {
    if (mode === 'json') {
      JSON.parse(content)
    } else if (mode === 'html') {
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/html')
      const parseError = doc.querySelector('parsererror')
      if (parseError) {
        throw new Error(parseError.textContent || 'Invalid HTML')
      }
    } else if (mode === 'csv') {
      const result = Papa.parse(content, { header: true })
      if (result.errors.length) {
        throw new Error(result.errors.map((e) => e.message).join(', '))
      }
    }
    return { valid: true }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function processLineBreaks(content: string, options: LineBreakOptions): string {
  return smartRemoveLineBreaks(content, options)
}

export function flattenContent(content: string, options: LineBreakOptions): string {
  return enhancedFlattenContent(content, options)
}

export function unflattenContent(content: string, mode: string): string {
  let unflattened = decodeURIComponent(content)

  if (mode === 'json') {
    unflattened = JSON.stringify(JSON.parse(unflattened), null, 2)
  } else if (mode === 'html') {
    unflattened = formatHTML(unflattened)
  } else if (mode === 'csv') {
    const parsed = Papa.parse(unflattened, { header: true })
    unflattened = Papa.unparse(parsed.data, { quotes: true })
  }

  return unflattened
}
