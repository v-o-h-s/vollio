# Notification System Documentation

The Noto application implements a comprehensive notification system using **react-hot-toast** as the primary notification library, with custom utilities and components for different types of user feedback.

## 🏗️ Architecture Overview

### Core Components
- **react-hot-toast**: Primary toast notification library
- **Custom Notification Utilities**: Feature-specific notification helpers
- **Error Notification System**: Advanced error display with recovery actions
- **Auto-Save Status System**: Real-time save status indicators

### Integration Points
- **RTK Query**: Automatic notifications for API operations
- **Dashboard Layout**: Global toast container configuration
- **Error Boundaries**: Comprehensive error notification handling
- **Auto-Save System**: Real-time status updates and user feedback

## 📋 Notification Types

### 1. Toast Notifications (react-hot-toast)

#### Basic Toast Types
```typescript
import toast from "react-hot-toast";

// Success notifications
toast.success("Operation completed successfully!");

// Error notifications  
toast.error("Something went wrong!");

// Loading notifications
const loadingToast = toast.loading("Processing...");
toast.success("Done!", { id: loadingToast }); // Replace loading toast

// Custom notifications
toast("Custom message", {
  icon: "🎉",
  duration: 4000,
  position: "top-right"
});
```

#### Configuration
Located in `app/dashboard/layout.tsx`:
```typescript
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    className: "toast-solid-bg",
    style: {
      background: "#ffffff",
      color: "#000000",
      border: "1px solid #e5e7eb",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    success: {
      style: {
        background: "#22c55e",
        color: "#ffffff",
      },
    },
    error: {
      style: {
        background: "#ef4444",
        color: "#ffffff",
      },
    },
  }}
/>
```

### 2. Feature-Specific Notifications

#### PDF Operations (`lib/utils/notifications.ts`)
```typescript
import { pdfNotifications } from "@/lib/utils/notifications";

// Upload notifications
pdfNotifications.uploadStart("document.pdf");
pdfNotifications.uploadSuccess("document.pdf");
pdfNotifications.uploadError("File too large");

// File validation
pdfNotifications.fileSizeError("52MB");
pdfNotifications.fileTypeError();

// Operations
pdfNotifications.deleteSuccess();
pdfNotifications.renameSuccess();
```

#### Note Operations (`lib/utils/note-notifications.ts`)
```typescript
import { noteNotifications } from "@/lib/utils/note-notifications";

// CRUD operations
noteNotifications.createSuccess("My Note");
noteNotifications.updateSuccess("My Note");
noteNotifications.deleteSuccess("My Note");

// Auto-save feedback
noteNotifications.autoSaveSuccess();
noteNotifications.autoSaveError();

// Cross-tab synchronization
noteNotifications.syncUpdate("My Note");

// Network status
noteNotifications.offline();
noteNotifications.online();
```

#### Annotation Operations
```typescript
import { annotationNotifications } from "@/lib/utils/notifications";

annotationNotifications.createSuccess();
annotationNotifications.updateSuccess();
annotationNotifications.deleteSuccess();
annotationNotifications.loadingError("Failed to load annotations");
```

#### Navigation Operations
```typescript
import { navigationNotifications } from "@/lib/utils/notifications";

navigationNotifications.crossTabSuccess();
navigationNotifications.crossTabFailed();
navigationNotifications.pdfNotFound();
```

### 3. Advanced Error Notifications

#### Error Notification Component (`components/ui/error-notification.tsx`)
Advanced error display with:
- **Severity-based styling** (Critical, High, Medium, Low)
- **Recovery actions** with retry functionality
- **Context information** (component, action, file details)
- **Auto-dismiss** for low-severity errors
- **Support contact** for critical errors

```typescript
import { ErrorNotification, useErrorNotification } from "@/components/ui/error-notification";

const { showError, dismissError } = useErrorNotification();

// Show error with recovery actions
showError(
  appError,
  { 
    persistent: true, 
    showDetails: true 
  },
  () => retryOperation(), // Retry function
  [
    { label: "Reload Page", action: () => window.location.reload(), primary: true },
    { label: "Go Back", action: () => router.back() }
  ]
);
```

#### Error Severity Levels
- **CRITICAL**: Red styling, persistent, support contact
- **HIGH**: Red styling, persistent, support contact  
- **MEDIUM**: Orange styling, manual dismiss
- **LOW**: Blue styling, auto-dismiss after 5 seconds

### 4. Auto-Save Status System

#### Components
- **`FloatingAutoSaveStatus`**: Bottom-right floating status indicator
- **`AutoSaveStatus`**: Inline status badge for toolbars
- **`AutoSaveStatusProvider`**: Context provider for status management

#### Status Types
```typescript
type AutoSaveStatus = "idle" | "typing" | "saving" | "saved" | "error";
```

