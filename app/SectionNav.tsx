"use client";

import { useEffect, useState } from "react";

// Optional curated labels by section id. The rail still auto-discovers every
// <section id> in the DOM, in document order; these just refine the text.
// Resolution order per section: data-rail attr > this map > heading text > prettified id.
const LABELS: Record<string, string> = {"what-to-test": "What to Test", "design": "Design", "sample-size": "Sample Size", "run": "Run", "mvt": "Multivariate", "stats": "Statistics", "ai-accel": "AI Boost", "cohort": "Cohort", "causal": "Causal", "code": "Code"};

const prettify = (id: string) =>
  id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

type Item = { id: string; label: string };

export default function SectionNav() {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const found: Item[] = [];
    document.querySelectorAll<HTMLElement>("section[id]").forEach((sec) => {
      if (sec.dataset.rail === "skip") return;
      const h = sec.querySelector("h1, h2, h3");
      const heading = (h?.textContent || "").replace(/\s+/g, " ").trim();
      const label = sec.dataset.rail || LABELS[sec.id] || heading || prettify(sec.id);
      if (label) found.push({ id: sec.id, label });
    });
    setItems(found);
    if (found[0]) setActive(found[0].id);

    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive((e.target as HTMLElement).id);
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    found.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="section-rail"
      style={{ position: "fixed", right: "26px", top: "50%", transform: "translateY(-50%)", zIndex: 40, flexDirection: "column", gap: "5px", maxHeight: "86vh", overflowY: "auto" }}
    >
      {items.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? "true" : undefined}
            style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", textDecoration: "none", padding: "3px 0" }}
          >
            <span style={{ fontSize: "0.7rem", fontWeight: on ? 700 : 500, color: on ? "var(--accent)" : "var(--foreground-subtle, #4a4a68)", whiteSpace: "nowrap", transition: "color .2s" }}>
              {s.label}
            </span>
            <span style={{ width: on ? "24px" : "12px", height: "3px", borderRadius: "2px", background: on ? "var(--accent)" : "var(--border, #2a2a3a)", transition: "all .2s", flexShrink: 0 }} />
          </a>
        );
      })}
    </nav>
  );
}
