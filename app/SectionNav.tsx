"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "what-to-test",  label: "What to Test"  },
  { id: "design",        label: "Design"         },
  { id: "sample-size",   label: "Sample Size"    },
  { id: "run",           label: "Run"            },
  { id: "mvt",           label: "Multivariate"   },
  { id: "stats",         label: "Statistics"     },
  { id: "ai-accel",      label: "AI Boost"       },
  { id: "cohort",        label: "Cohort"         },
  { id: "causal",        label: "Causal"         },
  { id: "code",          label: "Code"           },
];

export default function SectionNav() {
  const [active, setActive] = useState(SECTIONS[0].id);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive((e.target as HTMLElement).id); }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return (
    <nav aria-label="Section navigation" className="section-rail" style={{ position: "fixed", right: "26px", top: "50%", transform: "translateY(-50%)", zIndex: 40, flexDirection: "column", gap: "5px" }}>
      {SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <a key={s.id} href={`#${s.id}`} aria-current={on ? "true" : undefined}
            style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", textDecoration: "none", padding: "3px 0" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: on ? 700 : 500, color: on ? "var(--accent)" : "var(--foreground-subtle, #4a4a68)", whiteSpace: "nowrap", transition: "color .2s" }}>{s.label}</span>
            <span style={{ width: on ? "24px" : "12px", height: "3px", borderRadius: "2px", background: on ? "var(--accent)" : "var(--border, #2a2a3a)", transition: "all .2s" }} />
          </a>
        );
      })}
    </nav>
  );
}
