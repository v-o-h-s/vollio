import { PDFDocument } from "@/lib/types/pdf";

export interface PDFViewerHeaderProps {
  /** Function to toggle noter */
  onToggleNoter?: () => void;
  /** PDF document being viewed */
  pdfDocument: PDFDocument;
  /** Whether the header is visible */
  isHeaderVisible: boolean;
  /** Function to set header visibility */
  setIsHeaderVisible: (visible: boolean) => void;
  /** PDF viewer ref */
  pdfViewerRef?: React.RefObject<any>;
  /** Current highlight color */
  currentHighlightColor?: string;
  /** Function to set highlight color */
  onHighlightColorChange?: (color: string) => void;
  /** Function to toggle tags sidebar */
  onToggleTags?: () => void;
  /** Whether tags sidebar is open */
  isTagsOpen?: boolean;
  /** Function to toggle summary sidebar */
  onToggleSummary?: () => void;
  /** Whether summary sidebar is open */
  isSummaryOpen?: boolean;
  /** Width of the viewer container (for responsive resizing) */
  viewerWidth?: string;
}
