import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../lib/api";
import { Building2, Search } from "lucide-react";

const STATUS_COLORS = {
  active: { bg: "#e8f5ef", color: "var(--success)" },
  suspended: { bg: "#fdecea", color: "var(--danger)" },
  pending: { bg: "#fff8e1", color: "#b45309" },
};

export default function ManageShopsPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/businesses").then((r) => setBusinesses(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = businesses.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Admin</p>
        <h1 className="page-title">Manage Shops</h1>
        <p className="page-subtitle">All registered businesses on the platform.</p>
      </header>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 360, marginBottom: "1.5rem" }}>
        <Search size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          className="form-control"
          style={{ paddingLeft: "2.5rem" }}
          placeholder="Search shops or owners…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const sc = STATUS_COLORS[b.status] || { bg: "#f4f6f8", color: "var(--text-muted)" };
                return (
                  <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Building2 size={15} style={{ color: "var(--accent)" }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{b.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{b.ownerId?.name || "—"}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{b.ownerId?.email || "—"}</td>
                    <td>
                      <span className="badge" style={{ background: "#e8f0fe", color: "#1a73e8", textTransform: "capitalize" }}>{b.plan || "free"}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: sc.bg, color: sc.color, textTransform: "capitalize" }}>{b.status}</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No businesses found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
