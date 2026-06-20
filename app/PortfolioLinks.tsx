"use client";

const PORTFOLIO_LINKS = [
  { label: "Product Intelligence Platform", href: "https://product-intelligence-platform.vercel.app", color: "#6366f1" },
  { label: "Data Engineering Foundation",   href: "https://data-engineering-foundation.vercel.app",   color: "#10b981" },
  { label: "Systems Architecture",          href: "https://systems-architecture.vercel.app",          color: "#f43f5e" },
];

export default function PortfolioLinks() {
  return (
    <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #1e1e2e" }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", marginBottom: "10px" }}>
        Portfolio
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {PORTFOLIO_LINKS.map(({ label, href, color }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.79rem", fontWeight: 500, color: "#94a3b8", textDecoration: "none", border: "1px solid #1e1e2e", borderRadius: "7px", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = color;
              (e.currentTarget as HTMLAnchorElement).style.color = color;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e1e2e";
              (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0 }} />
            {label}
          </a>
        ))}
      </div>
      <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "12px" }}>
        Written case study — all thresholds, statistical frameworks, and analytical approaches described from first-hand analytics work at a B2B experimentation and digital-experience platform. No customer data reproduced.
      </div>
    </div>
  );
}
