'use client';

import React from 'react';
import { ThemeDemo } from '@/components/theme/ThemeDemo';
import { ThemeToggleDemo } from '@/components/theme/ThemeToggleDemo';

/**
 * Test page for theme functionality
 */
export default function ThemeTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Theme System Test</h1>
          <p className="text-muted-foreground">
            This page demonstrates the theme system and ThemeToggle components.
          </p>
        </div>
        
        <ThemeDemo />
        
        <ThemeToggleDemo />
      </div>
    </div>
  );
}