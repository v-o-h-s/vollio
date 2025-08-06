'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NoteEditor } from '@/components/note/NoteEditor';
import { useCreateAnnotationMutation } from '@/lib/store/apiSlice';
import { createNavigationHash, attemptCrossTabNavigation } from '@/lib/utils/crossTabNavigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingState } from '@/components/ui/loading';
import { annotationNotifications } from '@/lib/utils/notifications';

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

export default function NewNotePage() {
    const router = useRouter();
    const [initialData, setInitialData] = useState<InitialData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [createAnnotation] = useCreateAnnotationMutation();

    useEffect(() => {
        // Get initial data from localStorage (passed from PDF viewer)
        const storedData = localStorage.getItem('newNoteData');
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                setInitialData(data);
                // Clear the data after reading it
                localStorage.removeItem('newNoteData');
            } catch (error) {
                console.error('Failed to parse note data:', error);
            }
        }
        setIsLoading(false);
    }, []);

    const handleSave = async (noteContent: string) => {
        if (!initialData) return;

        try {
            // Use RTK Query mutation to create annotation
            await createAnnotation({
                pdfId: initialData.pdfReference,
                pageNumber: initialData.pageNumber,
                selectedText: initialData.selectedText,
                noteContent,
                coordinates: initialData.coordinates,
            }).unwrap();

            // Navigate back to PDF viewer after successful save
            handleBackToPdf();
        } catch (error) {
            console.error('Failed to save annotation:', error);
            // Error handling is built into RTK Query and will show toast notifications
        }
    };

    const handleBackToPdf = () => {
        if (initialData) {
            // Create navigation parameters and hash
            const navigationParams = {
                page: initialData.pageNumber,
                x: initialData.coordinates.x,
                y: initialData.coordinates.y,
                width: initialData.coordinates.width,
                height: initialData.coordinates.height
            };
            const navigationHash = createNavigationHash(navigationParams);

            // Attempt cross-tab navigation with enhanced error handling
            const success = attemptCrossTabNavigation(navigationHash, navigationParams, {
                closeCurrentTab: true,
                fallbackUrl: '/dashboard/pdf-notes'
            });

            // If cross-tab communication failed, use current window fallback
            if (!success) {
                console.log('Cross-tab navigation failed, using current window fallback');
                router.push('/dashboard/pdf-notes' + navigationHash);
            }
        } else {
            // Handle case without location data
            console.log('No initial data available for navigation');

            // Try basic opener handling without navigation data
            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.focus();
                    setTimeout(() => {
                        try {
                            window.close();
                        } catch (closeError) {
                            console.warn('Could not close tab without data:', closeError);
                            router.push('/dashboard/pdf-notes');
                        }
                    }, 100);
                    return;
                } catch (error) {
                    console.warn('Could not handle opener window without data:', error);
                }
            }

            // Fallback: navigate to PDF notes page without location
            router.push('/dashboard/pdf-notes');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingState
                    title="Loading Editor"
                    description="Preparing your note editor..."
                />
            </div>
        );
    }

    if (!initialData) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-md p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Note Data Found</h1>
                        <p className="text-gray-600 mb-6">
                            Unable to load note data. This usually happens when the editor is opened directly
                            without selecting text from a PDF first.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={handleBackToPdf}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Back to PDF
                            </button>
                            <p className="text-xs text-gray-500">
                                Try selecting text in a PDF document first, then click "Create note"
                            </p>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.error('Note editor error:', error, errorInfo)
                annotationNotifications.createError(error.message)
            }}
        >
            <NoteEditor
                initialData={initialData}
                onSave={handleSave}
                onBackToPdf={handleBackToPdf}
                isNewNote={true}
            />
        </ErrorBoundary>
    );
}