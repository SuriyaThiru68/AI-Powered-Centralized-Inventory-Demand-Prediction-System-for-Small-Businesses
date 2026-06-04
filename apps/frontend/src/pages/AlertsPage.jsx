import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import {
  AlertTriangle, CheckCircle, Package, RefreshCw,
  Mail, MessageCircle, Send, Settings, Save, Bell, BellOff,
} from "lucide-react";

// ── Alert Settings Panel ──────────────────────────────────────────────────────
function AlertSettingsPanel({ onClose }) {
  const [settings, setSettings] = useState({ alertEmail: "", alertWhatsapp: "", alertThreshold: 20, alertEnabled: true });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get("/api/alerts/settings").then((r) => setSettings(r.data.settings)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      await api.put("/api/alerts/settings", settings);
      setMsg({ type: "success", text: "Settings saved." });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.message || "Failed to save." });
    } finally { setSaving(false); }
  };

  const testAlert = async (channel) => {
    setTesting(channel); setMsg(null);
    try {
      const r = await api.post("/api/alerts/test", { channel });
      setMsg({ type: "success", text: `Test ${channel} alert sent!` });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.message || `Test ${channel} failed.` });
    } finally { setTesting(null); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "1.75rem", marginBottom: "2rem", boxShadow: "var(--shadow-md)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <strong style={{ color: "var(--navy)", fontSize: "1rem" }}>Alert Settings</strong>
        <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}>×</button>
      </div>

      {/* Enable toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--surface-muted)", borderRadius: "var(--radius-lg)", marginBottom: "1.25rem" }}>
        <span style={{ fontWeight: 600, color: "var(--navy)", display: "flex", alignItems: "center", gap: 8 }}>
          {settings.alertEnabled ? <Bell size={16} style={{ color: "var(--accent)" }} /> : <BellOff size={16} style={{ color: "var(--text-muted)" }} />}
          Alerts {settings.alertEnabled ? "Enabled" : "Disabled"}
        </span>
        <button
          type="button"
          onClick={() => setSettings((s) => ({ ...s, alertEnabled: !s.alertEnabled }))}
          style={{
            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
            background: settings.alertEnabled ? "var(--accent)" : "var(--border)",
            position: "relative", transition: "background 0.2s",
          }}
        >
          <span style={{
            position: "absolute", top: 3, left: settings.alertEnabled ? 22 : 3,
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Email */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Mail size={12} /> Email Address
          </label>
          <input
            type="email"
            className="form-control"
            placeholder="alerts@example.com"
            value={settings.alertEmail}
            onChange={(e) => setSettings((s) => ({ ...s, alertEmail: e.target.value }))}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ marginTop: "0.4rem", width: "100%", fontSize: "0.75rem" }}
            onClick={() => testAlert("email")}
            disabled={!settings.alertEmail || testing === "email"}
          >
            {testing === "email" ? "Sending…" : "Send Test Email"}
          </button>
        </div>

        {/* WhatsApp */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <MessageCircle size={12} /> WhatsApp Number
          </label>
          <input
            type="tel"
            className="form-control"
            placeholder="+91 98765 43210"
            value={settings.alertWhatsapp}
            onChange={(e) => setSettings((s) => ({ ...s, alertWhatsapp: e.target.value }))}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ marginTop: "0.4rem", width: "100%", fontSize: "0.75rem" }}
            onClick={() => testAlert("whatsapp")}
            disabled={!settings.alertWhatsapp || testing === "whatsapp"}
          >
            {testing === "whatsapp" ? "Sending…" : "Send Test WhatsApp"}
          </button>
        </div>
      </div>

      {/* Threshold */}
      <div className="form-group" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <label className="form-label">Low Stock Threshold (qty)</label>
        <input
          type="number"
          className="form-control"
          min={1} max={500}
          value={settings.alertThreshold}
          onChange={(e) => setSettings((s) => ({ ...s, alertThreshold: parseInt(e.target.value) || 20 }))}
          style={{ maxWidth: 160 }}
        />
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
          Products at or below this quantity will trigger alerts.
        </p>
      </div>

      {msg && (
        <div className={`alert ${msg.type === "success" ? "alert-success" : "alert-danger"}`} style={{ borderRadius: "var(--radius-lg)", marginBottom: "1rem" }}>
          {msg.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} {msg.text}
        </div>
      )}

      <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Save size={14} /> {saving ? "Saving…" : "Save Settings"}
      </button>
    </motion.div>
  );
}

