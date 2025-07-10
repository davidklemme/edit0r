'use client'

import React, { useState, useEffect } from 'react'
import AceEditor from 'react-ace'
import { Button, buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { Copy, Clipboard, FileCode2, Moon, Sun, Minimize2, Maximize2, Save, FolderOpen, Check, Settings, Undo, Redo } from 'lucide-react'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/theme-github'

import Papa from 'papaparse'
import TextStats from './stats'
import { 
  LineBreakOptions, 
  LineEndingType, 
  defaultLineBreakOptions, 
  smartRemoveLineBreaks, 
  enhancedFlattenContent,
  ProcessingHistoryManager,
  detectLineEndings 
} from '@/lib/utils'

export default function SimpleEditor() {
  const [content, setContent] = useState('')
  const [mode, setMode] = useState('text')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isFlattened, setIsFlattened] = useState(false)
  const [savedKeys, setSavedKeys] = useState<string[]>([])
  const [lineBreakOptions, setLineBreakOptions] = useState<LineBreakOptions>(defaultLineBreakOptions)
  const [showLineBreakOptions, setShowLineBreakOptions] = useState(false)
  const [historyManager] = useState(() => new ProcessingHistoryManager())

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

  const addToHistory = (newContent: string, operation: string) => {
    historyManager.addToHistory(content, operation)
    setContent(newContent)
  }

  const handleUndo = () => {
    const historyEntry = historyManager.undo()
    if (historyEntry) {
      setContent(historyEntry.content)
      toast({
        title: 'Undone',
        description: `Reverted: ${historyEntry.operation}`,
      })
    }
  }

  const handleRedo = () => {
    const historyEntry = historyManager.redo()
    if (historyEntry) {
      setContent(historyEntry.content)
      toast({
        title: 'Redone',
        description: `Reapplied: ${historyEntry.operation}`,
      })
    }
  }

  const smartLineBreakProcess = () => {
    try {
      const processed = smartRemoveLineBreaks(content, lineBreakOptions)
      addToHistory(processed, 'Smart Line Break Processing')
      setIsFlattened(false)
      toast({
        title: 'Line breaks processed',
        description: 'Content has been processed with smart line break management.',
      })
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      })
    }
  }

  const flattenContent = () => {
    try {
      const flattened = enhancedFlattenContent(content, lineBreakOptions)
      addToHistory(flattened, 'Enhanced Content Flattening')
      setIsFlattened(true)
      toast({
        title: 'Content flattened',
        description: 'The content has been intelligently flattened and escaped for use in URLs or API calls.',
      })
    } catch (error) {
      toast({
        title: 'Flattening failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      })
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
    <div className={`container mx-auto p-4 space-y-4 ${isDarkMode ? 'dark' : ''}`}>

      <div className="flex justify-between items-center">
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
          <Button size="icon" onClick={smartLineBreakProcess} title="Smart Line Break Processing">
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={isFlattened ? unflattenContent : flattenContent} title={isFlattened ? "Unflatten Content" : "Enhanced Flatten Content"}>
            {isFlattened ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button 
            size="icon" 
            onClick={handleUndo} 
            disabled={!historyManager.canUndo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            onClick={handleRedo} 
            disabled={!historyManager.canRedo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
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

      {/* Line Break Configuration Panel */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Smart Line Break Options</h3>
          <div className="text-xs text-gray-500">
            Detected: {detectLineEndings(content)} | Lines: {content.split('\n').length}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={lineBreakOptions.preserveParagraphs}
                onChange={(e) => setLineBreakOptions(prev => ({ ...prev, preserveParagraphs: e.target.checked }))}
                className="rounded"
              />
              <span>Preserve paragraphs</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={lineBreakOptions.preserveCodeBlocks}
                onChange={(e) => setLineBreakOptions(prev => ({ ...prev, preserveCodeBlocks: e.target.checked }))}
                className="rounded"
              />
              <span>Preserve code blocks</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={lineBreakOptions.preserveLists}
                onChange={(e) => setLineBreakOptions(prev => ({ ...prev, preserveLists: e.target.checked }))}
                className="rounded"
              />
              <span>Preserve lists</span>
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={lineBreakOptions.removeEmptyLines}
                onChange={(e) => setLineBreakOptions(prev => ({ ...prev, removeEmptyLines: e.target.checked }))}
                className="rounded"
              />
              <span>Remove empty lines</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={lineBreakOptions.intelligentSpacing}
                onChange={(e) => setLineBreakOptions(prev => ({ ...prev, intelligentSpacing: e.target.checked }))}
                className="rounded"
              />
              <span>Intelligent spacing</span>
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Line endings:</label>
            <Select 
              value={lineBreakOptions.normalizeLineEndings} 
              onValueChange={(value: LineEndingType) => setLineBreakOptions(prev => ({ ...prev, normalizeLineEndings: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LF">LF (Unix)</SelectItem>
                <SelectItem value="CRLF">CRLF (Windows)</SelectItem>
                <SelectItem value="CR">CR (Mac)</SelectItem>
                <SelectItem value="MIXED">Keep as is</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <Button size="sm" onClick={smartLineBreakProcess}>
              Process Line Breaks
            </Button>
            <Button size="sm" variant="outline" onClick={() => setLineBreakOptions(defaultLineBreakOptions)}>
              Reset Options
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            {historyManager.canUndo() && `Last: ${historyManager.getCurrentEntry()?.operation || 'None'}`}
          </div>
        </div>
      </div>

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
        style={{ width: '100%', height: '60vh', borderRadius: '0.5rem' }}
      />
      <TextStats content={content} />
    </div>
  )
}