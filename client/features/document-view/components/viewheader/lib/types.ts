import { DocumentDetails } from "@/features/document-view/types/document";

export interface DocumentViewerHeaderProps {
  /** document being viewed */
  document: DocumentDetails;
  /** Whether the header is visible */
  isHeaderVisible: boolean;
  /** Function to set header visibility */
  setIsHeaderVisible: (visible: boolean) => void;
  /** Document viewer ref */
  documentViewerRef?: React.RefObject<any>;
  /** Current highlight color */
  currentHighlightColor?: string;
  /** Function to set highlight color */
  onHighlightColorChange?: (color: string) => void;
  /** Function to toggle tags sidebar */
  onToggleTags?: () => void;
  /** Whether tags sidebar is open */
  isTagsOpen?: boolean;
  /** Function to toggle AI assistant */

  /** Width of the viewer container (for responsive resizing) */
  viewerWidth?: string;
}
