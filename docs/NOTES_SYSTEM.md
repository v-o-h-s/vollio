# Notes System Documentation

## Overview

The Noto notes system provides complete standalone note-taking functionality with rich text editing, internal auto-save capabilities using RTK Query, and seamless integration with the PDF annotation workflow. Built with TipTap editor, simplified auto-save architecture, and full CRUD API implementation.

## Features

### Core Functionality
- **Rich Text Editing**: TipTap-based NotionEditor with full formatting capabilities
- **Internal Auto-Save**: Editor-managed auto-save using RTK Query mutations with debounced updates
- **Simplified Architecture**: Auto-save handled internally without complex parent callbacks
- **Keyboard Shortcuts**: Ctrl/Cmd+S for manual save, Escape for navigation
- **Word Count**: Real-time word count display for better writing awareness
- **Mobile Responsive**: Touch-friendly interface with adaptive layouts

### Auto-Save Architecture
- **RTK Query Integration**: All save operations use RTK Query mutations for consistency
- **Editor-Internal**: Auto-save logic contained within NotionEditor components
- **Automatic Note Creation**: Creates new notes automatically when content is added
- **Title Extraction**: Automatically extracts titles from editor content
- **Status Tracking**: Visual feedback for saving, saved, and error states
- **Error Recovery**: Automatic retry mechanisms and user-friendly error messages

## Technical Implementation

### Frontend Components

#### NewNotePage (`app/dashboard/notes/new/page.tsx`)
- Simplified note creation interface with minimal props
- Real-time word count and save status display
- Keyboard shortcuts and navigation handling
- Comprehensive error handling and recovery

#### NotionEditor (`components/editor/NotionEditor.tsx`)
- TipTap-based rich text editor with full formatting
- **Internal auto-save using RTK Query mutations**
- **Simplified API without complex callback props**
- **Automatic note creation and title extraction**
- Floating toolbars and slash commands for enhanced UX
- Mobile-responsive design with touch-friendly interactions

#### useAutoSave Hook (`hooks/use-auto-save.ts`)
- Integrated within NotionEditor for internal auto-save management
- RTK Query mutation integration for create/update operations
- Status tracking (idle, typing, saving, saved, error)
- Error handling with retry mechanisms
- Debounced updates to prevent excessive API calls

### API Endpoints ✅ IMPLEMENTED

#### GET /api/notes
List all notes for the authenticated user with automatic RLS filtering.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user_id",
      "title": "Note Title",
      "content": { "type": "doc", "content": [...] },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z",
      "isDeleted": false
    }
  ]
}
```

#### POST /api/notes
Create a new note with title and rich text content.

**Request Body:**
```json
{
  "title": "Note Title",
  "content": {
    "type": "doc",
    "content": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user_id",
    "title": "Note Title",
    "content": { "type": "doc", "content": [...] },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "isDeleted": false
  }
}
```

#### PUT /api/notes/[id] (To Be Implemented)
Update an existing note with new content.

#### DELETE /api/notes/[id] (To Be Implemented)
Delete a specific note by ID.

### Database Schema ✅ IMPLEMENTED

The notes table is fully implemented with RLS policies and optimized indexes:

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content JSONB NOT NULL,
  pdf_annotation_id UUID REFERENCES annotations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- RLS policies for user isolation (implemented)
CREATE POLICY "Users can only access their own notes" ON notes
FOR ALL USING (user_id = auth.jwt() ->> 'sub');

-- Indexes for performance (implemented)
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_pdf_annotation ON notes(pdf_annotation_id);
```

## User Experience

### Note Creation Flow
1. **Navigation**: User clicks "New Note" from dashboard
2. **Editor Load**: NotionEditor loads with auto-focus and placeholder
3. **Content Entry**: User starts typing, triggering auto-save after 1 second
4. **Status Feedback**: Visual indicators show save status (saving/saved/error)
5. **Navigation**: User can navigate away safely after content is saved

### Auto-Save Behavior
- **Initial Save**: Creates new note on first content entry
- **Subsequent Saves**: Updates existing note with new content
- **Error Handling**: Shows error status and provides retry options
- **Manual Save**: Ctrl/Cmd+S triggers immediate save
- **Status Display**: Badge shows current save status and last saved time

