import { useState, useEffect } from "react";
import heic2any from "heic2any";

/**
 * Checks if a filename or URL points to a HEIC/HEIF image.
 */
export function isHeic(url: string | undefined): boolean {
  if (!url) return false;
  // Clean URL from query params if any
  const cleanUrl = url.split("?")[0].toLowerCase();
  return cleanUrl.endsWith(".heic") || cleanUrl.endsWith(".heif");
}

/**
 * Converts a HEIC File or Blob to a standard JPEG Blob.
 */
export async function convertHeicToJpeg(file: File | Blob): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("HEIC conversion is only supported in the browser.");
  }
  
  try {
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });
    
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error("Failed to convert HEIC to JPEG:", error);
    throw error;
  }
}

/**
 * Processes any uploaded image file. If it's a HEIC file, converts it to JPEG.
 * Returns a base64 Data URL.
 */
export async function processImageFile(file: File): Promise<string> {
  let blobToProcess: Blob = file;
  
  const isHeicFile = 
    file.name.toLowerCase().endsWith(".heic") || 
    file.name.toLowerCase().endsWith(".heif") || 
    file.type === "image/heic" || 
    file.type === "image/heif";

  if (isHeicFile) {
    try {
      blobToProcess = await convertHeicToJpeg(file);
    } catch (err) {
      console.warn("Could not convert HEIC, falling back to original file upload.", err);
    }
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file."));
    };
    reader.readAsDataURL(blobToProcess);
  });
}

/**
 * React hook that takes an image URL, and if it's a HEIC image, 
 * fetches and converts it to a browser-compatible JPEG Blob URL.
 */
export function useHeicUrl(url: string | undefined) {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>(url);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) {
      setResolvedUrl(undefined);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!isHeic(url)) {
      setResolvedUrl(url);
      setIsLoading(false);
      setError(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    async function loadAndConvertHeic() {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch the local or remote HEIC file as blob
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch HEIC image: ${response.statusText}`);
        }
        const blob = await response.blob();
        
        if (!active) return;

        // Convert HEIC to JPEG
        const jpegBlob = await convertHeicToJpeg(blob);
        
        if (!active) return;

        objectUrl = URL.createObjectURL(jpegBlob);
        setResolvedUrl(objectUrl);
      } catch (err: any) {
        console.error("Error loading/converting HEIC URL:", err);
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
          // Fallback to original URL so browser error handler can run
          setResolvedUrl(url);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadAndConvertHeic();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return { resolvedUrl, isLoading, error };
}
