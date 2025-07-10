import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Types for line break management
export type LineEndingType = 'LF' | 'CRLF' | 'CR' | 'MIXED'
export type LineBreakOptions = {
  preserveParagraphs: boolean
  preserveCodeBlocks: boolean
  preserveLists: boolean
  removeEmptyLines: boolean
  normalizeLineEndings: LineEndingType
  intelligentSpacing: boolean
}

export type ProcessingHistory = {
  content: string
  timestamp: number
  operation: string
}

// Default options for line break processing
export const defaultLineBreakOptions: LineBreakOptions = {
  preserveParagraphs: true,
  preserveCodeBlocks: true,
  preserveLists: true,
  removeEmptyLines: false,
  normalizeLineEndings: 'LF',
  intelligentSpacing: true
}

// Detect line ending type
export function detectLineEndings(content: string): LineEndingType {
  const crlfCount = (content.match(/\r\n/g) || []).length
  const lfCount = (content.match(/(?<!\r)\n/g) || []).length
  const crCount = (content.match(/\r(?!\n)/g) || []).length
  
  const total = crlfCount + lfCount + crCount
  if (total === 0) return 'LF'
  
  if (crlfCount > 0 && lfCount === 0 && crCount === 0) return 'CRLF'
  if (lfCount > 0 && crlfCount === 0 && crCount === 0) return 'LF'
  if (crCount > 0 && crlfCount === 0 && lfCount === 0) return 'CR'
  
  return 'MIXED'
}

// Normalize line endings
export function normalizeLineEndings(content: string, targetType: LineEndingType): string {
  if (targetType === 'MIXED') return content
  
  // First normalize all to LF
  let normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  // Then convert to target type
  switch (targetType) {
    case 'CRLF':
      return normalized.replace(/\n/g, '\r\n')
    case 'CR':
      return normalized.replace(/\n/g, '\r')
    case 'LF':
    default:
      return normalized
  }
}

// Check if a line is part of a code block
function isInCodeBlock(lines: string[], index: number): boolean {
  let inCodeBlock = false
  for (let i = 0; i <= index; i++) {
    const line = lines[i].trim()
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock
    }
  }
  return inCodeBlock
}

// Check if a line is a list item
function isListItem(line: string): boolean {
  const trimmed = line.trim()
  return /^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)
}

// Check if a line looks like a paragraph separator
function isParagraphSeparator(line: string): boolean {
  return line.trim() === ''
}

// Smart line break removal with preservation options
export function smartRemoveLineBreaks(content: string, options: LineBreakOptions): string {
  // First normalize line endings
  const normalized = normalizeLineEndings(content, options.normalizeLineEndings)
  const lines = normalized.split(/\r?\n/)
  
  const result: string[] = []
  let i = 0
  
  while (i < lines.length) {
    const currentLine = lines[i]
    
    // Handle empty lines
    if (isParagraphSeparator(currentLine)) {
      if (options.preserveParagraphs) {
        // Add paragraph break
        if (result.length > 0 && result[result.length - 1] !== '') {
          result.push('')
        }
      } else if (!options.removeEmptyLines) {
        result.push('')
      }
      i++
      continue
    }
    
    // Handle code blocks
    if (options.preserveCodeBlocks && isInCodeBlock(lines, i)) {
      result.push(currentLine)
      i++
      continue
    }
    
    // Handle list items
    if (options.preserveLists && isListItem(currentLine)) {
      result.push(currentLine)
      i++
      continue
    }
    
    // Regular line processing with intelligent spacing
    if (options.intelligentSpacing && i > 0 && result.length > 0) {
      const lastLine = result[result.length - 1]
      const needsSpace = lastLine !== '' && 
                        !lastLine.endsWith(' ') && 
                        !currentLine.startsWith(' ') &&
                        !lastLine.match(/[.!?:]$/) // Don't add space after sentence endings
      
      if (needsSpace) {
        result[result.length - 1] = lastLine + ' ' + currentLine.trim()
      } else {
        result[result.length - 1] = lastLine + currentLine.trim()
      }
    } else {
      result.push(currentLine)
    }
    
    i++
  }
  
  // Clean up final result
  return result.join(options.normalizeLineEndings === 'CRLF' ? '\r\n' : 
                    options.normalizeLineEndings === 'CR' ? '\r' : '\n')
}

// Enhanced flatten function that builds on the smart line break removal
export function enhancedFlattenContent(content: string, options: Partial<LineBreakOptions> = {}): string {
  const finalOptions = { ...defaultLineBreakOptions, ...options }
  
  // Use smart line break removal
  let processed = smartRemoveLineBreaks(content, {
    ...finalOptions,
    preserveParagraphs: false, // For flattening, we don't preserve paragraphs
    preserveCodeBlocks: false, // For flattening, we don't preserve code blocks
    preserveLists: false, // For flattening, we don't preserve lists
  })
  
  // Additional flattening: normalize all whitespace to single spaces
  processed = processed.replace(/\s+/g, ' ').trim()
  
  // URL encode for API usage
  return encodeURIComponent(processed)
}

// History management for undo/redo
export class ProcessingHistoryManager {
  private history: ProcessingHistory[] = []
  private currentIndex = -1
  private maxHistorySize = 50
  
  addToHistory(content: string, operation: string): void {
    // Remove any history after current index (when we're not at the end)
    this.history = this.history.slice(0, this.currentIndex + 1)
    
    // Add new entry
    this.history.push({
      content,
      timestamp: Date.now(),
      operation
    })
    
    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize)
    }
    
    this.currentIndex = this.history.length - 1
  }
  
  canUndo(): boolean {
    return this.currentIndex > 0
  }
  
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }
  
  undo(): ProcessingHistory | null {
    if (!this.canUndo()) return null
    
    this.currentIndex--
    return this.history[this.currentIndex]
  }
  
  redo(): ProcessingHistory | null {
    if (!this.canRedo()) return null
    
    this.currentIndex++
    return this.history[this.currentIndex]
  }
  
  getCurrentEntry(): ProcessingHistory | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null
    }
    return this.history[this.currentIndex]
  }
  
  clear(): void {
    this.history = []
    this.currentIndex = -1
  }
}
