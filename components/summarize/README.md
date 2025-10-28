# Document Summarization Components

This directory contains components for AI-powered document summarization functionality in the Noto application.

## Overview

The summarization system provides users with intelligent document analysis and summary generation capabilities. It supports multiple document formats, various summary types, and customizable generation settings.

## Components

### Core Components

#### `AISummaryGenerator.tsx`
The main component for generating AI-powered summaries from selected documents.

**Features:**
- **Multiple Summary Types**: Brief, detailed, bullet points, and executive summaries
- **Customizable Settings**: Length, focus area, tone, and custom instructions
- **Progress Tracking**: Real-time generation progress with stage indicators
- **Template Integration**: Support for predefined summary templates
- **Error Handling**: Comprehensive error handling with retry mechanisms

**Props:**
```typescript
interface AISummaryGeneratorProps {
  selectedDocuments: SelectedDocument[];
  onGenerationComplete: () => void;
  selectedTemplate?: SummaryTemplate;
}
```

**Usage:**
```typescript
<AISummaryGenerator
  selectedDocuments={selectedDocs}
  onGenerationComplete={handleComplete}
  selectedTemplate={template}
/>
```

#### `SummaryHistory.tsx`
Component for managing and viewing previously generated summaries.

**Features:**
- **Summary List**: Paginated list of all user summaries
- **Advanced Filtering**: Filter by type, date, document count, and search
- **Sorting Options**: Sort by newest, oldest, title, or document count
- **Quick Actions**: View, copy, download, share, and delete summaries
- **Preview Modal**: Full summary preview with metadata display

**State Management:**
- Local state for filtering and sorting
- RTK Query integration for summary CRUD operations
- Real-time updates with cache invalidation

#### `SummaryPreview.tsx`
Modal component for displaying full summary content with metadata.

**Features:**
- **Full Content Display**: Complete summary text with formatting
- **Metadata Panel**: Creation date, document count, settings used
- **Action Buttons**: Copy, download, share, and edit options
- **Responsive Design**: Optimized for mobile and desktop viewing

#### `DocumentSelector.tsx`
Component for selecting documents to include in summary generation.

**Features:**
- **Document Library**: Browse uploaded PDFs with search and filtering
- **Upload Interface**: Drag-and-drop upload for new documents
- **Page Selection**: Select specific pages from documents
- **Batch Operations**: Select multiple documents for processing

#### `SummaryTemplates.tsx`
Component for managing and applying summary templates.

**Features:**
- **Template Library**: Predefined templates for common use cases
- **Custom Templates**: Create and save custom summary configurations
- **Template Preview**: Preview template settings before application
- **Template Sharing**: Share templates with other users (future feature)

## Data Types

### Summary Settings
```typescript
interface SummarySettings {
  summaryType: "brief" | "detailed" | "bullet-points" | "executive";
  length: "short" | "medium" | "long";
  focus: "key-points" | "methodology" | "conclusions" | "comprehensive";
  tone: "academic" | "professional" | "casual" | "technical";
}
```

### Summary History Item
```typescript
interface SummaryHistoryItem {
  id: string;
  title: string;
  documentCount: number;
  documentTitles: string[];
  summaryType: string;
  length: string;
  createdAt: string;
  wordCount: number;
  summary: string;
  settings: SummarySettings;
}
```

### Selected Document
```typescript
interface SelectedDocument {
  id: string;
  title: string;
  filename: string;
  uploadedAt: string;
  fileSize: number;
  pageCount?: number;
  selectedPages?: number[];
}
```

## API Integration

### Summary Generation
- **Endpoint**: `/api/summarize/generate`
- **Method**: POST
- **Authentication**: Required (Clerk JWT)
- **Rate Limiting**: Applied per user

### Summary Management
- **List Summaries**: `GET /api/summaries`
- **Get Summary**: `GET /api/summaries/[id]`
- **Delete Summary**: `DELETE /api/summaries/[id]`
- **Update Summary**: `PUT /api/summaries/[id]`

## Styling Guidelines

### Theme Support
All components support light/dark mode with theme-aware styling:
- Use semantic color tokens (`bg-muted`, `text-foreground`, `border-border`)
- Implement proper contrast ratios for accessibility
- Support system theme preference detection

### Component Styling
- **Cards**: Subtle borders with hover effects and shadow transitions
- **Progress Indicators**: Gradient progress bars with smooth animations
- **Buttons**: Consistent styling with loading states and disabled states
- **Form Elements**: Proper focus states and validation styling

### Responsive Design
- **Mobile-First**: Touch-friendly interfaces with appropriate spacing
- **Breakpoints**: Responsive layouts for tablet and desktop
- **Typography**: Scalable text that maintains readability across devices

