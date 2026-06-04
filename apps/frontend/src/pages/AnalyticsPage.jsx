import { useEffect, useState } from "react";
import api from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState([]);
  useEffect(() => {
    api.get("/api/sales/analytics?days=14").then((r) => {
      const daily = r.data.data?.dailyRevenue || [];
      setData(daily.map((d) => ({ name: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }), revenue: d.revenue })));
    });
  }, []);
  return (
    <>
      <header className="page-header"><h1 className="page-title">Analytics</h1></header>
      <div style={{ background: "#fff", border: "1px solid var(--border)", padding: "1.5rem", height: 360 }}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#e85d04" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", paddingTop: "4rem", color: "var(--text-muted)" }}>Record sales to see charts.</p>
        )}
      </div>
    </>
  );
}
