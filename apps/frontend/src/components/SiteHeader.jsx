import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import OrbitLinkLogo from "./OrbitLinkLogo";

const NAV = [
  { label: "Platform",  href: "#platform" },
  { label: "AI Agents", href: "#agents" },
  { label: "Contact",   href: "#contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const onHomeHero = location.pathname === "/" && !scrolled;
  const linkClass = onHomeHero
    ? "text-sm font-semibold text-white/80 hover:text-white"
    : "text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--navy)]";
  const logoClass = onHomeHero ? "text-white" : "text-[var(--navy)]";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header sticky top-0 z-50 border-b border-transparent ${scrolled ? "scrolled border-[var(--border)]" : "bg-transparent"}`}>
      <div className="container flex h-[76px] items-center justify-between">
        <Link to="/" className={`flex items-center gap-2.5 ${logoClass} transition-colors`}>
          <OrbitLinkLogo size={28} white={onHomeHero} />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`relative ${linkClass} after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--accent)] after:transition-all hover:after:w-full`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/login?mode=register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        <button type="button" className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[var(--border)] bg-white lg:hidden"
          >
            <div className="container py-4">
              {NAV.map((item) => (
                <a key={item.label} href={item.href} className="block py-3 font-semibold" onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 pb-2">
                <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
                <Link to="/login?mode=register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
