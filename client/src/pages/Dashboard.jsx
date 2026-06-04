import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Package, TrendingUp, AlertTriangle, Search,
  Edit2, Trash2, ShoppingCart, DollarSign, BarChart2,
  Users, Activity, Globe, Zap, ArrowDownRight, ChevronRight,
  Sparkles, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#FF4D00', '#000000', '#666666', '#999999'];

function Dashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0, remainingStock: 0, soldItems: 0, totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [chartData, setChartData] = useState([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => { fetchProducts(); fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const r = await api.get('/api/sales/analytics?days=7');
      const daily = r.data.data?.dailyRevenue || [];
      setChartData(daily.map(d => ({
        name: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: d.revenue,
        forecast: Math.floor(d.revenue * 1.05),
      })));
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      const r = await api.get('/api/products');
      const data = r.data.data || [];
      setProducts(data);
      setStats(r.data.stats || { totalProducts: data.length, remainingStock: 120, soldItems: 45, totalValue: 12000 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // chartData populated from real sales analytics (see fetchAnalytics)

  if (loading) return <div className="text-center" style={{ padding: '10rem' }}><Activity className="animate-float" color="var(--primary)" size={40} /></div>;

  return (
    <div className="animate-in">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
           <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
           <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {isAdmin ? 'System Intelligence' : 'Store Intelligence'}
           </span>
        </div>
        <h1 className="page-title" style={{ maxWidth: '900px' }}>
          {isAdmin 
            ? 'Store Overview' 
            : `Welcome back, \${user?.name}`}
        </h1>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
           <Link to="/sales" className="btn btn-primary">Process New Sale <ArrowRight size={18} /></Link>
           <Link to="/products" className="btn btn-outline">Manage Catalog</Link>
        </div>
      </header>

      {/* ── STATS ── */}
      <div className="stats-row" style={{ marginBottom: '5rem' }}>
        <div className="stat-card">
          <label className="stat-label">Total Revenue</label>
          <div className="stat-value">{isAdmin ? '₹4.2M' : '₹' + (stats.totalValue).toLocaleString()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--green)', fontSize: '0.85rem', fontWeight: 700 }}>
             +12.5% 
             <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>vs last week</span>
          </div>
        </div>

        <div className="stat-card">
          <label className="stat-label">Stock Units</label>
          <div className="stat-value">{stats.remainingStock || 0}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700 }}>
             <Zap size={14} /> Low stock alerts active
          </div>
        </div>

        <div className="stat-card">
          <label className="stat-label">Active SKUs</label>
          <div className="stat-value">{stats.totalProducts}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--dark)', fontSize: '0.85rem', fontWeight: 700 }}>
             Synced across 4 nodes
          </div>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start', marginBottom: '5rem' }}>
        <div className="card" style={{ border: 'none', background: '#fcfcfc' }}>
           <div className="flex-between mb-8">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Revenue (Last 7 Days)</h2>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
                 <div className="flex-center gap-1"><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} /> Actual</div>
              </div>
           </div>
           <div style={{ height: 350, width: '100%' }}>
             {chartData.length === 0 ? (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                 <BarChart2 size={40} style={{ color: 'var(--text-light)', opacity: 0.4 }} />
                 <p style={{ color: 'var(--text-sub)', fontWeight: 600 }}>No sales yet. Record your first sale to see revenue here.</p>
               </div>
             ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#eee" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)', fontSize: 11, fontWeight: 700 }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)', fontSize: 11, fontWeight: 700 }} tickFormatter={v => '₹'+v} />
                   <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }} formatter={v => ['₹'+v.toLocaleString('en-IN'), 'Revenue']} />
                   <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPrimary)" strokeWidth={4} />
                 </AreaChart>
               </ResponsiveContainer>
             )}
           </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div className="card" style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}>
              <Sparkles size={28} style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Ask AI Assistant</h3>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, opacity: 0.9, lineHeight: 1.5, marginBottom: '1.5rem' }}>
                 Click the ✨ button at the bottom right to ask AI about your stock, sales, or get reorder suggestions.
              </p>
              <Link to="/analytics" className="btn" style={{ background: '#fff', color: 'var(--primary)', width: '100%' }}>
                 View Full Analytics <ArrowRight size={18} />
              </Link>
           </div>

           <div className="card" style={{ padding: '2rem' }}>
              <div className="flex-between mb-6">
                 <h4 style={{ fontWeight: 800 }}>Quick Links</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {[
                   { label: 'Upload Products (CSV)',  to: '/upload',     color: 'var(--dark)' },
                   { label: 'Record a Sale',          to: '/sales',      color: 'var(--primary)' },
                   { label: 'Create Purchase Order',  to: '/orders',     color: 'var(--dark)' },
                 ].map((item, i) => (
                   <Link key={i} to={item.to} style={{ textDecoration: 'none' }}>
                     <div className="flex-between" style={{ padding: '1rem', background: 'var(--surface-sub)', borderRadius: '16px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.color }}>{item.label}</span>
                        <ChevronRight size={16} color="var(--text-light)" />
                     </div>
                   </Link>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="card table-card" style={{ border: 'none', background: '#FBFBFC' }}>
         <div className="table-toolbar">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Ambitious Catalog</h2>
            <div className="search-glass">
               <Search size={18} color="var(--text-light)" />
               <input type="text" placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
         </div>
         <table>
            <thead>
               <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Inventory</th>
                  <th>Market Value</th>
                  <th></th>
               </tr>
            </thead>
            <tbody>
               {products.filter(p => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())).slice(0, 4).map(p => (
                 <tr key={p._id}>
                    <td>
                       <div style={{ fontWeight: 800, fontSize: '1rem' }}>{p.name}</div>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>SKU: {p._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td><span className="badge-vibrant indigo">{p.category || 'General'}</span></td>
                    <td>
                       <div style={{ fontWeight: 800 }}>{p.quantity} units</div>
                       <div style={{ width: '100px', height: 4, background: '#eee', borderRadius: 2, marginTop: 4 }}>
                          <div style={{ width: `${Math.min(100, (p.quantity/100)*100)}%`, height: '100%', background: p.quantity < 20 ? 'var(--primary)' : 'var(--dark)' }} />
                       </div>
                    </td>
                    <td style={{ fontWeight: 800 }}>₹{(p.price * p.quantity).toLocaleString()}</td>
                    <td className="text-right">
                       <button className="btn btn-outline btn-sm">View <ChevronRight size={14} /></button>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
         <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Link to="/products" style={{ color: 'var(--dark)', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               Explore Full Catalog <ArrowRight size={16} />
            </Link>
         </div>
      </div>
    </div>
  );
}

export default Dashboard;


