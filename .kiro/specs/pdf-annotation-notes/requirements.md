# Requirements Document

## Introduction

This feature enables users to upload PDF documents, annotate them by selecting text spans, and create rich-text notes that are linked back to specific locations in the PDF. The system provides an intuitive hover-to-annotate interface with a separate TipTap editor for note creation, and displays annotated text with visual highlights and preview tooltips.

## Requirements

### Requirement 1

**User Story:** As a user, I want to upload and view PDF documents in the browser, so that I can read and annotate them without needing external software.

#### Acceptance Criteria

1. WHEN the user clicks an "Upload PDF" button in the toolbar THEN the system SHALL open a file selection dialog
2. WHEN the user selects a PDF file THEN the system SHALL render the PDF in a full-width viewer pane using URL.createObjectURL
3. WHEN the PDF is rendered THEN the system SHALL display all pages with proper text layer support for text selection
4. WHEN the PDF fails to load THEN the system SHALL display an appropriate error message

### Requirement 2

**User Story:** As a user, I want to hover over text in the PDF to see annotation options, so that I can quickly create notes for specific text spans.

#### Acceptance Criteria

1. WHEN the user hovers over any rendered text span THEN the system SHALL show a small tooltip with a "Create note" button
2. WHEN the tooltip is displayed THEN it SHALL be styled with blue accent color (#3B82F6) and subtle drop shadow
3. WHEN the user moves the cursor away from the text THEN the tooltip SHALL fade out after 200ms
4. WHEN the tooltip is near the viewport edge THEN the system SHALL reposition it to remain visible
5. WHEN the user clicks "Create note" THEN the system SHALL capture the exact text, page number, and bounding rectangle coordinates

### Requirement 3

**User Story:** As a user, I want to create rich-text notes in a dedicated editor, so that I can write detailed annotations with formatting options.

#### Acceptance Criteria

1. WHEN the user clicks "Create note" THEN the system SHALL open a new browser tab with the TipTap editor at route /note/new
2. WHEN the note editor loads THEN it SHALL pre-populate with the selected text and PDF reference information
3. WHEN the editor loads THEN it SHALL insert a hyperlink placeholder linking back to the specific PDF location (#pdf?page=3&x=120&y=450&width=200&height=18)
4. WHEN the user writes note content THEN the system SHALL provide rich-text formatting options via TipTap
5. WHEN the user clicks "Save & Close" THEN the system SHALL save the note and return to the PDF tab
6. WHEN the editor is displayed THEN it SHALL include a "Back to PDF" link for navigation

### Requirement 4

**User Story:** As a user, I want to see visual indicators for annotated text and preview note content, so that I can quickly identify and review my annotations.

#### Acceptance Criteria

1. WHEN a note is saved THEN the system SHALL re-render the PDF with the annotated text span styled with blue underline and background highlight
2. WHEN the user hovers over annotated text THEN the system SHALL show a floating preview card with the first ~100 characters of the note
3. WHEN the preview card is displayed THEN it SHALL include smooth fade-in animation using transition-opacity duration-200
4. WHEN the user clicks on the preview card THEN the system SHALL open the full note in a new tab at /note/[id] for viewing and editing
5. WHEN multiple annotations exist on the same page THEN each SHALL be visually distinct and independently interactive

### Requirement 5

**User Story:** As a user, I want smooth animations and responsive behavior, so that the annotation interface feels polished and works well on different devices.

#### Acceptance Criteria

1. WHEN tooltips and preview cards appear THEN they SHALL use transition-opacity duration-200 for smooth fade effects
2. WHEN text highlights are applied THEN they SHALL use transition-all for smooth underline and background color changes
3. WHEN the interface is used on mobile devices THEN tapping on text SHALL show "Create note" as a small full-screen modal instead of tooltip
4. WHEN tooltips or preview cards would extend beyond viewport boundaries THEN the system SHALL automatically reposition them
5. WHEN animations are triggered THEN they SHALL not interfere with text selection or PDF scrolling performance

### Requirement 6

**User Story:** As a user, I want the system to securely store and retrieve my annotations in a database, so that my notes persist across browser sessions and are protected.

#### Acceptance Criteria

1. WHEN an annotation is created THEN the system SHALL store it in a database with page number, selected text, bounding rectangle coordinates, note content, and PDF reference
2. WHEN the PDF is reloaded THEN the system SHALL query the database to restore all previously created annotations with their visual styling
3. WHEN the user navigates between PDF pages THEN the system SHALL fetch and display relevant annotations for each page from the database
4. WHEN annotation data is stored THEN it SHALL include sufficient information to recreate the exact text selection and positioning
5. WHEN implementing the prototype THEN the system SHALL set up database schema and API endpoints without requiring full database integration
6. IF the PDF is re-uploaded THEN the system SHALL attempt to match existing annotations from the database to similar text spans where possible
