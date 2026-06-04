import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Plus, Trash2, Send, Sparkles, ChevronLeft, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InvoicePage({ user }) {
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceNo] = useState(() => Math.random().toString(36).substr(2, 6).toUpperCase());

  useEffect(() => {
    const saved = sessionStorage.getItem('lastSale');
    if (saved) {
      setInvoiceData(JSON.parse(saved));
    }
  }, []);

  if (!invoiceData) {
    return (
      <div className="flex-center" style={{ height: '70vh', flexDirection: 'column', gap: '2rem' }}>
        <FileText size={64} color="var(--text-light)" />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800 }}>No active invoice.</h2>
          <p style={{ color: 'var(--text-sub)' }}>Record a sale first to generate an invoice.</p>
        </div>
        <Link to="/sales" className="btn btn-primary">Go to Sales Terminal</Link>
      </div>
    );
  }

  const { items, subtotal, tax, total, date, customer } = invoiceData;

  return (
    <div className="animate-in">
      <header className="page-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <Link to="/sales" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-sub)', fontWeight: 800 }}>
            <ChevronLeft size={16} /> Back to Terminal
          </Link>
        </div>
        <h1 className="page-title">Invoice Checkout</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'flex-start' }}>
        {/* ── INVOICE CANVAS ── */}
        <div className="card invoice-canvas" style={{ 
          padding: '4rem', minHeight: '800px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', 
          border: '1px solid var(--border)', background: '#fff', position: 'relative'
        }}>
          {/* Header */}
          <div className="flex-between mb-12">
            <div>
              <div style={{ 
                width: 48, height: 48, background: 'var(--primary)', color: '#fff', 
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
              }}>
                <Package size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Invoice</h2>
              <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>#{invoiceNo} • {new Date(date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{user?.name || 'InventoryOS'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Cloud Based Store</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>GSTIN: 33AAAAA0000A1Z5</div>
            </div>
          </div>

          <div className="mb-12">
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Bill To</label>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{customer}</div>
          </div>

          {/* Table */}
          <div style={{ borderTop: '2px solid var(--dark)', marginTop: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1.5rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text-sub)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '1.5rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text-sub)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '1.5rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text-sub)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '1.5rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text-sub)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '1.25rem 0', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{item.name}</td>
                    <td style={{ textAlign: 'center', padding: '1.25rem 0', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{item.qty}</td>
                    <td style={{ textAlign: 'right', padding: '1.25rem 0', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>₹{item.price.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '1.25rem 0', borderBottom: '1px solid var(--border)', fontWeight: 800 }}>₹{(item.qty * item.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', alignItems: 'flex-end' }}>
             <div style={{ opacity: 0.1 }}>
                <QrCode size={100} />
             </div>
             <div style={{ width: '280px' }}>
                <div className="flex-between mb-2">
                  <span style={{ fontWeight: 600, color: 'var(--text-sub)' }}>Subtotal</span>
                  <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex-between mb-4">
                  <span style={{ fontWeight: 600, color: 'var(--text-sub)' }}>GST (18%)</span>
                  <span style={{ fontWeight: 700 }}>₹{tax.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total Paid</span>
                  <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
                </div>
             </div>
          </div>

          <div style={{ marginTop: '5rem', fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center', borderTop: '1px dashed var(--border)', paddingTop: '2rem' }}>
            Thank you for shopping with us! This is a computer generated invoice.
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="card">
              <h3 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Checkout Complete</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <button className="btn btn-primary w-full" onClick={() => window.print()}>
                   <Printer size={18} /> Print Thermal Receipt
                 </button>
                 <Link to="/sales" className="btn btn-outline w-full">New Transaction</Link>
              </div>
           </div>

           <div className="card" style={{ background: 'var(--dark)', color: '#fff', border: 'none' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                 <Sparkles size={14} /> Smart Suggestion
              </div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5 }}>
                 Sending this invoice via WhatsApp usually increases customer retention by 14%.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
