import { useState, useMemo } from "react";

// ── Brand tokens (mirrors EDGE™ palette) ──────────────────────────────────────
const B = {
  force:      "#442C81",
  sky:        "#29AAE1",
  refraction: "#1ED872",
  supernova:  "#FFAF2E",
  twilight:   "#FC5442",
  silver:     "#9090B8",
  darkBg:     "#0C0C18",
  cardBg:     "#14142A",
  sidebarBg:  "#0A0A16",
  border:     "#252545",
};

// ── Shared style primitives ───────────────────────────────────────────────────
const card = {
  background: B.cardBg,
  border: `1px solid ${B.border}`,
  borderRadius: 12,
  padding: "18px 22px",
  marginBottom: 14,
};
const lbl = {
  fontSize: 10,
  color: B.silver,
  fontWeight: 700,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  marginBottom: 5,
  display: "block",
};
const inp = {
  background: "#1E1E38",
  border: `1px solid ${B.border}`,
  borderRadius: 7,
  padding: "7px 11px",
  color: "#E8E8F0",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};
const btn = (bg = B.force) => ({
  background: bg,
  border: "none",
  borderRadius: 7,
  padding: "8px 18px",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
});
const mono = { fontFamily: "'JetBrains Mono', monospace" };
const hdg  = { fontSize: 12, fontWeight: 700, color: B.sky, marginBottom: 12, letterSpacing: ".04em" };

// ── Question definitions ──────────────────────────────────────────────────────
// impact = decimal added when answer is positive (true)
// recompeteOnly = true means question is hidden for Takeaway acquisitions
// negative = true means a "No" or penalty answer DECREMENTS pwin
const QUESTIONS = [
  {
    id: "cpars",
    text: "Is the customer very satisfied with Astrion Team performance as incumbent (VG or Exceptional CPARS)?",
    impact: 0.05,
    recompeteOnly: true,
    options: ["Yes", "No", "N/A"],
  },
  {
    id: "costCut",
    text: "Have we successfully introduced quantifiable cost-cutting efforts over the life of the contract?",
    impact: 0.05,
    recompeteOnly: true,
    options: ["Yes", "No"],
  },
  {
    id: "innovation",
    text: "Have we successfully introduced significant innovations over the life of the contract?",
    impact: 0.05,
    recompeteOnly: true,
    options: ["Yes", "No"],
  },
  {
    id: "shapedSolicitation",
    text: "Have we successfully engaged the customer (and/or SSA) to shape the solicitation to favor the Astrion Team solution?",
    impact: 0.05,
    recompeteOnly: false,
    options: ["Yes", "No"],
  },
  {
    id: "pastPerf",
    text: "Does the Astrion Team have sufficient Recent, Relevant past performance citations?",
    impact: 0.05,
    recompeteOnly: false,
    options: ["Yes", "No"],
  },
  {
    id: "brandedSolutions",
    text: "Does the Astrion Team have any branded solutions that we will bid?",
    impact: 0.02,
    recompeteOnly: false,
    options: ["Yes", "No"],
  },
  {
    id: "demoBranded",
    text: "Has the Astrion Team demonstrated these branded solutions to the customer?",
    impact: 0.03,
    recompeteOnly: false,
    options: ["Yes", "No"],
  },
  {
    id: "keyPersonnel",
    text: "Has the customer already met our Bid PM and/or select Key Personnel?",
    impact: 0.10,
    recompeteOnly: false,
    options: ["Yes", "No"],
  },
  {
    id: "ptw",
    text: "Can we develop a winning price that will offset any weaknesses in our proposed solution?",
    impact: -0.05,
    negative: true,
    recompeteOnly: false,
    options: ["Yes", "No", "PTW not conducted"],
  },
  {
    id: "teaming",
    text: "Does the Astrion Team have signed/exclusive Teaming Agreements with key teammates (technical expertise and/or socioeconomic categories)?",
    impact: 0.10,
    recompeteOnly: false,
    options: ["Yes", "No"],
  },
];

