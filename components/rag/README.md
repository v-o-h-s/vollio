# RAG Components - Retrieval-Augmented Generation System

This directory contains components for the RAG (Retrieval-Augmented Generation) system that powers intelligent content analysis, semantic search, and AI-driven quiz generation in the Noto application.

## 🎯 System Overview

The RAG system provides:
- **Intelligent Content Retrieval**: Advanced vector search across document chunks with semantic understanding
- **Performance Monitoring**: Real-time system monitoring with user feedback collection and quality assurance
- **Feedback Integration**: User feedback collection for continuous system improvement and optimization
- **Search Interface**: Advanced search capabilities with relevance scoring and content filtering

## 🧩 Core Components

### Feedback & Monitoring

#### `SimpleFeedbackForm.tsx` ✅
User feedback collection component for RAG system performance monitoring and continuous improvement.

**Features:**
- Simple, intuitive feedback interface
- Rating system for content relevance and quality
- Text feedback for detailed user input
- Real-time feedback submission with error handling
- Integration with RAG monitoring system
- Mobile-responsive design with touch optimization

**Usage:**
```tsx
import { SimpleFeedbackForm } from '@/components/rag';

<SimpleFeedbackForm
  contentId="quiz-123"
  contentType="quiz_generation"
  onFeedbackSubmitted={(feedback) => console.log('Feedback:', feedback)}
  placeholder="How was the quality of the generated quiz?"
  showRating={true}
  showTextInput={true}
/>
```

**Props:**
- `contentId: string` - Unique identifier for the content being rated
- `contentType: 'quiz_generation' | 'content_search' | 'document_processing'` - Type of RAG operation
- `onFeedbackSubmitted?: (feedback: Feedback) => void` - Callback when feedback is submitted
- `placeholder?: string` - Placeholder text for feedback input
- `showRating?: boolean` - Whether to show star rating component
- `showTextInput?: boolean` - Whether to show text feedback input
- `className?: string` - Additional CSS classes

### Search Interface

#### `RAGSearchInterface.tsx` ✅
Advanced search interface for RAG-based content discovery with semantic search capabilities.

**Features:**
- Semantic search with natural language queries
- Advanced filtering options (content type, relevance threshold, date range)
- Real-time search suggestions and autocomplete
- Search history and saved searches
- Export search results functionality
- Mobile-optimized search experience

**Usage:**
```tsx
import { RAGSearchInterface } from '@/components/rag';

<RAGSearchInterface
  documentIds={selectedDocuments}
  onSearchResults={(results) => console.log('Results:', results)}
  onError={(error) => console.error('Search error:', error)}
  enableAdvancedFilters={true}
  showSearchHistory={true}
/>
```

### Results Display

#### `RAGResultsDisplay.tsx` ✅
Display component for RAG search results with relevance scoring and content preview.

**Features:**
- Relevance-scored result ranking
- Content preview with highlighting
- Source document attribution
- Expandable result details
- Export and sharing functionality
- Pagination for large result sets

**Usage:**
```tsx
import { RAGResultsDisplay } from '@/components/rag';

<RAGResultsDisplay
  results={searchResults}
  query={searchQuery}
  onResultSelect={(result) => console.log('Selected:', result)}
  showRelevanceScores={true}
  enablePreview={true}
  itemsPerPage={10}
/>
```

### Performance Monitoring

#### `RAGMonitoringDashboard.tsx` ✅
Comprehensive performance monitoring and analytics dashboard for RAG operations.

**Features:**
- Real-time performance metrics and analytics
- System health monitoring and alerts
- User feedback aggregation and analysis
- Quality assurance metrics and trends
- Performance optimization recommendations
- Historical data visualization and reporting

**Usage:**
```tsx
import { RAGMonitoringDashboard } from '@/components/rag';

<RAGMonitoringDashboard
  timeRange="7d"
  showRealTimeMetrics={true}
  enableAlerts={true}
  onMetricAlert={(alert) => console.log('Alert:', alert)}
/>
```

## 🔧 API Integration

### RAG System Endpoints

The RAG components integrate with several API endpoints for comprehensive functionality:

#### Feedback Collection
```
POST /api/rag/feedback
Body: {
  contentId: string,
  contentType: 'quiz_generation' | 'content_search' | 'document_processing',
  rating: number, // 1-5 stars
  textFeedback?: string,
  metadata?: {
    userId: string,
    sessionId: string,
    timestamp: string
  }
}
```

#### Performance Monitoring
```
GET /api/rag/monitoring
Query: {
  timeRange?: '1h' | '24h' | '7d' | '30d',
  metrics?: 'performance' | 'quality' | 'usage' | 'all',
  aggregation?: 'avg' | 'sum' | 'count'
}
```

