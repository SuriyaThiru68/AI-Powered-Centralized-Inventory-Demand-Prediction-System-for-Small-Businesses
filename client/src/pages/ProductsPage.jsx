import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Plus, Search, Edit2, X, Package, Trash2,
  ChevronRight, Sparkles, Activity, LayoutGrid, List,
  ImageOff, AlertTriangle
} from 'lucide-react';

const PLACEHOLDER = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23f4f4f5" rx="8"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="%23aaa">📦</text></svg>';

function ProductImage({ src, alt, style = {}, size = 48 }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div style={{ width: size, height: size, borderRadius: 10, background: 'var(--surface-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
        <Package size={size * 0.4} color="var(--text-light)" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: 10, flexShrink: 0, ...style }}
    />
  );
}

export default function ProductsPage({ user }) {
  const [products,     setProducts]     = useState([]);
  const [searchQ,      setSearchQ]      = useState('');
  const [editProduct,  setEditProduct]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [viewMode,     setViewMode]     = useState('list');   // 'list' | 'grid'
  const [filterCat,    setFilterCat]    = useState('All');

  const isAdmin = user?.role === 'admin';

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/products');
      setProducts(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
      if (editProduct?._id === id) setEditProduct(null);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!editProduct) return;
    try {
      await api.put(`/api/products/${editProduct._id}`, editProduct);
      fetchProducts();
      setEditProduct(null);
    } catch (e) { console.error(e); }
  };

  // Unique categories
  const categories = ['All', ...new Set(products.map(p => p.category || 'General').filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch = !searchQ || (p.name && p.name.toLowerCase().includes(searchQ.toLowerCase()));
    const matchCat    = filterCat === 'All' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const hasImages = products.some(p => p.imageUrl);

  return (
    <div className="animate-in">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Products</span>
        </div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Product Catalog</h1>
            <p className="page-subtitle">{products.length} products in your store.</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary btn-sm"><Plus size={16} /> Add Product</button>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: editProduct ? '1fr 400px' : '1fr', gap: '3rem', transition: '0.3s' }}>

        {/* ── PRODUCT LIST / GRID ── */}
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-glass" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={18} color="var(--text-light)" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
              />
            </div>

            {/* Category filter */}
            {categories.length > 2 && (
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                className="form-control"
                style={{ width: 'auto', paddingRight: '2rem' }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {/* View toggle — only show grid option when images exist */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-sub)', borderRadius: 12, padding: '4px' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{ border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, background: viewMode === 'list' ? '#fff' : 'transparent', boxShadow: viewMode === 'list' ? 'var(--shadow)' : 'none', transition: '0.2s' }}
              ><List size={18} /></button>
              <button
                onClick={() => setViewMode('grid')}
                title={!hasImages ? 'Grid view works best when products have images' : ''}
                style={{ border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, background: viewMode === 'grid' ? '#fff' : 'transparent', boxShadow: viewMode === 'grid' ? 'var(--shadow)' : 'none', transition: '0.2s' }}
              ><LayoutGrid size={18} /></button>
            </div>
          </div>

          {/* ── LIST VIEW ── */}
          {viewMode === 'list' && (
            <div className="card table-card" style={{ border: 'none', background: '#FBFBFC' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={{ padding: '6rem', textAlign: 'center' }}><Activity className="animate-float" size={32} color="var(--primary)" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-sub)', fontWeight: 600 }}>
                      No products found. <a href="/upload" style={{ color: 'var(--primary)', fontWeight: 800 }}>Upload a CSV</a> to get started.
                    </td></tr>
                  ) : filtered.map(p => (
                    <tr
                      key={p._id}
                      className={editProduct?._id === p._id ? 'active' : ''}
                      onClick={() => setEditProduct({ ...p })}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <ProductImage src={p.imageUrl} alt={p.name} size={44} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>ID: {p._id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800 }}>{p.quantity} units</div>
                        {p.quantity < 20 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--red)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <AlertTriangle size={11} /> Low
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 800 }}>₹{Number(p.price || 0).toLocaleString('en-IN')}</td>
                      <td><span className="badge-vibrant indigo">{p.category || 'General'}</span></td>
                      <td><ChevronRight size={16} color="var(--text-light)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── GRID VIEW ── */}
          {viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {loading ? (
                <div style={{ gridColumn: '1/-1', padding: '6rem', textAlign: 'center' }}>
                  <Activity className="animate-float" size={32} color="var(--primary)" />
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', color: 'var(--text-sub)', fontWeight: 600 }}>
                  No products found.
                </div>
              ) : filtered.map(p => (
                <div
                  key={p._id}
                  className="card"
                  onClick={() => setEditProduct({ ...p })}
                  style={{
                    cursor: 'pointer', padding: '0', overflow: 'hidden',
                    border: editProduct?._id === p._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    transition: '0.2s'
                  }}
                >
                  {/* Product image area */}
                  <div style={{ width: '100%', height: 160, background: 'var(--surface-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {p.imageUrl ? (
                      <ProductImage src={p.imageUrl} alt={p.name} size={160} style={{ width: '100%', height: '100%', borderRadius: 0 }} />
                    ) : (
                      <Package size={48} color="var(--text-light)" style={{ opacity: 0.3 }} />
                    )}
                    {p.quantity < 20 && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--red)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: 99 }}>
                        LOW
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>₹{Number(p.price || 0).toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>{p.quantity} left</span>
                    </div>
                    <span className="badge-vibrant indigo" style={{ marginTop: '8px', display: 'inline-block', fontSize: '0.65rem' }}>{p.category || 'General'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── EDIT PANEL ── */}
        {editProduct && (
          <div className="card animate-in" style={{ padding: '2.5rem', position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div className="flex-between mb-8">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit Product</h2>
              <button className="nav-item" onClick={() => setEditProduct(null)} style={{ padding: 0, width: 36, height: 36, justifyContent: 'center' }}><X size={18} /></button>
            </div>

            {/* Product image preview in edit panel */}
            {editProduct.imageUrl && (
              <div style={{ marginBottom: '1.5rem', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <ProductImage src={editProduct.imageUrl} alt={editProduct.name} size={320} style={{ width: '100%', height: 180, borderRadius: 0 }} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input type="text" className="form-control" value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} />
            </div>

            <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input type="number" className="form-control" value={editProduct.price} onChange={e => setEditProduct({...editProduct, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input type="text" className="form-control" value={editProduct.category} onChange={e => setEditProduct({...editProduct, category: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input type="number" className="form-control" style={{ fontSize: '1.5rem', fontWeight: 800 }} value={editProduct.quantity} onChange={e => setEditProduct({...editProduct, quantity: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL (optional)</label>
              <input type="url" className="form-control" placeholder="https://example.com/image.jpg" value={editProduct.imageUrl || ''} onChange={e => setEditProduct({...editProduct, imageUrl: e.target.value})} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditProduct(null)}>Cancel</button>
              {isAdmin && <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>Save Changes</button>}
            </div>
            {isAdmin && (
              <button className="btn btn-outline w-full mt-4" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => handleDelete(editProduct._id)}>
                <Trash2 size={16} /> Delete Product
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
