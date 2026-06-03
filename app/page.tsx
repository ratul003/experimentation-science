"use client";

import React, { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import SectionNav from "./SectionNav";
import PortfolioLinks from "./PortfolioLinks";

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
    insight: "The control had two tiers. Adding a third tier with a visible-but-locked AI feature created anchoring — customers benchmarked Growth against Enterprise+ and saw clear value in upgrading.",
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
    when: "You have a single, clear hypothesis. One element changes — everything else stays constant. Works for most product decisions.",
    optimizely: "Web Experimentation or Feature Experimentation depending on surface",
    traffic: "Split evenly: 50/50",
    sampleImpact: "Standard — full power calculation applies",
    watchout: "Running multiple A/B tests on the same page simultaneously can contaminate results if users are exposed to both.",
    example: "Test whether changing the primary CTA from 'Start Free Trial' to 'Try It Free' increases sign-ups.",
  },
  {
    id: "mvt",
    label: "Multivariate (MVT)",
    tagline: "Multiple variables, all combinations",
    color: "#f59e0b",
    when: "You want to test multiple elements simultaneously and detect interaction effects — where two changes together outperform either alone.",
    optimizely: "Web Experimentation (Optimizely X supports full factorial and fractional factorial MVT)",
    traffic: "Split across all combinations: 4 variants in 2x2 = 25% each",
    sampleImpact: "Larger: n multiplies by number of cells. A 2x2 requires ~4x the traffic of a simple A/B test for equal power.",
    watchout: "Fractional factorial designs test a subset of combinations to reduce traffic requirements — but can't detect certain interaction effects.",
    example: "Test headline × social proof × CTA colour simultaneously. Required to catch super-additive interactions that sequential A/B tests miss.",
  },
  {
    id: "flag",
    label: "Feature Flag",
    tagline: "Server-side controlled rollout",
    color: "#34d399",
    when: "You're shipping a new feature and want to control rollout percentage, test it on a segment, or do a canary release before full launch.",
    optimizely: "Feature Experimentation — SDK-based, works across any platform (web, mobile, server)",
    traffic: "Configurable: 0–100% rollout with targeting rules (user attributes, segments, environments)",
    sampleImpact: "Same power principles apply — but you control exposure exactly via SDK, so allocation is more precise than client-side cookie-based",
    watchout: "Feature flags persist across sessions. Users assigned to a variant stay in it. Don't flip flags mid-experiment without resetting the analysis.",
    example: "Roll out AI experiment suggestions to 10% of accounts, measure Dev Agent activation rate, expand to 50% if qualified.",
  },
  {
    id: "holdout",
    label: "Holdout Group",
    tagline: "Long-run counterfactual control",
    color: "#a5b4fc",
    when: "You want to measure the cumulative value of an entire product area or feature portfolio over time — not a single feature in isolation.",
    optimizely: "Feature Experimentation with a persistent exclusion group — Optimizely supports holdout layers for exactly this use case",
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
            { label: "Optimizely product",     value: t.optimizely,    color: "#9ca3af" },
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
            Power curve — your parameters
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

// ── Optimizely product decision guide ─────────────────────────────────────────

function OptimizelyProductGuide() {
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

  const cells = [
    { id: "00", headline: "Original",     social: "No proof",      rate: 3.1, lift: 0,    p: 1.000, significant: false, winner: false,  note: "Control — baseline 3.1% conversion" },
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
                { field: "Rate variance", note: "Per-variation — feeds power calculation for future planning." },
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
                { field: "Expected loss", note: "Cost of choosing wrong variant — drives the stop decision." },
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
              Bayesian is better for low-traffic experiments and sequential decision-making — you can update the posterior with new data without inflating error rates. It answers: &ldquo;how likely is the variation winning?&rdquo;
            </p>
            <div style={{ background: "#0d1117", borderRadius: "8px", padding: "10px 12px", border: "1px solid #1e1e2e" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "5px" }}>Key advantage</div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0, lineHeight: 1.55 }}>
                Expected loss enables continuous monitoring without penalty. Stop when the cost of being wrong drops below your business threshold — no fixed sample size required.
              </p>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: "12px", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "10px", padding: "12px 16px" }}>
        <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>
          At Optimizely, the platform stores <strong style={{ color: "#fbbf24" }}>both paradigms side by side</strong> per experiment × variation × metric.
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
      with:    ["Opal agent alerts when power is reached", "Automated data quality checks flag anomalies early", "Interaction effects surfaced in MVT analysis", "Sequential validity enforced — no early peeking penalty"],
      aiTool: "Opal Analytics",
      lift: "Earlier catch rate on bad experiments",
    },
    {
      phase: "Decide",
      without: ["Read statistical output and interpret manually", "Write results summary for stakeholders", "Decide next test from gut feel", "Manually archive experiment learnings"],
      with:    ["Opal explains results in plain language with confidence framing", "Auto-generates stakeholder summary pushed to Coda", "Recommends next hypothesis based on experiment history", "Learning is stored, searchable, and feeds future power calculations"],
      aiTool: "Opal Analytics",
      lift: "2 days → same day decision",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: "12px", paddingBottom: "8px", borderBottom: "1px solid #2a2a3a" }}>
        <div />
        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#ef4444", textAlign: "center" as const }}>Without AI</div>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#10b981", textAlign: "center" as const }}>With AI (Dev Agent + Opal)</div>
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
        Qualification rate — % of experiments clearing ≥5K impressions
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
        <strong style={{ color: "#10b981" }}>+16% qualification rate lift</strong> — 58% of standard experiments cleared the quality bar; 74% of Dev Agent-assisted ones did. That&apos;s not a velocity story: it&apos;s a quality story. I used this to anchor the commercial argument that selling Opal into Experimentation accounts made their core product work better.
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
          <strong style={{ color: "#10b981" }}>+49% renewal rate</strong> from no engagement to highest tier. Controlled for ARR and tenure via logistic regression — experiment engagement remains a statistically significant predictor of renewal after confounders removed (χ²=38.7, p&lt;0.001).
        </span>
      </div>
    </div>
  );
}

