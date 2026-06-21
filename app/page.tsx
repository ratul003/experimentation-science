"use client";

import React, { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import SectionNav from "./SectionNav";

// ── Tech stack tool icons ─────────────────────────────────────────────────────

const EXP_TOOLS = [
  {
    name: "Snowflake", color: "#29b5e8", cat: "Warehouse",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <line x1="12" y1="2"   x2="12" y2="22"  stroke="#29b5e8" strokeWidth="2" strokeLinecap="round"/>
        <line x1="2"  y1="12"  x2="22" y2="12"  stroke="#29b5e8" strokeWidth="2" strokeLinecap="round"/>
        <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="2.5" fill="#29b5e8"/>
      </svg>
    ),
  },
  {
    name: "Experiment Platform", color: "#f59e0b", cat: "Platform",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <circle cx="12" cy="12" r="9"   stroke="#f59e0b" strokeWidth="2"/>
        <circle cx="12" cy="12" r="5"   stroke="#f59e0b" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="12" cy="12" r="1.8" fill="#f59e0b"/>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: "Python", color: "#3776AB", cat: "Analysis",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <path d="M12 2C9 2 8 3.5 8 5v3h4.5v1H5.5C3.5 9 2 10.5 2 13s1.4 4 3.5 4H7v-2.5C7 12.5 8.5 11 11 11h6c2 0 3-1.2 3-3V5c0-2-1.5-3-8-3Z" fill="#3776AB" fillOpacity="0.8"/>
        <circle cx="10" cy="5.5" r="1" fill="white"/>
        <path d="M12 22c3 0 4-1.5 4-3v-3h-4.5v-1h6.5c2 0 3.5-1.5 3.5-4s-1.4-4-3.5-4H17v2.5C17 11.5 15.5 13 13 13H7c-2 0-3 1.2-3 3v3c0 2 1.5 3 8 3Z" fill="#FFD43B" fillOpacity="0.9"/>
        <circle cx="14" cy="18.5" r="1" fill="#3776AB"/>
      </svg>
    ),
  },
  {
    name: "SQL", color: "#fbbf24", cat: "Querying",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <ellipse cx="12" cy="7"  rx="8" ry="3"   stroke="#fbbf24" strokeWidth="1.8" fill="#fbbf2412"/>
        <path d="M4 7v5c0 1.657 3.582 3 8 3s8-1.343 8-3V7" stroke="#fbbf24" strokeWidth="1.8"/>
        <path d="M4 12v5c0 1.657 3.582 3 8 3s8-1.343 8-3v-5" stroke="#fbbf24" strokeWidth="1.8" opacity="0.55"/>
      </svg>
    ),
  },
  {
    name: "Bayesian Stats", color: "#8b5cf6", cat: "Inference",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <path d="M2 18 C4 18 5 8 7 8 C9 8 9 14 11 14 C13 14 13 6 15 6 C17 6 17 14 19 14 C21 14 21 10 22 10" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <line x1="2" y1="20" x2="22" y2="20" stroke="#8b5cf6" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <circle cx="11" cy="14" r="1.5" fill="#8b5cf6" opacity="0.7"/>
        <circle cx="15" cy="6"  r="1.5" fill="#8b5cf6"/>
      </svg>
    ),
  },
  {
    name: "Causal Inference", color: "#10b981", cat: "Identification",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <circle cx="5"  cy="12" r="2.5" stroke="#10b981" strokeWidth="1.8" fill="#10b98112"/>
        <circle cx="19" cy="6"  r="2.5" stroke="#10b981" strokeWidth="1.8" fill="#10b98112"/>
        <circle cx="19" cy="18" r="2.5" stroke="#10b981" strokeWidth="1.8" fill="#10b98112"/>
        <path d="M7.2 11L17 7.2"  stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>
        <path d="M7.2 13L17 16.8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="19" y1="8.5" x2="19" y2="15.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4"/>
      </svg>
    ),
  },
];

// ── Math utilities (power analysis in the browser) ────────────────────────────

function normalCDF(z: number): number {
  const p = 0.2316419;
  const b = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429];
  const t = 1 / (1 + p * Math.abs(z));
  const y = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) *
    (((((b[4] * t + b[3]) * t + b[2]) * t + b[1]) * t + b[0]) * t);
  return z >= 0 ? y : 1 - y;
}

function computePower(n: number, baseline: number, mde: number): number {
  if (n < 1 || baseline <= 0 || mde <= 0) return 0;
  const treatment = baseline * (1 + mde);
  const pooled = (baseline + treatment) / 2;
  const se = Math.sqrt(2 * pooled * (1 - pooled) / n);
  if (se === 0) return 0;
  const z = Math.abs(treatment - baseline) / se;
  return normalCDF(z - 1.96) + normalCDF(-z - 1.96);
}

function computeRequiredN(baseline: number, mde: number): number {
  let lo = 50, hi = 2_000_000;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (computePower(mid, baseline, mde) >= 0.80) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// ── Utility components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold tracking-[0.15em] uppercase text-amber-500 mb-3">{children}</p>;
}
function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">{children}</h2>;
}
function Divider() {
  return <div className="divider-gradient my-20" />;
}
function ChapterBadge({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "52px" }}>
      <div style={{ flexShrink: 0, width: "60px", height: "60px", borderRadius: "14px", background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.62rem", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#f59e0b" }}>{num}</span>
      </div>
      <div>
        <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px", lineHeight: 1.2 }}>{title}</h2>
        <p style={{ fontSize: "0.88rem", color: "#9ca3af", maxWidth: "560px", lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}
function ChapterTransition({ from, to }: { from: string; to: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "80px 0 64px", padding: "18px 28px", background: "rgba(245,158,11,0.04)", borderRadius: "12px", border: "1px solid rgba(245,158,11,0.10)" }}>
      <span style={{ fontSize: "0.78rem", color: "#52525b" }}>{from}</span>
      <svg width="32" height="10" viewBox="0 0 32 10" fill="none">
        <path d="M0 5h28M24 1l4 4-4 4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fbbf24" }}>{to}</span>
    </div>
  );
}

// ── Story Arc ─────────────────────────────────────────────────────────────────

