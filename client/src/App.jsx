import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, UploadCloud, Package, ShoppingCart,
  BarChart2, Bell, FileText, Settings, Bot, MessageSquare, 
  ChevronRight, LogOut, Sparkles, X, Send, ArrowRight
} from 'lucide-react';
import api from './api';

import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import LocationDemandPage from './pages/LocationDemandPage';
import AlertsPage from './pages/AlertsPage';
import OrdersPage from './pages/OrdersPage';
import AutomationPage from './pages/AutomationPage';
import SettingsPage from './pages/SettingsPage';
import InvoicePage from './pages/InvoicePage';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';

// ─── NAVIGATION CONFIG ──────────────────────────────────────────────
const ADMIN_NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics',  icon: BarChart2,       label: 'Analytics' },
  { to: '/alerts',     icon: Bell,            label: 'Alerts', badge: true },
  { to: '/automation', icon: Bot,             label: 'Automation' },
  { to: '/settings',   icon: Settings,        label: 'Settings' },
];

const CUSTOMER_NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',     icon: UploadCloud,     label: 'Upload Products' },
  { to: '/products',   icon: Package,         label: 'Products' },
  { to: '/sales',      icon: ShoppingCart,    label: 'Sales' },
  { to: '/orders',     icon: FileText,        label: 'Orders' },
  { to: '/alerts',     icon: Bell,            label: 'Alerts' },
  { to: '/automation', icon: Bot,             label: 'Automation' },
];

// ─── COMPONENTS ────────────────────────────────────────────────────

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navItems = user?.role === 'admin' ? ADMIN_NAV : CUSTOMER_NAV;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand-icon" title="InventoryOS">
        <Package size={22} strokeWidth={3} />
      </div>

      <nav className="sidebar-nav">
        {navItems.map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={`nav-item ${location.pathname === n.to ? 'active' : ''}`}
          >
            <n.icon size={20} />
            <span>{n.label}</span>
            {n.badge && <div className="nav-badge-dot" />}
          </Link>
        ))}
      </nav>

      <div className="sidebar-avatar" onClick={onLogout}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
              {user?.name?.[0]}
           </div>
           <label>{user?.name}</label>
        </div>
        <LogOut size={16} color="var(--text-light)" />
      </div>
    </aside>
  );
}

function AIAgentDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm your Neural Core. How can I assist with your supply chain strategy today?" }
  ]);
  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const r = await api.post('/api/agent/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', text: r.data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ AI service unavailable. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-drawer ${isOpen ? 'open' : ''}`} style={{
       position: 'fixed', right: 0, top: 0, bottom: 0, width: '440px',
       background: '#fff', borderLeft: '1px solid var(--border)', zIndex: 3000,
       display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 60px rgba(0,0,0,0.05)',
       transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: '0.4s cubic-bezier(0.3, 0, 0, 1)'
    }}>
      <div className="ai-drawer-header" style={{ padding: '2.5rem', borderBottom: '1px solid var(--border)', background: '#fff' }}>
        <div className="flex-between">
           <div className="flex-center gap-3">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={22} /></div>
              <div>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>AI Assistant</h3>
                 <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>AI Assistant</div>
              </div>
           </div>
           <button onClick={onClose} className="nav-item" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
        </div>
      </div>

      <div className="ai-drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`} style={{
             padding: '1.25rem', borderRadius: '1.5rem', maxWidth: '85%',
             fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500,
             background: m.role === 'bot' ? 'var(--surface-sub)' : 'var(--dark)',
             color: m.role === 'bot' ? 'var(--dark)' : '#fff', 
             alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end',
             borderTopLeftRadius: m.role === 'bot' ? '4px' : '1.5rem',
             borderTopRightRadius: m.role === 'user' ? '4px' : '1.5rem'
          }}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ padding: '1rem 1.25rem', borderRadius: '1.5rem', borderTopLeftRadius: '4px', background: 'var(--surface-sub)', alignSelf: 'flex-start', display: 'flex', gap: '6px', alignItems: 'center' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
          </div>
        )}
      </div>

      <div className="ai-drawer-footer" style={{ padding: '2.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ position: 'relative' }}>
           <input 
             type="text" 
             className="form-control" 
             placeholder="Ask anything..." 
             value={input}
             onChange={e => setInput(e.target.value)}
             onKeyPress={e => e.key === 'Enter' && handleSend()}
             style={{ borderRadius: '99px', paddingRight: '4rem' }}
           />
           <button className="btn btn-primary" style={{ position: 'absolute', top: '5px', right: '5px', bottom: '5px', width: '44px', padding: 0, borderRadius: '50%' }} onClick={handleSend}>
             <ArrowRight size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('inventory_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuth, setShowAuth] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const handleLogin = (userData) => {
    localStorage.setItem('inventory_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('inventory_user');
    setUser(null);
    setShowAuth(false);
  };

  if (!user && !showAuth) {
    return <LandingPage onEnterApp={() => setShowAuth(true)} />;
  }
  if (!user && showAuth) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar user={user} onLogout={handleLogout} />
        
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/upload" element={<UploadPage user={user} />} />
            <Route path="/products" element={<ProductsPage user={user} />} />
            <Route path="/sales" element={<SalesPage user={user} />} />
            <Route path="/analytics" element={<LocationDemandPage user={user} />} />
            <Route path="/alerts" element={<AlertsPage user={user} />} />
            <Route path="/orders" element={<OrdersPage user={user} />} />
            <Route path="/automation" element={<AutomationPage user={user} />} />
            <Route path="/settings" element={<SettingsPage user={user} />} />
            <Route path="/invoice" element={<InvoicePage user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* AI Agent FAB */}
        <div className="ai-agent-fab" onClick={() => setIsAiOpen(true)}>
          <Sparkles size={28} />
          <span className="badge-pulse" />
        </div>

        <AIAgentDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

export default App;

