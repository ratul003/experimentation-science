import { ImageResponse } from "next/og";

export const alt = "Experimentation Science · Wahid Tawsif Ratul";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRIMARY = "#f59e0b";
const SECONDARY = "#fbbf24";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", background: "#0a0a0f",
          backgroundImage: `radial-gradient(900px 600px at 75% -10%, ${PRIMARY}38, transparent 60%), radial-gradient(700px 500px at 0% 110%, ${SECONDARY}1a, transparent 60%)`,
          padding: "64px 72px", fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "11px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "4px", padding: "9px", background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`, boxShadow: `0 0 30px ${PRIMARY}80` }}>
            <div style={{ width: "11px", height: "11px", borderRadius: "3px", background: "rgba(255,255,255,0.95)" }} />
            <div style={{ width: "11px", height: "11px", borderRadius: "3px", background: "rgba(255,255,255,0.6)" }} />
            <div style={{ width: "11px", height: "11px", borderRadius: "3px", background: "rgba(255,255,255,0.6)" }} />
            <div style={{ width: "11px", height: "11px", borderRadius: "3px", background: "rgba(255,255,255,0.95)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "20px", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: SECONDARY }}>
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: SECONDARY }} />
            Case Study · Experimentation Platform
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "84px", fontWeight: 900, letterSpacing: "-3px", lineHeight: 1.02, color: "#f5f5fa", maxWidth: "980px" }}>
            Experimentation Science
          </div>
          <div style={{ marginTop: "26px", fontSize: "27px", lineHeight: 1.45, color: "#9a9ab8", maxWidth: "900px" }}>
            The statistical rigor behind the “qualified experiment”: power analysis, MDE, and AI-assisted experiment quality.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "28px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#e8e8f0" }}>Wahid Tawsif Ratul</div>
            <div style={{ fontSize: "20px", color: PRIMARY, fontWeight: 600 }}>Product Analytics Engineer</div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {["Python", "Bayesian", "Power analysis", "A/B testing"].map((t) => (
              <div key={t} style={{ display: "flex", fontSize: "18px", color: SECONDARY, background: `${PRIMARY}1a`, border: `1px solid ${PRIMARY}4d`, borderRadius: "8px", padding: "8px 16px" }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
