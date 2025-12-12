/**
 * @file rtk-query-error.tsx
 * @description Reusable error display component for RTK Query errors with comprehensive server error response visualization
 */

import React from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface RTKQueryErrorProps {
  error: FetchBaseQueryError | SerializedError | undefined;
  errorName?: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

export function RTKQueryError({
  error,
  errorName = "Error",
  onRetry,
  showDetails = process.env.NODE_ENV === 'development',
}: RTKQueryErrorProps) {
  if (!error) return null;

  const errorData = (error as any)?.data;
  const errorObject = errorData?.error;
  const errorMessage = 
    errorData?.message ||
    errorObject?.message ||
    (error as any)?.message || 
    'An unexpected error occurred';
  
  const errorStatus = (error as any)?.status;
  const success = errorData?.success ?? errorData?.sucess; // Handle typo

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{errorMessage}</span>
            {errorStatus && (
              <span className="text-xs opacity-80">HTTP Status: {errorStatus}</span>
            )}
            {errorObject?.statusCode && errorStatus !== errorObject.statusCode && (
              <span className="text-xs opacity-80">Error Code: {errorObject.statusCode}</span>
            )}
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
        </div>

        {showDetails && (
          <details className="text-xs" open>
            <summary className="cursor-pointer font-semibold mb-2">Server Error Response</summary>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="font-semibold">{errorName}:</div>
                
                {errorData && (
                  <div className="space-y-2">
                    <div className="p-2 bg-black/30 rounded">
                      <div className="font-semibold mb-1">Response:</div>
                      <div className="pl-2 space-y-1">
                        <div>Success: <span className="text-red-400">{String(success)}</span></div>
                        <div>Message: <span className="text-yellow-300">{errorData.message || 'N/A'}</span></div>
                      </div>
                    </div>
                    
                    {errorObject && (
                      <div className="p-2 bg-black/30 rounded">
                        <div className="font-semibold mb-1">Error Object:</div>
                        <div className="pl-2 space-y-1">
                          <div>Name: <span className="text-orange-300">{errorObject.name || 'N/A'}</span></div>
                          <div>SubType: <span className="text-orange-300">{errorObject.subType || 'N/A'}</span></div>
                          <div>Message: <span className="text-yellow-300">{errorObject.message || 'N/A'}</span></div>
                          <div>Details: <span className="text-gray-300">{errorObject.details || 'N/A'}</span></div>
                          <div>Status Code: <span className="text-red-400">{errorObject.statusCode || 'N/A'}</span></div>
                          {errorObject.extra && Object.keys(errorObject.extra).length > 0 && (
                            <div>
                              <div className="mt-1">Extra:</div>
                              <pre className="pl-2 text-gray-400">{JSON.stringify(errorObject.extra, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {errorData.details && Array.isArray(errorData.details) && (
                      <div className="p-2 bg-black/30 rounded">
                        <div className="font-semibold mb-1">Validation Details:</div>
                        <div className="pl-2 space-y-1">
                          {errorData.details.map((detail: any, index: number) => (
                            <div key={index} className="text-gray-300">
                              <div>Path: <span className="text-yellow-300">{detail.instancePath || '/'}</span></div>
                              <div>Keyword: <span className="text-orange-300">{detail.keyword}</span></div>
                              <div>Message: <span className="text-red-400">{detail.message}</span></div>
                              {detail.params && (
                                <div className="ml-2 mt-1">
                                  <div className="text-xs">Params:</div>
                                  <pre className="text-gray-400 text-xs">{JSON.stringify(detail.params, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-2 bg-black/30 rounded">
                  <div className="font-semibold mb-1">Full RTK Query Error:</div>
                  <pre className="p-2 bg-black/50 rounded overflow-auto max-h-48 text-gray-400">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Utility function to extract error message from RTK Query error
export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return 'An unexpected error occurred';
  
  const errorData = (error as any)?.data;
  const errorObject = errorData?.error;
  
  return (
    errorData?.message ||
    errorObject?.message ||
    (error as any)?.message || 
    'An unexpected error occurred'
  );
}

// Utility function to check if error is RTK Query error
export function isRTKQueryError(error: any): error is FetchBaseQueryError {
  return error && 'status' in error;
}

// Utility function to extract HTTP status from error
export function getErrorStatus(error: FetchBaseQueryError | SerializedError | undefined): number | undefined {
  return (error as any)?.status;
}
