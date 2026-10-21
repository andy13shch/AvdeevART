import { Send, Mail, Phone } from "lucide-react";
import { ArtistInfo } from "@/types";
import { Link } from "react-router-dom";

interface FooterProps {
  artistInfo?: ArtistInfo;
}

function VkIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.39 13.98h-1.63c-.62 0-.81-.49-1.92-1.61-1-.96-1.44-1.08-1.69-1.08-.34 0-.44.1-.44.58v1.44c0 .39-.12.63-1.16.63-1.72 0-3.64-1.05-4.99-3-2.03-2.91-2.58-5.1-2.58-5.55 0-.25.1-.48.58-.48h1.63c.43 0 .6.2.77.67.84 2.45 2.25 4.6 2.83 4.6.22 0 .32-.1.32-.65V9.9c-.07-1.17-.68-1.27-.68-1.68 0-.2.16-.39.43-.39h2.56c.36 0 .49.19.49.61v3.29c0 .36.16.49.26.49.22 0 .4-.13.82-.55 1.28-1.44 2.19-3.63 2.19-3.63.12-.25.33-.48.76-.48h1.63c.49 0 .6.25.49.6-.2 1.01-2.31 3.96-2.42 4.13-.23.36-.32.52 0 .95.23.31 1 1 1.51 1.6 1.05 1.22 1.48 2 1.48 2 .14.24.03.49-.44.49z"/>
    </svg>
  );
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

          {/* Contacts & Socials */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Связь
            </h3>
            <div className="flex items-center gap-6">
              {artistInfo?.vk && (
                <a
                  href={artistInfo.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ВКонтакте"
                  className="transition-colors hover:text-primary"
                >
                  <VkIcon className="w-5 h-5" />
                </a>
              )}
              {artistInfo?.telegram && (
                <a
                  href={artistInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="transition-colors hover:text-primary"
                >
                  <Send size={20} />
                </a>
              )}
              {artistInfo?.email && (
                <a
                  href={`mailto:${artistInfo.email}`}
                  aria-label="Email"
                  className="transition-colors hover:text-primary"
                >
                  <Mail size={20} />
                </a>
              )}
              {artistInfo?.phone && (
                <a
                  href={`tel:${artistInfo.phone}`}
                  aria-label="Телефон"
                  className="transition-colors hover:text-primary"
                >
                  <Phone size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Legal & Copyright (152-ФЗ compliance) */}
          <div className="flex flex-col gap-2 md:items-end">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} {artistInfo?.name || "AvdeevART"}. Все права защищены.
            </p>
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <p className="text-[11px] text-muted-foreground/60">
              Сайт соблюдает 152-ФЗ «О персональных данных»
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
