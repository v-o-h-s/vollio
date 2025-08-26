'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { 
  Type, 
  Minus, 
  Plus, 
  RotateCcw, 
  Settings,
  Eye,
  EyeOff,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TypographySettings {
  fontSize: 'small' | 'normal' | 'large'
  lineHeight: 'tight' | 'normal' | 'loose'
  maxWidth: 'narrow' | 'normal' | 'wide'
  distractionFree: boolean
  enhancedReadability: boolean
  highContrast: boolean
}

interface TypographySettingsProps {
  editor: Editor | null
  className?: string
  trigger?: React.ReactNode
}

const defaultSettings: TypographySettings = {
  fontSize: 'normal',
  lineHeight: 'normal',
  maxWidth: 'normal',
  distractionFree: false,
  enhancedReadability: true,
  highContrast: false
}

export function TypographySettings({ 
  editor, 
  className,
  trigger 
}: TypographySettingsProps) {
  const [settings, setSettings] = useState<TypographySettings>(defaultSettings)
  const [isOpen, setIsOpen] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('editor-typography-settings')
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      } catch (error) {
        console.warn('Failed to load typography settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('editor-typography-settings', JSON.stringify(settings))
  }, [settings])

  // Apply settings to editor
  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom as HTMLElement
    const proseMirrorElement = editorElement.closest('.ProseMirror') as HTMLElement

    if (!proseMirrorElement) return

    // Remove existing typography classes
    proseMirrorElement.classList.remove(
      'typography-enhanced',
      'editor-typography-small',
      'editor-typography-normal', 
      'editor-typography-large',
      'editor-line-height-tight',
      'editor-line-height-normal',
      'editor-line-height-loose',
      'editor-max-width-narrow',
      'editor-max-width-normal',
      'editor-max-width-wide',
      'editor-distraction-free',
      'editor-high-contrast'
    )

    // Apply enhanced readability
    if (settings.enhancedReadability) {
      proseMirrorElement.classList.add('typography-enhanced')
    }

    // Apply font size
    proseMirrorElement.classList.add(`editor-typography-${settings.fontSize}`)

    // Apply line height
    proseMirrorElement.classList.add(`editor-line-height-${settings.lineHeight}`)

    // Apply max width
    proseMirrorElement.classList.add(`editor-max-width-${settings.maxWidth}`)

    // Apply distraction-free mode
    if (settings.distractionFree) {
      proseMirrorElement.classList.add('editor-distraction-free')
    }

    // Apply high contrast
    if (settings.highContrast) {
      proseMirrorElement.classList.add('editor-high-contrast')
    }

    // Apply CSS custom properties for fine-tuned control
    const root = document.documentElement
    
    switch (settings.fontSize) {
      case 'small':
        root.style.setProperty('--editor-font-size-current', 'var(--editor-font-size-small)')
        break
      case 'large':
        root.style.setProperty('--editor-font-size-current', 'var(--editor-font-size-large)')
        break
      default:
        root.style.setProperty('--editor-font-size-current', 'var(--editor-font-size-normal)')
    }

    switch (settings.lineHeight) {
      case 'tight':
        root.style.setProperty('--editor-line-height-current', 'var(--editor-line-height-tight)')
        break
      case 'loose':
        root.style.setProperty('--editor-line-height-current', 'var(--editor-line-height-loose)')
        break
      default:
        root.style.setProperty('--editor-line-height-current', 'var(--editor-line-height)')
    }

    switch (settings.maxWidth) {
      case 'narrow':
        root.style.setProperty('--editor-max-width-current', 'var(--editor-max-width-narrow)')
        break
      case 'wide':
        root.style.setProperty('--editor-max-width-current', 'var(--editor-max-width-wide)')
        break
      default:
        root.style.setProperty('--editor-max-width-current', 'var(--editor-max-width)')
    }
  }, [editor, settings])

  const updateSetting = <K extends keyof TypographySettings>(
    key: K,
    value: TypographySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  const renderFontSizeControls = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Font Size</Label>
      <div className="flex items-center gap-2">
        <Button
          variant={settings.fontSize === 'small' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('fontSize', 'small')}
          className="flex-1"
        >
          <Minus className="h-3 w-3 mr-1" />
          Small
        </Button>
        <Button
          variant={settings.fontSize === 'normal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('fontSize', 'normal')}
          className="flex-1"
        >
          <Type className="h-3 w-3 mr-1" />
          Normal
        </Button>
        <Button
          variant={settings.fontSize === 'large' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('fontSize', 'large')}
          className="flex-1"
        >
          <Plus className="h-3 w-3 mr-1" />
          Large
        </Button>
      </div>
    </div>
  )

  const renderLineHeightControls = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Line Height</Label>
      <div className="flex items-center gap-2">
        <Button
          variant={settings.lineHeight === 'tight' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('lineHeight', 'tight')}
          className="flex-1"
        >
          Tight
        </Button>
        <Button
          variant={settings.lineHeight === 'normal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('lineHeight', 'normal')}
          className="flex-1"
        >
          Normal
        </Button>
        <Button
          variant={settings.lineHeight === 'loose' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('lineHeight', 'loose')}
          className="flex-1"
        >
          Loose
        </Button>
      </div>
    </div>
  )

  const renderMaxWidthControls = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Content Width</Label>
      <div className="flex items-center gap-2">
        <Button
          variant={settings.maxWidth === 'narrow' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('maxWidth', 'narrow')}
          className="flex-1"
        >
          Narrow
        </Button>
        <Button
          variant={settings.maxWidth === 'normal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('maxWidth', 'normal')}
          className="flex-1"
        >
          Normal
        </Button>
        <Button
          variant={settings.maxWidth === 'wide' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('maxWidth', 'wide')}
          className="flex-1"
        >
          Wide
        </Button>
      </div>
    </div>
  )

  const renderToggleControls = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Distraction-Free Mode</Label>
          <p className="text-xs text-muted-foreground">
            Hide UI elements when not in use
          </p>
        </div>
        <Button
          variant={settings.distractionFree ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('distractionFree', !settings.distractionFree)}
        >
          {settings.distractionFree ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Enhanced Readability</Label>
          <p className="text-xs text-muted-foreground">
            Optimize typography for better reading
          </p>
        </div>
        <Button
          variant={settings.enhancedReadability ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('enhancedReadability', !settings.enhancedReadability)}
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-medium">High Contrast</Label>
          <p className="text-xs text-muted-foreground">
            Increase contrast for better visibility
          </p>
        </div>
        <Button
          variant={settings.highContrast ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSetting('highContrast', !settings.highContrast)}
        >
          <Palette className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 w-8 p-0', className)}
            title="Typography Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderFontSizeControls()}
          
          <Separator />
          
          {renderLineHeightControls()}
          
          <Separator />
          
          {renderMaxWidthControls()}
          
          <Separator />
          
          {renderToggleControls()}
          
          <Separator />
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
            
            <Button
              onClick={() => setIsOpen(false)}
              size="sm"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for typography settings
export function useTypographySettings() {
  const [settings, setSettings] = useState<TypographySettings>(defaultSettings)

  useEffect(() => {
    const saved = localStorage.getItem('editor-typography-settings')
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      } catch (error) {
        console.warn('Failed to load typography settings:', error)
      }
    }
  }, [])

  const updateSetting = <K extends keyof TypographySettings>(
    key: K,
    value: TypographySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('editor-typography-settings', JSON.stringify(newSettings))
  }

  return {
    settings,
    updateSetting,
    resetSettings: () => {
      setSettings(defaultSettings)
      localStorage.setItem('editor-typography-settings', JSON.stringify(defaultSettings))
    }
  }
}