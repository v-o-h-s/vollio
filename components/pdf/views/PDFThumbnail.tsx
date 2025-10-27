"use client";

import React, { useState, useEffect } from "react";
import { FileText, Loader2, AlertCircle } from "lucide-react";

interface PDFThumbnailProps {
  pdfId: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export function PDFThumbnail({ pdfId, className, fallbackIcon }: PDFThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Try to get cached thumbnail first
        const cachedUrl = localStorage.getItem(`pdf-thumbnail-${pdfId}`);
        if (cachedUrl) {
          setThumbnailUrl(cachedUrl);
          setIsLoading(false);
          return;
        }

        // Generate thumbnail via API
        const response = await fetch(`/api/pdfs/${pdfId}/thumbnail`);
        if (!response.ok) {
          throw new Error("Failed to generate thumbnail");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        setThumbnailUrl(url);
        
        // Cache the thumbnail URL (with expiration)
        const cacheData = {
          url,
          timestamp: Date.now(),
          expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem(`pdf-thumbnail-${pdfId}`, JSON.stringify(cacheData));
        
      } catch (error) {
        console.error("Failed to generate PDF thumbnail:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    generateThumbnail();

    // Cleanup function to revoke object URL
    return () => {
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [pdfId]);

  // Check if cached thumbnail is expired
  useEffect(() => {
    const cachedData = localStorage.getItem(`pdf-thumbnail-${pdfId}`);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.expiry < Date.now()) {
          localStorage.removeItem(`pdf-thumbnail-${pdfId}`);
        }
      } catch (error) {
        localStorage.removeItem(`pdf-thumbnail-${pdfId}`);
      }
    }
  }, [pdfId]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (hasError || !thumbnailUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        {fallbackIcon || <FileText className="h-8 w-8 text-muted-foreground" />}
      </div>
    );
  }

  return (
    <img
      src={thumbnailUrl}
      alt="PDF thumbnail"
      className={`object-cover ${className}`}
      onError={() => {
        setHasError(true);
        setThumbnailUrl(null);
      }}
    />
  );
}