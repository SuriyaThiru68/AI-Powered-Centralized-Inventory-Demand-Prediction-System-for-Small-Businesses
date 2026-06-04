import React from 'react';
import { Package, ArrowRight, BarChart2, Zap, Shield, Upload } from 'lucide-react';

const FEATURES = [
  { icon: <Upload size={28} />, title: 'Upload Products', desc: 'Import your product list from any CSV or Excel file in seconds.' },
  { icon: <BarChart2 size={28} />, title: 'Track Sales', desc: 'Record every sale and watch your stock update automatically.' },
  { icon: <Zap size={28} />, title: 'AI Predictions', desc: 'Get reorder suggestions before you run out of stock.' },
  { icon: <Shield size={28} />, title: 'Secure & Private', desc: 'Each store sees only its own data. Safe and isolated.' },
];

export default function LandingPage({ onEnterApp }) {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Background accent */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '600px', background: 'linear-gradient(90deg, transparent, var(--primary-light))', opacity: 0.5, zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--dark)', color: 'white', padding: '10px', borderRadius: '12px' }}>
            <Package size={22} strokeWidth={3} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', letterSpacing: '-0.03em' }}>InventoryOS</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline btn-sm" onClick={onEnterApp}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={onEnterApp}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '4rem 5%', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>


        <h1 style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--dark)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.04em', maxWidth: '900px' }}>
          Manage your shop inventory with <span style={{ color: 'var(--primary)' }}>AI predictions</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '600px', fontWeight: 500 }}>
          Upload your product list, record sales, and let AI tell you when to reorder — all in one simple tool.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem' }} onClick={onEnterApp}>
            Start for Free <ArrowRight size={20} />
          </button>
          <button className="btn btn-outline" style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem' }} onClick={onEnterApp}>
            See Demo
          </button>
        </div>

        {/* Feature trust bar */}
        <div style={{ marginTop: '4rem', display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {['Free to start', 'No credit card needed', 'Works with any CSV', 'Real AI insights'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-sub)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} /> {f}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '4rem', color: 'var(--dark)' }}>
          Everything you need to run your store
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ padding: '2.5rem', border: '1px solid var(--border)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-sub)', lineHeight: 1.6, fontWeight: 500, fontSize: '0.95rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 5%', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto', background: 'var(--dark)', color: '#fff', border: 'none', padding: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to get started?</h2>
          <p style={{ opacity: 0.7, marginBottom: '2rem', lineHeight: 1.6 }}>Create your free account and upload your first product list in minutes.</p>
          <button className="btn btn-primary" style={{ padding: '1.1rem 3rem', fontSize: '1.1rem' }} onClick={onEnterApp}>
            Create Free Account <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