#### Usage
```typescript
import { useAutoSaveStatus } from "@/components/dashboard/AutoSaveStatusProvider";

const { status, lastSaved, error, updateStatus } = useAutoSaveStatus();

// Update status from editor
updateStatus("saving", null, null, false);
updateStatus("saved", new Date(), null, false);
updateStatus("error", null, "Network error", false);
```

#### Visual Indicators
- **Idle**: Clock icon, "Ready"
- **Typing**: Clock icon, "Unsaved changes"  
- **Saving**: Spinning loader, "Saving..."
- **Saved**: Check icon, "Saved just now" / "Saved 2m ago"
- **Error**: Alert icon, error message

## 🎨 Styling and Theming

### Toast Styling
- **Solid backgrounds** with proper contrast
- **Consistent border radius** (8px)
- **Shadow effects** for depth
- **Color-coded** by notification type
- **Responsive positioning**

### Status Indicators
- **Badge components** with variant styling
- **Icon + text** combinations
- **Color-coded** by status (green=saved, blue=saving, red=error, orange=typing)
- **Smooth transitions** and animations

## 🔧 Implementation Patterns

### 1. RTK Query Integration
Automatic notifications in API slice operations:
```typescript
// In apiSlice.ts
async onQueryStarted(fileName, { queryFulfilled }) {
  try {
    const result = await queryFulfilled;
    pdfNotifications.uploadSuccess(fileName);
  } catch (error: any) {
    const appError = error.error as AppError;
    const message = appError?.userMessage || "Failed to upload PDF";
    pdfNotifications.uploadError(message);
  }
}
```

### 2. Promise-Based Notifications
Utility for async operations:
```typescript
import { notifyPromise } from "@/lib/utils/notifications";

const result = await notifyPromise(
  uploadFile(file),
  {
    loading: "Uploading file...",
    success: (data) => `${data.filename} uploaded successfully!`,
    error: (error) => `Upload failed: ${error.message}`
  }
);
```

### 3. Component-Level Error Handling
```typescript
// In components
try {
  await deleteNote(noteId).unwrap();
  toast.success(`"${noteTitle}" has been deleted`);
} catch (error) {
  toast.error(
    error instanceof Error 
      ? error.message 
      : "Failed to delete note. Please try again."
  );
}
```

## 📱 Mobile Considerations

### Responsive Positioning
- **Top-right** for desktop
- **Top-center** for mobile (when needed)
- **Bottom positioning** for status indicators

### Touch-Friendly Design
- **Adequate touch targets** for dismiss buttons
- **Swipe-to-dismiss** support (built into react-hot-toast)
- **Readable text sizes** on small screens

## 🔍 Debugging and Monitoring

### Console Logging
- **Error notifications** log detailed errors to console
- **Auto-save operations** log status changes
- **Network failures** log retry attempts

### Development Tools
- **Toast debugging** with custom IDs
- **Status tracking** in React DevTools
- **Error boundary** integration

## 🚀 Performance Considerations

### Optimization Strategies
- **Debounced notifications** for rapid operations
- **Toast deduplication** to prevent spam
- **Lazy loading** of error notification components
- **Memory cleanup** for dismissed notifications

### Resource Management
- **Automatic cleanup** of expired toasts
- **Context provider** optimization
- **Event listener** cleanup in components

## 🧪 Testing

### Unit Tests
- **Notification utility functions**
- **Status component rendering**
- **Error handling scenarios**

### Integration Tests
- **Toast display** in user workflows
- **Auto-save status** updates
- **Error recovery** actions

### E2E Tests
- **Complete notification flows**
- **Cross-tab synchronization**
- **Network failure scenarios**

## 📚 API Reference

### Core Functions

#### `showSuccess(message, options?)`
Display success notification with green styling.

#### `showError(message, options?)`
Display error notification with red styling and longer duration.

#### `showWarning(message, options?)`
Display warning notification with orange styling.

#### `showInfo(message, options?)`
Display info notification with blue styling.

#### `showLoading(message, options?)`
Display loading notification with spinner.

#### `dismissNotification(toastId)`
Dismiss specific notification by ID.

#### `dismissAllNotifications()`
Dismiss all active notifications.

### Notification Options
```typescript
interface NotificationOptions {
  duration?: number;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## 🔮 Future Enhancements

### Planned Features
- **Push notifications** for background operations
- **Notification history** and management
- **User preferences** for notification types
- **Sound notifications** (optional)
- **Batch operations** with progress notifications

### Accessibility Improvements
- **Screen reader** announcements
- **High contrast** mode support
- **Reduced motion** preferences
- **Keyboard navigation** for actions

---

**Last Updated**: January 2025  
**Version**: 1.2.0  
**Status**: Production Ready ✅