import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Line Break Management Utilities

export interface LineBreakOptions {
  preserveParagraphs?: boolean
  preserveCodeBlocks?: boolean
  preserveLists?: boolean
  normalizeSpacing?: boolean
  removeEmptyLines?: boolean
  lineEndingType?: 'LF' | 'CRLF' | 'CR'
}

/**
 * Smart line break removal that preserves content structure
 */
export function smartRemoveLineBreaks(text: string, options: LineBreakOptions = {}): string {
  const {
    preserveParagraphs = true,
    preserveCodeBlocks = true,
    preserveLists = true,
    normalizeSpacing = true
  } = options

  let result = text

  // Preserve code blocks (```...``` or indented blocks)
  const codeBlocks: string[] = []
  if (preserveCodeBlocks) {
    result = result.replace(/```[\s\S]*?```/g, (match, index) => {
      codeBlocks.push(match)
      return `__CODEBLOCK_${codeBlocks.length - 1}__`
    })
    
    // Handle indented code blocks (4+ spaces)
    result = result.replace(/^(    |\t).*$/gm, (match, index) => {
      codeBlocks.push(match)
      return `__CODEBLOCK_${codeBlocks.length - 1}__`
    })
  }

  // Preserve list structures
  const listItems: string[] = []
  if (preserveLists) {
    result = result.replace(/^[\s]*[-*+]\s+.*$/gm, (match) => {
      listItems.push(match)
      return `__LISTITEM_${listItems.length - 1}__`
    })
    
    result = result.replace(/^[\s]*\d+\.\s+.*$/gm, (match) => {
      listItems.push(match)
      return `__LISTITEM_${listItems.length - 1}__`
    })
  }

  // Handle paragraph preservation
  if (preserveParagraphs) {
    // Replace double+ line breaks with paragraph markers
    result = result.replace(/\n\s*\n+/g, '__PARAGRAPH_BREAK__')
    // Remove single line breaks
    result = result.replace(/\n/g, ' ')
    // Restore paragraph breaks
    result = result.replace(/__PARAGRAPH_BREAK__/g, '\n\n')
  } else {
    // Simple line break removal
    result = result.replace(/\n/g, ' ')
  }

  // Normalize spacing
  if (normalizeSpacing) {
    result = result.replace(/\s+/g, ' ')
  }

  // Restore preserved content
  if (preserveCodeBlocks) {
    codeBlocks.forEach((block, index) => {
      result = result.replace(`__CODEBLOCK_${index}__`, block)
    })
  }

  if (preserveLists) {
    listItems.forEach((item, index) => {
      result = result.replace(`__LISTITEM_${index}__`, item)
    })
  }

  return result.trim()
}

/**
 * Complete line break removal for API/URL usage
 */
export function flattenForAPI(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalize line endings
 */
export function normalizeLineEndings(text: string, type: 'LF' | 'CRLF' | 'CR' = 'LF'): string {
  // First normalize all to LF
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  // Then convert to desired format
  switch (type) {
    case 'CRLF':
      return normalized.replace(/\n/g, '\r\n')
    case 'CR':
      return normalized.replace(/\n/g, '\r')
    case 'LF':
    default:
      return normalized
  }
}

/**
 * Remove empty lines
 */
export function removeEmptyLines(text: string): string {
  return text.replace(/^\s*\n/gm, '')
}

/**
 * Convert multiple consecutive line breaks to single breaks
 */
export function normalizeLineBreaks(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n')
}

/**
 * Get line break statistics
 */
export function getLineBreakStats(text: string) {
  const totalLines = text.split('\n').length
  const emptyLines = (text.match(/^\s*$/gm) || []).length
  const hasCodeBlocks = /```[\s\S]*?```/.test(text) || /^(    |\t)/m.test(text)
  const hasLists = /^[\s]*[-*+]\s+/m.test(text) || /^[\s]*\d+\.\s+/m.test(text)
  const consecutiveBreaks = (text.match(/\n{2,}/g) || []).length
  
  return {
    totalLines,
    emptyLines,
    contentLines: totalLines - emptyLines,
    hasCodeBlocks,
    hasLists,
    consecutiveBreaks,
    averageLineLength: text.length / totalLines
  }
}
