'use client';

import { useState } from 'react';
import { ResponsiveNotionEditor } from './ResponsiveNotionEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

export function MobileEditorDemo() {
  const [content, setContent] = useState({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Welcome to the mobile-optimized Notion-like editor! Try these features:',
          },
        ],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Long press to start drag and drop',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Tap to select text, then use the mobile toolbar',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Type "/" to open the mobile slash command menu',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Use touch gestures for text selection',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  const isMobile = useIsMobile();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Mobile Editor Demo
            <span className="text-sm font-normal text-muted-foreground">
              {isMobile ? 'Mobile View' : 'Desktop View'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {isMobile ? (
                <div className="space-y-2">
                  <p><strong>Mobile Features Active:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Touch-optimized toolbar</li>
                    <li>Drag handles for block reordering</li>
                    <li>Mobile slash command interface</li>
                    <li>Touch gesture support</li>
                    <li>Virtual keyboard handling</li>
                  </ul>
                </div>
              ) : (
                <p>
                  <strong>Desktop Mode:</strong> Resize your browser window or use mobile device to see mobile features.
                </p>
              )}
            </div>

            <div className="border rounded-lg min-h-[400px]">
              <ResponsiveNotionEditor
                content={content}
                onChange={setContent}
                placeholder="Start typing or use '/' for commands..."
                className="min-h-[400px]"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setContent({
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Fresh start! Try the mobile features.' }],
                    },
                  ],
                })}
              >
                Reset Content
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Current content:', JSON.stringify(content, null, 2));
                }}
              >
                Log Content
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}