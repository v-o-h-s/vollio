# LMS Refetch Error Fixes

## Problem
The error "Cannot refetch a query that has not been started yet" was occurring because we were trying to manually refetch RTK Query queries that had `skip: true` conditions. When a query is skipped, RTK Query doesn't start the query, so calling `refetch()` on it throws an error.

## Root Cause
The issue was in several components where we were trying to manually call `refetch()` on conditional queries:

1. `EnhancedLMSImportModal.tsx` - `refetchConnection()` in `handleProviderSelect`
2. `LMSConnectionManager.tsx` - `refetchConnection()` in `handleRefresh`
3. `LMSSettingsPage.tsx` - `refetchConnection()` in refresh button

## Fixes Applied

### 1. Removed Manual Refetch Calls
Instead of manually calling `refetch()`, we now rely on RTK Query's automatic dependency tracking:

```typescript
// BEFORE (causing error)
const handleProviderSelect = async (providerId: string) => {
  setSelectedProvider(providerId);
  try {
    await refetchConnection(); // ❌ Error if query was skipped
  } catch (error) {
    console.error("Error checking connection:", error);
  }
};

// AFTER (fixed)
const handleProviderSelect = async (providerId: string) => {
  setSelectedProvider(providerId);
  // ✅ Connection status will be automatically fetched when selectedProvider changes
  // due to the RTK Query dependency, no need to manually refetch
};
```

### 2. Removed Unused Refetch References
Removed the `refetch` destructuring from RTK Query hooks where we weren't using them properly:

```typescript
// BEFORE
const {
  data: connectionStatus,
  isLoading: isCheckingConnection,
  refetch: refetchConnection, // ❌ Removed this
} = useCheckLMSConnectionQuery(selectedProvider || "", {
  skip: !selectedProvider,
});

// AFTER
const {
  data: connectionStatus,
  isLoading: isCheckingConnection,
} = useCheckLMSConnectionQuery(selectedProvider || "", {
  skip: !selectedProvider,
});
```

### 3. Improved Provider Status Handling
Instead of trying to fetch connection status in the providers endpoint (which created circular dependencies), we now handle provider status updates in the frontend:

```typescript
// Update provider status based on connection check
const updatedProviders = providers.map(provider => {
  if (provider.id === selectedProvider && connectionStatus !== undefined) {
    return {
      ...provider,
      status: connectionStatus.hasTokens ? "connected" as const : "disconnected" as const,
      lastConnected: connectionStatus.expiresAt,
    };
  }
  return provider;
});
```

### 4. Simplified Providers API Endpoint
Removed the internal connection status checking from the providers endpoint to avoid circular dependencies:

```typescript
// BEFORE - trying to check connection status internally
// Check Google Classroom connection status
try {
  const tokenResponse = await fetch(...);
  // Complex logic to update provider status
} catch (error) {
  // Error handling
}

// AFTER - simple provider list
// Note: Connection status will be checked separately by the frontend
// to avoid circular dependencies and improve performance
```

## How RTK Query Handles Dependencies

RTK Query automatically handles query dependencies through the `skip` parameter:

1. When `selectedProvider` changes from `null` to a value, the `skip` condition becomes `false`
2. RTK Query automatically starts the query and fetches the data
3. When `selectedProvider` changes to a different value, RTK Query automatically refetches with the new parameter
4. No manual `refetch()` calls are needed

## Benefits of This Approach

1. **No More Errors**: Eliminates the "Cannot refetch a query that has not been started yet" error
2. **Automatic Updates**: RTK Query handles all the dependency tracking automatically
3. **Better Performance**: Avoids unnecessary API calls and circular dependencies
4. **Cleaner Code**: Removes complex manual refetch logic
5. **Consistent Patterns**: Follows RTK Query best practices

## Testing
Created a debug panel (`/debug/lms`) to help test and verify the LMS integration functionality without errors.

## Files Modified
- `components/pdf/EnhancedLMSImportModal.tsx`
- `components/dashboard/LMSConnectionManager.tsx`
- `components/dashboard/LMSSettingsPage.tsx`
- `app/api/school-lms/providers/route.ts`
- `components/debug/LMSDebugPanel.tsx` (new)
- `app/debug/lms/page.tsx` (new)

The LMS integration should now work without the refetch errors while maintaining all the functionality.