import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, ArrowRight } from "lucide-react";
import api, { getStoredUser } from "../lib/api";
import OrbitLinkLogo from "./OrbitLinkLogo";

function formatError(err) {
  if (!err.response) {
    return "Cannot reach API — run npm run dev:backend on port 5000.";
  }
  if (err.response.status === 401) return "Please sign in to use AI chat.";
  return err.response?.data?.message || `Error (${err.response.status})`;
}

/** Render inline markdown: **bold**, *italic*, `code` */
function renderInline(text) {
  const parts = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
    else if (m[4]) parts.push(
      <code key={m.index} style={{ background: "rgba(0,0,0,0.07)", borderRadius: 4, padding: "0.1em 0.35em", fontSize: "0.88em", fontFamily: "monospace" }}>
        {m[4]}
      </code>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Parse full markdown text into JSX blocks */
function MarkdownMessage({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={key++} style={{ margin: "0.4rem 0 0.4rem 1.1rem", padding: 0, listStyle: "disc" }}>
          {listItems.map((li, i) => (
            <li key={i} style={{ marginBottom: "0.2rem" }}>{renderInline(li)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Headings: ### ## #
    const heading = line.match(/^(#{1,3})\s+(.+)/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const sizes = { 1: "1.1rem", 2: "1rem", 3: "0.95rem" };
      elements.push(
        <p key={key++} style={{ fontWeight: 700, fontSize: sizes[level] || "1rem", margin: "0.6rem 0 0.2rem", color: "var(--navy)" }}>
          {renderInline(heading[2])}
        </p>
      );
      continue;
    }

    // Bullet list: - or *
    const bullet = line.match(/^[-*]\s+(.+)/);
    if (bullet) {
      listItems.push(bullet[1]);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line)) {
      flushList();
      elements.push(<hr key={key++} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.5rem 0" }} />);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      flushList();
      elements.push(<div key={key++} style={{ height: "0.4rem" }} />);
      continue;
    }

    // Regular paragraph line
    flushList();
    elements.push(
      <p key={key++} style={{ margin: 0, lineHeight: 1.6 }}>
        {renderInline(line)}
      </p>
    );
  }

  flushList();
  return <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>{elements}</div>;
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! Ask about inventory, sales, or reorder recommendations." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message whenever messages change or loading changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus the input whenever the drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!getStoredUser()?.token) {
      setMessages((m) => [...m, { role: "bot", text: "Please sign in to use AI chat." }]);
      return;
    }
    const msg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const r = await api.post("/api/agent/chat", { message: msg });
      setMessages((m) => [
        ...m,
        { role: "bot", text: r.data.reply || "No response." },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { role: "bot", text: formatError(err) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        className="ai-fab"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="AI Assistant"
      >
        <Bot size={26} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 199 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="ai-drawer open"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              {/* Header */}
              <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", background: "linear-gradient(135deg, var(--accent-soft), #fff)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bot size={22} />
                    </div>
                    <div>
                      <strong>AI Assistant</strong>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Powered by <OrbitLinkLogo size={12} text /></p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflow: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`chat-bubble ${m.role}`}
                  >
                    {m.role === "bot" ? <MarkdownMessage text={m.text} /> : m.text}
                  </motion.div>
                ))}
                {loading && (
                  <div className="chat-bubble bot flex gap-1">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}>●</motion.span>
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>●</motion.span>
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>●</motion.span>
                  </div>
                )}
                {/* Invisible anchor — scrolled into view on every new message */}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border)" }}>
                <input
                  ref={inputRef}
                  className="form-control"
                  style={{ borderRadius: 999 }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask anything…"
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm w-full"
                  style={{ marginTop: "0.5rem" }}
                  onClick={send}
                  disabled={loading}
                >
                  <ArrowRight size={16} /> Send
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
