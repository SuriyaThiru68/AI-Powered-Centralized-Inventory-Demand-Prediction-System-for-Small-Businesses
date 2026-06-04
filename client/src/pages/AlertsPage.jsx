import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bell, Search, Send, Paperclip, AlertTriangle, CheckCircle, Package, Loader } from 'lucide-react';

export default function AlertsPage({ user }) {
  const [msgText, setMsgText] = useState('');
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build alerts from real low-stock products
    api.get('/api/orders/ai-suggestions').then(r => {
      const suggestions = r.data.data || [];
      const built = suggestions.map(s => ({
        level: s.currentStock <= 5 ? 'CRITICAL' : 'LOW STOCK',
        color: s.currentStock <= 5 ? 'var(--red)' : 'var(--primary)',
        title: `Low Stock: ${s.productName}`,
        desc:  `Only ${s.currentStock} units left. Suggested reorder: ${s.suggestedQty} units.`,
        time:  'Just now',
      }));
      setAlerts(built);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Notifications</span>
        </div>
        <h1 className="page-title">Alerts & Messages</h1>
        <p className="page-subtitle">Live stock alerts from your store, and a message area for your team.</p>
      </header>

      <div className="grid-cols-2" style={{ gridTemplateColumns: '400px 1fr', gap: '3rem', alignItems: 'start' }}>

        {/* ── ALERTS COLUMN ── */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', background: '#FBFBFC' }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
            <div className="flex-between mb-4">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Stock Alerts</h2>
              {alerts.length > 0 && (
                <div className="badge-vibrant red">{alerts.length} Active</div>
              )}
            </div>
            <div className="search-glass">
              <Search size={16} color="var(--text-light)" />
              <input type="text" placeholder="Search alerts..." />
            </div>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader size={28} color="var(--primary)" className="animate-float" />
              </div>
            ) : alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <CheckCircle size={40} color="var(--green)" style={{ margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>All stock levels are good!</div>
                <div style={{ color: 'var(--text-sub)', fontWeight: 500, fontSize: '0.9rem' }}>No low-stock alerts right now.</div>
              </div>
            ) : alerts.map((a, i) => (
              <div key={i} style={{
                padding: '1.25rem', border: '1px solid var(--border)', background: '#fff',
                borderLeft: `4px solid ${a.color}`, borderRadius: '20px'
              }}>
                <div className="flex-between mb-2">
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: a.color }}>{a.level}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{a.time}</span>
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{a.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5, fontWeight: 500 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TEAM MESSAGES ── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', height: '620px', border: 'none', background: '#FBFBFC', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex-center gap-3">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                {user?.name?.[0] || 'T'}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Team Chat</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700 }}>● Online</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.25rem', background: 'var(--surface-sub)', borderRadius: '1.25rem', borderTopLeftRadius: '4px', maxWidth: '80%', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5 }}>
              <Package size={16} style={{ marginRight: '8px', color: 'var(--primary)' }} />
              Welcome! This is your team message area. Chat with your team or share stock updates here.
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700 }}>SYSTEM</div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: '#fff' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  style={{ borderRadius: '99px', paddingRight: '3rem' }}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                />
                <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}>
                  <Paperclip size={18} style={{ cursor: 'pointer' }} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: 52, height: 52, borderRadius: '50%', padding: 0 }}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
