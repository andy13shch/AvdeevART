import { HashRouter as Router, Routes, Route } from "react-router-dom";
import React, { Suspense, useEffect, useState } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { ArtistInfo, Artwork } from "./types";
import { DEFAULT_ARTIST_INFO } from "./constants";
import { subscribeToArtworks, subscribeToArtistInfo } from "./services/firebaseService";
import { auth, onAuthStateChanged, User } from "./firebase";

// Code splitting: lazy-load secondary pages so the initial landing bundle is tiny and fast
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Admin = React.lazy(() => import("./pages/Admin"));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  const [artistInfo, setArtistInfo] = useState<ArtistInfo>(DEFAULT_ARTIST_INFO);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isArtistInfoLoading, setIsArtistInfoLoading] = useState(true);
  const [isHeroReady, setIsHeroReady] = useState(false);

  // Preload hero background images so the site reveals with zero black flashes or missing layers
  useEffect(() => {
    let isCancelled = false;
    const heroAssets = [
      "/images/hero/hero_full_hires.jpg",
      "/images/hero/layers/layer_0_bg.webp",
      "/images/hero/layers/layer_1_house.webp",
      "/images/hero/layers/layer_2_tree.webp",
    ];

    const preloadHero = async () => {
      try {
        const promises = heroAssets.map((src) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          });
        });

        // 1.8s maximum safety timeout: site will always open promptly even on slow networks
        const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1800));
        await Promise.race([Promise.all(promises), timeout]);
      } finally {
        if (!isCancelled) {
          setIsHeroReady(true);
        }
      }
    };

    preloadHero();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    const unsubscribeArtworks = subscribeToArtworks((data) => {
      setArtworks(data);
      setLoading(false);
    });

    const unsubscribeArtist = subscribeToArtistInfo((data) => {
      if (data) {
        setArtistInfo(data);
      } else {
        setArtistInfo(DEFAULT_ARTIST_INFO);
      }
      setIsArtistInfoLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeArtworks();
      unsubscribeArtist();
    };
  }, []);

  if (!isAuthReady || isArtistInfoLoading || !isHeroReady) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 text-white select-none">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <span className="absolute font-serif text-2xl font-bold tracking-tighter">A</span>
        </div>
        <span className="mt-4 font-serif text-xs tracking-widest uppercase text-white/70 animate-pulse">
          AvdeevART
        </span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout artistInfo={artistInfo} />}>
          <Route path="/" element={<Home artworks={artworks} loading={loading} artistInfo={artistInfo} />} />
          <Route
            path="/about"
            element={
              <Suspense fallback={<PageLoader />}>
                <About artistInfo={artistInfo} />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<PageLoader />}>
                <Contact />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageLoader />}>
                <Admin artworks={artworks} artistInfo={artistInfo} user={user} />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