// ── Causal DAG ────────────────────────────────────────────────────────────────

function CausalDAG() {
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
  return (
    <div style={{ background: "#0d1117", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "20px", overflowX: "auto" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "14px" }}>
        Causal DAG: backdoor paths from confounders
      </div>
      <svg viewBox="0 0 780 172" width="100%" style={{ display: "block", minWidth: "580px" }}>
        {confounders.map((cf) =>
          cf.targets.map((tx) => (
            <line key={`${cf.x}-${tx}`} x1={cf.x + 56} y1={cf.y + 28} x2={tx + 56} y2={nodeY}
              stroke="rgba(245,158,11,0.45)" strokeWidth="1.2" strokeDasharray="4 3" />
          ))
        )}
        {chain.slice(0, -1).map((node, i) => (
          <g key={`arr-${i}`}>
            <defs><marker id={`arrow-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b" opacity="0.7" />
            </marker></defs>
            <line x1={node.x + nodeW} y1={nodeY + nodeH / 2} x2={chain[i + 1].x - 2} y2={nodeY + nodeH / 2}
              stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" markerEnd={`url(#arrow-${i})`} />
          </g>
        ))}
        {confounders.map((cf) => (
          <g key={cf.label}>
            <rect x={cf.x} y={cf.y} width="112" height="36" rx="7" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />
            <text x={cf.x + 56} y={cf.y + 13} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fbbf24">{cf.label}</text>
            <text x={cf.x + 56} y={cf.y + 26} textAnchor="middle" fontSize="8" fill="#78716c">{cf.sub}</text>
          </g>
        ))}
        {chain.map(({ label, sub, x, color }) => (
          <g key={label}>
            <rect x={x} y={nodeY} width={nodeW} height={nodeH} rx="9" fill={`${color}10`} stroke={`${color}40`} strokeWidth="1.2" />
            <text x={x + nodeW / 2} y={nodeY + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{label}</text>
            <text x={x + nodeW / 2} y={nodeY + 34} textAnchor="middle" fontSize="8.5" fill="#6b7280">{sub}</text>
          </g>
        ))}
        <line x1="20" y1="162" x2="50" y2="162" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
        <text x="55" y="165" fontSize="8" fill="#6b7280">Causal path</text>
        <line x1="130" y1="162" x2="160" y2="162" stroke="rgba(245,158,11,0.45)" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x="165" y="165" fontSize="8" fill="#6b7280">Confounder (backdoor path)</text>
      </svg>
      <p style={{ fontSize: "0.72rem", color: "#6b7280", lineHeight: 1.6, marginTop: "12px", marginBottom: 0 }}>
        Large accounts (high ARR) run more experiments AND have higher baseline renewal rates — creating a spurious correlation. Causal inference methods close these backdoor paths before the retention finding can be taken to leadership.
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
      desc: "The 5K impression threshold creates a sharp discontinuity. Accounts just above and just below the gate are near-identical in sophistication — any jump in renewal probability at the cutoff is causal, not confounded.",
      detail: [
        { title: "Running variable", body: "Experiment impression count, centred at 5,000." },
        { title: "Treatment", body: "Crossing the threshold: experiment becomes 'qualified' and enters the engagement metric." },
        { title: "Local average effect (LATE)", body: "Accounts just above 5K renew at +12% higher rate than accounts just below, within a ±1,500-impression bandwidth." },
        { title: "Assumption", body: "No precise manipulation of impression counts around the threshold — verified by checking for bunching in the impression density near 5K." },
      ],
    },
    {
      id: "iv", short: "IV / 2SLS", label: "Instrumental Variables", pill: "Endogeneity fix", pillColor: "rgba(245,158,11,0.15)", pillText: "#fbbf24",
      desc: "Dev Agent is used as an instrument: it raises qualification rates (relevance) but has no direct path to renewal other than through experiment quality (exclusion restriction). Two-stage least squares isolates the causal effect.",
      detail: [
        { title: "Instrument", body: "AI assistance flag (Dev Agent used: yes/no)." },
        { title: "First stage", body: "AI assistance → qualification rate. F-stat > 10 confirms strong instrument relevance." },
        { title: "IV vs OLS", body: "IV estimate is ~30% smaller than naive OLS — confirming upward confounding bias from raw experiment counts." },
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
    desc: "2x2 full factorial MVT — interaction effect detection + counterfactual A/B comparison",
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
    desc: "Beta-Binomial conjugate model — posterior probability, credible intervals, expected loss",
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#e8e8f0" }}>
      <SectionNav />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderColor: "#2a2a3a" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide text-white">Experimentation Science</span>
          <span className="text-sm text-[#6b7280] hidden sm:block">
            Wahid Tawsif Ratul &nbsp;·&nbsp; <span className="text-amber-500">Product Analytics Engineer</span>
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 hero-section">
        <div className="grid sm:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-amber-500 mb-5">
              Case Study &nbsp;·&nbsp; Optimizely
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Running Experiments{" "}
              <span className="gradient-heading">That Mean Something</span>
            </h1>
            <p className="text-lg text-[#9ca3af] leading-relaxed mb-10 max-w-xl">
              A PM can launch an A/B test in minutes. The hard part is designing it so the result
              is trustworthy, picking the right variables to test, reading the statistics correctly,
              and knowing whether correlation is actually causation. This is that framework — built at Optimizely,
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

      <main className="max-w-6xl mx-auto px-6 pb-32">

        {/* ── Ch01: THE QUESTION ──────────────────────────────────────── */}
        <ChapterBadge
          num="Ch01"
          title="The Question"
          desc="Before you build the experiment, you need to know what you're actually testing and why. Most teams skip this step and end up with an inconclusive result they run a second experiment to resolve."
        />

        <section id="what-to-test">
          <SectionLabel>01 — What Should You Test?</SectionLabel>
          <SectionHeading>Think like a PM: feature, pricing, or packaging?</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The best experiment ideas come from a specific business question, not from &ldquo;let&apos;s
            test the button colour.&rdquo; At Optimizely, we ran experiments across three categories.
            Each one has a different statistical shape, a different metric, and a different minimum
            detectable effect worth caring about.
          </p>
          <HypothesisCards />

          <div className="mt-14">
            <h3 className="font-semibold text-white mb-2 text-sm uppercase tracking-wider">This isn&apos;t just an Optimizely problem</h3>
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
          desc="A well-designed experiment is mostly decided before the first user sees it. Hypothesis quality, experiment type, traffic volume, and platform choice all lock in before launch — and mistakes here can't be corrected after."
        />

        <section id="design">
          <SectionLabel>02 — Choose Your Experiment Type</SectionLabel>
          <SectionHeading>A/B, MVT, Feature Flag, or Holdout?</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The choice of experiment type is a design decision, not just a tool choice. MVT requires
            4x the traffic of a simple A/B test; holdout groups degrade user experience for months.
            Getting this wrong wastes traffic or produces results you can&apos;t act on.
          </p>
          <ExperimentTypeSelector />
        </section>

        <Divider />

        <section id="sample-size">
          <SectionLabel>03 — Sample Size and Statistical Power</SectionLabel>
          <SectionHeading>
            How long does this experiment need to run?
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The most common experiment failure mode isn&apos;t bad analysis — it&apos;s stopping too early.
            Adjust the sliders to match your baseline conversion rate and the smallest lift you care about.
            The calculator tells you whether 5,000 impressions is enough, and how long to run at your
            current traffic volume.
          </p>
          <SampleSizeCalculator />
          <div style={{ marginTop: "20px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "12px", padding: "16px 20px" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#f59e0b", marginBottom: "6px" }}>Why 5,000 is the gate</div>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>
              I co-designed the 5,000-impression threshold with the EXP Product Manager. At a typical 2–5% baseline conversion
              rate, that&apos;s the minimum for 80% power to detect a 10% relative lift at α=0.05 — the industrial standard
              for meaningful business effects. Too low and &ldquo;engaged account&rdquo; is meaningless for CS health scoring;
              too high and legitimate programmes fall out of the metric. 5,000 survived both the stats review and the business review.
            </p>
          </div>
        </section>

        <Divider />

        <section id="run">
          <SectionLabel>04 — Setting Up in Optimizely</SectionLabel>
          <SectionHeading>Web Experimentation vs Feature Experimentation</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            Optimizely has two distinct products for running experiments, and choosing the wrong one
            creates real problems: client-side tests can&apos;t handle server-side features, and SDK-based
            tests can&apos;t target by URL pattern. Here&apos;s the decision rule I used.
          </p>
          <OptimizelyProductGuide />

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

        <ChapterTransition from="The Design" to="The Analysis" />

        {/* ── Ch03: THE ANALYSIS ──────────────────────────────────────── */}
        <ChapterBadge
          num="Ch03"
          title="The Analysis"
          desc="Once the data is in, three questions matter: is the effect real, which combination won, and can we trust the number without running it through a causal lens first?"
        />

        <Divider />

        <section id="mvt">
          <SectionLabel>05 — Multivariate Testing in Practice</SectionLabel>
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
              { title: "Main effects are misleading",     body: "Marginal averages hide interaction structure. The headline &ldquo;didn't work&rdquo; in one condition and worked very well in another — the average looked flat." },
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
          <SectionLabel>06 — Frequentist vs Bayesian</SectionLabel>
          <SectionHeading>
            Two frameworks, one experiment — <span className="text-amber-500">different questions answered</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            At Optimizely, the data model stores both statistical paradigms per experiment × variation × metric.
            The choice isn&apos;t either/or — it&apos;s knowing which question each one answers.
            Toggle between them to see what the same experiment result looks like through each lens.
          </p>
          <StatsFramework />
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
          <SectionLabel>07 — How AI Accelerates Every Phase</SectionLabel>
          <SectionHeading>
            Dev Agent + Opal: before and after
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            When Dev Agent launched, I wanted to know whether it made experiments better — not just
            faster. The acceleration flow below shows what changes at each phase. The quality finding
            below it shows what the data said.
          </p>
          <AIAccelerationFlow />

          <div className="mt-12">
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">The quality finding</h3>
            <p className="text-[#9ca3af] text-sm leading-relaxed mb-6 max-w-2xl">
              58% of standard experiments cleared the quality bar. 74% of Dev Agent-assisted ones did. That&apos;s a quality story,
              not a velocity story. I used this to anchor the commercial argument for the Experimentation→Opal attach motion.
            </p>
            <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "22px" }}>
              <AIQualityComparison />
            </div>
          </div>
        </section>

        <Divider />

        <section id="cohort">
          <SectionLabel>08 — Experiment Engagement and Retention</SectionLabel>
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
          <SectionLabel>09 — Causal Inference: Is This Actually Causation?</SectionLabel>
          <SectionHeading>
            Here&apos;s the uncomfortable truth about the retention finding
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            Large, well-resourced accounts experiment more and renew more regardless — correlation
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
                  { name: "Product Adoption",effect: "Accounts using more Optimizely products have more surfaces to run experiments on — correlated with both engagement and retention.", severity: "Medium", color: "#f59e0b" },
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
              genuinely causal estimate — +12% renewal lift from crossing the qualification gate.
              IV and PSM converged on the same direction. I took this to leadership. The engagement metric
              went into CS health scoring and the Experimentation→Opal attach motion with that backing.
            </p>
          </div>
        </section>

        <Divider />

        {/* Code */}
        <section id="code">
          <SectionLabel>10 — Analysis Code</SectionLabel>
          <SectionHeading>Working scripts on GitHub</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            All analysis runs on synthetic data — same schema shapes as the Optimizely platform output,
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
          <SectionLabel>11 — Tech Stack</SectionLabel>
          <SectionHeading>Tools used</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {[
              { name: "Snowflake",        color: "#29b5e8", cat: "Warehouse"     },
              { name: "Optimizely",       color: "#f59e0b", cat: "Platform"      },
              { name: "Python",           color: "#3776AB", cat: "Analysis"      },
              { name: "SQL",              color: "#fbbf24", cat: "Querying"      },
              { name: "Bayesian Stats",   color: "#8b5cf6", cat: "Inference"     },
              { name: "Causal Inference", color: "#10b981", cat: "Identification" },
            ].map(({ name, color, cat }) => (
              <div key={name} style={{ background: `${color}10`, border: `1px solid ${color}28`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column" as const, gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>{name}</div>
                <div style={{ fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color, opacity: 0.85 }}>{cat}</div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: "#2a2a3a" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start justify-between gap-6">
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "4px" }}>
            <PortfolioLinks />
            <div className="text-sm text-[#6b7280]">
              Wahid Tawsif Ratul &nbsp;·&nbsp; Product Analytics Engineer at Optimizely
            </div>
          </div>
          <a href="https://github.com/ratul003/experimentation-science" target="_blank" rel="noopener noreferrer"
            style={{ borderColor: "#2a2a3a" }}
            className="flex items-center gap-2 border rounded-lg px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:border-amber-700 transition-colors flex-shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </footer>

    </div>
  );
}
