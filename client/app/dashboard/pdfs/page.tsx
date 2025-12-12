import FilesDirectoryViewer from "@/features/files-view/components/FilesDirectoryViewer";

export default function PDFsPage() {
  return (
    <div className="   space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Files library</h1>
          <p className="text-muted-foreground text-sm">
            Manage your documents with file system-style navigation
          </p>
        </div>
      </div>

      {/* PDF Directory View */}
      <FilesDirectoryViewer/>
    </div>
  );
}