## Usage Examples

### Basic Summary Generation
```typescript
import { AISummaryGenerator } from '@/components/summarize';

function SummarizePage() {
  const [selectedDocs, setSelectedDocs] = useState([]);
  
  const handleGenerationComplete = () => {
    // Handle completion
    toast.success('Summary generated successfully!');
  };

  return (
    <AISummaryGenerator
      selectedDocuments={selectedDocs}
      onGenerationComplete={handleGenerationComplete}
    />
  );
}
```

### Summary History Management
```typescript
import { SummaryHistory } from '@/components/summarize';

function HistoryPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Summary History</h1>
      <SummaryHistory />
    </div>
  );
}
```

### Document Selection
```typescript
import { DocumentSelector } from '@/components/summarize';

function DocumentSelectionPage() {
  const [selectedDocs, setSelectedDocs] = useState([]);

  return (
    <DocumentSelector
      selectedDocuments={selectedDocs}
      onDocumentsSelected={setSelectedDocs}
    />
  );
}
```

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Components are lazy-loaded to reduce initial bundle size
- **Memoization**: Expensive calculations are memoized with React.memo
- **Debounced Search**: Search inputs use debouncing to reduce API calls
- **Virtual Scrolling**: Large summary lists use virtual scrolling

### Caching Strategy
- **RTK Query**: Automatic caching of summary data with intelligent invalidation
- **Local Storage**: User preferences and settings cached locally
- **Memory Management**: Proper cleanup of large summary content

## Error Handling

### Error Boundaries
- Components are wrapped with error boundaries for graceful degradation
- Fallback UI provides meaningful error messages and recovery options
- Error logging for debugging and monitoring

### User Feedback
- Toast notifications for success and error states
- Loading indicators during generation and API calls
- Retry mechanisms for failed operations

## Accessibility

### WCAG Compliance
- Proper ARIA labels and semantic HTML structure
- Keyboard navigation support for all interactive elements
- Screen reader compatibility with descriptive text
- Sufficient color contrast ratios

### Mobile Accessibility
- Touch-friendly target sizes (minimum 44px)
- Gesture support for common actions
- Voice input compatibility
- Reduced motion support for animations

## Testing

### Component Tests
- Unit tests for individual component functionality
- Integration tests for component interactions
- Accessibility tests with axe-core
- Visual regression tests with Chromatic

### API Tests
- Mock API responses for reliable testing
- Error scenario testing
- Performance testing for large documents
- Rate limiting validation

## Future Enhancements

### Planned Features
- **Collaborative Summaries**: Share and collaborate on summaries
- **Advanced Templates**: More sophisticated template system
- **Export Options**: Export summaries to various formats (PDF, Word, etc.)
- **Integration APIs**: Connect with external services and tools
- **Analytics**: Summary usage analytics and insights

### Performance Improvements
- **Streaming Generation**: Real-time summary generation with streaming
- **Background Processing**: Process large documents in the background
- **Edge Computing**: Deploy generation closer to users
- **Caching Optimization**: More sophisticated caching strategies

## Troubleshooting

### Common Issues
1. **Generation Failures**: Check document processing status and API limits
2. **Slow Performance**: Verify document size and complexity
3. **Template Issues**: Validate template configuration and settings
4. **Mobile Issues**: Test on actual devices for touch interactions

### Debug Tools
- Browser developer tools for component inspection
- Network tab for API call monitoring
- Console logging for state debugging
- Performance profiler for optimization

---

For more information about the summarization system, see the main [documentation](../../docs) or the [API documentation](../../docs/API_DOCUMENTATION.md).e AI-powered document summarization feature in Noto.

## Components Overview

### Core Components

#### `AISummaryGenerator.tsx`
The main component for generating AI summaries from selected documents.

**Features:**
- Multiple summary types (brief, detailed, bullet-points, executive)
- Customizable settings (length, focus, tone)
- Template integration for predefined configurations
- Mock summary generation (no API calls)
- Progress tracking with visual feedback
- Export functionality (copy, download, share)

**Props:**
- `selectedDocuments`: Array of selected documents to summarize
- `onGenerationComplete`: Callback when generation is complete
- `selectedTemplate`: Optional template to apply settings

#### `SummaryHistory.tsx`
Displays and manages previously generated summaries.

**Features:**
- Search and filter summaries by type and content
- Sort by date, title, or document count
- Preview summaries with enhanced modal
- Export individual summaries
- Delete summaries with confirmation

#### `SummaryPreview.tsx`
Enhanced modal for viewing and editing summaries.

**Features:**
- Full-screen and windowed viewing modes
- Inline editing capabilities
- Export options (copy, download, share)
- Summary metadata display
- Source document information

