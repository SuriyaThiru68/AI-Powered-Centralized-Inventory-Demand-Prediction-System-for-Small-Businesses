import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { Play, Loader, ChevronDown, ChevronUp, Bot } from "lucide-react";

/** Same markdown renderer used in AiAssistant */
function renderInline(text) {
  const parts = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
    else if (m[4]) parts.push(<code key={m.index} style={{ background: "rgba(0,0,0,0.07)", borderRadius: 4, padding: "0.1em 0.35em", fontSize: "0.88em", fontFamily: "monospace" }}>{m[4]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownResult({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];
  let key = 0;
  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={key++} style={{ margin: "0.4rem 0 0.4rem 1.1rem", padding: 0, listStyle: "disc" }}>
          {listItems.map((li, i) => <li key={i} style={{ marginBottom: "0.2rem" }}>{renderInline(li)}</li>)}
        </ul>
      );
      listItems = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,3})\s+(.+)/);
    if (heading) { flushList(); const sz = { 1: "1.05rem", 2: "1rem", 3: "0.95rem" }; elements.push(<p key={key++} style={{ fontWeight: 700, fontSize: sz[heading[1].length], margin: "0.5rem 0 0.15rem", color: "var(--navy)" }}>{renderInline(heading[2])}</p>); continue; }
    const bullet = line.match(/^[-*]\s+(.+)/);
    if (bullet) { listItems.push(bullet[1]); continue; }
    if (/^---+$/.test(line)) { flushList(); elements.push(<hr key={key++} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.5rem 0" }} />); continue; }
    if (!line.trim()) { flushList(); elements.push(<div key={key++} style={{ height: "0.35rem" }} />); continue; }
    flushList();
    elements.push(<p key={key++} style={{ margin: 0, lineHeight: 1.6 }}>{renderInline(line)}</p>);
  }
  flushList();
  return <div style={{ display: "flex", flexDirection: "column", gap: "0.05rem", fontSize: "0.875rem" }}>{elements}</div>;
}

const AGENTS = [
  {
    id: "data",
    emoji: "📥",
    name: "Data Agent",
    desc: "Analyses your product catalog and validates data quality.",
    endpoint: "/api/agent/data",
    inputLabel: "What data should I analyse?",
    placeholder: "e.g. Check my product data for issues or gaps",
  },
  {
    id: "sales",
    emoji: "📊",
    name: "Sales Agent",
    desc: "Interprets sales trends and identifies opportunities.",
    endpoint: "/api/agent/sales",
    inputLabel: "Sales question",
    placeholder: "e.g. Which products are selling best this month?",
  },
  {
    id: "prediction",
    emoji: "🔮",
    name: "Prediction Agent",
    desc: "Forecasts future demand based on your sales history.",
    endpoint: "/api/agent/prediction",
    inputLabel: "What do you want to forecast?",
    placeholder: "e.g. Predict demand for my top 5 products next month",
  },
  {
    id: "decision",
    emoji: "⚖️",
    name: "Decision Agent",
    desc: "Recommends reorder and inventory decisions.",
    endpoint: "/api/agent/decision-ai",
    inputLabel: "Decision context",
    placeholder: "e.g. Which products should I reorder immediately?",
  },
  {
    id: "order",
    emoji: "🛒",
    name: "Order Agent",
    desc: "Helps create and manage purchase orders.",
    endpoint: "/api/agent/order",
    inputLabel: "Order query",
    placeholder: "e.g. Create a reorder plan for low-stock items",
  },
  {
    id: "automation",
    emoji: "🔄",
    name: "Automation Agent",
    desc: "Suggests recurring inventory automation workflows.",
    endpoint: "/api/agent/automation",
    inputLabel: "What to automate?",
    placeholder: "e.g. Automate weekly low-stock checks",
  },
  {
    id: "notification",
    emoji: "📱",
    name: "Notification Agent",
    desc: "Summarises alerts and suggests notification rules.",
    endpoint: "/api/agent/notification",
    inputLabel: "Notification query",
    placeholder: "e.g. What alerts should I set up for my store?",
  },
  {
    id: "profit",
    emoji: "💰",
    name: "Profit Agent",
    desc: "Tracks margins and suggests pricing optimisations.",
    endpoint: "/api/agent/profit",
    inputLabel: "Profit query",
    placeholder: "e.g. Which products have the best margins?",
  },
  {
    id: "voice",
    emoji: "🗣",
    name: "Voice Agent",
    desc: "Natural language queries over your entire store.",
    endpoint: "/api/agent/voice",
    inputLabel: "Ask anything",
    placeholder: "e.g. Give me a full summary of my store right now",
  },
];

function AgentCard({ agent }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const run = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setExpanded(true);
    try {
      const r = await api.post(agent.endpoint, { message: input.trim() });
      setResult(r.data.reply || r.data.message || JSON.stringify(r.data, null, 2));
    } catch (err) {
      setError(err.response?.data?.message || "Agent error — check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="card card-premium"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ overflow: "visible" }}
    >
      <div className="card-body">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "1.75rem", lineHeight: 1 }}>{agent.emoji}</div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--navy)" }}>{agent.name}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{agent.desc}</div>
          </div>
        </div>

        {/* Input */}
        <label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
          {agent.inputLabel}
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="form-control"
            style={{ flex: 1, fontSize: "0.875rem" }}
            placeholder={agent.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={run}
            disabled={loading || !input.trim()}
            style={{ flexShrink: 0 }}
          >
            {loading ? <Loader size={15} className="animate-spin" /> : <Play size={15} />}
          </button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {(result || error || loading) && expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                    <Bot size={11} /> Agent Response
                  </span>
                  <button type="button" onClick={() => setExpanded(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    <ChevronUp size={15} />
                  </button>
                </div>

                {loading && (
                  <div style={{ display: "flex", gap: 4, padding: "0.5rem 0" }}>
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay }} style={{ color: "var(--text-muted)" }}>●</motion.span>
                    ))}
                  </div>
                )}

                {error && (
                  <div style={{ color: "var(--danger)", background: "#fdecea", borderRadius: "var(--radius-lg)", padding: "0.75rem 1rem", fontSize: "0.85rem" }}>
                    {error}
                  </div>
                )}

                {result && !loading && (
                  <div style={{ background: "var(--surface-muted)", borderRadius: "var(--radius-lg)", padding: "1rem", color: "var(--text)" }}>
                    <MarkdownResult text={result} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {result && !expanded && (
          <button type="button" onClick={() => setExpanded(true)} style={{ marginTop: "0.75rem", background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <ChevronDown size={13} /> Show last response
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function AgentsPage() {
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">AI</p>
        <h1 className="page-title">AI Agents</h1>
        <p className="page-subtitle">9 specialised agents powered by Gemini. Ask each one a targeted question about your store.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </>
  );
}
