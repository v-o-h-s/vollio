/**
 * API functions for annotation persistence
 */

import { Annotation, TextSelection } from "../types";
import toast from "react-hot-toast";

export interface CreateAnnotationRequest {
  pdfId: string;
  pageNumber: number;
  selectedText: string;
  noteContent: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UpdateAnnotationRequest {
  id: string;
  noteContent: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch annotations for a specific PDF and optional page
 */
export async function fetchAnnotations(
  pdfId: string,
  pageNumber?: number
): Promise<Annotation[]> {
  try {
    const params = new URLSearchParams({ pdfId });
    if (pageNumber !== undefined) {
      params.append("page", pageNumber.toString());
    }

    const response = await fetch(`/api/annotations?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result: ApiResponse<Annotation[]> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to fetch annotations");
    }

    return result.data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load annotations";
    toast.error(`Failed to load annotations: ${message}`);
    throw error;
  }
}

/**
 * Create a new annotation
 */
export async function createAnnotation(
  annotationData: CreateAnnotationRequest
): Promise<Annotation> {
  try {
    const response = await fetch("/api/annotations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(annotationData),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result: ApiResponse<Annotation> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to create annotation");
    }

    toast.success("Annotation created successfully");
    return result.data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create annotation";
    toast.error(`Failed to create annotation: ${message}`);
    throw error;
  }
}

/**
 * Update an existing annotation
 */
export async function updateAnnotation(
  updateData: UpdateAnnotationRequest
): Promise<Annotation> {
  try {
    const response = await fetch("/api/annotations", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result: ApiResponse<Annotation> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to update annotation");
    }

    toast.success("Annotation updated successfully");
    return result.data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update annotation";
    toast.error(`Failed to update annotation: ${message}`);
    throw error;
  }
}

/**
 * Delete an annotation
 */
export async function deleteAnnotation(annotationId: string): Promise<void> {
  try {
    const response = await fetch(`/api/annotations?id=${annotationId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to delete annotation");
    }

    toast.success("Annotation deleted successfully");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete annotation";
    toast.error(`Failed to delete annotation: ${message}`);
    throw error;
  }
}

/**
 * Retry wrapper for API calls with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      toast.loading(`Retrying... (${attempt + 1}/${maxRetries})`, {
        id: `retry-${attempt}`,
        duration: delay,
      });
    }
  }

  throw lastError;
}
