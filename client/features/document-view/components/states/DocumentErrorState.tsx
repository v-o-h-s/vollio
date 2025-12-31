import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

interface DocumentErrorStateProps {
  error: FetchBaseQueryError | SerializedError | undefined;
  refetch: () => void;
}

export function DocumentErrorState({ error, refetch }: DocumentErrorStateProps) {
  const router = useRouter();

  const message =
    error && "status" in error
      ? ((error as FetchBaseQueryError).data as { message?: string })?.message
      : (error as SerializedError)?.message;

  const statusCode =
    error && "status" in error ? (error as FetchBaseQueryError).status : null;

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
      <div className="flex flex-col items-center space-y-4 w-[400px]">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-foreground">
            {statusCode === 404
              ? "Document Not Found"
              : "Error Loading Document"}
          </h3>
          <p className="text-base mt-2 text-muted-foreground wrap-break-word">
            {message ?? "Failed to load Document. Please try again."}
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Button
            onClick={() => refetch()}
            variant="default"
            className="gap-2 w-full"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => router.push("/dashboard/documents")}
            variant="outline"
            className="gap-2 w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Button>
        </div>
      </div>
    </div>
  );
}
