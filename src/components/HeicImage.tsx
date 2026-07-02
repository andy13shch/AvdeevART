import React from "react";
import { useHeicUrl } from "@/lib/heicHelper";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeicImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackUrl?: string;
  containerClassName?: string;
}

export const HeicImage = React.forwardRef<HTMLImageElement, HeicImageProps>(
  ({ src, alt, className, fallbackUrl, containerClassName, ...props }, ref) => {
    const { resolvedUrl, isLoading } = useHeicUrl(src);

    if (isLoading) {
      return (
        <div 
          className={cn(
            "flex items-center justify-center bg-muted/20 animate-pulse", 
            className, 
            containerClassName
          )}
        >
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/60" />
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={resolvedUrl || fallbackUrl}
        alt={alt}
        className={className}
        onError={(e) => {
          if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
            e.currentTarget.src = fallbackUrl;
          }
          if (props.onError) {
            props.onError(e);
          }
        }}
        {...props}
      />
    );
  }
);

HeicImage.displayName = "HeicImage";
