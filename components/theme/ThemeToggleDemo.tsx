'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';

/**
 * Demo component showcasing different ThemeToggle variants and configurations
 * Useful for testing and documentation purposes
 */
export function ThemeToggleDemo() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Theme Toggle Demo</h2>
        <p className="text-muted-foreground">
          Showcase of different ThemeToggle variants with various configurations.
        </p>
        <div className="text-sm text-muted-foreground">
          Current theme: <span className="font-medium">{theme}</span>
        </div>
      </div>

      <Separator />

      {/* Button Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variant</CardTitle>
          <CardDescription>
            Toggles between light and dark themes on click. Best for simple theme switching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Small</p>
              <ThemeToggle variant="button" size="sm" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Medium (default)</p>
              <ThemeToggle variant="button" size="md" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Large</p>
              <ThemeToggle variant="button" size="lg" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <p className="text-sm font-medium">With Label</p>
            <div className="flex items-center gap-4">
              <ThemeToggle variant="button" size="sm" showLabel />
              <ThemeToggle variant="button" size="md" showLabel />
              <ThemeToggle variant="button" size="lg" showLabel />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Switch Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Switch Variant</CardTitle>
          <CardDescription>
            Toggles between light and dark modes only. Smooth icon transitions with rotation effects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Small</p>
              <ThemeToggle variant="switch" size="sm" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Medium</p>
              <ThemeToggle variant="switch" size="md" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Large</p>
              <ThemeToggle variant="switch" size="lg" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <p className="text-sm font-medium">With Label</p>
            <div className="flex items-center gap-4">
              <ThemeToggle variant="switch" size="sm" showLabel />
              <ThemeToggle variant="switch" size="md" showLabel />
              <ThemeToggle variant="switch" size="lg" showLabel />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dropdown Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Dropdown Variant</CardTitle>
          <CardDescription>
            Provides a dropdown menu to select specific theme. Best for settings pages or when you need explicit theme selection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Small</p>
              <ThemeToggle variant="dropdown" size="sm" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Medium</p>
              <ThemeToggle variant="dropdown" size="md" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Large</p>
              <ThemeToggle variant="dropdown" size="lg" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <p className="text-sm font-medium">With Label</p>
            <div className="flex items-center gap-4">
              <ThemeToggle variant="dropdown" size="sm" showLabel />
              <ThemeToggle variant="dropdown" size="md" showLabel />
              <ThemeToggle variant="dropdown" size="lg" showLabel />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
          <CardDescription>
            All variants include comprehensive accessibility support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>ARIA labels describing current theme and available actions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Keyboard navigation support (Tab, Enter, Space, Arrow keys)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Screen reader announcements when theme changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Focus indicators with proper contrast ratios</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Tooltips showing current theme and resolved theme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Visual indicators (checkmarks) in dropdown for current selection</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Common use cases for different variants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="font-medium">Toolbar/Header</p>
              <p className="text-sm text-muted-foreground">Button variant for quick access</p>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm">App Header</span>
                <ThemeToggle variant="button" size="sm" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Settings Page</p>
              <p className="text-sm text-muted-foreground">Dropdown for explicit selection</p>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm">Theme</span>
                <ThemeToggle variant="dropdown" size="sm" showLabel />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Mobile Menu</p>
              <p className="text-sm text-muted-foreground">Switch for simple toggle</p>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm">Dark Mode</span>
                <ThemeToggle variant="switch" size="sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}