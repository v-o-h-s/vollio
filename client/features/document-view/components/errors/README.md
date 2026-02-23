# Document View Error Components

This directory contains reusable React components and utilities specifically designed for handling and presenting errors within the Document View subsystem.

## Usage Example

```tsx
import { AIChatError } from "./AIChatError";

<AIChatError
  error={error}
  onRetry={handleRetry}
  upgradePlan={handleUpgradePlan}
/>;
```

## Error Handling Strategies

Depending on the functionality being used, different error presentation strategies are employed to ensure the best user experience:

### 1. Highlights & Notes Operations (Toast Notifications)

For standard CRUD operations such as creating highlights or adding notes, errors preventing creation (e.g., reaching the maximum number of notes or hitting general "Rate Limits") are displayed globally using **Toastify**.

- These toast notifications can optionally include interactive calls-to-action, such as an "Upgrade Plan" button.

### 2. Generative Operations & Summarization (Inline Components)

For in-place AI generative operations (like creating a document summary), we render dedicated inline error components directly within the particular UI context (e.g., displaying a clear feedback card for "Quota Exceeded"). This prevents the operation from silently failing or relying on disconnected floating toasts, providing explicit user context and actions exactly where the interaction occurred.
