'use client';

import { useRouter, useParams } from 'next/navigation';
import { NoteEditor } from '@/components/note/NoteEditor';
import { useGetAnnotationsQuery, useUpdateAnnotationMutation } from '@/lib/store/apiSlice';
import { useAppSelector } from '@/lib/store/hooks';
import { createNavigationHash, attemptCrossTabNavigation } from '@/lib/utils/crossTabNavigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingState } from '@/components/ui/loading';
import { annotationNotifications } from '@/lib/utils/notifications';

interface Annotation {
    id: string;
    selectedText: string;
    noteContent: string;
    pageNumber: number;
    coordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    pdfId: string;
    createdAt: string;
    updatedAt?: string;
}

export default function EditNotePage() {
    const router = useRouter();
    const params = useParams();
    const annotationId = params.id as string;
    const currentPdf = useAppSelector((state) => state.annotations.currentPdf);

    // Use RTK Query to get all annotations and find the specific one
    const {
        data: annotations = [],
        isLoading,
        error: queryError
    } = useGetAnnotationsQuery(
        { pdfId: currentPdf?.id || '' },
        { skip: !currentPdf?.id }
    );

    const [updateAnnotation] = useUpdateAnnotationMutation();

    // Find the specific annotation by ID
    const annotation = annotations.find(ann => ann.id === annotationId) || null;
    const error = queryError ? 'Failed to load annotation' : (!annotation && !isLoading ? 'Annotation not found' : null);

    const handleSave = async (noteContent: string) => {
        if (!annotation) return;

        try {
            // Use RTK Query mutation to update annotation
            await updateAnnotation({
                id: annotationId,
                noteContent,
            }).unwrap();

            // Navigate back to PDF viewer after successful save
            handleBackToPdf();
        } catch (error) {
            console.error('Failed to update annotation:', error);
            // Error handling is built into RTK Query and will show toast notifications
        }
    };

    const handleBackToPdf = () => {
        if (annotation) {
            // Create navigation parameters and hash
            const navigationParams = {
                page: annotation.pageNumber,
                x: annotation.coordinates.x,
                y: annotation.coordinates.y,
                width: annotation.coordinates.width,
                height: annotation.coordinates.height
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
            // Handle case without annotation data
            console.log('No annotation data available for navigation');

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
                    title="Loading Note"
                    description="Retrieving your annotation and note content..."
                />
            </div>
        );
    }

    if (error || !annotation) {
        return (
            <ErrorBoundary>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-md p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Note Not Found</h1>
                        <p className="text-gray-600 mb-6">
                            {error || 'The requested note could not be found. It may have been deleted or you may not have permission to view it.'}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={handleBackToPdf}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Back to PDF
                            </button>
                            <p className="text-xs text-gray-500">
                                Note ID: {annotationId}
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
                annotationNotifications.updateError(error.message)
            }}
        >
            <NoteEditor
                initialData={{
                    selectedText: annotation.selectedText,
                    pdfReference: annotation.pdfId,
                    pageNumber: annotation.pageNumber,
                    coordinates: annotation.coordinates,
                }}
                existingContent={annotation.noteContent}
                onSave={handleSave}
                onBackToPdf={handleBackToPdf}
                isNewNote={false}
            />
        </ErrorBoundary>
    );
}