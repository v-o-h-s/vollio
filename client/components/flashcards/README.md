# Flashcard Components

This directory contains components for the flashcard learning system in the Noto application, providing AI-powered flashcard generation, study modes, and progress tracking.

## Overview

The flashcard system enables users to create, study, and manage flashcards for effective learning. It includes AI-powered generation from PDF documents, spaced repetition algorithms, and comprehensive progress tracking.

## Components

### Core Components

#### `AIFlashcardGenerator.tsx`
AI-powered flashcard generation component that creates flashcards from PDF documents or topics.

**Features:**
- **Multiple Generation Sources**: Generate from library PDFs, upload new documents, or enter topics
- **Advanced Settings**: Customizable number of cards, difficulty, focus areas, and card styles
- **Premium Integration**: Subscription-based access with upgrade prompts for free users
- **Progress Tracking**: Real-time generation progress with stage indicators
- **File Upload**: Drag-and-drop PDF upload with validation and processing

**Props:**
```typescript
interface AIFlashcardGeneratorProps {
  availableDocuments: PDFDocument[];
  onCardsGenerated: (cards: FlashcardItem[]) => void;
  isLoadingPDFs: boolean;
  pdfError: any;
  refetchPDFs: () => void;
}
```

**Usage:**
```typescript
<AIFlashcardGenerator
  availableDocuments={pdfData?.pdfs || []}
  onCardsGenerated={handleCardsGenerated}
  isLoadingPDFs={isLoadingPDFs}
  pdfError={pdfError}
  refetchPDFs={refetchPDFs}
/>
```

#### `FlashcardEditor.tsx`
Interactive editor for creating and modifying individual flashcards.

**Features:**
- **Rich Text Editing**: Support for formatted text on both front and back
- **Hint System**: Optional hints for learning assistance
- **Card Actions**: Duplicate, delete, and navigation controls
- **Auto-Save**: Automatic saving of card changes
- **Validation**: Real-time validation of card content

**Props:**
```typescript
interface FlashcardEditorProps {
  card: FlashcardItem;
  cardIndex: number;
  totalCards: number;
  onUpdate: (id: string, field: keyof FlashcardItem, value: string) => void;
  onDuplicate: (card: FlashcardItem) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  isSaved: boolean;
}
```

#### `FlashcardPreview.tsx`
Preview component for displaying flashcards in study mode or review.

**Features:**
- **Flip Animation**: Smooth card flip transitions between front and back
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Touch Support**: Touch-friendly interactions for mobile devices
- **Keyboard Navigation**: Arrow keys and spacebar for navigation
- **Accessibility**: Screen reader support and proper ARIA labels

**Props:**
```typescript
interface FlashcardPreviewProps {
  front: string;
  back: string;
  hint?: string;
  showControls?: boolean;
  onFlip?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}
```

#### `StudyMode.tsx`
Interactive study mode component with spaced repetition algorithms.

**Features:**
- **Spaced Repetition**: Intelligent scheduling based on performance
- **Difficulty Rating**: User feedback on card difficulty
- **Progress Tracking**: Real-time study session progress
- **Performance Analytics**: Detailed statistics and insights
- **Study Streaks**: Motivation through streak tracking

**Props:**
```typescript
interface StudyModeProps {
  flashcards: FlashcardItem[];
  onComplete: (results: StudyResults) => void;
  studySettings?: StudySettings;
}
```

#### `StudyResults.tsx`
Results summary component showing study session performance.

**Features:**
- **Performance Metrics**: Accuracy, time spent, cards reviewed
- **Visual Charts**: Progress visualization with charts and graphs
- **Recommendations**: Personalized study recommendations
- **Share Results**: Social sharing of achievements
- **Next Session**: Scheduling for next study session

**Props:**
```typescript
interface StudyResultsProps {
  results: StudyResults;
  onRestart: () => void;
  onContinue: () => void;
  onSave: () => void;
}
```

## Data Types

### Flashcard Item
```typescript
interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  createdAt?: string;
  lastReviewed?: string;
  reviewCount?: number;
  successRate?: number;
}
```

### Study Settings
```typescript
interface StudySettings {
  maxCards?: number;
  shuffleCards?: boolean;
  showHints?: boolean;
  timeLimit?: number;
  difficultyFilter?: 'Easy' | 'Medium' | 'Hard' | 'All';
  reviewMode?: 'new' | 'review' | 'mixed';
}
```

### Study Results
```typescript
interface StudyResults {
  totalCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  accuracy: number;
  cardsReviewed: FlashcardItem[];
  sessionDate: string;
}
```

### AI Generation Settings
```typescript
interface AIGenerationSettings {
  numberOfCards: number;
  difficulty: "Easy" | "Medium" | "Hard";
  focusAreas: string[];
  includeHints: boolean;
  cardStyle: "Definition" | "Question-Answer" | "Fill-in-blank" | "Mixed";
}
```

## API Integration

### Flashcard Generation
- **From Document**: `POST /api/flashcards/generate-from-document`
- **From Topic**: `POST /api/flashcards/generate-from-topic`
- **Authentication**: Required (Clerk JWT)
- **Rate Limiting**: Applied per user and subscription tier

