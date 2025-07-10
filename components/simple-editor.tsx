'use client'

import React, { useState, useEffect } from 'react'
import AceEditor from 'react-ace'
import { Button, buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { Copy, Clipboard, FileCode2, Moon, Sun, Minimize2, Maximize2, Save, FolderOpen, Check, MoreHorizontal, AlignLeft, Settings } from 'lucide-react'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/theme-github'

import Papa from 'papaparse'
import TextStats from './stats'
import { 
  smartRemoveLineBreaks, 
  flattenForAPI, 
  normalizeLineEndings, 
  removeEmptyLines, 
  normalizeLineBreaks,
  getLineBreakStats,
  type LineBreakOptions 
} from '@/lib/utils'

export default function SimpleEditor() {
  const [content, setContent] = useState('')
  const [mode, setMode] = useState('text')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isFlattened, setIsFlattened] = useState(false)
  const [savedKeys, setSavedKeys] = useState<string[]>([])
  const [showLineBreakOptions, setShowLineBreakOptions] = useState(false)
  const [lineBreakOptions, setLineBreakOptions] = useState<LineBreakOptions>({
    preserveParagraphs: true,
    preserveCodeBlocks: true,
    preserveLists: true,
    normalizeSpacing: true,
    removeEmptyLines: false,
    lineEndingType: 'LF'
  })

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

  const handleSmartLineBreakRemoval = () => {
    try {
      const processed = smartRemoveLineBreaks(content, lineBreakOptions);
      setContent(processed);
      toast({
        title: 'Smart line break removal applied',
        description: 'Line breaks removed while preserving content structure.',
      });
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  }

  const flattenForAPIUsage = () => {
    try {
      let flattened = flattenForAPI(content);
      // Escape special characters for URL encoding
      flattened = encodeURIComponent(flattened);
      setContent(flattened);
      setIsFlattened(true);
      toast({
        title: 'Content flattened for API',
        description: 'Content completely flattened and URL-encoded for API usage.',
      });
    } catch (error) {
      toast({
        title: 'Flattening failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  }

  const normalizeContent = () => {
    try {
      let normalized = content;
      if (lineBreakOptions.removeEmptyLines) {
        normalized = removeEmptyLines(normalized);
      }
      normalized = normalizeLineBreaks(normalized);
      normalized = normalizeLineEndings(normalized, lineBreakOptions.lineEndingType || 'LF');
      
      setContent(normalized);
      toast({
        title: 'Content normalized',
        description: 'Line endings and spacing have been normalized.',
      });
    } catch (error) {
      toast({
        title: 'Normalization failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  }

  const showLineBreakStats = () => {
    try {
      const stats = getLineBreakStats(content);
      toast({
        title: 'Line Break Analysis',
        description: `Lines: ${stats.totalLines}, Empty: ${stats.emptyLines}, Has code: ${stats.hasCodeBlocks ? 'Yes' : 'No'}, Has lists: ${stats.hasLists ? 'Yes' : 'No'}`,
      });
    } catch (error) {
      toast({
        title: 'Analysis failed',
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
          <Button size="icon" onClick={handleSmartLineBreakRemoval} title="Smart Line Break Removal">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={flattenForAPIUsage} title="Flatten for API Usage">
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={normalizeContent} title="Normalize Line Endings">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={showLineBreakStats} title="Line Break Analysis">
            <Settings className="h-4 w-4" />
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

      {/* Line Break Processing Options Panel */}
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowLineBreakOptions(!showLineBreakOptions)}
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Line Break Options</span>
          <span className={`transform transition-transform ${showLineBreakOptions ? 'rotate-180' : ''}`}>▼</span>
        </Button>
        
        {showLineBreakOptions && (
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Preserve Structure</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={lineBreakOptions.preserveParagraphs}
                    onChange={(e) => setLineBreakOptions(prev => ({ ...prev, preserveParagraphs: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Paragraphs</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={lineBreakOptions.preserveCodeBlocks}
                    onChange={(e) => setLineBreakOptions(prev => ({ ...prev, preserveCodeBlocks: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Code Blocks</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={lineBreakOptions.preserveLists}
                    onChange={(e) => setLineBreakOptions(prev => ({ ...prev, preserveLists: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Lists</span>
                </label>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Processing Options</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={lineBreakOptions.normalizeSpacing}
                    onChange={(e) => setLineBreakOptions(prev => ({ ...prev, normalizeSpacing: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Normalize Spacing</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={lineBreakOptions.removeEmptyLines}
                    onChange={(e) => setLineBreakOptions(prev => ({ ...prev, removeEmptyLines: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Remove Empty Lines</span>
                </label>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Line Ending Type</label>
                  <Select 
                    value={lineBreakOptions.lineEndingType} 
                    onValueChange={(value: 'LF' | 'CRLF' | 'CR') => 
                      setLineBreakOptions(prev => ({ ...prev, lineEndingType: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LF">LF (Unix/Mac)</SelectItem>
                      <SelectItem value="CRLF">CRLF (Windows)</SelectItem>
                      <SelectItem value="CR">CR (Classic Mac)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}
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