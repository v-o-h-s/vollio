import { useRef, useState, ChangeEvent, DragEvent } from "react";
import { toast } from "react-toastify";

interface UseDocumentUploadProps {
  currentFolder: string | null;
  uploadDocument: (file: File, folderId: string | null) => Promise<any>;
  onUploadComplete: () => void;
}

export function useDocumentUpload({
  currentFolder,
  uploadDocument,
  onUploadComplete,
}: UseDocumentUploadProps) {
  const [isDraggingDocument, setIsDraggingDocument] = useState(false);
  const [lastUploadError, setLastUploadError] = useState<any | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    documentInputRef.current?.click();
  };

  const handleDocumentInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const document of files) {
      const toastId = toast.loading(`Uploading ${document.name}...`);
      try {
        await uploadDocument(document, currentFolder);
        toast.update(toastId, {
          render: `Successfully uploaded ${document.name}`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error: any) {
        toast.dismiss(toastId);
        console.error("Failed to upload document:", document.name, error);
        setLastUploadError(error);
        setPendingFile(document);
        setIsErrorModalOpen(true);
        // Break the loop on error to avoid modal spamming if multiple files fail
        break;
      }
    }

    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }

    onUploadComplete();
  };

  const handleDocumentDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingDocument(true);
    }
  };

  const handleDocumentDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDraggingDocument(false);
    }
  };

  const handleDocumentDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDocumentDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocument(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const document of files) {
      const toastId = toast.loading(`Uploading ${document.name}...`);
      try {
        await uploadDocument(document, currentFolder);
        toast.update(toastId, {
          render: `Successfully uploaded ${document.name}`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error: any) {
        toast.dismiss(toastId);
        console.error("Failed to upload document:", document.name, error);
        setLastUploadError(error);
        setPendingFile(document);
        setIsErrorModalOpen(true);
        break;
      }
    }

    onUploadComplete();
  };

  return {
    documentInputRef,
    isDraggingDocument,
    handleUploadClick,
    handleDocumentInputChange,
    handleDocumentDragEnter,
    handleDocumentDragLeave,
    handleDocumentDragOver,
    handleDocumentDrop,
    lastUploadError,
    isErrorModalOpen,
    setIsErrorModalOpen,
    retryLastUpload: async () => {
      if (pendingFile) {
        const toastId = toast.loading(
          `Retrying upload for ${pendingFile.name}...`,
        );
        try {
          await uploadDocument(pendingFile, currentFolder);
          toast.update(toastId, {
            render: `Successfully uploaded ${pendingFile.name}`,
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          setPendingFile(null);
          setLastUploadError(null);
          onUploadComplete();
        } catch (error) {
          toast.dismiss(toastId);
          setLastUploadError(error);
          setIsErrorModalOpen(true);
        }
      }
    },
  };
}
