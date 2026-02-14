import {
  useGetAllFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
} from "@/lib/store/apiSlice";
import { toast } from "react-toastify";
export function useFolder() {
  // Query
  const {
    data: foldersData,
    isLoading,
    error,
    refetch,
  } = useGetAllFoldersQuery();

  // Mutations
  const [createFolderMutation, { isLoading: isCreating }] =
    useCreateFolderMutation();
  const [updateFolderMutation, { isLoading: isUpdating }] =
    useUpdateFolderMutation();
  const [deleteFolderMutation, { isLoading: isDeleting }] =
    useDeleteFolderMutation();

  // Folder operations
  const createFolder = async (name: string, parentId: string | null = null) => {
    try {
      await createFolderMutation({ name, parentId }).unwrap();
    } catch (error) {
      toast.error("Failed to create folder");
      throw error;
    }
  };

  const renameFolder = async (id: string, name: string) => {
    try {
      await updateFolderMutation({ id, name }).unwrap();
      toast.success("Folder renamed successfully");
      return true;
    } catch (error) {
      toast.error("Failed to rename folder");
      throw error;
    }
  };

  const moveFolder = async (id: string, parentId: string | null) => {
    try {
      await updateFolderMutation({ id, parentId }).unwrap();
      toast.success("Folder moved successfully");
      return true;
    } catch (error) {
      toast.error("Failed to move folder");
      throw error;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await deleteFolderMutation({ id }).unwrap();
      toast.success("Folder deleted successfully");
      return { success: true };
    } catch (error) {
      toast.error("Failed to delete folder");
      return { error };
    }
  };

  return {
    // Data
    folders: foldersData?.folders || [],
    isLoading,
    error,
    refetch,

    // Operations
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
  };
}
