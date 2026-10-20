import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface HeroParallax3DProps {
  title?: string;
  subtitle?: string;
  staticImageUrl?: string;
  onExploreClick?: () => void;
}

export default function HeroParallax3D({
  title = "AvdeevART",
  subtitle = "Исследование границ восприятия через свет, цвет и текстуру.",
  staticImageUrl = "/images/hero/hero_full_hires.jpg",
  onExploreClick,
}: HeroParallax3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Automatic device capability check (prefers-reduced-motion, mobile touch screen)
  const [isStatic, setIsStatic] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    // 1. Check user preference for reduced motion (accessibility/battery saver)
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return true;
    }
    // 2. Check for touch devices with small screens (smartphones/small tablets)
    const isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const isSmallScreen = window.innerWidth < 768;
    return Boolean(isTouch && isSmallScreen);
  });

  // Track when all 3D layers have been loaded to prevent black flashes
  const [layersLoaded, setLayersLoaded] = useState(false);

  // Layer element references for direct GPU transforms
  const bgRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);
  const hillsRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Preload 3D layer images so they fade in together simultaneously
  useEffect(() => {
    if (isStatic) return;

    let isMounted = true;
    const layerUrls = [
      "/images/hero/layers/layer_0_bg.webp",
      "/images/hero/layers/layer_1_house.webp",
      "/images/hero/layers/layer_2_tree.webp",
    ];

    let loadedCount = 0;
    layerUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      if (img.complete) {
        loadedCount++;
        if (loadedCount === layerUrls.length && isMounted) {
          setLayersLoaded(true);
        }
      } else {
        img.onload = () => {
          loadedCount++;
          if (loadedCount === layerUrls.length && isMounted) {
            setLayersLoaded(true);
          }
        };
        img.onerror = () => {
          // If error loading WebP, fallback to static mode safely
          if (isMounted) setIsStatic(true);
        };
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isStatic]);

  useEffect(() => {
    if (isStatic) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId: number;
    let isHovered = false;
    const startTime = performance.now();
    let lastFrameTime = performance.now();

    // Frame performance tracking to detect GPU overload / low FPS
    const frameTimes: number[] = [];
    let slowStreak = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      isHovered = true;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 2;
      targetY = y * 2;
    };

    const handleMouseLeave = () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove, { passive: true });
      container.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    }

    const render = () => {
      const now = performance.now();
      const delta = now - lastFrameTime;
      lastFrameTime = now;

      // Track frame times to detect struggling hardware
      if (delta > 0 && delta < 250) {
        frameTimes.push(delta);
        if (frameTimes.length > 40) {
          const avgDelta = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          // If average FPS is below ~32 fps (>31ms per frame), GPU is under load
          if (avgDelta > 31) {
            slowStreak++;
            if (slowStreak >= 2) {
              // Gracefully stop animation loop and switch to static artwork
              setIsStatic(true);
              return;
            }
          } else {
            slowStreak = 0;
          }
          frameTimes.shift();
        }
      }

      const elapsed = (now - startTime) / 1000;

      // Ambient breathing motion when idle
      let effectiveTargetX = targetX;
      let effectiveTargetY = targetY;

      if (!isHovered) {
        effectiveTargetX = Math.sin(elapsed * 0.7) * 0.25;
        effectiveTargetY = Math.cos(elapsed * 0.5) * 0.15;
      }

      // Smooth lerp (damping 0.06)
      currentX += (effectiveTargetX - currentX) * 0.06;
      currentY += (effectiveTargetY - currentY) * 0.06;

      // Layer 0: Background
      if (bgRef.current) {
        const x = currentX * -8;
        const y = currentY * -6;
        bgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.10)`;
      }

      // Layer 1: House
      if (houseRef.current) {
        const x = currentX * 7;
        const y = currentY * 5;
        houseRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.06)`;
      }

      // Layer 2: Foreground Hill
      if (hillsRef.current) {
        const x = currentX * 18;
        const y = currentY * 12;
        hillsRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.06)`;
      }

      // Layer 3: Foreground Birch Tree
      if (treeRef.current) {
        const x = currentX * 28;
        const y = currentY * 16;
        treeRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.06)`;
      }

      // Layer 4: Text Content
      if (contentRef.current) {
        const x = currentX * 14;
        const y = currentY * 8;
        contentRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isStatic]);

  return (
    <section
      ref={containerRef}
      className="relative h-[85vh] min-h-[580px] w-full overflow-hidden bg-neutral-950 select-none"
      style={{ perspective: "1000px" }}
    >
      {/* 1. PERMANENT SOLID BACKDROP: Prevents any black gaps while 3D layers are streaming/decoding */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img
          src={staticImageUrl}
          alt="AvdeevART Hero Backdrop"
          className="w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      {/* 2. 3D PARALLAX STACK: Fades in seamlessly over the backdrop once all layers are ready */}
      {!isStatic && (
        <div 
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ease-in-out ${
            layersLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Layer 0: Background (Sky & Lake) */}
          <div
            ref={bgRef}
            className="absolute inset-0 w-full h-full will-change-transform transform-gpu"
          >
            <picture>
              <source srcSet="/images/hero/layers/layer_0_bg.webp" type="image/webp" />
              <img
                src="/images/hero/layers/layer_0_bg.png"
                alt="Watercolor Sky and Lake Background"
                className="w-full h-full object-cover object-center"
                loading="eager"
                decoding="async"
              />
            </picture>
          </div>

          {/* Layer 1: Midground (House) */}
          <div
            ref={houseRef}
            className="absolute inset-0 w-full h-full will-change-transform transform-gpu"
          >
            <picture>
              <source srcSet="/images/hero/layers/layer_1_house.webp" type="image/webp" />
              <img
                src="/images/hero/layers/layer_1_house.png"
                alt="Watercolor Cottage"
                className="w-full h-full object-cover object-center"
                loading="eager"
                decoding="async"
              />
            </picture>
          </div>

          {/* Layer 2: Foreground Hill (Lower-Left in front of house) */}
          <div
            ref={hillsRef}
            className="absolute inset-0 w-full h-full will-change-transform transform-gpu"
          >
            <picture>
              <source srcSet="/images/hero/layers/layer_3_hills.webp" type="image/webp" />
              <img
                src="/images/hero/layers/layer_3_hills.png"
                alt="Watercolor Foreground Hill"
                className="w-full h-full object-cover object-center"
                loading="eager"
                decoding="async"
              />
            </picture>
          </div>

          {/* Layer 3: Hero Foreground (Birch Tree) */}
          <div
            ref={treeRef}
            className="absolute inset-0 w-full h-full will-change-transform transform-gpu"
          >
            <picture>
              <source srcSet="/images/hero/layers/layer_2_tree.webp" type="image/webp" />
              <img
                src="/images/hero/layers/layer_2_tree.png"
                alt="Watercolor Birch Tree"
                className="w-full h-full object-cover object-center"
                loading="eager"
                decoding="async"
              />
            </picture>
          </div>

          {/* Darkening overlay matching original site (40% black) */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </div>
      )}

      {/* 3. FLOATING HERO CONTENT */}
      <div className="container relative mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white pointer-events-auto z-10">
        <div
          ref={contentRef}
          className="flex flex-col items-center justify-center will-change-transform transform-gpu"
        >
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="font-serif text-4xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter drop-shadow-2xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="mt-6 max-w-lg text-lg sm:text-xl text-white/90 drop-shadow-md"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            className="mt-10 relative z-30 pointer-events-auto"
          >
            <button
              type="button"
              className="cursor-pointer rounded-full px-8 py-4 text-base font-medium shadow-xl bg-neutral-900/90 text-white hover:bg-neutral-800 border border-white/20 transition-all hover:scale-105 active:scale-95 pointer-events-auto select-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onExploreClick) {
                  onExploreClick();
                } else {
                  const el = document.getElementById('portfolio');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
            >
              Смотреть работы
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