// ── Main AlertsPage ────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const [lowStock, setLowStock] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [prodRes, sugRes] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/orders/ai-suggestions"),
      ]);
      const products = prodRes.data.data || [];
      setLowStock(products.filter((p) => (p.quantity || 0) < 20));
      setSuggestions(sugRes.data.suggestions || []);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const sendAlerts = async () => {
    setSending(true); setSendResult(null);
    try {
      const r = await api.post("/api/alerts/send");
      setSendResult({ type: "success", text: r.data.message, channels: r.data.channels });
    } catch (e) {
      setSendResult({ type: "error", text: e.response?.data?.message || "Failed to send alerts." });
    } finally { setSending(false); }
  };

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Loading alerts…</p>;

  return (
    <>
      <header className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p className="eyebrow">Store</p>
            <h1 className="page-title">Alerts</h1>
            <p className="page-subtitle">Low stock warnings, AI reorder suggestions, and notification dispatch.</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={fetchData} disabled={refreshing} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowSettings((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Settings size={13} /> Settings
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={sendAlerts}
              disabled={sending || lowStock.length === 0}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Send size={13} /> {sending ? "Sending…" : "Send Alerts"}
            </button>
          </div>
        </div>
      </header>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && <AlertSettingsPanel onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      {/* Send result */}
      <AnimatePresence>
        {sendResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`alert ${sendResult.type === "success" ? "alert-success" : "alert-danger"}`}
            style={{ borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", alignItems: "flex-start" }}
          >
            <div>
              {sendResult.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <div>{sendResult.text}</div>
              {sendResult.channels && (
                <div style={{ marginTop: "0.35rem", fontSize: "0.8rem", opacity: 0.8, display: "flex", gap: "1rem" }}>
                  {sendResult.channels.email && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Mail size={12} /> Email: {sendResult.channels.email.sent ? "✓ Sent" : `✗ ${sendResult.channels.email.reason}`}
                    </span>
                  )}
                  {sendResult.channels.whatsapp && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MessageCircle size={12} /> WhatsApp: {sendResult.channels.whatsapp.sent ? "✓ Sent" : `✗ ${sendResult.channels.whatsapp.reason}`}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button type="button" onClick={() => setSendResult(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", opacity: 0.6, fontSize: "1.1rem" }}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary chips */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#fdecea", borderRadius: "var(--radius-lg)", padding: "0.55rem 1rem", fontSize: "0.82rem", fontWeight: 600, color: "var(--danger)" }}>
          <AlertTriangle size={14} /> {lowStock.filter((p) => p.quantity === 0).length} Out of Stock
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff8e1", borderRadius: "var(--radius-lg)", padding: "0.55rem 1rem", fontSize: "0.82rem", fontWeight: 600, color: "#b45309" }}>
          <AlertTriangle size={14} /> {lowStock.filter((p) => p.quantity > 0).length} Low Stock
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#e8f0fe", borderRadius: "var(--radius-lg)", padding: "0.55rem 1rem", fontSize: "0.82rem", fontWeight: 600, color: "#1a73e8" }}>
          <Package size={14} /> {suggestions.length} Reorder Suggestions
        </div>
      </div>

      {/* Low stock table */}
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>Low Stock Items</h2>
      {lowStock.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--success)", background: "#e8f5ef", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", marginBottom: "2rem" }}>
          <CheckCircle size={18} /> All products are adequately stocked.
        </div>
      ) : (
        <div className="table-wrap" style={{ marginBottom: "2rem" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th>Category</th><th>Remaining</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <motion.tr key={p._id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{p.sku || "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{p.category || "—"}</td>
                  <td><span style={{ fontWeight: 700, color: p.quantity === 0 ? "var(--danger)" : "#b45309" }}>{p.quantity}</span></td>
                  <td>
                    <span className="badge" style={{ background: p.quantity === 0 ? "#fdecea" : "#fff8e1", color: p.quantity === 0 ? "var(--danger)" : "#b45309" }}>
                      {p.quantity === 0 ? "Out of Stock" : "Low Stock"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reorder suggestions */}
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>AI Reorder Suggestions</h2>
      {suggestions.length === 0 ? (
        <div style={{ color: "var(--text-muted)", background: "var(--surface-muted)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center" }}>
          No reorder suggestions at this time.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
          {suggestions.map((s) => (
            <motion.div key={s.productId} className="card" whileHover={{ y: -4 }} style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.92rem" }}>{s.productName}</span>
                <span className="badge badge-low">REORDER</span>
              </div>
              <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Current stock</span>
                  <span style={{ fontWeight: 600, color: "var(--danger)" }}>{s.currentStock}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Suggested order</span>
                  <span style={{ fontWeight: 600, color: "var(--navy)" }}>{s.suggestedReorderQty}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* How-to setup note */}
      <div style={{ marginTop: "2.5rem", padding: "1.25rem 1.5rem", background: "var(--surface-muted)", borderRadius: "var(--radius-lg)", borderLeft: "4px solid var(--accent)" }}>
        <strong style={{ color: "var(--navy)", fontSize: "0.85rem" }}>📬 Setup Email & WhatsApp Alerts</strong>
        <ul style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          <li><strong>Email:</strong> Add <code>EMAIL_FROM</code> and <code>EMAIL_PASS</code> (Gmail App Password) to <code>apps/backend/.env</code></li>
          <li><strong>WhatsApp:</strong> Add <code>TWILIO_ACCOUNT_SID</code> and <code>TWILIO_AUTH_TOKEN</code> from <a href="https://twilio.com" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>twilio.com</a></li>
          <li>Click <strong>Settings</strong> above to enter your email/phone and save preferences</li>
          <li>Click <strong>Send Alerts</strong> to dispatch notifications for all low-stock items</li>
        </ul>
      </div>
    </>
  );
}
