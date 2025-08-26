'use client'

import React, { useState, useEffect, useCallback, forwardRef } from 'react'
import { X, Maximize2, Minimize2, Focus, Eye, EyeOff } from 'lucide-react'
import { useEditorFocusManagement } from '@/hooks/use-focus-management'
import { cn } from '@/lib/utils'

export type EditorMode = 'normal' | 'fullscreen' | 'focus'

export interface MultiModeEditorProps {
  children: React.ReactNode
  mode?: EditorMode
  onModeChange?: (mode: EditorMode) => void
  showModeToggle?: boolean
  showWordCount?: boolean
  showReadingTime?: boolean
  wordCount?: number
  readingTime?: number
  className?: string
}

export const MultiModeEditor = forwardRef<HTMLDivElement, MultiModeEditorProps>(({
  children,
  mode = 'normal',
  onModeChange,
  showModeToggle = true,
  showWordCount = true,
  showReadingTime = true,
  wordCount = 0,
  readingTime = 0,
  className = ''
}, ref) => {
  const [currentMode, setCurrentMode] = useState<EditorMode>(mode)
  const [showKeyboardHint, setShowKeyboardHint] = useState(false)
  
  // Enhanced focus management for accessibility
  const focusManagement = useEditorFocusManagement(currentMode)

  // Handle mode changes with accessibility announcements
  const handleModeChange = useCallback((newMode: EditorMode) => {
    setCurrentMode(newMode)
    onModeChange?.(newMode)
    
    // Show keyboard hint for focus mode
    if (newMode === 'focus') {
      setShowKeyboardHint(true)
      setTimeout(() => setShowKeyboardHint(false), 3000)
    }
    
    // Announce mode change to screen readers
    const modeNames = {
      normal: 'Normal editing mode activated',
      fullscreen: 'Fullscreen editing mode activated',
      focus: 'Focus mode activated - distraction-free editing'
    }
    
    announceToScreenReader(modeNames[newMode], 'assertive')
  }, [onModeChange])
  
  // Utility function for screen reader announcements
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }, 1000)
  }, [])

  // Enhanced keyboard shortcuts with accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 for focus mode
      if (event.key === 'F11') {
        event.preventDefault()
        const newMode = currentMode === 'focus' ? 'normal' : 'focus'
        handleModeChange(newMode)
        announceToScreenReader(`Switched to ${newMode} mode. Press F11 again to toggle.`)
      }
      
      // Escape to exit focus mode
      if (event.key === 'Escape' && currentMode === 'focus') {
        event.preventDefault()
        handleModeChange('normal')
        announceToScreenReader('Exited focus mode')
      }
      
      // Ctrl/Cmd + Shift + F for fullscreen
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault()
        const newMode = currentMode === 'fullscreen' ? 'normal' : 'fullscreen'
        handleModeChange(newMode)
        announceToScreenReader(`Switched to ${newMode} mode`)
      }
      
      // Ctrl/Cmd + Shift + D for distraction-free mode
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault()
        // This would be handled by the parent component
        announceToScreenReader('Toggled distraction-free mode')
      }
      
      // Alt + M for mode menu (accessibility shortcut)
      if (event.altKey && event.key === 'm') {
        event.preventDefault()
        // Focus the first mode toggle button
        const modeButton = document.querySelector('.mode-toggle-button') as HTMLElement
        if (modeButton) {
          modeButton.focus()
          announceToScreenReader('Mode selection focused. Use arrow keys to navigate.')
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentMode, handleModeChange, announceToScreenReader])

  // Get editor class based on mode
  const getEditorClass = () => {
    const baseClass = 'editor-layout layout-transition'
    const modeClass = `editor-${currentMode}`
    return `${baseClass} ${modeClass} ${className}`
  }

  // Get content wrapper class
  const getContentWrapperClass = () => {
    return `editor-content-wrapper mode-${currentMode}`
  }

  // Render mode toggle buttons with enhanced accessibility
  const renderModeToggle = () => {
    if (!showModeToggle || currentMode === 'focus') return null

    const modes = [
      { 
        key: 'normal', 
        icon: Eye, 
        label: 'Normal', 
        description: 'Standard editing mode with all UI elements visible',
        shortcut: 'Alt+1'
      },
      { 
        key: 'fullscreen', 
        icon: Maximize2, 
        label: 'Fullscreen', 
        description: 'Expanded editing area while keeping sidebar visible',
        shortcut: 'Ctrl+Shift+F'
      },
      { 
        key: 'focus', 
        icon: Focus, 
        label: 'Focus', 
        description: 'Distraction-free editing with minimal UI',
        shortcut: 'F11'
      }
    ]

    return (
      <div 
        className="flex items-center gap-2 p-2 border-b border-border bg-muted/50"
        role="toolbar"
        aria-label="Editor mode selection"
      >
        <div className="flex items-center gap-1" role="group" aria-label="Editor modes">
          {modes.map((modeConfig) => {
            const Icon = modeConfig.icon
            const isActive = currentMode === modeConfig.key
            
            return (
              <button
                key={modeConfig.key}
                onClick={() => handleModeChange(modeConfig.key as EditorMode)}
                className={cn(
                  'mode-toggle-button',
                  isActive && 'active'
                )}
                aria-pressed={isActive}
                aria-describedby={`mode-${modeConfig.key}-description`}
                title={`${modeConfig.description} (${modeConfig.shortcut})`}
                onKeyDown={(e) => {
                  // Arrow key navigation
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault()
                    const currentIndex = modes.findIndex(m => m.key === modeConfig.key)
                    const nextIndex = e.key === 'ArrowRight' 
                      ? (currentIndex + 1) % modes.length
                      : (currentIndex - 1 + modes.length) % modes.length
                    
                    const nextButton = document.querySelector(
                      `[aria-describedby="mode-${modes[nextIndex].key}-description"]`
                    ) as HTMLElement
                    nextButton?.focus()
                  }
                }}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{modeConfig.label}</span>
                
                {/* Hidden description for screen readers */}
                <span 
                  id={`mode-${modeConfig.key}-description`} 
                  className="sr-only"
                >
                  {modeConfig.description}. Keyboard shortcut: {modeConfig.shortcut}
                </span>
              </button>
            )
          })}
        </div>
        
        <div className="mode-indicator" aria-live="polite">
          {currentMode === 'normal' && <Eye size={12} aria-hidden="true" />}
          {currentMode === 'fullscreen' && <Maximize2 size={12} aria-hidden="true" />}
          {currentMode === 'focus' && <Focus size={12} aria-hidden="true" />}
          <span>Current: {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}</span>
        </div>
      </div>
    )
  }

  // Render floating controls for focus mode with enhanced accessibility
  const renderFocusControls = () => {
    if (currentMode !== 'focus') return null

    return (
      <>
        {/* Exit button */}
        <button
          onClick={() => handleModeChange('normal')}
          className="focus-mode-exit-button"
          aria-label="Exit focus mode and return to normal editing"
          title="Exit focus mode (Esc)"
          autoFocus
        >
          <X size={16} aria-hidden="true" />
          <span>Exit Focus</span>
        </button>

        {/* Floating controls */}
        <div 
          className="focus-mode-controls"
          role="toolbar"
          aria-label="Focus mode controls"
        >
          <button
            onClick={() => handleModeChange('fullscreen')}
            aria-label="Switch to fullscreen mode"
            title="Switch to fullscreen mode (Ctrl+Shift+F)"
          >
            <Maximize2 size={16} aria-hidden="true" />
            <span className="sr-only">Fullscreen</span>
          </button>
          
          <button
            onClick={() => handleModeChange('normal')}
            aria-label="Switch to normal mode"
            title="Switch to normal mode"
          >
            <Minimize2 size={16} aria-hidden="true" />
            <span className="sr-only">Normal</span>
          </button>
        </div>
      </>
    )
  }

  // Render status bar with enhanced accessibility
  const renderStatusBar = () => {
    if (!showWordCount && !showReadingTime) return null

    return (
      <div 
        className={`editor-status-bar mode-${currentMode}`}
        role="status"
        aria-label="Editor statistics and mode information"
      >
        <div className="editor-stats" role="group" aria-label="Document statistics">
          {showWordCount && (
            <div className="editor-stat">
              <span className="editor-stat-label" id="word-count-label">Words:</span>
              <span 
                className="editor-stat-value"
                aria-labelledby="word-count-label"
                aria-live="polite"
              >
                {wordCount.toLocaleString()}
              </span>
            </div>
          )}
          
          {showReadingTime && (
            <div className="editor-stat">
              <span className="editor-stat-label" id="reading-time-label">Reading time:</span>
              <span 
                className="editor-stat-value"
                aria-labelledby="reading-time-label"
                aria-live="polite"
              >
                {readingTime} min
              </span>
            </div>
          )}
        </div>
        
        <div className="mode-indicator" aria-live="polite" aria-label="Current editor mode">
          {currentMode === 'normal' && <Eye size={12} aria-hidden="true" />}
          {currentMode === 'fullscreen' && <Maximize2 size={12} aria-hidden="true" />}
          {currentMode === 'focus' && <Focus size={12} aria-hidden="true" />}
          <span>{currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} mode</span>
        </div>
      </div>
    )
  }

  // Render keyboard hint with enhanced accessibility
  const renderKeyboardHint = () => {
    if (!showKeyboardHint) return null

    return (
      <div 
        className="keyboard-hint"
        role="status"
        aria-live="polite"
        aria-label="Keyboard shortcuts reminder"
      >
        <span>Press </span>
        <kbd aria-label="Escape key">Esc</kbd>
        <span> to exit focus mode, </span>
        <kbd aria-label="F11 key">F11</kbd>
        <span> to toggle modes</span>
      </div>
    )
  }

  return (
    <div 
      ref={ref || focusManagement.containerRef}
      className={getEditorClass()}
      role="application"
      aria-label={`Rich text editor in ${currentMode} mode`}
      aria-describedby="editor-mode-description editor-keyboard-shortcuts"
    >
      {/* Hidden descriptions for screen readers */}
      <div id="editor-mode-description" className="sr-only">
        Currently in {currentMode} mode. 
        {currentMode === 'focus' && 'Press Escape to exit focus mode. '}
        {currentMode === 'fullscreen' && 'Press Ctrl+Shift+F to exit fullscreen. '}
        Press Alt+M to access mode selection.
      </div>
      
      <div id="editor-keyboard-shortcuts" className="sr-only">
        Keyboard shortcuts: F11 for focus mode, Ctrl+Shift+F for fullscreen, 
        Escape to exit modes, Alt+M for mode selection, Ctrl+/ for help.
      </div>
      
      {renderModeToggle()}
      
      <div className={getContentWrapperClass()}>
        <div className="editor-content">
          {children}
        </div>
      </div>
      
      {renderStatusBar()}
      {renderFocusControls()}
      {renderKeyboardHint()}
    </div>
  )
})

MultiModeEditor.displayName = 'MultiModeEditor'

// Hook for managing editor mode state
export function useEditorMode(initialMode: EditorMode = 'normal') {
  const [mode, setMode] = useState<EditorMode>(initialMode)
  
  const toggleFullscreen = useCallback(() => {
    setMode(current => current === 'fullscreen' ? 'normal' : 'fullscreen')
  }, [])
  
  const toggleFocus = useCallback(() => {
    setMode(current => current === 'focus' ? 'normal' : 'focus')
  }, [])
  
  const exitMode = useCallback(() => {
    setMode('normal')
  }, [])
  
  return {
    mode,
    setMode,
    toggleFullscreen,
    toggleFocus,
    exitMode,
    isNormal: mode === 'normal',
    isFullscreen: mode === 'fullscreen',
    isFocus: mode === 'focus'
  }
}

export default MultiModeEditor