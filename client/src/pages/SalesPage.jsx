import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingCart, CheckCircle, AlertCircle, Mic, Trash2, Minus, Plus, Package, Zap, ChevronRight, Calculator, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProductImage({ src, size = 44 }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div style={{ width: size, height: size, borderRadius: 10, background: 'var(--surface-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Package size={size * 0.4} color="var(--text-light)" />
      </div>
    );
  }
  return (
    <img 
      src={src} 
      onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
      alt=""
    />
  );
}

export default function SalesPage({ user }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const r = await api.get('/api/products');
      setProducts(r.data.data);
    } catch (e) { console.error(e); }
  };

  const addToCart = (product) => {
    if ((product.quantity || 0) <= 0) {
      setStatus('error');
      setMessage(`"${product.name}" is out of stock!`);
      setTimeout(() => setStatus(''), 3000);
      return;
    }
    const existing = cart.find(c => c._id === product._id);
    if (existing) {
      if (existing.qty >= product.quantity) {
        setStatus('error');
        setMessage(`Only ${product.quantity} units available.`);
        return;
      }
      setCart(cart.map(c => c._id === product._id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setStatus('');
    setMessage('');
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(c => {
      if (c._id !== id) return c;
      const product = products.find(p => p._id === id);
      const newQ = Math.max(1, c.qty + delta);
      if (delta > 0 && product && newQ > product.quantity) {
        return c; 
      }
      return { ...c, qty: newQ };
    }));
  };

  const removeItem = (id) => setCart(cart.filter(c => c._id !== id));

  const subtotal = cart.reduce((sum, c) => sum + (c.price || 0) * c.qty, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleComplete = async () => {
    if (cart.length === 0) return;
    setStatus('processing');
    try {
      // Record all sales
      for (const item of cart) {
        await api.post('/api/sales', {
          productId: item._id,
          quantitySold: item.qty,
        });
      }
      
      // Navigate to invoice page with cart data
      const saleData = {
        items: cart,
        subtotal,
        tax,
        total,
        date: new Date().toISOString(),
        customer: "Walk-in Customer"
      };
      
      // Store in session storage temporarily for the invoice page
      sessionStorage.setItem('lastSale', JSON.stringify(saleData));
      
      setStatus('success');
      setMessage(`Sale recorded! Opening invoice...`);
      setCart([]);
      fetchProducts();
      
      setTimeout(() => {
        navigate('/invoice');
      }, 1000);
      
    } catch (e) {
      setStatus('error');
      setMessage(e.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <div className="animate-in">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
           <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
           <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Billing Terminal</span>
        </div>
        <h1 className="page-title">Sales Terminal</h1>
        <p className="page-subtitle">Pick items or search to record a new sale. Prices include GST.</p>
      </header>

      <div className="grid-cols-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '3rem', alignItems: 'start' }}>
        {/* ── PRODUCTS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem', border: 'none', background: '#FBFBFC' }}>
            <div className="search-glass mb-8" style={{ minWidth: '100%' }}>
               <Search size={20} color="var(--text-light)" />
               <input type="text" placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
               {products.filter(p => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())).slice(0, 12).map(p => {
                 const isOutOfStock = (p.quantity || 0) <= 0;
                 return (
                   <div key={p._id} className="card product-item-card" style={{ 
                      padding: '0', border: '1px solid var(--border)', cursor: isOutOfStock ? 'not-allowed' : 'pointer', overflow: 'hidden', transition: '0.2s',
                      background: '#fff', opacity: isOutOfStock ? 0.6 : 1
                   }} onClick={() => addToCart(p)}>
                      <div style={{ width: '100%', height: 120, background: 'var(--surface-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                         <ProductImage src={p.imageUrl} size={120} />
                         {isOutOfStock && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <span style={{ background: 'var(--red)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>OUT OF STOCK</span>
                            </div>
                         )}
                      </div>
                      <div style={{ padding: '1rem', textAlign: 'center' }}>
                         <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                         <div style={{ color: 'var(--primary)', fontWeight: 800 }}>₹{Number(p.price).toLocaleString('en-IN')}</div>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>

          {/* ── CART TABLE ── */}
          <div className="card table-card" style={{ border: 'none', background: '#FBFBFC' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
               <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Shopping Cart</h3>
            </div>
            <table>
              <thead>
                <tr>
                   <th>Item</th>
                   <th>Qty</th>
                   <th>Total</th>
                   <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-light)', fontWeight: 600 }}>Cart is empty.</td></tr>
                ) : cart.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ProductImage src={c.imageUrl} size={32} />
                        <div>
                          <div style={{ fontWeight: 800 }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>₹{c.price} each</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex-center gap-3">
                         <button className="btn btn-outline" style={{ padding: '0.3rem', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); updateQty(c._id, -1); }}><Minus size={12}/></button>
                         <span style={{ fontWeight: 800 }}>{c.qty}</span>
                         <button className="btn btn-outline" style={{ padding: '0.3rem', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); updateQty(c._id, 1); }}><Plus size={12}/></button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 800 }}>₹{(c.price * c.qty).toLocaleString()}</td>
                    <td><Trash2 className="action-icon" size={18} style={{ color: 'var(--red)' }} onClick={(e) => { e.stopPropagation(); removeItem(c._id); }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── BILLING SUMMARY ── */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div className="card" style={{ padding: '3rem' }}>
            <div className="flex-between mb-8">
               <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Summary</h2>
               <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={20} /></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
               <div className="flex-between">
                  <span style={{ fontWeight: 600, color: 'var(--text-sub)' }}>Subtotal</span>
                  <span style={{ fontWeight: 800 }}>₹{subtotal.toLocaleString()}</span>
               </div>
               <div className="flex-between">
                  <span style={{ fontWeight: 600, color: 'var(--text-sub)' }}>Tax (GST 18%)</span>
                  <span style={{ fontWeight: 800 }}>₹{tax.toLocaleString()}</span>
               </div>
            </div>

            <div className="flex-between mb-10">
               <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>Total</span>
               <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
            </div>

            {status && (
               <div className={`alert alert-${status === 'processing' ? 'info' : status}`} style={{ marginBottom: '2rem' }}>
                  {status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  {message}
               </div>
            )}

            <button 
              className="btn btn-primary w-full" 
              disabled={cart.length === 0 || status === 'processing'} 
              style={{ padding: '1.25rem', fontSize: '1.1rem' }} 
              onClick={handleComplete}
            >
               {status === 'processing' ? 'Processing...' : 'Complete Sale & Invoice'} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
