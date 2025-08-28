'use client';

import { useState } from 'react';
import { NotionEditor } from './NotionEditor';
import { AdvancedFloatingToolbar } from './AdvancedFloatingToolbar';
import { FloatingToolbar } from './FloatingToolbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { JSONContent } from '@/lib/types';

export function FloatingToolbarDemo() {
  const [content, setContent] = useState<JSONContent>({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Select this text to see the floating toolbar in action! Try selecting different parts of this document to see how the toolbar appears and positions itself.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'You can format text with ',
          },
          {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: 'bold',
          },
          {
            type: 'text',
            text: ', ',
          },
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: 'italic',
          },
          {
            type: 'text',
            text: ', ',
          },
          {
            type: 'text',
            marks: [{ type: 'underline' }],
            text: 'underline',
          },
          {
            type: 'text',
            text: ', and ',
          },
          {
            type: 'text',
            marks: [{ type: 'code' }],
            text: 'code',
          },
          {
            type: 'text',
            text: ' formatting.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [
          {
            type: 'text',
            text: 'Try selecting this heading',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'The floating toolbar will appear above your selection with relevant formatting options. It includes buttons for bold, italic, underline, strikethrough, code, links, quotes, and more.',
          },
        ],
      },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This is a blockquote. Select text here to see how the toolbar positions itself relative to different content types.',
              },
            ],
          },
        ],
      },
    ],
  });

  const [useAdvanced, setUseAdvanced] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Floating Toolbar Demo</CardTitle>
          <CardDescription>
            Select any text in the editor below to see the floating toolbar appear.
            Toggle between basic and advanced versions to see different feature sets.
          </CardDescription>
          <div className="flex gap-2">
            <Button
              variant={!useAdvanced ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseAdvanced(false)}
            >
              Basic Toolbar
            </Button>
            <Button
              variant={useAdvanced ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseAdvanced(true)}
            >
              Advanced Toolbar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <NotionEditor
              content={content}
              onChange={setContent}
              placeholder="Start typing or select existing text..."
              className="min-h-[400px] prose max-w-none"
              // Override the default floating toolbar
              customToolbar={(editor) => 
                useAdvanced ? (
                  <AdvancedFloatingToolbar editor={editor} />
                ) : (
                  <FloatingToolbar editor={editor} />
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Toolbar</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Bold, Italic, Underline, Strikethrough</li>
                <li>• Inline Code</li>
                <li>• Quick Link (with prompt)</li>
                <li>• Blockquote</li>
                <li>• Heading Toggle</li>
                <li>• Color & More Options (placeholders)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Advanced Toolbar</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All basic formatting options</li>
                <li>• Advanced Link Dialog</li>
                <li>• Text Color Picker</li>
                <li>• Highlight Colors</li>
                <li>• List Formatting</li>
                <li>• Better UX with Popovers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}