function StoryArc() {
  const chapters = [
    { label: "Ch01", title: "The Question",   desc: "What should we test and why?",          href: "#what-to-test" },
    { label: "Ch02", title: "The Design",     desc: "Building an experiment you can trust",  href: "#design"       },
    { label: "Ch03", title: "The Analysis",   desc: "Statistics, MVT, and interaction effects", href: "#mvt"       },
    { label: "Ch04", title: "AI + Causal",    desc: "Agents that accelerate every phase",    href: "#ai-accel"     },
  ];
  return (
    <div style={{ background: "rgba(245,158,11,0.03)", borderTop: "1px solid rgba(245,158,11,0.10)", borderBottom: "1px solid rgba(245,158,11,0.10)", marginBottom: "80px" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ display: "flex" }}>
          {chapters.map(({ label, title, desc, href }, i) => (
            <a key={label} href={href} style={{ textDecoration: "none", flex: 1, padding: "20px 24px", borderRight: i < chapters.length - 1 ? "1px solid rgba(245,158,11,0.10)" : "none" }} className="card-hover">
              <div style={{ fontSize: "0.58rem", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "#f59e0b", marginBottom: "5px" }}>{label}</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "3px" }}>{title}</div>
              <div style={{ fontSize: "0.67rem", color: "#6b7280" }}>{desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Hero mini power curve ─────────────────────────────────────────────────────

function MiniPowerCurve() {
  const W = 280; const H = 160;
  const TX = Math.round(W * 5 / 28);
  const TY = Math.round(H * 0.20);
  return (
    <div style={{ background: "#0d1117", border: "1px solid #1e1e2e", borderRadius: "14px", padding: "20px" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "12px" }}>
        Statistical Power vs Sample Size
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <line x1="0" y1={TY} x2={W} y2={TY} stroke="#1e2a1e" strokeWidth="1" strokeDasharray="4 3" />
        <path d={`M 0,${H - 4} C 18,${H - 6} 34,${H - 30} ${TX},${TY} S 150,6 ${W},3`}
          fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <line x1={TX} y1={TY} x2={TX} y2={H} stroke="rgba(16,185,129,0.5)" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="0" y1={TY} x2={TX} y2={TY} stroke="rgba(16,185,129,0.4)" strokeWidth="1" strokeDasharray="4 3" />
        <circle cx={TX} cy={TY} r="5" fill="#10b981" stroke="#0d1117" strokeWidth="2" />
        <text x={TX + 5} y={H - 4} fontSize="9" fill="#10b981" fontWeight="700">5K</text>
        <text x="3" y={TY - 5} fontSize="9" fill="#10b981" fontWeight="700">80%</text>
        <text x="3" y={H - 4} fontSize="8" fill="#4a4a68">0%</text>
        <text x={W - 24} y="11" fontSize="8" fill="#4a4a68">100%</text>
        <text x={W - 26} y={H - 4} fontSize="8" fill="#4a4a68">25K+</text>
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
        <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>5K impressions = 80% power at α=0.05, 10% MDE</span>
      </div>
    </div>
  );
}

// ── PM hypothesis cards ───────────────────────────────────────────────────────

const HYPOTHESES = [
  {
    id: "pricing",
    tag: "Pricing & Packaging",
    tagColor: "#818cf8",
    question: "Does a 3-tier pricing model convert better than 2 tiers?",
    hypothesis: "If we introduce an Enterprise+ tier with AI features previewed (but gated), the upgrade rate from Growth will increase by 15% because customers value seeing capability before committing.",
    metric: "Growth → Enterprise+ upgrade rate",
    type: "Feature Flag",
    mde: "15%",
    expectedDays: "14–21 days",
    insight: "The control had two tiers. Adding a third tier with a visible-but-locked AI feature created anchoring : customers benchmarked Growth against Enterprise+ and saw clear value in upgrading.",
  },
  {
    id: "feature",
    tag: "Feature Adoption",
    tagColor: "#f59e0b",
    question: "Does surfacing AI suggestions inline vs modal increase Dev Agent adoption?",
    hypothesis: "If AI experiment suggestions appear inline in the editor (vs a separate modal), Dev Agent adoption will increase by 20% because friction at the point of decision matters more than comprehensive feature display.",
    metric: "Dev Agent activation rate (first use within 7 days)",
    type: "Feature Experimentation",
    mde: "20%",
    expectedDays: "10–14 days",
    insight: "The modal variant required an extra click and broke the user's flow. Inline suggestions appeared at the exact moment users were defining their experiment: adoption jumped 23%.",
  },
  {
    id: "onboarding",
    tag: "Onboarding Optimization",
    tagColor: "#34d399",
    question: "Does showing a qualification progress bar reduce time-to-first-qualified-experiment?",
    hypothesis: "If we show impression progress toward the 5,000-impression threshold during the running phase, time-to-first-qualified-experiment will decrease by 10% because visibility into quality metrics drives deliberate traffic allocation.",
    metric: "Days from experiment creation to first qualified run",
    type: "Web Experimentation",
    mde: "10%",
    expectedDays: "21–28 days",
    insight: "Teams with the progress bar were 12% more likely to adjust traffic allocation mid-experiment to reach the threshold faster. The visibility changed behaviour, not just awareness.",
  },
];

function HypothesisCards() {
  const [active, setActive] = useState<string>("pricing");
  const card = HYPOTHESES.find(h => h.id === active)!;
  return (
    <div>
      {/* Tab row */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {HYPOTHESES.map(h => (
          <button key={h.id} onClick={() => setActive(h.id)}
            style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all .15s",
              background: active === h.id ? `${h.tagColor}18` : "transparent",
              borderColor: active === h.id ? `${h.tagColor}60` : "#2a2a3a",
              color: active === h.id ? h.tagColor : "#6b7280" }}>
            {h.tag}
          </button>
        ))}
      </div>
      {/* Card */}
      <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ background: `${card.tagColor}10`, borderBottom: `1px solid ${card.tagColor}20`, padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: card.tagColor }}>{card.tag}</span>
          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>·</span>
          <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{card.type} · MDE {card.mde} · {card.expectedDays}</span>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {/* Business question */}
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "14px", lineHeight: 1.4 }}>{card.question}</p>
          {/* Hypothesis anatomy */}
          <div style={{ background: "#0d1117", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "14px 16px", marginBottom: "14px" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#f59e0b", marginBottom: "6px" }}>Hypothesis</div>
            <p style={{ fontSize: "0.83rem", color: "#9ca3af", lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>&ldquo;{card.hypothesis}&rdquo;</p>
          </div>
          {/* Two-col: metric + outcome */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ background: "#0d1117", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "5px" }}>Primary Metric</div>
              <p style={{ fontSize: "0.8rem", color: "#e2e8f0", margin: 0, lineHeight: 1.5 }}>{card.metric}</p>
            </div>
            <div style={{ background: `${card.tagColor}08`, border: `1px solid ${card.tagColor}20`, borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, color: card.tagColor, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "5px" }}>What actually happened</div>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>{card.insight}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cross-industry applicability ──────────────────────────────────────────────

const INDUSTRIES = [
  { sector: "E-commerce",     icon: "🛍", color: "#818cf8", example: "Does showing 'Only 3 left' near the Add to Cart button increase purchase rate?",               metric: "Add-to-cart rate",     type: "A/B · Web"     },
  { sector: "FinTech",        icon: "💳", color: "#f59e0b", example: "Does reducing the loan application from 12 to 6 fields increase completion?",                    metric: "Application completion", type: "A/B · Web"  },
  { sector: "Healthcare",     icon: "🏥", color: "#34d399", example: "Does displaying doctor ratings before booking increase appointment completion?",                  metric: "Booking completion",   type: "A/B · Web"     },
  { sector: "Media / DTC",    icon: "📱", color: "#f43f5e", example: "Does showing 3 personalised article previews before the paywall increase subscriptions?",       metric: "Subscription CVR",     type: "MVT · Feature" },
  { sector: "Enterprise SaaS",icon: "⚙️", color: "#fbbf24", example: "Does AI feature preview in the free tier increase upgrades to paid plans?",                      metric: "Plan upgrade rate",    type: "Feature Flag"  },
  { sector: "Logistics",      icon: "📦", color: "#a5b4fc", example: "Does real-time delivery ETA on the checkout screen reduce cart abandonment?",                    metric: "Cart completion rate", type: "A/B · Web"     },
];

function IndustryGrid() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
      {INDUSTRIES.map(({ sector, icon, color, example, metric, type }) => {
        const on = hovered === sector;
        return (
          <div key={sector}
            onMouseEnter={() => setHovered(sector)}
            onMouseLeave={() => setHovered(null)}
            style={{ background: on ? `${color}10` : "#12121a", border: `1px solid ${on ? color + "40" : "#2a2a3a"}`, borderRadius: "12px", padding: "16px", cursor: "default", transition: "all .2s" }}>
            <div style={{ fontSize: "1.25rem", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: on ? color : "#f1f5f9", marginBottom: "6px" }}>{sector}</div>
            <p style={{ fontSize: "0.72rem", color: "#9ca3af", lineHeight: 1.55, margin: "0 0 8px" }}>{example}</p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: "5px", background: `${color}18`, color }}>{type}</span>
              <span style={{ fontSize: "0.6rem", color: "#52525b", padding: "2px 7px", borderRadius: "5px", background: "#1a1a2e" }}>{metric}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Experiment type selector ──────────────────────────────────────────────────

const EXP_TYPES = [
  {
    id: "ab",
    label: "A/B Test",
    tagline: "One variable, two variants",
    color: "#818cf8",
    when: "You have a single, clear hypothesis. One element changes : everything else stays constant. Works for most product decisions.",
    platformProduct: "Web Experimentation or Feature Experimentation depending on surface",
    traffic: "Split evenly: 50/50",
    sampleImpact: "Standard : full power calculation applies",
    watchout: "Running multiple A/B tests on the same page simultaneously can contaminate results if users are exposed to both.",
    example: "Test whether changing the primary CTA from 'Start Free Trial' to 'Try It Free' increases sign-ups.",
  },
  {
    id: "mvt",
    label: "Multivariate (MVT)",
    tagline: "Multiple variables, all combinations",
    color: "#f59e0b",
    when: "You want to test multiple elements simultaneously and detect interaction effects : where two changes together outperform either alone.",
    platformProduct: "Web Experimentation (the platform supports full factorial and fractional factorial MVT)",
    traffic: "Split across all combinations: 4 variants in 2x2 = 25% each",
    sampleImpact: "Larger: n multiplies by number of cells. A 2x2 requires ~4x the traffic of a simple A/B test for equal power.",
    watchout: "Fractional factorial designs test a subset of combinations to reduce traffic requirements , but can't detect certain interaction effects.",
    example: "Test headline × social proof × CTA colour simultaneously. Required to catch super-additive interactions that sequential A/B tests miss.",
  },
  {
    id: "flag",
    label: "Feature Flag",
    tagline: "Server-side controlled rollout",
    color: "#34d399",
    when: "You're shipping a new feature and want to control rollout percentage, test it on a segment, or do a canary release before full launch.",
    platformProduct: "Feature Experimentation : SDK-based, works across any platform (web, mobile, server)",
    traffic: "Configurable: 0–100% rollout with targeting rules (user attributes, segments, environments)",
    sampleImpact: "Same power principles apply , but you control exposure exactly via SDK, so allocation is more precise than client-side cookie-based",
    watchout: "Feature flags persist across sessions. Users assigned to a variant stay in it. Don't flip flags mid-experiment without resetting the analysis.",
    example: "Roll out AI experiment suggestions to 10% of accounts, measure Dev Agent activation rate, expand to 50% if qualified.",
  },
  {
    id: "holdout",
    label: "Holdout Group",
    tagline: "Long-run counterfactual control",
    color: "#a5b4fc",
    when: "You want to measure the cumulative value of an entire product area or feature portfolio over time , not a single feature in isolation.",
    platformProduct: "Feature Experimentation with a persistent exclusion group : the platform supports holdout layers for exactly this use case",
    traffic: "Typically 5–10% held back from ALL feature changes for the entire measurement period",
    sampleImpact: "Designed for long-term (90–365 day) measurement. Requires explicit statistical adjustment for multiple comparisons over time.",
    watchout: "Holdout users receive no improvements for months. Balance measurement value against user experience degradation, especially for UX-critical paths.",
    example: "Hold 10% of accounts off all AI feature releases for a quarter. Compare renewal rate at quarter-end to estimate total AI portfolio value.",
  },
];

function ExperimentTypeSelector() {
  const [active, setActive] = useState<string>("ab");
  const t = EXP_TYPES.find(e => e.id === active)!;
  return (
    <div>
      {/* Type tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" }}>
        {EXP_TYPES.map(e => {
          const on = e.id === active;
          return (
            <button key={e.id} onClick={() => setActive(e.id)}
              style={{ padding: "10px 8px", borderRadius: "10px", border: `1px solid ${on ? e.color + "60" : "#2a2a3a"}`, background: on ? `${e.color}12` : "#12121a", cursor: "pointer", transition: "all .15s", textAlign: "center" as const }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: on ? e.color : "#9ca3af", marginBottom: "2px" }}>{e.label}</div>
              <div style={{ fontSize: "0.62rem", color: "#52525b" }}>{e.tagline}</div>
            </button>
          );
        })}
      </div>
      {/* Detail panel */}
      <div style={{ background: "#12121a", border: `1px solid ${t.color}25`, borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ background: `${t.color}10`, borderBottom: `1px solid ${t.color}20`, padding: "14px 20px" }}>
          <span style={{ fontSize: "0.92rem", fontWeight: 700, color: t.color }}>{t.label}</span>
          <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "12px" }}>{t.tagline}</span>
        </div>
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {[
            { label: "When to use",           value: t.when,          color: t.color },
            { label: "Platform product",       value: t.platformProduct, color: "#9ca3af" },
            { label: "Traffic allocation",     value: t.traffic,       color: "#9ca3af" },
            { label: "Sample size impact",     value: t.sampleImpact,  color: "#9ca3af" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#0d1117", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#52525b", marginBottom: "5px" }}>{label}</div>
              <p style={{ fontSize: "0.78rem", color, lineHeight: 1.55, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
        {/* Example */}
        <div style={{ padding: "0 24px 20px" }}>
          <div style={{ background: `${t.color}06`, border: `1px solid ${t.color}20`, borderRadius: "10px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, color: t.color, textTransform: "uppercase" as const, letterSpacing: "0.1em", flexShrink: 0, marginTop: "1px" }}>Example</span>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", lineHeight: 1.6, margin: 0 }}>{t.example}</p>
          </div>
          <div style={{ marginTop: "10px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#ef4444", textTransform: "uppercase" as const, letterSpacing: "0.1em", flexShrink: 0, marginTop: "1px" }}>Watch out</span>
            <p style={{ fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{t.watchout}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Interactive sample size calculator ────────────────────────────────────────

function SampleSizeCalculator() {
  const [baseline, setBaseline] = useState(3);
  const [mde, setMde] = useState(10);
  const [variants, setVariants] = useState(2);

  const baselineF = baseline / 100;
  const mdeF = mde / 100;
  const requiredN = computeRequiredN(baselineF, mdeF);
  const powerAt5K = computePower(5000, baselineF, mdeF);
  const totalN = requiredN * variants;
  const daysAt500 = Math.ceil(totalN / 500);
  const daysAt2K = Math.ceil(totalN / 2000);
  const isQualified = requiredN <= 5000;

  const powerRows = [
    { n: 1000, label: "1K" },
    { n: 2500, label: "2.5K" },
    { n: 5000, label: "5K", threshold: true },
    { n: 10000, label: "10K" },
    { n: 25000, label: "25K" },
  ].map(r => ({ ...r, power: computePower(r.n, baselineF, mdeF) }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
      {/* Left: sliders */}
      <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "24px" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "20px" }}>
          Experiment parameters
        </div>

        {[
          { label: "Baseline conversion rate", value: baseline, setter: setBaseline, min: 1, max: 15, step: 0.5, format: (v: number) => `${v}%` },
          { label: "Minimum detectable effect (relative)", value: mde, setter: setMde, min: 5, max: 50, step: 1, format: (v: number) => `${v}%` },
          { label: "Number of variants (incl. control)", value: variants, setter: setVariants, min: 2, max: 4, step: 1, format: (v: number) => `${v}` },
        ].map(({ label, value, setter, min, max, step, format }) => (
          <div key={label} style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fbbf24", fontFamily: "monospace" }}>{format(value)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => setter(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#f59e0b", cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
              <span style={{ fontSize: "0.6rem", color: "#4a4a68" }}>{format(min)}</span>
              <span style={{ fontSize: "0.6rem", color: "#4a4a68" }}>{format(max)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Right: results */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Key outputs */}
        <div style={{ background: isQualified ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)", border: `1px solid ${isQualified ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`, borderRadius: "14px", padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "n per variation", value: requiredN.toLocaleString(), sub: "for 80% power" },
              { label: "Total traffic needed", value: totalN.toLocaleString(), sub: `${variants} variants` },
              { label: "Power at 5,000 impressions", value: `${(powerAt5K * 100).toFixed(0)}%`, sub: isQualified ? "≥ threshold ✓" : "below threshold" },
              { label: "Duration estimate", value: `${daysAt2K}–${daysAt500}d`, sub: "at 2K–500 visits/day" },
            ].map(({ label, value, sub }) => (
              <div key={label}>
                <div style={{ fontSize: "0.6rem", color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "3px" }}>{label}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isQualified ? "#10b981" : "#f59e0b", fontFamily: "monospace" }}>{value}</div>
                <div style={{ fontSize: "0.62rem", color: "#52525b" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Power at each sample size */}
        <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "16px 18px" }}>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "12px" }}>
            Power curve: your parameters
          </div>
          {powerRows.map(({ n, label, threshold, power }) => {
            const pct = Math.min(100, Math.round(power * 100));
            const col = threshold ? "#10b981" : pct >= 80 ? "#34d399" : pct >= 50 ? "#f59e0b" : "#ef4444";
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px", background: threshold ? "rgba(16,185,129,0.04)" : "transparent", padding: threshold ? "5px 6px" : "0", borderRadius: "6px" }}>
                <div style={{ width: "32px", flexShrink: 0, fontSize: "0.72rem", fontFamily: "monospace", color: threshold ? "#10b981" : "#9ca3af" }}>{label}</div>
                <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: "3px", transition: "width .4s ease" }} />
                </div>
                <div style={{ width: "34px", textAlign: "right" as const, fontSize: "0.72rem", fontWeight: 700, color: col, fontFamily: "monospace" }}>{pct}%</div>
                {threshold && <span style={{ fontSize: "0.55rem", color: "#10b981", fontWeight: 700 }}>GATE</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Experiment lifecycle flow ─────────────────────────────────────────────────

function ExperimentLifecycleFlow() {
  const steps = [
    { label: "Hypothesis",       sub: "Define goal & metric",        color: "#a5b4fc" },
    { label: "Test Plan",        sub: "Agent or manual",             color: "#818cf8" },
    { label: "Randomisation",    sub: "Traffic allocation",          color: "#f59e0b" },
    { label: "Running",          sub: "Impression accumulation",     color: "#fbbf24" },
    { label: "5K Threshold",     sub: "Qualification gate",          color: "#10b981", gate: true },
    { label: "Statistical Test", sub: "Frequentist + Bayesian",      color: "#34d399" },
    { label: "Decision",         sub: "Ship / iterate / stop",       color: "#f59e0b" },
  ];
  return (
    <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "nowrap", minWidth: "620px" }}>
        {steps.map(({ label, sub, color, gate }, i) => (
          <React.Fragment key={label}>
            <div style={{ background: gate ? "rgba(16,185,129,0.12)" : `${color}10`, border: `1px solid ${gate ? "rgba(16,185,129,0.35)" : `${color}28`}`, borderRadius: "10px", padding: "10px 14px", textAlign: "center", flexShrink: 0, boxShadow: gate ? "0 0 16px rgba(16,185,129,0.15)" : "none" }}>
              {gate && <div style={{ fontSize: "0.55rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#10b981", marginBottom: "3px" }}>GATE</div>}
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap" }}>{label}</div>
              <div style={{ fontSize: "0.63rem", color, marginTop: "2px", whiteSpace: "nowrap" }}>{sub}</div>
            </div>
            {i < steps.length - 1 && <div style={{ color: "#4a5568", margin: "0 4px", fontSize: "0.85rem", flexShrink: 0 }}>→</div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Platform product decision guide ─────────────────────────────────────────

function PlatformProductGuide() {
  const products = [
    {
      name: "Web Experimentation",
      color: "#818cf8",
      layer: "Client-side",
      best: ["Pricing page layout", "CTA copy & colour", "Sign-up form changes", "Navigation tests", "Landing page MVT"],
      metrics: ["Click-through", "Form submissions", "Page engagement"],
      how: "JavaScript snippet or browser extension injects variant code. Traffic allocated by URL matching and custom audience rules.",
      typical_mde: "5–15%",
    },
    {
      name: "Feature Experimentation",
      color: "#10b981",
      layer: "Server-side",
      best: ["AI feature rollouts", "Algorithm changes", "Pricing tier logic", "Backend optimisation", "Mobile app features"],
      metrics: ["Custom conversion events", "Revenue events", "Error rates", "Session depth"],
      how: "SDK-based (JS, Python, Java, iOS, Android). Feature flags gate code paths. Traffic allocated by user attributes with exact reproducibility.",
      typical_mde: "10–30%",
    },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {products.map(({ name, color, layer, best, metrics, how, typical_mde }) => (
        <div key={name} style={{ background: "#12121a", border: `1px solid ${color}25`, borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ background: `${color}10`, borderBottom: `1px solid ${color}20`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color }}>{name}</span>
            <span style={{ fontSize: "0.68rem", padding: "3px 8px", borderRadius: "5px", background: `${color}20`, color }}>{layer}</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#52525b", marginBottom: "7px" }}>Best for</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {best.map(b => <span key={b} style={{ fontSize: "0.68rem", padding: "3px 8px", borderRadius: "5px", background: "#0d1117", color: "#9ca3af", border: "1px solid #1e1e2e" }}>{b}</span>)}
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.6, marginBottom: "12px" }}>{how}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, background: "#0d1117", borderRadius: "8px", padding: "8px 10px" }}>
                <div style={{ fontSize: "0.58rem", color: "#52525b", marginBottom: "3px" }}>Typical MDE</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color, fontFamily: "monospace" }}>{typical_mde}</div>
              </div>
              <div style={{ flex: 2, background: "#0d1117", borderRadius: "8px", padding: "8px 10px" }}>
                <div style={{ fontSize: "0.58rem", color: "#52525b", marginBottom: "3px" }}>Common metrics</div>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{metrics.join(" · ")}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* Decision strip */}
      <div style={{ gridColumn: "1 / -1", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "12px", padding: "14px 20px" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#f59e0b", marginBottom: "8px" }}>Decision rule</div>
        <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: 0, lineHeight: 1.65 }}>
          Is the change visible in the browser? Use <strong style={{ color: "#818cf8" }}>Web Experimentation</strong>.
          Is it a feature, algorithm, or something that needs to stay consistent across sessions and platforms? Use <strong style={{ color: "#10b981" }}>Feature Experimentation</strong>.
          Testing AI behaviour (Dev Agent suggestions, response formatting, model routing)? Always Feature Experimentation: the change lives server-side and must be consistent for a given user session.
        </p>
      </div>
    </div>
  );
}

// ── MVT results matrix ────────────────────────────────────────────────────────

function MVTResultsMatrix() {
  const [selected, setSelected] = useState<string | null>(null);
  const [replayStep, setReplayStep] = useState<number | null>(null);

  const replaySteps = [
    { title: "Test 1: Headline change", cell: "10", color: "#818cf8", result: "p = 0.148, not significant",
      desc: "You isolate the headline. Control: 3.1%. New benefit-focused headline: 3.3%. Standard stop criteria, not significant. Most teams kill the idea here." },
    { title: "Test 2: Social proof", cell: "01", color: "#818cf8", result: "p = 0.083, not significant",
      desc: "So you run social proof instead. Control: 3.1%. Social proof: 3.4%. Still not significant. Two tests run, and neither crossed the threshold." },
    { title: "Sequential conclusion", cell: null, color: "#ef4444", result: "Ship nothing",
      desc: "Two failed A/B tests. Logical conclusion: neither change works. You move on. The +35% lift is sitting there undiscovered." },
    { title: "Full factorial reality", cell: "11", color: "#10b981", result: "+35.5% · p < 0.001 ✓",
      desc: "The 2×2 design revealed: headline alone = n.s., social proof alone = n.s., but together = +35.5%. A super-additive interaction, invisible to sequential A/B testing by design." },
  ];

  const cells = [
    { id: "00", headline: "Original",     social: "No proof",      rate: 3.1, lift: 0,    p: 1.000, significant: false, winner: false,  note: "Control : baseline 3.1% conversion" },
    { id: "10", headline: "New (benefit)", social: "No proof",      rate: 3.3, lift: 6.5,  p: 0.148, significant: false, winner: false,  note: "New headline alone: marginal lift, not significant. Two A/B tests would stop here." },
    { id: "01", headline: "Original",     social: "Social proof",  rate: 3.4, lift: 9.7,  p: 0.083, significant: false, winner: false,  note: "Social proof alone: directionally positive but not significant at α=0.05." },
    { id: "11", headline: "New (benefit)", social: "Social proof",  rate: 4.2, lift: 35.5, p: 0.000, significant: true,  winner: true,   note: "Interaction winner: new headline × social proof is super-additive. Neither variable worked alone." },
  ];

  const selectedCell = cells.find(c => c.id === selected);
  const headlines = ["Original", "New (benefit)"];
  const socials = ["No proof", "Social proof"];

  return (
    <div>
      {/* The matrix */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "480px" }}>
          <thead>
            <tr>
              <td style={{ padding: "10px 14px", background: "#0d1117" }} />
              {socials.map(s => (
                <th key={s} style={{ padding: "10px 20px", background: "#0d1117", borderBottom: "1px solid #2a2a3a", fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textAlign: "center" as const }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {headlines.map(h => (
              <tr key={h}>
                <td style={{ padding: "10px 14px", background: "#0d1117", borderRight: "1px solid #2a2a3a", fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", whiteSpace: "nowrap" }}>
                  {h}
                </td>
                {socials.map(s => {
                  const hCode = h === "New (benefit)" ? "1" : "0";
                  const sCode = s === "Social proof" ? "1" : "0";
                  const cell = cells.find(c => c.id === hCode + sCode)!;
                  const isSelected = selected === cell.id;
                  const bg = cell.winner ? "rgba(16,185,129,0.12)" : cell.significant ? "rgba(245,158,11,0.08)" : "#12121a";
                  const border = cell.winner ? "rgba(16,185,129,0.5)" : isSelected ? "#f59e0b" : "#2a2a3a";
                  return (
                    <td key={s}
                      onClick={() => setSelected(isSelected ? null : cell.id)}
                      style={{ padding: "16px 20px", background: bg, border: `2px solid ${border}`, cursor: "pointer", textAlign: "center" as const, transition: "all .2s", position: "relative" as const }}>
                      {cell.winner && (
                        <div style={{ position: "absolute", top: "6px", right: "8px", fontSize: "0.55rem", fontWeight: 900, color: "#10b981", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                          WINNER
                        </div>
                      )}
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: cell.winner ? "#10b981" : cell.id === "00" ? "#6b7280" : "#f1f5f9", fontFamily: "monospace" }}>
                        {cell.rate}%
                      </div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, color: cell.lift > 0 ? (cell.significant ? "#34d399" : "#f59e0b") : "#6b7280", marginTop: "3px" }}>
                        {cell.lift > 0 ? `+${cell.lift}%` : "Control"}
                      </div>
                      <div style={{ fontSize: "0.62rem", color: cell.significant ? "#34d399" : "#52525b", marginTop: "2px" }}>
                        {cell.id === "00" ? "baseline" : cell.significant ? `p=${cell.p.toFixed(3)} ✓` : `p=${cell.p.toFixed(3)} n.s.`}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Click explanation */}
      <div style={{ marginTop: "12px", minHeight: "80px", background: "#0d1117", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "14px 16px" }}>
        {selectedCell ? (
          <>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: selectedCell.winner ? "#10b981" : "#f59e0b", marginBottom: "5px" }}>
              {selectedCell.headline} · {selectedCell.social}
            </div>
            <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>{selectedCell.note}</p>
          </>
        ) : (
          <p style={{ fontSize: "0.78rem", color: "#4a4a68", margin: 0, lineHeight: 1.6 }}>
            Click any cell to see the interpretation. The key insight is in the bottom-right.
          </p>
        )}
      </div>

      {/* The interaction callout */}
      <div style={{ marginTop: "12px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: "12px", padding: "16px 20px" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#10b981", marginBottom: "6px" }}>The interaction effect</div>
        <p style={{ fontSize: "0.85rem", color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>
          Two separate A/B tests would have said: &ldquo;the new headline doesn&apos;t work (p=0.15) and social proof might work (p=0.08).&rdquo;
          The full factorial design reveals the actual answer: neither works alone, but together they deliver a{" "}
          <strong style={{ color: "#10b981" }}>+35% conversion lift</strong>. Sequential A/B testing would have shipped the wrong variant.
          This is why pricing page and packaging tests almost always require MVT.
        </p>
      </div>

      {/* Sequential A/B replay */}
      <div style={{ marginTop: "16px" }}>
        {replayStep === null ? (
          <button onClick={() => setReplayStep(0)}
            style={{ width: "100%", padding: "12px 20px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)", color: "#f87171", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", transition: "all .2s", textAlign: "center" as const }}
            onMouseEnter={e => { (e.currentTarget).style.background = "rgba(239,68,68,0.09)"; }}
            onMouseLeave={e => { (e.currentTarget).style.background = "rgba(239,68,68,0.05)"; }}>
            What would sequential A/B testing have told you? →
          </button>
        ) : (
          <div style={{ background: "#0d1117", border: `1px solid ${replaySteps[replayStep].color}30`, borderRadius: "12px", overflow: "hidden" }}>
            {/* Step indicator */}
            <div style={{ display: "flex", background: "#12121a", borderBottom: "1px solid #1e1e2e" }}>
              {replaySteps.map((s, i) => (
                <div key={i} style={{ flex: 1, height: "3px", background: i <= replayStep ? s.color : "#1e1e2e", transition: "background .3s" }} />
              ))}
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontSize: "0.58rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: replaySteps[replayStep].color, marginBottom: "3px" }}>
                    Step {replayStep + 1} of {replaySteps.length}
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#f1f5f9" }}>{replaySteps[replayStep].title}</div>
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "6px", background: `${replaySteps[replayStep].color}18`, color: replaySteps[replayStep].color, flexShrink: 0 }}>
                  {replaySteps[replayStep].result}
                </span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "#9ca3af", lineHeight: 1.7, margin: "0 0 14px" }}>{replaySteps[replayStep].desc}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                {replayStep < replaySteps.length - 1 ? (
                  <button onClick={() => setReplayStep(replayStep + 1)}
                    style={{ padding: "8px 18px", borderRadius: "8px", background: `${replaySteps[replayStep + 1].color}12`, border: `1px solid ${replaySteps[replayStep + 1].color}30`, color: replaySteps[replayStep + 1].color, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                    Next →
                  </button>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700, padding: "8px 0" }}>
                    ✓ This is why MVT was the right design choice.
                  </span>
                )}
                <button onClick={() => setReplayStep(null)}
                  style={{ padding: "8px 14px", borderRadius: "8px", background: "transparent", border: "1px solid #2a2a3a", color: "#4a4a68", fontSize: "0.75rem", cursor: "pointer" }}>
                  close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Statistical framework ─────────────────────────────────────────────────────

function StatsFramework() {
  const [view, setView] = useState<"freq" | "bayes">("freq");
  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {(["freq", "bayes"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all .15s",
              background: view === v ? (v === "freq" ? "rgba(99,102,241,0.12)" : "rgba(245,158,11,0.12)") : "transparent",
              borderColor: view === v ? (v === "freq" ? "rgba(99,102,241,0.4)" : "rgba(245,158,11,0.4)") : "#2a2a3a",
              color: view === v ? (v === "freq" ? "#818cf8" : "#fbbf24") : "#6b7280" }}>
            {v === "freq" ? "Frequentist" : "Bayesian"}
          </button>
        ))}
      </div>
      {view === "freq" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "20px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#818cf8", marginBottom: "14px" }}>What it measures</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { field: "p-value", note: "P(data this extreme | no real effect). Below 0.05 = reject null." },
                { field: "Significance flag", note: "Boolean decision: significant or not." },
                { field: "Relative lift %", note: "Treatment conversion rate vs control, as relative change." },
                { field: "Rate variance", note: "Per-variation : feeds power calculation for future planning." },
              ].map(({ field, note }) => (
                <li key={field} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <code style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: "4px", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", fontFamily: "monospace", flexShrink: 0, marginTop: "1px" }}>{field}</code>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "20px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#818cf8", marginBottom: "14px" }}>When to use it</div>
            <p style={{ fontSize: "0.82rem", color: "#9ca3af", lineHeight: 1.7, margin: "0 0 14px" }}>
              Frequentist works well for high-volume, repeated experiments where you need a consistent, auditable decision rule. It answers: &ldquo;is there evidence of an effect?&rdquo;
            </p>
            <div style={{ background: "#0d1117", borderRadius: "8px", padding: "10px 12px", border: "1px solid #1e1e2e" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "5px" }}>Common mistake</div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0, lineHeight: 1.55 }}>
                &ldquo;Peeking&rdquo;: checking results mid-experiment and stopping early when p&lt;0.05. This inflates false positive rate dramatically. You must pre-commit to your sample size.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "20px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#fbbf24", marginBottom: "14px" }}>What it measures</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { field: "Posterior probability", note: "P(treatment wins | observed data). Directly interpretable." },
                { field: "Credible interval", note: "Range of plausible lift values with 95% probability." },
                { field: "Expected loss", note: "Cost of choosing wrong variant : drives the stop decision." },
                { field: "Lift status", note: "'winning' | 'losing' | 'inconclusive' based on posterior threshold." },
              ].map(({ field, note }) => (
                <li key={field} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <code style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: "4px", background: "rgba(245,158,11,0.1)", color: "#fbbf24", fontFamily: "monospace", flexShrink: 0, marginTop: "1px" }}>{field}</code>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "20px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#fbbf24", marginBottom: "14px" }}>When to use it</div>
            <p style={{ fontSize: "0.82rem", color: "#9ca3af", lineHeight: 1.7, margin: "0 0 14px" }}>
              Bayesian is better for low-traffic experiments and sequential decision-making : you can update the posterior with new data without inflating error rates. It answers: &ldquo;how likely is the variation winning?&rdquo;
            </p>
            <div style={{ background: "#0d1117", borderRadius: "8px", padding: "10px 12px", border: "1px solid #1e1e2e" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "5px" }}>Key advantage</div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0, lineHeight: 1.55 }}>
                Expected loss enables continuous monitoring without penalty. Stop when the cost of being wrong drops below your business threshold : no fixed sample size required.
              </p>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: "12px", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "10px", padding: "12px 16px" }}>
        <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>
          At the company, the platform stores <strong style={{ color: "#fbbf24" }}>both paradigms side by side</strong> per experiment × variation × metric.
          PMs use Bayesian posteriors for ship/stop decisions; the data team uses frequentist p-values for audit trails and board reporting. Different questions, same underlying data.
        </p>
      </div>
    </div>
  );
}

// ── AI acceleration flow ──────────────────────────────────────────────────────

function AIAccelerationFlow() {
  const phases = [
    {
      phase: "Design",
      without: ["Write hypothesis manually", "Google sample size calculators", "Manually set up targeting rules", "Forget guardrail metrics"],
      with:    ["Dev Agent drafts hypothesis from product context", "Auto-calculates sample size from historical conversion data", "Suggested targeting based on prior experiments", "Guardrail metrics auto-populated from metric library"],
      aiTool: "Dev Agent",
      lift: "+25% setup quality score",
    },
    {
      phase: "Launch",
      without: ["Implement variant code manually", "Test across browsers", "Manually check SDK integration", "Estimate allocation from gut feel"],
      with:    ["Dev Agent generates variant implementation in one prompt", "Auto-validates against browser compatibility rules", "SDK config checked against Tracking Plan", "Traffic allocation optimised for MDE within traffic constraints"],
      aiTool: "Dev Agent",
      lift: "~3 hours → ~20 minutes",
    },
    {
      phase: "Monitor",
      without: ["Check results daily in OA manually", "Spot data quality issues late", "Miss interaction effects", "React to early noise ('peeking')"],
      with:    ["AI orchestration alerts when power is reached", "Automated data quality checks flag anomalies early", "Interaction effects surfaced in MVT analysis", "Sequential validity enforced : no early peeking penalty"],
      aiTool: "AI Orchestration Analytics",
      lift: "Earlier catch rate on bad experiments",
    },
    {
      phase: "Decide",
      without: ["Read statistical output and interpret manually", "Write results summary for stakeholders", "Decide next test from gut feel", "Manually archive experiment learnings"],
      with:    ["The AI orchestration platform explains results in plain language with confidence framing", "Auto-generates stakeholder summary pushed to Coda", "Recommends next hypothesis based on experiment history", "Learning is stored, searchable, and feeds future power calculations"],
      aiTool: "AI Orchestration Analytics",
      lift: "2 days → same day decision",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: "12px", paddingBottom: "8px", borderBottom: "1px solid #2a2a3a" }}>
        <div />
        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#ef4444", textAlign: "center" as const }}>Without AI</div>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#10b981", textAlign: "center" as const }}>With AI (Dev Agent + AI Orchestration)</div>
      </div>

      {phases.map(({ phase, without, with: withAI, aiTool, lift }) => (
        <div key={phase} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: "12px", alignItems: "stretch" }}>
          {/* Phase label */}
          <div style={{ display: "flex", alignItems: "flex-start", paddingTop: "14px" }}>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "5px 8px", textAlign: "center" as const }}>
              <div style={{ fontSize: "0.58rem", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#f59e0b" }}>{phase}</div>
            </div>
          </div>
          {/* Without */}
          <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "10px", padding: "12px 14px" }}>
            {without.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < without.length - 1 ? "7px" : "0" }}>
                <span style={{ color: "#4a2020", fontSize: "0.7rem", flexShrink: 0, marginTop: "1px" }}>·</span>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          {/* With AI */}
          <div style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: "10px", padding: "12px 14px" }}>
            {withAI.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < withAI.length - 1 ? "7px" : "0" }}>
                <span style={{ color: "#10b981", fontSize: "0.7rem", flexShrink: 0, marginTop: "1px" }}>✓</span>
                <span style={{ fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
            <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(16,185,129,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.62rem", color: "#4a5a4a" }}>{aiTool}</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#10b981" }}>{lift}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI quality comparison bars ────────────────────────────────────────────────

function AIQualityComparison() {
  const bars = [
    { label: "Standard experiments",   qualified: 58, color: "#6366f1" },
    { label: "Dev Agent-assisted",     qualified: 74, color: "#10b981" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "4px" }}>
        Qualification rate: % of experiments clearing ≥5K impressions
      </div>
      {bars.map(({ label, qualified, color }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontSize: "0.85rem", color: "#f1f5f9", fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color, fontFamily: "ui-monospace, monospace" }}>{qualified}%</span>
          </div>
          <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${qualified}%`, background: color === "#10b981" ? "linear-gradient(90deg,#10b981,#34d399)" : color, borderRadius: "4px", boxShadow: color === "#10b981" ? "0 0 8px rgba(16,185,129,0.4)" : "none" }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.6, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "8px", padding: "10px 14px", marginTop: "4px" }}>
        <strong style={{ color: "#10b981" }}>+16% qualification rate lift</strong> : 58% of standard experiments cleared the quality bar; 74% of Dev Agent-assisted ones did. That&apos;s not a velocity story: it&apos;s a quality story. I used this to anchor the commercial argument that selling the AI orchestration platform into Experimentation accounts made their core product work better.
      </div>
    </div>
  );
}

// ── Retention cohort chart ────────────────────────────────────────────────────

function RetentionCohortChart() {
  const cohorts = [
    { tier: "0 qualified",     renewal: 42, accounts: 97,  color: "#6b7280" },
    { tier: "1–4 qualified",   renewal: 61, accounts: 168, color: "#f59e0b" },
    { tier: "5–19 qualified",  renewal: 78, accounts: 104, color: "#fbbf24" },
    { tier: "20+ qualified",   renewal: 91, accounts: 31,  color: "#10b981" },
  ];
  return (
    <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "24px" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "18px" }}>
        Contract renewal rate by qualified experiment tier (L90D)
      </div>
      {cohorts.map(({ tier, renewal, accounts, color }) => (
        <div key={tier} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
          <div style={{ width: "120px", flexShrink: 0 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e2e8f0" }}>{tier}</div>
            <div style={{ fontSize: "0.62rem", color: "#52525b" }}>{accounts} accounts</div>
          </div>
          <div style={{ flex: 1, height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "5px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${renewal}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: "5px" }} />
          </div>
          <div style={{ width: "40px", textAlign: "right" as const, fontSize: "0.85rem", fontWeight: 800, color, fontFamily: "monospace", flexShrink: 0 }}>{renewal}%</div>
        </div>
      ))}
      <div style={{ marginTop: "16px", padding: "12px 16px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "8px" }}>
        <span style={{ fontSize: "0.72rem", color: "#9ca3af", lineHeight: 1.6 }}>
          <strong style={{ color: "#10b981" }}>+49% renewal rate</strong> from no engagement to highest tier. Controlled for ARR and tenure via logistic regression : experiment engagement remains a statistically significant predictor of renewal after confounders removed (χ²=38.7, p&lt;0.001).
        </span>
      </div>
    </div>
  );
}

// ── Causal DAG ────────────────────────────────────────────────────────────────

function CausalDAG() {
  const [visible, setVisible] = useState(false);
  const dagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dagRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chain = [
    { label: "Dev Agent",       sub: "AI assistance",          x: 30,  color: "#818cf8" },
    { label: "Better Setup",    sub: "Experiment structure",   x: 182, color: "#a5b4fc" },
    { label: "Qual. Rate ≥5K",  sub: "Impression threshold",  x: 334, color: "#f59e0b" },
    { label: "Engaged L30D",    sub: "Engagement metric",      x: 486, color: "#fbbf24" },
    { label: "Renewal",         sub: "Contract outcome",       x: 638, color: "#10b981" },
  ];
  const nodeW = 112; const nodeH = 52; const nodeY = 100;
  const confounders = [
    { label: "ARR Tier", sub: "Account size", x: 258, y: 22, targets: [334, 638] },
    { label: "Tenure",   sub: "Account age",  x: 410, y: 22, targets: [486, 638] },
  ];

  const fade = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transition: `opacity .5s ease ${delay}ms`,
  });

  return (
    <div ref={dagRef} style={{ background: "#0d1117", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "20px", overflowX: "auto" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "14px" }}>
        Causal DAG: backdoor paths from confounders
      </div>
      <svg viewBox="0 0 780 172" width="100%" style={{ display: "block", minWidth: "580px" }}>
        <defs>
          {chain.slice(0, -1).map((_, i) => (
            <marker key={i} id={`arrow-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b" opacity="0.7" />
            </marker>
          ))}
        </defs>

        {/* Chain node boxes: appear left to right */}
        {chain.map(({ label, sub, x, color }, i) => (
          <g key={label} style={fade(i * 180)}>
            <rect x={x} y={nodeY} width={nodeW} height={nodeH} rx="9" fill={`${color}10`} stroke={`${color}40`} strokeWidth="1.2" />
            <text x={x + nodeW / 2} y={nodeY + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{label}</text>
            <text x={x + nodeW / 2} y={nodeY + 34} textAnchor="middle" fontSize="8.5" fill="#6b7280">{sub}</text>
          </g>
        ))}

        {/* Causal arrows: each appears just after its source node */}
        {chain.slice(0, -1).map((node, i) => (
          <g key={`arr-${i}`} style={fade(i * 180 + 120)}>
            <line x1={node.x + nodeW} y1={nodeY + nodeH / 2} x2={chain[i + 1].x - 2} y2={nodeY + nodeH / 2}
              stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" markerEnd={`url(#arrow-${i})`} />
          </g>
        ))}

        {/* Confounder nodes: appear after the chain */}
        {confounders.map((cf, i) => (
          <g key={cf.label} style={fade(900 + i * 150)}>
            <rect x={cf.x} y={cf.y} width="112" height="36" rx="7" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />
            <text x={cf.x + 56} y={cf.y + 13} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fbbf24">{cf.label}</text>
            <text x={cf.x + 56} y={cf.y + 26} textAnchor="middle" fontSize="8" fill="#78716c">{cf.sub}</text>
          </g>
        ))}

        {/* Confounder dashed paths: last to appear */}
        {confounders.map((cf) =>
          cf.targets.map((tx) => (
            <line key={`${cf.x}-${tx}`} x1={cf.x + 56} y1={cf.y + 28} x2={tx + 56} y2={nodeY}
              stroke="rgba(245,158,11,0.45)" strokeWidth="1.2" strokeDasharray="4 3"
              style={fade(1200)} />
          ))
        )}

        {/* Legend */}
        <g style={fade(1400)}>
          <line x1="20" y1="162" x2="50" y2="162" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
          <text x="55" y="165" fontSize="8" fill="#6b7280">Causal path</text>
          <line x1="130" y1="162" x2="160" y2="162" stroke="rgba(245,158,11,0.45)" strokeWidth="1.2" strokeDasharray="4 3" />
          <text x="165" y="165" fontSize="8" fill="#6b7280">Confounder (backdoor path)</text>
        </g>
      </svg>
      <p style={{ fontSize: "0.72rem", color: "#6b7280", lineHeight: 1.6, marginTop: "12px", marginBottom: 0, ...fade(1400) }}>
        Large accounts (high ARR) run more experiments AND have higher baseline renewal rates : creating a spurious correlation. Causal inference methods close these backdoor paths before the retention finding can be taken to leadership.
      </p>
    </div>
  );
}

// ── Causal identification approaches ─────────────────────────────────────────

function CausalApproaches() {
  const [active, setActive] = useState<string>("rdd");
  const approaches = [
    {
      id: "rdd", short: "RDD", label: "Regression Discontinuity", pill: "Natural experiment", pillColor: "rgba(99,102,241,0.15)", pillText: "#818cf8",
      desc: "The 5K impression threshold creates a sharp discontinuity. Accounts just above and just below the gate are near-identical in sophistication : any jump in renewal probability at the cutoff is causal, not confounded.",
      detail: [
        { title: "Running variable", body: "Experiment impression count, centred at 5,000." },
        { title: "Treatment", body: "Crossing the threshold: experiment becomes 'qualified' and enters the engagement metric." },
        { title: "Local average effect (LATE)", body: "Accounts just above 5K renew at +12% higher rate than accounts just below, within a ±1,500-impression bandwidth." },
        { title: "Assumption", body: "No precise manipulation of impression counts around the threshold : verified by checking for bunching in the impression density near 5K." },
      ],
    },
    {
      id: "iv", short: "IV / 2SLS", label: "Instrumental Variables", pill: "Endogeneity fix", pillColor: "rgba(245,158,11,0.15)", pillText: "#fbbf24",
      desc: "Dev Agent is used as an instrument: it raises qualification rates (relevance) but has no direct path to renewal other than through experiment quality (exclusion restriction). Two-stage least squares isolates the causal effect.",
      detail: [
        { title: "Instrument", body: "AI assistance flag (Dev Agent used: yes/no)." },
        { title: "First stage", body: "AI assistance → qualification rate. F-stat > 10 confirms strong instrument relevance." },
        { title: "IV vs OLS", body: "IV estimate is ~30% smaller than naive OLS : confirming upward confounding bias from raw experiment counts." },
        { title: "Exclusion restriction", body: "Dev Agent affects renewal only through experiment quality, not directly. Plausible: agents don't change the product itself." },
      ],
    },
    {
      id: "psm", short: "PSM", label: "Propensity Score Matching", pill: "Observable confounders", pillColor: "rgba(16,185,129,0.15)", pillText: "#34d399",
      desc: "Each high-engagement account (≥5 qualified experiments) is matched to a similar low-engagement account based on ARR tier and tenure. Renewal rates compared within matched pairs.",
      detail: [
        { title: "Propensity model", body: "Logistic regression: P(high engagement) ~ ARR tier + account tenure." },
        { title: "Matching", body: "Nearest-neighbour within caliper 0.05: 148 matched pairs from 183 treated accounts." },
        { title: "ATT estimate", body: "Average treatment effect on the treated: +18% renewal lift vs matched controls (p=0.003)." },
        { title: "Limitation", body: "PSM only removes observable confounders. Unobservable confounders (product-market fit) require RDD or IV." },
      ],
    },
  ];
  const current = approaches.find((a) => a.id === active)!;
  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {approaches.map(a => (
          <button key={a.id} onClick={() => setActive(a.id)}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all .2s",
              background: active === a.id ? "rgba(245,158,11,0.12)" : "transparent",
              borderColor: active === a.id ? "rgba(245,158,11,0.4)" : "#2a2a3a",
              color: active === a.id ? "#fbbf24" : "#6b7280" }}>
            {a.short}
          </button>
        ))}
      </div>
      <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "6px", background: current.pillColor, color: current.pillText }}>{current.pill}</span>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{current.label}</h3>
        </div>
        <p style={{ fontSize: "0.88rem", color: "#9ca3af", lineHeight: 1.7, marginBottom: "20px" }}>{current.desc}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {current.detail.map(({ title, body }) => (
            <div key={title} style={{ background: "#0d1117", borderRadius: "10px", border: "1px solid #1e1e2e", padding: "14px 16px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#f59e0b", marginBottom: "5px", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{title}</div>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", lineHeight: 1.6, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Python code explorer ──────────────────────────────────────────────────────

const PYTHON_FILES = [
  {
    name: "synthetic_ab_data.py",
    desc: "Generate synthetic A/B dataset with AI-assisted / standard experiment split",
    lines: 75,
    snippet: `def generate_experiments(n: int = 500) -> pd.DataFrame:
    for i in range(n):
        ai_assisted = np.random.choice(AGENT_TYPES) is not None
        # AI-assisted experiments attract ~25% more traffic
        base = np.random.lognormal(mean=8.5, sigma=1.2)
        if ai_assisted:
            base *= 1.25
        impressions = int(base)
        records.append({
            "experiment_id": f"exp_{i:05d}",
            "ai_assisted":   ai_assisted,
            "impressions":   impressions,
            "qualified":     impressions >= 5_000,
        })
    return pd.DataFrame(records)`,
  },
  {
    name: "power_analysis.py",
    desc: "Sample size calculator and MDE table (matches the interactive calculator above)",
    lines: 62,
    snippet: `def compute_power(n, baseline_rate, mde, alpha=0.05):
    """Two-sample z-test power for conversion rate experiments."""
    treatment_rate = baseline_rate * (1 + mde)
    pooled = (baseline_rate + treatment_rate) / 2
    se = np.sqrt(2 * pooled * (1 - pooled) / n)
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z = abs(treatment_rate - baseline_rate) / se
    return float(stats.norm.cdf(z - z_alpha) + stats.norm.cdf(-z - z_alpha))`,
  },
  {
    name: "multivariate_analysis.py",
    desc: "2x2 full factorial MVT : interaction effect detection + counterfactual A/B comparison",
    lines: 110,
    snippet: `def interaction_effect(df):
    """
    Interaction = delta(headline | social=1) - delta(headline | social=0)
    Super-additive if positive: headline works better WITH social proof.
    """
    def rate(h, s):
        return df[(df.headline==h) & (df.social_proof==s)].converted.mean()

    delta_no_social   = rate(1, 0) - rate(0, 0)   # +0.02pp
    delta_with_social = rate(1, 1) - rate(0, 1)   # +0.11pp

    return {
        "interaction_pp": round((delta_with_social - delta_no_social) * 100, 2),
        "super_additive": delta_with_social > delta_no_social,
    }`,
  },
  {
    name: "bayesian_inference.py",
    desc: "Beta-Binomial conjugate model : posterior probability, credible intervals, expected loss",
    lines: 68,
    snippet: `def analyse(control, treatment, n_samples=100_000):
    """Beta-Binomial posterior via Monte Carlo sampling."""
    ctrl_s = stats.beta(1 + control.conversions,
                        1 + control.visitors - control.conversions).rvs(n_samples)
    trt_s  = stats.beta(1 + treatment.conversions,
                        1 + treatment.visitors - treatment.conversions).rvs(n_samples)
    prob_win = float(np.mean(trt_s > ctrl_s))
    exp_loss = float(np.mean(np.maximum(ctrl_s - trt_s, 0)))
    ci       = (np.quantile((trt_s-ctrl_s)/ctrl_s, 0.025),
                np.quantile((trt_s-ctrl_s)/ctrl_s, 0.975))
    return {"prob_win": prob_win, "expected_loss": exp_loss, "ci_95": ci}`,
  },
  {
    name: "causal_inference.py",
    desc: "RDD, instrumental variables (2SLS), and propensity score matching to isolate causal effects",
    lines: 142,
    snippet: `def rdd_analysis(df, bandwidth=1_500):
    """Sharp RDD at the 5K impression threshold."""
    window = df[(df.impressions >= 5_000 - bandwidth) &
                (df.impressions <= 5_000 + bandwidth)].copy()
    above  = window[window.impressions >= 5_000].renewed
    below  = window[window.impressions <  5_000].renewed
    late   = above.mean() - below.mean()   # local average treatment effect
    t_stat, p_val = stats.ttest_ind(above, below)
    return {"late": round(late, 3), "p_value": round(p_val, 4),
            "renewal_above": round(above.mean(), 3)}`,
  },
];

function PythonCodeExplorer() {
  const [activeFile, setActiveFile] = useState<string>(PYTHON_FILES[0].name);
  const file = PYTHON_FILES.find((f) => f.name === activeFile)!;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "0", background: "#0d1117", border: "1px solid #2a2a3a", borderRadius: "14px", overflow: "hidden" }}>
      <div style={{ borderRight: "1px solid #1e1e2e", padding: "16px 0" }}>
        <div style={{ padding: "0 16px 10px", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#4a4a68" }}>analytics/</div>
        {PYTHON_FILES.map((f) => {
          const on = f.name === activeFile;
          return (
            <button key={f.name} onClick={() => setActiveFile(f.name)}
              style={{ display: "flex", alignItems: "flex-start", gap: "10px", width: "100%", padding: "8px 16px", textAlign: "left" as const, cursor: "pointer", background: on ? "rgba(245,158,11,0.08)" : "transparent", border: "none", borderLeft: `2px solid ${on ? "#f59e0b" : "transparent"}`, transition: "all .15s" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M2 2h6l3 3v7H2V2z" stroke={on ? "#f59e0b" : "#4a4a68"} strokeWidth="1.2" fill={on ? "rgba(245,158,11,0.1)" : "none"} />
                <path d="M8 2v3h3" stroke={on ? "#f59e0b" : "#4a4a68"} strokeWidth="1.2" />
              </svg>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: on ? 700 : 500, color: on ? "#fbbf24" : "#9ca3af", fontFamily: "ui-monospace, monospace" }}>{f.name}</div>
                <div style={{ fontSize: "0.6rem", color: "#4a4a68", marginTop: "2px" }}>{f.lines} lines</div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ padding: "16px 20px", overflow: "auto" }}>
        <div style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: "12px", lineHeight: 1.5 }}>{file.desc}</div>
        <pre style={{ margin: 0, fontFamily: "ui-monospace, 'Cascadia Code', monospace", fontSize: "0.78rem", lineHeight: 1.75, color: "#cdd6f4", overflowX: "auto", whiteSpace: "pre" as const }}>
          <code>{file.snippet}</code>
        </pre>
      </div>
    </div>
  );
}

// ── Capability visual mockups ─────────────────────────────────────────────────

function MonitorVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
      <div style={{ background: "#0d1117", border: "1.5px solid rgba(239,68,68,0.45)", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 0 24px rgba(239,68,68,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px rgba(239,68,68,0.7)", flexShrink: 0 }} />
          <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#ef4444", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>#experiment-alerts · Day 3 of 14</span>
        </div>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "6px" }}>
          SRM detected: exp_04821 · Pricing Page A/B
        </div>
        <p style={{ fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.65, margin: "0 0 12px" }}>
          Expected split: <strong style={{ color: "#e2e8f0" }}>50/50</strong> : Observed:{" "}
          <strong style={{ color: "#ef4444" }}>62/38</strong> over 18,400 impressions at α=0.01.
          Variant JS is initialising after page-level targeting. Results are contaminated. Do not analyse.
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" as const }}>
          {[
            { label: "Pause experiment", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
            { label: "Fix JS load order", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
            { label: "Reset analysis window", color: "#6b7280", bg: "#1a1a2e" },
          ].map(({ label, color, bg }) => (
            <span key={label} style={{ fontSize: "0.65rem", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", background: bg, color }}>{label}</span>
          ))}
        </div>
      </div>
      <div style={{ background: "#0d1117", borderRadius: "10px", padding: "14px 16px", border: "1px solid #1e1e2e" }}>
        <div style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#4a4a68", marginBottom: "12px" }}>Detection timeline: why catching it early matters</div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {([
            { day: "Day 0", event: "Experiment launches", color: "#4a4a68", hi: false, faded: false },
            { day: "Day 3", event: "🤖 Agent flags SRM : 11 clean days saved.", color: "#10b981", hi: true, faded: false },
            { day: "Day 14", event: "PM checks results. Analysis is garbage.", color: "#6b7280", hi: false, faded: true },
          ]).map(({ day, event, color, hi, faded }, i, arr) => (
            <React.Fragment key={day}>
              <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flex: 1, opacity: faded ? 0.45 : 1 }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: hi ? "#10b981" : "#1e1e2e", border: `2px solid ${hi ? "#10b981" : color}`, marginBottom: "6px", boxShadow: hi ? "0 0 10px rgba(16,185,129,0.5)" : "none" }} />
                <div style={{ fontSize: "0.63rem", fontWeight: hi ? 800 : 600, color, marginBottom: "3px" }}>{day}</div>
                <div style={{ fontSize: "0.6rem", color: hi ? "#34d399" : "#52525b", textAlign: "center" as const, lineHeight: 1.4, maxWidth: "88px" }}>{event}</div>
              </div>
              {i < arr.length - 1 && <div style={{ flex: 0.3, height: "2px", background: "#1e1e2e", marginTop: "4px" }} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomizeVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ background: "#0d1117", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "12px", padding: "14px 16px" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#ef4444", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
            <span>✗</span> Generic template
          </div>
          <div style={{ fontSize: "0.72rem", color: "#52525b", lineHeight: 1.85, fontFamily: "ui-monospace, monospace" }}>
            <span style={{ color: "#6b7280" }}>IF</span> we change the CTA colour<br />
            <span style={{ color: "#6b7280" }}>THEN</span> conversion will improve<br />
            <span style={{ color: "#6b7280" }}>BECAUSE</span> it looks better<br /><br />
            <span style={{ color: "#3a3a5c" }}>MDE: 5% · Duration: 14 days</span><br />
            <span style={{ color: "#3a3a5c" }}>Metric: conversions</span>
          </div>
        </div>
        <div style={{ background: "#0d1117", border: "1.5px solid rgba(245,158,11,0.45)", borderRadius: "12px", padding: "14px 16px", boxShadow: "0 0 14px rgba(245,158,11,0.06)" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#f59e0b", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
            <span>✓</span> Workspace-aware
          </div>
          <div style={{ fontSize: "0.72rem", color: "#9ca3af", lineHeight: 1.85, fontFamily: "ui-monospace, monospace" }}>
            <span style={{ color: "#fbbf24" }}>IF</span> we surface Enterprise+ preview<br />
            &nbsp;&nbsp;to Growth/Mobile/US/Paid users<br />
            <span style={{ color: "#fbbf24" }}>THEN</span> upgrade rate increases ~15%<br />
            <span style={{ color: "#fbbf24" }}>BECAUSE</span> <span style={{ color: "#818cf8" }}>exp_03841</span> showed +22%<br />
            &nbsp;&nbsp;for this exact segment<br /><br />
            <span style={{ color: "#10b981" }}>MDE: 12% · Duration: 9 days</span><br />
            <span style={{ color: "#10b981" }}>Achievable at 2,800 daily impressions</span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: "0.7rem", color: "#52525b", textAlign: "center" as const, padding: "6px 0" }}>
        Same LLM. Same prompt. The difference is context : your 847 experiments trained the right answer.
      </div>
    </div>
  );
}

function PersonalizeVisual() {
  const [pm, setPm] = useState<"sarah" | "marcus">("sarah");
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        {([
          { id: "sarah" as const, name: "Sarah Chen", role: "Head of B2B Product", profile: "Conservative · Frequentist · Board-facing", color: "#818cf8" },
          { id: "marcus" as const, name: "Marcus Rodriguez", role: "Growth PM", profile: "Aggressive · Bayesian · Speed-first", color: "#f59e0b" },
        ]).map(p => (
          <button key={p.id} onClick={() => setPm(p.id)}
            style={{ padding: "10px 12px", borderRadius: "10px", border: `1px solid ${pm === p.id ? p.color + "55" : "#2a2a3a"}`, background: pm === p.id ? `${p.color}10` : "#12121a", cursor: "pointer", transition: "all .15s", textAlign: "left" as const }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: pm === p.id ? p.color : "#6b7280", marginBottom: "2px" }}>{p.name}</div>
            <div style={{ fontSize: "0.6rem", color: pm === p.id ? p.color + "90" : "#4a4a68" }}>{p.role} · {p.profile}</div>
          </button>
        ))}
      </div>
      {pm === "sarah" ? (
        <div style={{ background: "#0d1117", border: "1.5px solid rgba(129,140,248,0.4)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#818cf8", marginBottom: "10px" }}>Results · Frequentist framing</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px" }}>Statistical significance confirmed : p = 0.008</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "10px" }}>
            {[{ l: "Observed lift", v: "+15.1%", c: "#10b981" }, { l: "95% CI", v: "+11.2% to +18.9%", c: "#818cf8" }, { l: "n / arm", v: "12,400", c: "#9ca3af" }].map(({ l, v, c }) => (
              <div key={l} style={{ background: "#12121a", borderRadius: "7px", padding: "8px 9px" }}>
                <div style={{ fontSize: "0.56rem", color: "#52525b", marginBottom: "2px" }}>{l}</div>
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: c, fontFamily: "ui-monospace, monospace" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.18)", borderRadius: "8px", padding: "10px 12px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#10b981", marginBottom: "2px" }}>Recommendation: Ship</div>
            <p style={{ fontSize: "0.7rem", color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>Evidence is board-ready. Significance at α=0.05 with a CI that excludes zero. Estimated ARR impact: +$280K at current plan distribution. Safe to present to leadership.</p>
          </div>
        </div>
      ) : (
        <div style={{ background: "#0d1117", border: "1.5px solid rgba(245,158,11,0.4)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#f59e0b", marginBottom: "10px" }}>Results · Bayesian framing</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px" }}>88% probability treatment wins</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "10px" }}>
            {[{ l: "Win probability", v: "88%", c: "#f59e0b" }, { l: "Expected loss", v: "0.8pp", c: "#34d399" }, { l: "Lift estimate", v: "+15.1%", c: "#10b981" }].map(({ l, v, c }) => (
              <div key={l} style={{ background: "#12121a", borderRadius: "7px", padding: "8px 9px" }}>
                <div style={{ fontSize: "0.56rem", color: "#52525b", marginBottom: "2px" }}>{l}</div>
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: c, fontFamily: "ui-monospace, monospace" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "8px", padding: "10px 12px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#f59e0b", marginBottom: "2px" }}>Ship now</div>
            <p style={{ fontSize: "0.7rem", color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>At 88% posterior, you are leaving money on the table. Expected loss if wrong: 0.8pp : small and measurable. The asymmetry strongly favours shipping today, not next sprint.</p>
          </div>
        </div>
      )}
      <div style={{ marginTop: "8px", fontSize: "0.67rem", color: "#4a4a68", textAlign: "center" as const }}>Same experiment. Same data. Different framing : because different PMs need different confidence signals.</div>
    </div>
  );
}

function OptimizeVisual() {
  const pts = [
    { label: "Wk 1", acc: 38 }, { label: "Wk 3", acc: 55 },
    { label: "Wk 6", acc: 71 }, { label: "Wk 10", acc: 84 }, { label: "Mo 3", acc: 94 },
  ];
  const W = 380; const H = 120; const PAD = 26;
  const toX = (i: number) => PAD + (i / (pts.length - 1)) * (W - PAD * 2);
  const toY = (v: number) => H - PAD - ((v / 100) * (H - PAD * 2));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.acc)}`).join(" ");
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 14px" }}>
          <div style={{ fontSize: "0.57rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "3px" }}>Week 1</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ef4444", fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>38%</div>
          <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "3px" }}>prediction accuracy</div>
          <div style={{ fontSize: "0.6rem", color: "#4a2020", marginTop: "2px" }}>Off by 62% on first 4 experiments</div>
        </div>
        <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.22)", borderRadius: "10px", padding: "12px 14px" }}>
          <div style={{ fontSize: "0.57rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "3px" }}>Month 3</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#10b981", fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>94%</div>
          <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "3px" }}>prediction accuracy</div>
          <div style={{ fontSize: "0.6rem", color: "#1a4a3a", marginTop: "2px" }}>47 experiments : learned your workspace</div>
        </div>
      </div>
      <div style={{ background: "#0d1117", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "14px 16px" }}>
        <div style={{ fontSize: "0.57rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#4a4a68", marginBottom: "10px" }}>
          Sample size prediction accuracy: learning from closed experiments
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id="opt-grad-v2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map(v => (
            <line key={v} x1={PAD} y1={toY(v)} x2={W - PAD} y2={toY(v)} stroke="#1e1e2e" strokeWidth="1" />
          ))}
          <line x1={PAD} y1={toY(80)} x2={W - PAD} y2={toY(80)} stroke="rgba(16,185,129,0.2)" strokeWidth="1" strokeDasharray="4 3" />
          <text x={W - PAD + 3} y={toY(80) + 4} fontSize="7" fill="rgba(16,185,129,0.4)">80%</text>
          <path d={`${pathD} L ${toX(pts.length - 1)} ${H - PAD} L ${toX(0)} ${H - PAD} Z`} fill="url(#opt-grad-v2)" />
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <g key={p.label}>
              <circle cx={toX(i)} cy={toY(p.acc)} r="4.5" fill="#10b981" stroke="#0d1117" strokeWidth="2" />
              <text x={toX(i)} y={toY(p.acc) - 8} textAnchor="middle" fontSize="8" fill="#10b981" fontWeight="700">{p.acc}%</text>
              <text x={toX(i)} y={H - 4} textAnchor="middle" fontSize="7.5" fill="#52525b">{p.label}</text>
            </g>
          ))}
        </svg>
        <div style={{ marginTop: "6px", fontSize: "0.67rem", color: "#4a4a68" }}>
          High-accuracy predictions become workspace-specific few-shot examples. The model improves on your data , not generic training.
        </div>
      </div>
    </div>
  );
}

// ── Dev Agent Request Flow ────────────────────────────────────────────────────

function DevAgentRequestFlow() {
  const steps = [
    { id: "pm",      label: "PM types a goal",          sub: "e.g. test pricing page upgrade CTA",       color: "#818cf8", icon: "PM"  },
    { id: "context", label: "Context extraction",       sub: "workspace history, traffic, metric library", color: "#a5b4fc", icon: "CTX" },
    { id: "llm",     label: "LLM reasons",              sub: "chains tools: hypothesis → sample size",     color: "#6366f1", icon: "LLM" },
    { id: "tools",   label: "Tools execute",            sub: "draft hypothesis, calculate n, gen code",    color: "#34d399", icon: "⚙"   },
    { id: "confirm", label: "PM confirms",              sub: "reviews structured recommendation",          color: "#fbbf24", icon: "✓"   },
    { id: "write",   label: "Platform updated",         sub: "config, flag, metric written via API",       color: "#f59e0b", icon: "→"   },
  ];

  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ fontSize: "0.57rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#52525b", marginBottom: "12px" }}>One request cycle: from goal to platform update</div>
      <div style={{ background: "#0d1117", border: "1px solid #1e1e2e", borderRadius: "14px", padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto", paddingBottom: "4px" }}>
          {steps.map(({ id, label, sub, color, icon }, i) => (
            <React.Fragment key={id}>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "8px", minWidth: "96px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${color}14`, border: `1px solid ${color}40` }}>
                  <span style={{ fontSize: icon.length > 1 ? "0.52rem" : "0.95rem", fontWeight: 900, color, fontFamily: "ui-monospace, monospace" }}>{icon}</span>
                </div>
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3, marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "0.58rem", color: "#52525b", lineHeight: 1.4, maxWidth: "88px" }}>{sub}</div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "0 6px", marginBottom: "26px" }}>
                  <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                    <path d="M0 6h24M20 2l4 4-4 4" stroke={steps[i + 1].color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #1e1e2e", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {[
            { label: "Steps 1–2 are automatic", body: "Context extraction runs on every call. The PM just types their goal : grounding in workspace history happens behind the scenes.", color: "#818cf8" },
            { label: "Step 3 chains tools", body: "The LLM decides which tools to call and in what order. For a new experiment: hypothesis first, then sample size, then variant code : sequenced automatically.", color: "#6366f1" },
            { label: "Step 5 is mandatory", body: "Nothing writes to the platform without PM confirmation. The agent drafts; the PM approves. That handshake preserves accountability while cutting the manual work.", color: "#fbbf24" },
          ].map(({ label, body, color }) => (
            <div key={label} style={{ background: "#12121a", border: `1px solid ${color}18`, borderRadius: "9px", padding: "11px 13px" }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color, marginBottom: "4px" }}>{label}</div>
              <p style={{ fontSize: "0.72rem", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Dev Agent Capabilities ───────────────────────────────────────────────────

const CAPABILITIES = [
  {
    id: "monitor",
    label: "Monitor",
    color: "#ef4444",
    tagline: "Real-time watchdog for experiment health",
    what: "Continuously scans every active experiment for statistical anomalies, data quality issues, and traffic allocation drift. Surfaces problems in plain language before they contaminate results , so you never analyse a broken experiment.",
    checks: [
      { name: "Sample Ratio Mismatch (SRM)", desc: "Compares actual traffic split to the expected allocation every 30 minutes. A 50/50 experiment drifting to 52/48 over three days signals implementation bias : SRM check flags this before the analysis window closes." },
      { name: "Novelty effect detection", desc: "Tracks whether conversion rate lift is decaying over the first 7 days. A spike that reverts to baseline is novelty, not a real product improvement. Stopping early on novelty = shipping the wrong variant." },
      { name: "Data quality validation", desc: "Checks that tracking events fire correctly on every impression, matched against the Tracking Plan schema. A mis-fired primary metric event silently corrupts your conversion rate , and it won't show up in the results table." },
      { name: "Cross-experiment contamination", desc: "Flags when two active experiments expose the same user segment to conflicting changes. Interaction effects make both results uninterpretable. The agent recommends mutual exclusion rules." },
    ],
    build: `# Scheduled job : runs every 30 minutes
async def monitor_experiments(workspace_id: str):
    experiments = platform.get_active_experiments(workspace_id)

    for exp in experiments:
        results = platform.get_results(exp.id)
        issues = []

        # Statistical health checks
        if srm_detected(results, alpha=0.01):
            issues.append("⚠️ Sample ratio mismatch detected")
        if novelty_effect(results, decay_threshold=0.30, window_days=7):
            issues.append("📉 Lift decaying : possible novelty effect")
        if tracking_event_drop(exp.primary_metric, results, threshold=0.05):
            issues.append("🔴 Tracking event drop on primary metric")
        if cross_experiment_contamination(exp, experiments):
            issues.append("⚡ Segment overlap with another active experiment")

        if issues:
            # LLM generates plain-language alert + recommended action
            alert = claude.messages.create(
                model="claude-sonnet-4-6",
                system="You are an experiment health monitor. Explain issues clearly.",
                messages=[{"role": "user", "content": {
                    "experiment": exp.dict(), "issues": issues, "results": results
                }}]
            )
            slack.post(channel="#experiment-alerts", text=alert.content[0].text)`,
    industries: [
      { sector: "E-commerce",  signal: "Checkout funnel drop rate · Add-to-cart decay", platform: "GA4 / Amplitude / Heap" },
      { sector: "Healthcare",  signal: "Appointment completion anomalies by step",       platform: "Epic / Athena API" },
      { sector: "FinTech",     signal: "Application drop-off by form field",             platform: "Mixpanel / Segment / custom" },
      { sector: "Media / DTC", signal: "Paywall engagement decay · Subscriber churn",    platform: "Parse.ly / Piano / Chartbeat" },
    ],
  },
  {
    id: "customize",
    label: "Customize",
    color: "#f59e0b",
    tagline: "Workspace-aware suggestions, not generic templates",
    what: "Reads your experiment history, segment performance data, and metric library to customise every recommendation to your product reality. The MDE it suggests is based on your actual traffic volume, not a textbook assumption.",
    checks: [
      { name: "Pattern extraction from past experiments", desc: "Which hypothesis formats led to qualified experiments at ≥5K impressions? Which targeting rules consistently over-performed? Dev Agent reads this from your history and applies the patterns : your workspace trains the agent." },
      { name: "Traffic-aware MDE recommendations", desc: "Instead of asking which MDE you want to detect, Dev Agent calculates the MDE you can realistically detect given your daily traffic volume, current experiment load, and planned run duration." },
      { name: "Metric library validation", desc: "Every metric suggestion is cross-referenced against your canonical event dictionary. Dev Agent will not suggest a metric that does not exist in your Tracking Plan : preventing the single most common experiment design mistake." },
      { name: "Segment performance matching", desc: "If your highest-converting segment is Mobile / US / Paid Search, Dev Agent prioritises targeting rules that match your historically best-performing slices , so your experiments start from a position of strength." },
    ],
    build: `# Context extraction : runs once per suggestion request
def build_workspace_context(workspace_id: str) -> dict:
    return {
        # What worked before : workspace-specific few-shot examples
        "successful_experiments": get_qualified_experiments(
            workspace_id, min_impressions=5000, min_stat_sig=0.05
        ),
        "segment_lift_history": get_segment_performance(workspace_id, days=90),
        "metric_library": get_approved_metrics(workspace_id),  # Tracking Plan
        "traffic_volume": get_daily_impressions(workspace_id, days=30),
        "active_experiment_load": get_active_count(workspace_id),
    }

def draft_hypothesis(goal: str, workspace_id: str) -> HypothesisDoc:
    context = build_workspace_context(workspace_id)

    # Find similar past experiments from THIS workspace (not generic examples)
    similar = vector_search(
        query=goal,
        corpus=context["successful_experiments"],
        top_k=3,
    )

    response = claude.messages.create(
        model="claude-sonnet-4-6",
        system=f\"\"\"You are an experiment designer for this specific workspace.
        Available metrics: {context['metric_library']}.
        Daily traffic: {context['traffic_volume']} impressions.
        Active experiments: {context['active_experiment_load']} (affects traffic budget).\"\"\",
        messages=[{"role": "user", "content": {
            "goal": goal,
            "workspace_examples": similar,
            "segment_performance": context["segment_lift_history"],
        }}],
        tools=[hypothesis_schema],  # structured output schema
    )
    return HypothesisDoc.parse(response)`,
    industries: [
      { sector: "E-commerce",  signal: "Cart abandonment segment history · SKU-level CVR",  platform: "Shopify / BigCommerce / Magento" },
      { sector: "Healthcare",  signal: "Patient journey completion by care pathway",          platform: "Epic / Athena / custom EHR" },
      { sector: "FinTech",     signal: "Application completion rate by acquisition channel",  platform: "Plaid / Stripe / custom origination" },
      { sector: "Media / DTC", signal: "Content consumption depth by reader persona",         platform: "Parse.ly / Chartbeat / Sailthru" },
    ],
  },
  {
    id: "personalize",
    label: "Personalize",
    color: "#818cf8",
    tagline: "Same recommendation, different framing: for every PM",
    what: "Learns each PM's risk tolerance, statistical preference, communication style, and velocity needs. A cautious, board-reporting PM and an aggressive growth engineer see the same experiment recommendation framed completely differently : without two versions of the agent.",
    checks: [
      { name: "Risk tolerance profiling", desc: "Conservative PMs get larger required n recommendations and explicit risk callouts. Aggressive PMs get faster-to-run designs with clear statements of what they're trading off. Controlled by a single profile field." },
      { name: "Statistical paradigm matching", desc: "Frequentist PMs get p-values and significance flags. Bayesian PMs get posterior probability and expected loss. Same underlying data : the LLM system prompt controls the framing, not a separate code path." },
      { name: "Verbosity tuning", desc: "A 3-sentence recommendation for busy product leads. A full methodology breakdown for analytically-oriented senior PMs. The verbosity field in the user profile controls which template the LLM chooses." },
      { name: "Decision history learning", desc: "Dev Agent logs which suggestions each PM accepted, modified, or rejected. After 10–15 decisions, it starts pre-adjusting : proposing smaller n if the PM consistently tightens time constraints, for example." },
    ],
    build: `# User profile store : keyed by PM user ID (from platform SSO)
def get_pm_profile(user_id: str) -> PMProfile:
    return db.get(f"pm:{user_id}", default=PMProfile(
        risk_tolerance="moderate",   # conservative | moderate | aggressive
        stat_preference="bayesian",  # freq | bayesian | both
        verbosity="brief",           # brief | detailed | technical
        mde_target=0.10,             # default 10% relative lift
        decision_history=[],         # list of {suggestion_id, action, modification}
    ))

def personalise_system_prompt(profile: PMProfile) -> str:
    risk_instruction = {
        "conservative": "Prioritise statistical rigour. Err on the side of larger n. Flag any risk explicitly.",
        "moderate":     "Balance speed and rigour. Flag material risks only.",
        "aggressive":   "Prioritise speed. State what the PM is trading off, but don't block on it.",
    }[profile.risk_tolerance]

    return f\"\"\"
This PM prefers {profile.stat_preference} framing.
{risk_instruction}
Output verbosity: {profile.verbosity}.
Default MDE target: {profile.mde_target * 100:.0f}% relative lift.
Recent decision pattern: {summarise_decisions(profile.decision_history)}.
\"\"\"

# Injected into every LLM call : zero overhead, zero separate code path
response = claude.messages.create(
    model="claude-sonnet-4-6",
    system=base_system_prompt + personalise_system_prompt(profile),
    messages=[...],
)`,
    industries: [
      { sector: "E-commerce",  signal: "Growth PM vs Brand PM decision pattern divergence", platform: "Platform-agnostic: profile lives in agent DB" },
      { sector: "Healthcare",  signal: "Clinician caution vs operational speed tradeoff",   platform: "HIPAA context injected into system prompt" },
      { sector: "FinTech",     signal: "Risk officer vs product manager priority tension",   platform: "Compliance threshold injected as hard constraint" },
      { sector: "Media / DTC", signal: "Editorial instinct vs data-first product culture",  platform: "Tone preference field controls framing style" },
    ],
  },
  {
    id: "optimize",
    label: "Optimize",
    color: "#34d399",
    tagline: "Gets better with every experiment that concludes",
    what: "After every experiment concludes, Dev Agent compares its predictions to actual outcomes. Accurate predictions become positive few-shot examples. Inaccurate ones trigger prompt review. After 30 experiments, suggestion quality improves measurably : the agent effectively fine-tunes itself on your workspace data.",
    checks: [
      { name: "Prediction accuracy scoring", desc: "After each experiment: was the predicted sample size within 15% of the actual n needed? Did the MDE estimate hold? Did the qualification prediction match the outcome? Each prediction gets a score stored against the hypothesis ID." },
      { name: "Positive few-shot accumulation", desc: "High-accuracy predictions (score ≥ 0.85) are stored as few-shot examples for future LLM calls in the same workspace. The model learns workspace-specific patterns from its own successful predictions , not from generic training data." },
      { name: "Alert precision improvement", desc: "False positive alerts : flagged anomalies that turned out to be noise : are logged. Alert thresholds auto-adjust per workspace to reduce fatigue without missing real issues. Precision compounds over time." },
      { name: "Cross-workspace learning (opt-in)", desc: "Aggregated, anonymised patterns from opted-in workspaces inform global priors. Example: 'In B2B SaaS, pricing page experiments need 2x the MDE estimate relative to feature experiments.' Workspace-level data is never shared." },
    ],
    build: `# Learning loop : triggered when an experiment concludes (webhook or poll)
def evaluate_and_learn(experiment_id: str):
    prediction = prediction_store.get(experiment_id)  # saved at hypothesis stage
    actual = platform.get_final_results(experiment_id)

    accuracy = EvaluationResult(
        sample_size_error=abs(prediction.n - actual.n) / max(actual.n, 1),
        qualification_match=prediction.will_qualify == actual.qualified,
        mde_calibration=abs(prediction.mde - actual.observed_lift),
        alert_true_positive=evaluate_alerts(prediction.flags, actual.issues),
    )

    # High-accuracy prediction → workspace-specific few-shot example
    if accuracy.overall_score >= 0.85:
        vector_store.upsert(
            workspace_id=experiment.workspace_id,
            doc=FewShotExample(
                input=prediction.context_snapshot,
                output=prediction.hypothesis_doc,
                score=accuracy.overall_score,
            )
        )

    # Update PM profile from their decision
    pm_profile = get_pm_profile(experiment.pm_id)
    pm_profile.decision_history.append({
        "suggestion_id": prediction.id,
        "action": actual.pm_decision,        # ship | iterate | stop
        "modification": actual.pm_edits,     # what the PM changed
    })
    db.set(f"pm:{experiment.pm_id}", pm_profile)

    # Adjust alert thresholds for this workspace
    update_alert_thresholds(
        workspace_id=experiment.workspace_id,
        false_positive_rate=accuracy.alert_false_positive_rate,
    )`,
    industries: [
      { sector: "E-commerce",  signal: "Revenue lift prediction vs actual GMV delta",     platform: "Outcome signal swapped: architecture identical" },
      { sector: "Healthcare",  signal: "Appointment completion prediction vs actual rate", platform: "HIPAA-safe aggregation: no patient IDs stored" },
      { sector: "FinTech",     signal: "Funded rate prediction vs actual funded count",    platform: "SOC 2 compliant: no transaction data in store" },
      { sector: "Media / DTC", signal: "Subscription CVR prediction vs actual converts",  platform: "GDPR-safe cohort aggregation : consent-gated" },
    ],
  },
];

function DevAgentCapabilities() {
  const [active, setActive] = useState<"monitor" | "customize" | "personalize" | "optimize">("monitor");

  const config = {
    monitor: {
      color: "#ef4444", label: "Monitor", tagline: "Real-time watchdog",
      story: "You ran a 14-day experiment. On day 3, a JavaScript conflict made the 50/50 split drift to 62/38. Nobody noticed. The analysis showed p = 0.04. You shipped. The lift was an artefact , and it quietly degraded the metric it was supposed to improve. Dev Agent's monitoring loop flags this on day 3, before a single line of analysis is written.",
      visual: <MonitorVisual />,
      checks: [
        { name: "Sample Ratio Mismatch (SRM)", desc: "Compares actual split to expected every 30 min. A 50/50 drifting to 62/38 signals implementation bias : flagged before the analysis window closes." },
        { name: "Novelty effect detection", desc: "Tracks whether lift is decaying in the first 7 days. A spike that reverts to baseline is novelty, not real improvement. Stopping early on novelty = shipping the wrong variant." },
        { name: "Data quality validation", desc: "Checks tracking events against the Tracking Plan schema on every impression. A mis-fired primary metric event corrupts your conversion rate silently , and won't appear in the results table." },
        { name: "Cross-experiment contamination", desc: "Flags when two experiments expose the same segment to conflicting changes. Both results become uninterpretable. Agent recommends mutual exclusion rules before both run longer." },
      ],
    },
    customize: {
      color: "#f59e0b", label: "Customize", tagline: "Workspace-aware suggestions",
      story: "A generic agent asked 'what MDE do you want to detect?' Your workspace has 847 completed experiments, a clear winning segment (Mobile / US / Paid Search), and a consistent pattern of 9-day qualified runs. None of that was used. Dev Agent reads your experiment history and applies it , so suggestions start from your reality, not a statistics textbook.",
      visual: <CustomizeVisual />,
      checks: [
        { name: "Pattern extraction from past experiments", desc: "Which hypothesis formats led to qualified experiments? Which targeting rules over-performed? Dev Agent reads this from your history : your workspace trains the agent, not the other way around." },
        { name: "Traffic-aware MDE recommendations", desc: "Calculates the MDE you can realistically detect given actual daily traffic, current experiment load, and run duration. The textbook answer is never the right answer for your account." },
        { name: "Metric library validation", desc: "Every metric is cross-referenced against your canonical event dictionary. Dev Agent will not suggest a metric that does not exist in your Tracking Plan : preventing the single most common design mistake." },
        { name: "Segment performance matching", desc: "Prioritises targeting rules that match your historically best-performing slices. Experiments start from a position of demonstrated strength, not a fresh assumption." },
      ],
    },
    personalize: {
      color: "#818cf8", label: "Personalize", tagline: "Adapts to every PM",
      story: "Sarah runs board-facing enterprise accounts : she needs frequentist p-values and a CI that excludes zero before she ships anything. Marcus runs growth : he'll ship at 85% posterior probability if expected loss is small. The same recommendation frustrates both of them. Dev Agent adapts the framing without running two separate agents or writing two separate prompts.",
      visual: <PersonalizeVisual />,
      checks: [
        { name: "Risk tolerance profiling", desc: "Conservative PMs get larger n and explicit risk callouts. Aggressive PMs get faster designs with clear trade-off statements. Controlled by a single profile field in the user store." },
        { name: "Statistical paradigm matching", desc: "Frequentist PMs get p-values and significance flags. Bayesian PMs get posterior probability and expected loss. Same data, different framing : controlled by the system prompt, not separate code." },
        { name: "Verbosity tuning", desc: "3-sentence summary for busy PMs. Full methodology breakdown for analytically-oriented ones. One profile field controls which template the LLM selects : no branching logic required." },
        { name: "Decision history learning", desc: "After 10–15 decisions, Dev Agent pre-adjusts. It learns if you consistently tighten time constraints, favour Bayesian framing, or reject conservative n estimates , and adapts before you have to say it again." },
      ],
    },
    optimize: {
      color: "#34d399", label: "Optimize", tagline: "Gets better every experiment",
      story: "Week 1: Dev Agent predicted 4,200 impressions needed. Actual: 6,800. Off by 62%. Month 3: predicted 5,100. Actual: 5,400. Off by 6%. It analysed 47 closed experiments, scored each prediction, and stored the accurate ones as workspace-specific few-shot examples. It learned your traffic patterns , not from generic training data, from its own track record.",
      visual: <OptimizeVisual />,
      checks: [
        { name: "Prediction accuracy scoring", desc: "After each experiment: was the sample size within 15% of actual? Did MDE estimate hold? Did qualification prediction match? Each prediction gets a score stored against the hypothesis ID." },
        { name: "Positive few-shot accumulation", desc: "High-accuracy predictions (≥ 0.85) become few-shot examples for future calls in the same workspace. The model learns workspace-specific patterns from its own successes , not generic assumptions." },
        { name: "Alert precision improvement", desc: "False positive alerts are logged. Thresholds auto-adjust per workspace to reduce fatigue without missing real issues. Every false alarm makes the next one less likely." },
        { name: "Cross-workspace learning (opt-in)", desc: "Aggregated, anonymised patterns from opted-in workspaces inform global priors : e.g. 'B2B SaaS pricing experiments need 2x the MDE estimate.' Individual workspace data is never shared." },
      ],
    },
  } as const;

  const c = config[active];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" }}>
        {(Object.keys(config) as Array<keyof typeof config>).map(id => {
          const on = id === active;
          const cfg = config[id];
          return (
            <button key={id} onClick={() => setActive(id)}
              style={{ padding: "14px 10px", borderRadius: "12px", border: `1px solid ${on ? cfg.color + "55" : "#2a2a3a"}`, background: on ? `${cfg.color}12` : "#12121a", cursor: "pointer", transition: "all .2s", textAlign: "center" as const, boxShadow: on ? `0 0 20px ${cfg.color}10` : "none" }}>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: on ? cfg.color : "#6b7280", marginBottom: "3px" }}>{cfg.label}</div>
              <div style={{ fontSize: "0.62rem", color: on ? cfg.color + "90" : "#3a3a5c" }}>{cfg.tagline}</div>
            </button>
          );
        })}
      </div>

      {/* Story hook */}
      <div style={{ background: `${c.color}07`, border: `1px solid ${c.color}20`, borderLeft: `4px solid ${c.color}`, borderRadius: "0 12px 12px 0", padding: "16px 20px", marginBottom: "18px" }}>
        <div style={{ fontSize: "0.57rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: c.color, marginBottom: "6px" }}>Why this matters</div>
        <p style={{ fontSize: "0.88rem", color: "#e2e8f0", lineHeight: 1.8, margin: 0 }}>{c.story}</p>
      </div>

      {/* Visual + checks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "0.57rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: c.color, marginBottom: "10px" }}>What it looks like in practice</div>
          {c.visual}
        </div>
        <div>
          <div style={{ fontSize: "0.57rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: c.color, marginBottom: "10px" }}>What it checks</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "8px" }}>
            {c.checks.map(({ name, desc }) => (
              <div key={name} style={{ background: "#12121a", border: `1px solid ${c.color}14`, borderRadius: "10px", padding: "11px 13px" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "3px" }}>{name}</div>
                <p style={{ fontSize: "0.71rem", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dev Agent Build Guide ─────────────────────────────────────────────────────

const BUILD_STEPS = [
  {
    step: "01", title: "Connect the data layer", color: "#818cf8", effort: "~1 day",
    desc: "Wire the agent to your experiment platform's API. For the reference platform: REST API for experiment config, Results API for live data, the Tracking Plan export for event schema. For any other platform: look for the same three surfaces : experiment config endpoint, live results endpoint, event schema dictionary. These three are all you need to ground every LLM call in reality.",
    inputs: ["Platform REST API credentials (or equivalent platform API)", "Results API access token for live experiment data", "Tracking Plan export (event names, required properties, identity schema)"],
    output: "Structured workspace context object : the grounding data for every downstream LLM call. Cached and refreshed every hour.",
  },
  {
    step: "02", title: "Build the monitoring loop", color: "#f59e0b", effort: "~2 days",
    desc: "A scheduled job (every 15–60 minutes depending on traffic volume) that pulls active experiment status and runs four statistical checks: SRM, novelty effect, tracking event quality, and cross-experiment contamination. If any check fires, the LLM generates a plain-language alert with a recommended action and dispatches it via webhook. The LLM writes the message; the checks are deterministic functions.",
    inputs: ["Active experiment IDs from platform API", "Historical traffic baselines per segment (30-day window)", "Tracking event fire rates from your data warehouse"],
    output: "Slack / Teams / Coda alerts : plain-language diagnosis + one recommended action. Zero alert fatigue after threshold tuning (step 05 closes the loop).",
  },
  {
    step: "03", title: "Implement the tool suite", color: "#34d399", effort: "~3 days",
    desc: "Four pure Python functions the LLM can call via Claude's tool use API: draft_hypothesis(), calculate_sample_size(), generate_variant_code(), explain_results(). Each function is deterministic : same inputs, same output. The LLM decides when to call them and how to chain them, but the functions themselves are predictable and testable independently of the LLM.",
    inputs: ["Metric library (for hypothesis validation)", "Traffic volume + active load (for sample size calc)", "Variant spec from hypothesis (for code gen)", "Statistical output from Results API (for results explainer)"],
    output: "Structured documents: HypothesisDoc (If/Then/Because + metric + MDE), SampleSizeDoc (n, power, duration), VariantCode (JS or SDK snippet), ResultsSummary (plain-language decision recommendation).",
  },
  {
    step: "04", title: "Add the personalisation layer", color: "#a5b4fc", effort: "~1 day",
    desc: "A lightweight user profile store (Redis or Postgres) keyed by PM user ID from your SSO. Fields: risk_tolerance, stat_preference, verbosity, mde_target, decision_history. The profile is injected into the LLM system prompt on every call as a context block : no separate code path, no ML model. It is purely prompt engineering with a user-specific context block appended to the base system prompt.",
    inputs: ["PM user ID from platform SSO (or your auth provider)", "Initial profile from a 3-question onboarding form (takes 60 seconds per PM)", "Ongoing: PM decisions logged automatically : accept, modify, or reject each suggestion"],
    output: "Personalised framing on every suggestion. Same recommendation, different presentation : matching each PM's communication style, risk appetite, and statistical literacy without maintaining separate agent versions.",
  },
  {
    step: "05", title: "Close the learning loop", color: "#fbbf24", effort: "~2 days",
    desc: "After each experiment concludes (via platform webhook or scheduled poll), compare predictions to outcomes. High-accuracy predictions (score ≥ 0.85) become positive few-shot examples stored in a vector DB : the agent learns from its own successes, not generic training data. Low-accuracy predictions trigger a review flag. Alert thresholds auto-adjust per workspace to eliminate false positive fatigue.",
    inputs: ["Final experiment results from Results API (triggered by experiment conclusion webhook)", "Prediction store record saved at hypothesis stage (hypothesis, n estimate, MDE, qualification prediction)", "PM decision: ship / iterate / stop (logged from experiment conclusion UI)"],
    output: "Growing workspace-specific few-shot library. Updated PM decision profiles. Calibrated alert thresholds. After 20–30 experiments: measurably better hypothesis quality scores and sample size prediction accuracy.",
  },
  {
    step: "06", title: "Replicate to another industry", color: "#10b981", effort: "~1 day per industry",
    desc: "Swap the data layer connector (Step 01) and domain-specific metric definitions. Add any compliance guardrails to the LLM system prompt (HIPAA for healthcare, PCI-DSS for FinTech, GDPR for European media). Keep everything else : the monitoring loop, tool suite, personalisation layer, and learning loop : completely unchanged. The agent architecture is the same 400 lines of Python regardless of industry.",
    inputs: ["New platform API credentials (GA4 for e-commerce, Epic for healthcare, Plaid for FinTech)", "Domain metric definitions (checkout rate, appointment completion, funded rate, subscriber CVR)", "Compliance system prompt additions (HIPAA: no PII; PCI: no card data; GDPR: consent-gated)"],
    output: "Identical agent, new domain. All four capabilities : Monitor, Customize, Personalize, Optimize : work out of the box. The only industry-specific code is the data connector and the metric schema. Everything else is re-used.",
  },
];

function DevAgentBuildGuide() {
  const [active, setActive] = useState<string>("01");
  const step = BUILD_STEPS.find(s => s.step === active)!;
  const stepIndex = BUILD_STEPS.findIndex(s => s.step === active);
  const effortMap: Record<string, number> = { "01": 1, "02": 2, "03": 3, "04": 1, "05": 2, "06": 1 };
  const daysDone = BUILD_STEPS.slice(0, stepIndex + 1).reduce((s, b) => s + (effortMap[b.step] ?? 1), 0);
  const totalDays = 9;

  return (
    <div>
      {/* Step card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
        {BUILD_STEPS.map((s, i) => {
          const on = s.step === active;
          const past = stepIndex > i;
          const effortMap: Record<string, number> = { "01": 1, "02": 2, "03": 3, "04": 1, "05": 2, "06": 1 };
          const totalBefore = BUILD_STEPS.slice(0, i).reduce((acc, b) => acc + (effortMap[b.step] ?? 1), 0);
          return (
            <button key={s.step} onClick={() => setActive(s.step)}
              style={{ background: on ? `${s.color}0f` : past ? `${s.color}06` : "#0d1117", border: `1px solid ${on ? s.color + "55" : past ? s.color + "22" : "#1e1e2e"}`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", textAlign: "left" as const, transition: "all .2s", boxShadow: on ? `0 0 18px ${s.color}14` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: on ? `${s.color}22` : past ? `${s.color}10` : "#1a1a2e", border: `1px solid ${on ? s.color + "60" : past ? s.color + "30" : "#2a2a3a"}` }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 900, color: on ? s.color : past ? s.color + "80" : "#4a4a68", fontFamily: "ui-monospace, monospace" }}>{s.step}</span>
                </div>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: `${s.color}12`, color: s.color }}>{s.effort}</span>
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: on ? "#f1f5f9" : past ? "#9ca3af" : "#6b7280", marginBottom: "4px", lineHeight: 1.3 }}>{s.title}</div>
              <div style={{ fontSize: "0.62rem", color: on ? s.color + "90" : "#3a3a5c" }}>starts day {totalBefore + 1}</div>
            </button>
          );
        })}
      </div>

      {/* Step detail */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "#12121a", border: `1px solid ${step.color}22`, borderRadius: "12px", padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "0.57rem", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: step.color, marginBottom: "4px" }}>Step {step.step}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>{step.title}</h3>
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", background: `${step.color}14`, color: step.color, flexShrink: 0 }}>{step.effort}</span>
          </div>
          <p style={{ fontSize: "0.83rem", color: "#9ca3af", lineHeight: 1.8, margin: "0 0 16px" }}>{step.desc}</p>
          <div style={{ fontSize: "0.57rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#52525b", marginBottom: "8px" }}>Inputs</div>
          {step.inputs.map((inp, i) => (
            <div key={i} style={{ display: "flex", gap: "7px", marginBottom: "5px" }}>
              <span style={{ color: step.color, fontSize: "0.65rem", flexShrink: 0, marginTop: "2px" }}>→</span>
              <span style={{ fontSize: "0.73rem", color: "#9ca3af", lineHeight: 1.5 }}>{inp}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
          <div style={{ background: `${step.color}08`, border: `1px solid ${step.color}22`, borderRadius: "12px", padding: "18px 20px", flex: 1 }}>
            <div style={{ fontSize: "0.57rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: step.color, marginBottom: "8px" }}>What you get</div>
            <p style={{ fontSize: "0.82rem", color: "#e2e8f0", margin: 0, lineHeight: 1.75 }}>{step.output}</p>
          </div>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.65rem", color: "#6b7280" }}>Build progress</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: step.color, fontFamily: "ui-monospace, monospace" }}>~{daysDone} of {totalDays} days</span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round((daysDone / totalDays) * 100)}%`, background: `linear-gradient(90deg, ${step.color}, ${step.color}cc)`, borderRadius: "3px", transition: "width .4s ease" }} />
            </div>
            {step.step === "06" && (
              <div style={{ marginTop: "8px", fontSize: "0.67rem", color: "#10b981" }}>✓ After Step 05, each new industry = ~1 extra day</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Industry adapter ──────────────────────────────────────────────────────────

const INDUSTRY_MAP = [
  {
    sector: "B2B SaaS",
    subsector: "Experimentation platform: reference implementation",
    color: "#f59e0b",
    platform: "Platform REST + Results API",
    experimentType: "Feature flags · Web Experimentation · Holdout layers",
    primaryMetric: "Qualified experiment rate (≥5K impressions) · Renewal rate",
    monitorSignal: "Impression velocity · SRM · Tracking event fire rate · Cross-experiment contamination",
    personalSignal: "PM risk tolerance · CS renewal target tier · Board reporting cadence",
    optimiseTarget: "Qualification rate lift · Sample size prediction accuracy · Renewal correlation",
    compliance: "Standard enterprise SaaS : no PII constraints beyond standard data governance",
    reuse: "This is the reference implementation. Steps 02–05 are re-used unchanged in every other industry.",
  },
  {
    sector: "E-commerce",
    subsector: "Checkout funnel · PDP · Category pages",
    color: "#818cf8",
    platform: "GA4 / Amplitude / Heap: swap for Step 01 connector",
    experimentType: "A/B and MVT on checkout, PDP, category pages",
    primaryMetric: "Add-to-cart rate · Checkout completion rate · AOV · Return rate (guardrail)",
    monitorSignal: "Cart abandonment rate spike · Conversion rate decay by device segment · Payment error rate",
    personalSignal: "Growth PM (revenue focus) vs Brand PM (perception focus) decision divergence",
    optimiseTarget: "Revenue per visitor · CVR lift prediction accuracy · Cart abandonment alert precision",
    compliance: "PCI-DSS: strip all raw card data before LLM context. Use aggregated funnel metrics only.",
    reuse: "Swap Step 01 data connector to GA4 + Amplitude. Add PCI-DSS constraint to system prompt. Steps 02–05 unchanged.",
  },
  {
    sector: "Healthcare",
    subsector: "Appointment booking · Patient portal · Intake forms",
    color: "#34d399",
    platform: "Epic / Athena API: swap for Step 01 connector",
    experimentType: "A/B on booking UI · Appointment reminder copy · Intake form length",
    primaryMetric: "Appointment completion rate · No-show rate · Time-to-book (guardrail: satisfaction score)",
    monitorSignal: "Completion rate anomaly by care pathway · Step drop-off by patient demographic · No-show spike",
    personalSignal: "Clinician preference for caution vs ops team speed pressure",
    optimiseTarget: "Appointment completion lift · No-show prediction accuracy · Care pathway completion",
    compliance: "HIPAA: strip all PII (name, DOB, MRN) before LLM. Use anonymised patient cohort IDs. Aggregate metrics only. BAA required with Anthropic.",
    reuse: "Swap Step 01 connector to Epic/Athena API. Add HIPAA constraint block to system prompt. Inject BAA requirement. Steps 02–05 unchanged.",
  },
  {
    sector: "FinTech",
    subsector: "Loan origination · Account opening · Payments",
    color: "#fbbf24",
    platform: "Plaid / Stripe / custom origination API: swap for Step 01",
    experimentType: "Feature flags on application flow · Form field count A/B · Approval message copy",
    primaryMetric: "Application completion rate · Funded rate · Default rate (hard guardrail) · Fraud rate (hard guardrail)",
    monitorSignal: "Application drop-off by field · Funded rate decay by acquisition channel · Fraud signal spike",
    personalSignal: "Risk officer (default guardrail priority) vs Product PM (completion rate priority) tension",
    optimiseTarget: "Funded rate · Time-to-funded · False positive alert reduction · Default rate prediction",
    compliance: "SOC 2: no raw transaction data, no credit scores, no SSNs in LLM context. Aggregate metrics only. Regulatory approval required for metric changes.",
    reuse: "Swap Step 01 connector. Add hard default/fraud rate guardrails as non-negotiable tool constraints. Steps 02–05 unchanged.",
  },
  {
    sector: "Media / DTC",
    subsector: "Paywall · Content recommendations · Subscriptions",
    color: "#f43f5e",
    platform: "Parse.ly / Piano / Chartbeat: swap for Step 01",
    experimentType: "Paywall timing A/B · Content recommendation MVT · Pricing page A/B",
    primaryMetric: "Subscriber CVR · Paywall engagement rate · Churn rate (guardrail) · Content depth score",
    monitorSignal: "Paywall impression decay · Subscriber cancellation spike · Content engagement drop by segment",
    personalSignal: "Editorial instinct (content quality) vs Data-first product culture (engagement metrics)",
    optimiseTarget: "Subscription CVR · Content engagement depth · Paywall timing prediction accuracy",
    compliance: "GDPR: consent-based tracking only. No user-level data without explicit consent. Anonymised cohort analysis. Right-to-erasure handling in few-shot store.",
    reuse: "Swap Step 01 connector. Add GDPR consent check to context extraction. Handle erasure requests in vector store. Steps 02–05 unchanged.",
  },
  {
    sector: "Logistics",
    subsector: "Checkout · Delivery ETA display · Driver allocation",
    color: "#a5b4fc",
    platform: "Custom delivery API / Segment / Google Maps API",
    experimentType: "ETA display A/B on checkout · Driver assignment algorithm feature flags · Delivery notification copy",
    primaryMetric: "Cart completion rate · On-time delivery % · Driver acceptance rate (guardrail)",
    monitorSignal: "ETA accuracy drift by route cluster · Driver acceptance anomaly by shift · Cart completion drop by region",
    personalSignal: "Customer experience PM (completion rate) vs Operations PM (driver efficiency) priority split",
    optimiseTarget: "Cart completion rate · ETA prediction accuracy · Driver acceptance rate lift",
    compliance: "Driver PII handling per local labour regulations (GDPR in EU, state-specific in US). No driver ID in LLM context. Aggregate route metrics only.",
    reuse: "Swap Step 01 connector to custom delivery API. Add geo-routing context. Inject local labour compliance constraint. Steps 02–05 unchanged.",
  },
];

function IndustryAdapter() {
  const [selected, setSelected] = useState<string>("B2B SaaS");
  const row = INDUSTRY_MAP.find(r => r.sector === selected)!;

  return (
    <div>
      {/* Invariant callout: what's identical across all industries */}
      <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "12px", padding: "16px 20px", marginBottom: "18px", display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "20px", alignItems: "start" }}>
        <div>
          <div style={{ fontSize: "0.57rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#ef4444", marginBottom: "8px" }}>Swap this (per industry)</div>
          {["Data layer connector: Step 01", "Metric definitions (domain-specific names)", "Compliance additions to system prompt"].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
              <span style={{ color: "#ef4444", fontSize: "0.65rem", flexShrink: 0 }}>✗</span>
              <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ width: "1px", background: "#2a2a3a", alignSelf: "stretch" }} />
        <div>
          <div style={{ fontSize: "0.57rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#10b981", marginBottom: "8px" }}>Keep this (identical)</div>
          {["Monitoring loop : Step 02", "Tool suite : Step 03", "Personalisation layer : Step 04", "Learning loop : Step 05"].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
              <span style={{ color: "#10b981", fontSize: "0.65rem", flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Industry tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" as const }}>
        {INDUSTRY_MAP.map(({ sector, color }) => {
          const on = sector === selected;
          return (
            <button key={sector} onClick={() => setSelected(sector)}
              style={{ padding: "7px 14px", borderRadius: "8px", border: `1px solid ${on ? color + "55" : "#2a2a3a"}`, background: on ? `${color}12` : "transparent", fontSize: "0.77rem", fontWeight: on ? 700 : 500, color: on ? color : "#6b7280", cursor: "pointer", transition: "all .15s" }}>
              {sector}
            </button>
          );
        })}
      </div>

      <div style={{ background: "#12121a", border: `1px solid ${row.color}22`, borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ background: `${row.color}0d`, borderBottom: `1px solid ${row.color}18`, padding: "14px 20px", display: "flex", alignItems: "baseline", gap: "14px" }}>
          <div style={{ fontSize: "0.92rem", fontWeight: 700, color: row.color }}>{row.sector}</div>
          <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>{row.subsector}</div>
        </div>
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {[
            { label: "Platform (Step 01 swap)", value: row.platform, note: true },
            { label: "Primary metric", value: row.primaryMetric, accent: true },
            { label: "Experiment type", value: row.experimentType },
            { label: "Monitoring signal", value: row.monitorSignal },
            { label: "Optimisation target", value: row.optimiseTarget, accent: true },
            { label: "Compliance constraint", value: row.compliance, warn: true },
          ].map(({ label, value, accent, warn, note }) => (
            <div key={label} style={{ background: "#0d1117", border: `1px solid ${warn ? "rgba(239,68,68,0.2)" : note ? "rgba(129,140,248,0.15)" : "#1e1e2e"}`, borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ fontSize: "0.57rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: warn ? "#ef444470" : note ? "#818cf870" : "#52525b", marginBottom: "5px" }}>{label}</div>
              <p style={{ fontSize: "0.73rem", color: warn ? "#f87171" : accent ? row.color : "#9ca3af", margin: 0, lineHeight: 1.55 }}>{value}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ background: `${row.color}07`, border: `1px solid ${row.color}20`, borderRadius: "10px", padding: "12px 16px" }}>
            <div style={{ fontSize: "0.57rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: row.color, marginBottom: "5px" }}>What changes · what stays</div>
            <p style={{ fontSize: "0.77rem", color: "#9ca3af", margin: 0, lineHeight: 1.65 }}>{row.reuse}</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "12px", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "10px", padding: "12px 16px" }}>
        <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0, lineHeight: 1.7 }}>
          A working reference implementation takes ~9 engineering days. Each additional industry takes ~1 more : swap the connector, add compliance constraints, keep everything else.
          The monitoring loop, tool suite, personalisation store, and learning loop are{" "}
          <strong style={{ color: "#fbbf24" }}>identical across all six industries</strong>.
        </p>
      </div>
    </div>
  );
}

// ── Win Showcase ─────────────────────────────────────────────────────────────

function WinShowcase() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const wins = [
    { metric: "+35%", label: "Conversion lift", sub: "MVT interaction : headline × social proof", color: "#10b981", delay: 0 },
    { metric: "+16%", label: "Qualification rate", sub: "Dev Agent-assisted vs. standard", color: "#34d399", delay: 100 },
    { metric: "+49%", label: "Renewal rate spread", sub: "0 qualified → 20+ qualified tier", color: "#fbbf24", delay: 200 },
    { metric: "+12%", label: "Causal renewal lift", sub: "RDD estimate at 5K impression gate", color: "#818cf8", delay: 300 },
    { metric: "74%", label: "Peak qualification rate", sub: "Dev Agent-assisted experiments", color: "#a5b4fc", delay: 400 },
  ];

  return (
    <div ref={ref} style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 24px 60px" }}>
      <div style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "#52525b", marginBottom: "16px", textAlign: "center" as const }}>Key Results</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
        {wins.map(({ metric, label, sub, color, delay }) => (
          <div key={label} style={{
            background: `${color}07`,
            border: `1px solid ${color}28`,
            borderRadius: "14px",
            padding: "20px 14px",
            textAlign: "center" as const,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms`,
          }}>
            <div style={{ fontSize: "1.9rem", fontWeight: 900, color, fontFamily: "ui-monospace, monospace", lineHeight: 1, marginBottom: "8px" }}>{metric}</div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "5px", lineHeight: 1.3 }}>{label}</div>
            <div style={{ fontSize: "0.62rem", color: "#6b7280", lineHeight: 1.45 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Design Revolution ─────────────────────────────────────────────────────────

function DesignRevolution() {
  const [view, setView] = useState<"before" | "after">("before");

  const before = [
    { label: "Hypothesis quality", desc: "Ad-hoc, no standard format. PMs wrote whatever felt right.", score: 2, color: "#ef4444" },
    { label: "Sample size planning", desc: "Gut-feel estimates or generic online calculators.", score: 2, color: "#ef4444" },
    { label: "Metric selection", desc: "Whatever was easy to track, not necessarily the right signal.", score: 3, color: "#ef4444" },
    { label: "Guardrail metrics", desc: "Rarely set. Teams discovered regressions post-ship.", score: 1, color: "#ef4444" },
    { label: "Qualification gate", desc: "No threshold. Any experiment counted, regardless of impressions.", score: 1, color: "#ef4444" },
    { label: "Cross-team handoff", desc: "Email chains. No structured decision artefact.", score: 2, color: "#ef4444" },
  ];

  const after = [
    { label: "Hypothesis quality", desc: "Structured If/Then/Because template. Dev Agent validates against the Metric Library.", score: 9, color: "#10b981" },
    { label: "Sample size planning", desc: "Power analysis with account-specific baseline rates. 5K gate enforced.", score: 9, color: "#10b981" },
    { label: "Metric selection", desc: "Pulled from the canonical Metric Library. Guardrails required at design time.", score: 8, color: "#34d399" },
    { label: "Guardrail metrics", desc: "Auto-populated by Dev Agent. Tracked and alerted throughout the run.", score: 8, color: "#34d399" },
    { label: "Qualification gate", desc: "5K impression threshold gates all analysis : defined with full statistical backing.", score: 10, color: "#10b981" },
    { label: "Cross-team handoff", desc: "Structured experiment summary pushed to Coda. PM decision logged and searchable.", score: 9, color: "#10b981" },
  ];

  const items = view === "before" ? before : after;

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {(["before", "after"] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{
              padding: "8px 20px", borderRadius: "8px", border: "1px solid", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all .15s",
              background: view === v ? (v === "before" ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)") : "transparent",
              borderColor: view === v ? (v === "before" ? "rgba(239,68,68,0.5)" : "rgba(16,185,129,0.5)") : "#2a2a3a",
              color: view === v ? (v === "before" ? "#ef4444" : "#10b981") : "#6b7280",
            }}>
            {v === "before" ? "Before: Ad-hoc experimentation" : "After: The Experiment Framework"}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map(({ label, desc, score, color }) => (
          <div key={label} style={{ background: "#12121a", border: `1px solid ${color}18`, borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "140px", flexShrink: 0 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9" }}>{label}</div>
            </div>
            <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${score * 10}%`, background: color, borderRadius: "3px", transition: "width .5s ease" }} />
            </div>
            <div style={{ width: "28px", textAlign: "right" as const, fontSize: "0.7rem", fontWeight: 700, color, fontFamily: "monospace", flexShrink: 0 }}>{score}/10</div>
            <div style={{ flex: 2, fontSize: "0.72rem", color: "#9ca3af", lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>
      {view === "after" && (
        <div style={{ marginTop: "14px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: "10px", padding: "12px 16px" }}>
          <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: 0, lineHeight: 1.65 }}>
            The framework didn&apos;t come from a top-down mandate : it came from working backwards from the retention finding. Once experiment quality was linked to renewal probability, &ldquo;better design&rdquo; became a commercial argument, not just a statistical preference.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Cross-functional execution map ────────────────────────────────────────────

function CrossFunctionalMap() {
  const [activeRole, setActiveRole] = useState<string | null>(null);

  const roles = [
    {
      id: "pm", title: "Product Manager", color: "#818cf8",
      responsibilities: [
        "Defines the business question",
        "Writes hypothesis (If/Then/Because)",
        "Sets the primary success metric",
        "Makes ship / iterate / stop call",
        "Reports lift to leadership as revenue",
      ],
    },
    {
      id: "analytics", title: "Analytics Engineer", color: "#f59e0b",
      responsibilities: [
        "Validates metric against Metric Library",
        "Runs power analysis : confirms 5K achievable",
        "Detects interaction effects in MVT results",
        "Applies causal inference to retention findings",
        "Feeds learning back into future power calcs",
      ],
    },
    {
      id: "engineering", title: "Engineering", color: "#34d399",
      responsibilities: [
        "Implements variant code (JS or SDK)",
        "Integrates Feature Experimentation SDK",
        "Validates tracking events match Tracking Plan",
        "Manages feature flag lifecycle",
        "Debugs exposure anomalies mid-experiment",
      ],
    },
    {
      id: "cs", title: "Customer Success", color: "#f43f5e",
      responsibilities: [
        "Monitors account experiment exposure",
        "Flags qualitative signal from accounts",
        "Uses engagement metric in health scoring",
        "Drives AI Orchestration attach motion via quality story",
        "Translates qualification rate into renewal risk",
      ],
    },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
        {roles.map(({ id, title, color, responsibilities }) => {
          const on = activeRole === id;
          return (
            <div key={id} onMouseEnter={() => setActiveRole(id)} onMouseLeave={() => setActiveRole(null)}
              style={{ background: on ? `${color}10` : "#12121a", border: `1px solid ${on ? color + "40" : "#2a2a3a"}`, borderRadius: "14px", overflow: "hidden", cursor: "default", transition: "all .2s", boxShadow: on ? `0 0 20px ${color}12` : "none" }}>
              <div style={{ background: `${color}12`, borderBottom: `1px solid ${color}18`, padding: "12px 14px" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color }}>{title}</div>
              </div>
              <div style={{ padding: "14px" }}>
                {responsibilities.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: "7px", marginBottom: i < responsibilities.length - 1 ? "7px" : "0" }}>
                    <span style={{ color, fontSize: "0.65rem", flexShrink: 0, marginTop: "2px" }}>→</span>
                    <span style={{ fontSize: "0.73rem", color: on ? "#d1d5db" : "#9ca3af", lineHeight: 1.5, transition: "color .2s" }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "14px", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "10px", padding: "12px 16px" }}>
        <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: 0, lineHeight: 1.65 }}>
          Experiment quality is a <strong style={{ color: "#fbbf24" }}>cross-functional output</strong>. PMs define the question. Analytics validates the method and proves causation. Engineering ensures clean implementation. CS turns engagement signal into commercial action. Dev Agent compresses the first three phases by ~70% , but doesn&apos;t replace the human judgement in each role.
        </p>
      </div>
    </div>
  );
}

// ── Dev Agent ERD / Architecture flow ────────────────────────────────────────

function DevAgentERD() {
  const [selected, setSelected] = useState<string | null>(null);

  type NodeDetail = { label: string; layer: string; color: string; body: string };
  const DETAILS: Record<string, NodeDetail> = {
    product:    { layer: "Input",        color: "#818cf8", label: "Product Context",           body: "Workspace metadata: experiment history, segment definitions, conversion goals. Dev Agent reads this to anchor suggestions in the account's actual product reality , not generic best-practice assumptions." },
    metriclib:  { layer: "Input",        color: "#818cf8", label: "Metric Library",            body: "The canonical event dictionary maintained by Product Analytics. Dev Agent validates metric choices against approved events and auto-suggests guardrail metrics from the library." },
    tracking:   { layer: "Input",        color: "#818cf8", label: "Tracking Plan",             body: "The Segment tracking contract : required properties, event naming, identity linkage. Dev Agent checks that any new event meets the schema before generating tracking code." },
    history:    { layer: "Input",        color: "#818cf8", label: "Experiment History",        body: "Historical experiment data: baseline conversion rates by segment, typical MDEs, prior test results. Powers the sample-size calculator with real account-specific data instead of generic assumptions." },
    llm:        { layer: "Intelligence", color: "#6366f1", label: "LLM Core (Claude Sonnet 4.6)", body: "The intelligence layer. Receives enriched context, generates hypotheses, dispatches tools in sequence, and synthesises outputs into coherent recommendations. Uses structured output to ensure results fit the platform's APIs." },
    dispatcher: { layer: "Intelligence", color: "#fbbf24", label: "Tool Dispatcher",           body: "Routes the LLM's intent to the correct tool chain. Decides which combination of tools to invoke based on the user's request, available context, and previous tool outputs." },
    hypothesis: { layer: "Tool Suite",   color: "#34d399", label: "Hypothesis Drafter",        body: "Generates a full hypothesis statement: intervention, expected outcome, metric, MDE estimate, and reasoning. Validated against the Metric Library before output." },
    power:      { layer: "Tool Suite",   color: "#34d399", label: "Sample Size Calc",          body: "Runs power analysis using account-specific baseline rates from Experiment History. Outputs required n-per-variation, projected run duration, and flags if the experiment won't qualify at the 5K threshold." },
    codegen:    { layer: "Tool Suite",   color: "#34d399", label: "Code Generator",            body: "Writes variant implementation code : JavaScript for Web Experimentation or SDK calls for Feature Experimentation : plus the tracking event calls for the primary metric, validated against the Tracking Plan schema." },
    explain:    { layer: "Tool Suite",   color: "#34d399", label: "Results Explainer",         body: "Takes statistical output (p-value, posterior probability, expected loss) and produces a plain-language decision recommendation for the PM: ship, iterate, or stop : with the causal reasoning attached." },
    platform:   { layer: "Output",       color: "#f59e0b", label: "Platform API",   body: "The output destination. Dev Agent writes back experiment configuration, feature flag settings, traffic allocation rules, and metric registration : all via the platform API, no manual UI work required." },
  };

  const active = selected ? DETAILS[selected] : null;
  const toggle = (id: string) => setSelected(s => s === id ? null : id);

  // SVG layout
  const VW = 680; const VH = 334;
  const IC = "#818cf8"; const LC = "#6366f1";
  const TC = "#34d399"; const DC = "#fbbf24"; const OC = "#f59e0b";

  const NW = 148; const NG = 9;
  const ROW_X0 = (VW - (4 * NW + 3 * NG)) / 2; // ≈ 30

  const IN_Y = 18; const IN_H = 50;
  const LM_Y = 104; const LM_H = 54; const LM_X = 55; const LM_W = VW - 2 * LM_X;
  const DS_Y = 178; const DS_H = 26; const DS_X = 220; const DS_W = 240;
  const TL_Y = 224; const TL_H = 50;
  const PT_Y = 294; const PT_H = 40; const PT_X = 55; const PT_W = VW - 2 * PT_X;
  const CX = VW / 2;

  const inputNodes = [
    { id: "product",   label: "Product Context",   sub: "Goals · Segments"    },
    { id: "metriclib", label: "Metric Library",     sub: "Events · Guardrails" },
    { id: "tracking",  label: "Tracking Plan",      sub: "Schema · Identity"   },
    { id: "history",   label: "Experiment History", sub: "Baselines · Results" },
  ].map((n, i) => ({ ...n, x: ROW_X0 + i * (NW + NG), cx: ROW_X0 + i * (NW + NG) + NW / 2 }));

  const toolNodes = [
    { id: "hypothesis", label: "Hypothesis Drafter", sub: "If / Then / Because"  },
    { id: "power",      label: "Sample Size Calc",   sub: "n · power · duration" },
    { id: "codegen",    label: "Code Generator",     sub: "JS · SDK · Events"    },
    { id: "explain",    label: "Results Explainer",  sub: "Plain-language calls"  },
  ].map((n, i) => ({ ...n, x: ROW_X0 + i * (NW + NG), cx: ROW_X0 + i * (NW + NG) + NW / 2 }));

  return (
    <div>
      <div style={{ background: "#0d1117", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "20px 20px 18px", overflowX: "auto" }}>
        {/* Layer legend */}
        <div style={{ display: "flex", gap: "18px", marginBottom: "14px", flexWrap: "wrap" as const }}>
          {[{ label: "INPUT LAYER", c: IC }, { label: "INTELLIGENCE", c: LC }, { label: "TOOL SUITE", c: TC }, { label: "OUTPUT", c: OC }].map(({ label, c }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "2px", background: c, opacity: 0.6 }} />
              <span style={{ fontSize: "0.54rem", fontWeight: 800, letterSpacing: "0.13em", color: c, opacity: 0.7 }}>{label}</span>
            </div>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "0.58rem", color: "#3a3a5c" }}>click any node to inspect</span>
        </div>

        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: "block", minWidth: "520px", overflow: "visible" }}>
          <defs>
            {[
              { id: "arr-ic", c: IC, op: 0.5  },
              { id: "arr-dc", c: DC, op: 0.75 },
              { id: "arr-tc", c: TC, op: 0.5  },
              { id: "arr-oc", c: OC, op: 0.5  },
            ].map(({ id, c, op }) => (
              <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L0,7 L7,3.5 z" fill={c} fillOpacity={op} />
              </marker>
            ))}
            {[
              { id: "band-in", c: IC },
              { id: "band-lm", c: LC },
              { id: "band-tl", c: TC },
              { id: "band-pt", c: OC },
            ].map(({ id, c }) => (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={c} stopOpacity="0.03" />
                <stop offset="50%"  stopColor={c} stopOpacity="0.07" />
                <stop offset="100%" stopColor={c} stopOpacity="0.03" />
              </linearGradient>
            ))}
          </defs>

          {/* Layer bands */}
          <rect x={2} y={IN_Y - 8}  width={VW - 4} height={IN_H + 18}                    rx={8} fill="url(#band-in)" />
          <rect x={2} y={LM_Y - 8}  width={VW - 4} height={LM_H + DS_H + 32}             rx={8} fill="url(#band-lm)" />
          <rect x={2} y={TL_Y - 8}  width={VW - 4} height={TL_H + 18}                    rx={8} fill="url(#band-tl)" />
          <rect x={2} y={PT_Y - 8}  width={VW - 4} height={PT_H + 14}                    rx={8} fill="url(#band-pt)" />

          {/* Fan-in: Inputs → LLM */}
          {inputNodes.map(n => (
            <path key={`in-${n.id}`}
              d={`M ${n.cx} ${IN_Y + IN_H} C ${n.cx} ${LM_Y - 16} ${CX} ${LM_Y - 16} ${CX} ${LM_Y}`}
              fill="none" stroke={IC} strokeWidth="1.3" strokeOpacity="0.4" strokeDasharray="4 3"
              markerEnd="url(#arr-ic)" />
          ))}

          {/* LLM → Dispatcher */}
          <line x1={CX} y1={LM_Y + LM_H} x2={CX} y2={DS_Y}
            stroke={DC} strokeWidth="1.8" strokeOpacity="0.6" markerEnd="url(#arr-dc)" />
          <text x={CX + 8} y={DS_Y - 6} fontSize="7.5" fill={DC} fillOpacity="0.55" fontWeight="700">routes tool intent</text>

          {/* Fan-out: Dispatcher → Tools */}
          {toolNodes.map(n => (
            <path key={`ds-${n.id}`}
              d={`M ${CX} ${DS_Y + DS_H} C ${CX} ${TL_Y - 14} ${n.cx} ${TL_Y - 14} ${n.cx} ${TL_Y}`}
              fill="none" stroke={TC} strokeWidth="1.3" strokeOpacity="0.4" strokeDasharray="4 3"
              markerEnd="url(#arr-tc)" />
          ))}

          {/* Converge: Tools → Platform */}
          {toolNodes.map(n => (
            <path key={`out-${n.id}`}
              d={`M ${n.cx} ${TL_Y + TL_H} C ${n.cx} ${PT_Y - 12} ${CX} ${PT_Y - 12} ${CX} ${PT_Y}`}
              fill="none" stroke={OC} strokeWidth="1.3" strokeOpacity="0.4" strokeDasharray="4 3"
              markerEnd="url(#arr-oc)" />
          ))}

          {/* Input nodes */}
          {inputNodes.map(n => {
            const on = selected === n.id;
            return (
              <g key={n.id} onClick={() => toggle(n.id)} style={{ cursor: "pointer" }}>
                <rect x={n.x} y={IN_Y} width={NW} height={IN_H} rx={9}
                  fill={on ? `${IC}1e` : `${IC}0a`} stroke={on ? IC : `${IC}2e`} strokeWidth={on ? 1.6 : 1} />
                {on && <rect x={n.x} y={IN_Y} width={NW} height={3} rx={2} fill={IC} fillOpacity="0.5" />}
                <text x={n.cx} y={IN_Y + 21} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={on ? IC : "#9ca3af"}>{n.label}</text>
                <text x={n.cx} y={IN_Y + 36} textAnchor="middle" fontSize="8" fill={on ? `${IC}90` : "#4a4a68"}>{n.sub}</text>
              </g>
            );
          })}

          {/* LLM Core */}
          {(() => {
            const on = selected === "llm";
            return (
              <g onClick={() => toggle("llm")} style={{ cursor: "pointer" }}>
                <rect x={LM_X} y={LM_Y} width={LM_W} height={LM_H} rx={10}
                  fill={on ? `${LC}1c` : `${LC}09`} stroke={on ? LC : `${LC}30`} strokeWidth={on ? 2 : 1.2} />
                {on && <rect x={LM_X} y={LM_Y} width={LM_W} height={4} rx={2} fill={LC} fillOpacity="0.45" />}
                <text x={CX} y={LM_Y + 17} textAnchor="middle" fontSize="8" fontWeight="900" fill="#6366f1" letterSpacing="2">INTELLIGENCE LAYER</text>
                <text x={CX} y={LM_Y + 35} textAnchor="middle" fontSize="13.5" fontWeight="800" fill={on ? "#a5b4fc" : "#818cf8"}>LLM Core: Claude Sonnet 4.6</text>
                <text x={CX} y={LM_Y + 50} textAnchor="middle" fontSize="8.5" fill="#4a4a68">Reasoning · Tool calling · Structured output · Context compression</text>
              </g>
            );
          })()}

          {/* Tool Dispatcher */}
          {(() => {
            const on = selected === "dispatcher";
            return (
              <g onClick={() => toggle("dispatcher")} style={{ cursor: "pointer" }}>
                <rect x={DS_X} y={DS_Y} width={DS_W} height={DS_H} rx={7}
                  fill={on ? `${DC}1a` : `${DC}0d`} stroke={on ? DC : `${DC}3a`} strokeWidth={on ? 1.5 : 1} />
                <text x={CX} y={DS_Y + 17} textAnchor="middle" fontSize="9.5" fontWeight="800" fill={on ? "#fde68a" : DC} letterSpacing="1.5">TOOL DISPATCHER</text>
              </g>
            );
          })()}

          {/* Tool nodes */}
          {toolNodes.map(n => {
            const on = selected === n.id;
            return (
              <g key={n.id} onClick={() => toggle(n.id)} style={{ cursor: "pointer" }}>
                <rect x={n.x} y={TL_Y} width={NW} height={TL_H} rx={9}
                  fill={on ? `${TC}1c` : `${TC}09`} stroke={on ? TC : `${TC}28`} strokeWidth={on ? 1.6 : 1} />
                {on && <rect x={n.x} y={TL_Y} width={NW} height={3} rx={2} fill={TC} fillOpacity="0.5" />}
                <text x={n.cx} y={TL_Y + 21} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={on ? TC : "#9ca3af"}>{n.label}</text>
                <text x={n.cx} y={TL_Y + 37} textAnchor="middle" fontSize="7.5" fill={on ? `${TC}80` : "#4a4a68"}>{n.sub}</text>
              </g>
            );
          })}

          {/* Platform output */}
          {(() => {
            const on = selected === "platform";
            return (
              <g onClick={() => toggle("platform")} style={{ cursor: "pointer" }}>
                <rect x={PT_X} y={PT_Y} width={PT_W} height={PT_H} rx={10}
                  fill={on ? `${OC}15` : `${OC}08`} stroke={on ? OC : `${OC}28`} strokeWidth={on ? 1.6 : 1} />
                {on && <rect x={PT_X} y={PT_Y} width={PT_W} height={4} rx={2} fill={OC} fillOpacity="0.45" />}
                <text x={CX} y={PT_Y + 14} textAnchor="middle" fontSize="8" fontWeight="700" fill={OC} letterSpacing="2">OUTPUT</text>
                <text x={CX} y={PT_Y + 31} textAnchor="middle" fontSize="13" fontWeight="700" fill={on ? "#fde68a" : "#fbbf24"}>Platform API</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Detail panel */}
      <div style={{ marginTop: "10px", minHeight: "82px", background: "#12121a", border: `1px solid ${active ? active.color + "2a" : "#1e1e2e"}`, borderRadius: "10px", padding: "16px 18px", transition: "border-color .25s" }}>
        {active ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
              <span style={{ fontSize: "0.52rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" as const, padding: "2px 8px", borderRadius: "4px", background: `${active.color}18`, color: active.color }}>{active.layer}</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: active.color }}>{active.label}</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: 0, lineHeight: 1.65 }}>{active.body}</p>
          </>
        ) : (
          <p style={{ fontSize: "0.78rem", color: "#3a3a5c", margin: 0, lineHeight: 1.6, paddingTop: "8px" }}>
            Click any node to see how it was built : data sources, LLM routing, tools, and platform integration.
          </p>
        )}
      </div>

      {/* Build notes */}
      <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {[
          { title: "Why Sonnet 4.6, not Opus?", body: "Opus 4.8 has higher reasoning ceiling but adds 2–4s latency per call : too slow for in-editor suggestions. Haiku 4.5 is fast but drops tool-calling reliability on multi-step chains. Sonnet 4.6 hits the sweet spot: <1s median, structured output that holds, and strong enough reasoning for hypothesis and results tasks. The monitoring loop uses Haiku 4.5 separately : simpler task, lower cost." },
          { title: "Context window strategy", body: "The Context Extractor compresses workspace history with prompt caching before passing to the LLM : reducing tokens by ~60% and ensuring the sample-size calculator uses real account baselines, not defaults." },
          { title: "Human-in-the-loop by design", body: "Every Dev Agent output goes through a confirmation step before writing to the platform. The agent drafts; the PM approves. This preserves accountability while eliminating the grunt work." },
        ].map(({ title, body }) => (
          <div key={title} style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "6px" }}>{title}</div>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hypothesis Scorer ────────────────────────────────────────────────────────

function HypothesisScorer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    score: number;
    checks: { label: string; pass: boolean; tip: string }[];
  } | null>(null);

  const scoreIt = () => {
    const checks = [
      { label: "IF clause: the intervention",        pass: /\bif\b/i.test(text),           tip: "Start with 'If we [change X]...': what exactly are you testing?" },
      { label: "THEN clause: the expected outcome",  pass: /\bthen\b/i.test(text),          tip: "Add '...then [metric] will [increase/decrease]': state the direction." },
      { label: "BECAUSE clause: causal mechanism",   pass: /\bbecause\b/i.test(text),       tip: "End with '...because [reason]': make your causal assumption explicit." },
      { label: "Primary metric named",               pass: /rate|conversion|click|sign.?up|revenue|retention|engagement|impression|session|churn|activation|adoption|purchase|subscri/i.test(text), tip: "Name the specific metric (e.g. 'upgrade rate', 'checkout completion')." },
      { label: "Quantified lift target",             pass: /\d+\s*%|\d+\s*percent/i.test(text), tip: "Add a specific target (e.g. 'by 15%') to make the hypothesis falsifiable." },
    ];
    setResult({ score: checks.filter(c => c.pass).length * 2, checks });
  };

  const sc = result?.score ?? 0;
  const scoreColor = sc >= 8 ? "#10b981" : sc >= 6 ? "#f59e0b" : sc >= 4 ? "#f97316" : "#ef4444";
  const scoreLabel = sc >= 8 ? "Strong: ready to build" : sc >= 6 ? "Good start, tighten the detail" : sc >= 4 ? "Needs work before launch" : "Missing key components";

  return (
    <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "22px", marginTop: "28px" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#f59e0b", marginBottom: "6px" }}>Hypothesis scorer</div>
      <p style={{ fontSize: "0.78rem", color: "#52525b", lineHeight: 1.6, marginBottom: "12px" }}>
        Paste your hypothesis below. A strong one has IF, THEN, BECAUSE, a named metric, and a quantified lift target.
      </p>
      <textarea value={text} onChange={e => { setText(e.target.value); setResult(null); }}
        placeholder={"If we show the Enterprise+ tier preview to Growth-plan users on mobile,\nthen upgrade rate will increase by 15%\nbecause seeing gated capability creates anchoring."}
        style={{ width: "100%", minHeight: "86px", background: "#0d1117", border: "1px solid #2a2a3a", borderRadius: "10px", padding: "12px 14px", color: "#e2e8f0", fontSize: "0.83rem", lineHeight: 1.65, resize: "vertical" as const, fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const }}
        onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; }}
        onBlur={e => { e.target.style.borderColor = "#2a2a3a"; }} />
      <button onClick={scoreIt} disabled={text.trim().length < 10}
        style={{ marginTop: "10px", padding: "9px 22px", borderRadius: "8px", background: text.trim().length >= 10 ? "rgba(245,158,11,0.12)" : "#1a1a2e", border: `1px solid ${text.trim().length >= 10 ? "rgba(245,158,11,0.4)" : "#2a2a3a"}`, color: text.trim().length >= 10 ? "#fbbf24" : "#4a4a68", fontSize: "0.82rem", fontWeight: 700, cursor: text.trim().length >= 10 ? "pointer" : "default", transition: "all .2s" }}>
        Score it
      </button>

      {result && (
        <div style={{ marginTop: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${result.score * 10}%`, background: scoreColor, borderRadius: "4px", transition: "width .6s ease" }} />
            </div>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "1.15rem", fontWeight: 900, color: scoreColor, flexShrink: 0 }}>{result.score}/10</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: scoreColor, flexShrink: 0 }}>{scoreLabel}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "6px" }}>
            {result.checks.map(({ label, pass, tip }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: pass ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.04)", border: `1px solid ${pass ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.12)"}`, borderRadius: "8px", padding: "9px 12px" }}>
                <span style={{ color: pass ? "#10b981" : "#ef4444", fontSize: "0.85rem", flexShrink: 0, marginTop: "1px" }}>{pass ? "✓" : "✗"}</span>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: pass ? "#10b981" : "#9ca3af" }}>{label}</div>
                  {!pass && <div style={{ fontSize: "0.67rem", color: "#6b7280", marginTop: "2px", lineHeight: 1.5 }}>{tip}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Experiment Type Quiz ──────────────────────────────────────────────────────

function ExperimentTypeQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  type ExpType = "ab" | "mvt" | "flag" | "holdout";
  const questions = [
    { q: "What are you changing?", opts: [
        { label: "One element on a page: CTA, headline, layout", value: "single" },
        { label: "Multiple elements at once, to catch interaction effects", value: "multi" },
        { label: "A feature, algorithm, or backend logic", value: "feature" },
        { label: "I want to measure a whole product area over time", value: "holdout" },
    ]},
    { q: "Does the variant need to be consistent across a user's sessions and devices?", opts: [
        { label: "Yes, the same user must always see the same variant", value: "consistent" },
        { label: "No, page-level targeting is fine", value: "page" },
    ]},
    { q: "What's your daily traffic on the target surface?", opts: [
        { label: "Under 1,000 visits/day", value: "low" },
        { label: "1,000 – 10,000 visits/day", value: "medium" },
        { label: "Over 10,000 visits/day", value: "high" },
    ]},
  ];

  const getResult = (ans: string[]): ExpType => {
    if (ans[0] === "holdout") return "holdout";
    if (ans[0] === "feature" || ans[1] === "consistent") return "flag";
    if (ans[0] === "multi") return "mvt";
    return "ab";
  };

  const results: Record<ExpType, { label: string; color: string; tagline: string; why: string; watchout: string }> = {
    ab:      { label: "A/B Test",         color: "#818cf8", tagline: "One variable, two variants",              why: "Single, clear hypothesis with page-level targeting. A/B gives the cleanest, most auditable answer when you have one thing to test.",                                        watchout: "Running multiple A/B tests on the same page simultaneously contaminates results. Use mutual exclusion layers." },
    mvt:     { label: "Multivariate (MVT)", color: "#f59e0b", tagline: "Multiple elements, all combinations",  why: "You need to detect interaction effects, where two changes together outperform either alone. Sequential A/B testing is structurally blind to this.",           watchout: "A 2×2 factorial needs ~4× the traffic of a simple A/B for equal power per cell. Budget the traffic requirement before committing." },
    flag:    { label: "Feature Flag",     color: "#34d399", tagline: "Server-side, session-consistent",        why: "The change lives in backend logic, or needs to be consistent across devices and sessions. SDK-based allocation is the only reliable approach.",                  watchout: "Don't flip a feature flag mid-experiment without resetting the analysis window. Users already assigned stay assigned." },
    holdout: { label: "Holdout Group",    color: "#a5b4fc", tagline: "Long-run counterfactual control",        why: "Measures the cumulative value of a product area over a full quarter, not any single feature. Holdout is the only way to get a portfolio-level number.",    watchout: "Holdout users receive no product improvements for months. Weigh measurement value against user experience cost carefully." },
  };

  const answer = (val: string) => {
    const next = [...answers, val];
    setAnswers(next);
    if (step < questions.length - 1) setStep(step + 1);
    else setDone(true);
  };
  const reset = () => { setStep(0); setAnswers([]); setDone(false); };
  const rec = done ? results[getResult(answers)] : null;

  return (
    <div style={{ marginTop: "28px", background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", overflow: "hidden" }}>
      <div style={{ background: "rgba(245,158,11,0.05)", borderBottom: "1px solid rgba(245,158,11,0.12)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#f59e0b" }}>Which experiment type fits your situation?</span>
        {(step > 0 || done) && <button onClick={reset} style={{ fontSize: "0.65rem", color: "#4a4a68", background: "none", border: "none", cursor: "pointer", padding: 0 }}>← start over</button>}
      </div>

      {!done ? (
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: "6px", marginBottom: "18px" }}>
            {questions.map((_, i) => <div key={i} style={{ height: "3px", flex: 1, borderRadius: "2px", background: i <= step ? "#f59e0b" : "#1e1e2e", transition: "background .25s" }} />)}
          </div>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "14px", lineHeight: 1.45 }}>Q{step + 1} of {questions.length}: {questions[step].q}</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "8px" }}>
            {questions[step].opts.map(({ label, value }) => (
              <button key={value} onClick={() => answer(value)}
                style={{ padding: "12px 16px", borderRadius: "10px", border: "1px solid #2a2a3a", background: "#0d1117", color: "#9ca3af", fontSize: "0.82rem", textAlign: "left" as const, cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = "rgba(245,158,11,0.45)"; (e.currentTarget).style.color = "#f1f5f9"; }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = "#2a2a3a"; (e.currentTarget).style.color = "#9ca3af"; }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : rec && (
        <div style={{ padding: "20px 22px" }}>
          <span style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" as const, padding: "3px 10px", borderRadius: "5px", background: `${rec.color}18`, color: rec.color, border: `1px solid ${rec.color}30` }}>Recommendation</span>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: rec.color, margin: "10px 0 2px" }}>{rec.label}</div>
          <div style={{ fontSize: "0.78rem", color: "#6b7280", marginBottom: "16px" }}>{rec.tagline}</div>
          <div style={{ background: `${rec.color}09`, border: `1px solid ${rec.color}20`, borderRadius: "10px", padding: "13px 16px", marginBottom: "10px" }}>
            <div style={{ fontSize: "0.58rem", fontWeight: 800, color: rec.color, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "5px" }}>Why this type</div>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0, lineHeight: 1.65 }}>{rec.why}</p>
          </div>
          <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.14)", borderRadius: "10px", padding: "11px 14px" }}>
            <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#ef4444", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "4px" }}>Watch out</div>
            <p style={{ fontSize: "0.77rem", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{rec.watchout}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Normal Distribution Visualiser ────────────────────────────────────────────

function NormalDistributionViz() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoRun = useRef(false);
  const vizRef = useRef<HTMLDivElement>(null);

  const run = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(0);
    setRunning(true);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) { clearInterval(timerRef.current!); timerRef.current = null; setRunning(false); }
    }, 38);
  };

  useEffect(() => {
    const el = vizRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAutoRun.current) { hasAutoRun.current = true; setTimeout(run, 600); }
    }, { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const W = 500; const H = 140; const PAD = 24;
  const sigma = 55;
  const scale = (H - 2 * PAD) * sigma * Math.sqrt(2 * Math.PI);
  const normalY = (x: number, mu: number) => H - PAD - Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI)) * scale;
  const sep = (progress / 100) * 56;
  const muC = W / 2 - sep / 2; const muT = W / 2 + sep / 2;
  const buildPath = (mu: number) => {
    const pts: string[] = [];
    for (let x = PAD; x <= W - PAD; x += 4) pts.push(`${x},${normalY(x, mu).toFixed(1)}`);
    return "M " + pts.join(" L ");
  };
  const pVal = Math.max(0.001, 0.88 * Math.exp(-progress * 0.055));
  const significant = pVal < 0.05;
  const impressions = Math.round(progress * 82);
  const GATE = 5000;
  const gateX = PAD + (GATE / 8200) * (W - 2 * PAD);

  return (
    <div ref={vizRef} style={{ background: "#0d1117", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "20px", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap" as const, gap: "10px" }}>
        <div>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "5px" }}>Statistical significance: how the distributions separate</div>
          <div style={{ display: "flex", gap: "16px" }}>
            {[{ l: "Control", c: "#818cf8" }, { l: "Treatment", c: "#10b981" }].map(({ l, c }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "18px", height: "2.5px", background: c, borderRadius: "1px" }} />
                <span style={{ fontSize: "0.64rem", color: "#6b7280" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={run} disabled={running}
          style={{ padding: "7px 18px", borderRadius: "8px", background: running ? "#1a1a2e" : "rgba(16,185,129,0.1)", border: `1px solid ${running ? "#2a2a3a" : "rgba(16,185,129,0.3)"}`, color: running ? "#4a4a68" : "#10b981", fontSize: "0.78rem", fontWeight: 700, cursor: running ? "default" : "pointer", transition: "all .2s", flexShrink: 0 }}>
          {running ? "Accumulating data…" : progress === 0 ? "▶  Run the experiment" : "▶  Run again"}
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="ndv-ctrl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.20" /><stop offset="100%" stopColor="#818cf8" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="ndv-treat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.20" /><stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#1e1e2e" strokeWidth="1" />
        {progress > 0 && <>
          <line x1={gateX} y1={PAD} x2={gateX} y2={H - PAD} stroke="rgba(245,158,11,0.30)" strokeWidth="1" strokeDasharray="3 3" />
          <text x={gateX + 4} y={PAD + 10} fontSize="8" fill="rgba(245,158,11,0.55)" fontWeight="700">5K gate</text>
        </>}
        {significant && <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} rx={4} fill="rgba(16,185,129,0.04)" />}
        <path d={`${buildPath(muC)} L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`} fill="url(#ndv-ctrl)" />
        <path d={`${buildPath(muT)} L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`} fill="url(#ndv-treat)" />
        <path d={buildPath(muC)} fill="none" stroke="#818cf8" strokeWidth="2.2" strokeLinecap="round" />
        <path d={buildPath(muT)} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
        {progress > 0 && <>
          <line x1={muC} y1={PAD + 14} x2={muC} y2={H - PAD} stroke="#818cf8" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 2" />
          <line x1={muT} y1={PAD + 14} x2={muT} y2={H - PAD} stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 2" />
          <text x={muC} y={PAD + 10} textAnchor="middle" fontSize="8" fill="#818cf8" fillOpacity="0.7">μ₀</text>
          <text x={muT} y={PAD + 10} textAnchor="middle" fontSize="8" fill="#10b981" fillOpacity="0.7">μ₁</text>
        </>}
        {progress > 5 && <text x={W - PAD - 2} y={PAD + 15} textAnchor="end" fontSize="12" fontWeight="800" fill={significant ? "#10b981" : pVal < 0.10 ? "#f59e0b" : "#6b7280"}>
          p = {pVal < 0.001 ? "<0.001" : pVal.toFixed(3)}{significant ? " ✓" : ""}
        </text>}
        {significant && <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="10" fontWeight="700" fill="#10b981">Effect is statistically significant</text>}
      </svg>

      <div style={{ marginTop: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "0.6rem", color: "#4a4a68" }}>Impressions accumulating</span>
          <span style={{ fontSize: "0.6rem", fontFamily: "ui-monospace, monospace", color: impressions >= GATE ? "#10b981" : "#f59e0b" }}>
            {impressions.toLocaleString()} {impressions >= GATE ? "✓ past 5K gate" : `/ ${GATE.toLocaleString()} gate`}
          </span>
        </div>
        <div style={{ position: "relative" as const, height: "5px", background: "#1e1e2e", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ position: "absolute" as const, left: `${(GATE / 8200) * 100}%`, top: 0, bottom: 0, width: "1px", background: "rgba(245,158,11,0.5)", zIndex: 1 }} />
          <div style={{ height: "100%", width: `${progress}%`, background: significant ? "linear-gradient(90deg,#818cf8,#10b981)" : progress > 60 ? "#f59e0b" : "#818cf8", borderRadius: "3px", transition: "width .08s linear, background .5s" }} />
        </div>
        {progress > 0 && !significant && <div style={{ marginTop: "5px", fontSize: "0.6rem", color: "#52525b" }}>
          {impressions < GATE ? "Below the 5K qualification gate: analysis here would be underpowered" : "Past the gate, waiting for separation to reach significance"}
        </div>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#e8e8f0" }}>
      <SectionNav />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderColor: "#2a2a3a" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide text-white">The Experiment Playbook</span>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-white">Wahid Tawsif Ratul</span>
            <span className="text-xs text-amber-500">Data Scientist · Product Manager</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 hero-section">
        <div className="grid sm:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-amber-500 mb-5">
              Case Study &nbsp;·&nbsp; Experimentation Platform
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Running{" "}
              <span className="gradient-heading">Meaningful Experiments</span>
            </h1>
            <p className="text-lg text-[#9ca3af] leading-relaxed mb-10 max-w-xl">
              A PM can launch an A/B test in minutes. The hard part is designing it so the result
              is trustworthy, picking the right variables to test, reading the statistics correctly,
              and knowing whether correlation is actually causation. This is that framework : built at a B2B experimentation and digital-experience platform,
              applicable anywhere.
            </p>
            <div className="flex flex-wrap gap-3">
              {["MVT Interaction Analysis", "Interactive Sample Size Calc", "+16% with Dev Agent", "RDD · IV · PSM Causal", "Works Across Industries"].map(label => (
                <span key={label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border stat-glow"
                  style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)", color: "#fbbf24" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden sm:block">
            <MiniPowerCurve />
            <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { val: "80%", label: "Power at 5K impressions" },
                { val: "+16%", label: "AI qualification rate lift" },
                { val: "3", label: "Causal identification strategies" },
                { val: "6", label: "Industries this applies to" },
              ].map(({ val, label }) => (
                <div key={label} style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f59e0b", fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "4px", lineHeight: 1.4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StoryArc />

      <WinShowcase />

      <main className="max-w-6xl mx-auto px-6 pb-32">

        {/* ── Ch01: THE QUESTION ──────────────────────────────────────── */}
        <ChapterBadge
          num="Ch01"
          title="The Question"
          desc="Before you build the experiment, you need to know what you're actually testing and why. Most teams skip this step and end up with an inconclusive result they run a second experiment to resolve."
        />

        <section id="what-to-test">
          <SectionLabel>01: What Should You Test?</SectionLabel>
          <SectionHeading>Think like a PM: feature, pricing, or packaging?</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The best experiment ideas come from a specific business question, not from &ldquo;let&apos;s
            test the button colour.&rdquo; At the platform, we ran experiments across three categories.
            Each one has a different statistical shape, a different metric, and a different minimum
            detectable effect worth caring about.
          </p>
          <HypothesisCards />
          <HypothesisScorer />

          <div className="mt-14">
            <h3 className="font-semibold text-white mb-2 text-sm uppercase tracking-wider">This isn&apos;t just a platform problem</h3>
            <p className="text-[#9ca3af] text-sm leading-relaxed mb-6 max-w-2xl">
              Every industry that makes product decisions has an experimentation problem. The same statistical framework
              applies whether you&apos;re testing a checkout flow at an e-commerce company or an appointment booking UI
              at a healthcare provider. The variables change; the method doesn&apos;t.
            </p>
            <IndustryGrid />
          </div>
        </section>

        <Divider />

        {/* ── Ch02: THE DESIGN ────────────────────────────────────────── */}
        <ChapterTransition from="The Question" to="The Design" />
        <ChapterBadge
          num="Ch02"
          title="The Design"
          desc="A well-designed experiment is mostly decided before the first user sees it. Hypothesis quality, experiment type, traffic volume, and platform choice all lock in before launch , and mistakes here can't be corrected after."
        />

        <section id="design">
          <SectionLabel>02: Choose Your Experiment Type</SectionLabel>
          <SectionHeading>A/B, MVT, Feature Flag, or Holdout?</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The choice of experiment type is a design decision, not just a tool choice. MVT requires
            4x the traffic of a simple A/B test; holdout groups degrade user experience for months.
            Getting this wrong wastes traffic or produces results you can&apos;t act on.
          </p>
          <ExperimentTypeSelector />
          <ExperimentTypeQuiz />
        </section>

        <Divider />

        <section id="sample-size">
          <SectionLabel>03: Sample Size and Statistical Power</SectionLabel>
          <SectionHeading>
            How long does this experiment need to run?
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The most common experiment failure mode isn&apos;t bad analysis : it&apos;s stopping too early.
            Adjust the sliders to match your baseline conversion rate and the smallest lift you care about.
            The calculator tells you whether 5,000 impressions is enough, and how long to run at your
            current traffic volume.
          </p>
          <SampleSizeCalculator />
          <div style={{ marginTop: "20px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "12px", padding: "16px 20px" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#f59e0b", marginBottom: "6px" }}>Why 5,000 is the gate</div>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>
              I co-designed the 5,000-impression threshold with the EXP Product Manager. At a typical 2–5% baseline conversion
              rate, that&apos;s the minimum for 80% power to detect a 10% relative lift at α=0.05 : the industrial standard
              for meaningful business effects. Too low and &ldquo;engaged account&rdquo; is meaningless for CS health scoring;
              too high and legitimate programmes fall out of the metric. 5,000 survived both the stats review and the business review.
            </p>
          </div>
        </section>

        <Divider />

        <section id="run">
          <SectionLabel>04: Setting Up on the Platform</SectionLabel>
          <SectionHeading>Web Experimentation vs Feature Experimentation</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The platform has two distinct products for running experiments, and choosing the wrong one
            creates real problems: client-side tests can&apos;t handle server-side features, and SDK-based
            tests can&apos;t target by URL pattern. Here&apos;s the decision rule I used.
          </p>
          <PlatformProductGuide />

          <div className="mt-12">
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">The lifecycle from design to decision</h3>
            <p className="text-[#9ca3af] text-sm leading-relaxed mb-6 max-w-2xl">
              Every experiment follows the same path. Most teams treat the running phase as the finish line.
              The 5,000-impression gate is where data collection ends and inference begins: before it, you&apos;re guessing.
            </p>
            <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "22px" }}>
              <ExperimentLifecycleFlow />
            </div>
          </div>
        </section>

        <Divider />

        <section id="design-revolution">
          <SectionLabel>04b: The Design Revolution</SectionLabel>
          <SectionHeading>
            How experiment design went from ad-hoc to{" "}
            <span className="text-amber-500">framework-driven</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            Toggle between before and after to see how each dimension of experiment design changed when the
            framework was codified , and how each change connected back to the retention and quality findings.
          </p>
          <DesignRevolution />
        </section>

        <Divider />

        <section id="cross-functional">
          <SectionLabel>04c: Cross-functional Execution</SectionLabel>
          <SectionHeading>
            Four roles, one experiment : who does what
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            Every experiment is a cross-functional contract. The PM defines the question, Analytics validates
            the method, Engineering implements cleanly, and CS turns the result into commercial action. Hover each
            role to see the specific responsibilities at each phase.
          </p>
          <CrossFunctionalMap />
        </section>

        <ChapterTransition from="The Design" to="The Analysis" />

        {/* ── Ch03: THE ANALYSIS ──────────────────────────────────────── */}
        <ChapterBadge
          num="Ch03"
          title="The Analysis"
          desc="Once the data is in, three questions matter: is the effect real, which combination won, and can we trust the number without running it through a causal lens first?"
        />

        <Divider />

        <section id="mvt">
          <SectionLabel>05: Multivariate Testing in Practice</SectionLabel>
          <SectionHeading>
            The case for full factorial design:{" "}
            <span className="text-amber-500">interaction effects are real</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            Two separate A/B tests would have told us the new headline doesn&apos;t work and social proof
            maybe works. The full factorial told us the actual answer. Click the cells to see what each
            combination did, and why sequential A/B testing would have shipped the wrong variant.
          </p>
          <MVTResultsMatrix />
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { title: "Main effects are misleading",     body: "Marginal averages hide interaction structure. The headline &ldquo;didn't work&rdquo; in one condition and worked very well in another : the average looked flat." },
              { title: "Sample size scales with cells",   body: "A 2×2 factorial needs ~4x the traffic of a simple A/B test for equal power per cell. Budget this before committing to MVT." },
              { title: "Fractional factorial is a tradeoff", body: "If traffic is limited, fractional factorial designs test a subset of combinations. You can detect main effects but may miss specific interaction terms." },
            ].map(({ title, body }) => (
              <div key={title} className="p-5 rounded-xl border card-hover" style={{ background: "#12121a", borderColor: "#2a2a3a" }}>
                <h4 className="font-semibold text-white text-sm mb-2">{title}</h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed" dangerouslySetInnerHTML={{ __html: body }} />
              </div>
            ))}
          </div>
        </section>

        <Divider />

        <section id="stats">
          <SectionLabel>06: Frequentist vs Bayesian</SectionLabel>
          <SectionHeading>
            Two frameworks, one experiment : <span className="text-amber-500">different questions answered</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            At the platform, the data model stores both statistical paradigms per experiment × variation × metric.
            The choice isn&apos;t either/or : it&apos;s knowing which question each one answers.
            Toggle between them to see what the same experiment result looks like through each lens.
          </p>
          <StatsFramework />
          <NormalDistributionViz />
        </section>

        <ChapterTransition from="The Analysis" to="AI + Causal" />

        {/* ── Ch04: AI + CAUSAL ───────────────────────────────────────── */}
        <ChapterBadge
          num="Ch04"
          title="AI + Causal"
          desc="Two questions I had to answer for leadership: does AI actually make experiments better, or just faster? And does the retention correlation prove causation, or just correlation?"
        />

        <Divider />

        <section id="ai-accel">
          <SectionLabel>07: How AI Accelerates Every Phase</SectionLabel>
          <SectionHeading>
            Dev Agent + AI Orchestration: before and after
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            When Dev Agent launched, I wanted to know whether it made experiments better , not just
            faster. The acceleration flow below shows what changes at each phase. The quality finding
            below it shows what the data said.
          </p>
          <AIAccelerationFlow />

          <div className="mt-12">
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">The quality finding</h3>
            <p className="text-[#9ca3af] text-sm leading-relaxed mb-6 max-w-2xl">
              58% of standard experiments cleared the quality bar. 74% of Dev Agent-assisted ones did. That&apos;s a quality story,
              not a velocity story. I used this to anchor the commercial argument for the Experimentation→AI Orchestration attach motion.
            </p>
            <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "22px" }}>
              <AIQualityComparison />
            </div>
          </div>
        </section>

        <Divider />

        <section id="dev-agent-erd">
          <SectionLabel>07b: How to Build Dev Agent</SectionLabel>
          <SectionHeading>
            Dev Agent architecture:{" "}
            <span className="text-amber-500">from context to platform action</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            I designed Dev Agent as a tool-calling agent, not a chatbot. It reads four data sources, reasons
            over them with an LLM, dispatches specialised tools in sequence, and writes structured results back
            to the platform API. Click any node to see the implementation detail behind each layer.
          </p>
          <DevAgentERD />
        </section>

        <Divider />

        <section id="dev-agent-capabilities">
          <SectionLabel>07c: Monitor · Customize · Personalize · Optimize</SectionLabel>
          <SectionHeading>
            Four capabilities : one agent architecture
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            When I built Dev Agent, I wanted it to do four things no generic AI assistant does: catch broken
            experiments before analysis runs on them, customise suggestions to the account&apos;s actual history,
            adapt to each PM&apos;s decision style, and improve from every experiment that closes. The flow below
            shows one request cycle. Toggle between the capabilities to see how each one works.
          </p>
          <DevAgentRequestFlow />
          <DevAgentCapabilities />
        </section>

        <Divider />

        <section id="dev-agent-build">
          <SectionLabel>07d: Six-Step Build Guide</SectionLabel>
          <SectionHeading>
            How to build Dev Agent: step by step
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            I sequenced this build in dependency order so each step is independently testable before the next
            begins. The data layer comes first because every LLM call depends on it. The monitoring loop and
            tool suite are the core value. Steps 02–05 carry unchanged into every new industry : only the
            connector and metric names change.
          </p>
          <DevAgentBuildGuide />
        </section>

        <Divider />

        <section id="dev-agent-industries">
          <SectionLabel>07e: Cross-Industry Replication</SectionLabel>
          <SectionHeading>
            Same architecture, six industries :{" "}
            <span className="text-amber-500">swap the connector, keep everything else</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The platform implementation is the reference. Select any industry below to see what changes
            (data connector, metric definitions, compliance guardrails) and what stays identical (the
            monitoring loop, tool suite, personalisation store, and learning loop).
          </p>
          <IndustryAdapter />
        </section>

        <Divider />

        <section id="cohort">
          <SectionLabel>08: Experiment Engagement and Retention</SectionLabel>
          <SectionHeading>
            Qualified experiments predict renewal{" "}
            <span className="text-amber-500">by a lot</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            I built this analysis to answer a question the CS team kept asking: why do some accounts
            run experiments for years while others go quiet after the first quarter? The answer was in
            the experiments themselves.
          </p>
          <RetentionCohortChart />
        </section>

        <Divider />

        <section id="causal">
          <SectionLabel>09: Causal Inference : Is This Actually Causation?</SectionLabel>
          <SectionHeading>
            Here&apos;s the uncomfortable truth about the retention finding
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            Large, well-resourced accounts experiment more and renew more regardless : correlation
            isn&apos;t causation. Before I could put this number in front of leadership, I had to rule out
            the selection bias story. Three identification strategies later, the signal held up.
          </p>

          <div className="mb-10">
            <CausalDAG />
          </div>

          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Directional Dependence</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed mb-5">
                Temporal ordering establishes the causal direction: experiment engagement measured in L90D precedes
                the renewal date. The question is whether engagement predicts future renewal better than renewal
                predicts future experimentation. The data supports the forward direction.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { label: "AI Adoption",         sub: "Dev Agent usage",         color: "#818cf8" },
                  { label: "Experiment Quality",  sub: "Better structure, setup",  color: "#a5b4fc" },
                  { label: "Qualification Rate",  sub: "≥5K impressions gate",     color: "#f59e0b" },
                  { label: "Engagement Metric",   sub: "1+ qualified exp L30D",    color: "#fbbf24" },
                  { label: "Value Realised",       sub: "Product intelligence",     color: "#34d399" },
                  { label: "Renewal",             sub: "Contract outcome",         color: "#10b981" },
                ].map(({ label, sub, color }, i, arr) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "0", padding: "11px 16px", background: "#12121a", borderRadius: i === 0 ? "12px 12px 0 0" : i === arr.length - 1 ? "0 0 12px 12px" : "0", border: "1px solid #2a2a3a", borderTop: i > 0 ? "none" : "1px solid #2a2a3a" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}66`, marginRight: "14px" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9" }}>{label}</div>
                      <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{sub}</div>
                    </div>
                    {i < arr.length - 1 && <div style={{ fontSize: "0.7rem", color: "#4a4a68", fontFamily: "monospace" }}>causes ↓</div>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Multivariate Confounders</h3>
              <div className="space-y-3">
                {[
                  { name: "ARR Tier",        effect: "Large accounts experiment more AND have higher baseline renewal. Creates a spurious correlation even with zero causal effect.",   severity: "High",   color: "#ef4444" },
                  { name: "Account Tenure",  effect: "Long-tenured accounts are more experimentally mature AND more sticky. Partially observable via contract start date.",               severity: "Medium", color: "#f59e0b" },
                  { name: "Product Adoption",effect: "Accounts using more of the product suite have more surfaces to run experiments on : correlated with both engagement and retention.", severity: "Medium", color: "#f59e0b" },
                  { name: "Industry Vertical",effect: "FinTech and e-commerce are structurally more experimentation-mature. Often unobservable at the account level.",                    severity: "Low",    color: "#6b7280" },
                ].map(({ name, effect, severity, color }) => (
                  <div key={name} className="p-4 rounded-xl border" style={{ background: "#12121a", borderColor: "#2a2a3a" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-white">{name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${color}20`, color }}>{severity}</span>
                    </div>
                    <p className="text-xs text-[#9ca3af] leading-relaxed">{effect}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Three identification strategies</h3>
          <CausalApproaches />

          <div style={{ marginTop: "24px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: "12px", padding: "20px 24px" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#10b981", marginBottom: "8px" }}>My conclusion</div>
            <p style={{ fontSize: "0.88rem", color: "#9ca3af", lineHeight: 1.75, margin: 0 }}>
              Three methods, one answer. The RDD is the cleanest: nobody engineers their impression count
              to land at exactly 4,999 or 5,001. That near-randomness around the threshold gives a
              genuinely causal estimate : +12% renewal lift from crossing the qualification gate.
              IV and PSM converged on the same direction. I took this to leadership. The engagement metric
              went into CS health scoring and the Experimentation→AI Orchestration attach motion with that backing.
            </p>
          </div>
        </section>

        <Divider />

        {/* Code */}
        <section id="code">
          <SectionLabel>10: Analysis Code</SectionLabel>
          <SectionHeading>Working scripts on GitHub</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            All analysis runs on synthetic data : same schema shapes as the platform output,
            generated from scratch. Five self-contained Python scripts, runnable with standard scientific libraries.
          </p>
          <PythonCodeExplorer />
          <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="https://github.com/ratul003/experimentation-science" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "10px", textDecoration: "none", color: "#fbbf24", fontSize: "0.85rem", fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              ratul003/experimentation-science
            </a>
            <div style={{ padding: "10px 16px", background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "10px", fontSize: "0.75rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4ade80" }}>✓</span>
              <span>Python 3.11+ · numpy · scipy · pandas</span>
            </div>
          </div>
        </section>

        <Divider />

        {/* Stack */}
        <section id="stack">
          <SectionLabel>11: Tech Stack</SectionLabel>
          <SectionHeading>Tools used</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {EXP_TOOLS.map(({ name, color, cat, svg }) => (
              <div key={name} style={{ background: `${color}10`, border: `1px solid ${color}28`, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column" as const, gap: "10px" }}>
                <div style={{ width: "28px", height: "28px" }}>{svg}</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>{name}</div>
                <div style={{ fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color, opacity: 0.85 }}>{cat}</div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '40px 32px 56px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 5 }}>Wahid Tawsif Ratul</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>© 2026 · Data Scientist · Product Manager</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {[
              { label: 'LinkedIn', href: 'https://linkedin.com/in/wahidratul112296', path: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05C20.5 8.59 22 11 22 14.4V21h-4v-5.86c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V21H9z' },
              { label: 'GitHub', href: 'https://github.com/ratul003', path: 'M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z' },
              { label: 'Medium', href: 'https://medium.com/@wahidtratul', path: 'M2.5 5.5l1.7 2v9.7l-2 2.3h5.4l-2-2.3V8.4l4.9 11.1h.1l4.3-10.5v8.2l-1.3 1.3v.2h6.4v-.2l-1.3-1.3V6.9l1.3-1.3v-.1h-4.5L13 13.9 9.3 5.5z' },
              { label: 'Email', href: 'mailto:wahidtratul@gmail.com', path: '' },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{ color: '#64748b', display: 'inline-flex' }}>
                {s.label === 'Email' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={s.path} /></svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
