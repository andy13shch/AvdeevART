import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/sonner";
import { ArtistInfo } from "@/types";
import ErrorBoundary from "./ErrorBoundary";

interface LayoutProps {
  artistInfo?: ArtistInfo;
}

export default function Layout({ artistInfo }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer artistInfo={artistInfo} />
      <Toaster />
    </div>
  );
}
