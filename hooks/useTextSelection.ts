import { useUpdateHighlightMutation } from "@/lib/store/apiSlice";
import { useCreateHighlightMutation } from "@/lib/store/apiSlice";
import { PdfHighlighterUtils } from "react-pdf-highlighter-extended";
interface useSelectionProps {
  highlighterUtilsRef: React.RefObject<PdfHighlighterUtils | null>;
}

export function useSelection({ highlighterUtilsRef }: useSelectionProps) {
  const [updateHighlight] = useUpdateHighlightMutation();
  const [createHighlight] = useCreateHighlightMutation();

  const [pendingSelection, setPendingSelection] = useState<any>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  // Handler to add a tag to selected text
  const handleAddTag = () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection) return;

    // Store the selection and open the tag dialog
    setPendingSelection(selection);
    setIsTagDialogOpen(true);
  };
}
