// for dev and for fast dev we will use console.err
import { redirect } from "next/navigation";
import {
  useGetAllDocumentsQuery,
  useRenameDocumentMutation,
  useMoveDocumentMutation,
  useDeleteDocumentMutation,
  useUploadDocumentMutation,
  useGetDocumentByIdQuery,
} from "@/lib/store/apiSlice";
import { toast } from "react-toastify";
export function useDocument() {
  // Query
  const {
    data: documentsData,
    isLoading,
    error,
    refetch,
  } = useGetAllDocumentsQuery();
  if (error) {
    console.error("Error fetching documents:", error);
  }

  // Mutations
  const [renameDocumentMutation, { isLoading: isRenaming }] =
    useRenameDocumentMutation();
  const [moveDocumentMutation, { isLoading: isMoving }] =
    useMoveDocumentMutation();
  const [deleteDocumentMutation, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();
  const [uploadDocumentMutation, { isLoading: isUploading }] =
    useUploadDocumentMutation();

  // Document operations
  const renameDocument = async (id: string, name: string) => {
    try {
      await renameDocumentMutation({ id, name }).unwrap();
      return { success: true };
    } catch (error) {
      return { error };
    }
  };

  const moveDocument = async (id: string, folderId: string | null) => {
    try {
      await moveDocumentMutation({ id, folderId }).unwrap();
      return { success: true };
    } catch (error) {
      return { error };
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await deleteDocumentMutation(id).unwrap();
      return { success: true };
    } catch (error) {
      toast.error("Failed to delete document");
      return { error };
    }
  };

  const openDocument = (id: string) => {
    const document = documentsData?.find((f) => f.id === id);
    if (document) {
      redirect(`/dashboard/documents/${document.id}`);
    }
  };

  const uploadDocument = async (file: File, folderId: string | null = null) => {
    const formData = new FormData();
    formData.append("document", file);
    if (folderId) {
      formData.append("folderId", folderId);
    }
    return uploadDocumentMutation(formData).unwrap();
  };

  return {
    // Data
    documents: documentsData || [],
    isLoading,
    error,
    refetch,

    // Operations
    renameDocument,
    moveDocument,
    deleteDocument,
    openDocument,
    uploadDocument,

    // Loading states
    isRenaming,
    isMoving,
    isDeleting,
    isUploading,
  };
}
