'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Quote,
  Type,
  Palette,
  MoreHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ContextualToolbarProps {
  editor: Editor
  className?: string
  minimal?: boolean
  autoHide?: boolean
}

interface ToolbarPosition {
  top: number
  left: number
  visible: boolean
}

export function ContextualToolbar({ 
  editor, 
  className,
  minimal = false,
  autoHide = true
}: ContextualToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition>({
    top: 0,
    left: 0,
    visible: false,
  })
  const [isHovered, setIsHovered] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout>()

  const updatePosition = useCallback(() => {
    const { selection } = editor.state
    const { from, to, empty } = selection

    // Hide toolbar if no selection or selection is empty
    if (empty) {
      setPosition((prev) => ({ ...prev, visible: false }))
      return
    }

    // Get the DOM range for the selection
    const { view } = editor
    const start = view.coordsAtPos(from)
    const end = view.coordsAtPos(to)

    if (!start || !end) {
      setPosition((prev) => ({ ...prev, visible: false }))
      return
    }

    // Calculate toolbar position
    const selectionWidth = end.left - start.left
    const selectionCenter = start.left + selectionWidth / 2

    // Position toolbar above the selection
    const toolbarWidth = toolbarRef.current?.offsetWidth || (minimal ? 200 : 350)
    const left = Math.max(10, Math.min(
      window.innerWidth - toolbarWidth - 10,
      selectionCenter - toolbarWidth / 2
    ))
    const top = Math.max(10, start.top - 60)

    setPosition({
      top,
      left,
      visible: true,
    })
  }, [editor, minimal])

  // Handle selection changes
  useEffect(() => {
    const handleSelectionUpdate = () => {
      // Clear any existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }

      // Small delay to ensure DOM is updated
      setTimeout(updatePosition, 10)
    }

    // Listen to editor events
    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('transaction', handleSelectionUpdate)

    // Handle window resize and scroll
    const handleResize = () => {
      if (position.visible) {
        updatePosition()
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('transaction', handleSelectionUpdate)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [editor, position.visible, updatePosition])

  // Auto-hide functionality
  useEffect(() => {
    if (!autoHide || !position.visible || isHovered) return

    hideTimeoutRef.current = setTimeout(() => {
      setPosition((prev) => ({ ...prev, visible: false }))
    }, 3000) // Hide after 3 seconds of inactivity

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [autoHide, position.visible, isHovered])

  // Handle mouse events
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Hide toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        // Don't hide if clicking in the editor
        const editorElement = editor.view.dom
        if (!editorElement.contains(event.target as Node)) {
          setPosition((prev) => ({ ...prev, visible: false }))
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editor])

  if (!position.visible) {
    return null
  }

  const handleCommand = (command: () => void) => {
    command()
    editor.view.focus()
  }

  const renderMinimalToolbar = () => (
    <>
      {/* Essential formatting */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().toggleBold().run())}
        data-active={editor.isActive('bold')}
        aria-label="Bold"
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().toggleItalic().run())}
        data-active={editor.isActive('italic')}
        aria-label="Italic"
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => {
          const url = window.prompt('Enter URL:')
          if (url) {
            handleCommand(() => editor.chain().focus().setLink({ href: url }).run())
          }
        }}
        data-active={editor.isActive('link')}
        aria-label="Add Link"
        title="Add Link (Ctrl+K)"
      >
        <Link className="h-3.5 w-3.5" />
      </Button>
    </>
  )

  const renderFullToolbar = () => (
    <>
      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().toggleBold().run())}
        data-active={editor.isActive('bold')}
        aria-label="Bold"
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().toggleItalic().run())}
        data-active={editor.isActive('italic')}
        aria-label="Italic"
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().toggleUnderline().run())}
        data-active={editor.isActive('underline')}
        aria-label="Underline"
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().toggleStrike().run())}
        data-active={editor.isActive('strike')}
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Code and Link */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().toggleCode().run())}
        data-active={editor.isActive('code')}
        aria-label="Inline Code"
        title="Inline Code (Ctrl+E)"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          const url = window.prompt('Enter URL:')
          if (url) {
            handleCommand(() => editor.chain().focus().setLink({ href: url }).run())
          }
        }}
        data-active={editor.isActive('link')}
        aria-label="Add Link"
        title="Add Link (Ctrl+K)"
      >
        <Link className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Block Formatting */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().toggleBlockquote().run())}
        data-active={editor.isActive('blockquote')}
        aria-label="Quote"
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          if (editor.isActive('heading')) {
            handleCommand(() => editor.chain().focus().setParagraph().run())
          } else {
            handleCommand(() => editor.chain().focus().toggleHeading({ level: 2 }).run())
          }
        }}
        data-active={editor.isActive('heading')}
        aria-label="Heading"
        title="Toggle Heading"
      >
        <Type className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Alignment */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().setTextAlign('left').run())}
        data-active={editor.isActive({ textAlign: 'left' })}
        aria-label="Align Left"
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().setTextAlign('center').run())}
        data-active={editor.isActive({ textAlign: 'center' })}
        aria-label="Align Center"
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleCommand(() => editor.chain().focus().setTextAlign('right').run())}
        data-active={editor.isActive({ textAlign: 'right' })}
        aria-label="Align Right"
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
    </>
  )

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Text formatting toolbar"
      className={cn(
        'fixed z-50 flex items-center gap-1 rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-1',
        'contextual-toolbar visible',
        minimal && 'minimal',
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {minimal ? renderMinimalToolbar() : renderFullToolbar()}
    </div>
  )
}