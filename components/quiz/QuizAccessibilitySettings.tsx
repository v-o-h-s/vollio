"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuizAccessibility } from "./QuizAccessibilityProvider";
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Keyboard, 
  Palette, 
  Type, 
  Focus,
  RotateCcw,
  X,
  Check
} from "lucide-react";

interface QuizAccessibilitySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuizAccessibilitySettings({ open, onOpenChange }: QuizAccessibilitySettingsProps) {
  const { 
    settings, 
    updateSetting, 
    toggleAccessibilityMode, 
    resetSettings,
    announce 
  } = useQuizAccessibility();

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    updateSetting(key, value);
    announce(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`, 'polite');
  };

  const handleModeChange = () => {
    toggleAccessibilityMode();
    announce(`Accessibility mode changed to ${settings.mode}`, 'polite');
  };

  const handleReset = () => {
    resetSettings();
    announce('Accessibility settings reset to defaults', 'polite');
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'standard':
        return 'Default appearance and behavior';
      case 'high-contrast':
        return 'Enhanced contrast for better visibility';
      case 'screen-reader':
        return 'Optimized for screen reader users';
      default:
        return '';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'standard':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'high-contrast':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'screen-reader':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        aria-describedby="accessibility-settings-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility Settings
          </DialogTitle>
          <DialogDescription id="accessibility-settings-description">
            Customize the quiz interface to meet your accessibility needs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Accessibility Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <Label className="text-base font-semibold">Accessibility Mode</Label>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Current Mode:</span>
                <Badge className={getModeDescription(settings.mode)}>
                  {settings.mode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {getModeDescription(settings.mode)}
              </p>
              <Button onClick={handleModeChange} variant="outline" size="sm">
                Switch Mode
              </Button>
            </div>
          </div>

          <Separator />

          {/* Visual Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <Label className="text-base font-semibold">Visual Settings</Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="high-contrast" className="font-medium">
                    High Contrast Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Button
                  id="high-contrast"
                  variant={settings.highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggle('highContrast', !settings.highContrast)}
                  className="flex items-center gap-2"
                >
                  {settings.highContrast && <Check className="h-3 w-3" />}
                  {settings.highContrast ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="large-text" className="font-medium">
                    Large Text
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Increase text size for better readability
                  </p>
                </div>
                <Button
                  id="large-text"
                  variant={settings.largeText ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggle('largeText', !settings.largeText)}
                  className="flex items-center gap-2"
                >
                  {settings.largeText && <Check className="h-3 w-3" />}
                  {settings.largeText ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="reduced-motion" className="font-medium">
                    Reduced Motion
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Button
                  id="reduced-motion"
                  variant={settings.reducedMotion ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggle('reducedMotion', !settings.reducedMotion)}
                  className="flex items-center gap-2"
                >
                  {settings.reducedMotion && <Check className="h-3 w-3" />}
                  {settings.reducedMotion ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              <Label className="text-base font-semibold">Navigation Settings</Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="focus-indicators" className="font-medium">
                    Enhanced Focus Indicators
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show clear focus outlines for keyboard navigation
                  </p>
                </div>
                <Button
                  id="focus-indicators"
                  variant={settings.focusIndicators ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggle('focusIndicators', !settings.focusIndicators)}
                  className="flex items-center gap-2"
                >
                  {settings.focusIndicators && <Check className="h-3 w-3" />}
                  {settings.focusIndicators ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="keyboard-navigation" className="font-medium">
                    Keyboard Navigation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable full keyboard navigation support
                  </p>
                </div>
                <Button
                  id="keyboard-navigation"
                  variant={settings.keyboardNavigation ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggle('keyboardNavigation', !settings.keyboardNavigation)}
                  className="flex items-center gap-2"
                >
                  {settings.keyboardNavigation && <Check className="h-3 w-3" />}
                  {settings.keyboardNavigation ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Audio Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Label className="text-base font-semibold">Audio Settings</Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="announce-changes" className="font-medium">
                    Announce Changes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Announce quiz progress and changes to screen readers
                  </p>
                </div>
                <Button
                  id="announce-changes"
                  variant={settings.announceChanges ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggle('announceChanges', !settings.announceChanges)}
                  className="flex items-center gap-2"
                >
                  {settings.announceChanges && <Check className="h-3 w-3" />}
                  {settings.announceChanges ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Quick Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use Tab to navigate between elements</li>
              <li>• Press Ctrl+/ (Cmd+/ on Mac) to see keyboard shortcuts</li>
              <li>• Use arrow keys to navigate between questions</li>
              <li>• Press numbers 1-4 or letters A-D to select answers</li>
              <li>• Press Escape to exit the quiz at any time</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            onClick={handleReset} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          
          <Button 
            onClick={() => onOpenChange(false)} 
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}