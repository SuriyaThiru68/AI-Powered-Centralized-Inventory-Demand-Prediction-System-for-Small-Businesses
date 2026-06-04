import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Public
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

// Layout
import DashboardLayout from "./components/DashboardLayout";

// Shop Owner pages
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import UploadPage from "./pages/UploadPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import AlertsPage from "./pages/AlertsPage";
import AgentsPage from "./pages/AgentsPage";

// Admin pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ManageShopsPage from "./pages/admin/ManageShopsPage";
import AiMonitoringPage from "./pages/admin/AiMonitoringPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";

const SHOP_ROLES = ["business_admin", "customer"];
const ADMIN_ROLES = ["super_admin"];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard shell */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* ── Index: role-aware redirect ── */}
            <Route index element={<RoleAwareDashboard />} />

            {/* ── Shop Owner routes ── */}
            <Route path="products"  element={<PrivateRoute roles={SHOP_ROLES}><ProductsPage /></PrivateRoute>} />
            <Route path="upload"    element={<PrivateRoute roles={SHOP_ROLES}><UploadPage /></PrivateRoute>} />
            <Route path="sales"     element={<PrivateRoute roles={SHOP_ROLES}><SalesPage /></PrivateRoute>} />
            <Route path="orders"    element={<PrivateRoute roles={SHOP_ROLES}><OrdersPage /></PrivateRoute>} />
            <Route path="analytics" element={<PrivateRoute roles={SHOP_ROLES}><AnalyticsPage /></PrivateRoute>} />
            <Route path="alerts"    element={<PrivateRoute roles={SHOP_ROLES}><AlertsPage /></PrivateRoute>} />
            <Route path="agents"    element={<PrivateRoute roles={SHOP_ROLES}><AgentsPage /></PrivateRoute>} />
            <Route path="settings"  element={<SettingsPage />} />

            {/* ── Admin routes ── */}
            <Route path="admin/shops"     element={<PrivateRoute roles={ADMIN_ROLES}><ManageShopsPage /></PrivateRoute>} />
            <Route path="admin/ai"        element={<PrivateRoute roles={ADMIN_ROLES}><AiMonitoringPage /></PrivateRoute>} />
            <Route path="admin/analytics" element={<PrivateRoute roles={ADMIN_ROLES}><AdminAnalyticsPage /></PrivateRoute>} />

            {/* Legacy: keep /dashboard/businesses accessible for admin */}
            <Route path="businesses" element={<PrivateRoute roles={ADMIN_ROLES}><ManageShopsPage /></PrivateRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

/** Renders the right dashboard index based on role */
function RoleAwareDashboard() {
  return <DashboardPage />;
}
