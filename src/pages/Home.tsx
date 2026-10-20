import Gallery from "@/components/Gallery";
import { Artwork, Category, ArtistInfo } from "@/types";
import { CATEGORIES } from "@/constants";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HeicImage } from "@/components/HeicImage";
import HeroParallax3D from "@/components/HeroParallax3D";

interface HomeProps {
  artworks: Artwork[];
  loading?: boolean;
  artistInfo?: ArtistInfo;
}

export default function Home({ artworks, loading, artistInfo }: HomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "Все">("Все");

  const heroBg = artistInfo?.homeHeroBgUrl || "";
  const heroSubtitle = artistInfo?.homeHeroSubtitle || "Исследование границ восприятия через свет, цвет и текстуру.";
  const portfolioSubtitle = artistInfo?.homePortfolioSubtitle || "Коллекция работ, исследующих пересечение света и эмоций.";

  const filteredArtworks = selectedCategory === "Все"
    ? artworks
    : artworks.filter(art => art.category === selectedCategory);

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* 3D Multiplane Parallax Hero Section */}
      <HeroParallax3D
        title="AvdeevART"
        subtitle={heroSubtitle}
        staticImageUrl={heroBg || "/images/hero/hero_full_hires.jpg"}
        onExploreClick={() => {
          const portfolio = document.getElementById('portfolio');
          if (portfolio) {
            const top = portfolio.getBoundingClientRect().top + window.pageYOffset - 20;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }}
      />

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
          {CATEGORIES.filter(cat => cat.toLowerCase() !== "общее").map((cat) => (
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
