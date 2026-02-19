import { TransformedRTKError } from "@/lib/utils/rtk-error-transform";
interface AIChatErrorProps {
  error: TransformedRTKError;
  onRetry?: () => void;
  upgradePlan?: () => void;
}

export function AIChatError({ error, onRetry, upgradePlan }: AIChatErrorProps) {
  if (error.name === "QuotaExceededError") {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/20 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
        <div className="w-10 h-10 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-red-600 dark:text-red-400"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-red-900 dark:text-red-200">
            Quota Exceeded
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {error.message || "You've reached your AI usage limit for today."}
          </p>
        </div>
        {upgradePlan && (
          <button
            onClick={upgradePlan}
            className="w-full cursor-pointer py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            Upgrade Plan
          </button>
        )}
      </div>
    );
  }

  if (error.name === "RateLimitingError") {
    return (
      <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
        <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-orange-600 dark:text-orange-400"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-orange-900 dark:text-orange-200">
            Slow Down
          </h4>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
            {error.message ||
              "You're sending messages too quickly. Please wait a moment."}
          </p>
        </div>
      </div>
    );
  }

  // Default error fallback
  return (
    <div className="p-4 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/20 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
      <div className="w-10 h-10 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-red-600 dark:text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <h4 className="font-semibold text-red-900 dark:text-red-200">
          Error Occurred
        </h4>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          {error.message || "Something went wrong. Please try again."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full py-2 px-4 bg-white dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium rounded-md transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
