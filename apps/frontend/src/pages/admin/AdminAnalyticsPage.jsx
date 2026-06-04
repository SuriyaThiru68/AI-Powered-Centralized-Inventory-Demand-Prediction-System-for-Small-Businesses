import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Building2, Package, ShoppingCart } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/businesses").then((r) => setBusinesses(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Build a simple plan distribution chart
  const planCounts = businesses.reduce((acc, b) => {
    const p = b.plan || "free";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const planData = Object.entries(planCounts).map(([name, value]) => ({ name, value }));

  // Monthly signups (by createdAt month)
  const monthCounts = businesses.reduce((acc, b) => {
    if (!b.createdAt) return acc;
    const m = new Date(b.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  const signupData = Object.entries(monthCounts).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: "Total Businesses", value: businesses.length, icon: Building2 },
    { label: "Active", value: businesses.filter((b) => b.status === "active").length, icon: TrendingUp },
    { label: "Free Plan", value: businesses.filter((b) => (b.plan || "free") === "free").length, icon: Package },
    { label: "Paid Plans", value: businesses.filter((b) => b.plan && b.plan !== "free").length, icon: ShoppingCart },
  ];

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Admin</p>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Platform-wide business and growth metrics.</p>
      </header>

      {loading ? <p style={{ color: "var(--text-muted)" }}>Loading…</p> : (
        <>
          <div className="stats-grid" style={{ marginBottom: "2rem" }}>
            {stats.map((s) => (
              <motion.div key={s.label} className="stat-card" whileHover={{ y: -4 }}>
                <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><s.icon size={13} /> {s.label}</div>
                <div className="stat-value">{s.value}</div>
              </motion.div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="table-wrap" style={{ padding: "1.5rem" }}>
              <strong style={{ color: "var(--navy)", display: "block", marginBottom: "1rem" }}>Businesses by Plan</strong>
              {planData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={planData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>No data yet.</p>}
            </div>

            <div className="table-wrap" style={{ padding: "1.5rem" }}>
              <strong style={{ color: "var(--navy)", display: "block", marginBottom: "1rem" }}>Monthly Signups</strong>
              {signupData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={signupData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>No data yet.</p>}
            </div>
          </div>
        </>
      )}
    </>
  );
}
