import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  useUpdateHighlightMutation,
  useDeleteHighlightMutation,
} from "@/lib/store/apiSlice";
import { MoreHorizontal, Palette, Trash2, Check, Layers } from "lucide-react";
import toast from "react-hot-toast";

export interface HighlightContextMenuProps {
  /** Whether the menu trigger is visible */
  isVisible: boolean;
  /** Position of the menu trigger button */
  position: { x: number; y: number } | null;
  /** Highlight ID for API operations */
  highlightId: string | null;
  /** Current highlight color */
  currentColor?: string;
  /** Current highlight opacity */
  currentOpacity?: number;
  /** Callback when highlight is updated */
  onHighlightUpdated?: (
    highlightId: string,
    updates: { color?: string; opacity?: number }
  ) => void;
  /** Callback when highlight is deleted */
  onHighlightDeleted?: (highlightId: string) => void;
  /** Callback when menu is closed */
  onClose?: () => void;
}

// Predefined color options for highlights
const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FFFF00", label: "Default Yellow" },
  { name: "Orange", value: "#FFA500", label: "Orange" },
  { name: "Pink", value: "#FF69B4", label: "Pink" },
  { name: "Green", value: "#90EE90", label: "Light Green" },
  { name: "Blue", value: "#87CEEB", label: "Sky Blue" },
  { name: "Purple", value: "#DDA0DD", label: "Plum" },
  { name: "Red", value: "#FFB6C1", label: "Light Pink" },
  { name: "Cyan", value: "#E0FFFF", label: "Light Cyan" },
];

const HighlightContextMenu: React.FC<HighlightContextMenuProps> = ({
  isVisible,
  position,
  highlightId,
  currentColor = "#FFFF00",
  currentOpacity = 0.4,
  onHighlightUpdated,
  onHighlightDeleted,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localOpacity, setLocalOpacity] = useState(currentOpacity * 100); // Convert to percentage

  // RTK Query mutations
  const [updateHighlight, { isLoading: isUpdating }] =
    useUpdateHighlightMutation();
  const [deleteHighlight, { isLoading: isDeleting }] =
    useDeleteHighlightMutation();

  // Handle color change
  const handleColorChange = useCallback(
    async (newColor: string) => {
      if (!highlightId) return;

      try {
        await updateHighlight({
          id: highlightId,
          updates: {
            color: newColor,
          },
        }).unwrap();

        toast.success("Highlight color updated");
        onHighlightUpdated?.(highlightId, { color: newColor });
        setIsOpen(false);
        onClose?.();
      } catch (error) {
        console.error("Error updating highlight color:", error);
        toast.error("Failed to update highlight color");
      }
    },
    [highlightId, updateHighlight, onHighlightUpdated, onClose]
  );

  // Handle opacity change
  const handleOpacityChange = useCallback(
    async (newOpacity: number) => {
      if (!highlightId) return;

      const opacityValue = newOpacity / 100; // Convert percentage to decimal

      try {
        await updateHighlight({
          id: highlightId,
          updates: {
            opacity: opacityValue,
          },
        }).unwrap();

        toast.success("Highlight opacity updated");
        onHighlightUpdated?.(highlightId, { opacity: opacityValue });
      } catch (error) {
        console.error("Error updating highlight opacity:", error);
        toast.error("Failed to update highlight opacity");
      }
    },
    [highlightId, updateHighlight, onHighlightUpdated]
  );

  // Handle highlight deletion
  const handleDelete = useCallback(async () => {
    if (!highlightId) return;

    try {
      await deleteHighlight(highlightId).unwrap();
      toast.success("Highlight deleted");
      onHighlightDeleted?.(highlightId);
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error("Error deleting highlight:", error);
      toast.error("Failed to delete highlight");
    }
  }, [highlightId, deleteHighlight, onHighlightDeleted, onClose]);

  // Handle opacity slider change (local state)
  const handleOpacitySliderChange = useCallback((value: number[]) => {
    setLocalOpacity(value[0]);
  }, []);

  // Handle opacity commit (API call)
  const handleOpacityCommit = useCallback(() => {
    handleOpacityChange(localOpacity);
  }, [localOpacity, handleOpacityChange]);

  // Don't render if not visible or no position
  if (!isVisible || !position || !highlightId) {
    return null;
  }

  const menuTrigger = (
    <Button
      variant="secondary"
      size="sm"
      className="h-8 w-8 p-0 bg-white/90 hover:bg-white border border-gray-200 shadow-md backdrop-blur-sm"
      onClick={() => setIsOpen(true)}
    >
      <MoreHorizontal className="h-4 w-4 text-gray-600" />
    </Button>
  );

  const menuContent = (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>{menuTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg"
        align="start"
        side="bottom"
      >
        <DropdownMenuLabel className="text-sm font-medium text-gray-700">
          Highlight Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Color Selection Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Change Color</span>
            <div
              className="ml-auto w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: currentColor }}
            />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48 bg-white/95 backdrop-blur-sm">
            <div className="grid grid-cols-4 gap-2 p-2">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className="relative w-8 h-8 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorChange(color.value)}
                  title={color.label}
                  disabled={isUpdating}
                >
                  {currentColor === color.value && (
                    <Check className="h-4 w-4 text-gray-800 absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Opacity Control Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Opacity</span>
            <span className="ml-auto text-xs text-gray-500">
              {Math.round(currentOpacity * 100)}%
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48 bg-white/95 backdrop-blur-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Opacity</span>
                <span className="text-sm font-medium">
                  {Math.round(localOpacity)}%
                </span>
              </div>
              <Slider
                value={[localOpacity]}
                onValueChange={handleOpacitySliderChange}
                onValueCommit={handleOpacityCommit}
                max={100}
                min={10}
                step={5}
                className="w-full"
                disabled={isUpdating}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Delete Option */}
        <DropdownMenuItem
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          <span>{isDeleting ? "Deleting..." : "Delete Highlight"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Render using portal to ensure proper z-index
  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)", // Center horizontally, position above
      }}
    >
      <div className="pointer-events-auto mb-2">{menuContent}</div>
    </div>,
    document.body
  );
};

export default HighlightContextMenu;
