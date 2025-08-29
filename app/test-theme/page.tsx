'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function TestThemePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Theme Toggle Test</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Button Variant</h2>
          <ThemeToggle variant="button" />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Switch Variant</h2>
          <ThemeToggle variant="switch" />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Dropdown Variant</h2>
          <ThemeToggle variant="dropdown" />
        </div>
      </div>
    </div>
  );
}