### Flashcard Management
- **Create Deck**: `POST /api/flashcards/decks`
- **Update Deck**: `PUT /api/flashcards/decks/[id]`
- **Delete Deck**: `DELETE /api/flashcards/decks/[id]`
- **Study Session**: `POST /api/flashcards/study-sessions`

## Styling Guidelines

### Theme Support
All components support light/dark mode with theme-aware styling:
- Use semantic color tokens (`bg-muted`, `text-foreground`, `border-border`)
- Implement proper contrast ratios for accessibility
- Support system theme preference detection

### Component Styling
- **Cards**: 3D flip animations with perspective transforms
- **Buttons**: Gradient backgrounds for primary actions
- **Progress Indicators**: Animated progress bars with smooth transitions
- **Form Elements**: Consistent styling with validation states

### Responsive Design
- **Mobile-First**: Touch-friendly interfaces with appropriate spacing
- **Card Sizing**: Responsive card dimensions for different screen sizes
- **Typography**: Scalable text that maintains readability

## Usage Examples

### Basic Flashcard Creation
```typescript
import { FlashcardEditor } from '@/components/flashcards';

function CreateFlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  
  const handleUpdate = (id, field, value) => {
    setFlashcards(cards => 
      cards.map(card => 
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  return (
    <FlashcardEditor
      card={currentCard}
      cardIndex={currentIndex}
      totalCards={flashcards.length}
      onUpdate={handleUpdate}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      canDelete={flashcards.length > 1}
      isSaved={savedCards.has(currentCard.id)}
    />
  );
}
```

### AI Flashcard Generation
```typescript
import { AIFlashcardGenerator } from '@/components/flashcards';

function GenerateFlashcardsPage() {
  const { data: pdfData, isLoading, error, refetch } = useGetPDFsQuery();
  
  const handleCardsGenerated = (cards) => {
    setFlashcards(cards);
    toast.success(`Generated ${cards.length} flashcards!`);
  };

  return (
    <AIFlashcardGenerator
      availableDocuments={pdfData?.pdfs || []}
      onCardsGenerated={handleCardsGenerated}
      isLoadingPDFs={isLoading}
      pdfError={error}
      refetchPDFs={refetch}
    />
  );
}
```

### Study Mode Implementation
```typescript
import { StudyMode, StudyResults } from '@/components/flashcards';

function StudyPage() {
  const [studyResults, setStudyResults] = useState(null);
  
  const handleStudyComplete = (results) => {
    setStudyResults(results);
    // Save results to database
    saveStudySession(results);
  };

  if (studyResults) {
    return (
      <StudyResults
        results={studyResults}
        onRestart={() => setStudyResults(null)}
        onContinue={() => router.push('/dashboard/knowledge-test')}
        onSave={() => saveResults(studyResults)}
      />
    );
  }

  return (
    <StudyMode
      flashcards={flashcards}
      onComplete={handleStudyComplete}
      studySettings={studySettings}
    />
  );
}
```

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Components are lazy-loaded to reduce initial bundle size
- **Memoization**: Expensive calculations are memoized with React.memo
- **Virtual Scrolling**: Large flashcard collections use virtual scrolling
- **Image Optimization**: Flashcard images are optimized and cached

### Caching Strategy
- **RTK Query**: Automatic caching of flashcard data with intelligent invalidation
- **Local Storage**: Study progress and settings cached locally
- **Memory Management**: Proper cleanup of large flashcard collections

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
- Gesture support for card flipping and navigation
- Voice input compatibility for flashcard content
- Reduced motion support for animations

## Testing

### Component Tests
- Unit tests for individual component functionality
- Integration tests for component interactions
- Accessibility tests with axe-core
- Visual regression tests for card animations

### Study Algorithm Tests
- Spaced repetition algorithm validation
- Performance tracking accuracy
- Edge case handling for study sessions
- Cross-device synchronization testing

## Future Enhancements

### Planned Features
- **Collaborative Decks**: Share and collaborate on flashcard decks
- **Advanced Analytics**: Detailed learning analytics and insights
- **Gamification**: Achievements, leaderboards, and challenges
- **Offline Study**: Offline study mode with synchronization
- **Voice Recognition**: Voice-based flashcard interaction

### Performance Improvements
- **Background Sync**: Background synchronization of study progress
- **Predictive Loading**: Preload next cards for smoother experience
- **Edge Computing**: Deploy generation closer to users
- **Advanced Caching**: More sophisticated caching strategies

## Troubleshooting

### Common Issues
1. **Generation Failures**: Check document processing status and API limits
2. **Slow Performance**: Verify flashcard count and complexity
3. **Sync Issues**: Validate network connectivity and authentication
4. **Mobile Issues**: Test on actual devices for touch interactions

### Debug Tools
- Browser developer tools for component inspection
- Network tab for API call monitoring
- Console logging for state debugging
- Performance profiler for optimization

---

For more information about the flashcard system, see the main [documentation](../../docs) or the [API documentation](../../docs/API_DOCUMENTATION.md).