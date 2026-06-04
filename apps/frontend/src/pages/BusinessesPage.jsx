import { useEffect, useState } from "react";
import api from "../lib/api";

export default function BusinessesPage() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/api/businesses").then((r) => setList(r.data.data || [])).catch(() => {}); }, []);
  return (
    <>
      <header className="page-header"><h1 className="page-title">All Businesses</h1></header>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Plan</th><th>Status</th></tr></thead>
          <tbody>
            {list.map((b) => (
              <tr key={b._id}><td>{b.name}</td><td>{b.slug}</td><td>{b.plan}</td><td>{b.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