#### `SummaryTemplates.tsx`
Predefined templates for different summary types and use cases.

**Features:**
- Category-based organization (academic, business, research, general)
- Template preview with settings
- Custom prompt integration
- Visual template selection

### Supporting Components

#### `index.ts`
Barrel export file for clean imports.

## Usage Examples

### Basic Summary Generation

```tsx
import { AISummaryGenerator } from "@/components/summarize";

function SummarizePage() {
  const [selectedDocs, setSelectedDocs] = useState([]);
  
  return (
    <AISummaryGenerator
      selectedDocuments={selectedDocs}
      onGenerationComplete={() => console.log("Done!")}
    />
  );
}
```

### With Templates

```tsx
import { SummaryTemplates, AISummaryGenerator } from "@/components/summarize";

function SummarizePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  return (
    <>
      <SummaryTemplates
        onTemplateSelect={setSelectedTemplate}
        selectedTemplateId={selectedTemplate?.id}
      />
      <AISummaryGenerator
        selectedDocuments={selectedDocs}
        selectedTemplate={selectedTemplate}
        onGenerationComplete={() => console.log("Done!")}
      />
    </>
  );
}
```

### Summary History

```tsx
import { SummaryHistory } from "@/components/summarize";

function HistoryPage() {
  return <SummaryHistory />;
}
```

## Template System

The template system provides predefined configurations for different summary types:

### Available Templates

1. **Academic Research Summary**
   - Type: Detailed
   - Focus: Methodology
   - Tone: Academic
   - Use case: Research papers, academic documents

2. **Executive Brief**
   - Type: Executive
   - Focus: Conclusions
   - Tone: Professional
   - Use case: Business reports, decision documents

3. **Literature Review**
   - Type: Detailed
   - Focus: Comprehensive
   - Tone: Academic
   - Use case: Multiple source analysis

4. **Key Insights & Takeaways**
   - Type: Bullet Points
   - Focus: Key Points
   - Tone: Professional
   - Use case: Quick reference, action items

5. **Project Overview**
   - Type: Detailed
   - Focus: Comprehensive
   - Tone: Professional
   - Use case: Project documentation

6. **Meeting Summary**
   - Type: Bullet Points
   - Focus: Key Points
   - Tone: Professional
   - Use case: Meeting notes, action items

7. **Technical Analysis**
   - Type: Detailed
   - Focus: Methodology
   - Tone: Technical
   - Use case: Technical documentation

8. **Market Analysis**
   - Type: Executive
   - Focus: Conclusions
   - Tone: Professional
   - Use case: Market research, business analysis

## Integration with Main App

### Page Integration

The summarization components integrate with the main dashboard through:

1. **Navigation**: FloatingSidebar provides quick actions
2. **Document Selection**: Uses DocumentSelectionTabs for file management
3. **Event System**: Custom events for sidebar integration
4. **Theme Support**: Full dark/light mode compatibility

### Event Handling

The summarize page listens for these custom events:

- `trigger-document-select`: Switch to document selection tab
- `trigger-summary-templates`: Switch to templates tab
- `trigger-summary-generate`: Switch to generation tab
- `trigger-summary-history`: Switch to history tab

### Keyboard Shortcuts

- `Ctrl+O`: Select documents
- `Ctrl+T`: Open templates
- `Ctrl+G`: Generate summary
- `Ctrl+F`: Search summaries

## Mock Data System

Since no API implementation is required, the components use mock data:

### Summary Generation
- Generates realistic summaries based on settings
- Includes document metadata and word counts
- Simulates processing stages with progress indicators

### History Data
- Provides sample summary history
- Includes various summary types and dates
- Supports all filtering and sorting operations

## Styling and Theming

All components follow the established design system:

- **Colors**: Semantic color tokens with theme support
- **Typography**: Consistent text sizing and hierarchy
- **Spacing**: Standard padding and margin patterns
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## Future Enhancements

Potential improvements for the summarization system:

1. **AI Integration**: Connect to actual AI services
2. **Collaborative Features**: Share and collaborate on summaries
3. **Advanced Templates**: User-created custom templates
4. **Export Formats**: PDF, Word, Markdown export options
5. **Analytics**: Summary usage and effectiveness metrics
6. **Version Control**: Track summary revisions and changes

## Dependencies

- React 19+ with hooks
- Tailwind CSS for styling
- Lucide React for icons
- date-fns for date formatting
- react-hot-toast for notifications
- shadcn/ui components

## Performance Considerations

- **Lazy Loading**: Components load efficiently
- **Memoization**: Prevents unnecessary re-renders
- **Virtual Scrolling**: For large summary lists
- **Debounced Search**: Optimized search performance
- **Progressive Enhancement**: Works without JavaScript