'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { parseNavigationHash, attemptCrossTabNavigation } from '@/lib/utils/crossTabNavigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner, InlineLoading } from '@/components/ui/loading';
import { annotationNotifications, navigationNotifications } from '@/lib/utils/notifications';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    ArrowLeft,
    Save,
    AlertTriangle
} from 'lucide-react';

interface InitialData {
    selectedText: string;
    pdfReference: string;
    pageNumber: number;
    coordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface NoteEditorProps {
    initialData: InitialData;
    existingContent?: string;
    onSave: (content: string) => void;
    onBackToPdf: () => void;
    isNewNote: boolean;
}

export function NoteEditor({
    initialData,
    existingContent,
    onSave,
    onBackToPdf,
    isNewNote
}: NoteEditorProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Generate PDF location link
    const pdfLocationLink = `#pdf?page=${initialData.pageNumber}&x=${initialData.coordinates.x}&y=${initialData.coordinates.y}&width=${initialData.coordinates.width}&height=${initialData.coordinates.height}`;

    // Handle PDF location link clicks
    const handlePdfLocationClick = (href: string) => {
        console.log('PDF location link clicked:', href);

        // Parse the navigation parameters from the href
        const navigationParams = parseNavigationHash(href);
        if (!navigationParams) {
            console.warn('Invalid PDF location link format:', href);
            return;
        }

        // Attempt cross-tab navigation for PDF location links (don't close current tab)
        const success = attemptCrossTabNavigation(href, navigationParams, {
            closeCurrentTab: false, // Keep editor open for location links
            fallbackUrl: '/dashboard/pdf-notes'
        });

        // If cross-tab communication failed, navigate in current window
        if (!success) {
            console.log('Cross-tab navigation failed for PDF location, using current window fallback');
            window.location.href = '/dashboard/pdf-notes' + href;
        }
    };

    // Initialize editor with content
    const getInitialContent = () => {
        if (existingContent) {
            return existingContent;
        }

        // For new notes, create initial content with selected text and PDF link
        return `<blockquote><p><strong>Selected text:</strong> "${initialData.selectedText}"</p></blockquote><p><a href="${pdfLocationLink}">📄 Back to PDF location (Page ${initialData.pageNumber})</a></p><p></p><p><strong>My notes:</strong></p><p></p>`;
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline hover:text-blue-800 transition-colors cursor-pointer',
                },
            }),
        ],
        content: getInitialContent(),
        immediatelyRender: false, // Fix for Next.js SSR hydration issues
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
            },
            handleClickOn: (view, pos, node, nodePos, event) => {
                // Handle clicks on PDF location links
                const target = event.target as HTMLElement;
                if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#pdf?')) {
                    event.preventDefault();
                    const href = target.getAttribute('href');
                    if (href) {
                        handlePdfLocationClick(href);
                    }
                    return true;
                }
                return false;
            },
        },
        onCreate: ({ editor }) => {
            console.log('TipTap editor created successfully');
        },
    });

    const handleSave = async () => {
        if (!editor) return;

        setIsSaving(true);
        try {
            const content = editor.getHTML();

            // Validate content before saving
            if (!content || content.trim() === '<p></p>' || content.trim() === '') {
                annotationNotifications.createError('Please add some content to your note before saving.');
                return;
            }

            await onSave(content);

            // Success notification is handled by the parent component via RTK Query
        } catch (error) {
            console.error('Error saving note:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save note';
            annotationNotifications.createError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const addLink = () => {
        if (!editor) return;

        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const removeLink = () => {
        if (!editor) return;
        editor.chain().focus().unsetLink().run();
    };

    // Show loading state while editor is initializing
    if (!editor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
                    <p className="text-gray-600">Initializing editor...</p>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.error('Note editor component error:', error, errorInfo)
                annotationNotifications.createError(error.message)
            }}
        >
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onBackToPdf}
                                    className="flex items-center space-x-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Back to PDF</span>
                                </Button>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {isNewNote ? 'Create Note' : 'Edit Note'}
                                </h1>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <LoadingSpinner size="sm" className="text-white" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                <span>{isSaving ? 'Saving...' : 'Save & Close'}</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 py-3">
                        <div className="flex items-center space-x-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editor?.chain().focus().toggleBold().run()}
                                className={editor?.isActive('bold') ? 'bg-gray-100' : ''}
                                disabled={!editor}
                            >
                                <Bold className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                                className={editor?.isActive('italic') ? 'bg-gray-100' : ''}
                                disabled={!editor}
                            >
                                <Italic className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editor?.chain().focus().toggleStrike().run()}
                                className={editor?.isActive('strike') ? 'bg-gray-100' : ''}
                                disabled={!editor}
                            >
                                <Underline className="h-4 w-4" />
                            </Button>

                            <div className="w-px h-6 bg-gray-300 mx-2" />

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                className={editor?.isActive('bulletList') ? 'bg-gray-100' : ''}
                                disabled={!editor}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                className={editor?.isActive('orderedList') ? 'bg-gray-100' : ''}
                                disabled={!editor}
                            >
                                <ListOrdered className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                                className={editor?.isActive('blockquote') ? 'bg-gray-100' : ''}
                                disabled={!editor}
                            >
                                <Quote className="h-4 w-4" />
                            </Button>

                            <div className="w-px h-6 bg-gray-300 mx-2" />

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={editor?.isActive('link') ? removeLink : addLink}
                                className={editor?.isActive('link') ? 'bg-gray-100' : ''}
                                disabled={!editor}
                            >
                                <LinkIcon className="h-4 w-4" />
                            </Button>

                            <div className="w-px h-6 bg-gray-300 mx-2" />

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editor?.chain().focus().undo().run()}
                                disabled={!editor?.can().undo()}
                            >
                                <Undo className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editor?.chain().focus().redo().run()}
                                disabled={!editor?.can().redo()}
                            >
                                <Redo className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
                        <EditorContent
                            editor={editor}
                            className="min-h-[500px]"
                        />
                    </div>

                    {/* Context Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Context</h3>
                        <p className="text-sm text-blue-800">
                            <strong>Page:</strong> {initialData.pageNumber} |
                            <strong> Selected text:</strong> "{initialData.selectedText.substring(0, 100)}{initialData.selectedText.length > 100 ? '...' : ''}"
                        </p>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}