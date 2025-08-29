"use client";

import { NotionEditor } from "./NotionEditor";
import type { NotionEditorProps } from "./types";

/**
 * ResponsiveNotionEditor - A responsive wrapper around NotionEditor
 *
 * This component provides responsive design for different screen sizes
 * (desktop, laptop, tablet) while using the same core editor.
 * The editor automatically adapts its UI based on screen size using CSS.
 */
export function ResponsiveNotionEditor(props: NotionEditorProps) {
  return (
    <div className="responsive-editor-container">
      <NotionEditor {...props} />
    </div>
  );
}
