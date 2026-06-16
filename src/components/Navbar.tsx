import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Портфолио", path: "/" },
    { name: "Обо мне", path: "/about" },
    { name: "Контакты", path: "/contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled || !isHome
          ? "border-b bg-background/80 backdrop-blur-md py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className={cn(
            "font-serif text-2xl font-bold tracking-tighter transition-colors",
            !isScrolled && isHome ? "text-white" : "text-foreground"
          )}
        >
          Avdeev<span className="opacity-50">ART</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                !isScrolled && isHome ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/admin">
            <Button
              variant={!isScrolled && isHome ? "secondary" : "outline"}
              size="sm"
              className={cn(!isScrolled && isHome && "bg-white/10 text-white hover:bg-white/20 border-white/20")}
            >
              Админ
            </Button>
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className={cn(
            "md:hidden transition-colors",
            !isScrolled && isHome ? "text-white" : "text-foreground"
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b bg-background px-4 py-8 overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-serif font-medium"
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <Button className="w-full py-6 text-lg">Панель управления</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
