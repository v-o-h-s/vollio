import {
  useGetAllFilesQuery,
  useRenameFileMutation,
  useMoveFileMutation,
  useDeleteFileMutation,
} from "@/lib/store/apiSlice";
import { toast } from "react-hot-toast";

export function useFile() {
  // Query
  const {
    data: filesData,
    isLoading,
    error,
    refetch,
  } = useGetAllFilesQuery();

  // Mutations
  const [renameFileMutation, { isLoading: isRenaming }] = useRenameFileMutation();
  const [moveFileMutation, { isLoading: isMoving }] = useMoveFileMutation();
  const [deleteFileMutation, { isLoading: isDeleting }] = useDeleteFileMutation();

  // File operations
  const renameFile = async (id: string, name: string) => {
    try {
      await renameFileMutation({ id, name }).unwrap();
      toast.success("File renamed successfully");
      return true;
    } catch (error) {
      toast.error("Failed to rename file");
      throw error;
    }
  };

  const moveFile = async (id: string, folderId: string | null) => {
    try {
      await moveFileMutation({ id, folderId }).unwrap();
      toast.success("File moved successfully");
      return true;
    } catch (error) {
      toast.error("Failed to move file");
      throw error;
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await deleteFileMutation(id).unwrap();
      toast.success("File deleted successfully");
      return true;
    } catch (error) {
      toast.error("Failed to delete file");
      throw error;
    }
  };

  const openFile = (id: string) => {
    const file = filesData?.find((f) => f.id === id);
    if (file) {
      // TODO: Implement file opening logic
      toast(`Opening file: ${file.filename}`);
    }
  };

  return {
    // Data
    files: filesData || [],
    isLoading,
    error,
    refetch,

    // Operations
    renameFile,
    moveFile,
    deleteFile,
    openFile,

    // Loading states
    isRenaming,
    isMoving,
    isDeleting,
  };
}