// ── P-Win calculation engine (mirrors the Excel formulas exactly) ─────────────
function calcPwin({ type, m, n, crsScore, answers }) {
  const mNum = parseInt(m, 10) || 1;
  const nNum = parseInt(n, 10) || 1;
  const ratio = mNum / nNum;

  // Initial Pwin
  let initial;
  if (type === "Recompete") {
    initial = 0.80;
  } else {
    // Takeaway: min(0.20, m/(2n))
    initial = Math.min(0.20, mNum / (2 * nNum));
  }

  // Max Pwin ceiling
  const maxPwin = type === "Recompete" ? 1.0 : 0.30;

  // Sum of positive impacts from Yes answers
  let sumImpact = 0;
  let cparsImpact = 0;

  QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    if (q.recompeteOnly && type !== "Recompete") return;

    if (q.id === "cpars") {
      // Customer satisfaction is added separately in recompete formula
      if (ans === "Yes") cparsImpact = q.impact;
    } else if (q.negative) {
      // PTW: decrements if "No"
      if (ans === "No") sumImpact += q.impact; // impact is already negative
    } else {
      if (ans === "Yes") sumImpact += q.impact;
    }
  });

  // Pwin formula per type
  let pwin;
  if (type === "Recompete") {
    // Pwin = Initial + CustSat + (2m/n)*∑impact
    pwin = initial + cparsImpact + (2 * ratio) * sumImpact;
  } else {
    // Pwin = Initial + (m/2n)*∑impact
    pwin = initial + ratio * 0.5 * sumImpact;
  }

  pwin = Math.min(pwin, maxPwin);
  pwin = Math.max(pwin, 0);

  // Confidence factor from CRS score
  let confidence, confLabel;
  const crs = parseInt(crsScore, 10) || 0;
  if (crs >= 76) { confidence = 1.1; confLabel = "High"; }
  else if (crs >= 51) { confidence = 1.0; confLabel = "Moderate"; }
  else { confidence = 0.85; confLabel = "Low"; }

  const confPwin = Math.min(pwin * confidence, maxPwin);

  return {
    initial,
    sumImpact,
    cparsImpact,
    ratio,
    pwin,
    confPwin,
    confidence,
    confLabel,
    maxPwin,
    crs,
  };
};

// ── Gauge SVG ─────────────────────────────────────────────────────────────────
function PwinGauge({ value, label, color, size = 130 }) {
  const pct = Math.min(Math.max(value, 0), 1);
  const r = (size / 2) - 12;
  const circ = 2 * Math.PI * r;
  // Half-circle gauge: dasharray total = half circumference
  const half = circ / 2;
  const filled = half * pct;
  const cx = size / 2, cy = size / 2 + 12;

  return (
    <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`} style={{ overflow: "visible" }}>
      {/* Track */}
      <path
        d={`M ${12} ${cy} A ${r} ${r} 0 0 1 ${size - 12} ${cy}`}
        fill="none"
        stroke={B.border}
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${12} ${cy} A ${r} ${r} 0 0 1 ${size - 12} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${half}`}
        style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }}
      />
      {/* Value */}
      <text
        x={cx} y={cy - 4}
        textAnchor="middle"
        fill={color}
        fontSize={size === 130 ? 26 : 22}
        fontWeight={700}
        fontFamily="'JetBrains Mono', monospace"
      >
        {Math.round(pct * 100)}%
      </text>
      {/* Label */}
      <text x={cx} y={cy + 16} textAnchor="middle" fill={B.silver} fontSize={10} fontWeight={700} fontFamily="'DM Sans', sans-serif" letterSpacing=".08em">
        {label.toUpperCase()}
      </text>
    </svg>
  );
}

// ── Color helpers ─────────────────────────────────────────────────────────────
function pwinColor(v) {
  if (v >= 0.65) return B.refraction;
  if (v >= 0.40) return B.supernova;
  return B.twilight;
}
function confColor(label) {
  return label === "High" ? B.refraction : label === "Moderate" ? B.supernova : B.twilight;
}
function impactColor(v) {
  if (v > 0) return B.refraction;
  if (v < 0) return B.twilight;
  return B.silver;
}