#### Advanced Search
```
POST /api/quiz/advanced-search
Body: {
  query: string,
  documentIds?: string[],
  filters?: {
    contentType?: string,
    relevanceThreshold?: number,
    dateRange?: {
      start: string,
      end: string
    }
  },
  options?: {
    maxResults?: number,
    includeMetadata?: boolean,
    highlightMatches?: boolean
  }
}
```

### RTK Query Integration

The RAG components use RTK Query hooks for consistent API integration:

```tsx
// Feedback submission
const [submitFeedback, { isLoading: isSubmitting }] = useSubmitFeedbackMutation();

// Performance monitoring
const { data: metrics, isLoading } = useGetRAGMetricsQuery({
  timeRange: '24h',
  metrics: 'all'
});

// Advanced search
const [searchContent, { data: results, isLoading: isSearching }] = useAdvancedSearchMutation();
```

## 📊 Feedback System

### Feedback Types

#### Rating Feedback
- **Star Rating**: 1-5 star rating system for content quality
- **Thumbs Up/Down**: Simple binary feedback for quick responses
- **Relevance Score**: Specific relevance rating for search results
- **Quality Assessment**: Overall quality rating for generated content

#### Text Feedback
- **Detailed Comments**: Open-text feedback for specific improvements
- **Issue Reporting**: Structured feedback for problems and bugs
- **Feature Requests**: Suggestions for new features and enhancements
- **Usage Context**: Context about how the content was used

### Feedback Processing

#### Real-time Analysis
- **Sentiment Analysis**: Automatic sentiment detection in text feedback
- **Keyword Extraction**: Key themes and topics from user feedback
- **Trend Detection**: Identification of patterns and trends in feedback
- **Quality Metrics**: Aggregated quality scores and performance indicators

#### Continuous Improvement
- **Model Training**: Feedback used to improve RAG model performance
- **Content Optimization**: Iterative improvement of content generation
- **System Tuning**: Performance optimization based on user feedback
- **Feature Development**: New features based on user suggestions

## 🔍 Search Capabilities

### Semantic Search
- **Natural Language Queries**: Support for conversational search queries
- **Context Understanding**: Semantic understanding of search intent
- **Relevance Ranking**: Advanced relevance scoring and result ranking
- **Query Expansion**: Automatic query expansion for better results

### Advanced Filtering
- **Content Type Filtering**: Filter by document type, section, or content category
- **Date Range Filtering**: Search within specific time periods
- **Relevance Thresholds**: Minimum relevance score filtering
- **Source Document Filtering**: Search within specific documents or collections

### Search Features
- **Auto-complete**: Real-time search suggestions and completions
- **Search History**: Saved search history and quick re-search
- **Saved Searches**: Bookmark frequently used searches
- **Export Results**: Export search results in various formats

## 📈 Performance Monitoring

### Key Metrics

#### System Performance
- **Response Time**: Average response time for RAG operations
- **Throughput**: Number of operations processed per unit time
- **Error Rate**: Percentage of failed operations
- **Resource Usage**: CPU, memory, and storage utilization

#### Content Quality
- **Relevance Scores**: Average relevance scores for search results
- **User Satisfaction**: Aggregated user feedback and ratings
- **Content Accuracy**: Accuracy of generated content and answers
- **Diversity Metrics**: Content diversity and coverage analysis

#### Usage Analytics
- **User Engagement**: User interaction patterns and engagement metrics
- **Feature Usage**: Most and least used features and capabilities
- **Session Analytics**: User session duration and interaction patterns
- **Conversion Rates**: Success rates for different types of operations

### Monitoring Dashboard

#### Real-time Metrics
- **Live Performance Indicators**: Real-time system performance metrics
- **Active User Monitoring**: Current active users and operations
- **System Health Status**: Overall system health and status indicators
- **Alert Management**: Real-time alerts for performance issues

#### Historical Analysis
- **Trend Analysis**: Long-term trends in performance and usage
- **Comparative Analysis**: Performance comparison across time periods
- **Seasonal Patterns**: Identification of seasonal usage patterns
- **Growth Metrics**: User growth and system scaling metrics

## 🎨 Styling & Theming

### Theme Integration
- **Dark/Light Mode**: Complete theme support with automatic adaptation
- **Consistent Design**: Follows Noto application design system
- **Accessibility**: High contrast support and screen reader compatibility
- **Mobile Optimization**: Touch-friendly interfaces and responsive design

