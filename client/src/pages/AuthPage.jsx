import React, { useState } from 'react';
import api from '../api';
import { Package, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function AuthPage({ onLogin }) {
  const [isLogin,  setIsLogin]  = useState(true);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [role,     setRole]     = useState('seller');
  const [status,   setStatus]   = useState('');
  const [message,  setMessage]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(''); setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload  = isLogin ? { email, password } : { name, email, password, role };
      const r = await api.post(endpoint, payload);
      setStatus('success');
      setMessage(isLogin ? `Welcome back, ${r.data.name}!` : 'Account created!');
      setTimeout(() => onLogin(r.data), 800);
    } catch (e) {
      setStatus('error');
      setMessage(e.response?.data?.message || 'Login failed. Check your email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ background: 'var(--dark)', color: 'white', padding: '12px', borderRadius: '16px', display: 'inline-flex', marginBottom: '1.5rem' }}>
            <Package size={32} strokeWidth={3} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--dark)', letterSpacing: '-0.04em' }}>
            Inventory<span style={{ color: 'var(--primary)' }}>OS</span>
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '1rem', marginTop: '0.75rem', fontWeight: 500 }}>
            {isLogin ? 'Sign in to manage your store.' : 'Create a free account to get started.'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ background: 'var(--surface-sub)', borderRadius: '99px', padding: '6px', display: 'flex', marginBottom: '2.5rem', border: '1px solid var(--border)' }}>
          <button type="button" className="btn"
            style={{ flex: 1, borderRadius: '99px', background: isLogin ? 'var(--dark)' : 'transparent', color: isLogin ? '#fff' : 'var(--text-sub)', fontSize: '0.85rem' }}
            onClick={() => setIsLogin(true)}>
            Login
          </button>
          <button type="button" className="btn"
            style={{ flex: 1, borderRadius: '99px', background: !isLogin ? 'var(--dark)' : 'transparent', color: !isLogin ? '#fff' : 'var(--text-sub)', fontSize: '0.85rem' }}
            onClick={() => setIsLogin(false)}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input type="text" className="form-control" placeholder="e.g. Ravi Kumar"
                value={name} onChange={e => setName(e.target.value)} required={!isLogin} />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div onClick={() => setRole('seller')} style={{
                  padding: '1.25rem', borderRadius: '24px',
                  border: `2px solid ${role === 'seller' ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer', textAlign: 'center',
                  background: role === 'seller' ? 'var(--primary-light)' : 'transparent', transition: '0.2s'
                }}>
                  <ShoppingCart size={20} style={{ margin: '0 auto 0.5rem', color: role === 'seller' ? 'var(--primary)' : 'var(--text-light)' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: role === 'seller' ? 'var(--primary)' : 'var(--text-sub)' }}>Shop Owner</div>
                </div>
                <div onClick={() => setRole('admin')} style={{
                  padding: '1.25rem', borderRadius: '24px',
                  border: `2px solid ${role === 'admin' ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer', textAlign: 'center',
                  background: role === 'admin' ? 'var(--primary-light)' : 'transparent', transition: '0.2s'
                }}>
                  <ShieldCheck size={20} style={{ margin: '0 auto 0.5rem', color: role === 'admin' ? 'var(--primary)' : 'var(--text-light)' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: role === 'admin' ? 'var(--primary)' : 'var(--text-sub)' }}>Admin</div>
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="you@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group mb-12">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {status === 'error'   && <div className="alert alert-danger"><AlertCircle  size={18} /> {message}</div>}
          {status === 'success' && <div className="alert alert-success"><CheckCircle size={18} /> {message}</div>}

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '1.25rem', fontSize: '1.1rem' }}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={20} style={{ marginLeft: '8px' }} />}
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>
          Demo: admin@store.com / admin123
        </p>
      </div>
    </div>
  );
}
