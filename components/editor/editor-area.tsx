'use client'

import AceEditor from 'react-ace'
import type { Ace } from 'ace-builds'

import ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/worker-json'

// Configure worker path so Ace can load syntax validators
ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.37.4/src-noconflict/')

import { getProviderConfig } from '@/lib/ai-providers'
import type { ProviderDetectionResult } from '@/lib/ai-providers'

interface EditorAreaProps {
  content: string
  onContentChange: (content: string) => void
  mode: string
  isDarkMode: boolean
  editorRef: React.MutableRefObject<Ace.Editor | null>
  detectionResult: ProviderDetectionResult | null
  children?: React.ReactNode
}

export function EditorArea({
  content,
  onContentChange,
  mode,
  isDarkMode,
  editorRef,
  detectionResult,
  children,
}: EditorAreaProps) {
  const borderStyle = detectionResult
    ? {
        border: '2px solid transparent',
        borderColor: getProviderConfig(detectionResult.provider).editorBorderColor,
        boxShadow: getProviderConfig(detectionResult.provider).editorShadow,
      }
    : { border: '2px solid transparent' }

  return (
    <div className="flex-1 overflow-hidden relative transition-all duration-300" style={borderStyle}>
      <AceEditor
        mode={mode}
        theme={isDarkMode ? 'monokai' : 'github'}
        onChange={onContentChange}
        value={content}
        name="editor"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          useWorker: true,
          showPrintMargin: false,
        }}
        onLoad={(editor) => {
          editorRef.current = editor
        }}
        style={{ width: '100%', height: '100%' }}
      />
      {children}
    </div>
  )
}
