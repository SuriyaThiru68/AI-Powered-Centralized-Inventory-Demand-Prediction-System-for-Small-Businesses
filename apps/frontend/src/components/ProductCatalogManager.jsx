import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { ScrollReveal } from "./ScrollReveal";
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit2,
  Plus,
  Package,
  RefreshCw,
  Search,
  FileSpreadsheet,
  X,
} from "lucide-react";

const EMPTY_PRODUCT = {
  name: "",
  quantity: 0,
  price: 0,
  sold: 0,
  category: "General",
  sku: "",
};

function parseCsvPreview(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { columns: [], rows: [] };
  const columns = lines[0].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1, 51).map((line) => {
    const values = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row = {};
    columns.forEach((col, i) => {
      row[col] = values[i] ?? "";
    });
    return row;
  });
  return { columns, rows };
}

export default function ProductCatalogManager({ title = "Product Catalog" }) {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const inputRef = useRef(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const r = await api.get("/api/products");
      setProducts(r.data.data || []);
      setStats(r.data.stats || null);
    } catch (e) {
      console.error(e);
      setMessage(e.response?.data?.message || "Failed to load products");
      setUploadStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setUploadStatus("idle");
    setMessage("");
    if (f.name.toLowerCase().endsWith(".csv")) {
      const text = await f.text();
      setPreview(parseCsvPreview(text));
    } else {
      setPreview({ columns: [], rows: [], note: "Excel preview after upload — click Import to save." });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadStatus("uploading");
    const form = new FormData();
    form.append("file", file);
    try {
      const r = await api.post("/api/products/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus("success");
      setMessage(r.data.message || `Imported ${r.data.count || 0} products`);
      setFile(null);
      setPreview(null);
      if (r.data.data) {
        setProducts(r.data.data);
        setStats(r.data.stats);
      } else {
        await loadProducts();
      }
    } catch (e) {
      setUploadStatus("error");
      setMessage(e.response?.data?.message || "Upload failed");
    }
  };

  const openAdd = () => {
    setIsNew(true);
    setEdit({ ...EMPTY_PRODUCT });
  };

  const openEdit = (p) => {
    setIsNew(false);
    setEdit({ ...p });
  };

  const saveProduct = async () => {
    if (!edit?.name?.trim()) {
      setMessage("Product name is required");
      setUploadStatus("error");
      return;
    }
    try {
      if (isNew) {
        await api.post("/api/products", {
          name: edit.name,
          quantity: edit.quantity,
          price: edit.price,
          sold: edit.sold || 0,
          category: edit.category || "General",
          sku: edit.sku || "",
        });
        setMessage("Product added — visible in Sales & Dashboard");
      } else {
        await api.put(`/api/products/${edit._id}`, edit);
        setMessage("Product updated");
      }
      setUploadStatus("success");
      setEdit(null);
      setIsNew(false);
      await loadProducts();
    } catch (e) {
      setUploadStatus("error");
      setMessage(e.response?.data?.message || "Save failed");
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      setMessage("Product removed");
      setUploadStatus("success");
      await loadProducts();
    } catch (e) {
      setUploadStatus("error");
      setMessage(e.response?.data?.message || "Delete failed");
    }
  };

  const clearAll = async () => {
    if (!confirm("Delete ALL products? This clears Sales and Dashboard data too.")) return;
    try {
      await api.delete("/api/products/all");
      setProducts([]);
      setStats({ totalProducts: 0, remainingStock: 0, soldItems: 0, totalValue: 0 });
      setMessage("All products cleared");
      setUploadStatus("success");
    } catch (e) {
      setUploadStatus("error");
      setMessage(e.response?.data?.message || "Clear failed");
    }
  };

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <header className="page-header">
        <p className="eyebrow">Inventory</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">
          Upload CSV/Excel, then add or edit products here. The same catalog loads in Products, Sales, and Dashboard.
        </p>
        {stats && (
          <div className="stats-grid" style={{ marginTop: "1.5rem" }}>
            <div className="stat-card">
              <div className="stat-label">Products</div>
              <div className="stat-value">{stats.totalProducts}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Stock units</div>
              <div className="stat-value">{stats.remainingStock}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Catalog value</div>
              <div className="stat-value">₹{Number(stats.totalValue || 0).toLocaleString("en-IN")}</div>
            </div>
          </div>
        )}
      </header>

      {/* Upload section */}
      <ScrollReveal>
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1rem" }}>
          Step 1 — Import file
        </h2>
        <motion.div
          className={`dropzone ${file ? "active" : ""}`}
          whileHover={{ scale: 1.01 }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("active");
          }}
          onDragLeave={(e) => e.currentTarget.classList.remove("active")}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("active");
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <UploadCloud size={40} style={{ margin: "0 auto", color: "var(--accent)" }} />
          <p style={{ marginTop: "1rem", fontWeight: 700 }}>
            {file ? file.name : "Drop CSV or Excel here, or click to browse"}
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Columns like Name, Quantity, Price, Category are detected automatically
          </p>
        </motion.div>

        {preview && preview.rows?.length > 0 && (
          <div className="table-wrap" style={{ marginTop: "1rem" }}>
            <p style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>
              <FileSpreadsheet size={14} style={{ display: "inline", marginRight: 6 }} />
              Preview (first {preview.rows.length} rows)
            </p>
            <div style={{ overflowX: "auto", maxHeight: 220 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {preview.columns.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i}>
                      {preview.columns.map((c) => (
                        <td key={c}>{row[c]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {preview?.note && (
          <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>{preview.note}</p>
        )}

        <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!file || uploadStatus === "uploading"}
            onClick={handleUpload}
          >
            {uploadStatus === "uploading" ? "Importing…" : "Import to catalog"}
          </button>
          {file && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              <X size={16} /> Clear file
            </button>
          )}
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
      <section>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--navy)" }}>
            Step 2 — Manage catalog ({products.length} items)
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={16} /> Add product
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={loadProducts}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={clearAll}>
              <Trash2 size={16} /> Clear all
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "1rem", maxWidth: 360, position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          <input
            className="form-control"
            style={{ paddingLeft: "2.5rem" }}
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {uploadStatus === "success" && message && (
          <div className="alert alert-success">
            <CheckCircle size={18} /> {message}
          </div>
        )}
        {uploadStatus === "error" && message && (
          <div className="alert alert-danger">
            <AlertCircle size={18} /> {message}
          </div>
        )}

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading catalog…</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", background: "var(--surface-muted)" }}>
            <Package size={40} style={{ margin: "0 auto", color: "var(--text-light)" }} />
            <p style={{ marginTop: "1rem", fontWeight: 600 }}>No products yet</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Upload a CSV or click Add product</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Sold</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.category || "General"}</td>
                    <td>
                      <span className={(p.quantity || 0) < 20 ? "badge badge-low" : "badge badge-ok"}>
                        {p.quantity ?? 0}
                      </span>
                    </td>
                    <td>₹{p.price ?? 0}</td>
                    <td>{p.sold ?? 0}</td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteProduct(p._id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </ScrollReveal>

      {/* Edit / Add modal */}
      {edit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => {
            setEdit(null);
            setIsNew(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              background: "#fff",
              padding: "2rem",
              maxWidth: 440,
              width: "100%",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 800, marginBottom: "1.25rem" }}>{isNew ? "Add product" : "Edit product"}</h3>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                className="form-control"
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className="form-control"
                value={edit.category || ""}
                onChange={(e) => setEdit({ ...edit, category: e.target.value })}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={edit.quantity ?? 0}
                  onChange={(e) => setEdit({ ...edit, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={edit.price ?? 0}
                  onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Sold (optional)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={edit.sold ?? 0}
                onChange={(e) => setEdit({ ...edit, sold: Number(e.target.value) })}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-primary" onClick={saveProduct}>
                {isNew ? "Add" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEdit(null);
                  setIsNew(false);
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
