import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import { useEffect, useState } from "react";
import { ArtistInfo, Artwork } from "./types";
import { DEFAULT_ARTIST_INFO } from "./constants";
import { subscribeToArtworks, subscribeToArtistInfo } from "./services/firebaseService";
import { auth, onAuthStateChanged, User, db, doc, getDoc } from "./firebase";
import { getDocFromServer } from "firebase/firestore";

export default function App() {
  const [artistInfo, setArtistInfo] = useState<ArtistInfo>(DEFAULT_ARTIST_INFO);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Validate Connection to Firestore
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    const unsubscribeArtworks = subscribeToArtworks((data) => {
      setArtworks(data);
      setLoading(false);
    });

    const unsubscribeArtist = subscribeToArtistInfo((data) => {
      if (data) setArtistInfo(data);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeArtworks();
      unsubscribeArtist();
    };
  }, []);

  if (!isAuthReady) {
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
          <Route path="/" element={<Home artworks={artworks} loading={loading} />} />
          <Route path="/about" element={<About artistInfo={artistInfo} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin artworks={artworks} artistInfo={artistInfo} user={user} />} />
        </Route>
      </Routes>
    </Router>
  );
}
