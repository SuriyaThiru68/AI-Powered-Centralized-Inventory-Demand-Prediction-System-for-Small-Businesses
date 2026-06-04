import { useEffect, useState } from "react";
import api from "../lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api
      .get("/api/orders")
      .then((r) => setOrders(r.data.data || []))
      .catch(() => setOrders([]));
  }, []);
  return (
    <>
      <header className="page-header"><h1 className="page-title">Orders</h1></header>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>PO</th><th>Product</th><th>Supplier</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.poNumber}</td>
                <td>{o.productName}</td>
                <td>{o.supplier}</td>
                <td>₹{o.totalAmount}</td>
                <td><span className="badge badge-ok">{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
