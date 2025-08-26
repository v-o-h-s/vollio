'use client'

import React, { useState, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { MultiModeEditor, useEditorMode, EditorMode } from './MultiModeEditor'
import { AdaptiveFloatingToolbar } from './AdaptiveFloatingToolbar'

export interface MultiModeEditorDemoProps {
  initialContent?: string
  initialMode?: EditorMode
  onContentChange?: (content: string) => void
  className?: string
}

export function MultiModeEditorDemo({
  initialContent = '<p>Start typing to see the multi-mode editor in action...</p>',
  initialMode = 'normal',
  onContentChange,
  className = ''
}: MultiModeEditorDemoProps) {
  const [content, setContent] = useState(initialContent)
  const { mode, setMode } = useEditorMode(initialMode)

  // Initialize TipTap editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:text-primary/80',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)
      onContentChange?.(html)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none editor-${mode}`,
      },
    },
  })

  // Calculate word count and reading time
  const stats = useMemo(() => {
    if (!editor) return { wordCount: 0, readingTime: 0 }
    
    const text = editor.getText()
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)) // 200 words per minute
    
    return { wordCount, readingTime }
  }, [editor, content])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className={`multi-mode-editor-demo ${className}`}>
      <MultiModeEditor
        mode={mode}
        onModeChange={setMode}
        showModeToggle={true}
        showWordCount={true}
        showReadingTime={true}
        wordCount={stats.wordCount}
        readingTime={stats.readingTime}
      >
        <div 
          className="tiptap-editor-container"
          style={{ minHeight: mode === 'focus' ? '60vh' : '300px' }}
        >
          <EditorContent 
            editor={editor}
            className="ProseMirror-wrapper"
          />
        </div>
        
        <AdaptiveFloatingToolbar 
          editor={editor} 
          mode={mode}
        />
      </MultiModeEditor>
    </div>
  )
}

export default MultiModeEditorDemo