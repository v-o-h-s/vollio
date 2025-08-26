'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal
} from 'lucide-react'
import { EditorMode } from './MultiModeEditor'

export interface AdaptiveFloatingToolbarProps {
  editor: Editor | null
  mode: EditorMode
  className?: string
}

export function AdaptiveFloatingToolbar({ 
  editor, 
  mode, 
  className = '' 
}: AdaptiveFloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [showExtended, setShowExtended] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Update toolbar visibility and position based on text selection
  useEffect(() => {
    if (!editor) return

    const updateToolbar = () => {
      const { selection } = editor.state
      const { from, to } = selection
      
      // Show toolbar only when there's a text selection
      if (from === to) {
        setIsVisible(false)
        return
      }

      // Get selection coordinates
      const { view } = editor
      const start = view.coordsAtPos(from)
      const end = view.coordsAtPos(to)
      
      // Calculate toolbar position
      const rect = view.dom.getBoundingClientRect()
      const toolbarWidth = toolbarRef.current?.offsetWidth || 300
      const toolbarHeight = toolbarRef.current?.offsetHeight || 40
      
      let left = (start.left + end.left) / 2 - toolbarWidth / 2
      let top = start.top - toolbarHeight - 10
      
      // Adjust for viewport boundaries
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      if (left < 10) left = 10
      if (left + toolbarWidth > viewportWidth - 10) {
        left = viewportWidth - toolbarWidth - 10
      }
      
      if (top < 10) {
        top = end.bottom + 10
      }
      
      setPosition({ top, left })
      setIsVisible(true)
    }

    // Listen for selection changes
    editor.on('selectionUpdate', updateToolbar)
    editor.on('transaction', updateToolbar)
    
    // Hide toolbar on blur
    editor.on('blur', () => {
      setTimeout(() => setIsVisible(false), 100)
    })

    return () => {
      editor.off('selectionUpdate', updateToolbar)
      editor.off('transaction', updateToolbar)
      editor.off('blur')
    }
  }, [editor])

  // Hide toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowExtended(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!editor || !isVisible) return null

  // Get toolbar class based on mode
  const getToolbarClass = () => {
    const baseClass = 'adaptive-floating-toolbar'
    const modeClass = `mode-${mode}`
    return `${baseClass} ${modeClass} ${className}`
  }

  // Toolbar button component
  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    title, 
    children 
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
    >
      {children}
    </button>
  )

  // Basic formatting buttons
  const renderBasicButtons = () => (
    <div className="toolbar-group">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <Code size={16} />
      </ToolbarButton>
    </div>
  )

  // Extended formatting buttons
  const renderExtendedButtons = () => {
    if (!showExtended) return null

    return (
      <>
        <div className="toolbar-separator" />
        
        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </ToolbarButton>
        </div>
        
        <div className="toolbar-separator" />
        
        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={16} />
          </ToolbarButton>
        </div>
        
        <div className="toolbar-separator" />
        
        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={16} />
          </ToolbarButton>
        </div>
      </>
    )
  }

  return (
    <div
      ref={toolbarRef}
      className={getToolbarClass()}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: mode === 'focus' ? 70 : 50
      }}
    >
      {renderBasicButtons()}
      
      <div className="toolbar-separator" />
      
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <Link size={16} />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => setShowExtended(!showExtended)}
          isActive={showExtended}
          title="More options"
        >
          <MoreHorizontal size={16} />
        </ToolbarButton>
      </div>
      
      {renderExtendedButtons()}
    </div>
  )
}

export default AdaptiveFloatingToolbar