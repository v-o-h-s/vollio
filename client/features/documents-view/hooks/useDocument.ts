// for dev and for fast dev we will use console.err
import { redirect } from "next/navigation";
import {
  useGetAllDocumentsQuery,
  useRenameDocumentMutation,
  useMoveDocumentMutation,
  useDeleteDocumentMutation,
  useGenerateUploadUrlMutation,
  useCreateDocumentMutation,
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
  const [generateUploadUrlMutation, { isLoading: isGeneratingUrl }] =
    useGenerateUploadUrlMutation();
  const [createDocumentMutation, { isLoading: isCreatingDoc }] =
    useCreateDocumentMutation();
  const isUploading = isGeneratingUrl || isCreatingDoc;

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
    // Build the path including folder
    const filePath = folderId ? `${folderId}/${file.name}` : file.name;

    // Request signed upload URL from server
    const { storageUrl, storagePath } = await generateUploadUrlMutation({
      name: filePath,
    }).unwrap();

    // Upload directly to Supabase
    const response = await fetch(storageUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload document");
    }

    // Create document metadata in the database
    await createDocumentMutation({
      name: file.name,
      size: file.size,
      folderId,
      storagePath,
    }).unwrap();

    // Return the file path or URL
    return {
      success: true,
      filePath,
      // optionally generate a signed download URL from server if needed
    };
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
