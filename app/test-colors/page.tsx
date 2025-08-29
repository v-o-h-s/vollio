'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function TestColorsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dark Theme Color Test</h1>
          <ThemeToggle variant="dropdown" showLabel />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Background Colors */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Background Colors</h2>
            <div className="space-y-2">
              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="font-medium">Background</p>
                <p className="text-sm text-muted-foreground">Main app background (#191919 in dark mode)</p>
              </div>
              <div className="p-4 bg-sidebar border border-border rounded-lg">
                <p className="font-medium text-sidebar-foreground">Sidebar</p>
                <p className="text-sm text-sidebar-foreground/60">Sidebar background (#202020 in dark mode)</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="font-medium text-card-foreground">Card</p>
                <p className="text-sm text-muted-foreground">Card background</p>
              </div>
            </div>
          </div>

          {/* Sidebar Colors */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sidebar Colors</h2>
            <div className="space-y-2">
              <div className="p-4 bg-sidebar-accent border border-border rounded-lg">
                <p className="font-medium text-sidebar-accent-foreground">Sidebar Accent</p>
                <p className="text-sm text-sidebar-foreground/60">Hover states and accents</p>
              </div>
              <div className="p-4 bg-sidebar-primary border border-border rounded-lg">
                <p className="font-medium text-sidebar-primary-foreground">Sidebar Primary</p>
                <p className="text-sm text-sidebar-foreground/60">Primary actions</p>
              </div>
            </div>
          </div>

          {/* Text Colors */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Text Colors</h2>
            <div className="space-y-2 p-4 bg-card border border-border rounded-lg">
              <p className="text-foreground font-medium">Primary Text (foreground)</p>
              <p className="text-muted-foreground">Muted Text (muted-foreground)</p>
              <p className="text-sidebar-foreground">Sidebar Text (sidebar-foreground)</p>
              <p className="text-sidebar-foreground/60">Sidebar Muted (sidebar-foreground/60)</p>
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Interactive Elements</h2>
            <div className="space-y-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                Secondary Button
              </button>
              <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors">
                Accent Button
              </button>
            </div>
          </div>
        </div>

        {/* Theme Toggle Showcase */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Theme Toggle Components</h2>
          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Button:</span>
                <ThemeToggle variant="button" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Switch:</span>
                <ThemeToggle variant="switch" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Dropdown:</span>
                <ThemeToggle variant="dropdown" />
              </div>
            </div>
          </div>
        </div>

        {/* Color Values Display */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Dark Theme Color Values</h2>
          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <p className="font-semibold mb-2">Background Colors:</p>
                <p>--background: #191919</p>
                <p>--sidebar: #202020</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Usage:</p>
                <p>Main app background uses #191919</p>
                <p>Sidebar uses #202020 for better contrast</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}