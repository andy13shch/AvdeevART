import { Instagram, Send, Mail, Phone } from "lucide-react";
import { ArtistInfo } from "@/types";

interface FooterProps {
  artistInfo?: ArtistInfo;
}

export default function Footer({ artistInfo }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-2xl font-bold tracking-tighter">
              {artistInfo?.name || "AvdeevART"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {artistInfo?.bio?.slice(0, 100)}...
            </p>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Связь
            </h3>
            <div className="flex gap-6">
              {artistInfo?.instagram && (
                <a
                  href={artistInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  <Instagram size={20} />
                </a>
              )}
              {artistInfo?.telegram && (
                <a
                  href={artistInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  <Send size={20} />
                </a>
              )}
              {artistInfo?.email && (
                <a
                  href={`mailto:${artistInfo.email}`}
                  className="transition-colors hover:text-primary"
                >
                  <Mail size={20} />
                </a>
              )}
              {artistInfo?.phone && (
                <a
                  href={`tel:${artistInfo.phone}`}
                  className="transition-colors hover:text-primary"
                >
                  <Phone size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col gap-4 md:items-end">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} {artistInfo?.name || "AvdeevART"}. Все права защищены.
            </p>
            <p className="text-xs text-muted-foreground/50 italic">
              Создано для мира искусства.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
