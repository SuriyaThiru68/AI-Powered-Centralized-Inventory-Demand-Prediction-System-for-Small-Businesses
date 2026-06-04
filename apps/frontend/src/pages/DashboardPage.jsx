import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { StaggerGrid, StaggerItem } from "../components/ScrollReveal";
import { ArrowRight, Package, TrendingUp, AlertTriangle } from "lucide-react";
import AdminDashboardPage from "./admin/AdminDashboardPage";

export default function DashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, remainingStock: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    if (isSuperAdmin) { setLoading(false); return; }
    api
      .get("/api/products")
      .then((r) => {
        const data = r.data.data || [];
        setProducts(data);
        setStats(
          r.data.stats || {
            totalProducts: data.length,
            remainingStock: data.reduce((s, p) => s + (p.quantity || 0), 0),
            totalValue: data.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0),
          }
        );
      })
      .finally(() => setLoading(false));
  }, [isSuperAdmin]);

  if (isSuperAdmin) return <AdminDashboardPage />;

  const lowStock = products.filter((p) => (p.quantity || 0) < 20);
  if (loading) return <p>Loading…</p>;

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Store</p>
        <h1 className="page-title">Welcome, {user?.name}</h1>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
          <Link to="/dashboard/sales" className="btn btn-primary">Process Sale</Link>
          <Link to="/dashboard/products" className="btn btn-outline">Products</Link>
        </div>
      </header>
      <StaggerGrid className="stats-grid">
        {[
          { label: "Catalog Value", value: `₹${stats.totalValue.toLocaleString("en-IN")}`, icon: TrendingUp },
          { label: "Stock Units", value: stats.remainingStock, icon: Package },
          { label: "Active SKUs", value: stats.totalProducts, icon: Package },
          { label: "Low Stock", value: lowStock.length, icon: AlertTriangle, danger: true },
        ].map((s) => (
          <StaggerItem key={s.label}>
            <motion.div className="stat-card" whileHover={{ y: -6 }}>
              <div className="stat-label flex items-center gap-2"><s.icon size={14} /> {s.label}</div>
              <div className="stat-value" style={s.danger ? { color: "var(--danger)" } : undefined}>{s.value}</div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </>
  );
}
