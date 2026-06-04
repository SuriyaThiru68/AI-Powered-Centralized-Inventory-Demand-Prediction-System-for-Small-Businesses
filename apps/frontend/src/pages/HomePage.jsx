import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ContactForm from "../components/ContactForm";
import OrbitLinkLogo from "../components/OrbitLinkLogo";
import { ArrowRight, Brain, TrendingUp, Package, Bell, ChevronRight } from "lucide-react";

// Fixed random values so they don't change on every render
const FLOAT_ITEMS = [
  { w: 340, h: 280, left: 10,  top: 15,  dur: 14, dy: 40,  dx: -30, accent: true  },
  { w: 180, h: 200, left: 70,  top: 60,  dur: 18, dy: -50, dx: 40,  accent: false },
  { w: 260, h: 260, left: 40,  top: 80,  dur: 12, dy: 30,  dx: 20,  accent: true  },
  { w: 120, h: 150, left: 85,  top: 10,  dur: 20, dy: -20, dx: -40, accent: false },
  { w: 200, h: 220, left: 5,   top: 55,  dur: 16, dy: 50,  dx: 30,  accent: true  },
  { w: 280, h: 180, left: 55,  top: 30,  dur: 22, dy: -35, dx: -25, accent: false },
  { w: 160, h: 190, left: 25,  top: 40,  dur: 15, dy: 20,  dx: 45,  accent: true  },
  { w: 300, h: 240, left: 65,  top: 70,  dur: 19, dy: -40, dx: 15,  accent: false },
];

