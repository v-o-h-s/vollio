import { ViewerProvider } from "@/features/document-view/context/ViewerContext";
import { DocumentViewContent } from "@/features/document-view/components/DocumentViewContent";

export default function DocumentPage() {
  return (
    <ViewerProvider>
      <DocumentViewContent />
    </ViewerProvider>
  );
}