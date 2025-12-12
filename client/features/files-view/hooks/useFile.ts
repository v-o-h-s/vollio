// for dev and for fast dev we will use console.err

import {
    useGetAllFilesQuery,
    useRenameFileMutation,
    useMoveFileMutation,
    useDeleteFileMutation,
    useUploadFileMutation,
} from "@/lib/store/apiSlice";
import { notify } from "@/lib/notify";
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
    const [uploadFileMutation, { isLoading: isUploading }] = useUploadFileMutation();

    // File operations
    const renameFile = async (id: string, name: string) => {
        try {
            await renameFileMutation({ id, name }).unwrap();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    const moveFile = async (id: string, folderId: string | null) => {
        try {
            await moveFileMutation({ id, folderId }).unwrap();
            return { success: true };
        } catch (error) {
            return { error };
        }
    };

    const deleteFile = async (id: string) => {
        try {
            await deleteFileMutation(id).unwrap();
            return { success: true };
        } catch (error) {
            notify.error("Failed to delete file");
            return { error };
        }
    };

    const openFile = (id: string) => {
        const file = filesData?.find((f) => f.id === id);
        if (file) {
            // TODO: Implement file opening logic
        }
    };

    const uploadFile = async (file: File, folderId: string | null = null) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (folderId) {
                formData.append('folderId', folderId);
            }
            await uploadFileMutation(formData).unwrap();
            return { success: true };
        } catch (error) {
            return { error };
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
        uploadFile,

        // Loading states
        isRenaming,
        isMoving,
        isDeleting,
        isUploading,
    };
}
