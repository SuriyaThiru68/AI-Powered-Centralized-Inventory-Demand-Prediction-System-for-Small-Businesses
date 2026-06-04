import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, Download, Globe, Zap, Loader } from 'lucide-react';

const PERIOD_DAYS = { '7D': 7, '30D': 30, 'YTD': 365 };

export default function LocationDemandPage({ user }) {
  const [period, setPeriod]               = useState('30D');
  const [analytics, setAnalytics]         = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchAnalytics(); }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const days = PERIOD_DAYS[period] || 30;
      const r = await api.get(`/api/sales/analytics?days=${days}`);
      setAnalytics(r.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const dailyData = analytics?.dailyRevenue?.map(d => ({
    name: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
    units: d.unitsSold,
  })) || [];

  const categoryData = analytics?.categoryBreakdown?.map(c => ({
    category: c.category,
    trend:    c.sold,
    revenue:  c.revenue,
    skuCount: c.skuCount,
  })) || [];

  return (
    <div className="animate-in">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
           <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
           <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Market Intelligence</span>
        </div>
        <h1 className="page-title">Sales Analytics</h1>
        <p className="page-subtitle">Real-time revenue, category velocity, and top-performing products from your store data.</p>
      </header>

      <div className="flex-between mb-12">
        <div className="filter-row">
          {['7D', '30D', 'YTD'].map(p => (
            <button key={p} className={`filter-pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p} Analysis</button>
          ))}
        </div>
        <button className="btn btn-outline"><Download size={18} /> Export</button>
      </div>

      {/* ── SUMMARY STATS ── */}
      {analytics?.summary && (
        <div className="stats-row" style={{ marginBottom: '4rem' }}>
          <div className="stat-card">
            <label className="stat-label">Total Revenue</label>
            <div className="stat-value">₹{(analytics.summary.totalRevenue || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>Last {analytics.summary.days} days</div>
          </div>
          <div className="stat-card">
            <label className="stat-label">Units Sold</label>
            <div className="stat-value">{(analytics.summary.totalUnitsSold || 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 700 }}>Across all products</div>
          </div>
          <div className="stat-card">
            <label className="stat-label">Categories</label>
            <div className="stat-value">{categoryData.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--dark)', fontWeight: 700 }}>Active segments</div>
          </div>
        </div>
      )}

      <div className="grid-cols-2" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
        {/* Revenue Chart */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', background: '#FBFBFC' }}>
          <div style={{ padding: '3rem' }}>
            <div className="flex-between mb-8">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Revenue Trend</h2>
              <div className="badge-vibrant indigo">Live Data</div>
            </div>
            {loading ? (
              <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size={32} color="var(--primary)" className="animate-float" />
              </div>
            ) : dailyData.length === 0 ? (
              <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <Globe size={48} style={{ color: 'var(--text-light)', opacity: 0.4 }} />
                <p style={{ color: 'var(--text-sub)', fontWeight: 600 }}>No sales data yet. Start processing sales to see analytics.</p>
              </div>
            ) : (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)', fontSize: 11, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)', fontSize: 11, fontWeight: 700 }} tickFormatter={v => '₹' + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v)} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                      formatter={v => ['₹' + v.toLocaleString('en-IN'), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Category Velocity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ background: 'var(--dark)', color: '#fff', border: 'none', padding: '3rem' }}>
            <Zap size={32} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>AI Demand Context</h3>
            <p style={{ opacity: 0.8, fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
              {categoryData.length > 0
                ? `Your top category is "${categoryData[0]?.category}" with ${categoryData[0]?.sold} units sold. Consider stocking up before the next sales cycle.`
                : 'Process your first sales to unlock AI demand insights and category intelligence.'}
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div className="flex-between mb-8">
              <h2 style={{ fontWeight: 800 }}>Category Velocity</h2>
            </div>
            {loading ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size={24} color="var(--primary)" className="animate-float" />
              </div>
            ) : categoryData.length === 0 ? (
              <p style={{ color: 'var(--text-sub)', fontWeight: 600, textAlign: 'center', padding: '2rem' }}>No category data yet.</p>
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData.slice(0, 6)}>
                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip formatter={v => [v + ' units', 'Sold']} />
                    <Bar dataKey="trend" radius={[8, 8, 8, 8]}>
                      {categoryData.slice(0, 6).map((d, i) => (
                        <Cell key={i} fill={i === 0 ? 'var(--primary)' : 'var(--dark)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TOP PRODUCTS TABLE ── */}
      <div className="card table-card" style={{ border: 'none', background: '#FBFBFC' }}>
        <div className="table-toolbar" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Top Performing Products</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Units Sold</th>
              <th>Revenue</th>
              <th>Stock Left</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '6rem', textAlign: 'center' }}><Loader size={32} color="var(--primary)" className="animate-float" /></td></tr>
            ) : (analytics?.topProducts || []).length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-sub)', fontWeight: 600 }}>No product sales data yet.</td></tr>
            ) : (analytics?.topProducts || []).map((p, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 800, fontSize: '1.1rem' }}>{p.name}</td>
                <td><span className="badge-vibrant indigo">{p.category || 'General'}</span></td>
                <td style={{ fontWeight: 800 }}>{(p.sold || 0).toLocaleString()} units</td>
                <td style={{ fontWeight: 800 }}>₹{((p.price || 0) * (p.sold || 0)).toLocaleString('en-IN')}</td>
                <td>
                  <div style={{ fontWeight: 800, color: p.quantity < 20 ? 'var(--red)' : 'var(--green)' }}>
                    {p.quantity} {p.quantity < 20 ? '⚠️' : '✓'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
