'use client'

import React, { useState, useEffect } from 'react'
import AceEditor from 'react-ace'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Copy, Clipboard, FileCode2, Moon, Sun, Minimize2, Maximize2, Save, FolderOpen, Check } from 'lucide-react'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/theme-github'

import Papa from 'papaparse'

export default function SimpleEditor() {
  const [content, setContent] = useState('')
  const [mode, setMode] = useState('text')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isFlattened, setIsFlattened] = useState(false)
  const [savedKeys, setSavedKeys] = useState<string[]>([])

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
    <div className={`container mx-auto p-4 space-y-4 ${isDarkMode ? 'dark' : ''}`}>

      <div className="flex justify-between items-center">
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
        <div className="space-x-2">
          <Button onClick={copyToClipboard} title="Copy to Clipboard">
            <Copy className="h-4 w-4" />
          </Button>
          <Button onClick={pasteFromClipboard} title="Paste from Clipboard">
            <Clipboard className="h-4 w-4" />
          </Button>
          <Button onClick={formatContent} title="Format Content">
            <FileCode2 className="h-4 w-4" />
          </Button>
          <Button onClick={validateContent} title="Validate Content">
            <Check className="h-4 w-4" />
          </Button>
          <Button onClick={isFlattened ? unflattenContent : flattenContent} title={isFlattened ? "Unflatten Content" : "Flatten Content"}>
            {isFlattened ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button onClick={saveContent} title="Save Content">
            <Save className="h-4 w-4" />
          </Button>
          <Select onValueChange={loadContent} onOpenChange={(open) => open && loadSavedKeys()}>
            <SelectTrigger className="w-9 px-0">
              <FolderOpen className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent>
              {savedKeys.length === 0 && (
                <SelectItem value="" disabled>No entries</SelectItem>
              )}
              {savedKeys.map((key) => (
                <SelectItem key={key} value={key}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={toggleDarkMode} title="Toggle Dark Mode">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
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
        style={{ width: '100%', height: '60vh' }}
      />
    </div>
  )

}