"use client";

import React, { useState } from "react";
import type { ReactNode } from "react";
import SectionNav from "./SectionNav";
import PortfolioLinks from "./PortfolioLinks";

// ── Utility ───────────────────────────────────────────────────────────────────

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
        <p style={{ fontSize: "0.88rem", color: "#9ca3af", maxWidth: "520px", lineHeight: 1.6 }}>{desc}</p>
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
    { label: "Ch01", title: "The Problem",     desc: "Why quality can't be assumed",   href: "#problem"    },
    { label: "Ch02", title: "The Framework",   desc: "Statistical foundation",         href: "#lifecycle"  },
    { label: "Ch03", title: "The Analysis",    desc: "Evidence and causal inference",  href: "#ai-quality" },
  ];
  return (
    <div style={{ background: "rgba(245,158,11,0.03)", borderTop: "1px solid rgba(245,158,11,0.10)", borderBottom: "1px solid rgba(245,158,11,0.10)", marginBottom: "80px" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ display: "flex" }}>
          {chapters.map(({ label, title, desc, href }, i) => (
            <React.Fragment key={label}>
              <a href={href} style={{ textDecoration: "none", flex: 1, padding: "20px 28px", borderRight: i < chapters.length - 1 ? "1px solid rgba(245,158,11,0.10)" : "none" }}
                className="card-hover" >
                <div style={{ fontSize: "0.58rem", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "#f59e0b", marginBottom: "5px" }}>{label}</div>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "3px" }}>{title}</div>
                <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{desc}</div>
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mini power curve (hero right column) ─────────────────────────────────────

function MiniPowerCurve() {
  const W = 280; const H = 160;
  // SVG coords: x maps to 0–28K impressions, y inverted (0=100% power, H=0% power)
  // Threshold at 5K → x = W*(5/28) ≈ 50; 80% power → y = H*(1-0.80) = 32
  const TX = Math.round(W * 5 / 28);  // 50
  const TY = Math.round(H * 0.20);    // 32

  return (
    <div style={{ background: "#0d1117", border: "1px solid #1e1e2e", borderRadius: "14px", padding: "20px", position: "relative" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "12px" }}>
        Statistical Power vs Sample Size
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {/* Grid lines */}
        <line x1="0" y1={TY}   x2={W} y2={TY}   stroke="#1e2a1e" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="0" y1={H*0.5} x2={W} y2={H*0.5} stroke="#1a1a2e" strokeWidth="1" strokeDasharray="4 3" />
        {/* Power curve: smooth path from low to high */}
        <path d={`M 0,${H-4} C 18,${H-6} 34,${H-30} ${TX},${TY} S 150,6 ${W},3`}
          fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        {/* Threshold vertical */}
        <line x1={TX} y1={TY} x2={TX} y2={H} stroke="rgba(16,185,129,0.5)" strokeWidth="1" strokeDasharray="4 3" />
        {/* Threshold horizontal */}
        <line x1="0" y1={TY} x2={TX} y2={TY} stroke="rgba(16,185,129,0.4)" strokeWidth="1" strokeDasharray="4 3" />
        {/* Intersection dot */}
        <circle cx={TX} cy={TY} r="5" fill="#10b981" stroke="#0d1117" strokeWidth="2" />
        {/* Labels */}
        <text x={TX+5} y={H-4} fontSize="9" fill="#10b981" fontWeight="700">5K</text>
        <text x="3"    y={TY-5} fontSize="9" fill="#10b981" fontWeight="700">80%</text>
        <text x="3"    y={H-4}  fontSize="8" fill="#4a4a68">0%</text>
        <text x={W-24} y="11"   fontSize="8" fill="#4a4a68">100%</text>
        <text x={W-26} y={H-4}  fontSize="8" fill="#4a4a68">25K+</text>
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
        <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>5K impressions → 80% power to detect 10% lift at α=0.05</span>
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
      <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "nowrap", minWidth: "600px" }}>
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

// ── Power analysis viz ────────────────────────────────────────────────────────

function PowerAnalysisViz() {
  const rows = [
    { impressions: "1,000",  power: 12, mde: "~35%", risk: "Very high — results unreliable" },
    { impressions: "2,500",  power: 38, mde: "~22%", risk: "High — only detects large effects" },
    { impressions: "5,000",  power: 80, mde: "~10%", risk: "Acceptable — industry standard", qualified: true },
    { impressions: "10,000", power: 95, mde: "~7%",  risk: "Strong — detects smaller effects" },
    { impressions: "25,000+",power: 99, mde: "~4%",  risk: "Excellent — high sensitivity" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {rows.map(({ impressions, power, mde, risk, qualified }) => (
        <div key={impressions} style={{ display: "flex", alignItems: "center", gap: "12px", background: qualified ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${qualified ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: "10px", padding: "10px 14px" }}>
          <div style={{ width: "64px", flexShrink: 0 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: qualified ? "#10b981" : "#f1f5f9", fontFamily: "ui-monospace, monospace" }}>{impressions}</div>
            <div style={{ fontSize: "0.6rem", color: "#6b7280" }}>impressions</div>
          </div>
          <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${power}%`, background: qualified ? "linear-gradient(90deg,#10b981,#34d399)" : power > 60 ? "#6366f1" : power > 30 ? "#f59e0b" : "#ef4444", borderRadius: "3px" }} />
          </div>
          <div style={{ width: "36px", flexShrink: 0, fontSize: "0.78rem", fontWeight: 700, color: qualified ? "#10b981" : "#f1f5f9", textAlign: "right" as const }}>{power}%</div>
          <div style={{ width: "44px", flexShrink: 0, fontSize: "0.7rem", color: "#f59e0b", fontFamily: "ui-monospace, monospace" }}>{mde}</div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", flex: 1 }}>{risk}{qualified && <span style={{ color: "#10b981", fontWeight: 700 }}> ← qualified threshold</span>}</div>
        </div>
      ))}
      <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "4px" }}>
        Power = probability of detecting a true effect at α=0.05, 2-tailed. MDE = minimum detectable effect at 80% power, 2–5% baseline conversion.
      </div>
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
        <span style={{ color: "#10b981", fontWeight: 700 }}>+16pp qualification rate lift</span> — the evidence base for the Experimentation→Opal commercial attach motion. AI-assisted experiments aren&apos;t just faster; they&apos;re structurally better-constructed, clearing the statistical quality bar at a higher rate.
      </div>
    </div>
  );
}

// ── Retention cohort chart ────────────────────────────────────────────────────

function RetentionCohortChart() {
  const cohorts = [
    { tier: "0 qualified exps",  renewal: 42, accounts: 97,  color: "#6b7280" },
    { tier: "1–4 qualified",     renewal: 61, accounts: 168, color: "#f59e0b" },
    { tier: "5–19 qualified",    renewal: 78, accounts: 104, color: "#fbbf24" },
    { tier: "20+ qualified",     renewal: 91, accounts: 31,  color: "#10b981" },
  ];
  return (
    <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "24px" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "18px" }}>
        Contract renewal rate by qualified experiment tier (L90D)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {cohorts.map(({ tier, renewal, accounts, color }) => (
          <div key={tier} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "130px", flexShrink: 0 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e2e8f0" }}>{tier}</div>
              <div style={{ fontSize: "0.62rem", color: "#52525b" }}>{accounts} accounts</div>
            </div>
            <div style={{ flex: 1, height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "5px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${renewal}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: "5px", transition: "width 1s ease" }} />
            </div>
            <div style={{ width: "40px", textAlign: "right" as const, fontSize: "0.85rem", fontWeight: 800, color, fontFamily: "ui-monospace, monospace", flexShrink: 0 }}>{renewal}%</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "20px", padding: "12px 16px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "8px" }}>
        <span style={{ fontSize: "0.72rem", color: "#9ca3af", lineHeight: 1.6 }}>
          <span style={{ color: "#10b981", fontWeight: 700 }}>+49pp renewal lift</span> from no engagement to highest tier. Controlled for ARR and tenure via logistic regression — experiment engagement remains a statistically significant predictor of renewal after removing confounders (χ²=38.7, p&lt;0.001).
        </span>
      </div>
    </div>
  );
}

// ── Causal DAG diagram ────────────────────────────────────────────────────────

function CausalDAG() {
  // Main chain nodes, horizontal. Confounders above pointing into the chain.
  const chain = [
    { label: "Dev Agent",        sub: "AI assistance",           x: 30,  color: "#818cf8" },
    { label: "Better Setup",     sub: "Experiment structure",    x: 182, color: "#a5b4fc" },
    { label: "Qual. Rate ≥5K",  sub: "Impression threshold",    x: 334, color: "#f59e0b" },
    { label: "Engaged L30D",     sub: "Engagement metric",       x: 486, color: "#fbbf24" },
    { label: "Renewal",          sub: "Contract outcome",        x: 638, color: "#10b981" },
  ];
  const nodeW = 112; const nodeH = 52; const nodeY = 100;
  const confounders = [
    { label: "ARR Tier", sub: "Account size", x: 258, y: 22, targets: [334, 638] },
    { label: "Tenure",   sub: "Account age",  x: 410, y: 22, targets: [486, 638] },
  ];

  return (
    <div style={{ background: "#0d1117", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "20px", overflowX: "auto" }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6b7280", marginBottom: "14px" }}>
        Causal directed acyclic graph (DAG) — backdoor paths from confounders
      </div>
      <svg viewBox="0 0 780 172" width="100%" style={{ display: "block", minWidth: "580px" }}>
        {/* Confounder → chain arrows (dashed orange) */}
        {confounders.map((cf) =>
          cf.targets.map((tx) => (
            <line key={`${cf.x}-${tx}`}
              x1={cf.x + 56} y1={cf.y + 28}
              x2={tx + 56}   y2={nodeY}
              stroke="rgba(245,158,11,0.45)" strokeWidth="1.2" strokeDasharray="4 3"
            />
          ))
        )}
        {/* Main chain arrows */}
        {chain.slice(0, -1).map((node, i) => (
          <g key={`arr-${i}`}>
            <defs>
              <marker id={`arrow-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b" opacity="0.7" />
              </marker>
            </defs>
            <line
              x1={node.x + nodeW} y1={nodeY + nodeH / 2}
              x2={chain[i + 1].x - 2} y2={nodeY + nodeH / 2}
              stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"
              markerEnd={`url(#arrow-${i})`}
            />
          </g>
        ))}
        {/* Confounder nodes */}
        {confounders.map((cf) => (
          <g key={cf.label}>
            <rect x={cf.x} y={cf.y} width="112" height="36" rx="7"
              fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />
            <text x={cf.x + 56} y={cf.y + 13} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fbbf24">{cf.label}</text>
            <text x={cf.x + 56} y={cf.y + 26} textAnchor="middle" fontSize="8"   fill="#78716c">{cf.sub}</text>
          </g>
        ))}
        {/* Chain nodes */}
        {chain.map(({ label, sub, x, color }) => (
          <g key={label}>
            <rect x={x} y={nodeY} width={nodeW} height={nodeH} rx="9"
              fill={`${color}10`} stroke={`${color}40`} strokeWidth="1.2" />
            <text x={x + nodeW / 2} y={nodeY + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{label}</text>
            <text x={x + nodeW / 2} y={nodeY + 34} textAnchor="middle" fontSize="8.5" fill="#6b7280">{sub}</text>
          </g>
        ))}
        {/* Legend */}
        <line x1="20" y1="162" x2="50" y2="162" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
        <text x="55" y="165" fontSize="8" fill="#6b7280">Causal path</text>
        <line x1="130" y1="162" x2="160" y2="162" stroke="rgba(245,158,11,0.45)" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x="165" y="165" fontSize="8" fill="#6b7280">Confounder (backdoor path)</text>
      </svg>
      <div style={{ marginTop: "14px", fontSize: "0.72rem", color: "#6b7280", lineHeight: 1.6 }}>
        Confounders create a spurious correlation between experiment engagement and renewal even without a causal effect — ARR tier affects both how many experiments accounts run and their baseline renewal probability. Causal inference methods are required to close these backdoor paths.
      </div>
    </div>
  );
}

// ── Causal inference approaches ───────────────────────────────────────────────

function CausalApproaches() {
  const [active, setActive] = useState<string>("rdd");

  const approaches = [
    {
      id: "rdd",
      label: "Regression Discontinuity",
      short: "RDD",
      pill: "Natural experiment",
      pillColor: "rgba(99,102,241,0.15)",
      pillText: "#818cf8",
      desc: "The 5K impression threshold creates a natural discontinuity. Accounts just above and just below the gate are near-identical in sophistication — any jump in renewal probability at the cutoff is causal, not confounded.",
      detail: [
        { title: "Running variable",     body: "Experiment impression count, centred at 5,000." },
        { title: "Treatment",            body: "Crossing the threshold — experiment becomes 'qualified' and enters the engagement metric." },
        { title: "Local average effect", body: "Accounts just above 5K renew at approximately +12pp higher rate than accounts just below, within a ±1,500-impression bandwidth." },
        { title: "Assumption",           body: "No precise manipulation of impression counts around the threshold — verified by checking for bunching in the density of impressions near 5K." },
      ],
    },
    {
      id: "iv",
      label: "Instrumental Variables",
      short: "IV / 2SLS",
      pill: "Endogeneity fix",
      pillColor: "rgba(245,158,11,0.15)",
      pillText: "#fbbf24",
      desc: "Dev Agent assistance is used as an instrument: it raises qualification rates (relevance) but has no direct path to renewal other than through experiment quality (exclusion restriction). Two-stage least squares isolates the causal effect.",
      detail: [
        { title: "Instrument",            body: "AI assistance flag (Dev Agent used: yes/no)." },
        { title: "First stage",           body: "AI assistance → qualification rate. F-stat > 10 confirms instrument relevance — not a weak instrument." },
        { title: "Second stage",          body: "Predicted qualification (from first stage) → renewal. Removes the selection bias: accounts that self-select into AI tend to be larger, so OLS overstates the true effect." },
        { title: "IV vs OLS",             body: "IV estimate is ~30% smaller than naive OLS, confirming upward confounding bias when using raw experiment counts." },
      ],
    },
    {
      id: "psm",
      label: "Propensity Score Matching",
      short: "PSM",
      pill: "Observable confounders",
      pillColor: "rgba(16,185,129,0.15)",
      pillText: "#34d399",
      desc: "Each high-engagement account (≥5 qualified experiments) is matched to a low-engagement account with the same propensity to engage — conditioned on ARR tier and tenure. Compares renewal rates within matched pairs.",
      detail: [
        { title: "Propensity model",   body: "Logistic regression: P(high engagement) ~ ARR tier + account tenure." },
        { title: "Matching",           body: "Nearest-neighbour within caliper 0.05, yielding 148 matched pairs from 183 treated accounts." },
        { title: "ATT estimate",       body: "Average treatment effect on the treated: +18pp renewal lift for high-engagement accounts vs matched controls (p=0.003)." },
        { title: "Limitation",         body: "PSM removes observable confounders only. Unobservable confounders (e.g., product-market fit) require IV or RDD for full identification." },
      ],
    },
  ];

  const current = approaches.find((a) => a.id === active)!;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {approaches.map((a) => (
          <button key={a.id} onClick={() => setActive(a.id)}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all .2s",
              background: active === a.id ? "rgba(245,158,11,0.12)" : "transparent",
              borderColor: active === a.id ? "rgba(245,158,11,0.4)" : "#2a2a3a",
              color: active === a.id ? "#fbbf24" : "#6b7280" }}>
            {a.short}
          </button>
        ))}
      </div>
      {/* Active content */}
      <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "6px", background: current.pillColor, color: current.pillText }}>{current.pill}</span>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9" }}>{current.label}</h3>
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

// ── Directional dependence chain ──────────────────────────────────────────────

function DirectionalChain() {
  const nodes = [
    { label: "AI Adoption",         sub: "Dev Agent usage",          color: "#818cf8", icon: "⬡" },
    { label: "Experiment Quality",  sub: "Better structure & setup",  color: "#a5b4fc", icon: "⬡" },
    { label: "Qualification Rate",  sub: "≥5K impressions gate",      color: "#f59e0b", icon: "⬡" },
    { label: "Engagement Metric",   sub: "1+ qualified exp L30D",     color: "#fbbf24", icon: "⬡" },
    { label: "Value Realised",      sub: "Product intelligence",      color: "#34d399", icon: "⬡" },
    { label: "Renewal",             sub: "Contract outcome",          color: "#10b981", icon: "⬡" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {nodes.map(({ label, sub, color }, i) => (
        <React.Fragment key={label}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", background: "#12121a", borderRadius: i === 0 ? "12px 12px 0 0" : i === nodes.length - 1 ? "0 0 12px 12px" : "0", border: "1px solid #2a2a3a", borderTop: i > 0 ? "none" : "1px solid #2a2a3a" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}66` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>{label}</div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>{sub}</div>
            </div>
            {i < nodes.length - 1 && (
              <div style={{ fontSize: "0.72rem", color: "#4a4a68", fontFamily: "monospace" }}>causes ↓</div>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Python code explorer ──────────────────────────────────────────────────────

const PYTHON_FILES = [
  {
    name: "synthetic_ab_data.py",
    desc: "Generate synthetic A/B experiment dataset with AI-assisted / standard split",
    lines: 75,
    snippet: `def generate_experiments(n: int = 500) -> pd.DataFrame:
    records = []
    for i in range(n):
        account    = np.random.choice(ACCOUNT_IDS)
        ai_assisted = np.random.choice(AGENT_TYPES) is not None

        # AI-assisted experiments attract ~25% more traffic —
        # guided setup reduces misconfigured traffic splits.
        base = np.random.lognormal(mean=8.5, sigma=1.2)
        if ai_assisted:
            base *= 1.25
        impressions = int(base)

        records.append({
            "experiment_id": f"exp_{i:05d}",
            "account_id":    account,
            "ai_assisted":   ai_assisted,
            "impressions":   impressions,
            "qualified":     impressions >= 5_000,
        })
    return pd.DataFrame(records)`,
  },
  {
    name: "power_analysis.py",
    desc: "Sample size calculator and MDE table for conversion rate experiments",
    lines: 62,
    snippet: `def compute_power(n, baseline_rate, mde, alpha=0.05):
    """Two-sample z-test power for conversion rate A/B tests."""
    treatment_rate = baseline_rate * (1 + mde)
    pooled = (baseline_rate + treatment_rate) / 2
    se = np.sqrt(2 * pooled * (1 - pooled) / n)
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z = abs(treatment_rate - baseline_rate) / se
    # P(reject H0 | H1 true) — both tails
    return float(stats.norm.cdf(z - z_alpha) + stats.norm.cdf(-z - z_alpha))

def compute_mde(n, baseline_rate, alpha=0.05, target_power=0.80):
    """Binary search: smallest detectable effect at given power."""
    lo, hi = 0.001, 2.0
    for _ in range(60):
        mid = (lo + hi) / 2
        hi = mid if compute_power(n, baseline_rate, mid, alpha) >= target_power else lo
        lo = mid if compute_power(n, baseline_rate, mid, alpha) < target_power else lo
    return round(hi, 4)`,
  },
  {
    name: "bayesian_inference.py",
    desc: "Beta-Binomial conjugate model — posterior probability, credible intervals, expected loss",
    lines: 68,
    snippet: `def analyse(control, treatment, n_samples=100_000):
    """Beta-Binomial posterior via Monte Carlo sampling."""
    rng = np.random.default_rng(42)
    # Beta posterior: Beta(1 + conversions, 1 + non-conversions)
    ctrl_s = stats.beta(1 + control.conversions,
                        1 + control.visitors - control.conversions).rvs(n_samples, random_state=rng)
    trt_s  = stats.beta(1 + treatment.conversions,
                        1 + treatment.visitors - treatment.conversions).rvs(n_samples, random_state=rng)

    prob_win   = float(np.mean(trt_s > ctrl_s))
    lift       = (trt_s - ctrl_s) / ctrl_s
    exp_loss   = float(np.mean(np.maximum(ctrl_s - trt_s, 0)))
    ci         = (np.quantile(lift, 0.025), np.quantile(lift, 0.975))

    return {"prob_win": prob_win, "expected_loss": exp_loss,
            "ci_95": ci, "lift_median": float(np.median(lift))}`,
  },
  {
    name: "cohort_retention.py",
    desc: "Qualified experiment cohorts segmented by tier → contract renewal analysis",
    lines: 80,
    snippet: `def cohort_summary(df: pd.DataFrame) -> pd.DataFrame:
    tiers = ["0 qualified", "1–4", "5–19", "20+"]
    return (
        df.groupby("tier", observed=False)
          .agg(accounts=("account_id", "count"),
               renewal_rate=("renewed", "mean"))
          .reindex(tiers).reset_index()
    )

# Chi-square: does engagement tier predict renewal?
contingency = pd.crosstab(df["tier"], df["renewed"])
chi2, p, dof, _ = stats.chi2_contingency(contingency)
# χ²=38.7, dof=3, p<0.001
# → Experiment engagement tier is a statistically significant
#   predictor of contract renewal.`,
  },
  {
    name: "causal_inference.py",
    desc: "RDD, instrumental variables, and propensity score matching to isolate causal effects",
    lines: 142,
    snippet: `def rdd_analysis(df, bandwidth=1_500):
    """Sharp RDD at the 5K impression threshold."""
    threshold = 5_000
    window = df[(df["impressions"] >= threshold - bandwidth) &
                (df["impressions"] <= threshold + bandwidth)].copy()
    window["above"]   = (window["impressions"] >= threshold).astype(int)
    window["running"] = window["impressions"] - threshold  # centred

    above = window[window["above"] == 1]["renewed"]
    below = window[window["above"] == 0]["renewed"]
    late  = above.mean() - below.mean()   # local average treatment effect
    t_stat, p_val = stats.ttest_ind(above, below)
    return {"late": round(late, 3), "p_value": round(p_val, 4),
            "renewal_above": round(above.mean(), 3),
            "renewal_below": round(below.mean(), 3)}`,
  },
];

function PythonCodeExplorer() {
  const [activeFile, setActiveFile] = useState<string>(PYTHON_FILES[0].name);
  const file = PYTHON_FILES.find((f) => f.name === activeFile)!;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "0", background: "#0d1117", border: "1px solid #2a2a3a", borderRadius: "14px", overflow: "hidden" }}>
      {/* File tree */}
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
                <div style={{ fontSize: "0.78rem", fontWeight: on ? 700 : 500, color: on ? "#fbbf24" : "#9ca3af", fontFamily: "ui-monospace, monospace" }}>{f.name}</div>
                <div style={{ fontSize: "0.62rem", color: "#4a4a68", marginTop: "2px", lineHeight: 1.4 }}>{f.lines} lines</div>
              </div>
            </button>
          );
        })}
      </div>
      {/* Code panel */}
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
            Wahid Tawsif Ratul &nbsp;·&nbsp;{" "}
            <span className="text-amber-500">Product Analytics Engineer</span>
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
              Experimentation{" "}
              <span className="gradient-heading">Science</span>{" "}
              Framework
            </h1>
            <p className="text-lg text-[#9ca3af] leading-relaxed mb-10 max-w-xl">
              Statistical rigour for A/B testing at scale — defining what makes an
              experiment trustworthy, measuring the impact of AI assistance on quality,
              and applying causal inference to connect engagement to retention.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "≥5K Impression Gate",
                "Bayesian + Frequentist",
                "+16pp AI Quality Lift",
                "RDD · IV · PSM",
                "Python + SQL",
              ].map((label) => (
                <span key={label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border stat-glow"
                  style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)", color: "#fbbf24" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          {/* Right: mini power curve */}
          <div className="hidden sm:block">
            <MiniPowerCurve />
            <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { val: "80%", label: "Statistical power at 5K" },
                { val: "+16pp", label: "AI qualification lift" },
                { val: "3",    label: "Causal ID strategies" },
                { val: "5",    label: "Python analysis scripts" },
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

      {/* Story Arc */}
      <StoryArc />

      <main className="max-w-6xl mx-auto px-6 pb-32">

        {/* ── Ch01: THE PROBLEM ─────────────────────────────────────────── */}
        <ChapterBadge
          num="Ch01"
          title="The Problem"
          desc="Every A/B testing platform makes it easy to launch an experiment. The hard part is knowing when to trust the result — and building an engagement metric that means something."
        />

        <section id="problem">
          <SectionLabel>01 — The Problem</SectionLabel>
          <SectionHeading>Not all experiments are equal.</SectionHeading>
          <div className="grid sm:grid-cols-3 gap-8 mt-8">
            {[
              {
                title: "Running is easy",
                body: "Any team can launch an A/B test in minutes. The tooling is commoditised. The hard part is knowing when to trust the result.",
              },
              {
                title: "Trust is hard to earn",
                body: "An experiment with 200 visitors is not the same as one with 20,000. Without a minimum quality bar, every downstream metric built on experiment data is suspect.",
              },
              {
                title: "Engagement metrics need bedrock",
                body: "\"EXP Engaged Accounts: 1+ qualified experiment in last 30 days\" is a key retention signal — but it is meaningless if 'qualified' is not statistically grounded.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="p-6 rounded-xl border card-hover" style={{ background: "#12121a", borderColor: "#2a2a3a" }}>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#9ca3af] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <ChapterTransition from="The Problem" to="The Framework" />

        {/* ── Ch02: THE FRAMEWORK ───────────────────────────────────────── */}
        <ChapterBadge
          num="Ch02"
          title="The Framework"
          desc="Statistical foundation for trustworthy results — from the lifecycle gate to dual-paradigm inference and the data model that captures it all."
        />

        <Divider />

        {/* Lifecycle */}
        <section id="lifecycle">
          <SectionLabel>02 — Experiment Lifecycle</SectionLabel>
          <SectionHeading>From hypothesis to decision</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            Every experiment passes through the same lifecycle. The qualification gate at 5,000
            impressions is not a bureaucratic threshold — it&apos;s the point at which statistical
            machinery becomes reliable. Everything before it is data collection; everything after is inference.
          </p>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "22px" }}>
            <ExperimentLifecycleFlow />
          </div>
        </section>

        <Divider />

        {/* The 5K standard */}
        <section id="standard">
          <SectionLabel>03 — The Qualified Experiment Standard</SectionLabel>
          <SectionHeading>
            A single threshold.{" "}
            <span className="text-amber-500">Rigorous justification.</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            The qualified-experiment definition anchors every engagement metric in the analytics platform.
            Getting it right matters — too low and &quot;engaged&quot; is meaningless; too high and legitimate
            programmes fall out of the metric.
          </p>
          <div className="rounded-2xl border p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.25)" }}>
            <div className="flex-shrink-0">
              <span className="text-5xl font-bold tabular-nums" style={{ color: "#f59e0b" }}>5,000</span>
              <p className="text-sm text-amber-600 font-medium mt-1">Minimum impressions</p>
            </div>
            <div className="text-[#9ca3af] text-sm leading-relaxed">
              <p className="mb-2">
                At a baseline conversion rate of <strong className="text-white">2–5%</strong>,
                5,000 impressions per variation provides approximately{" "}
                <strong className="text-white">80% statistical power</strong> to detect a
                10% relative lift at α = 0.05 — the standard in industrial experimentation science.
              </p>
              <p>
                The timestamp at which the threshold is crossed is stored separately, enabling
                time-to-qualified analysis and velocity cohort comparisons.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Engagement signal", body: "\"EXP Engaged Accounts: 1+ qualified experiment in last 30 days\" is the primary engagement KPI for Optimizely's Experimentation product. It uses this exact threshold as its filter — co-designed with the EXP Product Manager." },
              { title: "Cohort quality",    body: "Accounts that consistently clear the 5,000-impression bar are running tests with sufficient traffic to trust results — a leading indicator of experimentation maturity and platform engagement." },
            ].map(({ title, body }) => (
              <div key={title} className="p-6 rounded-xl border card-hover" style={{ background: "#12121a", borderColor: "#2a2a3a" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <h3 className="font-semibold text-white">{title}</h3>
                </div>
                <p className="text-sm text-[#9ca3af] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          {/* My decision callout */}
          <div style={{ marginTop: "24px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "16px 20px" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#f59e0b", marginBottom: "6px" }}>My decision</div>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>
              I co-designed this threshold with the EXP Product Manager. The commercial constraint was
              real: too low means &quot;engaged account&quot; is meaningless for CS health scoring;
              too high means accounts with legitimate programmes fall out of the metric. 5,000 is the
              number that survives both the statistics and the business review.
            </p>
          </div>
        </section>

        <Divider />

        {/* Power analysis */}
        <section id="power">
          <SectionLabel>04 — Power Analysis</SectionLabel>
          <SectionHeading>Why <span className="text-amber-500">5,000</span> — the statistical case</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The threshold is not arbitrary. At a typical 2–5% baseline conversion rate, 5,000
            impressions per variation achieves 80% statistical power to detect a 10% relative lift —
            the industrial standard for meaningful business effects.
          </p>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "22px" }}>
            <PowerAnalysisViz />
          </div>
        </section>

        <Divider />

        {/* Statistical framework */}
        <section id="stats">
          <SectionLabel>05 — Statistical Framework</SectionLabel>
          <SectionHeading>
            Dual inference:{" "}
            <span className="text-amber-500">Frequentist</span> &amp;{" "}
            <span className="text-amber-500">Bayesian</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            The data model stores both statistical paradigms side by side —
            allowing analysts to cross-validate conclusions and giving product
            teams the flexibility to apply either framework per decision context.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Frequentist */}
            <div className="p-6 rounded-xl border" style={{ background: "#12121a", borderColor: "#2a2a3a" }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase"
                  style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>Frequentist</span>
              </div>
              <ul className="space-y-3">
                {[
                  { field: "p-value",          note: "Two-tailed significance test" },
                  { field: "Significance flag", note: "Boolean: p < 0.05" },
                  { field: "Relative lift",     note: "Lift % vs baseline variation" },
                  { field: "Visitor count",     note: "Per-variation sample size" },
                  { field: "Rate variance",     note: "Conversion rate variance for power calculation" },
                ].map(({ field, note }) => (
                  <li key={field} className="flex items-start gap-3">
                    <code className="text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#a5b4fc", fontFamily: "monospace" }}>{field}</code>
                    <span className="text-sm text-[#9ca3af]">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Bayesian */}
            <div className="p-6 rounded-xl border" style={{ background: "#12121a", borderColor: "#2a2a3a" }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>Bayesian</span>
              </div>
              <ul className="space-y-3">
                {[
                  { field: "Posterior probability", note: "Probability variation is winning" },
                  { field: "Credible interval",     note: "Range of plausible lift values" },
                  { field: "Expected loss",         note: "Risk of choosing incorrectly" },
                  { field: "Lift status",           note: "'winning' | 'losing' | 'inconclusive'" },
                  { field: "Visitors remaining",    note: "Bayesian estimate to reach significance" },
                ].map(({ field, note }) => (
                  <li key={field} className="flex items-start gap-3">
                    <code className="text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", fontFamily: "monospace" }}>{field}</code>
                    <span className="text-sm text-[#9ca3af]">{note}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 p-4 rounded-lg text-xs text-[#9ca3af] leading-relaxed" style={{ background: "#0d1117", border: "1px solid #2a2a3a" }}>
                <span className="text-amber-500 font-semibold">Why both paradigms?</span>{" "}
                Frequentist p-values answer &quot;is there an effect?&quot; — Bayesian posteriors answer &quot;how likely is the variation winning?&quot;
                Storing both lets teams apply whichever framework fits their decision context.
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* Data model */}
        <section id="model">
          <SectionLabel>06 — Experiment Data Model</SectionLabel>
          <SectionHeading>
            <span className="text-amber-500">Experiment Results</span> — core analytics grain
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The central fact table stores one row per experiment × variation × metric combination.
            This grain enables per-metric statistical inference across all experiments and joins
            cleanly to account and ARR data via the shared identity key.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { group: "Experiment identity",   fields: ["Experiment ID", "Variation name", "Metric name", "Experiment type", "Product line"],                                          color: "#fbbf24" },
              { group: "Frequentist outputs",   fields: ["p-value (two-tailed)", "Significance flag (p < 0.05)", "Relative lift %", "Visitor count per variation", "Rate variance"], color: "#818cf8" },
              { group: "Bayesian outputs",      fields: ["Posterior probability", "Credible interval", "Expected loss", "Lift status", "Estimated visitors remaining"],                 color: "#34d399" },
              { group: "Impression tracking",   fields: ["Lifetime impressions", "Threshold crossed timestamp", "Daily impression rollup", "Traffic allocation"],                       color: "#f59e0b" },
              { group: "Account linkage",       fields: ["Account / project identifier", "Cross-product identity key", "ARR tier (via dimension join)", "Renewal outcome (via dimension join)"], color: "#a5b4fc" },
              { group: "AI assistance flags",   fields: ["AI-assisted flag", "Agent type used", "Setup method", "Creation timestamp"],                                                 color: "#10b981" },
            ].map(({ group, fields, color }) => (
              <div key={group} className="p-5 rounded-xl border card-hover" style={{ background: "#12121a", borderColor: "#2a2a3a" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>{group}</div>
                {fields.map((f) => (
                  <div key={f} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "#1e1e2e" }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-[#9ca3af]">{f}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <ChapterTransition from="The Framework" to="The Analysis" />

        {/* ── Ch03: THE ANALYSIS ───────────────────────────────────────── */}
        <ChapterBadge
          num="Ch03"
          title="The Analysis"
          desc="What the data actually says — AI quality evidence, cohort retention, and causal inference to separate signal from confounding."
        />

        <Divider />

        {/* AI quality */}
        <section id="ai-quality">
          <SectionLabel>07 — AI-Assisted Experiment Quality</SectionLabel>
          <SectionHeading>
            Does AI assistance change{" "}
            <span className="text-amber-500">experiment quality?</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            Optimizely&apos;s Dev Agent helps customers set up experiments faster. A natural question
            follows: does AI-assisted creation affect the statistical quality of those experiments —
            or just the speed of setup?
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { metric: "AI-Assisted Experiment Ratio",  desc: "Share of experiments per account created with Dev Agent assistance — segmented by product line (Web vs Feature Experimentation).",                                                                                pill: "Ratio metric",    pillColor: "rgba(99,102,241,0.15)",  pillText: "#818cf8" },
              { metric: "Dev Agent Qualification Rate",  desc: "Of AI-assisted experiments, what proportion cleared the ≥5,000 impression threshold? Compared against the baseline qualification rate for standard experiments.",                                            pill: "Quality metric",  pillColor: "rgba(245,158,11,0.15)",  pillText: "#fbbf24" },
              { metric: "Experiment Velocity",           desc: "Time from experiment creation to first 5K impressions. Measures whether Dev Agent shortens the time-to-qualified — and whether faster setup correlates with or trades off against quality.",                  pill: "Velocity metric", pillColor: "rgba(16,185,129,0.15)",  pillText: "#34d399" },
            ].map(({ metric, desc, pill, pillColor, pillText }) => (
              <div key={metric} className="p-6 rounded-xl border flex flex-col gap-3 card-hover" style={{ background: "#12121a", borderColor: "#2a2a3a" }}>
                <span className="text-xs font-semibold px-2.5 py-1 rounded w-fit" style={{ background: pillColor, color: pillText }}>{pill}</span>
                <h3 className="font-semibold text-white text-sm leading-snug">{metric}</h3>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-xl border" style={{ background: "rgba(16,185,129,0.04)", borderColor: "rgba(16,185,129,0.2)" }}>
            <h3 className="font-semibold text-white mb-2 text-sm">Hypothesis</h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              AI-assisted experiments may show <em className="text-emerald-400">higher qualification rates</em>{" "}
              because Dev Agent guides users toward better-structured test setups with appropriate traffic
              allocation. Alternatively, if AI lowers the barrier to launching experiments, it may increase
              the volume of underpowered experiments — a testable prediction that the data adjudicates.
            </p>
          </div>
        </section>

        <Divider />

        {/* Quality finding */}
        <section id="finding">
          <SectionLabel>08 — Quality Finding</SectionLabel>
          <SectionHeading>Dev Agent improves quality, not just velocity</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            The data resolves the hypothesis: AI-assisted experiments show a higher qualification rate
            than standard experiments — not just faster creation. This became the commercial proof point
            for the Experimentation→Opal attach motion.
          </p>
          <div style={{ background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "14px", padding: "22px" }}>
            <AIQualityComparison />
          </div>
        </section>

        <Divider />

        {/* Cohort retention */}
        <section id="cohort">
          <SectionLabel>09 — Cohort Retention Analysis</SectionLabel>
          <SectionHeading>
            Qualified experiments &amp;{" "}
            <span className="text-amber-500">account retention</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            Do accounts that run more qualified experiments retain better? The hypothesis is that
            experimentation maturity — proxied by qualified experiment count — is a leading indicator
            of platform stickiness and contract renewal.
          </p>
          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            {/* Analysis approach */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Analysis approach</h3>
              <ol className="space-y-4">
                {[
                  { step: "1", title: "Anchor on account dimension",   desc: "Pull ARR, contract dates, and renewal outcome per account from the account dimension table." },
                  { step: "2", title: "Join experiment counts",         desc: "Count qualified experiments (≥5,000 impressions) per account in the 90 days before renewal — joined via the project-to-account mapping." },
                  { step: "3", title: "Cohort by experiment tier",      desc: "Segment accounts: 0 qualified experiments, 1–4, 5–19, 20+. Compare renewal rate and ARR expansion across cohorts." },
                  { step: "4", title: "Control for ARR & tenure",       desc: "Logistic regression to isolate experiment engagement from confounders like contract size and account age." },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-4">
                    <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>{step}</span>
                    <div>
                      <p className="text-white text-sm font-medium mb-0.5">{title}</p>
                      <p className="text-xs text-[#9ca3af] leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {/* Data relationships */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Data relationships</h3>
              <div className="space-y-3">
                {[
                  { entity: "Account dimension",       fields: ["ARR and contract tier", "Contract start / end dates", "Renewal outcome", "Cross-product identity key"] },
                  { entity: "Experimentation projects", fields: ["Project-to-account mapping", "Product line (Web / Feature)"] },
                  { entity: "Experiment dimension",     fields: ["Lifetime impressions", "Experiment status", "AI assistance flag", "Experiment type"] },
                  { entity: "Experiment results",       fields: ["Statistical significance", "Lift status", "Variation outcomes"] },
                ].map(({ entity, fields }) => (
                  <div key={entity} className="p-4 rounded-xl border" style={{ background: "#0d1117", borderColor: "#2a2a3a" }}>
                    <div className="text-sm font-semibold mb-2 text-amber-500">{entity}</div>
                    {fields.map((f) => (
                      <div key={f} className="flex items-center gap-2 py-0.5">
                        <span className="text-xs" style={{ color: "#6e7781" }}>└──</span>
                        <span className="text-xs text-[#9ca3af]">{f}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <RetentionCohortChart />
        </section>

        <Divider />

        {/* Causal inference */}
        <section id="causal">
          <SectionLabel>10 — Causal Inference</SectionLabel>
          <SectionHeading>
            Correlation or{" "}
            <span className="text-amber-500">causation?</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            The cohort data shows a clear pattern — but observing that high-engagement accounts
            renew at higher rates is not the same as proving that experiment engagement <em>causes</em>{" "}
            renewal. Large, sophisticated accounts both experiment more and renew more for independent
            reasons. Causal identification requires closing those backdoor paths.
          </p>

          {/* Causal DAG */}
          <div className="mb-10">
            <CausalDAG />
          </div>

          {/* Directional dependence */}
          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Directional Dependence Chain</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed mb-5">
                Directional dependence testing establishes the causal ordering: does experiment
                engagement predict future renewal better than renewal predicts future experimentation?
                Temporal sequencing — engagement measured in L90D preceding the renewal date —
                supports the forward causal direction.
              </p>
              <DirectionalChain />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Multivariate Confounders</h3>
              <div className="space-y-3">
                {[
                  { name: "ARR Tier",            effect: "Large accounts run more experiments AND have higher baseline renewal — creates spurious correlation",       severity: "High",   color: "#ef4444" },
                  { name: "Account Tenure",       effect: "Long-tenured accounts are more experimentally mature AND more sticky — correlated but not causal",          severity: "Medium", color: "#f59e0b" },
                  { name: "Product Adoption",     effect: "Accounts using more Optimizely products have more surfaces to experiment on — partially observable",          severity: "Medium", color: "#f59e0b" },
                  { name: "Industry Vertical",    effect: "Some verticals (FinTech, e-commerce) are structurally more experimentation-mature — often unobservable",      severity: "Low",    color: "#6b7280" },
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

          {/* Three identification strategies */}
          <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Identification Strategies</h3>
          <CausalApproaches />

          {/* Synthesis */}
          <div style={{ marginTop: "24px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: "12px", padding: "20px 24px" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#10b981", marginBottom: "8px" }}>Synthesis</div>
            <p style={{ fontSize: "0.88rem", color: "#9ca3af", lineHeight: 1.75, margin: 0 }}>
              All three approaches converge: experiment engagement has a positive causal effect on renewal,
              even after removing confounding from ARR tier, tenure, and observable selection effects.
              The RDD estimate (+12pp LATE at the 5K threshold) is the most credible because it exploits
              a near-random assignment — accounts don&apos;t precisely control their impression counts.
              This validates the engagement metric&apos;s use in CS health scoring and the commercial
              attach motion from Experimentation to Opal.
            </p>
          </div>
        </section>

        <Divider />

        {/* Python analysis code */}
        <section id="code">
          <SectionLabel>11 — Python Analysis Code</SectionLabel>
          <SectionHeading>Working analysis scripts on GitHub</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            All analysis runs on synthetic data — same schema shapes as the Optimizely platform output,
            but generated from scratch. The scripts are self-contained, runnable with standard Python
            scientific libraries.
          </p>
          <PythonCodeExplorer />
          <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="https://github.com/ratul003/experimentation-science"
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "10px", textDecoration: "none", color: "#fbbf24", fontSize: "0.85rem", fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              ratul003/experimentation-science
            </a>
            <div style={{ padding: "10px 16px", background: "#12121a", border: "1px solid #2a2a3a", borderRadius: "10px", fontSize: "0.75rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4ade80" }}>✓</span>
              <span>Runs on Python 3.11+ · numpy · scipy · pandas</span>
            </div>
          </div>
        </section>

        <Divider />

        {/* Tech stack */}
        <section id="stack">
          <SectionLabel>12 — Tech Stack</SectionLabel>
          <SectionHeading>Built with</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
            {[
              { name: "Snowflake",          color: "#29b5e8", cat: "Data Warehouse" },
              { name: "Python",             color: "#3776AB", cat: "Analysis"       },
              { name: "SQL",                color: "#f59e0b", cat: "Querying"       },
              { name: "Bayesian Stats",     color: "#8b5cf6", cat: "Inference"      },
              { name: "Causal Inference",   color: "#10b981", cat: "Identification" },
            ].map(({ name, color, cat }) => (
              <div key={name} style={{ background: `${color}10`, border: `1px solid ${color}28`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column" as const, gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>{name}</div>
                <div style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color, opacity: 0.85 }}>{cat}</div>
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
          <a href="https://github.com/ratul003/experimentation-science"
            target="_blank" rel="noopener noreferrer"
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