### Component Styling
- **Semantic Colors**: Theme-aware color tokens for consistent styling
- **Interactive States**: Hover, focus, and active states for all interactive elements
- **Loading States**: Skeleton screens and loading indicators
- **Error States**: User-friendly error displays with recovery options

## 🧪 Testing & Quality Assurance

### Test Coverage
- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: API integration and data flow validation
- **E2E Tests**: Complete RAG workflows and user interactions
- **Performance Tests**: Load testing and performance validation

### Quality Metrics
- **Code Coverage**: Comprehensive test coverage for all components
- **Performance Benchmarks**: Response time and throughput benchmarks
- **Accessibility Compliance**: WCAG 2.1 AA compliance verification
- **User Experience Testing**: Usability testing and feedback integration

## 🚀 Performance Optimization

### Efficient Processing
- **Caching**: Intelligent caching of search results and feedback data
- **Debouncing**: Debounced search input for reduced API calls
- **Lazy Loading**: On-demand loading of components and data
- **Memoization**: Cached expensive calculations and computations

### Scalability
- **Horizontal Scaling**: Support for distributed RAG processing
- **Load Balancing**: Efficient distribution of processing load
- **Resource Management**: Optimal resource allocation and usage
- **Performance Monitoring**: Continuous performance monitoring and optimization

## 📚 Usage Examples

### Basic Feedback Collection
```tsx
import { SimpleFeedbackForm } from '@/components/rag';

function QuizResultsPage({ quizId, results }) {
  const handleFeedback = (feedback) => {
    console.log('User feedback:', feedback);
    // Process feedback and update analytics
  };

  return (
    <div className="quiz-results">
      <h2>Quiz Results</h2>
      {/* Quiz results display */}
      
      <div className="feedback-section">
        <h3>How was this quiz?</h3>
        <SimpleFeedbackForm
          contentId={quizId}
          contentType="quiz_generation"
          onFeedbackSubmitted={handleFeedback}
          placeholder="Tell us about your experience with this quiz..."
          showRating={true}
          showTextInput={true}
        />
      </div>
    </div>
  );
}
```

### Advanced Search Interface
```tsx
import { RAGSearchInterface, RAGResultsDisplay } from '@/components/rag';

function ContentSearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query, filters) => {
    setIsSearching(true);
    try {
      const results = await searchContent({ query, filters });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-page">
      <RAGSearchInterface
        onSearchResults={handleSearch}
        enableAdvancedFilters={true}
        showSearchHistory={true}
      />
      
      {isSearching && <div>Searching...</div>}
      
      {searchResults.length > 0 && (
        <RAGResultsDisplay
          results={searchResults}
          showRelevanceScores={true}
          enablePreview={true}
        />
      )}
    </div>
  );
}
```

### Performance Monitoring Dashboard
```tsx
import { RAGMonitoringDashboard } from '@/components/rag';

function AdminDashboard() {
  const handleMetricAlert = (alert) => {
    console.log('Performance alert:', alert);
    // Handle performance alerts and notifications
  };

  return (
    <div className="admin-dashboard">
      <h1>RAG System Monitoring</h1>
      <RAGMonitoringDashboard
        timeRange="24h"
        showRealTimeMetrics={true}
        enableAlerts={true}
        onMetricAlert={handleMetricAlert}
      />
    </div>
  );
}
```

## 🔮 Future Enhancements

### Planned Features
- **Advanced Analytics**: Machine learning-powered analytics and insights
- **Predictive Monitoring**: Predictive performance monitoring and alerting
- **A/B Testing**: Built-in A/B testing for RAG system optimization
- **Multi-language Support**: Internationalization and localization support

### Performance Improvements
- **Edge Computing**: Edge-based RAG processing for reduced latency
- **Advanced Caching**: Intelligent caching with predictive prefetching
- **Real-time Collaboration**: Live collaborative search and feedback
- **Offline Support**: Offline RAG capabilities for mobile devices

## 🤝 Contributing

### Development Guidelines
- Follow established RAG system patterns and conventions
- Maintain comprehensive error handling and user feedback
- Include accessibility features and WCAG compliance
- Write unit tests for all new components and features
- Update documentation with changes and improvements

### Code Standards
- Use TypeScript strict mode for type safety
- Implement proper error boundaries and recovery mechanisms
- Follow mobile-first responsive design principles
- Use semantic HTML and ARIA labels for accessibility
- Optimize for performance and efficient resource usage

---

**Status**: ✅ Production Ready  
**Last Updated**: January 2025  
**Version**: 1.2.0

The RAG system components are fully implemented and production-ready, providing comprehensive retrieval-augmented generation capabilities with performance monitoring, user feedback collection, and advanced search functionality.