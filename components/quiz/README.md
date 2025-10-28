# Quiz Components

This directory contains components for the quiz management system in the Noto application, providing comprehensive quiz creation, management, and analytics functionality.

## Overview

The quiz system enables users to create, manage, and take interactive quizzes with advanced filtering, progress tracking, and document integration. It supports multiple question types, difficulty levels, and comprehensive analytics.

## Components

### Core Components

#### `DocumentSelectionTabs.tsx`
Advanced document selection interface for quiz creation with library browsing and upload functionality.

**Features:**
- **Library Tab**: Browse and select from uploaded PDFs with search and filtering
- **Upload Tab**: Drag & drop interface for new document uploads with progress tracking
- **Document Management**: Selected documents display with page selection and removal options
- **File Validation**: Comprehensive PDF validation with error handling and user feedback
- **Integration**: Seamless integration with PDF upload API and document processing pipeline

**Props:**
```typescript
interface DocumentSelectionTabsProps {
  availableDocuments?: PDFDocument[];
  selectedDocuments?: SelectedDocument[];
  onAddDocument?: (doc: PDFDocument) => void;
  onRemoveDocument?: (docId: string) => void;
  onUpdateDocumentPages?: (docId: string, pages: number[]) => void;
  onDocumentsUploaded?: () => void;
  isLoadingPDFs?: boolean;
  pdfError?: any;
  refetchPDFs?: () => void;
}
```

**Usage:**
```typescript
<DocumentSelectionTabs
  availableDocuments={pdfData?.pdfs || []}
  selectedDocuments={selectedDocs}
  onAddDocument={handleAddDocument}
  onRemoveDocument={handleRemoveDocument}
  onUpdateDocumentPages={handleUpdatePages}
  onDocumentsUploaded={refetchPDFs}
  isLoadingPDFs={isLoadingPDFs}
  pdfError={pdfError}
  refetchPDFs={refetchPDFs}
/>
```

#### `QuizConfiguration.tsx`
Configuration component for setting quiz parameters and generation options.

**Features:**
- **Question Settings**: Number of questions, difficulty level, question types
- **Time Limits**: Configurable time limits per question or total quiz
- **Scoring Options**: Different scoring methods and passing criteria
- **Advanced Options**: Randomization, hints, explanations, and feedback
- **Template Support**: Predefined quiz templates for common use cases

**Props:**
```typescript
interface QuizConfigurationProps {
  configuration: QuizConfig;
  onConfigurationChange: (config: QuizConfig) => void;
  availableTemplates?: QuizTemplate[];
  onTemplateSelect?: (template: QuizTemplate) => void;
}
```

#### `QuizStatsCard.tsx`
Statistics display component showing quiz performance and analytics.

**Features:**
- **Performance Metrics**: Accuracy, completion rate, average score
- **Visual Charts**: Progress visualization with charts and graphs
- **Trend Analysis**: Performance trends over time
- **Comparison Data**: Compare with other users or benchmarks
- **Export Options**: Export statistics in various formats

**Props:**
```typescript
interface QuizStatsCardProps {
  stats: QuizStatistics;
  timeRange?: 'week' | 'month' | 'year' | 'all';
  showComparison?: boolean;
  onExport?: (format: 'pdf' | 'csv' | 'json') => void;
}
```

#### `QuizCard.tsx`
Interactive quiz display card with metadata, progress tracking, and action buttons.

**Features:**
- **Quiz Metadata**: Title, description, question count, duration, difficulty
- **Progress Visualization**: Progress bars showing completion percentage
- **Action Buttons**: Start, continue, retake, bookmark, and share options
- **Tag System**: Categorized tags with overflow handling
- **Hover Effects**: Smooth transitions and interactive states

#### `QuizFilters.tsx`
Advanced filtering interface with category, difficulty, and search options.

**Features:**
- **Multi-Dimensional Filtering**: Category, difficulty, completion status, tags
- **Real-Time Search**: Instant search across quiz titles, descriptions, and content
- **Filter Combinations**: Multiple filters work together for precise discovery
- **Saved Filters**: Save and recall frequently used filter combinations
- **Clear Filters**: Easy reset of all applied filters

#### `QuizProgress.tsx`
Progress visualization components with completion rates and score tracking.

**Features:**
- **Progress Bars**: Animated progress indicators with smooth transitions
- **Completion Metrics**: Detailed completion statistics and milestones
- **Score Tracking**: Historical score tracking with trend analysis
- **Achievement Badges**: Visual achievements and progress milestones
- **Goal Setting**: Personal goal setting and progress monitoring

## Data Types

### Quiz Configuration
```typescript
interface QuizConfig {
  numberOfQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  questionTypes: QuestionType[];
  timeLimit?: number;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showHints: boolean;
  showExplanations: boolean;
  passingScore: number;
  allowRetakes: boolean;
}
```

### Quiz Statistics
```typescript
interface QuizStatistics {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  streakCount: number;
  categoryBreakdown: CategoryStats[];
  difficultyBreakdown: DifficultyStats[];
  recentActivity: QuizActivity[];
}
```

### Selected Document
```typescript
interface SelectedDocument {
  id: string;
  title: string;
  pageCount: number;
  selectedPages: number[];
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  extractedText?: string;
  metadata?: DocumentMetadata;
}
```

