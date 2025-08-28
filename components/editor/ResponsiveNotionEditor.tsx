'use client';

import { useMobile } from '@/hooks/use-mobile';
import { NotionEditor } from './NotionEditor';
import { MobileNotionEditor } from './MobileNotionEditor';
import type { NotionEditorProps } from './types';

export function ResponsiveNotionEditor(props: NotionEditorProps) {
  const isMobile = isMobile();

  // Use mobile-optimized editor on mobile devices
  if (isMobile) {
    return <MobileNotionEditor {...props} />;
  }

  // Use standard editor on desktop
  return <NotionEditor {...props} />;
}