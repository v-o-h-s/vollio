# Document View Feature

The Document View feature is the core of the Vollio application, providing a sophisticated interface for viewing PDFs, creating highlights, generating AI insights, and taking integrated notes.

## Architectural Overview

The feature follows a modular architecture using React Context for state management and specialized hooks for discrete logic.

### State Management: `ViewerContext`

The `ViewerContext` (`context/ViewerContext.tsx`) acts as the central hub, providing:
- **UI State**: Visibility of Voll-ai and Voll-notes panels.
- **Data Integration**: Combines logic from all specialized hooks.
- **Shared Actions**: Actions that bridge multiple domains, such as "Add to Note as Insight" which connects Highlights, AI responses, and Notes.

### Key Hooks

- **`useTextSelection`**: Manages interaction with the PDF highlighter. Handles text/area capture and triggers actions like "Explain" or "Add Tag".
- **`useVollAiLogic`**: Manages the Voll-ai chat state, message history, and interactions with the AI API.
- **`useVollNotesLogic`**: Handles note creation, tab management within the document view, and appending content to notes.
- **`useHighlightActions`**: Provides CRUD operations for PDF highlights via RTK Query.
- **`useViewerUI`**: Simple state for toggling side panels (Voll-ai/Voll-notes).
- **`useSummaryActions`**: Orchestrates AI document summarization and automatic note creation from summaries.

## Components

### Core Viewer: `BetterViewer.tsx`
The main entry point that integrates:
- `PdfLoader` & `PdfHighlighter`: From `react-pdf-highlighter-extended-plus`.
- `ViewerHeader`: Top navigation and toolbars.
- `ViewerFloatingActions`: Floating buttons to toggle sidebars.
- `HighlightContainer`: Orchestrates rendering of different highlight types.

### Highlights
Located in `components/highlight/`:
- **`StandardHighlight`**: Traditional text highlighting.
- **`InsightHighlight`**: Specialized purple highlights for AI-generated insights, featuring an interactive badge that opens the relevant note on click.
- **`TaggedHighlight`**: Highlights associated with specific user tags.
- **`ExpandableTip`**: The pill-shaped glassmorphism context menu that appears upon text selection.

### Side Panels
- **Voll-ai Chat**: Located in `components/Voll-ai/`, provides a chat interface to "talk" to the document.
- **Voll-notes**: Located in `components/notes/`, provides a tabbed note-taking interface integrated directly with document content.

## Features & Workflows

### 1. AI Insights
Users can select text and choose "Add to V-Notes". This:
1. Generates an AI explanation (if triggered via Voll-ai).
2. Creates an `InsightHighlight` in the PDF.
3. Automatically appends a specialized `insight` node to the user's notes.
4. Links the highlight to the note, allowing users to jump from the PDF to the note by clicking the highlight badge.

### 2. PDF Highlighting & Tagging
Supports both text and area (rectangular) selection. Highlights can be color-coded and tagged for organization via the `TagSidebar`.

### 3. Contextual Voll-ai
The Voll-ai can "Explain" selected text. The query is automatically populated with the selected text and document metadata, providing grounded AI responses.

### 4. Automatic Summarization
One-click generation of document summaries that are automatically saved as specialized "Summary" notes for quick reference.

## Data Types

- **`MyHighlight`**: Extension of the base highlight type to include Vollio-specific metadata like `style` (insight/tagged), `tags`, and `noteId`.
- **`Message`**: Defines the structure for Voll-ai chat messages, including metadata for document references.