function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {FLOAT_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: item.w,
            height: item.h,
            left: `${item.left}%`,
            top: `${item.top}%`,
            background: `radial-gradient(circle, ${
              item.accent ? "rgba(232,93,4,0.08)" : "rgba(255,255,255,0.03)"
            }, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{ y: [0, item.dy, 0], x: [0, item.dx, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: item.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function MagneticLink({ children, to, className = "" }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    setPos({ x: (clientX - (left + width / 2)) * 0.3, y: (clientY - (top + height / 2)) * 0.3 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={pos}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      style={{ display: "inline-block" }}
    >
      <Link to={to} className={className}>{children}</Link>
    </motion.div>
  );
}

const FEATURES = [
  { icon: Brain,     title: "AI Demand Prediction",  color: "#e85d04", desc: "ML models trained on your sales patterns forecast exactly what you need — next week, next month, next quarter." },
  { icon: TrendingUp,title: "Real-Time Analytics",   color: "#10b981", desc: "Live dashboards show profit margins, top sellers, and revenue trends the moment they happen." },
  { icon: Package,   title: "Smart Automation",      color: "#3b82f6", desc: "Auto-reorder points, low-stock alerts, and purchase order suggestions run in the background." },
  { icon: Bell,      title: "Multi-Channel Alerts",  color: "#f59e0b", desc: "Get notified via email and WhatsApp when inventory needs attention. Never miss a critical restock." },
];

const AGENTS = [
  { emoji: "📥", name: "Data Agent",         desc: "Catalog quality" },
  { emoji: "📊", name: "Sales Agent",        desc: "Trend analysis" },
  { emoji: "🔮", name: "Prediction Agent",   desc: "Demand forecasting" },
  { emoji: "⚖️", name: "Decision Agent",    desc: "Reorder logic" },
  { emoji: "🛒", name: "Order Agent",        desc: "PO automation" },
  { emoji: "🔄", name: "Automation Agent",   desc: "Workflow rules" },
  { emoji: "📱", name: "Notification Agent", desc: "Alert summaries" },
  { emoji: "💰", name: "Profit Agent",       desc: "Margin tracking" },
  { emoji: "🗣", name: "Voice Agent",        desc: "Natural queries" },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div style={{ overflowX: "hidden" }}>
      <SiteHeader />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0f1923 100%)" }}
      >
        <FloatingElements />

        {/* animated dot-grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(232,93,4,0.18) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          }}
        />

        <motion.div
          className="container relative z-10 py-32 text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/70 text-sm font-medium mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="w-2 h-2 rounded-full bg-[#e85d04] animate-pulse" />
            AI-Powered Inventory Platform
          </motion.div>

          {/* logo */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <OrbitLinkLogo size={52} white />
          </motion.div>

          {/* headline */}
          <motion.h1
            className="text-white font-black leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Intelligent Inventory
            <br />
            <span className="relative">
              <span style={{ color: "#e85d04" }}>Designed to Scale</span>
              <motion.span
                className="absolute left-0 right-0"
                style={{ bottom: "4px", height: "10px", background: "#e85d04", opacity: 0.2, borderRadius: "4px", zIndex: -1 }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          </motion.h1>

          <motion.p
            className="mt-8 text-white/60 max-w-2xl mx-auto leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            9 AI agents working 24/7 to predict demand, automate reorders, and optimize your
            inventory with machine learning precision.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-12 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <MagneticLink
              to="/login?mode=register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#e85d04,#ff7a2e)", boxShadow: "0 8px 32px rgba(232,93,4,0.4)" }}
            >
              Start Free Trial <ArrowRight size={16} />
            </MagneticLink>

            <MagneticLink
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white border-2 border-white/20 hover:border-white/40 transition-colors backdrop-blur-sm"
            >
              Sign In
            </MagneticLink>
          </motion.div>

          {/* stats */}
          <motion.div
            className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {[
              { value: "9",    label: "AI Agents" },
              { value: "24/7", label: "Monitoring" },
              { value: "98%",  label: "Accuracy"  },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -6, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl py-6 px-4 text-center hover:border-[#e85d04]/40 transition-colors">
                  <div className="text-3xl font-black" style={{ color: "#e85d04" }}>{stat.value}</div>
                  <div className="text-xs text-white/50 mt-1 font-medium tracking-wide uppercase">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* scroll pill */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-9 border-2 border-white/20 rounded-full flex justify-center pt-1">
            <motion.div
              className="w-1 h-2 bg-white/40 rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="platform" className="py-32 bg-white">
        <div className="container">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6"
              style={{ background: "rgba(232,93,4,0.1)", color: "#e85d04" }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Powered by AI
            </motion.span>
            <h2 className="font-black text-[#0f1923] leading-tight" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              Your Inventory,{" "}
              <span style={{ color: "#e85d04" }}>Supercharged</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="relative p-10 border border-gray-100 rounded-3xl bg-white overflow-hidden group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: "0 24px 64px rgba(0,0,0,0.08)" }}
              >
                {/* bg glow on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 10% 10%, ${f.color}08, transparent 60%)` }}
                />
                <motion.div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                  style={{ backgroundColor: `${f.color}15` }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <f.icon size={28} style={{ color: f.color }} />
                </motion.div>
                <h3 className="text-xl font-bold text-[#0f1923] mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
                <div className="mt-6 inline-flex items-center gap-1 text-sm font-bold" style={{ color: f.color }}>
                  Learn more <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9 AGENTS ── */}
      <section id="agents" className="relative py-32 text-white overflow-hidden" style={{ background: "#0a0a0a" }}>
        <FloatingElements />
        <div className="container relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-black leading-tight mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              Meet Your <span style={{ color: "#e85d04" }}>9 AI Agents</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
              Each agent specializes in one part of your business, running automatically in the background.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.name}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -6, scale: 1.03 }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "radial-gradient(circle at 50% 0%, rgba(232,93,4,0.15), transparent 70%)" }}
                />
                <div
                  className="relative rounded-2xl p-6 border border-white/8 transition-colors group-hover:border-[#e85d04]/40"
                  style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)" }}
                >
                  <div className="text-3xl mb-3">{agent.emoji}</div>
                  <div className="font-bold text-base text-white">{agent.name}</div>
                  <div className="text-xs text-white/40 mt-1">{agent.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-32" style={{ background: "#f8f8f8" }}>
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="font-black text-[#0f1923] leading-tight mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                Let's Build Something
                <br />
                <span style={{ color: "#e85d04" }}>Great Together</span>
              </h2>
              <p className="text-gray-500 text-lg">Start your free trial today. No credit card required.</p>
            </motion.div>

            <motion.div
              className="bg-white rounded-3xl p-10 md:p-14"
              style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.08)" }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
