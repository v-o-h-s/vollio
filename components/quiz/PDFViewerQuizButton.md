# PDFViewerQuizButton Component

## Overview

The `PDFViewerQuizButton` is a floating action button component that integrates AI-powered quiz generation directly into the PDF viewer experience. It provides context-aware quiz generation based on the current page, selected text, and document processing status.

## Features

### Context Awareness
- **Current Page Detection**: Automatically detects the current page number and suggests relevant page ranges
- **Selected Text Integration**: Uses selected text as focus context for quiz generation
- **Smart Page Ranges**: Intelligently calculates page ranges based on current position and total pages
- **Document Processing Status**: Checks and displays document processing status for RAG capabilities

### Quiz Generation Modes
1. **Quick Quiz**: Generates a 5-question quiz with minimal configuration
2. **Custom Quiz**: Allows detailed configuration of question count, difficulty, and types
3. **Full Generator**: Navigates to the complete quiz generation interface

### User Experience
- **Expandable Interface**: Compact by default, expandable for advanced options
- **Real-time Status**: Shows document processing progress and status
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Visual feedback during processing and generation

## Props

```typescript
interface PDFViewerQuizButtonProps {
  pdfDocument: PDFDocument;        // PDF document metadata
  currentPageNumber?: number;      // Current page (1-based)
  totalPages?: number;            // Total pages in document
  selectedText?: string;          // Currently selected text
  className?: string;             // Additional CSS classes
  onQuizGenerated?: (quizId: string) => void; // Callback when quiz is created
}
```

## Integration

### With PDFAnnotationViewer

```typescript
<PDFViewerQuizButton
  pdfDocument={currentPdfData}
  currentPageNumber={currentPageNumber + 1} // Convert to 1-based
  totalPages={totalPages}
  selectedText={selectedText}
  onQuizGenerated={(quizId) => {
    console.log("Quiz generated:", quizId);
  }}
/>
```

## Document Processing Flow

1. **Status Check**: Automatically checks if document is processed for RAG
2. **Processing Trigger**: Allows user to initiate document processing if needed
3. **Progress Monitoring**: Shows real-time processing progress
4. **Quiz Generation**: Enables quiz generation once processing is complete

## Context Extraction

The component intelligently extracts context from:
- Current page number and surrounding pages
- Selected text content (up to 200 characters for quick quiz)
- Document metadata and structure
- User-provided focus areas and notes

## API Integration

### Document Processing
- `POST /api/quiz/process-document` - Initiates document processing
- `GET /api/quiz/processing-status/[id]` - Checks processing status

### Quiz Generation
- `POST /api/quiz/generate-rag` - Generates quiz using RAG

## Styling

The component uses:
- Floating positioning (bottom-right corner)
- Card-based layout with backdrop blur
- Theme-aware styling with light/dark mode support
- Responsive design for different screen sizes

## Error Handling

- Network errors during status checks
- Document processing failures
- Quiz generation errors
- Invalid document states

## Performance Considerations

- Debounced status polling during processing
- Minimal re-renders with proper state management
- Lazy loading of advanced configuration options
- Efficient context extraction and caching

## Requirements Fulfilled

This component fulfills the following task requirements:

- ✅ **Context Awareness**: Detects current page and uses selected text
- ✅ **Auto-detection**: Automatically determines page ranges
- ✅ **Intelligent Context**: Extracts context from current view
- ✅ **Selected Text Integration**: Uses selected text for focused generation
- ✅ **Seamless Navigation**: Provides navigation to quiz interface
- ✅ **Processing Status**: Checks document processing status automatically

## Future Enhancements

- Visual preview of content that will be used for quiz generation
- Advanced page range selection with visual indicators
- Integration with annotation highlights for context
- Batch processing of multiple documents
- Quiz template suggestions based on document type