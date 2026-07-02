import React from "react";
import { useHeicUrl } from "@/lib/heicHelper";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeicImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackUrl?: string;
  containerClassName?: string;
}

export const HeicImage: React.FC<HeicImageProps> = ({
  src,
  alt,
  className,
  fallbackUrl,
  containerClassName,
  ...props
}) => {
  const { resolvedUrl, isLoading, error } = useHeicUrl(src);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center w-full h-full min-h-[100px] bg-muted/30 rounded-md", containerClassName)}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
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
};
