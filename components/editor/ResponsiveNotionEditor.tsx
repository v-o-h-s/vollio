'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { NotionEditor } from './NotionEditor';
import { MobileNotionEditor } from './MobileNotionEditor';
import type { NotionEditorProps } from './types';

export function ResponsiveNotionEditor(props: NotionEditorProps) {
  const isMobile = useIsMobile();

  // Use mobile-optimized editor on mobile devices
  if (isMobile) {
    return <MobileNotionEditor {...props} />;
  }

  // Use standard editor on desktop
  return <NotionEditor {...props} />;
}