import React, { useState, useEffect } from 'react';
import api from '../api';
import { Package, Truck, Clock, Plus, Star, ChevronRight, Zap, ArrowRight, CheckCircle, AlertCircle, X, Loader } from 'lucide-react';

const STATUS_COLORS = {
  Draft:          'var(--text-light)',
  Ordered:        'var(--dark)',
  'In Transit':   'var(--primary)',
  'Arriving Today': 'var(--green)',
  Received:       'var(--green)',
  Delayed:        'var(--red)',
};

export default function OrdersPage({ user }) {
  const [orders, setOrders]           = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats]             = useState({ total: 0, draft: 0, inTransit: 0, received: 0 });
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [alert, setAlert]             = useState(null);
  const [form, setForm]               = useState({
    supplier: '', productName: '', quantity: '', unitPrice: '', expectedDate: '', notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchSuggestions();
  }, []);

  const fetchOrders = async () => {
    try {
      const r = await api.get('/api/orders');
      setOrders(r.data.data || []);
      setStats(r.data.stats || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSuggestions = async () => {
    try {
      const r = await api.get('/api/orders/ai-suggestions');
      setSuggestions(r.data.data || []);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/orders', { ...form, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) });
      setAlert({ type: 'success', msg: 'Purchase Order created successfully!' });
      setShowForm(false);
      setForm({ supplier: '', productName: '', quantity: '', unitPrice: '', expectedDate: '', notes: '' });
      fetchOrders();
    } catch (e) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to create order' });
    }
    setTimeout(() => setAlert(null), 4000);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/api/orders/${id}`, { status });
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return;
    try {
      await api.delete(`/api/orders/${id}`);
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="animate-in">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
           <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
           <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Supply Chain</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Replenishment Hub</h1>
            <p className="page-subtitle">AI-powered purchase orders, real-time stock replenishment.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> New PO</button>
        </div>
      </header>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: '2rem' }}>
          {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {alert.msg}
        </div>
      )}

      {/* ── STATS ── */}
      <div className="stats-row" style={{ marginBottom: '4rem' }}>
        <div className="stat-card">
          <label className="stat-label">Total POs</label>
          <div className="stat-value">{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>{stats.draft} Drafts pending</div>
        </div>
        <div className="stat-card">
          <label className="stat-label">In Transit</label>
          <div className="stat-value">{stats.inTransit}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 700 }}>Active shipments</div>
        </div>
        <div className="stat-card">
          <label className="stat-label">Received</label>
          <div className="stat-value">{stats.received}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--dark)', fontWeight: 700 }}>Stock updated</div>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
        {/* ── ORDERS TABLE ── */}
        <div className="card table-card" style={{ border: 'none', background: '#FBFBFC' }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem' }}>Purchase Orders</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 500 }}>All your store's active POs.</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>PO Details</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '6rem', textAlign: 'center' }}><Loader className="animate-float" size={32} color="var(--primary)" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-sub)', fontWeight: 600 }}>No purchase orders yet. Create your first PO!</td></tr>
              ) : orders.map(o => (
                <tr key={o._id}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{o.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{o.poNumber} · {o.supplier}</div>
                    {o.expectedDate && <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>Expected: {new Date(o.expectedDate).toLocaleDateString('en-IN')}</div>}
                  </td>
                  <td style={{ fontWeight: 800 }}>{o.quantity} units</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={e => handleStatusUpdate(o._id, e.target.value)}
                      style={{ border: 'none', fontWeight: 800, color: STATUS_COLORS[o.status] || 'var(--dark)', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      {['Draft','Ordered','In Transit','Arriving Today','Received','Delayed'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => handleDelete(o._id)}>
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── AI SUGGESTIONS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              <Zap size={18} style={{ color: 'var(--primary)', marginRight: '8px' }} />
              AI Reorder Signals
            </h3>
            {suggestions.length === 0 ? (
              <p style={{ color: 'var(--text-sub)', fontWeight: 500 }}>No critical stock items found. Your store is well stocked!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {suggestions.map((s, i) => (
                  <div key={i} className="card" style={{ padding: '1.5rem', background: 'var(--surface-sub)', border: 'none' }}>
                    <div className="flex-between mb-2">
                      <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.productName}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--red)' }}>{s.currentStock} left</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 500, marginBottom: '1rem' }}>{s.reason}</p>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => { setForm({ supplier: '', productName: s.productName, quantity: s.suggestedQty, unitPrice: '', expectedDate: '', notes: s.reason }); setShowForm(true); }}
                    >
                      Draft PO ({s.suggestedQty} units) <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ background: 'var(--dark)', color: '#fff', border: 'none' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>📦 RECEIVING NOTE</div>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.6, fontWeight: 500 }}>
              When you mark an order as "Received", the product stock in your inventory will be automatically increased.
            </p>
          </div>
        </div>
      </div>

      {/* ── CREATE ORDER MODAL ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-in" style={{ width: '560px', padding: '3rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex-between mb-8">
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem' }}>New Purchase Order</h2>
              <button className="nav-item" onClick={() => setShowForm(false)} style={{ width: 40, height: 40, padding: 0, justifyContent: 'center' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Supplier Name *</label>
                <input className="form-control" placeholder="e.g. FreshFoods Inc." required value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-control" placeholder="e.g. Organic Almond Milk" required value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} />
              </div>
              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input className="form-control" type="number" required min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹)</label>
                  <input className="form-control" type="number" min="0" value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Expected Delivery Date</label>
                <input className="form-control" type="date" value={form.expectedDate} onChange={e => setForm({...form, expectedDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-control" rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Create Purchase Order <ArrowRight size={18} /></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
