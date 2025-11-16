'use client'

import React, { useState, useEffect, useRef } from 'react'
import AceEditor from 'react-ace'
import type { Ace } from 'ace-builds'
import { Button, buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { Copy, Clipboard, FileCode2, Moon, Sun, Minimize2, Maximize2, Save, FolderOpen, Check } from 'lucide-react'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/theme-github'

import Papa from 'papaparse'
import TextStats from './stats'
import { providerDetector, providerValidator, getProviderConfig, getSupportedProviders } from '@/lib/ai-providers'
import type { ProviderDetectionResult, ValidationResult, AIProvider } from '@/lib/ai-providers'

export default function SimpleEditor() {
  const [content, setContent] = useState('')
  const [mode, setMode] = useState('text')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isFlattened, setIsFlattened] = useState(false)
  const [savedKeys, setSavedKeys] = useState<string[]>([])
  const [detectionResult, setDetectionResult] = useState<ProviderDetectionResult | null>(null)
  const [manualProvider, setManualProvider] = useState<AIProvider | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const editorRef = useRef<Ace.Editor | null>(null)

  useEffect(() => {
    // Apply custom styles to AceEditor and global scrollbars
    const style = document.createElement('style')
    style.textContent = `
      /* Global scrollbar styles */
      ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      
      ::-webkit-scrollbar-track {
        background: ${isDarkMode ? '#1a1a1a' : '#f1f1f1'};
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: ${isDarkMode ? '#333' : '#888'};
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: ${isDarkMode ? '#444' : '#555'};
      }
      
      /* Styles for Firefox */
      * {
        scrollbar-width: thin;
        scrollbar-color: ${isDarkMode ? '#333 #1a1a1a' : '#888 #f1f1f1'};
      }

      /* AceEditor specific styles */
      .ace_scrollbar::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      .ace_scrollbar::-webkit-scrollbar-track {
        background: ${isDarkMode ? '#1a1a1a' : '#f1f1f1'};
        border-radius: 10px;
      }
      .ace_scrollbar::-webkit-scrollbar-thumb {
        background: ${isDarkMode ? '#333' : '#888'};
        border-radius: 10px;
      }
      .ace_scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${isDarkMode ? '#444' : '#555'};
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [isDarkMode])

  useEffect(() => {
    loadSavedKeys()
  }, [])

  // Detect AI provider when content changes (debounced)
  useEffect(() => {
    if (mode !== 'json' || !content.trim()) {
      setDetectionResult(null)
      setValidationResult(null)
      return
    }

    const timeoutId = setTimeout(() => {
      try {
        const result = providerDetector.detect(content)
        // Only show detection if confidence is above threshold
        if (result.confidence >= 0.3) {
          setDetectionResult(result)
        } else {
          setDetectionResult(null)
        }
      } catch {
        setDetectionResult(null)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [content, mode])

  // Validate content when provider or content changes
  useEffect(() => {
    if (mode !== 'json' || !content.trim()) {
      setValidationResult(null)
      return
    }

    const timeoutId = setTimeout(() => {
      try {
        const config = JSON.parse(content)
        const provider = manualProvider || detectionResult?.provider

        if (provider && provider !== 'generic') {
          const result = providerValidator.validate(config, provider)
          setValidationResult(result)
        } else {
          setValidationResult(null)
        }
      } catch {
        // Invalid JSON - will be caught by validation
        setValidationResult(null)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [content, mode, manualProvider, detectionResult])

  // Update editor annotations when validation changes
  useEffect(() => {
    if (!editorRef.current) return

    // Helper to find line number for a field in JSON content
    const findLineForField = (fieldPath: string): number => {
      const lines = content.split('\n')
      const fieldName = fieldPath.split('.').pop()?.replace(/\[.*\]/, '') || fieldPath

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`"${fieldName}"`)) {
          return i
        }
      }

      const parentField = fieldPath.split('[')[0]
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`"${parentField}"`)) {
          return i
        }
      }

      return 0
    }

    const annotations: Ace.Annotation[] = []

    if (validationResult) {
      // Add error annotations
      validationResult.errors.forEach((error) => {
        annotations.push({
          row: findLineForField(error.field),
          column: 0,
          text: `${error.field}: ${error.message}`,
          type: 'error',
        })
      })

      // Add warning annotations
      validationResult.warnings.forEach((warning) => {
        annotations.push({
          row: findLineForField(warning.field),
          column: 0,
          text: `${warning.field}: ${warning.message}`,
          type: 'warning',
        })
      })
    }

    editorRef.current.getSession().setAnnotations(annotations)
  }, [validationResult, content])

  const formatContent = () => {
    try {
      let formatted = content;
      if (mode === 'json') {
        formatted = JSON.stringify(JSON.parse(content), null, 2);
      } else if (mode === 'html') {
        formatted = formatHTML(content);
      } else if (mode === 'csv') {
        const parsed = Papa.parse(content, { header: true });
        formatted = Papa.unparse(parsed.data, { quotes: true });
      }
      setContent(formatted);
      toast({
        title: 'Formatted successfully',
        description: `Your ${mode.toUpperCase()} content has been formatted.`,
      });
    } catch (error: unknown) {
      toast({
        title: 'Formatting failed',
        description: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
        variant: 'destructive',
      });
    }
  };
  const formatHTML = (html: string) => {
    const tab = '  ';
    let result = '';
    let indent = '';

    html.split(/>\s*</).forEach(element => {
      if (element.match(/^\/\w/)) {
        indent = indent.substring(tab.length);
      }

      result += indent + '<' + element + '>\r\n';

      if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith("input")) {
        indent += tab;
      }
    });

    return result.substring(1, result.length - 3);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: 'The editor content has been copied to your clipboard.',
      })
    })
  }

  const pasteFromClipboard = () => {
    navigator.clipboard.readText().then((text) => {
      setContent(text)
      toast({
        title: 'Pasted from clipboard',
        description: 'Content has been pasted from your clipboard.',
      })
    })
  }

  const validateContent = () => {
    try {
      if (mode === 'json') {
        JSON.parse(content)
      } else if (mode === 'html') {
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'text/html')
        if (doc.querySelector('parsererror')) {
          throw new Error(doc.querySelector('parsererror')?.textContent || 'Invalid HTML')
        }
      } else if (mode === 'csv') {
        const result = Papa.parse(content, { header: true })
        if (result.errors.length) {
          throw new Error(result.errors.map(e => e.message).join(', '))
        }
      }
      toast({
        title: 'Validation successful',
        description: `The ${mode.toUpperCase()} content is valid.`,
      })
    } catch (error: unknown) {
      toast({
        title: 'Validation failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      })
    }
  }

  const saveContent = () => {
    const name = prompt('Enter a name for this content:')
    if (!name) {
      return
    }
    try {
      localStorage.setItem(name, content)
      loadSavedKeys()
      toast({
        title: 'Content saved',
        description: `Saved as "${name}"`,
      })
    } catch (error: unknown) {
      toast({
        title: 'Save failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      })
    }
  }

  const loadSavedKeys = () => {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.push(key)
    }
    setSavedKeys(keys)
  }

  const loadContent = (key: string) => {
    const value = localStorage.getItem(key)
    if (value !== null) {
      setContent(value)
      toast({
        title: 'Content loaded',
        description: `Loaded "${key}"`,
      })
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  }

  const flattenContent = () => {
    try {
      let flattened = content
        .replace(/\s+/g, ' ')  // Replace all whitespace (including newlines) with a single space
        .trim();  // Remove leading and trailing whitespace

      // Escape special characters
      flattened = encodeURIComponent(flattened);

      setContent(flattened);
      setIsFlattened(true);
      toast({
        title: 'Content flattened',
        description: 'The content has been flattened and escaped for use in URLs or API calls.',
      });
    } catch (error) {
      toast({
        title: 'Flattening failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  }

  const unflattenContent = () => {
    try {
      // Decode the URL-encoded content
      let unflattened = decodeURIComponent(content);

      // Format the content based on the current mode
      if (mode === 'json') {
        unflattened = JSON.stringify(JSON.parse(unflattened), null, 2);
      } else if (mode === 'html') {
        unflattened = formatHTML(unflattened);
      } else if (mode === 'csv') {
        const parsed = Papa.parse(unflattened, { header: true });
        unflattened = Papa.unparse(parsed.data, { quotes: true });
      }

      setContent(unflattened);
      setIsFlattened(false);
      toast({
        title: 'Content unflattened',
        description: 'The content has been unflattened and formatted.',
      });
    } catch (error) {
      toast({
        title: 'Unflattening failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className={`flex flex-col h-full w-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className='flex align-middle'>
          <Select onValueChange={(value) => setMode(value)}>
            <SelectTrigger className="w-[180px] px-4 py-2">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Plain Text</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setManualProvider(value === 'auto' ? null : (value as AIProvider))}
            value={manualProvider || 'auto'}
          >
            <SelectTrigger className="w-[200px] px-4 py-2 ml-4">
              <SelectValue placeholder="Provider (auto)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              {getSupportedProviders().filter(p => p !== 'generic').map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {getProviderConfig(provider).displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(manualProvider || detectionResult) && (
            <div
              className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                getProviderConfig(manualProvider || detectionResult!.provider).badgeStyles
              }`}
              title={
                detectionResult
                  ? `Confidence: ${(detectionResult.confidence * 100).toFixed(0)}% - ${detectionResult.indicators.join(', ')}`
                  : 'Manually selected'
              }
            >
              {getProviderConfig(manualProvider || detectionResult!.provider).displayName}
              {!manualProvider && detectionResult && ` (${(detectionResult.confidence * 100).toFixed(0)}%)`}
            </div>
          )}
          <div className='flex ml-4 items-center text-md text-gray-600'>
            Cookie-free editor, no tracking, no ads, no bullshit.
          </div>
        </div>
        <div className="flex flex-wrap items-center space-x-2">
          <Button size="icon" onClick={copyToClipboard} title="Copy to Clipboard">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={pasteFromClipboard} title="Paste from Clipboard">
            <Clipboard className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={formatContent} title="Format Content">
            <FileCode2 className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={validateContent} title="Validate Content">
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={isFlattened ? unflattenContent : flattenContent} title={isFlattened ? "Unflatten Content" : "Flatten Content"}>
            {isFlattened ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button size="icon" onClick={saveContent} title="Save Content">
            <Save className="h-4 w-4" />
          </Button>
          <Select onValueChange={loadContent} onOpenChange={(open) => open && loadSavedKeys()}>
            <SelectTrigger className={cn(buttonVariants({ size: 'icon' }))}>
              <FolderOpen className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent>
              {savedKeys.length === 0 && (
                <SelectItem value="no-entries" disabled>No entries</SelectItem>
              )}
              {savedKeys.map((key) => (
                <SelectItem key={key} value={key}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" onClick={toggleDarkMode} title="Toggle Dark Mode">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div
        className="flex-1 overflow-hidden transition-all duration-300"
        style={
          detectionResult
            ? {
                border: '2px solid transparent',
                borderColor: getProviderConfig(detectionResult.provider).editorBorderColor,
                boxShadow: getProviderConfig(detectionResult.provider).editorShadow,
              }
            : { border: '2px solid transparent' }
        }
      >
        <AceEditor
          mode={mode}
          theme={isDarkMode ? "monokai" : "github"}
          onChange={setContent}
          value={content}
          name="editor"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            useWorker: false,
            showPrintMargin: false,
          }}
          onLoad={(editor) => {
            editorRef.current = editor
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <TextStats content={content} />
        {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
          <div className="mt-2 space-y-1">
            {validationResult.errors.map((error, index) => (
              <div
                key={`error-${index}`}
                className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950 border-l-4 border-red-500 px-3 py-2 rounded"
              >
                <span className="text-red-600 dark:text-red-400 font-semibold">Error:</span>
                <div className="flex-1">
                  <span className="font-mono text-xs text-red-700 dark:text-red-300">{error.field}</span>
                  <span className="text-red-800 dark:text-red-200 ml-2">{error.message}</span>
                </div>
              </div>
            ))}
            {validationResult.warnings.map((warning, index) => (
              <div
                key={`warning-${index}`}
                className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-500 px-3 py-2 rounded"
              >
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Warning:</span>
                <div className="flex-1">
                  <span className="font-mono text-xs text-amber-700 dark:text-amber-300">{warning.field}</span>
                  <span className="text-amber-800 dark:text-amber-200 ml-2">{warning.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}