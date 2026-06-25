import Gallery from "@/components/Gallery";
import { Artwork, Category, ArtistInfo } from "@/types";
import { CATEGORIES } from "@/constants";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HomeProps {
  artworks: Artwork[];
  loading?: boolean;
  artistInfo?: ArtistInfo;
}

export default function Home({ artworks, loading, artistInfo }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "Все">("Все");

  const heroBg = artistInfo?.homeHeroBgUrl || "https://images-assets.nasa.gov/image/art002e009298/art002e009298~large.jpg";
  const heroSubtitle = artistInfo?.homeHeroSubtitle || "Исследование границ восприятия через свет, цвет и текстуру.";
  const portfolioSubtitle = artistInfo?.homePortfolioSubtitle || "Коллекция работ, исследующих пересечение света и эмоций.";

  const filteredArtworks = selectedCategory === "Все"
    ? artworks
    : artworks.filter(art => art.category === selectedCategory);

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={heroBg}
            alt="Hero Background"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
        
        <div className="container relative mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-serif text-4xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter"
          >
            AvdeevART
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 max-w-lg text-lg text-white/80"
          >
            {heroSubtitle}
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10"
          >
            <Button size="lg" className="rounded-full px-8" onClick={() => {
              document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Смотреть работы
            </Button>
          </motion.div>
        </div>
      </section>

      <div id="portfolio" className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <h2 className="font-serif text-4xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase">
            ПОРТФОЛИО
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            {portfolioSubtitle}
          </p>
        </motion.div>

        <div className="mb-20 flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
          <Button
            variant={selectedCategory === "Все" ? "default" : "outline"}
            onClick={() => setSelectedCategory("Все")}
            className="rounded-full px-5 py-4 text-sm md:px-8 md:py-6 md:text-lg"
          >
            Все
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="rounded-full px-5 py-4 text-sm md:px-8 md:py-6 md:text-lg"
            >
              {cat}
            </Button>
          ))}
        </div>

        <Gallery artworks={filteredArtworks} loading={loading} />
      </div>
    </div>
  );
}
