import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../lib/api";
import { StaggerGrid, StaggerItem } from "../../components/ScrollReveal";
import { Building2, Users, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/businesses").then((r) => setBusinesses(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = businesses.filter((b) => b.status === "active").length;
  const suspended = businesses.filter((b) => b.status === "suspended").length;

  const stats = [
    { label: "Total Shops", value: businesses.length, icon: Building2 },
    { label: "Active Shops", value: active, icon: ShieldCheck },
    { label: "Suspended", value: suspended, icon: Users, danger: true },
    { label: "Revenue Est.", value: "—", icon: TrendingUp },
  ];

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Platform Admin</p>
        <h1 className="page-title">System Dashboard</h1>
        <p className="page-subtitle">Overview of all registered businesses and platform health.</p>
      </header>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : (
        <>
          <StaggerGrid className="stats-grid">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <motion.div className="stat-card" whileHover={{ y: -4 }}>
                  <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <s.icon size={13} /> {s.label}
                  </div>
                  <div className="stat-value" style={s.danger && s.value > 0 ? { color: "var(--danger)" } : undefined}>
                    {s.value}
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>

          <div className="table-wrap" style={{ marginTop: "2rem" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ color: "var(--navy)" }}>Recent Businesses</strong>
              <Link to="/dashboard/admin/shops" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Owner</th>
                  <th>Plan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {businesses.slice(0, 6).map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td style={{ color: "var(--text-muted)" }}>{b.ownerId?.name || "—"}</td>
                    <td>
                      <span className="badge" style={{ background: "#e8f0fe", color: "#1a73e8" }}>{b.plan || "free"}</span>
                    </td>
                    <td>
                      <span className={`badge ${b.status === "active" ? "badge-ok" : "badge-low"}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
                {businesses.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No businesses yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
