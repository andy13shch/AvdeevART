import { Artwork } from "@/types";
import ArtworkCard from "./ArtworkCard";
import { motion } from "motion/react";

interface GalleryProps {
  artworks: Artwork[];
  loading?: boolean;
}

export default function Gallery({ artworks, loading }: GalleryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-6">
            <div className="aspect-[4/5] w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h3 className="text-xl font-semibold">Работы не найдены.</h3>
        <p className="text-muted-foreground">Загляните позже, чтобы увидеть новые поступления.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto"
    >
      {artworks.map((artwork, index) => (
        <ArtworkCard key={`${artwork.id}-${index}`} artwork={artwork} index={index} />
      ))}
    </motion.div>
  );
}
