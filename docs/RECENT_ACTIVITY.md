# Recent Activity System Documentation

## Overview

The Recent Activity system in the Noto PDF Annotation App tracks and displays user interactions with PDF documents, providing a seamless way for users to continue where they left off. The system is designed with performance, privacy, and user experience in mind.

## Architecture

### Database Schema

#### User Activity Table (`user_activity`)

```sql
CREATE TABLE user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  pdf_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'upload', 'delete')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_accessed_at ON user_activity(accessed_at DESC);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);

-- Row Level Security
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own activity" ON user_activity
  FOR ALL USING (auth.uid()::text = user_id);
```

#### Activity Types

- **`view`**: User opened/accessed a PDF document
- **`upload`**: User uploaded a new PDF document
- **`delete`**: User deleted a PDF document

### Backend Implementation

#### Activity Recording (`app/api/pdfs/[id]/route.ts`)

**View Activity Recording:**

```typescript
async function recordViewActivity(
  supabaseClient: any,
  userId: string,
  pdfId: string
): Promise<void> {
  const { error } = await supabaseClient.from("user_activity").insert({
    user_id: userId,
    pdf_id: pdfId,
    activity_type: "view",
  });

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to record view activity: ${error.message}`,
      { operation: "record_view_activity", userId },
      { originalError: error, pdfId }
    );
  }
}
```

**Key Features:**

- Non-blocking activity recording (doesn't fail the main request)
- Comprehensive error handling with detailed context
- Automatic timestamp generation
- RLS-protected data insertion

#### Activity Fetching (`app/api/pdfs/route.ts`)

**Recent Activity Query:**

```typescript
async function fetchRecentActivity(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from("user_activity")
    .select(
      `
      *,
      pdfs (
        id,
        filename,
        storage_path
      )
    `
    )
    .eq("activity_type", "view")
    .order("accessed_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No recent activity found
    }

    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to fetch recent activity: ${error.message}`,
      { operation: "fetch_recent_activity" },
      error
    );
  }

  return data;
}
```

**Query Features:**

- Joins with PDFs table for complete information
- Filters for 'view' activities only
- Orders by most recent first
- Graceful handling of no-activity scenarios
- Single query for performance

#### Upload Activity Recording (`app/api/pdfs/upload/route.ts`)

```typescript
async function recordUploadActivity(
  supabaseClient: any,
  userId: string,
  pdfId: string
): Promise<void> {
  const { error } = await supabaseClient.from("user_activity").insert({
    user_id: userId,
    pdf_id: pdfId,
    activity_type: "upload",
  });

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to record upload activity: ${error.message}`,
      { operation: "record_activity", userId },
      { originalError: error, pdfId }
    );
  }
}
```

#### Delete Activity Recording (`app/api/pdfs/[id]/route.ts`)

```typescript
async function recordDeleteActivity(
  supabaseClient: any,
  userId: string,
  pdfId: string
): Promise<void> {
  const { error } = await supabaseClient.from("user_activity").insert({
    user_id: userId,
    pdf_id: pdfId,
    activity_type: "delete",
  });

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to record delete activity: ${error.message}`,
      { operation: "record_delete_activity", userId },
      { originalError: error, pdfId }
    );
  }
}
```

### Frontend Implementation

#### Recent Activity Display Component (`components/dashboard/RecentActivityDisplay.tsx`)

**Component Features:**

- Responsive design with compact and full modes
- Real-time data fetching via RTK Query
- Graceful error handling and loading states
- Click-to-continue functionality
- Human-readable time formatting

**Key Props:**

```typescript
interface RecentActivityDisplayProps {
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}
```

**Component States:**

1. **Loading State**: Shows skeleton loader
2. **Error State**: Shows error message with retry option
3. **No Activity State**: Shows empty state with call-to-action
4. **Active State**: Shows recent activity with continue button

#### Time Formatting

```typescript
const formatActivityTime = (date: string | Date): string => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInMinutes = Math.floor(
    (now.getTime() - activityDate.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;

  return activityDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
```

#### Activity Type Display

```typescript
const getActivityTypeText = (activityType: string): string => {
  switch (activityType) {
    case "view":
      return "Viewed";
    case "upload":
      return "Uploaded";
    case "delete":
      return "Deleted";
    default:
      return "Accessed";
  }
};
```

### RTK Query Integration

#### API Slice Configuration (`lib/store/apiSlice.ts`)

**getPDFs Query Enhancement:**

```typescript
getPDFs: builder.query<
  {
    pdfs: PDFDocument[];
    recentActivity?: UserActivity & { filename?: string; fileUrl?: string };
    totalCount: number;
  },
  void
>({
  query: () => "pdfs",
  transformResponse: (response: SupabasePDFListResponse) => {
    // ... PDF transformation logic

    // Transform recent activity if present
    let recentActivity:
      | (UserActivity & { filename?: string; fileUrl?: string })
      | undefined;
    if (data.recentActivity) {
      recentActivity = {
        id: "",
        userId: "",
        pdfId: data.recentActivity.pdfId,
        activityType: data.recentActivity.activityType,
        accessedAt: data.recentActivity.accessedAt,
        filename: data.recentActivity.filename,
        fileUrl: data.recentActivity.fileUrl,
      };
    }

    return {
      pdfs,
      recentActivity,
      totalCount: data.totalCount,
    };
  },
  // ... error handling and caching
});
```

### Dashboard Integration

#### Dashboard Implementation (`app/dashboard/page.tsx`)

**Recent Activity Usage:**

```typescript
const {
  data: pdfData,
  isLoading: isLoadingPDFs,
  error: pdfError,
  refetch,
} = useGetPDFsQuery();

const recentActivity = pdfData?.recentActivity;
```

**Display Integration:**

- Quick Actions card with compact recent activity
- Dedicated Recent Activity section with full display
- Automatic navigation to last viewed PDF
- Error handling with fallback UI

## Data Flow

### Activity Recording Flow

1. **User Action**: User performs an action (view, upload, delete)
2. **API Call**: Frontend makes API request to appropriate endpoint
3. **Main Operation**: Primary operation is executed (fetch PDF, upload file, etc.)
4. **Activity Recording**: Activity is recorded in `user_activity` table
5. **Error Handling**: If activity recording fails, error is logged but doesn't fail main operation
6. **Response**: Success response is returned to frontend

### Activity Fetching Flow

1. **Dashboard Load**: User navigates to dashboard
2. **API Request**: `useGetPDFsQuery` hook triggers API call
3. **Data Fetch**: Server fetches PDFs and recent activity in parallel
4. **Data Transform**: Response is transformed to frontend types
5. **Component Render**: Recent activity component displays data
6. **User Interaction**: User can click to continue where they left off

## Performance Optimizations

### Database Optimizations

1. **Indexes**: Strategic indexes on `user_id`, `accessed_at`, and `activity_type`
2. **Limit Queries**: Always limit activity queries to prevent large result sets
3. **Selective Fields**: Only fetch required fields in joins
4. **Connection Pooling**: Supabase handles connection pooling automatically

### Frontend Optimizations

1. **RTK Query Caching**: Automatic caching of activity data
2. **Conditional Rendering**: Only render activity when data exists
3. **Lazy Loading**: Activity component loads only when needed
4. **Memoization**: Time formatting and activity type functions are memoized

### Error Handling Optimizations

1. **Non-blocking Recording**: Activity recording doesn't block main operations
2. **Graceful Degradation**: App works even if activity system fails
3. **Retry Logic**: Automatic retry for transient failures
4. **Fallback UI**: Meaningful fallback when activity data unavailable

## Privacy and Security

### Row Level Security (RLS)

- Users can only access their own activity records
- Automatic filtering by authenticated user ID
- No cross-user data leakage possible

### Data Retention

- Activity records are kept indefinitely for user convenience
- Cascade deletion when PDFs are deleted
- No sensitive information stored in activity records

### Privacy Considerations

- Only tracks document access, not content interaction
- No tracking of reading progress or annotations viewed
- User can see their own activity history
- No analytics or tracking beyond basic usage

## Monitoring and Analytics

### Activity Metrics

- Track activity recording success rates
- Monitor query performance
- Measure user engagement with recent activity feature
- Identify popular documents and usage patterns

### Error Monitoring

- Log activity recording failures
- Monitor database query performance
- Track frontend component error rates
- Alert on high failure rates

## Future Enhancements

### Planned Features

1. **Reading Progress**: Track how far users read in documents
2. **Activity History**: Show full activity timeline
3. **Cross-Device Sync**: Sync activity across devices
4. **Smart Recommendations**: Suggest documents based on activity
5. **Activity Search**: Search through activity history

### Technical Improvements

1. **Batch Recording**: Batch multiple activities for performance
2. **Real-time Updates**: WebSocket-based real-time activity updates
3. **Activity Analytics**: Detailed usage analytics dashboard
4. **Data Archiving**: Archive old activity data for performance
5. **Activity Export**: Allow users to export their activity data

## Troubleshooting

### Common Issues

1. **Activity Not Recording**: Check authentication and RLS policies
2. **Stale Activity Data**: Verify cache invalidation in RTK Query
3. **Performance Issues**: Check database indexes and query optimization
4. **Missing Activity**: Ensure activity recording isn't being blocked by errors

### Debug Tools

1. **Supabase Dashboard**: Monitor database queries and performance
2. **Browser DevTools**: Check network requests and component state
3. **Server Logs**: Review activity recording success/failure logs
4. **RTK Query DevTools**: Monitor cache state and query lifecycle

### Performance Monitoring

1. **Query Performance**: Monitor activity query execution times
2. **Component Rendering**: Track recent activity component render times
3. **API Response Times**: Monitor activity-related API endpoint performance
4. **Error Rates**: Track activity recording and fetching error rates
