import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, AlertCircle, CheckCircle, Store, Shield, Crown, Sparkles, Eye, EyeOff, ChevronLeft } from "lucide-react";
import OrbitLinkLogo from "../components/OrbitLinkLogo";

// Role selection step
function RoleSelector({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45 }}
      style={{ width: "100%", maxWidth: 480 }}
    >
      <h2 className="text-center text-2xl font-extrabold text-[var(--navy)]">
        <OrbitLinkLogo size={22} text />
      </h2>
      <p className="mt-2 text-center text-sm text-[var(--text-muted)]">Who are you signing in as?</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2.5rem" }}>
        {[
          {
            key: "admin",
            icon: Crown,
            title: "Admin",
            desc: "Platform dashboard · Manage all shops · AI monitoring",
            accent: "#7c3aed",
            soft: "#f3f0ff",
          },
          {
            key: "shop",
            icon: Store,
            title: "Shop Owner",
            desc: "Inventory · Sales · Orders · AI agents · Analytics",
            accent: "var(--accent)",
            soft: "var(--accent-soft)",
          },
        ].map((r) => (
          <motion.button
            key={r.key}
            type="button"
            whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(r.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              padding: "1.5rem",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              background: "#fff",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = r.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: r.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <r.icon size={26} style={{ color: r.accent }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--navy)" }}>{r.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>{r.desc}</div>
            </div>
            <ArrowRight size={18} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
          </motion.button>
        ))}
      </div>
      <p className="mt-8 text-center">
        <Link to="/" className="text-sm font-semibold text-[var(--accent)]">← Back to home</Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  // "role-select" | "admin" | "shop"
  const [step, setStep] = useState("role-select");
  const [isLogin, setIsLogin] = useState(params.get("mode") !== "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("business_admin");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const roleForRegister = step === "admin" ? "super_admin" : accountType;
      const payload = isLogin ? { email, password } : { name, email, password, role: roleForRegister };
      const r = await api.post(endpoint, payload);
      login({
        _id: r.data._id,
        name: r.data.name,
        email: r.data.email,
        role: r.data.role,
        token: r.data.token,
        storeName: r.data.storeName,
      });
      setStatus("success");
      setMessage(isLogin ? `Welcome back, ${r.data.name}!` : "Account created!");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Authentication failed.");
      setLoading(false);
    }
  };

  const isAdmin = step === "admin";
  const accentColor = isAdmin ? "#7c3aed" : "var(--accent)";

  return (
    <div className="auth-split">
      <motion.div
        className="auth-brand"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hero-mesh absolute inset-0 opacity-80" />
        <div className="hero-grid absolute inset-0" />
        <div className="relative z-10">
          <p className="eyebrow flex items-center gap-2" style={{ color: "var(--accent)" }}>
            <Sparkles size={14} /> OrbitLink
          </p>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, marginTop: "1.25rem", lineHeight: 1.1 }}>
            Your store. <br />
            <span style={{ color: "var(--accent)" }}>Smarter.</span>
          </h1>
          <p style={{ marginTop: "1.25rem", opacity: 0.75, maxWidth: 400 }}>
            React + Node + MongoDB — inventory, CSV import, sales, and AI agents in one dashboard.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {["📥 Data Agent", "📊 Sales Agent", "🔮 Prediction Agent", "⚖️ Decision Agent", "🛒 Order Agent"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", opacity: 0.8, fontSize: "0.875rem" }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="auth-panel">
        <AnimatePresence mode="wait">
          {step === "role-select" ? (
            <RoleSelector key="role-select" onSelect={setStep} />
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
              style={{
                width: "100%",
                maxWidth: 440,
                background: "#fff",
                padding: "2.5rem",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-lg)",
                border: `1px solid var(--border)`,
              }}
            >
              {/* Back + header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => { setStep("role-select"); setStatus("idle"); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: 0 }}
                >
                  <ChevronLeft size={18} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: isAdmin ? "#f3f0ff" : "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isAdmin ? <Crown size={16} style={{ color: "#7c3aed" }} /> : <Store size={16} style={{ color: "var(--accent)" }} />}
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--navy)" }}>{isAdmin ? "Admin" : "Shop Owner"}</span>
                </div>
              </div>

              <h2 className="text-center text-2xl font-extrabold text-[var(--navy)]">
                <OrbitLinkLogo size={22} text />
              </h2>
              <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
                {isLogin ? `Sign in to your ${isAdmin ? "admin" : "store"} dashboard` : "Create your account"}
              </p>

              {/* Login / Register tabs */}
              <div className="mt-8 flex rounded-full p-1" style={{ background: "var(--surface-muted)", border: "1px solid var(--border)" }}>
                {["Login", "Register"].map((label, i) => {
                  const active = (i === 0 && isLogin) || (i === 1 && !isLogin);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { setIsLogin(i === 0); setStatus("idle"); }}
                      className="auth-tab-btn flex-1 rounded-full py-2.5 text-sm font-bold transition-all"
                      style={{
                        background: active ? (isAdmin ? "#7c3aed" : "var(--navy)") : "transparent",
                        color: active ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <form className="mt-6" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                )}
                {!isLogin && !isAdmin && (
                  <div className="form-group">
                    <label className="form-label">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "business_admin", icon: Store, label: "Merchant" },
                        { id: "customer", icon: Shield, label: "Customer" },
                      ].map((t) => (
                        <motion.button
                          key={t.id}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAccountType(t.id)}
                          className="rounded-xl border-2 p-4 text-center transition-colors"
                          style={{
                            borderColor: accountType === t.id ? "var(--accent)" : "var(--border)",
                            background: accountType === t.id ? "var(--accent-soft)" : "transparent",
                            outline: "none",
                          }}
                        >
                          <t.icon size={22} className="mx-auto" style={{ color: "var(--accent)" }} />
                          <div className="mt-2 text-xs font-bold">{t.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: 0 }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {status === "error" && (
                  <div className="alert alert-danger" style={{ borderRadius: "var(--radius-lg)" }}>
                    <AlertCircle size={18} /> {message}
                  </div>
                )}
                {status === "success" && (
                  <div className="alert alert-success" style={{ borderRadius: "var(--radius-lg)" }}>
                    <CheckCircle size={18} /> {message}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn w-full"
                  disabled={loading}
                  style={{
                    marginTop: "0.25rem",
                    background: isAdmin ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "linear-gradient(135deg,var(--accent),#ff7a2e)",
                    color: "#fff",
                    boxShadow: isAdmin ? "0 8px 24px rgba(124,58,237,0.35)" : "0 8px 24px rgba(232,93,4,0.35)",
                  }}
                >
                  {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              {isAdmin && isLogin && (
                <p className="mt-4 text-center text-xs text-[var(--text-light)]">Demo: admin@commerceos.app / admin123</p>
              )}
              {!isAdmin && isLogin && (
                <p className="mt-4 text-center text-xs text-[var(--text-light)]">Demo: merchant@commerceos.app / merchant123</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

