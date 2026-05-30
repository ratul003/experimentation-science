import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Tiny primitives
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-amber-500 mb-3">
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
      {children}
    </h2>
  );
}

function Divider() {
  return <hr className="border-0 border-t border-[#2a2a3a] my-20" />;
}

// ---------------------------------------------------------------------------
// SQL token renderer — no external libraries
// ---------------------------------------------------------------------------

type Token = { type: string; value: string };

const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "ON", "GROUP", "BY",
  "ORDER", "HAVING", "WITH", "AS", "DISTINCT", "COUNT", "SUM", "AVG",
  "MAX", "MIN", "CASE", "WHEN", "THEN", "ELSE", "END", "IN", "NOT",
  "NULL", "IS", "LIKE", "BETWEEN", "INNER", "LEFT", "RIGHT", "OUTER",
  "FULL", "CROSS", "UNION", "ALL", "LIMIT", "OFFSET", "INSERT", "INTO",
  "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "VIEW", "INDEX",
  "DROP", "ALTER", "ADD", "COLUMN", "PRIMARY", "KEY", "FOREIGN",
  "REFERENCES", "DATEADD", "CURRENT_DATE", "DATEDIFF",
]);

function tokenizeSQL(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < sql.length) {
    // Comment
    if (sql[i] === "-" && sql[i + 1] === "-") {
      let j = i;
      while (j < sql.length && sql[j] !== "\n") j++;
      tokens.push({ type: "comment", value: sql.slice(i, j) });
      i = j;
      continue;
    }
    // String literal
    if (sql[i] === "'") {
      let j = i + 1;
      while (j < sql.length && sql[j] !== "'") j++;
      tokens.push({ type: "string", value: sql.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // Number
    if (/[0-9]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++;
      tokens.push({ type: "number", value: sql.slice(i, j) });
      i = j;
      continue;
    }
    // Word / keyword
    if (/[A-Za-z_]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[A-Za-z0-9_.:]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      const upper = word.toUpperCase();
      if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ type: "keyword", value: word });
      } else if (word.includes(".")) {
        tokens.push({ type: "schema", value: word });
      } else if (word === word.toUpperCase() && word.length > 1) {
        tokens.push({ type: "identifier", value: word });
      } else {
        tokens.push({ type: "plain", value: word });
      }
      i = j;
      continue;
    }
    // Operators / punctuation
    if (/[>=<!*/+\-]/.test(sql[i])) {
      tokens.push({ type: "operator", value: sql[i] });
      i++;
      continue;
    }
    // Whitespace / other — preserve as-is
    tokens.push({ type: "plain", value: sql[i] });
    i++;
  }
  return tokens;
}

function colorClass(type: string): string {
  switch (type) {
    case "keyword": return "sql-keyword";
    case "string": return "sql-string";
    case "comment": return "sql-comment";
    case "number": return "sql-number";
    case "operator": return "sql-operator";
    case "schema": return "sql-schema";
    case "identifier": return "sql-identifier";
    default: return "";
  }
}