### Mobile Experience
- **Touch-Friendly**: Large touch targets and responsive design
- **Adaptive Layout**: Optimized for various screen sizes
- **Gesture Support**: Standard touch gestures for text selection and editing
- **Status Indicators**: Mobile-optimized save status display

## Integration Points

### Dashboard Integration
- **Note Listing**: Display all user notes with recent activity
- **Quick Actions**: Create, edit, delete notes from dashboard
- **Search Integration**: Full-text search across note content
- **Recent Activity**: Track note creation, editing, and access

### PDF Integration (Future)
- **Linked Notes**: Associate notes with specific PDF documents
- **Annotation Notes**: Convert PDF annotations to standalone notes
- **Cross-References**: Link between notes and PDF annotations
- **Unified Search**: Search across PDFs, annotations, and notes

## Development Guidelines

### Component Structure
```typescript
// Note component example
interface NoteProps {
  noteId?: string;
  initialContent?: any;
  onSave?: (content: any) => Promise<void>;
}

export function NoteEditor({ noteId, initialContent, onSave }: NoteProps) {
  const { updateContent, status } = useAutoSave({
    onSave: handleAutoSave,
    delay: 1000,
    enabled: true
  });
  
  // Implementation
}
```

### Auto-Save Integration
```typescript
// Auto-save hook usage
const { status, lastSaved, error, updateContent } = useAutoSave({
  onSave: async (content) => {
    if (!noteId) {
      // Create new note
      const result = await createNote({ title, content });
      setNoteId(result.id);
    } else {
      // Update existing note
      await updateNote({ id: noteId, title, content });
    }
  },
  delay: 1000,
  enabled: true
});
```

### Error Handling
```typescript
// Comprehensive error handling
const handleAutoSave = useCallback(async (content: any) => {
  try {
    await saveNote(content);
  } catch (error) {
    // Error is handled by useAutoSave hook
    // User sees error status and retry options
    throw error;
  }
}, [saveNote]);
```

## Testing Strategy

### Unit Tests
- Auto-save hook functionality and debouncing
- Content extraction and title generation
- Error handling and recovery mechanisms
- Status tracking and state management

### Integration Tests
- Note creation and update workflows
- Auto-save integration with API endpoints
- Error recovery and retry mechanisms
- Mobile responsiveness and touch interactions

### E2E Tests
- Complete note creation and editing workflow
- Auto-save functionality across browser sessions
- Navigation and unsaved changes handling
- Mobile note-taking experience

## Performance Considerations

### Optimization Strategies
- **Debounced Auto-Save**: Prevents excessive API calls during typing
- **Content Memoization**: Efficient content change detection
- **Lazy Loading**: Load editor components on demand
- **Efficient Rendering**: Optimized TipTap editor configuration

### Memory Management
- **Editor Cleanup**: Proper cleanup of TipTap editor instances
- **Event Listeners**: Remove event listeners on component unmount
- **Auto-Save Cleanup**: Clear auto-save timers and handlers
- **Content Optimization**: Efficient storage of rich text content

## Security Considerations

### Data Protection
- **User Isolation**: RLS policies ensure users only access their notes
- **Content Sanitization**: Sanitize rich text content before storage
- **Input Validation**: Validate note titles and content structure
- **Rate Limiting**: Prevent abuse of auto-save functionality

### Authentication
- **JWT Integration**: Use Clerk JWT tokens for API authentication
- **Session Management**: Handle authentication state changes
- **Secure Storage**: Store notes securely with proper encryption
- **Access Control**: Implement proper authorization checks

## Future Enhancements

### Advanced Features
- **Collaborative Editing**: Real-time multi-user note editing
- **Version History**: Track and restore previous note versions
- **Templates**: Pre-defined note templates for common use cases
- **Tags and Categories**: Organize notes with tags and folders

### Integration Features
- **PDF Linking**: Link notes to specific PDF pages or annotations
- **Export Options**: Export notes to various formats (Markdown, PDF, etc.)
- **Import Functionality**: Import notes from other applications
- **API Integration**: Connect with external note-taking services

### AI Features
- **Smart Suggestions**: AI-powered writing suggestions and improvements
- **Content Analysis**: Automatic tagging and categorization
- **Search Enhancement**: Semantic search across note content
- **Summary Generation**: Automatic note summaries and key points

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Core functionality complete - Frontend with auto-save ✅, Basic API endpoints ✅, Database schema ✅. Advanced features (update/delete endpoints, enhanced UI) in development.