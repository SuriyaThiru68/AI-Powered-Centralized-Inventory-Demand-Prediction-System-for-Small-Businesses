import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud, File, CheckCircle, AlertCircle,
  ArrowRight, Database, Trash2, Package, RefreshCw, X
} from 'lucide-react';
import api from '../api';

function UploadPage({ user }) {
  const [file,         setFile]         = useState(null);
  const [status,       setStatus]       = useState('idle');  // idle | uploading | success | error
  const [message,      setMessage]      = useState('');
  const [preview,      setPreview]      = useState(null);
  const [productCount, setProductCount] = useState(null);    // current products in DB
  const [deleting,     setDeleting]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  // Load current product count on mount
  useEffect(() => { fetchProductCount(); }, []);

  const fetchProductCount = async () => {
    try {
      const r = await api.get('/api/products');
      setProductCount(r.data.stats?.totalProducts ?? 0);
    } catch { setProductCount(0); }
  };

  // CSV preview
  const previewCSV = (f) => {
    if (!f || !f.name.toLowerCase().endsWith('.csv')) { setPreview(null); return; }
    import('papaparse').then(Papa => {
      Papa.default.parse(f, {
        header: true, preview: 5,
        complete: (r) => setPreview({ columns: r.meta.fields || [], rows: r.data }),
      });
    });
  };

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setStatus('idle');
      setMessage('');
      previewCSV(accepted[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  // Upload
  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    const form = new FormData();
    form.append('file', file);
    try {
      const r = await api.post('/api/products/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      setMessage(r.data.message || `Imported ${r.data.count} products!`);
      setFile(null);
      setPreview(null);
      fetchProductCount();
    } catch (e) {
      setStatus('error');
      setMessage(e.response?.data?.message || 'Upload failed. Please check the file format.');
    }
  };

  // Delete all products
  const handleDeleteAll = async () => {
    setDeleting(true);
    setShowConfirm(false);
    try {
      const r = await api.delete('/api/products/all');
      setStatus('success');
      setMessage(r.data.message);
      setProductCount(0);
      setFile(null);
      setPreview(null);
    } catch (e) {
      setStatus('error');
      setMessage(e.response?.data?.message || 'Failed to delete products.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-in">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Products</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Upload Products</h1>
            <p className="page-subtitle">Upload a CSV or Excel file to add products to your store. Columns are detected automatically.</p>
          </div>

          {/* Current data status badge */}
          {productCount !== null && (
            <div className="card" style={{ padding: '1rem 1.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
              <Package size={20} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{productCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>Products in your store</div>
              </div>
              <button
                title="Refresh count"
                onClick={fetchProductCount}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px' }}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: '900px' }}>

        {/* ── DROP ZONE ── */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', background: '#FBFBFC' }}>
          <div
            {...getRootProps()}
            style={{
              padding: '5rem 3rem',
              background: isDragActive ? 'var(--primary-light)' : 'transparent',
              transition: '0.3s', cursor: 'pointer', textAlign: 'center',
              border: isDragActive ? '2px dashed var(--primary)' : '2px dashed transparent',
            }}
          >
            <input {...getInputProps()} />
            <div style={{ margin: '0 auto 2rem', width: 72, height: 72, background: 'var(--dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px' }}>
              <UploadCloud size={32} strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              {isDragActive ? 'Drop your file here' : 'Drag & drop your product file'}
            </h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '2rem', fontWeight: 500 }}>
              Supports CSV and XLSX files. Columns like Name, Quantity, Price, Category are auto-detected.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="badge-vibrant indigo">CSV</span>
              <span className="badge-vibrant purple">XLSX</span>
              <span className="badge-vibrant green">Auto column mapping</span>
            </div>
          </div>

          {/* Selected file bar */}
          {file && (
            <div style={{ padding: '1.5rem 2rem', background: '#fff', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <File size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>{file.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>
                  {(file.size / 1024).toFixed(1)} KB — Ready to upload
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setFile(null); setPreview(null); setStatus('idle'); setMessage(''); }}
              >
                <X size={16} /> Remove
              </button>
            </div>
          )}
        </div>

        {/* ── CSV PREVIEW ── */}
        {preview && (
          <div className="card table-card animate-in" style={{ padding: '0', marginTop: '2rem', border: 'none', background: '#FBFBFC' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>File Preview (first 5 rows)</h3>
              <span className="badge-vibrant green">Columns auto-detected</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>{preview.columns.map(c => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i}>
                      {preview.columns.map(c => <td key={c} style={{ fontWeight: 600 }}>{row[c] || '—'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 2, padding: '1.25rem', fontSize: '1rem', minWidth: '200px' }}
            disabled={!file || status === 'uploading'}
            onClick={handleUpload}
          >
            {status === 'uploading' ? 'Uploading...' : 'Upload Products'}
            {status !== 'uploading' && <ArrowRight size={20} style={{ marginLeft: '8px' }} />}
          </button>

          {productCount > 0 && (
            <button
              className="btn btn-outline"
              style={{ flex: 1, padding: '1.25rem', fontSize: '1rem', color: 'var(--red)', borderColor: 'var(--red)', minWidth: '180px' }}
              disabled={deleting}
              onClick={() => setShowConfirm(true)}
            >
              {deleting ? 'Deleting...' : <><Trash2 size={18} /> Delete All Products</>}
            </button>
          )}
        </div>

        {/* ── STATUS MESSAGE ── */}
        {status !== 'idle' && message && (
          <div className={`alert alert-${status === 'uploading' ? 'info' : status}`} style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
            {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span style={{ fontWeight: 700 }}>{message}</span>
          </div>
        )}

        {/* ── INFO BOX ── */}
        <div className="card" style={{ background: 'var(--dark)', color: '#fff', marginTop: '4rem', border: 'none', padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '1rem' }}>
            <Database size={16} /> How it works
          </div>
          <ul style={{ fontSize: '0.95rem', opacity: 0.8, fontWeight: 500, lineHeight: 2, paddingLeft: '1.25rem' }}>
            <li>Upload a CSV or Excel file with your product list.</li>
            <li>Column names like "Name", "Qty", "Price" are automatically recognised.</li>
            <li>Uploading a new file <strong>replaces</strong> your current products.</li>
            <li>Use "Delete All Products" to clear your entire product catalog.</li>
          </ul>
        </div>
      </div>

      {/* ── CONFIRM DELETE MODAL ── */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card animate-in" style={{ width: '440px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF0ED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Trash2 size={28} color="var(--red)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Delete All Products?</h2>
            <p style={{ color: 'var(--text-sub)', fontWeight: 500, lineHeight: 1.6, marginBottom: '2rem' }}>
              This will permanently delete all <strong>{productCount} products</strong> from your store.
              Your sales records will not be affected.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{ flex: 1, background: 'var(--red)', color: '#fff', border: 'none' }}
                onClick={handleDeleteAll}
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
