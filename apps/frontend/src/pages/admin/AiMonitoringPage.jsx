import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Activity, CheckCircle, XCircle, Clock } from "lucide-react";

const AGENTS = [
  { id: "data",         emoji: "📥", name: "Data Agent",         desc: "Ingests and validates product/sales data",     status: "active" },
  { id: "sales",        emoji: "📊", name: "Sales Agent",        desc: "Analyses sales trends and revenue patterns",   status: "active" },
  { id: "prediction",   emoji: "🔮", name: "Prediction Agent",   desc: "Forecasts demand using historical data",       status: "active" },
  { id: "decision",     emoji: "⚖️", name: "Decision Agent",     desc: "Recommends reorder and restocking actions",    status: "active" },
  { id: "order",        emoji: "🛒", name: "Order Agent",        desc: "Automates purchase order creation",            status: "active" },
  { id: "automation",   emoji: "🔄", name: "Automation Agent",   desc: "Schedules recurring inventory tasks",          status: "idle" },
  { id: "notification", emoji: "📱", name: "Notification Agent", desc: "Sends alerts for low stock and anomalies",     status: "idle" },
  { id: "profit",       emoji: "💰", name: "Profit Agent",       desc: "Tracks margins and optimises pricing",         status: "idle" },
  { id: "voice",        emoji: "🗣", name: "Voice Agent",        desc: "Natural language queries over store data",     status: "idle" },
];

const STATUS_CONFIG = {
  active: { icon: CheckCircle, color: "var(--success)", bg: "#e8f5ef", label: "Active" },
  idle:   { icon: Clock,        color: "#b45309",        bg: "#fff8e1", label: "Idle" },
  error:  { icon: XCircle,      color: "var(--danger)",  bg: "#fdecea", label: "Error" },
};

export default function AiMonitoringPage() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Admin · AI</p>
        <h1 className="page-title">AI Monitoring</h1>
        <p className="page-subtitle">Status of all 9 AI agents across the platform.</p>
      </header>

      {/* Summary bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = AGENTS.filter((a) => a.status === key).length;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, background: cfg.bg, borderRadius: "var(--radius-lg)", padding: "0.6rem 1rem", fontSize: "0.85rem", fontWeight: 600, color: cfg.color }}>
              <cfg.icon size={15} /> {count} {cfg.label}
            </div>
          );
        })}
      </div>

      {/* Agent cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {AGENTS.map((agent) => {
          const sc = STATUS_CONFIG[agent.status];
          const isOpen = selected === agent.id;
          return (
            <motion.div
              key={agent.id}
              className="card card-premium"
              whileHover={{ y: -4 }}
              onClick={() => setSelected(isOpen ? null : agent.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "2rem" }}>{agent.emoji}</div>
                  <span style={{ background: sc.bg, color: sc.color, fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {sc.label}
                  </span>
                </div>
                <div style={{ marginTop: "0.75rem", fontWeight: 700, color: "var(--navy)" }}>{agent.name}</div>
                <div style={{ marginTop: "0.25rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>{agent.desc}</div>

                {isOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Last run</span><span style={{ color: "var(--text)" }}>—</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Avg latency</span><span style={{ color: "var(--text)" }}>—</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Total runs</span><span style={{ color: "var(--text)" }}>0</span></div>
                    </div>
                    <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Activity size={12} /> Powered by Gemini
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Bot size={12} /> LangChain orchestrated
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
