import { useEffect, useState } from "react";
import api from "../lib/api";
import { ShoppingCart, Plus, Minus, CheckCircle } from "lucide-react";

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api
      .get("/api/products")
      .then((r) => setProducts(r.data.data || []))
      .catch(() => setMsg("Cannot load products — is the backend running? (npm run dev:backend)"));
  }, []);

  const add = (p) => {
    const ex = cart.find((c) => c._id === p._id);
    if (ex) setCart(cart.map((c) => (c._id === p._id ? { ...c, qty: c.qty + 1 } : c)));
    else setCart([...cart, { ...p, qty: 1 }]);
  };

  const total = cart.reduce((s, c) => s + (c.price || 0) * c.qty, 0);

  const checkout = async () => {
    for (const item of cart) {
      await api.post("/api/sales", { productId: item._id, quantitySold: item.qty });
    }
    setCart([]);
    setMsg("Sale recorded!");
    api.get("/api/products").then((r) => setProducts(r.data.data || []));
  };

  return (
    <>
      <header className="page-header"><h1 className="page-title">Record Sales</h1></header>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {products.map((p) => (
            <button key={p._id} type="button" className="card" onClick={() => add(p)} style={{ textAlign: "left", cursor: "pointer" }}>
              <div className="card-body">
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>₹{p.price} · {p.quantity} stock</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <h3><ShoppingCart size={18} /> Cart ({cart.length})</h3>
          {cart.map((c) => (
            <div key={c._id} style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.9rem" }}>
              <span>{c.name} × {c.qty}</span>
              <span>₹{(c.price * c.qty).toFixed(0)}</span>
            </div>
          ))}
          <div style={{ marginTop: "1rem", fontWeight: 800 }}>Total: ₹{total.toFixed(2)}</div>
          <button type="button" className="btn btn-primary w-full" style={{ marginTop: "1rem" }} disabled={!cart.length} onClick={checkout}>Complete Sale</button>
          {msg && <div className="alert alert-success mt-4"><CheckCircle size={16} /> {msg}</div>}
        </div>
      </div>
    </>
  );
}
