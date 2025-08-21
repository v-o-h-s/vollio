'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from './AccessibilityProvider';
import { cn } from '@/lib/utils';

interface AccessibilitySettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilitySettingsDialog({ isOpen, onClose }: AccessibilitySettingsDialogProps) {
  const { settings, updateSettings, announceToScreenReader } = useAccessibility();

  const handleToggleSetting = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    updateSettings({ [key]: newValue });
    
    const settingNames = {
      highContrast: 'High contrast mode',
      reducedMotion: 'Reduced motion',
      screenReaderOptimized: 'Screen reader optimization',
      keyboardNavigation: 'Enhanced keyboard navigation',
      announcements: 'Screen reader announcements',
    };
    
    announceToScreenReader(
      `${settingNames[key]} ${newValue ? 'enabled' : 'disabled'}`,
      'assertive'
    );
  };

  const resetToDefaults = () => {
    updateSettings({
      highContrast: false,
      reducedMotion: false,
      screenReaderOptimized: false,
      keyboardNavigation: true,
      announcements: true,
    });
    announceToScreenReader('Accessibility settings reset to defaults', 'assertive');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl"
        aria-describedby="accessibility-settings-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ♿ Accessibility Settings
          </DialogTitle>
          <p id="accessibility-settings-description" className="text-sm text-muted-foreground">
            Customize the editor to better suit your accessibility needs
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visual Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              👁️ Visual Preferences
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast" className="text-sm font-medium">
                    High Contrast Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Increases contrast for better visibility
                  </p>
                </div>
                <button
                  id="high-contrast"
                  role="switch"
                  aria-checked={settings.highContrast}
                  onClick={() => handleToggleSetting('highContrast')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    settings.highContrast ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span className="sr-only">Toggle high contrast mode</span>
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                      settings.highContrast ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduced-motion" className="text-sm font-medium">
                    Reduced Motion
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Minimizes animations and transitions
                  </p>
                </div>
                <button
                  id="reduced-motion"
                  role="switch"
                  aria-checked={settings.reducedMotion}
                  onClick={() => handleToggleSetting('reducedMotion')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    settings.reducedMotion ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span className="sr-only">Toggle reduced motion</span>
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                      settings.reducedMotion ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              ⌨️ Navigation Preferences
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="keyboard-navigation" className="text-sm font-medium">
                    Enhanced Keyboard Navigation
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Improves keyboard navigation with visual focus indicators
                  </p>
                </div>
                <button
                  id="keyboard-navigation"
                  role="switch"
                  aria-checked={settings.keyboardNavigation}
                  onClick={() => handleToggleSetting('keyboardNavigation')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    settings.keyboardNavigation ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span className="sr-only">Toggle enhanced keyboard navigation</span>
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                      settings.keyboardNavigation ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Screen Reader Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              🔊 Screen Reader Preferences
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="screen-reader-optimized" className="text-sm font-medium">
                    Screen Reader Optimization
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Optimizes interface for screen reader users
                  </p>
                </div>
                <button
                  id="screen-reader-optimized"
                  role="switch"
                  aria-checked={settings.screenReaderOptimized}
                  onClick={() => handleToggleSetting('screenReaderOptimized')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    settings.screenReaderOptimized ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span className="sr-only">Toggle screen reader optimization</span>
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                      settings.screenReaderOptimized ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="announcements" className="text-sm font-medium">
                    Screen Reader Announcements
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enables status announcements for screen readers
                  </p>
                </div>
                <button
                  id="announcements"
                  role="switch"
                  aria-checked={settings.announcements}
                  onClick={() => handleToggleSetting('announcements')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    settings.announcements ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span className="sr-only">Toggle screen reader announcements</span>
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                      settings.announcements ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              ⚡ Quick Actions
            </h3>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="flex-1"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Settings are automatically saved
            </p>
            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}