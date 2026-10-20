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

  if (!isAuthReady || isArtistInfoLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
