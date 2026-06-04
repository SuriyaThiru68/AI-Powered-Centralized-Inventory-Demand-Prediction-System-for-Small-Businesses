import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, Package, ShoppingCart, FileText,
  Settings, LogOut, BarChart2, Building2, Bot, AlertTriangle,
  Crown, MonitorDot,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import OrbitLinkLogo from "./OrbitLinkLogo";

const SHOP_NAV = [
  { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/products",  icon: Package,         label: "Products" },
  { href: "/dashboard/upload",    icon: Upload,          label: "Upload CSV" },
  { href: "/dashboard/sales",     icon: ShoppingCart,    label: "Sales" },
  { href: "/dashboard/analytics", icon: BarChart2,       label: "Analytics" },
  { href: "/dashboard/orders",    icon: FileText,        label: "Orders" },
  { href: "/dashboard/alerts",    icon: AlertTriangle,   label: "Alerts" },
  { href: "/dashboard/agents",    icon: Bot,             label: "AI Agents" },
  { href: "/dashboard/settings",  icon: Settings,        label: "Settings" },
];

const ADMIN_NAV = [
  { href: "/dashboard",                icon: LayoutDashboard, label: "System Dashboard" },
  { href: "/dashboard/admin/shops",    icon: Building2,       label: "Manage Shops" },
  { href: "/dashboard/admin/ai",       icon: MonitorDot,      label: "AI Monitoring" },
  { href: "/dashboard/admin/analytics",icon: BarChart2,       label: "Analytics" },
  { href: "/dashboard/settings",       icon: Settings,        label: "Settings" },
];

export default function DashboardSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "super_admin";
  const items = isAdmin ? ADMIN_NAV : SHOP_NAV;

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-brand">
        <OrbitLinkLogo size={26} white text />
      </div>

      {/* Role pill */}
      <div style={{ padding: "0.75rem 1.5rem 0" }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: "0.68rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          padding: "0.25rem 0.65rem",
          borderRadius: 999,
          background: isAdmin ? "rgba(124,58,237,0.18)" : "rgba(232,93,4,0.15)",
          color: isAdmin ? "#c4b5fd" : "var(--accent)",
        }}>
          {isAdmin ? <Crown size={10} /> : <Package size={10} />}
          {isAdmin ? "Admin" : "Shop Owner"}
        </span>
      </div>

      <nav className="dashboard-nav" style={{ marginTop: "0.5rem" }}>
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} to={item.href} className={active ? "active" : ""}>
              <item.icon size={17} /> {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "1rem 1.5rem" }}>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.name}
        </div>
        <button
          type="button"
          onClick={logout}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", padding: 0 }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
