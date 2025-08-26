'use client'

import { useEffect, useState, useMemo } from 'react'
import { Editor } from '@tiptap/react'
import { Clock, FileText, Eye, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorStatsDisplayProps {
  editor: Editor | null
  className?: string
  minimal?: boolean
  showWordCount?: boolean
  showReadingTime?: boolean
  showCharacterCount?: boolean
  showReadingLevel?: boolean
  position?: 'fixed' | 'inline'
}

interface EditorStats {
  wordCount: number
  characterCount: number
  characterCountNoSpaces: number
  paragraphCount: number
  readingTime: number
  readingLevel: string
}

export function EditorStatsDisplay({
  editor,
  className,
  minimal = false,
  showWordCount = true,
  showReadingTime = true,
  showCharacterCount = false,
  showReadingLevel = false,
  position = 'fixed'
}: EditorStatsDisplayProps) {
  const [previousStats, setPreviousStats] = useState<EditorStats | null>(null)
  const [updatingStats, setUpdatingStats] = useState<Set<string>>(new Set())

  // Calculate comprehensive editor statistics
  const stats = useMemo((): EditorStats => {
    if (!editor) {
      return {
        wordCount: 0,
        characterCount: 0,
        characterCountNoSpaces: 0,
        paragraphCount: 0,
        readingTime: 0,
        readingLevel: 'Easy'
      }
    }

    const text = editor.getText()
    const textWithoutSpaces = text.replace(/\s/g, '')
    
    // Word count calculation
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length

    // Character counts
    const characterCount = text.length
    const characterCountNoSpaces = textWithoutSpaces.length

    // Paragraph count
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const paragraphCount = paragraphs.length

    // Reading time calculation (200 words per minute average)
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    // Simple reading level estimation based on average word length and sentence complexity
    const averageWordLength = wordCount > 0 ? characterCountNoSpaces / wordCount : 0
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const averageSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0
    
    let readingLevel = 'Easy'
    if (averageWordLength > 5 || averageSentenceLength > 20) {
      readingLevel = 'Advanced'
    } else if (averageWordLength > 4 || averageSentenceLength > 15) {
      readingLevel = 'Intermediate'
    }

    return {
      wordCount,
      characterCount,
      characterCountNoSpaces,
      paragraphCount,
      readingTime,
      readingLevel
    }
  }, [editor])

  // Handle stat updates with animation
  useEffect(() => {
    if (!previousStats) {
      setPreviousStats(stats)
      return
    }

    const changedStats = new Set<string>()
    
    if (stats.wordCount !== previousStats.wordCount) changedStats.add('wordCount')
    if (stats.characterCount !== previousStats.characterCount) changedStats.add('characterCount')
    if (stats.readingTime !== previousStats.readingTime) changedStats.add('readingTime')
    if (stats.readingLevel !== previousStats.readingLevel) changedStats.add('readingLevel')

    if (changedStats.size > 0) {
      setUpdatingStats(changedStats)
      
      // Clear animation after duration
      setTimeout(() => {
        setUpdatingStats(new Set())
      }, 300)
    }

    setPreviousStats(stats)
  }, [stats, previousStats])

  if (!editor) {
    return null
  }

  const renderStat = (
    key: string,
    icon: React.ReactNode,
    label: string,
    value: string | number,
    description?: string
  ) => (
    <div 
      className={cn(
        'editor-stat',
        minimal && 'flex-row items-center gap-2'
      )}
      title={description}
    >
      <div className="flex items-center gap-1">
        {icon}
        <span className="editor-stat-label">{label}:</span>
      </div>
      <span 
        className={cn(
          'editor-stat-value',
          updatingStats.has(key) && 'updating'
        )}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  )

  const renderMinimalStats = () => (
    <div className="flex items-center gap-4">
      {showWordCount && renderStat(
        'wordCount',
        <FileText className="h-3 w-3" />,
        'Words',
        stats.wordCount,
        `${stats.wordCount} words`
      )}
      
      {showReadingTime && renderStat(
        'readingTime',
        <Clock className="h-3 w-3" />,
        'Read',
        `${stats.readingTime}m`,
        `Estimated reading time: ${stats.readingTime} minute${stats.readingTime !== 1 ? 's' : ''}`
      )}
    </div>
  )

  const renderFullStats = () => (
    <div className="space-y-2">
      {showWordCount && renderStat(
        'wordCount',
        <FileText className="h-4 w-4" />,
        'Words',
        stats.wordCount,
        `${stats.wordCount} words in document`
      )}
      
      {showReadingTime && renderStat(
        'readingTime',
        <Clock className="h-4 w-4" />,
        'Reading time',
        `${stats.readingTime} min`,
        `Estimated reading time: ${stats.readingTime} minute${stats.readingTime !== 1 ? 's' : ''} (200 WPM)`
      )}
      
      {showCharacterCount && renderStat(
        'characterCount',
        <Eye className="h-4 w-4" />,
        'Characters',
        `${stats.characterCount} (${stats.characterCountNoSpaces})`,
        `${stats.characterCount} characters including spaces, ${stats.characterCountNoSpaces} without spaces`
      )}
      
      {showReadingLevel && renderStat(
        'readingLevel',
        <Target className="h-4 w-4" />,
        'Level',
        stats.readingLevel,
        `Estimated reading difficulty: ${stats.readingLevel}`
      )}
    </div>
  )

  return (
    <div
      className={cn(
        'editor-stats-display',
        minimal && 'minimal',
        position === 'inline' && 'relative bottom-auto right-auto',
        className
      )}
    >
      {minimal ? renderMinimalStats() : renderFullStats()}
    </div>
  )
}

// Hook for real-time editor statistics
export function useEditorStats(editor: Editor | null) {
  const [stats, setStats] = useState({
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    paragraphCount: 0
  })

  useEffect(() => {
    if (!editor) return

    const updateStats = () => {
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(word => word.length > 0)
      const wordCount = words.length
      const characterCount = text.length
      const readingTime = Math.max(1, Math.ceil(wordCount / 200))
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      const paragraphCount = paragraphs.length

      setStats({
        wordCount,
        characterCount,
        readingTime,
        paragraphCount
      })
    }

    // Update stats on content change
    editor.on('update', updateStats)
    
    // Initial calculation
    updateStats()

    return () => {
      editor.off('update', updateStats)
    }
  }, [editor])

  return stats
}