### Quiz Template
```typescript
interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  configuration: QuizConfig;
  category: string;
  isDefault: boolean;
  createdBy?: string;
  usageCount?: number;
}
```

## API Integration

### Quiz Management
- **Create Quiz**: `POST /api/quizzes`
- **Update Quiz**: `PUT /api/quizzes/[id]`
- **Delete Quiz**: `DELETE /api/quizzes/[id]`
- **List Quizzes**: `GET /api/quizzes`
- **Get Quiz**: `GET /api/quizzes/[id]`

### Quiz Generation
- **Generate from Documents**: `POST /api/quiz/generate`
- **Generate from Topic**: `POST /api/quiz/create`
- **Authentication**: Required (Clerk JWT)
- **Rate Limiting**: Applied per user and subscription tier

### Quiz Analytics
- **Submit Results**: `POST /api/quiz/results`
- **Get Statistics**: `GET /api/quiz/stats`
- **Export Data**: `GET /api/quiz/export`

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

### Color System
- **Difficulty Colors**: Green (Easy), Yellow (Medium), Red (Hard)
- **Category Colors**: Consistent color coding for different quiz categories
- **Status Colors**: Success, warning, error, and info states
- **Theme Tokens**: Use semantic tokens for maintainability

## Usage Examples

### Document Selection for Quiz Creation
```typescript
import { DocumentSelectionTabs } from '@/components/quiz';

function CreateQuizPage() {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const { data: pdfData, isLoading, error, refetch } = useGetPDFsQuery();
  
  const handleAddDocument = (doc) => {
    setSelectedDocs(prev => [...prev, {
      ...doc,
      selectedPages: Array.from({ length: doc.pageCount }, (_, i) => i + 1)
    }]);
  };

  return (
    <DocumentSelectionTabs
      availableDocuments={pdfData?.pdfs || []}
      selectedDocuments={selectedDocs}
      onAddDocument={handleAddDocument}
      onRemoveDocument={(id) => 
        setSelectedDocs(prev => prev.filter(doc => doc.id !== id))
      }
      onUpdateDocumentPages={(id, pages) =>
        setSelectedDocs(prev => prev.map(doc =>
          doc.id === id ? { ...doc, selectedPages: pages } : doc
        ))
      }
      onDocumentsUploaded={refetch}
      isLoadingPDFs={isLoading}
      pdfError={error}
      refetchPDFs={refetch}
    />
  );
}
```

### Quiz Statistics Display
```typescript
import { QuizStatsCard } from '@/components/quiz';

function QuizAnalyticsPage() {
  const { data: stats } = useGetQuizStatsQuery();
  
  const handleExport = (format) => {
    exportQuizStats(stats, format);
    toast.success(`Statistics exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <QuizStatsCard
        stats={stats}
        timeRange="month"
        showComparison={true}
        onExport={handleExport}
      />
    </div>
  );
}
```

### Quiz Configuration
```typescript
import { QuizConfiguration } from '@/components/quiz';

function QuizSetupPage() {
  const [config, setConfig] = useState(defaultQuizConfig);
  const [templates, setTemplates] = useState([]);
  
  const handleTemplateSelect = (template) => {
    setConfig(template.configuration);
    toast.success(`Applied template: ${template.name}`);
  };

  return (
    <QuizConfiguration
      configuration={config}
      onConfigurationChange={setConfig}
      availableTemplates={templates}
      onTemplateSelect={handleTemplateSelect}
    />
  );
}
```

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Components are lazy-loaded to reduce initial bundle size
- **Memoization**: Expensive calculations are memoized with React.memo
- **Virtual Scrolling**: Large quiz collections use virtual scrolling
- **Debounced Search**: Search inputs use debouncing to reduce API calls

### Caching Strategy
- **RTK Query**: Automatic caching of quiz data with intelligent invalidation
- **Local Storage**: User preferences and settings cached locally
- **Memory Management**: Proper cleanup of large quiz collections

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

### Quiz Logic Tests
- Quiz generation algorithm validation
- Scoring and analytics accuracy
- Document processing integration
- Cross-device synchronization testing

## Future Enhancements

### Planned Features
- **Collaborative Quizzes**: Share and collaborate on quiz creation
- **Advanced Question Types**: Interactive and multimedia questions
- **Adaptive Testing**: AI-powered adaptive difficulty adjustment
- **Gamification**: Achievements, leaderboards, and challenges
- **Integration APIs**: Connect with external learning management systems

### Performance Improvements
- **Background Processing**: Process large documents in the background
- **Predictive Loading**: Preload quiz content for smoother experience
- **Edge Computing**: Deploy generation closer to users
- **Advanced Caching**: More sophisticated caching strategies

## Troubleshooting

### Common Issues
1. **Generation Failures**: Check document processing status and API limits
2. **Slow Performance**: Verify document size and complexity
3. **Upload Issues**: Validate file format and size limits
4. **Mobile Issues**: Test on actual devices for touch interactions

### Debug Tools
- Browser developer tools for component inspection
- Network tab for API call monitoring
- Console logging for state debugging
- Performance profiler for optimization

---

For more information about the quiz system, see the main [documentation](../../docs) or the [API documentation](../../docs/API_DOCUMENTATION.md).