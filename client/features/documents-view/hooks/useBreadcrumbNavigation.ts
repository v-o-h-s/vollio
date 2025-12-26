/**
 * @document useBreadcrumbNavigation.ts
 * @description Hook for managing breadcrumb navigation state and folder path calculation
 */

"use client";

import { useMemo } from "react";
import { BreadcrumbItem } from "../components/Breadcrumb"; 

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
}

interface UseBreadcrumbNavigationProps {
  currentFolder: string | null;
  folders: Folder[];
}

export function useBreadcrumbNavigation({
  currentFolder,
  folders,
}: UseBreadcrumbNavigationProps) {
  // Build breadcrumb path by traversing parent folders
  const breadcrumbPath = useMemo<BreadcrumbItem[]>(() => {
    const path: BreadcrumbItem[] = [{ id: null, name: "Home" }];

    if (!currentFolder) {
      return path;
    }

    // Build path from current folder to root
    const buildPath = (folderId: string): BreadcrumbItem[] => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return [];

      const parentPath = folder.parent_id ? buildPath(folder.parent_id) : [];
      return [...parentPath, { id: folder.id, name: folder.name }];
    };

    const folderPath = buildPath(currentFolder);
    return [...path, ...folderPath];
  }, [currentFolder, folders]);

  // Get current folder name
  const currentFolderName = useMemo(() => {
    if (!currentFolder) return "Home";
    const folder = folders.find((f) => f.id === currentFolder);
    return folder?.name ?? "Unknown";
  }, [currentFolder, folders]);

  // Get parent folder ID
  const parentFolderId = useMemo(() => {
    if (!currentFolder) return null;
    const folder = folders.find((f) => f.id === currentFolder);
    return folder?.parent_id ?? null;
  }, [currentFolder, folders]);

  return {
    breadcrumbPath,
    currentFolderName,
    parentFolderId,
  };
}
