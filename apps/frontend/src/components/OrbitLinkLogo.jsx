/**
 * OrbitLink logo — an orbit ring with a node dot, rendered as inline SVG.
 * Props:
 *   size   — number (default 32)
 *   color  — accent colour for the ring/dot (default var(--accent) = #e85d04)
 *   white  — bool, forces white palette (for dark backgrounds)
 *   text   — bool (default true), show "OrbitLink" wordmark
 */
export default function OrbitLinkLogo({ size = 32, color, white = false, text = true }) {
  const ring = white ? "#ffffff" : color || "#e85d04";
  const dot  = white ? "#ffffff" : color || "#e85d04";
  const wordColor = white ? "#ffffff" : "#1a2836";
  const accentWord = white ? "#ffffff" : color || "#e85d04";
  const s = size;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(s * 0.3), userSelect: "none" }}>
      {/* Icon mark */}
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Outer orbit ellipse */}
        <ellipse cx="20" cy="20" rx="18" ry="9" stroke={ring} strokeWidth="2.2" strokeLinecap="round" opacity="0.35" transform="rotate(-30 20 20)" />
        {/* Inner orbit ellipse */}
        <ellipse cx="20" cy="20" rx="18" ry="9" stroke={ring} strokeWidth="2.2" strokeLinecap="round" opacity="0.6" transform="rotate(30 20 20)" />
        {/* Center dot (the "link" node) */}
        <circle cx="20" cy="20" r="4.5" fill={dot} />
        {/* Orbiting node 1 */}
        <circle cx="35" cy="17" r="2.5" fill={ring} opacity="0.85" />
        {/* Orbiting node 2 */}
        <circle cx="8"  cy="26" r="2"   fill={ring} opacity="0.5"  />
      </svg>

      {/* Wordmark */}
      {text && (
        <span style={{
          fontWeight: 800,
          fontSize: Math.round(s * 0.55),
          letterSpacing: "-0.03em",
          color: wordColor,
          lineHeight: 1,
        }}>
          Orbit<span style={{ color: accentWord }}>Link</span>
        </span>
      )}
    </span>
  );
}
