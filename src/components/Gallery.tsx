import { Artwork } from "@/types";
import ArtworkCard from "./ArtworkCard";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GalleryProps {
  artworks: Artwork[];
  loading?: boolean;
}

export default function Gallery({ artworks, loading }: GalleryProps) {
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedArtworkIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedArtworkIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedArtworkIndex === null) return;
      if (e.key === "Escape") {
        setSelectedArtworkIndex(null);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedArtworkIndex, artworks.length]);

  const handleNext = () => {
    if (selectedArtworkIndex === null) return;
    setSelectedArtworkIndex((prev) => 
      prev !== null && prev < artworks.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrev = () => {
    if (selectedArtworkIndex === null) return;
    setSelectedArtworkIndex((prev) => 
      prev !== null && prev > 0 ? prev - 1 : artworks.length - 1
    );
  };

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

  const currentArtwork = selectedArtworkIndex !== null ? artworks[selectedArtworkIndex] : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto"
      >
        {artworks.map((artwork, index) => (
          <ArtworkCard 
            key={`${artwork.id}-${index}`} 
            artwork={artwork} 
            index={index} 
            onSelect={() => setSelectedArtworkIndex(index)}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedArtworkIndex !== null && currentArtwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
              onClick={() => setSelectedArtworkIndex(null)}
            />

            {/* Navigation buttons */}
            <button
              onClick={handlePrev}
              className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 p-3 bg-zinc-900/80 border border-zinc-800 rounded-full hover:bg-zinc-800 text-white transition-all cursor-pointer hidden md:flex items-center justify-center hover:scale-105 active:scale-95"
              aria-label="Previous artwork"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={handleNext}
              className="fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-50 p-3 bg-zinc-900/80 border border-zinc-800 rounded-full hover:bg-zinc-800 text-white transition-all cursor-pointer hidden md:flex items-center justify-center hover:scale-105 active:scale-95"
              aria-label="Next artwork"
            >
              <ChevronRight size={28} />
            </button>

            {/* Close button */}
            <button
              onClick={() => setSelectedArtworkIndex(null)}
              className="fixed top-6 right-6 z-50 p-3 bg-zinc-900/80 border border-zinc-800 rounded-full hover:bg-zinc-800 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-6xl mx-auto px-4 md:px-8 z-40"
            >
              <div 
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden p-6 md:p-8 lg:p-10 shadow-2xl max-h-[85vh] overflow-y-auto lg:overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image display */}
                <div className="lg:col-span-7 flex items-center justify-center bg-black/30 rounded-xl overflow-hidden p-4 min-h-[250px] sm:min-h-[350px] lg:min-h-[500px]">
                  <motion.img
                    key={currentArtwork.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    src={currentArtwork.imageUrl}
                    alt={currentArtwork.title}
                    className="max-h-[40vh] md:max-h-[50vh] lg:max-h-[65vh] w-full object-contain rounded-lg shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Metadata & Description */}
                <div className="lg:col-span-5 flex flex-col justify-between py-2 text-white">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <Badge className="bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-800">
                        {currentArtwork.category}
                      </Badge>
                      <span className="text-sm font-medium text-zinc-400 font-mono">{currentArtwork.year} год</span>
                    </div>

                    <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white select-text">
                      {currentArtwork.title}
                    </h2>

                    {/* Scrollable Description */}
                    <div className="text-zinc-300 text-base md:text-lg leading-relaxed max-h-[25vh] lg:max-h-[40vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar select-text">
                      <p className="whitespace-pre-line leading-relaxed">{currentArtwork.description}</p>
                    </div>
                  </div>

                  {/* Navigation controls for touch / mobile & Info footer */}
                  <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:hidden">
                      <button
                        onClick={handlePrev}
                        className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white hover:bg-zinc-800 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-xs font-mono text-zinc-400">
                        {selectedArtworkIndex + 1} / {artworks.length}
                      </span>
                      <button
                        onClick={handleNext}
                        className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white hover:bg-zinc-800 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden md:inline">
                      РАБОТА {selectedArtworkIndex + 1} ИЗ {artworks.length}
                    </span>

                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                      AVDEEVART
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
