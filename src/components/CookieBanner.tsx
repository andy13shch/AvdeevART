import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "avdeevart_cookie_consent_v1";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consented = localStorage.getItem(STORAGE_KEY);
    if (!consented) {
      // Show banner with a slight delay so it doesn't distract immediately on load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 pointer-events-auto"
        >
          <div className="bg-background/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-foreground">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 text-primary">
                <Cookie size={18} className="shrink-0" />
                <span className="font-semibold text-xs uppercase tracking-wider text-foreground">
                  Файлы cookie
                </span>
              </div>
              <button
                onClick={handleAccept}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                aria-label="Закрыть уведомление"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Мы используем cookie для корректной работы сайта и запоминания ваших настроек. Оставаясь на сайте, вы
              соглашаетесь с{" "}
              <Link
                to="/privacy"
                onClick={handleAccept}
                className="underline underline-offset-2 text-foreground hover:text-primary transition-colors"
              >
                Политикой конфиденциальности
              </Link>
              .
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="default"
                onClick={handleAccept}
                className="rounded-full px-5 text-xs font-medium cursor-pointer"
              >
                Принять
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
