import { Library } from "lucide-react";
import DocumentsDirectoryViewerWrapper from "@/features/documents-view/components/DocumentsDirectoryViewerWrapper";

export default function DashboardPage() {
  return (
    <div className="   space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Documents Library
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage your documents with document system-style navigation
          </p>
        </div>
      </div>

      {/* Document Directory View */}
      <DocumentsDirectoryViewerWrapper />
    </div>
  );
}
