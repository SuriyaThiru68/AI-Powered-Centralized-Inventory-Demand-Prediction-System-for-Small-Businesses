import { Link } from "react-router-dom";
import OrbitLinkLogo from "./OrbitLinkLogo";

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--navy-deep)] text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <OrbitLinkLogo size={24} white text />
          <p className="mt-4 max-w-md text-sm text-white/65">
            AI-powered inventory management with 9 specialized agents, demand forecasting, and automated alerts for modern businesses.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><a href="#platform">Features</a></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">Connect</h4>
          <p className="mt-4 text-sm text-white/75">hello@orbitlink.app</p>
          <div className="mt-3 flex gap-4">
            <a href="#" className="text-white/60 hover:text-[var(--accent)] transition-colors">Twitter</a>
            <a href="#" className="text-white/60 hover:text-[var(--accent)] transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/45">
        © {new Date().getFullYear()} OrbitLink · Amsterdam, Netherlands
      </div>
    </footer>
  );
}