function SqlBlock({ code, label }: { code: string; label?: string }) {
  const lines = code.split("\n");
  return (
    <div className="code-block">
      {label && (
        <div className="px-4 py-2 border-b border-[#2a2a3a] flex items-center gap-2">
          <span className="text-xs text-[#6b7280] font-mono">{label}</span>
        </div>
      )}
      <pre className="overflow-x-auto">
        <code>
          {lines.map((line, li) => {
            const tokens = tokenizeSQL(line);
            return (
              <span key={li}>
                {tokens.map((tok, ti) => {
                  const cls = colorClass(tok.type);
                  return cls ? (
                    <span key={ti} className={cls}>
                      {tok.value}
                    </span>
                  ) : (
                    <span key={ti}>{tok.value}</span>
                  );
                })}
                {li < lines.length - 1 ? "\n" : ""}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data for the schema table
// ---------------------------------------------------------------------------

const schemaColumns = [
  {
    col: "EXPERIMENT_ID",
    type: "VARCHAR",
    desc: "Unique experiment identifier",
  },
  {
    col: "VARIATION_NAME",
    type: "VARCHAR",
    desc: "Variation label (e.g. 'control', 'variation_1')",
  },
  {
    col: "METRIC_NAME",
    type: "VARCHAR",
    desc: "Metric being measured (click-through, conversion, etc.)",
  },
  {
    col: "VARIATION_RATE",
    type: "FLOAT",
    desc: "Conversion / engagement rate for this variation",
  },
  {
    col: "LIFT_VALUE",
    type: "FLOAT",
    desc: "Relative lift vs. baseline (%)",
  },
  {
    col: "SIGNIFICANCE",
    type: "FLOAT",
    desc: "Frequentist p-value (two-tailed)",
  },
  {
    col: "IS_SIGNIFICANT",
    type: "BOOLEAN",
    desc: "TRUE when p < 0.05",
  },
  {
    col: "LIFT_STATUS",
    type: "VARCHAR",
    desc: "'winning' | 'losing' | 'inconclusive'",
  },
  {
    col: "VARIATION_SAMPLES",
    type: "INTEGER",
    desc: "Visitor count for this variation",
  },
  {
    col: "VARIATION_VARIANCE",
    type: "FLOAT",
    desc: "Variance of conversion rate (for power calculation)",
  },
  {
    col: "CONCLUSION",
    type: "VARIANT",
    desc: "Bayesian JSON: posterior probability, credible interval, visitors remaining",
  },
  {
    col: "VISITORS_REMAINING",
    type: "INTEGER",
    desc: "Estimated visitors to reach significance (Bayesian projection)",
  },
];

// ---------------------------------------------------------------------------
// SQL snippets
// ---------------------------------------------------------------------------

const sql1 = `-- Qualified experiments in last 30 days per account
SELECT
  p.CUSTOMER_ID,
  COUNT(DISTINCT e.EXPERIMENT_ID) AS qualified_experiments
FROM TRANSFORM.KIMBALL_DATA_MODEL.DIM_EXPERIMENT e
JOIN TRANSFORM.KIMBALL_DATA_MODEL.DIM_EXPERIMENTATION_PROJECTS p
  ON e.PROJECT_ID = p.PROJECT_ID
WHERE e.EXPERIMENT_STATUS = 'running'
  AND e.LIFE_TIME_IMPRESSIONS >= 5000
  AND e.EXPERIMENT_START_TIME_IMPRESSIONS_REACHED >= DATEADD('day', -30, CURRENT_DATE)
GROUP BY 1`;

const sql2 = `-- AI-assisted experiment quality vs. standard experiments
SELECT
  a.IS_AI_ASSISTED,
  COUNT(DISTINCT e.EXPERIMENT_ID)                            AS total_experiments,
  COUNT(DISTINCT CASE WHEN e.LIFE_TIME_IMPRESSIONS >= 5000
                      THEN e.EXPERIMENT_ID END)              AS qualified_experiments,
  ROUND(
    COUNT(DISTINCT CASE WHEN e.LIFE_TIME_IMPRESSIONS >= 5000
                        THEN e.EXPERIMENT_ID END) * 100.0
    / NULLIF(COUNT(DISTINCT e.EXPERIMENT_ID), 0), 1
  )                                                          AS qualified_rate_pct,
  AVG(e.LIFE_TIME_IMPRESSIONS)                               AS avg_impressions,
  COUNT(DISTINCT CASE WHEN m.IS_SIGNIFICANT = TRUE
                      THEN e.EXPERIMENT_ID END)              AS significant_experiments
FROM TRANSFORM.KIMBALL_DATA_MODEL.DIM_EXPERIMENT e
JOIN TRANSFORM.KIMBALL_DATA_MODEL.DIM_AI_ASSISTANCE a
  ON e.EXPERIMENT_ID = a.EXPERIMENT_ID
JOIN TRANSFORM.KIMBALL_DATA_MODEL.FACT_EXPERIMENT_RESULTS_VARIATION_METRICS m
  ON e.EXPERIMENT_ID = m.EXPERIMENT_ID
GROUP BY 1`;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#e8e8f0" }}>

      {/* ------------------------------------------------------------------ */}
      {/* Nav                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(10, 10, 15, 0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "#2a2a3a",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide text-white">
            Experimentation Science
          </span>
          <span className="text-sm text-[#6b7280] hidden sm:block">
            Wahid Tawsif Ratul &nbsp;·&nbsp;{" "}
            <span className="text-amber-500">Product Analytics Engineer</span>
          </span>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-amber-500 mb-5">
            Case Study &nbsp;·&nbsp; Optimizely
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Experimentation{" "}
            <span className="text-amber-500">Science</span>{" "}
            Framework
          </h1>
          <p className="text-lg sm:text-xl text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            Statistical rigour for A/B testing at scale — defining what makes an
            experiment trustworthy across 3.6 million experiments.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "9.3M Result Rows", icon: "⬡" },
              { label: "3.6M Experiments", icon: "⬡" },
              { label: "≥5K Impression Threshold", icon: "⬡" },
              { label: "Bayesian + Frequentist", icon: "⬡" },
            ].map(({ label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                style={{
                  background: "rgba(245, 158, 11, 0.08)",
                  borderColor: "rgba(245, 158, 11, 0.3)",
                  color: "#fbbf24",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                        */}
      {/* ------------------------------------------------------------------ */}
      <main className="max-w-6xl mx-auto px-6 pb-32">

        <Divider />

        {/* The Problem */}
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
                body: "An experiment with 200 visitors is not the same as one with 20,000. Without a minimum-quality bar, every downstream metric built on experiment data is suspect.",
              },
              {
                title: "Engagement metrics need bedrock",
                body: "\"EXP Engaged Accounts: 1+ qualified experiment in last 30 days\" is a key retention signal — but it is meaningless if 'qualified' is not statistically grounded.",
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="p-6 rounded-xl border"
                style={{ background: "#12121a", borderColor: "#2a2a3a" }}
              >
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#9ca3af] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Qualified Experiment Standard */}
        <section id="standard">
          <SectionLabel>02 — The Qualified Experiment Standard</SectionLabel>
          <SectionHeading>
            A single threshold.{" "}
            <span className="text-amber-500">Rigorous justification.</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            The qualified-experiment definition anchors every engagement metric in the
            analytics platform. Getting it right matters.
          </p>

          {/* Threshold callout */}
          <div
            className="rounded-2xl border p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            style={{
              background: "rgba(245, 158, 11, 0.06)",
              borderColor: "rgba(245, 158, 11, 0.25)",
            }}
          >
            <div className="flex-shrink-0">
              <span
                className="text-5xl font-bold tabular-nums"
                style={{ color: "#f59e0b" }}
              >
                5,000
              </span>
              <p className="text-sm text-amber-600 font-medium mt-1">
                Minimum impressions
              </p>
            </div>
            <div className="text-[#9ca3af] text-sm leading-relaxed">
              <p className="mb-2">
                At a baseline conversion rate of <strong className="text-white">2–5%</strong>,
                5,000 impressions per variation provides approximately{" "}
                <strong className="text-white">80% statistical power</strong> to detect a
                10% relative lift at α = 0.05 — a standard acceptable threshold in
                industrial experimentation science.
              </p>
              <p>
                This threshold is stored in{" "}
                <code
                  className="text-amber-400 text-xs px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(245, 158, 11, 0.12)" }}
                >
                  DIM_EXPERIMENT.LIFE_TIME_IMPRESSIONS
                </code>{" "}
                and the timestamp when the threshold is crossed is captured in{" "}
                <code
                  className="text-amber-400 text-xs px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(245, 158, 11, 0.12)" }}
                >
                  EXPERIMENT_START_TIME_IMPRESSIONS_REACHED
                </code>
                .
              </p>
            </div>
          </div>

          {/* Downstream impact */}
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Engagement signal",
                body: "\"EXP Engaged Accounts: 1+ qualified experiment in last 30 days\" is the primary engagement KPI for Optimizely's experimentation product line. It uses this exact threshold as its filter.",
              },
              {
                title: "Cohort quality",
                body: "Accounts that consistently clear the 5,000-impression bar are running tests with sufficient traffic to trust results — a leading indicator of experimentation maturity and platform engagement.",
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="p-6 rounded-xl border"
                style={{ background: "#12121a", borderColor: "#2a2a3a" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"
                  />
                  <h3 className="font-semibold text-white">{title}</h3>
                </div>
                <p className="text-sm text-[#9ca3af] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Statistical Framework */}
        <section id="stats">
          <SectionLabel>03 — Statistical Framework</SectionLabel>
          <SectionHeading>
            Dual inference:{" "}
            <span className="text-amber-500">Frequentist</span> &amp;{" "}
            <span className="text-amber-500">Bayesian</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            The data model stores both statistical paradigms side by side,
            allowing analysts to cross-validate conclusions and giving product
            teams the flexibility to apply either framework for decision-making.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Frequentist */}
            <div
              className="p-6 rounded-xl border"
              style={{ background: "#12121a", borderColor: "#2a2a3a" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase"
                  style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}
                >
                  Frequentist
                </span>
              </div>
              <ul className="space-y-3">
                {[
                  { col: "SIGNIFICANCE", note: "Two-tailed p-value" },
                  { col: "IS_SIGNIFICANT", note: "Boolean: p < 0.05" },
                  { col: "LIFT_VALUE", note: "Relative lift %" },
                  { col: "VARIATION_SAMPLES", note: "Per-variation visitor count" },
                  { col: "VARIATION_VARIANCE", note: "Rate variance for power calc" },
                ].map(({ col, note }) => (
                  <li key={col} className="flex items-start gap-3">
                    <code
                      className="text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{
                        background: "rgba(99, 102, 241, 0.1)",
                        color: "#a5b4fc",
                        fontFamily: "monospace",
                      }}
                    >
                      {col}
                    </code>
                    <span className="text-sm text-[#9ca3af]">{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bayesian */}
            <div
              className="p-6 rounded-xl border"
              style={{ background: "#12121a", borderColor: "#2a2a3a" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase"
                  style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}
                >
                  Bayesian
                </span>
              </div>
              <ul className="space-y-3">
                {[
                  { col: "CONCLUSION", note: "JSON: posterior prob., credible interval" },
                  { col: "LIFT_STATUS", note: "'winning' | 'losing' | 'inconclusive'" },
                  { col: "VISITORS_REMAINING", note: "Estimated visitors to significance" },
                ].map(({ col, note }) => (
                  <li key={col} className="flex items-start gap-3">
                    <code
                      className="text-xs px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{
                        background: "rgba(245, 158, 11, 0.1)",
                        color: "#fbbf24",
                        fontFamily: "monospace",
                      }}
                    >
                      {col}
                    </code>
                    <span className="text-sm text-[#9ca3af]">{note}</span>
                  </li>
                ))}
              </ul>

              <div
                className="mt-5 p-4 rounded-lg text-xs text-[#9ca3af] leading-relaxed"
                style={{ background: "#0d1117", border: "1px solid #2a2a3a" }}
              >
                <span className="text-amber-500 font-semibold">CONCLUSION JSON</span>{" "}
                example:
                <br />
                <span style={{ color: "#a5d6ff" }}>
                  {`{ "posterior_probability": 0.94,`}
                  <br />
                  {`  "credible_interval": [0.02, 0.18],`}
                  <br />
                  {`  "expected_loss": 0.003 }`}
                </span>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* Experiment Data Model */}
        <section id="schema">
          <SectionLabel>04 — Experiment Data Model</SectionLabel>
          <SectionHeading>
            <code className="text-amber-500 font-mono text-2xl sm:text-3xl">
              FACT_EXPERIMENT_RESULTS_VARIATION_METRICS
            </code>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            9.3 million rows. One row per experiment × variation × metric combination.
            The grain enables per-metric statistical inference across all active
            and concluded experiments.
          </p>

          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "#2a2a3a" }}
          >
            <div
              className="overflow-x-auto"
              style={{ background: "#12121a" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2a3a" }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold tracking-wide uppercase text-[#6b7280] w-56">
                      Column
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold tracking-wide uppercase text-[#6b7280] w-28">
                      Type
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold tracking-wide uppercase text-[#6b7280]">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schemaColumns.map((row, i) => (
                    <tr
                      key={row.col}
                      style={{
                        borderTop: i > 0 ? "1px solid #1e1e2e" : undefined,
                        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                      }}
                    >
                      <td className="px-5 py-3">
                        <code
                          className="text-xs font-mono"
                          style={{ color: "#fbbf24" }}
                        >
                          {row.col}
                        </code>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="text-xs font-mono"
                          style={{ color: "#818cf8" }}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#9ca3af] text-xs leading-relaxed">
                        {row.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-[#6b7280] mt-3">
            Companion dimension:{" "}
            <code className="text-amber-500">DIM_EXPERIMENT</code> (3.6M rows) —
            EXPERIMENT_TYPE, EXPERIMENT_PRODUCT, EXPERIMENT_STATUS, LIFE_TIME_IMPRESSIONS,
            EXPERIMENT_START_TIME_IMPRESSIONS_REACHED.
          </p>
        </section>

        <Divider />

        {/* AI-Assisted Experiment Quality */}
        <section id="ai">
          <SectionLabel>05 — AI-Assisted Experiment Quality</SectionLabel>
          <SectionHeading>
            Does AI assistance change{" "}
            <span className="text-amber-500">experiment quality?</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            Optimizely&apos;s Dev Agent helps customers set up experiments faster. A natural
            question follows: does AI-assisted experiment creation affect the statistical
            quality and velocity of those experiments?
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                metric: "EXP — AI Assisted Experiment Ratio",
                desc: "Share of experiments per account that were created with Dev Agent assistance. Segmented by product line (Web vs. Feature Experimentation).",
                pill: "Ratio metric",
                pillColor: "rgba(99,102,241,0.15)",
                pillText: "#818cf8",
              },
              {
                metric: "EXP — Dev Agent Experiments Qualified",
                desc: "Of the AI-assisted experiments, what proportion cleared the ≥5,000 impression threshold? Compared against baseline qualification rate.",
                pill: "Quality metric",
                pillColor: "rgba(245,158,11,0.15)",
                pillText: "#fbbf24",
              },
              {
                metric: "Experiment Velocity",
                desc: "Time from experiment creation to first 5K impressions, before vs. after AI assistance. Measures whether Dev Agent shortens the time-to-qualified.",
                pill: "Velocity metric",
                pillColor: "rgba(16,185,129,0.15)",
                pillText: "#34d399",
              },
            ].map(({ metric, desc, pill, pillColor, pillText }) => (
              <div
                key={metric}
                className="p-6 rounded-xl border flex flex-col gap-3"
                style={{ background: "#12121a", borderColor: "#2a2a3a" }}
              >
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded w-fit"
                  style={{ background: pillColor, color: pillText }}
                >
                  {pill}
                </span>
                <h3 className="font-semibold text-white text-sm leading-snug">
                  {metric}
                </h3>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div
            className="p-6 rounded-xl border"
            style={{
              background: "rgba(16,185,129,0.04)",
              borderColor: "rgba(16,185,129,0.2)",
            }}
          >
            <h3 className="font-semibold text-white mb-2 text-sm">
              Hypothesis
            </h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              AI-assisted experiments may show <em className="text-emerald-400">higher qualification rates</em>{" "}
              because Dev Agent guides users toward better-structured test setups with
              appropriate traffic allocation. Alternatively, if AI lowers the barrier to
              launching experiments, it may increase the volume of underpowered experiments —
              a testable prediction that the data can adjudicate.
            </p>
          </div>
        </section>

        <Divider />

        {/* Cohort Analysis */}
        <section id="cohort">
          <SectionLabel>06 — Cohort Analysis</SectionLabel>
          <SectionHeading>
            Qualified experiments &amp;{" "}
            <span className="text-amber-500">account retention</span>
          </SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-10 max-w-2xl">
            Do accounts that run more qualified experiments retain better? The hypothesis
            is that experimentation maturity — proxied by qualified experiment count —
            is a leading indicator of platform stickiness and contract renewal.
          </p>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Approach */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Analysis approach
              </h3>
              <ol className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Anchor on DIM_ACCOUNT",
                    desc: "Pull ARR, contract start/end dates, and renewal outcome per account from the CRM dimension.",
                  },
                  {
                    step: "2",
                    title: "Join experiment counts",
                    desc: "Via DIM_EXPERIMENTATION_PROJECTS → DIM_EXPERIMENT, count qualified experiments (LIFE_TIME_IMPRESSIONS ≥ 5,000) per account in the 90 days before renewal date.",
                  },
                  {
                    step: "3",
                    title: "Cohort by experiment tier",
                    desc: "Segment accounts into cohorts: 0 qualified experiments, 1–4, 5–19, 20+. Compare renewal rate and ARR expansion across cohorts.",
                  },
                  {
                    step: "4",
                    title: "Control for ARR & tenure",
                    desc: "Use logistic regression to isolate the effect of experiment engagement from confounders like contract size and account age.",
                  },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-4">
                    <span
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
                    >
                      {step}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium mb-0.5">{title}</p>
                      <p className="text-xs text-[#9ca3af] leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Key dimensions */}
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Key joins
              </h3>
              <div
                className="rounded-xl border p-5 font-mono text-xs leading-loose"
                style={{ background: "#0d1117", borderColor: "#2a2a3a", color: "#6e7781" }}
              >
                <span style={{ color: "#ffa657" }}>DIM_ACCOUNT</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── CUSTOMER_ID, ARR</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── CONTRACT_START / END</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── RENEWAL_OUTCOME</span>
                <br />
                <span style={{ color: "#6e7781" }}>        │</span>
                <br />
                <span style={{ color: "#ffa657" }}>DIM_EXPERIMENTATION_PROJECTS</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── PROJECT_ID → CUSTOMER_ID</span>
                <br />
                <span style={{ color: "#6e7781" }}>        │</span>
                <br />
                <span style={{ color: "#ffa657" }}>DIM_EXPERIMENT</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── PROJECT_ID</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── LIFE_TIME_IMPRESSIONS</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── EXPERIMENT_TYPE</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── EXPERIMENT_STATUS</span>
                <br />
                <span style={{ color: "#6e7781" }}>        │</span>
                <br />
                <span style={{ color: "#ffa657" }}>FACT_EXPERIMENT_RESULTS</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── IS_SIGNIFICANT</span>
                <br />
                <span style={{ color: "#6e7781" }}>  └── LIFT_STATUS</span>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* Sample SQL */}
        <section id="sql">
          <SectionLabel>07 — Sample SQL</SectionLabel>
          <SectionHeading>Production-grade queries</SectionHeading>
          <p className="text-[#9ca3af] leading-relaxed mb-8 max-w-2xl">
            Both queries run against Snowflake using the Kimball-layer data model.
            They power dbt metrics and are scheduled as Snowflake tasks.
          </p>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-white mb-3">
                Qualified experiments per account (30-day window)
              </p>
              <SqlBlock code={sql1} label="qualified_experiments_per_account.sql" />
            </div>

            <div>
              <p className="text-sm font-medium text-white mb-3">
                AI-assisted experiment quality comparison
              </p>
              <SqlBlock code={sql2} label="ai_experiment_quality.sql" />
            </div>
          </div>
        </section>

        <Divider />

        {/* Tech Stack */}
        <section id="stack">
          <SectionLabel>08 — Tech Stack</SectionLabel>
          <SectionHeading>Built with</SectionHeading>
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { name: "Snowflake", color: "#29b5e8" },
              { name: "Python", color: "#3b82f6" },
              { name: "SQL", color: "#f59e0b" },
              { name: "Bayesian Statistics", color: "#8b5cf6" },
              { name: "dbt", color: "#ff694a" },
            ].map(({ name, color }) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "#2a2a3a",
                  color: "#e8e8f0",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                {name}
              </span>
            ))}
          </div>
        </section>

      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                              */}
      {/* ------------------------------------------------------------------ */}
      <footer
        className="border-t"
        style={{ borderColor: "#2a2a3a" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#6b7280]">
            Wahid Tawsif Ratul &nbsp;·&nbsp; Product Analytics Engineer at Optimizely
          </div>
          <a
            href="https://github.com/ratul003/experimentation-science"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-amber-400 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            github.com/ratul003/experimentation-science
          </a>
        </div>
      </footer>

    </div>
  );
}