// ── Question row ──────────────────────────────────────────────────────────────
function QuestionRow({ q, value, onChange }) {
  const isPos = value === "Yes";
  const isNeg = q.negative && value === "No";
  const impact = q.negative ? (isNeg ? q.impact : 0) : (isPos ? q.impact : 0);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 12,
        alignItems: "center",
        padding: "11px 0",
        borderBottom: `1px solid ${B.border}`,
      }}
    >
      <div>
        {q.recompeteOnly && (
          <span style={{ fontSize: 9, background: B.force + "33", color: B.force, border: `1px solid ${B.force}55`, borderRadius: 4, padding: "1px 6px", fontWeight: 700, marginRight: 6 }}>
            RECOMPETE
          </span>
        )}
        <span style={{ fontSize: 12, color: "#D0D0E8", lineHeight: 1.55 }}>{q.text}</span>
      </div>

      {/* Impact badge */}
      <div style={{ ...mono, fontSize: 11, fontWeight: 700, color: impactColor(impact), whiteSpace: "nowrap", minWidth: 52, textAlign: "right" }}>
        {impact !== 0 ? (impact > 0 ? "+" : "") + Math.round(impact * 100) + "%" : "—"}
      </div>

      {/* Answer selector */}
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inp, width: 160, fontSize: 12 }}
      >
        <option value="">Select…</option>
        {q.options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

// ── Impact breakdown bar ──────────────────────────────────────────────────────
function ImpactBar({ label, value, max }) {
  const pct = max > 0 ? Math.min(Math.abs(value) / max, 1) * 100 : 0;
  const color = value >= 0 ? B.refraction : B.twilight;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "#C0C0E0" }}>{label}</span>
        <span style={{ ...mono, fontSize: 11, color, fontWeight: 700 }}>
          {value >= 0 ? "+" : ""}{Math.round(value * 100)}%
        </span>
      </div>
      <div style={{ background: B.border, borderRadius: 4, height: 5 }}>
        <div style={{ background: color, borderRadius: 4, height: 5, width: `${pct}%`, transition: "width .4s ease" }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PWinerator({ opp, onSave }) {
  // Inputs
  const [type,     setType]     = useState(opp?.pwinType     || "Recompete");
  const [m,        setM]        = useState(String(opp?.pwinM  || 1));
  const [n,        setN]        = useState(String(opp?.pwinN  || 3));
  const [crsScore, setCrsScore] = useState(String(opp?.pwinCRS || ""));
  const [answers,  setAnswers]  = useState(opp?.pwinAnswers  || {});
  const [saved,    setSaved]    = useState(false);

  const result = useMemo(
    () => calcPwin({ type, m, n, crsScore, answers }),
    [type, m, n, crsScore, answers]
  );

  const setAns = (id, val) => setAnswers((prev) => ({ ...prev, [id]: val }));

  const handleSave = () => {
    if (onSave) {
      onSave({
        pwinType: type,
        pwinM: m,
        pwinN: n,
        pwinCRS: crsScore,
        pwinAnswers: answers,
        pWinScore: Math.round(result.confPwin * 100),
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const questionsToShow = QUESTIONS.filter(
    (q) => !(q.recompeteOnly && type !== "Recompete")
  );

  const answeredCount = questionsToShow.filter((q) => answers[q.id]).length;
  const completePct   = Math.round((answeredCount / questionsToShow.length) * 100);

  const maxImpact = Math.max(
    result.cparsImpact + result.sumImpact,
    0.01
  );

  // Individual impacts for breakdown
  const breakdownItems = [
    { label: "Base (initial) P-Win", value: result.initial },
    ...(type === "Recompete" && result.cparsImpact
      ? [{ label: "Customer satisfaction (CPARS)", value: result.cparsImpact }]
      : []),
    { label: `Capture factors × ${(type === "Recompete" ? 2 * result.ratio : result.ratio * 0.5).toFixed(2)} multiplier`, value: type === "Recompete" ? 2 * result.ratio * result.sumImpact : result.ratio * 0.5 * result.sumImpact },
    { label: `CRS confidence adj. (${result.confLabel})`, value: result.confPwin - result.pwin },
  ].filter((x) => x.value !== 0);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#E0E0F0", maxWidth: 860 }}>

      {/* ── Header ── */}
      <div style={{ ...card, borderLeft: `4px solid ${B.force}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#F0F0FF", letterSpacing: ".02em" }}>
            PWinerator 2.0
          </div>
          <div style={{ fontSize: 11, color: B.silver, marginTop: 3 }}>
            {opp?.name ? `Opportunity: ${opp.name}` : "Probability of Win Calculator · Astrion Methodology"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: B.silver }}>{answeredCount}/{questionsToShow.length} answered</div>
          <div style={{ background: B.border, borderRadius: 4, width: 80, height: 5 }}>
            <div style={{ background: B.sky, borderRadius: 4, height: 5, width: `${completePct}%`, transition: "width .3s" }} />
          </div>
          <button style={{ ...btn(saved ? B.refraction : B.force) }} onClick={handleSave}>
            {saved ? "✓ Saved" : "Save to Opportunity"}
          </button>
        </div>
      </div>

      {/* ── Gauges + inputs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Gauges */}
        <div style={{ ...card, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <PwinGauge value={result.pwin}     label="Calculated"  color={pwinColor(result.pwin)}     size={130} />
          <div style={{ width: 1, height: 80, background: B.border }} />
          <PwinGauge value={result.confPwin} label="Confidence adj." color={pwinColor(result.confPwin)} size={130} />
        </div>

        {/* Setup inputs */}
        <div style={card}>
          <div style={hdg}>Acquisition Setup</div>

          <div style={{ marginBottom: 12 }}>
            <span style={lbl}>Acquisition type</span>
            <div style={{ display: "flex", gap: 8 }}>
              {["Recompete", "Takeaway"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 7,
                    border: `2px solid ${type === t ? B.sky : B.border}`,
                    background: type === t ? B.sky + "22" : "transparent",
                    color: type === t ? B.sky : B.silver,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <span style={lbl}>Awards expected (m)</span>
              <input type="number" min={1} max={10} value={m} onChange={(e) => setM(e.target.value)} style={{ ...inp, width: "100%" }} />
            </div>
            <div>
              <span style={lbl}>Competing teams (n)</span>
              <input type="number" min={1} max={20} value={n} onChange={(e) => setN(e.target.value)} style={{ ...inp, width: "100%" }} />
            </div>
          </div>

          <div>
            <span style={lbl}>Capture Readiness Scorecard (CRS) %</span>
            <input type="number" min={0} max={100} value={crsScore} onChange={(e) => setCrsScore(e.target.value)} placeholder="0–100" style={{ ...inp, width: "100%" }} />
            <div style={{ fontSize: 10, color: B.silver, marginTop: 4 }}>
              ≥76 → High (×1.1) · 51–75 → Moderate (×1.0) · &lt;51 → Low (×0.85)
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { l: "Baseline (m/n)", v: `${Math.round(result.ratio * 100)}%`, c: B.silver },
          { l: "Initial P-Win", v: `${Math.round(result.initial * 100)}%`, c: B.sky },
          { l: "Factor impacts", v: `${result.sumImpact >= 0 ? "+" : ""}${Math.round((result.sumImpact + result.cparsImpact) * 100)}%`, c: impactColor(result.sumImpact + result.cparsImpact) },
          { l: "Confidence", v: result.confLabel || "—", c: confColor(result.confLabel) },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ ...card, marginBottom: 0, textAlign: "center" }}>
            <div style={{ ...lbl, textAlign: "center" }}>{l}</div>
            <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* ── Questions ── */}
      <div style={card}>
        <div style={hdg}>Capture Factor Questions</div>
        {questionsToShow.map((q) => (
          <QuestionRow key={q.id} q={q} value={answers[q.id] || ""} onChange={(v) => setAns(q.id, v)} />
        ))}
      </div>

      {/* ── P-Win Breakdown ── */}
      <div style={card}>
        <div style={hdg}>P-Win Build-up</div>
        <div style={{ maxWidth: 520 }}>
          {breakdownItems.map((item) => (
            <ImpactBar key={item.label} label={item.label} value={item.value} max={result.confPwin || 0.01} />
          ))}
          <div style={{ borderTop: `1px solid ${B.border}`, marginTop: 10, paddingTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#E0E0F0" }}>Final Confidence-Adjusted P-Win</span>
              <span style={{ ...mono, fontSize: 16, fontWeight: 700, color: pwinColor(result.confPwin) }}>
                {Math.round(result.confPwin * 100)}%
              </span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#0C0C1C", borderRadius: 8, borderLeft: `3px solid ${B.silver}` }}>
          <div style={{ fontSize: 10, color: B.silver, fontWeight: 700, marginBottom: 4, letterSpacing: ".08em" }}>FORMULA USED ({type.toUpperCase()})</div>
          <div style={{ ...mono, fontSize: 11, color: "#A0A0D0", lineHeight: 1.7 }}>
            {type === "Recompete"
              ? `P(win) = ${Math.round(result.initial * 100)}% initial + ${Math.round(result.cparsImpact * 100)}% CPARS + (2×${result.ratio.toFixed(2)}) × ${Math.round(result.sumImpact * 100)}% factors`
              : `P(win) = min(20%, m/2n) + (${result.ratio.toFixed(2)}/2) × ${Math.round(result.sumImpact * 100)}% factors`}
          </div>
          <div style={{ ...mono, fontSize: 10, color: B.silver, marginTop: 4 }}>
            Max P(win): {Math.round(result.maxPwin * 100)}% · Ceiling applied: {result.pwin >= result.maxPwin ? "Yes" : "No"}
          </div>
        </div>
      </div>

    </div>
  );
}
