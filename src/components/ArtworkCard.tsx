import { motion } from "motion/react";
import { Artwork } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ArtworkCardProps {
  artwork: Artwork;
  index: number;
  onSelect?: () => void;
  key?: string | number;
}

export default function ArtworkCard({ artwork, index, onSelect }: ArtworkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group cursor-pointer"
      onClick={onSelect}
    >
      <div className="overflow-hidden bg-transparent flex flex-col gap-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Badge variant="secondary" className="backdrop-blur-sm bg-white/80 text-black">
              {artwork.category}
            </Badge>
          </div>
        </div>
        <div className="px-1 py-1">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-3xl font-bold tracking-tighter md:text-4xl">
              {artwork.title}
            </h3>
            <span className="text-base font-medium text-muted-foreground/60">{artwork.year}</span>
          </div>
          <p className="mt-4 text-lg text-muted-foreground/80 line-clamp-4 leading-relaxed md:text-xl">
            {artwork.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
