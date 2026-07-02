import { useState, useEffect } from "react";

// Robust dynamic helper for heic2any to avoid ESM/CJS bundling issues
async function getHeic2anyFn(): Promise<any> {
  try {
    // Dynamic import to avoid SSR issues and guarantee client-side loading
    const module = await import("heic2any");
    
    if (module && typeof module === "object" && "default" in module) {
      if (typeof module.default === "function") {
        return module.default;
      }
      const defaultObj = module.default as any;
      if (defaultObj && typeof defaultObj.default === "function") {
        return defaultObj.default;
      }
    }
    
    if (typeof module === "function") {
      return module;
    }
    
    // Fallback to window global if somehow exposed there
    if (typeof window !== "undefined" && typeof (window as any).heic2any === "function") {
      return (window as any).heic2any;
    }
    
    throw new Error("heic2any loaded but no valid function found in exports.");
  } catch (err) {
    console.error("Failed to dynamically import heic2any:", err);
    throw err;
  }
}

/**
 * Checks if a filename, URL or base64 data string points to a HEIC/HEIF image.
 */
export function isHeic(url: string | undefined): boolean {
  if (!url) return false;
  
  const lower = url.toLowerCase();
  
  // Check if it's a data URL representing HEIC/HEIF
  if (lower.startsWith("data:")) {
    return (
      lower.includes("image/heic") ||
      lower.includes("image/heif") ||
      lower.includes("image/octet-stream") && (lower.includes("heic") || lower.includes("heif")) ||
      lower.includes("image/png") && (lower.includes("heic") || lower.includes("heif")) // defensive check
    );
  }
  
  // Clean URL from query params if any
  const cleanUrl = url.split("?")[0];
  return cleanUrl.endsWith(".heic") || cleanUrl.endsWith(".heif");
}

/**
 * Converts a data URL string to a Blob.
 */
export function dataURLtoBlob(dataurl: string): Blob {
  try {
    const arr = dataurl.split(',');
    if (arr.length < 2) {
      throw new Error("Invalid base64 Data URL format.");
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/heic';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.error("Failed to parse base64 data URL to Blob:", err);
    throw err;
  }
}

/**
 * Converts a HEIC File or Blob to a standard JPEG Blob.
 */
export async function convertHeicToJpeg(file: File | Blob): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("HEIC conversion is only supported in the browser.");
  }
  
  try {
    const heic2anyFn = await getHeic2anyFn();
    
    const result = await heic2anyFn({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    });
    
    const outputBlob = Array.isArray(result) ? result[0] : result;
    return outputBlob;
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
 * React hook that takes an image URL (could be remote URL or base64 Data URL), 
 * and if it's a HEIC image, fetches/parses and converts it to a browser-compatible JPEG Blob URL.
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
        let blob: Blob;
        
        if (url.startsWith("data:")) {
          // It's a base64 encoded HEIC string
          blob = dataURLtoBlob(url);
        } else {
          // It's a remote/local URL path
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch HEIC image: ${response.statusText}`);
          }
          blob = await response.blob();
        }
        
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
