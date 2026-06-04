import React, { useState, useEffect } from 'react';
import api from '../api';
import { Play, Cpu, Database, Zap, MessageCircle, FileText, AlertTriangle, Workflow, X, Trash2, ArrowRight, Sparkles } from 'lucide-react';

const TOOLBOX = [
  { section: 'Triggers', items: [
    { icon: <Play size={20} />,           label: 'Start',      color: 'var(--green)'   },
    { icon: <Cpu size={20} />,            label: 'AI Check',   color: 'var(--primary)' },
  ]},
  { section: 'Actions', items: [
    { icon: <Database size={20} />,       label: 'Update Stock',  color: 'var(--dark)'    },
    { icon: <Zap size={20} />,            label: 'Run Action',    color: 'var(--primary)' },
    { icon: <MessageCircle size={20} />,  label: 'Send Message',  color: '#25d366'        },
    { icon: <FileText size={20} />,       label: 'Create PO',     color: 'var(--primary)' },
    { icon: <AlertTriangle size={20} />,  label: 'Send Alert',    color: 'var(--red)'     },
  ]},
];

const DEFAULT_NODES = [
  { id: 1, label: 'When: Stock is Low',        sub: 'Stock drops below 20 units', color: 'var(--green)'   },
  { id: 2, label: 'Then: AI Checks Demand',    sub: 'Gemini reviews past sales',  color: 'var(--primary)' },
  { id: 3, label: 'Then: Send WhatsApp Alert', sub: 'Notify store owner',         color: '#25d366'        },
  { id: 4, label: 'Then: Create Draft PO',     sub: 'Auto-fill supplier order',   color: 'var(--dark)'    },
];

export default function AutomationPage({ user }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes]               = useState(DEFAULT_NODES);
  const [lowStock, setLowStock]         = useState([]);

  useEffect(() => {
    // Load actual low-stock products to show in automation context
    api.get('/api/orders/ai-suggestions')
      .then(r => setLowStock(r.data.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="animate-in">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Automation</span>
        </div>
        <h1 className="page-title">AI Workflows</h1>
        <p className="page-subtitle">Set up automatic actions — like restocking alerts and purchase orders — when certain things happen in your store.</p>
      </header>

      <div className="grid-cols-2" style={{ gridTemplateColumns: '280px 1fr', gap: '3rem' }}>

        {/* ── TOOLBOX ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ border: 'none', background: 'var(--surface-sub)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Building Blocks</h3>
            {TOOLBOX.map((sec, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>{sec.section}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {sec.items.map((item, j) => (
                    <div key={j} className="card" style={{ padding: '1rem 0.5rem', textAlign: 'center', background: '#fff', border: '1px solid var(--border)', cursor: 'grab' }}>
                      <div style={{ color: item.color, display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{item.icon}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Live low-stock context */}
          {lowStock.length > 0 && (
            <div className="card" style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}>
              <Sparkles size={24} style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {lowStock.length} low-stock items detected
              </h4>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.5, fontWeight: 500 }}>
                {lowStock.slice(0, 2).map(p => p.productName).join(', ')} and more need restocking.
              </p>
              <button className="btn" style={{ marginTop: '1rem', width: '100%', background: '#fff', color: 'var(--primary)', fontSize: '0.85rem' }}>
                Auto-Create POs <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ── CANVAS ── */}
        <div className="card" style={{ background: '#FFFFFF', position: 'relative', minHeight: '600px', padding: '0', border: '1px solid var(--border)', overflow: 'hidden', borderRadius: '40px' }}>

          {/* Grid background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--text-light) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', gap: '1rem', zIndex: 2 }}>
            <span className="badge-vibrant green">Example: Low Stock → Reorder</span>
          </div>

          {/* Nodes */}
          <div style={{ position: 'absolute', top: '5rem', left: '5rem', display: 'flex', flexDirection: 'column', gap: '0', zIndex: 2 }}>
            {nodes.map((node, idx) => (
              <div key={node.id}>
                <div
                  onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                  className="card"
                  style={{
                    width: '260px', padding: '1.5rem', cursor: 'pointer', background: '#fff',
                    border: selectedNode === node.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: selectedNode === node.id ? 'var(--shadow-lg)' : 'var(--shadow)',
                    borderRadius: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-sub)', color: node.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Workflow size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{node.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>{node.sub}</div>
                    </div>
                  </div>
                </div>
                {idx < nodes.length - 1 && (
                  <div style={{ width: '2px', height: '24px', background: 'var(--border)', margin: '0 auto' }} />
                )}
              </div>
            ))}
          </div>

          {/* Config panel */}
          {selectedNode && (() => {
            const node = nodes.find(n => n.id === selectedNode);
            return (
              <div className="animate-in" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', bottom: '1.5rem', width: '320px', background: '#fff', border: '1px solid var(--border)', borderRadius: '28px', padding: '2.5rem', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)', zIndex: 10 }}>
                <div className="flex-between mb-8">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Step Settings</h3>
                  <button onClick={() => setSelectedNode(null)} style={{ border: 'none', background: 'var(--surface-sub)', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                </div>
                <div className="form-group">
                  <label className="form-label">Step Name</label>
                  <input type="text" className="form-control" defaultValue={node?.label} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={5} defaultValue={node?.sub} style={{ resize: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }}><Trash2 size={18} /></button>
                  <button className="btn btn-primary" style={{ flex: 2 }}>Save Step</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
