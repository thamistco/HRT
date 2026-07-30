const { useState, useEffect, useRef } = React;

// ── Version & content review stamp ──
// ══════════════════════════════════════════════════════════════
// SECTION 1 — CONTENT & CONSTANTS
// Version stamp, feedback address, and the dated guidance sources
// this tool cites in the UI. Bump TOOL_VERSION and CONTENT_REVIEWED
// together whenever clinical copy changes.
// ══════════════════════════════════════════════════════════════
const TOOL_VERSION = "2.8.0";
const CONTENT_REVIEWED = "30 July 2026";
// Feedback is sent via EmailJS (see FeedbackScreen below) so the destination
// address itself lives only in the EmailJS template config, never in this
// source or in anything a visitor's browser downloads.
const EMAILJS_SERVICE_ID = "service_oox5l5x";
const EMAILJS_TEMPLATE_ID = "template_wj6orvs";
const EMAILJS_PUBLIC_KEY = "20uUF18L4Ugvn9jVq";

// ── Guidance sources this tool is anchored to (patient-facing citations) ──
const SRC_NG23 = "NICE NG23 — Menopause: identification and management, last updated 15 April 2026";
const SRC_BMS = "BMS practical prescribing tool, reviewed May 2026";

// ── Patient-facing resources ──
// The BMS "Tools for Clinicians" PDFs are written for prescribers; BMS directs
// patients to Women's Health Concern (WHC), its patient arm. We link to WHC.
const WHC = {
  base: "https://www.womens-health-concern.org/help-and-advice/factsheets/",
  questions: "https://www.womens-health-concern.org/wp-content/uploads/2026/04/38-NEW-WHC-FACTSHEET-Perimenopause-and-menopause-APRIL2026-A.pdf",
  typesDoses: "https://www.womens-health-concern.org/wp-content/uploads/2026/06/27-NEW-WHC-FACTSHEET-HRT%E2%80%94types-doses-and-regimens-MAY2026-B.pdf",
  benefitsRisks: "https://www.womens-health-concern.org/wp-content/uploads/2022/12/11-WHC-FACTSHEET-HRT-BenefitsRisks-NOV2022-B.pdf",
  bleeding: "https://www.womens-health-concern.org/wp-content/uploads/2026/06/33-NEW-WHC-FACTSHEET-Management-of-unscheduled-bleeding-on-HRT-MAY2026-B.pdf",
  contraception: "https://www.womens-health-concern.org/wp-content/uploads/2025/12/04-NEW-WHC-FACTSHEET-Contraception-for-women-over-the-age-of-40-DEC2025-A.pdf",
  vaginalDryness: "https://www.womens-health-concern.org/wp-content/uploads/2023/11/25-WHC-FACTSHEET-VaginalDryness-OCT2023-B.pdf",
  urogenital: "https://www.womens-health-concern.org/wp-content/uploads/2023/11/23-WHC-FACTSHEET-UrogenitalProblems-OCT2023-B.pdf",
  testosterone: "https://www.womens-health-concern.org/wp-content/uploads/2026/02/22-NEW-WHC-FACTSHEET-Testosterone-for-women-JAN2026-C.pdf",
  migraine: "https://www.womens-health-concern.org/wp-content/uploads/2023/11/18-WHC-FACTSHEET-Migraine-and-HRT-NOV2023-B.pdf",
  breastCancer: "https://www.womens-health-concern.org/wp-content/uploads/2022/12/01-WHC-FACTSHEET-BreastCancer-NOV2022-C.pdf",
  cbt: "https://www.womens-health-concern.org/wp-content/uploads/2026/02/02-NEW-WHC-FACTSHEET-CBT-for-menopausal-symptoms-FEB2026-B.pdf",
  complementary: "https://www.womens-health-concern.org/wp-content/uploads/2025/11/03-NEW-WHC-FACTSHEET-Complementary-And-Alternative-Therapies-NOV2025-B.pdf",
  surgical: "https://www.womens-health-concern.org/wp-content/uploads/2025/09/37-NEW-WHC-FACTSHEET-Surgical-menopause-SEPT2025-B.pdf",
  endometriosis: "https://www.womens-health-concern.org/wp-content/uploads/2026/02/14-NEW-WHC-FACTSHEET-Induced-menopause-info-for-women-FEB2026-B.pdf",
  ablation: "https://www.womens-health-concern.org/wp-content/uploads/2026/03/06-NEW-WHC-FACTSHEET-Endometrial-Ablation-MARCH2026-B.pdf",
  fibroids: "https://www.womens-health-concern.org/wp-content/uploads/2026/03/07-NEW-WHC-FACTSHEET-Fibroids-MARCH2026-A.pdf",
  epilepsy: "https://www.womens-health-concern.org/wp-content/uploads/2024/01/32-WHC-FACTSHEET-Epilepsy-the-menopause-and-HRT-JAN2024-A.pdf",
  findSpecialist: "https://thebms.org.uk/find-a-menopause-specialist/",
};

// ── Meadow palette, calm greens & sky, WCAG-minded ──
const C = {
  skyTop: "#EAF2F1", grassBg: "#F5F7EE",
  card: "#FFFFFF", ink: "#35503C", ink2: "#5C6B5F", line: "#DFE5D8",
  moss: "#47694F", mossDk: "#35503C", mossTint: "#E6EFE3", mossLn: "#CBDCC9",
  stoneBg: "#EFEEE7", stoneTx: "#666D5E",
  sandBg: "#F7EDD9", sandTx: "#8A6320", sandLn: "#E7D3A6",
  clayBg: "#F5E4E0", clayTx: "#99483D", clayLn: "#E3BFB8",
};
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Nunito+Sans:wght@400;600;700;800&family=Spline+Sans+Mono:wght@400;500;600&display=swap');
@keyframes drift1 { from { transform: translateX(-4%);} to { transform: translateX(6%);} }
@keyframes drift2 { from { transform: translateX(5%);} to { transform: translateX(-5%);} }
@keyframes sway { from { transform: translateX(0);} to { transform: translateX(10px);} }
@media (prefers-reduced-motion: reduce) { .cloud, .grasswave { animation: none !important; } }
button:focus-visible { outline: 3px solid #8FB79A; outline-offset: 2px; }
.pathcard { transition: border-color .18s ease, box-shadow .18s ease; }
.steps { display: flex; flex-direction: column; gap: 10px; }
.step { display: flex; gap: 14px; align-items: center; position: relative; padding: 14px 16px; border-radius: 14px; background: #FAFBF6; border: 1px solid #E7ECE0; }
.step .stepnum { position: relative; z-index: 1; }
.step:not(:last-child)::after { content: ""; position: absolute; left: 29px; top: 100%; width: 2px; height: 10px; background: #CBDCC9; }
@media (min-width: 640px) {
  .steps { flex-direction: row; gap: 0; align-items: stretch; }
  .step { flex: 1; padding: 16px 14px; }
  .step:not(:last-child)::after { content: none; }
  .steparrow { display: flex !important; }
}
.sumrow { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.sumval { text-align: right; }
.whychips { padding-left: 74px; }
@media (max-width: 540px) {
  .sumrow { flex-direction: column; align-items: flex-start; gap: 2px; }
  .sumval { text-align: left; }
  .tierchip { display: none; }
  .whychips { padding-left: 16px; }
}
.pathcard:hover { border-color: #47694F !important; box-shadow: 0 8px 24px rgba(53,80,60,.14) !important; }
@media (min-width: 880px) {
  .pathlist { display: grid !important; grid-template-columns: 1fr 1fr; gap: 12px !important; }
  .tierlist { display: grid !important; grid-template-columns: 1fr 1fr; gap: 12px !important; align-items: start; }
}
.optlist { max-width: 680px; }
.algonode:hover { opacity: 0.78; }
`;
const serif = "'Fraunces', Georgia, serif";
const sans = "'Nunito Sans', ui-sans-serif, system-ui, sans-serif";
const mono = "'Spline Sans Mono', ui-monospace, monospace";

// ── Scenery ──
function Clouds() {
  const cloud = (x, y, s, o, anim, dur) => (
    <g className="cloud" style={{ animation: `${anim} ${dur}s ease-in-out infinite alternate` }} opacity={o}>
      <ellipse cx={x} cy={y} rx={38 * s} ry={13 * s} fill="#fff" />
      <ellipse cx={x - 22 * s} cy={y + 4 * s} rx={22 * s} ry={10 * s} fill="#fff" />
      <ellipse cx={x + 24 * s} cy={y + 5 * s} rx={24 * s} ry={11 * s} fill="#fff" />
    </g>
  );
  return (
    <svg viewBox="0 0 1600 160" width="100%" height="140" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }} aria-hidden="true">
      {cloud(90, 46, 0.7, 0.55, "drift2", 32)}
      {cloud(300, 34, 1, 0.85, "drift1", 26)}
      {cloud(560, 70, 0.6, 0.55, "drift2", 36)}
      {cloud(780, 26, 0.8, 0.7, "drift1", 30)}
      {cloud(1020, 58, 0.65, 0.6, "drift2", 33)}
      {cloud(1240, 38, 0.9, 0.75, "drift1", 27)}
      {cloud(1470, 66, 0.6, 0.5, "drift2", 31)}
    </svg>
  );
}
function Grass() {
  return (
    <svg viewBox="0 0 1600 70" width="100%" height="56" preserveAspectRatio="none" style={{ display: "block", marginTop: 26 }} aria-hidden="true">
      <path className="grasswave" style={{ animation: "sway 9s ease-in-out infinite alternate" }} d="M0 42 Q 80 22 160 38 T 320 36 T 480 40 T 640 34 T 800 38 T 960 36 T 1120 40 T 1280 34 T 1440 38 T 1600 34 V 70 H 0 Z" fill="#CFE0C2" />
      <path className="grasswave" style={{ animation: "sway 12s ease-in-out infinite alternate-reverse" }} d="M0 52 Q 90 36 180 50 T 360 48 T 540 52 T 640 46 T 820 50 T 1000 48 T 1180 52 T 1360 46 T 1600 50 V 70 H 0 Z" fill="#AFCB9F" />
      <path d="M0 60 Q 110 48 220 58 T 440 58 T 640 56 T 860 58 T 1080 58 T 1300 56 T 1600 58 V 70 H 0 Z" fill="#8FB77E" />
    </svg>
  );
}

// ── Method illustrations ──
function Icon({ id, size = 46 }) {
  const s = C.mossDk, f = C.mossTint;
  const P = (d, extra) => <path d={d} fill="none" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...extra} />;
  const wrap = (kids) => <svg width={size} height={size} viewBox="0 0 46 46" aria-hidden="true" style={{ flexShrink: 0 }}>{kids}</svg>;
  switch (id) {
    case "patch": return wrap(<><rect x="8" y="12" width="30" height="22" rx="7" fill={f} stroke={s} strokeWidth="1.6" /><rect x="14" y="18" width="18" height="10" rx="4" fill="#fff" stroke={s} strokeWidth="1.3" />{P("M12 15.5h3M31 30.5h3")}</>);
    case "gel": return wrap(<><rect x="15" y="16" width="16" height="22" rx="4" fill={f} stroke={s} strokeWidth="1.6" />{P("M19 16v-4h5v4M24 12h4l2 3h-6z")}<circle cx="23" cy="27" r="3.4" fill="#fff" stroke={s} strokeWidth="1.3" /></>);
    case "pill": return wrap(<><circle cx="18" cy="24" r="8" fill={f} stroke={s} strokeWidth="1.6" />{P("M13 21c3 2 7 2 10 0")}<ellipse cx="31" cy="27" rx="7" ry="4.6" transform="rotate(-24 31 27)" fill="#fff" stroke={s} strokeWidth="1.6" />{P("M28.4 30.4l5.2-6.8")}</>);
    case "combo": return wrap(<><rect x="7" y="13" width="24" height="18" rx="6" fill={f} stroke={s} strokeWidth="1.6" /><circle cx="33" cy="30" r="7" fill="#fff" stroke={s} strokeWidth="1.6" />{P("M29.5 30h7M13 19h12M13 25h8")}</>);
    case "coil": return wrap(<>{P("M23 12v22", { strokeWidth: 2 })}{P("M12 14c4 4 7 4 11 0c4 4 7 4 11 0", { strokeWidth: 2 })}{P("M20 34c0 3 6 3 6 0")}<circle cx="23" cy="12" r="2.4" fill={f} stroke={s} strokeWidth="1.4" /></>);
    case "vaginal": return wrap(<><rect x="12" y="19" width="18" height="8" rx="4" fill={f} stroke={s} strokeWidth="1.6" /><rect x="30" y="20.5" width="6" height="5" rx="2.4" fill="#fff" stroke={s} strokeWidth="1.4" /><circle cx="17" cy="23" r="1.6" fill={s} /></>);
    case "capsule": return wrap(<><rect x="11" y="18" width="24" height="11" rx="5.5" transform="rotate(-18 23 23)" fill="#fff" stroke={s} strokeWidth="1.6" /><path d="M21.3 15.6l3.7 11.4c-6 2-9.5 1-11.2-4.2c-1.2-3.8 1.5-6.4 7.5-7.2z" fill={f} stroke={s} strokeWidth="1.6" strokeLinejoin="round" /></>);
    case "ring": return wrap(<><circle cx="23" cy="23" r="10" fill="none" stroke={s} strokeWidth="3.4" /><circle cx="23" cy="23" r="10" fill="none" stroke={f} strokeWidth="1.6" /></>);
    case "dial": return wrap(<><circle cx="23" cy="24" r="12" fill={f} stroke={s} strokeWidth="1.6" />{P("M23 24l6-6")}<circle cx="23" cy="24" r="2" fill={s} /></>);
    case "swap": return wrap(<>{P("M12 18h18l-4-4M34 28H16l4 4")}</>);
    case "clock": return wrap(<><circle cx="23" cy="23" r="12" fill={f} stroke={s} strokeWidth="1.6" />{P("M23 16v7l5 3")}</>);
    case "shield": return wrap(<><path d="M23 11l10 4v8c0 7-4.5 10.5-10 12c-5.5-1.5-10-5-10-12v-8z" fill={f} stroke={s} strokeWidth="1.6" strokeLinejoin="round" />{P("M18 23l4 4 7-8")}</>);
    case "down": return wrap(<>{P("M23 12v18M16 24l7 7 7-7")}</>);
    case "drop": return wrap(<><path d="M23 12c5 6 8 10 8 14a8 8 0 1 1-16 0c0-4 3-8 8-14z" fill={f} stroke={s} strokeWidth="1.6" strokeLinejoin="round" /></>);
    default: return wrap(<circle cx="23" cy="23" r="10" fill={f} stroke={s} strokeWidth="1.6" />);
  }
}

// ── Question data (CKS May 2026 aligned) ──
// ══════════════════════════════════════════════════════════════
// SECTION 2 — CLINICAL CONTENT & QUESTION DATA
// The question text, options, and red-flag/caution definitions.
// Wording here is patient-facing; see SECTION 3 for the underlying
// safety logic and SECTION 4 (Clinical notes blocks) for the
// full-precision version aimed at professionals.
// ══════════════════════════════════════════════════════════════
const RISK = [
  { v: "bmi30", label: "BMI 30 or over" },
  { v: "pvte", label: "A blood clot in the past that had a clear cause", note: "e.g. after surgery, a flight, pregnancy or the pill" },
  { v: "fvte", label: "Family history of blood clots" },
  { v: "migraine", label: "Migraine, with or without aura", note: "Migraine with aura is not a contraindication to transdermal (skin) HRT, because the skin route avoids the extra clot risk that oral oestrogen carries in this group. Migraine with aura is a contraindication to the combined oral contraceptive pill." },
  { v: "cvd", label: "A heart attack or stroke in the past, fully recovered, over a year ago" },
  { v: "gallbladder", label: "Gallbladder disease or gallstones" },
  { v: "htn", label: "High blood pressure (controlled)" },
  { v: "dm", label: "Diabetes" },
  { v: "smoker", label: "Current smoker" },
  { v: "endo", label: "Endometriosis, current or previous" },
  { v: "fibroids", label: "Uterine fibroids" },
  { v: "enzyme", label: "Medicines that speed the liver up", note: "e.g. carbamazepine, some epilepsy or TB treatments" },
  { v: "fhbreast", label: "Close family history of breast cancer" },
];

const needsProg = (a) => a.uterus === "intact" || a.uterus === "ablation";
const under50 = (a) => ["u40", "40to44", "45to49"].includes(a.age);
const canConceive = (a) => needsProg(a) && !["55to59", "60plus"].includes(a.age) && (a.timing === "peri" || (a.timing === "post" && under50(a)));
const fvteStrong = (a) => !!(a.fvteStep2 && (a.fvteStep2.includes("under45") || a.fvteStep2.includes("multiple")));

function nextScreen(cur, a) {
  switch (cur) {
    case "intro": return "redflags";
    case "redflags": return a.redflags && a.redflags.length ? "outcome" : "age";
    case "age": return a.mode === "adjust" ? "uterus" : "uterus";
    case "uterus": return a.mode === "adjust" ? "adjRegimen" : "symptoms";
    case "symptoms": return a.symptoms === "vaginal" ? "outcome" : (needsProg(a) ? "timing" : "risk");
    case "timing": return "risk";
    case "risk": return (a.risk && a.risk.includes("fvte")) ? "fvteStep1" : (canConceive(a) ? "contraception" : "prefs");
    case "fvteStep1": return a.fvteStep1 === "yes" ? "fvteStep2" : (canConceive(a) ? "contraception" : "prefs");
    case "fvteStep2": return fvteStrong(a) ? "outcome" : (canConceive(a) ? "contraception" : "prefs");
    case "contraception": return "prefs";
    case "prefs": return "outcome";
    case "adjRegimen": return "adjDuration";
    case "adjDuration": return "adjReasons";
    case "adjReasons": return "outcome";
    default: return "outcome";
  }
}

const SCREENS = {
  redflags: {
    kind: "multi",
    q: "Before we look at treatment options, do any of these apply?",
    sub: "None of these rules out treatment. They mean a clinician should look first. Tick any that apply, or choose none.",
    options: [
      { v: "breast", label: "Breast cancer, now, in the past, or suspected" },
      { v: "othercancer", label: "Another hormone-sensitive cancer", note: "e.g. cancer of the uterus lining" },
      { v: "hyperplasia", label: "Thickened uterus lining (endometrial hyperplasia) that hasn't been treated" },
      { v: "bleed", label: "Unexplained vaginal bleeding that hasn't been checked" },
      { v: "avte", label: "A blood clot being treated right now" },
      { v: "ivte", label: "A blood clot in the past that had no clear cause" },
      { v: "thrombophilia", label: "A diagnosed clotting disorder (thrombophilia)" },
      { v: "arterial", label: "A heart attack or stroke recently, or angina now" },
      { v: "liver", label: "Active liver disease with abnormal blood tests" },
      { v: "preg", label: "Possible pregnancy" },
    ],
    none: "None of these",
  },
  age: {
    q: "How old are you?",
    sub: "Under 45 changes the picture, and the age bands set the contraception rules.",
    options: [
      { v: "u40", label: "Under 40", note: "Possible premature ovarian insufficiency (POI)" },
      { v: "40to44", label: "40–44", note: "Possible early menopause" },
      { v: "45to49", label: "45–49" },
      { v: "50to54", label: "50–54" },
      { v: "55to59", label: "55–59" },
      { v: "60plus", label: "60 or over" },
    ],
  },
  symptoms: {
    q: "What symptoms are you hoping to improve?",
    sub: "Vaginal or urinary symptoms alone have a simpler, local treatment path.",
    options: [
      { v: "systemic", label: "Hot flushes, sweats, sleep or mood", note: "Body-wide symptoms" },
      { v: "both", label: "Both, body-wide and vaginal / urinary" },
      { v: "vaginal", label: "Vaginal / urinary only", note: "Dryness, discomfort, recurrent UTI" },
    ],
  },
  uterus: {
    q: "Do you still have a uterus (womb)?",
    sub: "This is about anatomy, not identity. With a uterus, oestrogen usually needs a second, protective hormone alongside it to keep the lining safe. After a hysterectomy (surgery to remove the uterus), oestrogen alone is normally enough.",
    options: [
      { v: "intact", label: "Yes" },
      { v: "ablation", label: "Yes, but I've had endometrial ablation" },
      { v: "none", label: "No, I've had a hysterectomy", note: "If you had a subtotal hysterectomy (cervical stump retained), a small amount of endometrium may remain. Discuss with your prescriber whether a progestogen is needed before defaulting to oestrogen-only HRT." },
    ],
  },
  timing: {
    q: "Where are you in the transition?",
    sub: "Still bleeding means a monthly pattern of the protective hormone; past it means an everyday, bleed-free pattern.",
    options: [
      { v: "peri", label: "Still having periods, or my last one was under 12 months ago" },
      { v: "post", label: "No period for 12 months or more" },
    ],
  },
  risk: {
    kind: "multi",
    q: "Do any of these apply to you?",
    sub: "Most don't rule anything out; they steer which route fits best. Tick all that apply, or none.",
    options: RISK,
    none: "None of these",
  },
  contraception: {
    q: "Could you still become pregnant?",
    sub: "HRT is not contraception. If there's any chance you could conceive, you need a separate method alongside it.",
    options: [
      { v: "yes", label: "Yes, I still need cover" },
      { v: "no", label: "No, not needed", note: "e.g. partner vasectomy, sterilisation" },
    ],
  },
  prefs: {
    kind: "multi",
    q: "What matters most to you when choosing a treatment?",
    sub: "This reorders your options. It never overrides safety. Tick any that apply, or none.",
    options: [
      { v: "simple", label: "Simplest possible routine", note: "Fewest products and steps to remember" },
      { v: "bodyident", label: "Body-identical hormones", note: "Regulated NHS versions. Not compounded 'bioidentical' HRT, which isn't recommended" },
      { v: "nocoil", label: "I'd rather avoid a coil", note: "No intrauterine device" },
      { v: "nodaily", label: "Nothing I have to do every day", note: "Weekly or fit-and-forget preferred" },
    ],
    none: "No strong preferences",
  },
  adjRegimen: {
    q: "What are you taking at the moment?",
    sub: "Pick the closest match. Not sure is a fair answer.",
    options: [
      { v: "estSkin", label: "Oestrogen only, patch, gel or spray" },
      { v: "estSkinProg", label: "Oestrogen patch, gel or spray + separate progesterone capsule", note: "e.g. Utrogestan® or Gepretix®. The oestrogen and the progesterone come as two separate items." },
      { v: "estTab", label: "Oestrogen only, tablet" },
      { v: "seq", label: "Combined, with a monthly bleed", note: "e.g. Evorel Sequi, Femoston 1/10" },
      { v: "cont", label: "Combined, taken every day, no planned bleed", note: "e.g. Evorel Conti, Kliovance, Bijuve" },
      { v: "ius", label: "Oestrogen plus a hormonal coil (e.g. Mirena)" },
      { v: "tibolone", label: "Tibolone (Livial)" },
      { v: "unsure", label: "I'm not sure" },
    ],
  },
  adjDuration: {
    q: "How long have you been on this regimen?",
    sub: "Some changes are best made early, others after a fair trial.",
    options: [
      { v: "under3", label: "Under 3 months" },
      { v: "threeTo12", label: "3–12 months" },
      { v: "oneTo5", label: "1–5 years" },
      { v: "over5", label: "Over 5 years" },
    ],
  },
  adjReasons: {
    kind: "multi",
    q: "What would you like to change, and why?",
    sub: "Suggestions are ranked against what you tick.",
    options: [
      { v: "flushes", label: "Flushes, sweats or sleep still not controlled" },
      { v: "oestroSE", label: "Side effects, bloating, breast tenderness, nausea or headaches" },
      { v: "progSE", label: "Side effects, low mood, irritability, PMS-like feelings or acne" },
      { v: "bleeding", label: "Bleeding that's irregular, heavy or unexpected" },
      { v: "libido", label: "Low sex drive despite treatment" },
      { v: "gu", label: "Vaginal dryness or urinary symptoms persist" },
      { v: "hassleRoute", label: "The product itself is a hassle", note: "Patch irritation or peeling, gel drying time" },
      { v: "bodyident", label: "I'd like body-identical hormones", note: "Regulated versions, not compounded 'bioidentical' preparations" },
      { v: "simpler", label: "I'd like a simpler routine" },
      { v: "contraNeed", label: "I also need contraception" },
      { v: "stopping", label: "I'm thinking about reducing or stopping" },
    ],
    none: "None of these, general review",
  },
};

const REFER_TEXT = {
  breast: "Breast cancer, now, past or suspected, means HRT that works throughout the body isn't prescribed, and any decision sits with your breast or menopause specialist. Even vaginal oestrogen needs their agreement, especially alongside an aromatase inhibitor.",
  othercancer: "A hormone-sensitive cancer, such as of the uterus lining, needs specialist agreement before any HRT.",
  hyperplasia: "A thickened uterus lining that hasn't been treated must be managed first; HRT isn't started or continued until it's resolved.",
  bleed: "Unexplained bleeding must be investigated, and uterus-lining causes ruled out, before hormones are started or changed.",
  avte: "A clot under active treatment needs the clot team's input first.",
  ivte: "A past clot with no clear cause means oral HRT is not appropriate. Transdermal (skin) HRT may still be an option for some people after careful risk assessment with a haematologist or menopause specialist. This is not a routine primary care decision; specialist input is needed before any HRT is considered.",
  fvteStrong: "NICE NG23 1.5.29 recommends considering haematology assessment before HRT for people at high risk of VTE, including those with a strong family history. Note: NG23 does not define 'strong'. This tool operationalises it as a first-degree relative with an unprovoked VTE under 45, or two or more first-degree relatives with unprovoked VTE at any age. That threshold is the tool's own, not a NICE-specified figure; your clinician may weigh a borderline case differently.",
  thrombophilia: "A diagnosed clotting disorder means HRT isn't prescribed routinely; a haematology or menopause specialist should weigh any decision.",
  arterial: "A recent heart attack or stroke, or current angina, means hormone treatment waits; cardiology and menopause specialists decide together if and when it's safe.",
  liver: "Active liver disease needs a diagnosis first. If HRT is used later, the skin route avoids the liver's first pass.",
  preg: "Pregnancy needs ruling out first; HRT is not used in pregnancy.",
};

// ══════════════════════════════════════════════════
// RANKING ENGINE
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// SECTION 3 — RANKING / DECISION ENGINE
// Pure functions: given the person's answers, return tiered options.
// Safety-relevant branches carry an inline comment explaining the
// guideline rationale, so a later edit doesn't silently drop it.
// ══════════════════════════════════════════════════════════════
function rankOptions(a) {
  const uterus = needsProg(a); // rationale: a uterus (or ablation, lining may remain) needs a progestogen; hysterectomy does not (CKS, May 2026)
  const peri = a.timing === "peri";
  const risks = a.risk || [];
  const has = (r) => risks.includes(r);
  const prefs = a.prefs || [];
  const pref = (p) => prefs.includes(p);
  const contra = canConceive(a) && a.contraception === "yes";
  const age60plus = a.age === "60plus";
  const age55plus = a.age === "55to59" || a.age === "60plus";
  const lateInit = age55plus; // transdermal is first-line for everyone 55+
  const poi = a.age === "u40" || a.age === "40to44";
  const realRouteRisk = risks.filter((r) => !["endo", "fibroids", "fhbreast"].includes(r)).length > 0;
  const routeRisk = realRouteRisk || lateInit; // steers oestrogen to the skin route
  const anyRisk = routeRisk;
  // Oral oestrogen: vetoed only from 60+ (or clot/heart history). At 55–59 it is not vetoed,
  // but deprioritised where a real cardiovascular/VTE/BMI risk factor is present (realRouteRisk).
  const oralVeto = has("pvte") || has("cvd") || age60plus;
  const oralDepri = realRouteRisk;

  const seqTag = peri ? "monthly pattern, a monthly bleed" : "everyday pattern, bleed-free";
  const progLine = peri
    ? "Utrogestan® or Gepretix® 200 mg at night, 12 nights a month (days 15–26)"
    : "Utrogestan® or Gepretix® 100 mg every night";
  const progAlts = peri
    ? "If capsules don't suit: dydrogesterone 10 mg (12–14 days; not with any meningioma history), medroxyprogesterone 10 mg or norethisterone 5 mg (12 days)"
    : "If capsules don't suit: medroxyprogesterone (min 2.5 mg) or norethisterone (min 0.5 mg) daily";

  const opts = [];
  const add = (o) => opts.push(o);

  {
    let score = 70; const why = [];
    if (anyRisk) { score += 8; why.push("Skin route: no measurable rise in clot or stroke risk at usual doses, which fits your answers"); }
    if (pref("bodyident")) { score += 12; why.push("Both parts are body-identical"); }
    if (pref("nodaily") && !uterus) { score += 6; why.push("Twice-weekly patch, nothing daily"); }
    if (pref("nodaily") && uterus) { score -= 2; }
    if (pref("simple") && uterus) { score -= 6; why.push("Two products to manage"); }
    if (has("gallbladder")) why.push("Avoids the gallstone risk of tablets");
    if (has("enzyme")) { why.push("Skin route avoids the interaction with your liver-enzyme medicine"); }
    add({
      id: "patch", icon: "patch",
      name: uterus ? "Oestrogen patch + progesterone capsules" : "Oestrogen patch",
      tag: uterus ? `Body-identical pair · ${seqTag}` : "Body-identical · twice-weekly",
      score, why,
      how: uterus
        ? "A small clear patch worn below the waist, changed twice a week, plus a progesterone capsule at bedtime to keep the uterus lining safe."
        : "A small clear patch worn below the waist, changed twice a week. Nothing else needed.",
      brands: [
        "Patch: Evorel® (25, 50, 75, 100 µg/24h) or Estradot® (25, 37.5, 50, 75, 100 µg/24h), start at 25, change twice weekly",
        ...(uterus ? ["Progesterone: " + progLine + ", swallowed as a capsule. It must not be given through the skin; absorption is too variable to protect the lining. If capsules cause side effects, a prescriber can consider the vaginal route off-licence at the same dose and duration", progAlts] : []),
      ],
      pros: ["Lowest clot risk of any route", "Easy to step the dose up or down", uterus ? "Progesterone at night can help sleep" : "Single product", "Body-identical hormones"],
      cons: ["Can irritate skin or peel at the edges", "Visible on the skin", ...(uterus ? ["Two things to remember"] : []), "Some sizes go short at times, pharmacies can advise (NHS SPS tracks shortages)"],
    });
  }

  {
    let score = 68; const why = [];
    if (anyRisk) { score += 8; why.push("Skin route: no measurable rise in clot or stroke risk at usual doses"); }
    if (pref("bodyident")) { score += 12; why.push("Body-identical throughout"); }
    if (pref("nodaily")) { score -= 10; why.push("Needs applying every day"); }
    if (pref("simple") && uterus) { score -= 6; }
    if (has("enzyme")) { why.push("Skin route avoids the interaction with your liver-enzyme medicine"); }
    add({
      id: "gel", icon: "gel",
      name: uterus ? "Oestrogen gel or spray + progesterone capsules" : "Oestrogen gel or spray",
      tag: uterus ? `Daily application · ${seqTag}` : "Daily application · fine dose control",
      score, why,
      how: uterus
        ? "Gel rubbed into the arm or thigh (or a quick spray on the forearm) once daily, plus a progesterone capsule at bedtime."
        : "Gel rubbed into the arm or thigh, or a quick spray on the forearm, once daily.",
      brands: [
        "Gel: Oestrogel® pump, 0.75 mg per pump, usually 2 pumps daily (up to 4) · Sandrena® sachets 0.5 mg or 1 mg daily",
        "Spray: Lenzetto®, 1.53 mg per spray, 1–3 sprays daily",
        ...(uterus ? ["Progesterone: " + progLine, progAlts] : []),
      ],
      pros: ["Lowest clot risk of any route", "Very fine dose adjustment", "Invisible once dry", "Body-identical"],
      cons: ["A daily task", "Needs a few minutes to dry; avoid skin contact with others just after applying", ...(uterus ? ["Two things to remember"] : [])],
    });
  }

  if (uterus) {
    let score = 66; const why = []; let veto = false;
    if (contra) { score += 22; why.push("Covers your contraception at the same time, one fitting solves both"); }
    if (pref("nocoil")) { veto = true; why.push("You'd rather avoid a coil"); }
    if (a.uterus === "ablation") { score -= 18; why.push("After ablation the cavity can be scarred, so a coil may be difficult to place or keep in"); }
    if (pref("simple") || pref("nodaily")) { score += 8; why.push("Fit-and-forget protection for the lining"); }
    if (anyRisk) { score += 4; why.push("Hormone dose to the body is tiny"); }
    if (veto) score = -1;
    add({
      id: "ius", icon: "coil",
      name: "Oestrogen (patch, gel or spray) + hormonal coil",
      tag: "52 mg LNG-IUS · fit-and-forget",
      score, why,
      how: "A one-off coil fitting protects the uterus lining for years; day to day you take only the oestrogen, by patch, gel or spray.",
      brands: [
        "Coil: any 52 mg LNG-IUS, changed every 5 years in this role. Mirena® holds a 4-year UK licence for endometrial protection within HRT. Levosert® and Benilexa® (also 52 mg LNG-IUS) are not licensed for this indication, but CoSRH supports use of any 52 mg LNG-IUS for endometrial protection for up to 5 years, off-label. Prescribe and dispense by brand name (MHRA), as devices differ in indication and duration",
        "It must be a 52 mg coil. The lower-dose coils (Kyleena® 19.5 mg, Jaydess® 13.5 mg) do not protect the uterus lining, so if one is in place for contraception, a separate progestogen is still needed",
        "Oestrogen (skin route, started low and adjusted to symptoms): a patch (Evorel®/Estradot®, from 25 µg twice weekly), gel (Oestrogel® about 2 pumps daily, or Sandrena® 0.5–1 mg), or spray (Lenzetto® 1–3 sprays daily)",
      ],
      pros: [contra ? "Contraception included" : "No monthly progestogen routine", "Usually little or no bleeding after the first months", "Lowest-dose progestogen option", "Good if progestogen tablets cause side effects, or cyclical bleeds are heavy"],
      cons: ["A fitting procedure, which can be uncomfortable", "Irregular spotting for the first 3–6 months", "Coil change needed at 5 years in this role"],
    });
  }

  if (uterus) {
    let score = 62; const why = [];
    if (pref("simple")) { score += 14; why.push("One patch does the whole job"); }
    if (pref("nodaily")) { score += 12; why.push("Changed weekly or twice-weekly, nothing daily"); }
    if (anyRisk) { score += 4; why.push("Skin route for the oestrogen"); }
    if (has("pvte") || has("fvte") || has("cvd")) { score -= 16; why.push("Contains a synthetic progestogen, micronised progesterone is the gentler choice for clot risk"); }
    if (pref("bodyident")) { score -= 10; why.push("The progestogen part is synthetic"); }
    add({
      id: "combpatch", icon: "combo",
      name: "All-in-one combined patch",
      tag: `Single product · ${seqTag}`,
      score, why,
      how: "One patch contains both hormones. Stick it on and change it on schedule; nothing else to take.",
      brands: peri
        ? ["Evorel Sequi®, twice-weekly (estradiol patches for 2 weeks, then estradiol + norethisterone). FemSeven Sequi was discontinued in March 2025, so Evorel Sequi® is the remaining combined sequential patch", "Alternatively, an oestrogen patch plus separate oral micronised progesterone allows finer dose control"]
        : ["Evorel Conti®, 50 µg estradiol + 170 µg norethisterone, changed twice weekly", "FemSeven Conti®, 50 µg estradiol + 7 µg levonorgestrel, changed once weekly"],
      pros: ["Simplest routine of all", "Skin route for the oestrogen"],
      cons: ["Fixed 50 µg oestrogen dose, no fine tuning", "Combined patches only come with norethisterone or levonorgestrel, slightly less favourable for clot risk than micronised progesterone", "Supply of some patch brands fluctuates"],
    });
  }

  if (uterus) {
    let score = 58; const why = [];
    if (oralVeto) { score = -1; why.push(age60plus ? "From 60, oral tablets are avoided as the oral route's stroke risk rises with age, skin route only" : "With your clot / heart history, tablets aren't recommended, skin route only"); }
    else if (oralDepri) { score -= 20; why.push("Tablets carry a small clot and stroke risk that the skin route avoids, less suitable given your answers"); }
    else if (lateInit) { score -= 8; why.push("Transdermal is first-line from 55; a tablet is still an option if you have no clot, heart or BMI risk factors"); }
    if (has("gallbladder") && score > 0) { score -= 10; why.push("Oral oestrogen raises gallstone risk"); }
    if (pref("simple") && score > 0) { score += 12; why.push("One tablet a day"); }
    if (pref("bodyident") && !peri && score > 0) { score += 8; why.push("Bijuve® is a fully body-identical one-a-day option"); }
    add({
      id: "combtab", icon: "pill",
      name: "All-in-one combined tablet",
      tag: `One tablet daily · ${seqTag}`,
      score, why,
      how: "A single daily tablet containing both hormones.",
      brands: peri
        ? ["Femoston® 1/10 or 2/10, estradiol + dydrogesterone (gentlest synthetic for clot and breast risk; avoid with any meningioma history)", "Elleste Duet® 1 mg or 2 mg, estradiol + norethisterone"]
        : ["Femoston Conti® 0.5/2.5 or 1/5, estradiol + dydrogesterone (avoid with any meningioma history)", "Kliovance® 1 mg/0.5 mg · Kliofem® 2 mg/1 mg, estradiol + norethisterone", "Bijuve® 1 mg/100 mg, body-identical estradiol + micronised progesterone in one capsule"],
      pros: ["One tablet, no patches or gels", "Dydrogesterone and Bijuve® options are the gentler choices within tablets"],
      cons: ["Oral oestrogen carries a small extra clot and stroke risk that skin routes avoid", "Raises gallstone risk", "Less dose flexibility"],
    });
  }

  if (!uterus) {
    let score = 58; const why = [];
    if (oralVeto) { score = -1; why.push(age60plus ? "From 60, oral tablets are avoided as the oral route's stroke risk rises with age, skin route only" : "With your clot / heart history, tablets aren't recommended, skin route only"); }
    else if (oralDepri) { score -= 20; why.push("Tablets carry a small clot and stroke risk the skin route avoids"); }
    else if (lateInit) { score -= 8; why.push("Transdermal is first-line from 55; a tablet is still an option if you have no clot, heart or BMI risk factors"); }
    if (has("gallbladder") && score > 0) { score -= 10; why.push("Oral oestrogen raises gallstone risk"); }
    if (pref("simple") && score > 0) { score += 10; why.push("One tablet a day"); }
    add({
      id: "oralest", icon: "pill",
      name: "Oestrogen tablet",
      tag: "One tablet daily",
      score, why,
      how: "A single daily estradiol tablet.",
      brands: ["Elleste Solo®, Progynova® or Zumenon®, estradiol 1 mg or 2 mg daily (all body-identical estradiol)"],
      pros: ["Simple daily routine", "Body-identical estradiol"],
      cons: ["Small extra clot and stroke risk vs the skin route", "Raises gallstone risk"],
    });
  }

  if (a.timing === "post" || (!uterus && (a.age === "55to59" || a.age === "60plus"))) {
    let score = 48; const why = [];
    if (has("pvte") || has("cvd")) { score = -1; why.push("It's an oral hormone, not recommended with your clot / heart history"); }
    else if (age60plus) { score = -1; why.push("MHRA advises against starting tibolone at 60 or over because of increased stroke risk from the first year of use"); }
    else if (anyRisk) { score -= 12; why.push("Oral route, skin options fit your answers better"); }
    if (pref("simple") && score > 0) { score += 8; why.push("One small tablet daily"); }
    add({
      id: "tibolone", icon: "capsule",
      name: "Tibolone",
      tag: "One tablet daily · after the menopause only",
      score, why,
      how: "A single daily tablet that acts like oestrogen, progestogen and a little testosterone combined. Only for people whose periods finished over a year ago.",
      brands: ["Tibolone (Livial®) 2.5 mg once daily"],
      pros: ["One product covers everything, no separate progestogen even with a uterus", "The mild testosterone-like action can help low libido and energy"],
      cons: ["Oral. MHRA advises against initiating at age 60 or over, based on increased stroke risk from the first year of use (LIFT trial, women aged 60–79). BMS (May 2026) likewise cautions against use over 60 because of cerebrovascular risk", "Can't be used while still perimenopausal", "Not after breast cancer"],
    });
  }

  if (peri && under50(a) && risks.length === 0 && contra) {
    add({
      id: "coc", icon: "pill",
      name: "Combined contraceptive pill instead of HRT",
      tag: "One product · symptoms + contraception · until 50",
      score: 72,
      why: ["You're under 50, low-risk, and still need contraception, one pill can cover both jobs"],
      how: "Instead of HRT plus separate contraception, a combined pill treats flushes, sweats and irregular bleeding while preventing pregnancy. Never taken alongside HRT; it's one or the other, with a switch to HRT at 50.",
      brands: ["Any suitable combined pill after the standard safety checks; Qlaira® and Zoely® contain body-identical estradiol rather than ethinylestradiol. Zoely® must not be used by anyone who has, or has had, a meningioma (FSRH CEU Statement, April 2023, nomegestrol acetate)"],
      pros: ["One product, two jobs", "Regulates erratic perimenopausal bleeding", "Protects bone like HRT does"],
      cons: ["Stricter safety rules than HRT, migraine with aura, smoking, BMI and blood pressure all matter more", "Must stop at 50 and switch", "Slightly less favourable blood-pressure effect than HRT"],
    });
  }

  opts.sort((x, y) => y.score - x.score);
  const top = opts.filter((o) => o.score >= 68);
  const mid = opts.filter((o) => o.score >= 45 && o.score < 68);
  const low = opts.filter((o) => o.score >= 0 && o.score < 45);
  const no = opts.filter((o) => o.score < 0);

  const extras = { poi, contra, lateInit, ablation: a.uterus === "ablation", endo: has("endo"), migraine: has("migraine"), smoker: has("smoker"), both: a.symptoms === "both", under50: under50(a), anyRisk, htn: has("htn"), dm: has("dm"), fibroids: has("fibroids"), enzyme: has("enzyme"), fhbreast: has("fhbreast") };
  return { top, mid, low, no, extras };
}

// ── Adjustment engine, for people already on HRT ──
function rankAdjust(a) {
  const uterus = needsProg(a);
  const reasons = a.reasons || [];
  const R = (r) => reasons.includes(r);
  const dur = a.duration;
  const early = dur === "under3";
  const lateAge = a.age === "55to59" || a.age === "60plus";
  const by54 = a.age === "50to54" || lateAge;
  const reg = a.regimen;
  const oral = reg === "estTab";
  const fixedCombo = reg === "cont" || reg === "seq"; // may be a fixed-dose product

  const flags = {
    unopposed: uterus && (reg === "estSkin" || reg === "estTab"),
    bleedAssess: R("bleeding") && !early,
    earlyBleed: R("bleeding") && early,
    noUterusCombined: !uterus && (reg === "seq" || reg === "cont"),
    unsure: reg === "unsure",
  };

  const opts = [];
  const add = (o) => opts.push(o);

  if (flags.unsure) {
    add({
      id: "identify", icon: "swap", score: 90,
      name: "Pin down what you're on first",
      tag: "The starting point for any change",
      why: ["You weren't sure of your current regimen, that's step one"],
      how: "Bring the boxes, a photo of them, or your repeat prescription to your review. The right adjustment depends entirely on what you're taking now, the dose, the route, and whether it contains a progestogen.",
      brands: ["Your pharmacy can print a full list of your current prescriptions if the boxes are long gone"],
      pros: ["Takes two minutes and makes the whole review sharper"],
      cons: ["No change can be safely suggested until this is known"],
    });
  }

  if (flags.unopposed) {
    add({
      id: "protectNow", icon: "shield", score: 96,
      name: "Add protection for the uterus lining",
      tag: "A safety gap to close, not a preference",
      why: ["You have a uterus but your regimen has no progestogen, the lining is unprotected"],
      how: "Oestrogen on its own thickens the uterus lining, and more than 6 months unopposed is a major risk factor for cancer of the uterus lining. A progestogen closes the gap: that can be capsules, a combined product, or a hormonal coil. Book a GP appointment soon rather than waiting for a routine review, and mention any bleeding.",
      brands: ["Micronised progesterone (Utrogestan®/Gepretix®) 100 mg nightly (everyday pattern) or 200 mg ×12 nights (monthly pattern)", "Or a 52 mg LNG-IUS, protects the lining for 5 years"],
      pros: ["Closes a genuine safety gap", "Several ways to do it, the rest of your regimen can stay"],
      cons: ["Needs a prompt appointment, not a note for next year"],
    });
  }

  if (!flags.unsure && early && (R("flushes") || R("oestroSE") || R("progSE"))) {
    add({
      id: "wait3", icon: "clock", score: 88,
      name: "Give it the full three months",
      tag: "Most early problems settle on their own",
      why: ["You've been on this under 3 months, both symptoms and side effects usually improve by the 3-month mark"],
      how: "Hormone levels take around three months to steady. Early bloating, breast tenderness, spotting and incomplete symptom relief all commonly settle in that window. Changing too soon makes it hard to tell what's working.",
      brands: ["No prescription change, a review booked for the 3-month point is the move"],
      pros: ["Avoids chasing a moving target", "Many people need no change at all by month three"],
      cons: ["Means sitting with imperfect symptoms a little longer; if they're severe, don't wait to book in"],
    });
  }

  if (!flags.unsure && R("flushes") && !flags.unopposed && reg !== "tibolone") {
    let score = early ? 45 : 78; const why = [];
    why.push(early ? "Usually considered after the 3-month mark" : "Flushes still breaking through, a dose step-up is the usual first move");
    add({
      id: "doseUp", icon: "dial", score, why,
      name: "Step the oestrogen dose up",
      tag: "The standard next move for breakthrough symptoms",
      how: fixedCombo
        ? "All-in-one products come at fixed doses, so stepping up often means splitting into separate components, an oestrogen you can titrate plus its own progestogen."
        : "Move to the next dose up and review in about three months: patches 25 → 37.5/50 → 75 → 100 µg; gel 1 → 2-3 → 4 pumps; spray 1-2 → 3. If a different preparation hasn't been tried yet, guidance suggests trying one of those before going above the licensed dose.",
      brands: [
        "Patches: Evorel®/Estradot® next size up · Gel: Oestrogel® add a pump · Spray: Lenzetto® add a spray",
        uterus ? "Higher-dose oestrogen needs more progestogen too, e.g. micronised progesterone 300 mg (monthly pattern) or 200 mg (everyday pattern) with 100 µg patches or 4 pumps of gel" : "No progestogen adjustment needed after hysterectomy",
      ],
      pros: ["Directly targets the symptoms", "Reversible, the dose can come back down"],
      cons: ["Side effects can rise with the dose", uterus ? "The progestogen dose must rise in step at the top end" : "Review at ~3 months to check it's earned its keep", "Doses above the licensed maximum are for exceptional cases only, after a full discussion, as the added benefit is not well evidenced"],
    });
  }

  if (!flags.unsure && oral) {
    let score = 50; const why = [];
    if (R("oestroSE")) { score += 18; why.push("Headaches and nausea on tablets often ease on the skin route"); }
    if (lateAge) { score += 22; why.push("Guidance advises the skin route for anyone continuing HRT past 60"); }
    if (R("bodyident")) { score += 8; }
    if (why.length === 0) why.push("The skin route drops the tablet's small clot and stroke risk");
    add({
      id: "routeSkin", icon: "swap", score, why,
      name: "Switch from tablet to patch, gel or spray",
      tag: "Same hormone, safer route",
      how: "Swap the oral estradiol for the equivalent through the skin. Symptom control carries over; the clot and stroke consideration doesn't.",
      brands: ["Roughly: 1 mg oral ≈ 25–50 µg patch ≈ 2 pumps of gel, your prescriber will match it and review at 3 months"],
      pros: ["No measurable rise in clot or stroke risk at usual doses", "Often kinder on headaches and nausea", "Finer dose control"],
      cons: ["A new routine to learn", "Patch skin irritation affects some"],
    });
  }

  if (!flags.unsure && R("hassleRoute")) {
    add({
      id: "routeSwap", icon: "swap", score: 74,
      name: "Change the delivery method, keep the plan",
      tag: "Patch trouble ↔ gel or spray, and vice versa",
      why: ["The product itself is the problem, the prescription around it can stay"],
      how: "Patch irritation or peeling: rotate sites below the waist, avoid moisturiser beforehand, press for 10 seconds, or swap to gel or spray. Gel drying time a nuisance: a spray or patch removes the daily wait.",
      brands: ["Patch ↔ Oestrogel®/Sandrena® gel ↔ Lenzetto® spray, equivalent dosing, your prescriber matches it"],
      pros: ["Fixes the daily annoyance without touching what's working"],
      cons: ["A short adjustment period while levels re-steady"],
    });
  }

  if (!flags.unsure && uterus && R("progSE") && reg !== "ius") {
    add({
      id: "progSwap", icon: "swap", score: 80,
      name: "Change the progestogen",
      tag: "The usual fix for mood, PMS-type and skin side effects",
      why: ["PMS-like symptoms, low mood and acne usually trace to the progestogen, swapping it fixes most cases"],
      how: "Tolerance varies a lot between people. Moving to micronised progesterone, a gentler synthetic, or a hormonal coil (tiny dose, delivered locally) usually settles it without losing the protection.",
      brands: [
        "Micronised progesterone (Utrogestan®/Gepretix®), often the best tolerated",
        "Dydrogesterone or medroxyprogesterone, less androgenic than norethisterone/levonorgestrel (dydrogesterone: not with any meningioma history)",
        "52 mg LNG-IUS, lowest systemic dose of all",
      ],
      pros: ["Targets the actual culprit", "Protection for the lining continues throughout"],
      cons: ["May take a cycle or two to judge the new one"],
    });
  }

  if (!flags.unsure && uterus && reg === "seq") {
    let score = 46; const why = [];
    if (dur === "over5") { score += 26; why.push("After 5 years on a monthly pattern, guidance advises the switch"); }
    if (by54) { score += 22; why.push("Guidance advises switching by age 54"); }
    if (R("bleeding")) { score += 14; why.push("The everyday pattern usually means no bleeding at all"); }
    if (R("simpler")) { score += 8; }
    add({
      id: "seqToCont", icon: "down", score, why,
      name: "Move to the everyday, bleed-free pattern",
      tag: "Continuous combined, the natural next step",
      how: "Both hormones every day instead of the monthly cycle. Bleeding usually stops altogether within about 6 months, and the uterus lining is better protected than on the monthly pattern. Guidance suggests at least a year on the monthly pattern before switching; if you're under 50 and your periods stopped only recently, you may need longer on the monthly pattern first.",
      brands: ["Everyday equivalents: Evorel Conti®, Femoston Conti®, Kliovance®, Bijuve®, or keep separate components and take the progesterone nightly (100 mg)"],
      pros: ["No more planned bleeds", "Stronger lining protection", "Same or simpler routine"],
      cons: ["Irregular spotting in the first months of the switch is common", "Best once periods are behind you; switching too early can cause erratic bleeding", "If bleeding hasn't settled 3 to 6 months after the switch, guidance suggests going back to the monthly pattern for another year"],
    });
  }

  if (!flags.unsure && uterus && (R("contraNeed") || (R("bleeding") && reg === "seq")) && reg !== "ius") {
    let score = 55; const why = [];
    if (R("contraNeed")) { score += 20; why.push("Covers contraception and lining protection in one"); }
    if (R("bleeding") && reg === "seq") { score += 12; why.push("Heavy monthly bleeds often settle to little or nothing, once causes are checked"); }
    if (R("progSE")) { score += 8; why.push("Tiny systemic dose, progestogen side effects usually fade"); }
    add({
      id: "iusAdd", icon: "coil", score, why,
      name: "Swap the progestogen for a hormonal coil",
      tag: "52 mg LNG-IUS alongside your oestrogen",
      how: "A one-off fitting replaces the progestogen part of your regimen for 5 years. Your oestrogen continues unchanged.",
      brands: ["Any 52 mg LNG-IUS, changed every 5 years in this role. Mirena® holds a 4-year UK licence for endometrial protection within HRT; Levosert® and Benilexa® are not licensed for this indication, but CoSRH supports any 52 mg LNG-IUS for up to 5 years off-label. Prescribe and dispense by brand name (MHRA)", "If new unscheduled bleeding develops at or after 4 years of use, a device change can be offered once cancer-exclusion tests are normal, particularly with above-licence oestrogen doses or BMI ≥40"],
      pros: ["Contraception included if needed", "Bleeding usually settles right down", "Fit and forget for 5 years"],
      cons: ["A fitting procedure", "Spotting for the first 3–6 months", "Heavy or unexpected bleeding should be checked before the swap, not papered over by it"],
    });
  }

  if (!flags.unsure && R("bodyident") && reg !== "estSkin" && reg !== "ius") {
    add({
      id: "bodySwitch", icon: "drop", score: 76,
      name: "Move to a fully body-identical regimen",
      tag: "Estradiol through the skin + micronised progesterone",
      why: ["You'd like the same molecules the body makes, this is the standard way to get there"],
      how: uterus
        ? "Estradiol by patch, gel or spray, with micronised progesterone capsules at night, or, on the everyday pattern, Bijuve® combines both in one capsule."
        : "Estradiol by patch, gel or spray. After a hysterectomy that's the whole regimen.",
      brands: [
        "Estradiol: Evorel®/Estradot® patches, Oestrogel®/Sandrena® gel, Lenzetto® spray",
        ...(uterus ? ["Micronised progesterone: Utrogestan®/Gepretix® 100 mg nightly (everyday) or 200 mg ×12 nights (monthly)", "One-capsule option: Bijuve® 1 mg/100 mg (everyday pattern only)"] : []),
      ],
      pros: ["Body-identical throughout", "The combination with the most favourable clot and breast-risk profile"],
      cons: ["Usually two products rather than one", "Micronised progesterone must be swallowed, it doesn't work through the skin"],
    });
  }

  if (!flags.unsure && R("simpler") && reg !== "tibolone") {
    add({
      id: "simplify", icon: "combo", score: 72,
      name: "Fold it into fewer products",
      tag: "One patch, one capsule, or a coil",
      why: ["Fewer steps, same treatment"],
      how: "The usual routes: an all-in-one combined patch (nothing daily), Bijuve® (one capsule, everyday pattern), or a coil handling the progestogen side for 5 years while a patch handles the oestrogen.",
      brands: ["Evorel Conti®/Sequi® or FemSeven® patches · Bijuve® 1 mg/100 mg · 52 mg LNG-IUS + any oestrogen"],
      pros: ["Less to remember", "Nothing lost clinically"],
      cons: ["All-in-one patches come at a fixed 50 µg oestrogen dose, less room to fine-tune"],
    });
  }

  if (flags.noUterusCombined) {
    add({
      id: "dropProg", icon: "down", score: 82,
      name: "You may not need the progestogen at all",
      tag: "After hysterectomy, oestrogen alone usually does it",
      why: ["You're on a combined product with no uterus, the progestogen may be doing nothing but adding side effects"],
      how: "The progestogen exists to protect a uterus lining. Without one, oestrogen-only is the standard. The one exception is a history of endometriosis, where the progestogen (or tibolone) is often kept deliberately. Raise it at your review.",
      brands: ["Oestrogen-only equivalents: Evorel®/Estradot® patch, Oestrogel®, Lenzetto®, or Elleste Solo®/Zumenon® tablets"],
      pros: ["Fewer hormones, fewer side effects, simpler prescription"],
      cons: ["Not if the progestogen was kept on purpose (endometriosis); check before dropping it"],
    });
  }

  if (!flags.unsure && R("gu")) {
    add({
      id: "vagAdd", icon: "vaginal", score: 84,
      name: "Add local vaginal oestrogen",
      tag: "Alongside what you already take",
      why: ["Dryness and urinary symptoms often persist even on HRT that works throughout the body, the fix is local, not a bigger dose"],
      how: "A tiny local dose where the problem is. It sits alongside any systemic regimen, needs no extra progestogen, and doesn't count towards your systemic dose.",
      brands: ["Vagifem®/Vagirux® 10 µg tablets · estriol cream (Ovestin®/Gynest®) or Blissel® gel · Imvaggis® pessary · Estring® ring, changed every 3 months (SPC advises reassessment at 2 years, reflecting trial duration rather than evidence of harm; BMS Menopause Practice Standards, June 2026, support continuing low-dose vaginal oestrogen for as long as needed with at least annual review)"],
      pros: ["Targets the exact symptoms", "Safe long-term, no second hormone needed"],
      cons: ["A small routine of its own (twice-weekly after the loading phase)"],
    });
  }

  if (!flags.unsure && R("libido")) {
    let score = 70; const why = [];
    if (R("flushes")) { score -= 10; why.push("Oestrogen dose gets optimised first; libido often follows"); }
    why.push("If desire stays low once HRT is right, testosterone is the recognised add-on");
    add({
      id: "testosterone", icon: "drop", score, why,
      name: "Ask about adding testosterone",
      tag: "For low desire that outlasts good HRT",
      how: "A small daily amount of testosterone gel or cream, prescribed off-licence in the UK (usually via a menopause specialist or an experienced GP), with blood-level checks along the way. NICE NG23 recommends considering testosterone where HRT at adequate oestrogen levels has not relieved low sexual desire; a trial of adequate systemic HRT comes first, then testosterone may be added if low libido persists.",
      brands: ["Commonly a fraction of a Testogel®/Tostran® sachet or pump, dosed for female physiology, exact dosing is the prescriber's call"],
      pros: ["The evidence-backed option for this specific symptom", "Some notice energy and clarity improve too"],
      cons: ["Off-licence, so not every GP prescribes it, a referral may be needed", "Needs monitoring; excess can cause acne or unwanted hair"],
    });
  }

  if (!flags.unsure && R("stopping")) {
    add({
      id: "taper", icon: "down", score: 80,
      name: "Plan a reduction or a stop, on your terms",
      tag: "Gradual and abrupt both work; the difference is short-term",
      why: ["You're weighing up coming off, there's a sensible way to do it"],
      how: "There's no fixed maximum duration: HRT continues for as long as benefits outweigh risks for you, reviewed yearly. When stopping, tapering the dose down over a few months tends to soften short-term symptom rebound; stopping outright gets there quicker. Long-term outcomes are the same either way. Vaginal oestrogen can carry on regardless.",
      brands: ["A taper is usually just the same product at falling doses, e.g. patch 50 → 25 µg, then twice-weekly to weekly"],
      pros: ["Fully reversible, restarting is allowed if symptoms bite back", "You stay in charge of the pace"],
      cons: ["Flushes can return for a while either way", "Bone protection fades after stopping, worth weighing if POI or osteoporosis risk applies"],
    });
  }

  if (!flags.unsure && reg === "tibolone" && (R("flushes") || R("oestroSE") || R("bodyident"))) {
    add({
      id: "tibToHRT", icon: "swap", score: R("flushes") ? 68 : 56,
      name: "Switch from tibolone to conventional HRT",
      tag: "For adjustable dosing",
      why: ["Tibolone comes at one fixed dose, conventional estradiol + progesterone can be titrated to you"],
      how: "Move to estradiol (patch, gel or spray) with micronised progesterone if you have a uterus. Doses can then be stepped to whatever controls symptoms.",
      brands: ["Estradiol patch/gel/spray + Utrogestan® 100 mg nightly, or Bijuve® as a one-capsule route"],
      pros: ["Room to adjust", "Body-identical option opens up"],
      cons: ["Loses tibolone's mild testosterone-like action, worth weighing if that was helping"],
    });
  }

  if (!flags.unsure && opts.length === 0) {
    add({
      id: "annual", icon: "shield", score: 70,
      name: "Make it a proper annual review",
      tag: "Nothing here points to a change, check the basics still hold",
      why: ["Nothing you've told us suggests a specific adjustment"],
      how: "Once HRT is stable, reviews are yearly. Worth covering at yours: whether symptoms are still controlled on the lowest dose that works, blood pressure and weight, any change in bleeding pattern, breast awareness and screening being up to date, and whether the route still suits. Anyone continuing past 60 should be on the skin route.",
      brands: ["No prescription change suggested, this is the checklist for the appointment itself"],
      pros: ["Keeps the regimen matched to you as things change"],
      cons: ["If something is bothering you, go back a step and tick it; the suggestions get much more specific"],
    });
  }

  opts.sort((x, y) => y.score - x.score);
  const top = opts.filter((o) => o.score >= 68);
  const mid = opts.filter((o) => o.score >= 45 && o.score < 68);
  const low = opts.filter((o) => o.score >= 0 && o.score < 45);
  return { top, mid, low, no: [], flags };
}

// ══════════════════════════════════════════════════
// UI atoms
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// SECTION 4 — UI COMPONENTS
// Presentational building blocks: buttons, option rows, result
// cards, the scan-first summary, safety-net panel, and footer.
// ══════════════════════════════════════════════════════════════
function Btn({ children, onClick, primary, disabled, small }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ fontFamily: sans, fontSize: small ? 14 : 15, fontWeight: 700, padding: small ? "9px 18px" : "13px 26px", borderRadius: 999, border: primary ? "none" : `1.5px solid ${h && !disabled ? C.moss : C.line}`, background: primary ? (h && !disabled ? C.mossDk : C.moss) : (h && !disabled ? C.mossTint : "rgba(255,255,255,.7)"), color: primary ? "#fff" : (h && !disabled ? C.mossDk : C.ink2), cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, transition: "all .18s ease", boxShadow: primary ? (h && !disabled ? "0 6px 18px rgba(53,80,60,.32)" : "0 4px 14px rgba(53,80,60,.22)") : "none", transform: h && !disabled ? "translateY(-1px)" : "none" }}>
      {children}
    </button>
  );
}

function OptionRow({ opt, selected, onClick, multi }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      role={multi ? "checkbox" : "radio"} aria-checked={selected}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", minHeight: 76, boxSizing: "border-box", textAlign: "left", padding: "15px 17px", borderRadius: 16, border: `1.5px solid ${selected ? C.moss : h ? C.moss : C.line}`, background: selected ? C.mossTint : h ? "#F3F8EF" : C.card, cursor: "pointer", transition: "all .18s ease", fontFamily: sans, boxShadow: selected ? "none" : h ? "0 6px 18px rgba(53,80,60,.16)" : "0 2px 10px rgba(58,80,60,.05)", transform: h && !selected ? "translateY(-1px)" : "none" }}>
      <span style={{ flexShrink: 0, width: 22, height: 22, marginTop: 0, borderRadius: multi ? 6 : "50%", border: `2px solid ${selected ? C.moss : h ? C.moss : "#B9C2B1"}`, background: selected ? C.moss : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <span style={{ width: multi ? 9 : 8, height: multi ? 9 : 8, borderRadius: multi ? 2.5 : "50%", background: "#fff" }} />}
      </span>
      <span style={{ display: "block", paddingTop: 1 }}>
        <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.ink, lineHeight: 1.35 }}>{opt.label}</span>
        {opt.note && <span style={{ display: "block", fontSize: 13, color: C.ink2, marginTop: 3, lineHeight: 1.4 }}>{opt.note}</span>}
      </span>
    </button>
  );
}

const TIER_META = {
  top: { label: "Most suitable for you", chip: "Strong fit", chipBg: C.mossTint, chipTx: C.mossDk, border: C.mossLn, cardBg: "#F3F8EF", hoverBg: "#EBF3E5", hoverBd: "#47694F" },
  mid: { label: "Could also work", chip: "Possible", chipBg: C.stoneBg, chipTx: C.stoneTx, border: C.line, cardBg: "#F7F7F1", hoverBg: "#F0F1E7", hoverBd: "#8A9683" },
  low: { label: "Less suitable for you", chip: "Less suitable", chipBg: C.sandBg, chipTx: C.sandTx, border: C.sandLn, cardBg: "#FBF3E2", hoverBg: "#F7EDD9", hoverBd: "#C9A254" },
  no: { label: "Not recommended for you", chip: "Not advised", chipBg: C.clayBg, chipTx: C.clayTx, border: C.clayLn, cardBg: "#F8ECE9", hoverBg: "#F5E4E0", hoverBd: "#B96A5D" },
};

function MethodCard({ opt, tier, contraNote }) {
  const [open, setOpen] = useState(false);
  const [hh, setHh] = useState(false);
  const m = TIER_META[tier];
  const sec = (t, items) => (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink2, marginBottom: 6 }}>{t}</div>
      {items.map((x, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, fontFamily: sans, fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>
          <span style={{ color: C.moss, flexShrink: 0 }}>·</span><span>{x}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div onMouseEnter={() => setHh(true)} onMouseLeave={() => setHh(false)} style={{ border: `1.5px solid ${open ? C.moss : hh ? m.hoverBd : m.border}`, borderRadius: 18, background: open ? C.card : hh ? m.hoverBg : m.cardBg, overflow: "hidden", transition: "border-color .18s, background .18s", boxShadow: "0 4px 18px rgba(58,80,60,.06)" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "15px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
        <Icon id={opt.icon} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: sans, fontSize: 15.5, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{opt.name}</span>
          <span style={{ display: "block", fontFamily: sans, fontSize: 12.5, color: C.ink2, marginTop: 2 }}>{opt.tag}</span>
        </span>
        <span className="tierchip" style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 800, color: m.chipTx, background: "rgba(255,255,255,0.85)", borderRadius: 999, padding: "5px 11px", flexShrink: 0 }}>{m.chip}</span>
      </button>
      {opt.why.length > 0 && (
        <div className="whychips" style={{ padding: "0 16px 12px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {opt.why.map((w, i) => (
            <span key={i} style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: tier === "no" ? C.clayTx : tier === "low" ? C.sandTx : C.mossDk, background: "rgba(255,255,255,0.72)", borderRadius: 9, padding: "4px 10px", lineHeight: 1.4 }}>{w}</span>
          ))}
        </div>
      )}
      {open && (
        <div style={{ borderTop: `1px solid ${C.line}`, padding: "14px 16px 16px" }}>
          <div style={{ fontFamily: sans, fontSize: 14, color: C.ink, lineHeight: 1.6 }}>{opt.how}</div>
          {sec("UK brands & typical doses, for your clinician to confirm", opt.brands)}
          {sec("Benefits", opt.pros)}
          {sec("Drawbacks", opt.cons)}
          {contraNote && opt.id !== "ius" && opt.id !== "coc" && (
            <div style={{ marginTop: 12, fontFamily: sans, fontSize: 13, color: C.sandTx, background: C.sandBg, border: `1px solid ${C.sandLn}`, borderRadius: 12, padding: "9px 12px", lineHeight: 1.45 }}>
              This option doesn't include contraception, you'd add a separate method (e.g. the mini-pill, condoms, or a coil).
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TierSection({ tier, items, contraNote }) {
  if (!items.length) return null;
  const m = TIER_META[tier];
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: tier === "no" ? C.clayTx : tier === "low" ? C.sandTx : C.mossDk, marginBottom: 10 }}>{m.label}</div>
      <div className="tierlist" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((o) => <MethodCard key={o.id} opt={o} tier={tier} contraNote={contraNote} />)}
      </div>
    </div>
  );
}

function Banner({ tone, title, children }) {
  const bg = tone === "clay" ? C.clayBg : C.sandBg;
  const ln = tone === "clay" ? C.clayLn : C.sandLn;
  const tx = tone === "clay" ? C.clayTx : C.sandTx;
  return (
    <div style={{ background: bg, border: `1px solid ${ln}`, borderRadius: 14, padding: "13px 16px", marginTop: 14 }}>
      {title && <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 800, color: tx, marginBottom: 4 }}>{title}</div>}
      <div style={{ fontFamily: sans, fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function Expandable({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [h, setH] = useState(false);
  return (
    <div style={{ border: `1px solid ${h && !open ? C.moss : C.line}`, borderRadius: 16, overflow: "hidden", marginTop: 16, background: C.card, boxShadow: "0 2px 12px rgba(58,80,60,.05)", transition: "border-color .18s" }}>
      <button onClick={() => setOpen(!open)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", background: open ? "#FAFBF6" : h ? "#EDF3E4" : "transparent", border: "none", cursor: "pointer", fontFamily: sans, fontSize: 15, fontWeight: 700, color: C.ink, textAlign: "left", transition: "background .18s" }}>
        <span>{title}</span>
      </button>
      {open && <div style={{ padding: "4px 16px 16px" }}>{children}</div>}
    </div>
  );
}

function WhatIsHRT() {
  const p = { fontFamily: sans, fontSize: 14.5, color: C.ink, lineHeight: 1.65, margin: "0 0 11px" };
  return (
    <div>
      <p style={p}>Around the menopause the ovaries wind down and levels of <strong>oestrogen</strong> fall. That drop drives hot flushes, night sweats, broken sleep, mood dips and vaginal dryness. HRT tops the oestrogen back up, and helps protect the bones too.</p>
      <p style={p}>If you have a <strong>uterus</strong>, oestrogen on its own thickens its lining, which over time can turn dangerous. So a second hormone, a <strong>progestogen</strong>, is added to keep the lining thin and safe. After a hysterectomy, oestrogen alone is enough.</p>
      <p style={p}>The oestrogen can go <strong>through the skin</strong> (patch, gel or spray) or be swallowed as a <strong>tablet</strong>. Through the skin is safer for clotting: tablets carry a small extra clot risk, while patches, gels and sprays at usual doses haven't been shown to add any.</p>
      <p style={{ ...p, margin: 0 }}>HRT does <strong>not</strong> prevent pregnancy; separate contraception is needed if you could still conceive.</p>
    </div>
  );
}

function SideEffects() {
  const p = { fontFamily: sans, fontSize: 14, color: C.ink, lineHeight: 1.6, margin: "0 0 10px" };
  return (
    <div>
      <p style={p}><strong>Oestrogen-related:</strong> bloating or fluid retention, breast tenderness, nausea, headaches, leg cramps. These often settle within a few months; a dose or route change usually helps if not.</p>
      <p style={p}><strong>Progestogen-related:</strong> breast tenderness, headaches, mood swings, PMS-like feelings, acne, lower tummy or back ache, typically in a cyclical pattern on monthly regimens.</p>
      <p style={{ ...p, margin: 0 }}>Tolerance to progestogens varies a lot between people. <strong>Switching the progestogen</strong> fixes most progestogenic side effects. Dydrogesterone has no clinically relevant androgenic, oestrogenic, glucocorticoid or mineralocorticoid activity and is generally the best-tolerated synthetic. Medroxyprogesterone acetate has androgenic and glucocorticoid activity; some people tolerate it better than norethisterone for mood-type effects, but it isn't equivalent to dydrogesterone on the metabolic and cardiovascular profile. Norethisterone and levonorgestrel carry the highest androgenicity. Micronised progesterone or a 52 mg LNG-IUS are the preferred alternatives where any synthetic progestogen causes persistent side effects.</p>
    </div>
  );
}

function SafetyNet({ mode, hasUterus = true }) {
  const cell = (bg, ln, tc, t, body, last) => (
    <div style={{ padding: "13px 18px", background: bg, borderBottom: last ? "none" : `1px solid ${ln || C.line}` }}>
      <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 800, color: tc, marginBottom: 4 }}>{t}</div>
      <div style={{ fontFamily: sans, fontSize: 14, color: C.ink, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
  const bleedReview = hasUterus
    ? <>Bleeding that <strong>isn't part of your expected pattern</strong> needs a clinician to assess, not because it's necessarily serious, but because the right next step depends on details a questionnaire can't safely judge. When you contact your GP or menopause nurse, it helps to have ready:
        <ul style={{ margin: "8px 0 8px", paddingLeft: 20 }}>
          <li style={{ marginBottom: 4 }}>when the bleeding started, and whether it began around the time you started or changed your HRT</li>
          <li style={{ marginBottom: 4 }}>whether it is heavy (flooding or clots), prolonged (more than a week), or happening almost every day</li>
          <li style={{ marginBottom: 4 }}>how many days a month you take the progestogen part of your HRT (the one you take for part of the month, not every day)</li>
          <li style={{ marginBottom: 4 }}>your height and weight</li>
          <li>any personal or family history of conditions affecting the womb or bowel</li>
        </ul>
        <strong>Ask for a prompt appointment rather than a routine one</strong> if the bleeding is heavy (flooding or clots), prolonged (more than a week), or happening almost every day. If it started <strong>more than 6 months</strong> after you began HRT, or <strong>more than 3 months</strong> after a dose change, mention that when you book, as your GP may want to see you sooner. Also a new breast lump or change, symptoms no better after around 3 months, or side effects you can't live with.</>
    : <>Any <strong>unexpected vaginal bleeding</strong>. Without a uterus this always needs checking rather than watching, so book a review promptly. Also a new breast lump or change, symptoms no better after around 3 months, or side effects you can't live with.</>;
  const bleedSettles = mode !== "systemic"
    ? "Mild local irritation when starting usually settles. Symptoms tend to return if you stop."
    : hasUterus
      ? "In the first few months of starting or changing, irregular bleeding or spotting is expected and usually eases off. A regular monthly bleed is normal on the monthly-pattern regimen. On the everyday pattern, any early spotting normally settles into no bleeding at all. It's bleeding that is new, returns, or lingers past 6 months that is worth checking (above)."
      : "On oestrogen-only HRT you shouldn't get regular bleeds. Mild breast tenderness or headaches when starting usually settle within a few months; a dose or route change helps if they don't.";
  return (
    <div style={{ marginTop: 22, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden", background: C.card, boxShadow: "0 2px 12px rgba(58,80,60,.05)" }}>
      <div style={{ background: "#FAFBF6", padding: "12px 18px", borderBottom: `1px solid ${C.line}`, fontFamily: serif, fontSize: 15.5, fontWeight: 600, color: C.ink }}>When to get help</div>
      {mode === "systemic" && cell(C.clayBg, C.clayLn, C.clayTx, "Call 999", "Sudden breathlessness or chest pain, coughing up blood, or a painful swollen calf. A drooping face, arm weakness, slurred speech, or sudden severe headache or loss of vision.")}
      {cell(C.sandBg, C.sandLn, C.sandTx, "Book a GP review", bleedReview)}
      {cell("transparent", null, C.mossDk, "Common, and usually settles", bleedSettles, true)}
    </div>
  );
}

function NonHormonal() {
  const p = { fontFamily: sans, fontSize: 14, color: C.ink, lineHeight: 1.6, margin: "0 0 10px" };
  return (
    <div>
      <p style={p}><strong>Menopause-specific CBT</strong>: a talking therapy with good evidence for flushes, sleep and mood; used alongside HRT or instead of it.</p>
      <p style={p}><strong>Fezolinetant</strong>: a non-hormonal daily tablet for moderate-to-severe flushes when HRT isn't suitable, NICE-recommended for this use (TA1143, 2026). Needs liver blood-test monitoring (MHRA warning).</p>
      <p style={p}><strong>Elinzanetant</strong> (Lynkuet®): a similar non-hormonal option, taken as two capsules once daily at bedtime. MHRA-approved for flushes, with its licence extended in July 2026 to also cover flushes caused by breast cancer hormone treatment (tamoxifen, aromatase inhibitors), a common situation where HRT itself isn't an option. Needs a liver blood test before starting and again at three months, so less frequent monitoring than fezolinetant.</p>
      <p style={p}><strong>Certain antidepressants</strong> (e.g. venlafaxine) can reduce flushes when HRT isn't an option, though they're not a first choice for flushes alone.</p>
      <p style={p}><strong>Lifestyle</strong>: regular exercise, weight management, easing triggers (alcohol, caffeine, spicy food). Herbal products (isoflavones, black cohosh) have weak evidence and variable quality.</p>
      <p style={{ ...p, margin: 0 }}><strong>Low libido</strong>: if desire stays low despite HRT, testosterone can be added by a clinician (used off-licence in the UK).</p>
      <p style={p}><strong>Vaginal (local) options if dryness persists</strong>: prasterone (Intrarosa® pessary) is a second-line vaginal option; ospemifene (Senshio® 60 mg tablet) is an oral alternative where applying treatment vaginally is impractical (several contraindications, including breast cancer and blood clots, confirm before recommending). Vaginal laser is not recommended outside clinical trials (NICE NG23 1.5.20).</p>
    </div>
  );
}


// ── Patient resources: WHC is the BMS patient arm; clinician PDFs are not linked here ──
function ResourceLink({ href, children, note }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.moss; e.currentTarget.style.background = C.mossTint; e.currentTarget.querySelector("span").style.textDecoration = "underline"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.background = C.card; e.currentTarget.querySelector("span").style.textDecoration = "none"; }}
      style={{ display: "block", padding: "11px 14px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.card, textDecoration: "none", marginBottom: 8, transition: "border-color .15s, background .15s" }}>
      <span style={{ display: "block", fontFamily: sans, fontSize: 14, fontWeight: 700, color: C.mossDk, lineHeight: 1.4 }}>{children} ↗</span>
      {note && <span style={{ display: "block", fontFamily: sans, fontSize: 12.5, color: C.ink2, marginTop: 2 }}>{note}</span>}
    </a>
  );
}

function MoreInfo() {
  return (
    <div style={{ marginTop: 26, marginBottom: 2, display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: C.ink2, whiteSpace: "nowrap" }}>More information</span>
      <span style={{ flex: 1, height: 1, background: C.line }} />
    </div>
  );
}

function Resources({ items, general, showSpecialist }) {
  const groupHead = (t) => (
    <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: C.mossDk, margin: "6px 0 8px" }}>{t}</div>
  );
  return (
    <Expandable title="Read more from the British Menopause Society">
      <div style={{ fontFamily: sans, fontSize: 13.5, color: C.ink2, lineHeight: 1.6, marginBottom: 14 }}>
        These factsheets come from <strong style={{ color: C.ink }}>Women's Health Concern</strong>, the patient arm of the British Menopause Society. They open in a new tab.
      </div>
      {items && items.length > 0 && (
        <>
          {groupHead("Picked out for your answers")}
          {items.map((it) => <ResourceLink key={it.href} href={it.href} note={it.note}>{it.label}</ResourceLink>)}
        </>
      )}
      {general && general.length > 0 && (
        <div style={{ marginTop: items && items.length ? 14 : 0 }}>
          {groupHead("Good to read for everyone")}
          {general.map((it) => <ResourceLink key={it.href} href={it.href} note={it.note}>{it.label}</ResourceLink>)}
        </div>
      )}
      {showSpecialist && (
        <div style={{ marginTop: 14 }}>
          {groupHead("Getting specialist help")}
          <ResourceLink href={WHC.findSpecialist} note="Search the BMS register by area">
            Find a BMS menopause specialist
          </ResourceLink>
        </div>
      )}
    </Expandable>
  );
}

// ── Common questions, drawn from what WHC factsheets cover most ──
function CommonQuestions() {
  const qa = [
    {
      q: "Is HRT safe?",
      a: "For most people under 60, or within 10 years of their last period, the benefits of HRT outweigh the risks. The picture depends on your age, your health history, the type of HRT, and how it's taken. Oestrogen taken through the skin doesn't raise clot risk in the way tablets do. Risks are individual, which is why a prescriber goes through yours with you.",
    },
    {
      q: "Does HRT cause breast cancer?",
      a: "Oestrogen-only HRT has little or no effect on breast cancer risk. Combined HRT is linked to a small increase that grows with the number of years used and falls back after stopping. To put it in context, drinking alcohol and carrying extra weight both affect risk to a similar or greater degree. If this worries you, it's worth reading the WHC factsheet below and raising it with your prescriber.",
    },
    {
      q: "Will HRT stop me getting pregnant?",
      a: "No. HRT is not contraception, whatever type you're on. If there's any chance you could conceive, you need a separate method alongside it, unless your HRT includes a hormonal coil, which does both.",
    },
    {
      q: "How long can I stay on HRT?",
      a: "There's no fixed maximum. HRT continues for as long as the benefits outweigh the risks for you, reviewed at least once a year. Stopping abruptly and reducing gradually both work, though tapering tends to soften the short-term return of symptoms.",
    },
    {
      q: "What's the difference between body-identical and bioidentical HRT?",
      a: "They sound alike but are very different. Body-identical hormones (regulated estradiol and micronised progesterone, such as Utrogestan) are available on the NHS, tested and recommended. Compounded 'bioidentical' hormones, mixed for you by a private specialist pharmacy, are not recommended: they don't go through the same regulation, and there's no good evidence that the progesterone dose in them protects the womb lining.",
    },
    {
      q: "I'm bleeding on HRT, is that a problem?",
      a: "Irregular bleeding is common in the first few months of starting or changing HRT, and adjusting the progestogen settles most of it. The kind that needs looking into is bleeding that carries on beyond six months, starts up again after it has settled, or is heavy or painful. If that sounds like you, book a review rather than waiting it out.",
    },
    {
      q: "Do I need a blood test to diagnose menopause?",
      a: "Usually not. If you're over 45 with typical symptoms, a diagnosis is made on the symptoms alone. Blood tests can mislead in the transition, because hormone levels swing about. They matter more if you're under 45.",
    },
  ];
  return (
    <Expandable title="Common questions">
      {qa.map((item, i) => (
        <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i === qa.length - 1 ? "none" : `1px solid ${C.line}` }}>
          <div style={{ fontFamily: serif, fontSize: 15.5, fontWeight: 600, color: C.ink, marginBottom: 5 }}>{item.q}</div>
          <div style={{ fontFamily: sans, fontSize: 14, color: C.ink, lineHeight: 1.6 }}>{item.a}</div>
        </div>
      ))}
      <div style={{ fontFamily: sans, fontSize: 12.5, color: C.ink2, lineHeight: 1.6, marginTop: 4 }}>
        Sources: {SRC_NG23}; {SRC_BMS}; BMS Management of Unscheduled Bleeding on HRT, May 2026; BMS Progestogens and endometrial protection, reviewed May 2026; Women's Health Concern factsheets.
      </div>
    </Expandable>
  );
}

function Sources() {
  const label = (t) => (
    <div style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase", color: C.mossDk, marginBottom: 10 }}>{t}</div>
  );
  const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 12px rgba(58,80,60,.05)" };
  const srcs = [
    ["NICE NG23 — Menopause: identification and management (updated 15 April 2026)", "https://www.nice.org.uk/guidance/ng23"],
    ["NICE NG23 rec. 1.8.4 (amended Apr 2026) & 1.8.5 (new, Apr 2026) — unscheduled bleeding on systemic HRT", "https://www.nice.org.uk/guidance/ng23"],
    ["NICE HRT discussion aid for shared decisions", "https://www.nice.org.uk/guidance/ng23/resources/incidence-of-medical-conditions-with-and-without-hrt-a-discussion-aid-pdf-13553199901"],
    ["NICE CKS Menopause: HRT", "https://cks.nice.org.uk/topics/menopause/"],
    ["NICE NG12 — Suspected Cancer: Recognition and Referral", "https://www.nice.org.uk/guidance/ng12"],
    ["NICE TA1143 — Fezolinetant for moderate to severe vasomotor symptoms (2026)", "https://www.nice.org.uk/guidance/ta1143"],
    ["Lynkuet (elinzanetant) Summary of Product Characteristics (emc)", "https://www.medicines.org.uk/emc/product/101980/smpc"],
    ["BMS practical prescribing tool", "https://thebms.org.uk/wp-content/uploads/2026/06/03-NEW-BMS-TfC-Practical-Prescribing-MAY2026-C.pdf"],
    ["BMS Tools for Clinicians (full library)", "https://thebms.org.uk/publications/tools-for-clinicians/"],
    ["BMS — Progestogens and endometrial protection, reviewed May 2026", "https://thebms.org.uk/wp-content/uploads/2026/05/14-NEW-BMS-TfC-Progestogens-and-endometrial-protection-MAY2026-A.pdf"],
    ["BMS — Management of Unscheduled Bleeding on HRT, May 2026", "https://thebms.org.uk/wp-content/uploads/2026/06/01-NEW-BMS-GUIDELINE-Management-of-unscheduled-bleeding-HRT-MAY2026-D.pdf"],
    ["CoSRH (formerly FSRH) — Contraception for Women Aged Over 40 Years", "https://www.cosrh.org/Common/Uploaded%20files/documents/fsrh-guideline-contraception-for-women-aged-over-40-years.pdf"],
    ["NHS SPS medicines supply tracker", "https://www.sps.nhs.uk/category/medicines-tools/medicines-supply/"],
    ["Regional NHS formularies", ""],
  ];
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>References and review</span>
        <span style={{ flex: 1, height: 1, background: C.line }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 12, alignItems: "start" }}>
        <div style={card}>
          {label("Built on UK guidance")}
          {srcs.map(([name, url], i) => {
            const rowStyle = { display: "flex", alignItems: "baseline", gap: 8, padding: "8px 0", borderBottom: i === srcs.length - 1 ? "none" : `1px solid #F0F2EA` };
            const nameStyle = { fontFamily: sans, fontSize: 13, color: C.ink, lineHeight: 1.45, textDecoration: "none" };
            return url ? (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ ...rowStyle, ...nameStyle, transition: "color .15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = C.mossDk; e.currentTarget.querySelector("span").style.textDecoration = "underline"; }} onMouseLeave={(e) => { e.currentTarget.style.color = C.ink; e.currentTarget.querySelector("span").style.textDecoration = "none"; }}>
                <span>{name}</span>
                <span style={{ fontFamily: mono, fontSize: 11, color: C.mossDk, flexShrink: 0, marginLeft: "auto" }}>↗</span>
              </a>
            ) : (
              <div key={i} style={rowStyle}>
                <span style={nameStyle}>{name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={card}>
            {label("Patient factsheets")}
            <div style={{ fontFamily: sans, fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>
              The factsheets linked throughout come from <strong>Women's Health Concern</strong>, the patient arm of the British Menopause Society.
            </div>
          </div>
          <div style={{ ...card, background: "#FAFBF6" }}>
            {label("About the doses shown")}
            <div style={{ fontFamily: sans, fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>
              All doses are examples of typical starting points to discuss, not instructions to follow. A prescriber confirms anything used against the current BNF / SPC. Brand availability fluctuates; the NHS Specialist Pharmacy Service tracks current HRT shortages.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientDisclaimer() {
  return (
    <div style={{ background: C.moss, borderRadius: 18, padding: "17px 19px", marginTop: 16, boxShadow: "0 6px 20px rgba(53,80,60,.18)" }}>
      <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 5 }}>Before anything is started or changed</div>
      <div style={{ fontFamily: sans, fontSize: 14.5, color: "#EAF2E8", lineHeight: 1.6 }}>
        These are <strong style={{ color: "#fff" }}>options to discuss, not a prescription</strong>. A GP, menopause nurse practitioner or pharmacist independent prescriber needs to check your full history first. Bring these options to that appointment so you can go through them together.
      </div>
    </div>
  );
}

function ToolFooter({ onFeedback }) {
  return (
    <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
      <div style={{ fontFamily: sans, fontSize: 12, color: C.ink2, lineHeight: 1.6 }}>
        Nothing you enter here is saved, stored, or sent anywhere. Each visit starts blank, and nothing is kept once you close the page.
      </div>
      <div style={{ fontFamily: sans, fontSize: 12, color: C.ink2, marginTop: 8, lineHeight: 1.6 }}>
        Version {TOOL_VERSION} · Content checked against current guidance on {CONTENT_REVIEWED}.{" "}
        If something here seems wrong, unclear, or out of date,{" "}
        <button onClick={onFeedback} style={{ fontFamily: sans, fontSize: 12, color: C.mossDk, fontWeight: 700, textDecoration: "underline", background: "none", border: "none", padding: "6px 4px", margin: "-6px -4px", cursor: "pointer" }}>
          please tell us
        </button>.
      </div>
    </div>
  );
}

function FeedbackScreen({ onBack }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error | limit

  const send = () => {
    setStatus("sending");
    const composedMessage = `${message}\n\n—\nFind Your HRT, tool version ${TOOL_VERSION}.`;
    window.emailjs
      .send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { title: title || "Feedback on Find Your HRT", message: composedMessage },
        { publicKey: EMAILJS_PUBLIC_KEY }
      )
      .then(() => setStatus("sent"))
      .catch((err) => {
        // EmailJS returns the account's monthly-quota-exceeded response as a
        // normal failed request, distinguished only by its message text —
        // detect that case so we don't tell someone to "check your
        // connection" when the real cause is the inbox being full for the month.
        const text = (err && err.text ? String(err.text) : "").toLowerCase();
        setStatus(/limit|quota|exceed/.test(text) ? "limit" : "error");
      });
  };

  const inputStyle = {
    width: "100%", fontFamily: sans, fontSize: 16, color: C.ink, background: C.card,
    border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", boxSizing: "border-box",
  };

  return (
    <div aria-live="polite">
      <div style={{ background: C.moss, borderRadius: 18, padding: "20px 22px" }}>
        <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#BCD5BE" }}>Feedback</div>
        <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: "#fff", marginTop: 6, lineHeight: 1.2 }}>Tell us what's wrong, unclear, or missing</div>
        <div style={{ fontFamily: sans, fontSize: 13.5, color: "#DDEBDA", marginTop: 7, lineHeight: 1.55 }}>
          This is anonymous. We don't ask for your name or email, and none of your earlier answers are attached.
        </div>
      </div>

      {status === "idle" || status === "sending" ? (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontFamily: sans, fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dose looks wrong on the patch card"
              disabled={status === "sending"}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontFamily: sans, fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What did you see, and what did you expect instead?"
              rows={7}
              disabled={status === "sending"}
              style={{ ...inputStyle, resize: "vertical", fontFamily: sans, lineHeight: 1.5 }}
            />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
            <Btn primary disabled={!message.trim() || status === "sending"} onClick={send}>{status === "sending" ? "Sending…" : "Send →"}</Btn>
            <Btn onClick={onBack} small disabled={status === "sending"}>Cancel</Btn>
          </div>
        </div>
      ) : status === "sent" ? (
        <div style={{ marginTop: 18, background: C.sandBg, border: `1px solid ${C.sandLn}`, borderRadius: 16, padding: "28px 22px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: "50%", background: C.moss, marginBottom: 14 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: C.ink }}>Thank you for helping us improve</div>
          <div style={{ fontFamily: sans, fontSize: 14, color: C.ink2, marginTop: 8, lineHeight: 1.55, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
            Every message helps make this clearer and more useful for the next person who needs it. We read all feedback and act on it where it's needed.
          </div>
          <div style={{ marginTop: 18 }}>
            <Btn onClick={onBack} small>Done</Btn>
          </div>
        </div>
      ) : status === "limit" ? (
        <div style={{ marginTop: 18 }}>
          <Banner tone="clay" title="Feedback is temporarily full">
            This feedback inbox has reached its capacity for now. Please try again in a few days.
          </Banner>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            <Btn onClick={onBack} small>Done</Btn>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <Banner tone="clay" title="Something went wrong">
            Your feedback wasn't sent. Please check your connection and try again.
          </Banner>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            <Btn primary onClick={send}>Try again</Btn>
            <Btn onClick={onBack} small>Cancel</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Take-to-appointment: printable / saveable summary ──
const ANSWER_ORDER = [
  { key: "adjRegimen", screen: "adjRegimen" },
  { key: "adjDuration", screen: "adjDuration" },
  { key: "reasons", screen: "adjReasons", multi: true },
  { key: "age", screen: "age" },
  { key: "symptoms", screen: "symptoms" },
  { key: "uterus", screen: "uterus" },
  { key: "timing", screen: "timing" },
  { key: "risk", screen: "risk", multi: true },
  { key: "contraception", screen: "contraception" },
  { key: "prefs", screen: "prefs", multi: true },
  { key: "redflags", screen: "redflags", multi: true },
];
function optLabel(screenKey, v) {
  const s = SCREENS[screenKey];
  if (!s) return v;
  const o = (s.options || []).find((x) => x.v === v);
  return o ? o.label : v;
}
function describeAnswers(a) {
  const rows = [];
  ANSWER_ORDER.forEach(({ key, screen, multi }) => {
    const val = a[key];
    if (val == null) return;
    const s = SCREENS[screen];
    if (!s) return;
    if (multi) {
      rows.push({ q: s.q, a: (!Array.isArray(val) || val.length === 0) ? "None selected" : val.map((v) => optLabel(screen, v)).join("; ") });
    } else {
      rows.push({ q: s.q, a: optLabel(screen, val) });
    }
  });
  return rows;
}
function escHTML(t) {
  return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function buildPrintDoc(p) {
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const dl = (rows) => rows && rows.length
    ? `<dl class="kv">${rows.map((r) => `<div class="kvrow"><dt>${escHTML(r.q || r.label)}</dt><dd>${escHTML(r.a || r.value)}</dd></div>`).join("")}</dl>` : "";
  const optionsHTML = (p.options && p.options.length)
    ? p.options.map((o, i) => `<div class="opt"><div class="optname"><span class="num">${i + 1}</span><span>${escHTML(o.name)}</span></div>${o.tag ? `<div class="opttag">${escHTML(o.tag)}</div>` : ""}${o.how ? `<p class="how"><b>How it's used:</b> ${escHTML(o.how)}</p>` : ""}${o.brands && o.brands.length ? `<p class="exlead">Examples to ask about</p><ul>${o.brands.map((b) => `<li>${escHTML(b)}</li>`).join("")}</ul>` : ""}</div>`).join("")
    : `<p class="muted">No specific product is recommended on this path. The next step is a conversation with a clinician.</p>`;
  const ul = (title, arr) => (arr && arr.length)
    ? `<section><h2>${escHTML(title)}</h2><ul class="notes">${arr.map((t) => `<li>${escHTML(t)}</li>`).join("")}</ul></section>` : "";
  const summarySec = (p.summary && p.summary.length) ? `<section><h2>At a glance</h2>${dl(p.summary)}</section>` : "";
  const answersSec = (p.answers && p.answers.length) ? `<section><h2>The answers you gave</h2>${dl(p.answers)}</section>` : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>HRT options summary — ${escHTML(dateStr)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 16mm 15mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Nunito Sans', system-ui, sans-serif; color: #35503C; font-size: 11pt; line-height: 1.5; background: #fff; }
  .sheet { max-width: 720px; margin: 0 auto; padding: 22px 4px 40px; }
  .mast { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; border-bottom: 2px solid #3C5A43; padding-bottom: 14px; }
  .mast .brand { display: flex; align-items: center; gap: 10px; }
  .mast .brandname { font-family: 'Nunito Sans', sans-serif; font-size: 9pt; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: #3C5A43; margin-bottom: 2px; }
  .mast h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 20pt; margin: 0; line-height: 1.1; color: #35503C; }
  .mast .sub { font-size: 9.5pt; color: #5C6B5C; margin-top: 3px; }
  .mast .date { font-size: 9.5pt; color: #5C6B5C; text-align: right; white-space: nowrap; }
  .lead { font-family: 'Fraunces', Georgia, serif; font-size: 14pt; font-weight: 600; color: #3C5A43; margin: 16px 0 2px; }
  .disc { background: #F4F7EC; border: 1px solid #DFE7D3; border-left: 4px solid #3C5A43; border-radius: 8px; padding: 11px 14px; font-size: 10pt; color: #384636; margin: 14px 0 6px; }
  section { margin-top: 20px; break-inside: avoid; }
  h2 { font-family: 'Fraunces', Georgia, serif; font-size: 12.5pt; font-weight: 600; color: #35503C; margin: 0 0 9px; padding-bottom: 5px; border-bottom: 1px solid #E4E9DC; }
  dl.kv { margin: 0; }
  .kvrow { display: flex; gap: 14px; padding: 6px 0; border-bottom: 1px solid #EEF1E8; }
  .kvrow:last-child { border-bottom: none; }
  dt { flex: 0 0 46%; font-weight: 700; color: #384636; font-size: 10pt; }
  dd { flex: 1; margin: 0; color: #35503C; font-size: 10pt; }
  .opt { break-inside: avoid; padding: 12px 0 4px; border-bottom: 1px solid #EEF1E8; }
  .opt:last-child { border-bottom: none; }
  .optname { display: flex; align-items: baseline; gap: 9px; font-family: 'Fraunces', Georgia, serif; font-size: 12pt; font-weight: 600; color: #35503C; }
  .optname .num { font-family: 'Nunito Sans', sans-serif; font-size: 8.5pt; font-weight: 700; color: #fff; background: #3C5A43; border-radius: 999px; min-width: 17px; height: 17px; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; }
  .opttag { font-size: 9.5pt; color: #5C6B5C; font-style: italic; margin: 3px 0 0 26px; }
  .how { font-size: 10pt; color: #35503C; margin: 7px 0 0 26px; }
  .how b { color: #384636; }
  .exlead { font-size: 8.5pt; letter-spacing: .06em; text-transform: uppercase; color: #6E7D6B; font-weight: 700; margin: 8px 0 2px 26px; }
  .opt ul { margin: 0 0 2px 26px; padding-left: 18px; }
  .opt ul li { font-size: 9.5pt; color: #384636; margin: 2px 0; }
  ul.notes { margin: 0; padding-left: 20px; }
  ul.notes li { font-size: 10pt; color: #35503C; margin: 5px 0; }
  .muted { color: #5C6B5C; font-size: 10pt; font-style: italic; }
  .srcgrid { font-size: 9.5pt; color: #384636; }
  .srcgrid div { padding: 4px 0; border-bottom: 1px solid #EEF1E8; }
  .srcgrid div:last-child { border-bottom: none; }
  footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid #E4E9DC; font-size: 8.5pt; color: #6E7D6B; line-height: 1.55; }
  .noprint { text-align: center; margin: 18px 0 2px; }
  .noprint button { font-family: 'Nunito Sans', sans-serif; font-size: 11pt; font-weight: 700; color: #fff; background: #3C5A43; border: none; border-radius: 999px; padding: 11px 26px; cursor: pointer; }
  @media print { .noprint { display: none; } }
</style></head><body><div class="sheet">
  <div class="mast">
    <div class="brand">
      <svg width="36" height="36" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#C96A45" stroke-width="3.4" stroke-linecap="round"><circle cx="50" cy="50" r="12" stroke-dasharray="63.88 11.52" transform="rotate(15 50 50)"/><circle cx="50" cy="50" r="19.5" stroke-dasharray="106.19 16.34" transform="rotate(150 50 50)"/><circle cx="50" cy="50" r="27" stroke-dasharray="142.31 27.33" transform="rotate(265 50 50)"/><circle cx="50" cy="50" r="34.5" stroke-dasharray="186.66 30.11" transform="rotate(80 50 50)"/><circle cx="50" cy="50" r="42" stroke-dasharray="224.31 39.58" transform="rotate(205 50 50)"/></g><circle cx="50" cy="50" r="4.2" fill="#C96A45"/></svg>
      <div><div class="brandname">Find Your HRT</div><h1>HRT options summary</h1><div class="sub">A summary to discuss with a clinician</div></div>
    </div>
    <div class="date">${escHTML(dateStr)}</div>
  </div>
  ${p.intro ? `<div class="lead">${escHTML(p.heading)}</div><div class="sub" style="color:#5C6B5C;font-size:10pt;">${escHTML(p.intro)}</div>` : `<div class="lead">${escHTML(p.heading)}</div>`}
  <div class="disc"><b>This is an information tool, not medical advice or a prescription.</b> The options below are examples to talk through with a GP, menopause nurse or pharmacist prescriber, who will check your full history before anything is started or changed. Doses are typical starting points, not instructions.</div>
  ${answersSec}
  ${summarySec}
  <section><h2>Options to discuss</h2>${optionsHTML}</section>
  ${ul("Notes specific to your answers", p.notes)}
  ${ul("Points to raise with your clinician", p.points)}
  <section><h2>Where this guidance comes from</h2><div class="srcgrid">
    <div>NICE NG23 — Menopause: identification and management (updated 15 April 2026) — nice.org.uk/guidance/ng23</div>
    <div>BMS — Management of Unscheduled Bleeding on HRT, May 2026 — thebms.org.uk</div>
    <div>NICE CKS Menopause: HRT — cks.nice.org.uk/topics/menopause</div>
    <div>British Menopause Society prescribing tools — thebms.org.uk</div>
    <div>Women's Health Concern patient factsheets — womens-health-concern.org</div>
    <div>NHS menopause information — nhs.uk/conditions/menopause</div>
  </div></section>
  <footer>Generated ${escHTML(dateStr)} · Tool version ${escHTML(TOOL_VERSION)} · Content checked against current guidance on ${escHTML(CONTENT_REVIEWED)}.<br>This summary informs your decision; it does not replace medical advice. Nothing you entered is saved or sent anywhere.</footer>
  <div class="noprint"><button onclick="window.print()">Print or save as PDF</button></div>
</div></body></html>`;
}
function printSummary(p) {
  const w = window.open("", "_blank");
  if (!w) { alert("Please allow pop-ups for this site to print or save your summary."); return; }
  w.document.open();
  w.document.write(buildPrintDoc(p));
  w.document.close();
  const go = () => { try { w.focus(); w.print(); } catch (e) {} };
  if (w.document.readyState === "complete") setTimeout(go, 500);
  else w.onload = () => setTimeout(go, 500);
}
function TakeToAppointment({ payload }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ marginTop: 16, background: "#fff", border: `1.5px solid ${C.mossLn}`, borderRadius: 18, padding: "17px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, boxShadow: "0 4px 16px rgba(53,80,60,.07)" }}>
      <div style={{ flex: 1, minWidth: 250 }}>
        <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: C.ink, marginBottom: 3 }}>Take this to your appointment</div>
        <div style={{ fontFamily: sans, fontSize: 13.5, color: C.ink2, lineHeight: 1.55 }}>Open a clean summary of your answers and these options. You can print it or save it as a PDF to bring to your GP or menopause clinician.</div>
      </div>
      <button
        onClick={() => printSummary(payload)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ display: "inline-flex", alignItems: "center", gap: 9, flexShrink: 0, fontFamily: sans, fontSize: 14.5, fontWeight: 700, color: "#fff", background: hover ? C.mossDk : C.moss, border: "none", borderRadius: 999, padding: "12px 22px", cursor: "pointer", transition: "background .15s, transform .15s", transform: hover ? "translateY(-1px)" : "none", boxShadow: "0 6px 18px rgba(53,80,60,.22)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Print or save as PDF
      </button>
    </div>
  );
}

// ── Outcomes ──
function ReferOutcome({ a, flags, onFeedback }) {
  return (
    <div>
      <div style={{ background: C.clayBg, border: `1px solid ${C.clayLn}`, borderRadius: 18, padding: "22px 22px 20px" }}>
        <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.clayTx }}>See a clinician first</div>
        <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.ink, marginTop: 6, lineHeight: 1.25 }}>Speak to a clinician before starting or changing HRT</div>
        <div style={{ fontFamily: sans, fontSize: 15, color: C.ink2, marginTop: 8, lineHeight: 1.6 }}>One of your answers needs checking first. This doesn't rule treatment out.</div>
        <SpecialistPill />
      </div>
      <div style={{ marginTop: 16 }}>
        {flags.map((f) => (
          <div key={f} style={{ display: "flex", gap: 12, padding: "13px 4px", borderBottom: `1px solid ${C.line}`, fontFamily: sans, fontSize: 14.5, color: C.ink, lineHeight: 1.55 }}>
            <span style={{ color: C.clayTx, fontWeight: 800, flexShrink: 0 }}>›</span>
            <span>{REFER_TEXT[f]}</span>
          </div>
        ))}
      </div>
      <MoreInfo />
      <Expandable title="Non-hormonal options while this is looked into"><NonHormonal /></Expandable>
      <Resources showSpecialist general={[
        { href: WHC.questions, label: "Perimenopause and menopause: your questions answered", note: "Updated April 2026" },
        { href: WHC.benefitsRisks, label: "HRT: benefits and risks" },
        { href: WHC.cbt, label: "CBT for menopausal symptoms", note: "Updated February 2026" },
        { href: WHC.complementary, label: "Complementary and alternative therapies", note: "Updated November 2025" },
      ]} />
      <PatientDisclaimer />
      <TakeToAppointment payload={{
        heading: "Speak to a clinician first",
        intro: "One or more answers should be checked before HRT is started or changed",
        summary: [],
        options: [],
        notes: [],
        points: (flags || []).map((f) => REFER_TEXT[f]),
        answers: describeAnswers(a || {}),
      }} />
      <Sources />
      <ToolFooter onFeedback={onFeedback} />
    </div>
  );
}

function VaginalOutcome({ a, onFeedback }) {
  const cards = [
    { id: "vtab", icon: "vaginal", name: "Vaginal oestrogen tablet / pessary", tag: "Low dose · very little reaches the bloodstream", score: 1, why: ["Usually the first choice, precise, low-mess dosing"],
      how: "A tiny tablet or pessary placed in the vagina with an applicator, nightly for 2 weeks (3 weeks for the estriol pessary), then twice a week for as long as it helps.",
      brands: ["Vagifem® 10 or Vagirux®, 10 µg estradiol tablets: nightly 2 weeks, then twice weekly", "Imvaggis® 0.03 mg estriol pessary: nightly 3 weeks, then twice weekly"],
      pros: ["Targets dryness, discomfort and recurrent UTIs directly", "No second hormone needed even with a uterus", "Safe long-term with no fixed stop date"], cons: ["Symptoms return if stopped", "A regular routine to keep"] },
    { id: "vcream", icon: "gel", name: "Vaginal oestrogen cream or gel", tag: "Also soothes the outside skin", score: 1, why: ["Good when the vulval skin is sore too"],
      how: "Cream or gel applied with an applicator (and to the outside skin if needed), nightly at first (2 weeks for creams, 3 for the gel), then twice a week.",
      brands: ["Estriol cream, Ovestin® 0.1% or Gynest® 0.01%", "Blissel® 50 µg/g estriol gel: nightly 3 weeks, then twice weekly"],
      pros: ["Covers vulval as well as vaginal symptoms", "Dose easy to adjust"], cons: ["Messier than tablets", "Applicator routine"] },
    { id: "vring", icon: "ring", name: "Vaginal ring", tag: "Fit-and-forget · 3 months at a time", score: 1, why: ["Nothing to remember day to day"],
      how: "A soft flexible ring that sits in the upper vagina releasing a steady low dose, worn continuously and swapped every 3 months.",
      brands: ["Estring® 7.5 µg/24 h, changed every 3 months. The SPC recommends reassessment at 2 years, reflecting the duration of trial data rather than evidence of harm; BMS Menopause Practice Standards (June 2026) support continuing for as long as required, with at least annual review"],
      pros: ["Three months per ring", "Comfortable once in, most can't feel it"], cons: ["Insertion and removal takes practice", "Occasional supply gaps"] },
    { id: "vdhea", icon: "capsule", name: "Prasterone (DHEA) pessary", tag: "Second-line · not first-line", score: 0, why: ["Consider if vaginal oestrogen and non-hormonal moisturisers/lubricants haven't helped or weren't tolerated (NICE NG23 1.5.10)"],
      how: "A nightly pessary of DHEA, which the vaginal tissue converts locally into oestrogen and testosterone.",
      brands: ["Intrarosa® 6.5 mg, one pessary nightly"],
      pros: ["Helpful for discomfort with sex", "Local action"], cons: ["Nightly, not twice-weekly", "Leakage can bother some"] },
    { id: "vospem", icon: "pill", name: "Ospemifene", tag: "Second-line · oral, where applying treatment vaginally is impractical", score: 0, why: ["Consider if locally applied treatments are impractical, e.g. because of disability (NICE NG23 1.5.11). Not first-line"],
      how: "A daily oral tablet (a SERM) that acts on vaginal tissue without applying anything vaginally.",
      brands: ["Senshio® 60 mg once daily"],
      pros: ["Oral, nothing to apply vaginally"], cons: ["Contraindicated in suspected breast cancer, during active breast cancer treatment including adjuvant therapy, and with a past or active blood clot (VTE)", "Not part of the breast-cancer pathway"] },
  ];
  return (
    <div>
      <div style={{ background: C.moss, borderRadius: 18, padding: "20px 22px" }}>
        <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#BCD5BE" }}>Your options</div>
        <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: "#fff", marginTop: 6, lineHeight: 1.2 }}>Local vaginal oestrogen</div>
      </div>
      <TakeToAppointment payload={{
        heading: "Local vaginal oestrogen",
        intro: "For vaginal or urinary symptoms",
        summary: [
          { label: "Treatment type", value: "Local vaginal oestrogen, a low dose that acts where the problem is" },
          { label: "Second, protective hormone", value: "Not needed with local vaginal oestrogen" },
          { label: "Long-term use", value: "Safe long-term, with no fixed stop date" },
        ],
        options: cards.map((o) => ({ name: o.name, tag: o.tag, how: o.how, brands: o.brands })),
        notes: [
          "It barely enters the bloodstream, so it can be used on its own, long-term, or alongside other HRT.",
          "Over-the-counter vaginal moisturisers (Replens®, YES®) can be added or used on their own.",
        ],
        points: [],
        answers: describeAnswers(a || {}),
      }} />
      <p style={{ fontFamily: sans, fontSize: 14.5, color: C.ink2, lineHeight: 1.65, margin: "14px 2px 0" }}>
        <strong style={{ color: C.ink }}>In plain terms:</strong> a tiny dose of oestrogen placed where the problem is. It barely enters the bloodstream, so it needs no second hormone and can be used long-term, alongside anything else, or on its own. Vaginal moisturisers (Replens®, YES®) can be added or used alone and are available over the counter.
      </p>
      <TierSection tier="top" items={cards.filter((c) => c.score === 1)} />
      <TierSection tier="mid" items={cards.filter((c) => c.score === 0)} />
      <SafetyNet mode="vaginal" />
      <MoreInfo />
      <CommonQuestions />
      <Resources
        items={[
          { href: WHC.vaginalDryness, label: "Vaginal dryness" },
          { href: WHC.urogenital, label: "Urogenital problems" },
        ]}
        general={[
          { href: WHC.questions, label: "Perimenopause and menopause: your questions answered", note: "Updated April 2026" },
        ]}
      />
      <Expandable title="For professionals">
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.moss, marginBottom: 12 }}>Prescribing notes</div>
          <div style={{ background: "#F4F7EC", border: `1px solid ${C.line}`, borderRadius: 16, padding: "2px 20px" }}>
            <NoteSection icon="addons" title="Protection & monitoring" sub="No fixed stop date.">
              <p style={{ fontFamily: sans, fontSize: 13, color: C.ink2, lineHeight: 1.6, margin: 0 }}>Licensed-dose vaginal oestrogen needs no endometrial protection or routine monitoring; systemic absorption is minimal. Use the lowest effective dose, stepping up only with menopause-specialist input.</p>
            </NoteSection>
            <NoteSection icon="titrate" title="Loading then maintenance">
              <IfRow label="Tablets / creams"><Chip>nightly 2 wk</Chip><Arr /><Chip>twice weekly</Chip></IfRow>
              <IfRow label="Pessary / gel"><Chip>nightly 3 wk</Chip><Arr /><Chip>twice weekly</Chip></IfRow>
              <IfRow label="Ring"><Chip>Estring® 7.5 µg/24h</Chip> worn continuously, changed 3-monthly (SPC reassessment at 2 years reflects trial duration, not harm; BMS June 2026 supports continuing as long as needed with annual review)</IfRow>
            </NoteSection>
            <NoteSection icon="switch" title="Second-line & not recommended">
              <p style={{ fontFamily: sans, fontSize: 13, color: C.ink2, lineHeight: 1.6, margin: "0 0 8px" }}>Second-line where vaginal oestrogen and non-hormonal moisturisers/lubricants fail or aren't tolerated: prasterone (Intrarosa® 6.5 mg pessary, NG23 1.5.10); or ospemifene (Senshio® 60 mg oral, NG23 1.5.11) where vaginal application is impractical — contraindicated in suspected/active breast cancer including adjuvant therapy and in past/active VTE.</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: C.ink2, lineHeight: 1.6, margin: 0 }}>Do not offer vaginal laser for genitourinary symptoms except within a randomised controlled trial (NICE NG23 1.5.20).</p>
            </NoteSection>
            <NoteSection icon="switch" title="Combining & breast cancer" last>
              <p style={{ fontFamily: sans, fontSize: 13, color: C.ink2, lineHeight: 1.6, margin: "0 0 8px" }}>Can be combined with systemic HRT where genitourinary symptoms persist. Reassess for systemic treatment if vasomotor symptoms are also present.</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: C.ink2, lineHeight: 1.6, margin: 0 }}>With a personal history of breast cancer, NICE NG23 (1.5.14–1.5.16, Nov 2024) sets out a stepwise approach: (1) offer non-hormonal vaginal moisturisers and lubricants first; (2) if symptoms persist, consider vaginal oestrogen with oncology-team input (off-label as of Nov 2024; systemic effect on recurrence unknown, and adjuvant anti-oestrogen treatment such as tamoxifen would reduce any such impact); (3) if currently on an aromatase inhibitor, a specialist decision with a breast cancer specialist. Ospemifene is not part of this pathway and is contraindicated during active breast cancer treatment including adjuvant therapy. Vaginal laser is not recommended.</p>
            </NoteSection>
          </div>
        </div>
      </Expandable>
      <PatientDisclaimer />
      <Sources />
      <ToolFooter onFeedback={onFeedback} />
    </div>
  );
}

// ── Scan-first summary: the five things the brief asks to surface immediately ──
function ResultSummary({ route, progestogen, contraception, vaginalMayBeEnough, specialistReview }) {
  const Row = (label, value, tone, last) => (
    <div className="sumrow" style={{ padding: "11px 0", borderBottom: last ? "none" : `1px solid ${C.line}` }}>
      <span style={{ fontFamily: sans, fontSize: 13.5, color: C.ink2, fontWeight: 600 }}>{label}</span>
      <span className="sumval" style={{ fontFamily: sans, fontSize: 14.5, fontWeight: 800, color: tone === "clay" ? C.clayTx : tone === "sand" ? C.sandTx : C.ink }}>{value}</span>
    </div>
  );
  return (
    <div style={{ marginTop: 16, background: C.card, border: `1.5px solid ${C.mossLn}`, borderRadius: 16, padding: "6px 18px", boxShadow: "0 2px 12px rgba(58,80,60,.05)" }}>
      {Row("Best route", route)}
      {Row("Progestogen needed?", progestogen)}
      {Row("Need contraception?", contraception)}
      {Row("Could local vaginal oestrogen be enough?", vaginalMayBeEnough)}
      {specialistReview ? Row("Needs specialist review?", specialistReview, "clay", true) : Row("Needs specialist review?", "Not based on your answers so far", null, true)}
    </div>
  );
}

function SourceTag() {
  return (
    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
      <span style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.mossDk, background: C.mossTint, borderRadius: 999, padding: "4px 11px" }}>Source: {SRC_NG23}</span>
      <span style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.mossDk, background: C.mossTint, borderRadius: 999, padding: "4px 11px" }}>Source: {SRC_BMS}</span>
    </div>
  );
}

function SpecialistPill() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: sans, fontSize: 12.5, fontWeight: 800, color: C.clayTx, background: C.clayBg, border: `1px solid ${C.clayLn}`, borderRadius: 999, padding: "5px 12px", marginTop: 10 }}>
      Needs specialist review: Yes
    </span>
  );
}

// ── Interactive decision-tree explorer. Nodes expand on tap; the patient's own path is pre-lit. ──
function ClinicalAlgorithm({ a }) {
  const hasUterus = a ? needsProg(a) : null;
  const peri = a ? a.timing === "peri" : null;
  const [open, setOpen] = useState(null);

  const PROC = {
    lit: { fill: "#E6EFE3", stroke: "#47694F", tx: "#35503C", sub: "#5C6B5F" },
    dim: { fill: "#FBFBF9", stroke: "#DFE5D8", tx: "#9AA69C", sub: "#B4BEB2" },
    neutral: { fill: "#FFFFFF", stroke: "#CBDCC9", tx: "#35503C", sub: "#5C6B5F" },
  };
  const SPINE = PROC.lit, SPINE_DIM = PROC.dim;
  const DEC = { fill: "#F7EDD9", stroke: "#E7D3A6", tx: "#8A6320" };
  const CAP = { fill: "#47694F", stroke: "#35503C", tx: "#FFFFFF", sub: "#DDEBDA" };
  const TB = { fill: "#F5E4E0", stroke: "#E3BFB8", tx: "#99483D" };
  const st = (onPath) => (a == null ? PROC.neutral : onPath ? PROC.lit : PROC.dim);
  const bd = (s, id) => ({ stroke: open === id ? "#35503C" : s.stroke, strokeWidth: open === id ? 2.8 : 1.5 });

  const sEst = st(hasUterus === false), sProg = st(hasUterus === true);
  const sSeq = st(hasUterus === true && peri === true), sCont = st(hasUterus === true && peri === false);
  const sProgDose = hasUterus === false ? SPINE_DIM : SPINE;

  const DETAIL = {
    start: ["Systemic HRT indicated", "Confirm menopausal symptoms and no red flags. No routine bloods to start at 45+ with typical symptoms; record BP and weight/BMI, and assess VTE, cardiovascular, breast-cancer and migraine risk from the history. FSH only if (a) aged 40–45 with menopausal symptoms including a change in menstrual cycle — a single FSH may be considered, repeat only if diagnostic uncertainty remains (NICE NG23 1.3.6); or (b) under 40 with suspected POI — two samples at least 4–6 weeks apart, elevated on both (NICE NG23 1.7.2; no numeric threshold). The two-sample rule applies to POI only, not the 40–45 group. Exclude pregnancy in perimenopause if cycles are irregular."],
    uterus: ["Uterus?", "The single biggest branch point. A uterus, including after ablation where lining can remain, needs a progestogen for endometrial protection. After hysterectomy, oestrogen alone is enough."],
    estonly: ["Oestrogen only", "No progestogen needed: adding one gives no benefit and needless progestogenic load. Estradiol by patch, gel, spray or tablet. This path skips the peri/post branch and goes straight to route and dose."],
    prog: ["Add a progestogen", "Protects the endometrium. Micronised progesterone (body-identical, lowest VTE/breast risk), a 52 mg LNG-IUS, or a synthetic within a combined product."],
    timing: ["Peri or post-menopausal?", "Sets the progestogen pattern. Peri, or under 12 months amenorrhoea, suits sequential; post (12+ months amenorrhoea, post-ablation, or on contraception) suits continuous."],
    seq: ["Sequential, monthly bleed", "Progestogen ~12–14 days per cycle: micronised progesterone 200 mg at night for 12 nights (days 15–26). A predictable monthly bleed is expected and continues for as long as she stays on this regimen, so it is not a red flag. Switch to continuous after 5 years of use or by age 54, whichever comes first."],
    cont: ["Continuous combined, bleed-free", "Both hormones daily, aiming bleed-free: micronised progesterone 100 mg every night, or a 52 mg LNG-IUS. Better endometrial protection than sequential. Early spotting usually settles; bleeding after about 6 months of settling counts as unscheduled."],
    route: ["Route", "Transdermal estradiol (patch, gel, spray) is preferred: at standard doses it isn't linked to VTE above baseline. Avoid oral with a clot or cardiovascular history, BMI 30+, migraine, or age 60+. Transdermal is the route for anyone continuing past 60."],
    startlow: ["Start low", "Patch: Evorel®/Estradot® 25 µg twice weekly. Gel: Oestrogel® 1 pump (0.75 mg) daily, or Sandrena® 0.5 mg. Spray: Lenzetto® 1–2 sprays daily. Oral if chosen: estradiol 0.5 mg daily. (BMS May 2026 Table 2 low band.) Younger women and POI often need higher starting doses."],
    progdose: ["Match the progestogen to the dose", "The progestogen dose must keep pace with the oestrogen dose, not merely be present. At standard oestrogen: micronised progesterone 200 mg × 12 nights (sequential) or 100 mg nightly (continuous). Minimum days per cycle in a sequential regimen (BMS May 2026): norethisterone 10 days, medroxyprogesterone 10 days, micronised progesterone 12 days; dydrogesterone has no stated minimum, use the licensed Femoston 14-day regimen as reference (10 mg at low/medium oestrogen, 20 mg at high). BMS May 2026 Table 3 is the definitive dose-per-oestrogen-dose matrix. BMS notes 'two weeks on, two weeks off' per 28-day cycle may reduce administration and prescribing errors."],
    review: ["Review at 3 months", "Reassess symptom control, side effects, bleeding pattern, BP and weight. Controlled and tolerated → continue and review yearly. Not controlled → titrate up and loop back."],
    controlled: ["Symptoms controlled?", "The decision point of the titration loop. If flushes still break through and it's tolerated, step up; if settled, hold and review yearly."],
    escalate: ["Step the oestrogen up", "Move up one step and review in ~3 months. Patch 25 → 37.5/50 → 75 → 100 µg. Gel 1 → 2-3 → 4 pumps. Spray 1–2 → 3. Try a different preparation before exceeding the licensed dose. At high dose (100 µg patch / 4 pumps), raise the progestogen in step: micronised progesterone 300 mg × 12 nights sequential, or 200 mg nightly continuous."],
    end: ["Continue, review yearly", "Lowest effective dose maintained. Annual review of symptoms, side effects, bleeding, BP and weight, and whether HRT is still wanted."],
    tb_bleed: ["Unscheduled bleeding", "Bleeding on top of, or instead of, the expected pattern (or any bleeding on a bleed-free continuous regimen). Common in the first 6 months of starting, or within 3 months of a change. Modify the progestogen first. Full triggers for urgent transvaginal scan and cancer-pathway referral are in the clinician reference block below (BMS May 2026 / NICE NG23 1.8.4–1.8.5)."],
    tb_prog: ["Progestogenic side effects", "Switch class (micronised progesterone or dydrogesterone are often better tolerated than norethisterone/LNG; dydrogesterone not with any meningioma history), change route, or use a 52 mg LNG-IUS to deliver the progestogen locally at a tiny dose."],
    tb_seq: ["Sequential in place ≥5 years", "Switch sequential to continuous combined after 5 years of use or by age 54, whichever comes first, as prolonged sequential exposure raises endometrial risk."],
  };

  // anchor = [centreX, topY, bottomY] in viewBox units (460 × 1090)
  const ANCH = {
    start: [230, 18, 62], uterus: [230, 84, 152], estonly: [79, 182, 228], prog: [230, 174, 220],
    timing: [230, 250, 322], seq: [95, 352, 402], cont: [365, 352, 402], route: [230, 476, 524],
    startlow: [230, 540, 594], progdose: [230, 606, 656], review: [230, 672, 718], controlled: [230, 742, 818],
    end: [360, 846, 892], escalate: [104, 846, 902], tb_bleed: [120, 962, 1014], tb_prog: [340, 962, 1014], tb_seq: [230, 1030, 1074],
  };
  const VB_W = 460, VB_H = 1090;
  const N = ({ id, children }) => (
    <g className="algonode" onClick={() => setOpen(open === id ? null : id)} style={{ cursor: "pointer", transition: "opacity .15s" }}>{children}</g>
  );

  let card = null;
  if (open && ANCH[open]) {
    const [cx, topY, botY] = ANCH[open];
    const above = topY > 545;
    card = (
      <div style={{ position: "absolute", left: 10, right: 10, zIndex: 6,
        top: `${(above ? topY : botY) / VB_H * 100}%`,
        transform: above ? "translateY(calc(-100% - 8px))" : "translateY(8px)" }}>
        <div style={{ position: "relative", background: "#fff", border: `1.5px solid ${C.mossLn}`, borderRadius: 12, boxShadow: "0 6px 22px rgba(42,51,44,0.18)", padding: "12px 34px 13px 14px" }}>
          <button onClick={(e) => { e.stopPropagation(); setOpen(null); }} aria-label="Close"
            style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 7, border: "none", background: C.mossTint, color: C.mossDk, fontSize: 15, lineHeight: "24px", textAlign: "center", cursor: "pointer", padding: 0 }}>×</button>
          <div style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 800, color: C.mossDk, marginBottom: 4 }}>{DETAIL[open][0]}</div>
          <div style={{ fontFamily: sans, fontSize: 13, color: C.ink, lineHeight: 1.6 }}>{DETAIL[open][1]}</div>
          <span style={{ position: "absolute", left: `${cx / VB_W * 100}%`, transform: "translateX(-50%)", width: 0, height: 0,
            borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
            ...(above ? { bottom: -8, borderTop: "8px solid #fff" } : { top: -8, borderBottom: "8px solid #fff" }) }} />
        </div>
      </div>
    );
  }

  // legend
  const Sw = ({ s }) => <span style={{ display: "inline-block", flexShrink: 0, ...s }} />;
  const Item = ({ s, label }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Sw s={s} /><span style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink }}>{label}</span>
    </span>
  );
  const box = (fill, stroke) => ({ width: 22, height: 15, borderRadius: 4, background: fill, border: `1.5px solid ${stroke}` });
  const legendItems = a == null
    ? [[box("#fff", C.mossLn), "A step in the pathway"],
       [{ width: 14, height: 14, transform: "rotate(45deg)", background: DEC.fill, border: `1.5px solid ${DEC.stroke}` }, "A question with two ways on"]]
    : [[box(PROC.lit.fill, PROC.lit.stroke), "The path your answers follow"],
       [box(PROC.dim.fill, PROC.dim.stroke), "Branch not taken"]];

  return (
    <div>
      {a && <div style={{ fontFamily: sans, fontSize: 12.5, color: C.mossDk, background: C.mossTint, border: `1px solid ${C.mossLn}`, borderRadius: 10, padding: "8px 12px", marginBottom: 10, lineHeight: 1.5 }}>
        The highlighted boxes trace this person's path. Tap any box to expand its detail, including doses and the escalation ladder.
      </div>}
      {!a && <div style={{ fontFamily: sans, fontSize: 12.5, color: C.ink2, marginBottom: 10, lineHeight: 1.5 }}>
        Tap any box to expand its detail, including starting doses, the escalation ladder and progestogen matching.
      </div>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px", padding: "12px 14px", background: "#FAFBF6", border: `1px solid ${C.line}`, borderRadius: 12, marginBottom: 12 }}>
        {legendItems.map(([s, label], i) => <Item key={i} s={s} label={label} />)}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: C.moss, color: "#fff", fontFamily: sans, fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</span>
          <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.ink }}>Tap any box to read more</span>
        </span>
      </div>

      <div style={{ position: "relative", maxWidth: 460, margin: "0 auto" }}>
        {open && <div onClick={() => setOpen(null)} style={{ position: "absolute", inset: 0, background: "rgba(245,247,238,0.55)", zIndex: 5, borderRadius: 8 }} />}
        <svg viewBox="0 0 460 1090" width="100%" style={{ display: "block", height: "auto" }} role="img" aria-label="HRT decision and dose-escalation flowchart">
          <defs>
            <marker id="hrtarrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M0,0 L6,3 L0,6 Z" fill="#8AA290" />
            </marker>
            <filter id="hrtsh" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2.2" floodColor="#3A503C" floodOpacity="0.14" />
            </filter>
          </defs>

          <g fill="none" stroke="#8AA290" strokeWidth="2">
            <path d="M230,62 V84" markerEnd="url(#hrtarrow)" />
            <path d="M158,118 H79 V182" markerEnd="url(#hrtarrow)" />
            <path d="M230,152 V174" markerEnd="url(#hrtarrow)" />
            <path d="M230,220 V250" markerEnd="url(#hrtarrow)" />
            <path d="M144,286 H90 V352" markerEnd="url(#hrtarrow)" />
            <path d="M316,286 H370 V352" markerEnd="url(#hrtarrow)" />
            <path d="M95,402 V430 H230" />
            <path d="M365,402 V430 H230" />
            <path d="M79,228 V240 H8 V462 H230" markerEnd="url(#hrtarrow)" />
            <path d="M230,430 V476" markerEnd="url(#hrtarrow)" />
            <path d="M230,524 V540" markerEnd="url(#hrtarrow)" />
            <path d="M230,594 V606" markerEnd="url(#hrtarrow)" />
            <path d="M230,656 V672" markerEnd="url(#hrtarrow)" />
            <path d="M230,718 V742" markerEnd="url(#hrtarrow)" />
            <path d="M326,780 H380 V846" markerEnd="url(#hrtarrow)" />
            <path d="M134,780 H70 V846" markerEnd="url(#hrtarrow)" />
            <path d="M14,874 H6 V695 H110" markerEnd="url(#hrtarrow)" strokeDasharray="5 4" />
          </g>

          <g fontFamily={sans} fontSize="11" fill="#5C6B5F" textAnchor="middle">
            <text x="116" y="110">No</text>
            <text x="243" y="167">Yes</text>
            <text x="108" y="276">Peri</text>
            <text x="345" y="276">Post</text>
            <text x="352" y="771">Yes</text>
            <text x="100" y="771">No</text>
            <text x="40" y="792" fill="#99483D" transform="rotate(-90 40 792)">not controlled</text>
          </g>

          <N id="start">
            <rect x="110" y="18" width="240" height="44" rx="22" fill={CAP.fill} {...bd(CAP, "start")} filter="url(#hrtsh)" />
            <text x="230" y="45" textAnchor="middle" fontFamily={sans} fontSize="14" fontWeight="700" fill={CAP.tx}>Systemic HRT indicated</text>
          </N>

          <N id="uterus">
            <polygon points="230,84 302,118 230,152 158,118" fill={DEC.fill} {...bd(DEC, "uterus")} filter="url(#hrtsh)" />
            <text x="230" y="123" textAnchor="middle" fontFamily={sans} fontSize="13" fontWeight="700" fill={DEC.tx}>Uterus?</text>
          </N>

          <N id="estonly">
            <rect x="16" y="182" width="126" height="46" rx="12" fill={sEst.fill} {...bd(sEst, "estonly")} filter="url(#hrtsh)" />
            <text x="79" y="210" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={sEst.tx}>Oestrogen only</text>
          </N>

          <N id="prog">
            <rect x="152" y="174" width="156" height="46" rx="12" fill={sProg.fill} {...bd(sProg, "prog")} filter="url(#hrtsh)" />
            <text x="230" y="202" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={sProg.tx}>Add a progestogen</text>
          </N>

          <N id="timing">
            <polygon points="230,250 316,286 230,322 144,286" fill={DEC.fill} {...bd(DEC, "timing")} filter="url(#hrtsh)" />
            <text x="230" y="283" textAnchor="middle" fontFamily={sans} fontSize="12" fontWeight="700" fill={DEC.tx}>Peri or</text>
            <text x="230" y="297" textAnchor="middle" fontFamily={sans} fontSize="12" fontWeight="700" fill={DEC.tx}>post-menopausal?</text>
          </N>

          <N id="seq">
            <rect x="15" y="352" width="160" height="50" rx="12" fill={sSeq.fill} {...bd(sSeq, "seq")} filter="url(#hrtsh)" />
            <text x="95" y="374" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={sSeq.tx}>Sequential</text>
            <text x="95" y="390" textAnchor="middle" fontFamily={sans} fontSize="11.5" fill={sSeq.sub}>monthly bleed</text>
          </N>

          <N id="cont">
            <rect x="285" y="352" width="160" height="50" rx="12" fill={sCont.fill} {...bd(sCont, "cont")} filter="url(#hrtsh)" />
            <text x="365" y="374" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={sCont.tx}>Continuous</text>
            <text x="365" y="390" textAnchor="middle" fontFamily={sans} fontSize="11.5" fill={sCont.sub}>bleed-free</text>
          </N>

          <N id="route">
            <rect x="70" y="476" width="320" height="48" rx="12" fill={SPINE.fill} {...bd(SPINE, "route")} filter="url(#hrtsh)" />
            <text x="230" y="497" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={SPINE.tx}>Route: transdermal preferred</text>
            <text x="230" y="513" textAnchor="middle" fontFamily={sans} fontSize="11.5" fill={SPINE.sub}>oral only if low-risk</text>
          </N>

          <N id="startlow">
            <rect x="50" y="540" width="360" height="54" rx="12" fill={SPINE.fill} {...bd(SPINE, "startlow")} filter="url(#hrtsh)" />
            <text x="230" y="562" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={SPINE.tx}>Start low</text>
            <text x="230" y="579" textAnchor="middle" fontFamily={sans} fontSize="11" fill={SPINE.sub}>patch 25µg · gel 1 pump · spray 1–2 · oral 0.5mg</text>
          </N>

          <N id="progdose">
            <rect x="60" y="606" width="340" height="50" rx="12" fill={sProgDose.fill} {...bd(sProgDose, "progdose")} filter="url(#hrtsh)" />
            <text x="230" y="628" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={sProgDose.tx}>Match progestogen</text>
            <text x="230" y="644" textAnchor="middle" fontFamily={sans} fontSize="11.5" fill={sProgDose.sub}>to the oestrogen dose</text>
          </N>

          <N id="review">
            <rect x="110" y="672" width="240" height="46" rx="12" fill={SPINE.fill} {...bd(SPINE, "review")} filter="url(#hrtsh)" />
            <text x="230" y="700" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={SPINE.tx}>Review at 3 months</text>
          </N>

          <N id="controlled">
            <polygon points="230,742 326,780 230,818 134,780" fill={DEC.fill} {...bd(DEC, "controlled")} filter="url(#hrtsh)" />
            <text x="230" y="777" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={DEC.tx}>Symptoms</text>
            <text x="230" y="791" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={DEC.tx}>controlled?</text>
          </N>

          <N id="end">
            <rect x="270" y="846" width="180" height="46" rx="23" fill={CAP.fill} {...bd(CAP, "end")} filter="url(#hrtsh)" />
            <text x="360" y="867" textAnchor="middle" fontFamily={sans} fontSize="12" fontWeight="700" fill={CAP.tx}>Continue</text>
            <text x="360" y="882" textAnchor="middle" fontFamily={sans} fontSize="11" fill={CAP.sub}>review yearly</text>
          </N>

          <N id="escalate">
            <rect x="14" y="846" width="180" height="56" rx="12" fill={DEC.fill} {...bd(DEC, "escalate")} filter="url(#hrtsh)" />
            <text x="104" y="869" textAnchor="middle" fontFamily={sans} fontSize="12" fontWeight="700" fill={DEC.tx}>Step oestrogen up</text>
            <text x="104" y="885" textAnchor="middle" fontFamily={sans} fontSize="11" fill={DEC.tx}>raise progestogen in step</text>
          </N>

          <text x="20" y="948" fontFamily={sans} fontSize="11.5" fontWeight="800" letterSpacing="0.7" fill="#5C6B5F">TROUBLESHOOTING</text>
          <N id="tb_bleed">
            <rect x="20" y="962" width="200" height="52" rx="12" fill={TB.fill} {...bd(TB, "tb_bleed")} filter="url(#hrtsh)" />
            <text x="120" y="984" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={TB.tx}>Unscheduled</text>
            <text x="120" y="1000" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={TB.tx}>bleeding</text>
          </N>
          <N id="tb_prog">
            <rect x="240" y="962" width="200" height="52" rx="12" fill={TB.fill} {...bd(TB, "tb_prog")} filter="url(#hrtsh)" />
            <text x="340" y="984" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={TB.tx}>Progestogenic</text>
            <text x="340" y="1000" textAnchor="middle" fontFamily={sans} fontSize="12.5" fontWeight="700" fill={TB.tx}>side effects</text>
          </N>
          <N id="tb_seq">
            <rect x="30" y="1030" width="400" height="44" rx="12" fill={TB.fill} {...bd(TB, "tb_seq")} filter="url(#hrtsh)" />
            <text x="230" y="1057" textAnchor="middle" fontFamily={sans} fontSize="12" fontWeight="700" fill={TB.tx}>Sequential ≥5 yrs → switch to continuous</text>
          </N>
        </svg>
        {card}
      </div>
    </div>
  );
}

function SystemicOutcome({ a, onFeedback }) {
  const { top, mid, low, no, extras } = rankOptions(a);
  const notes = [];
  if (extras.ablation) notes.push("After endometrial ablation, patches of lining usually remain; a protective progestogen is still essential. Guidance treats post-ablation as suiting the everyday (continuous combined) pattern.");
  if (extras.endo) notes.push("With endometriosis, guidance advises specialist input before starting: oestrogen can reactivate leftover deposits (very rarely with malignant change), even after hysterectomy. A combined or continuous approach, or tibolone, is usually preferred.");
  if (extras.fibroids) notes.push("Fibroids can grow slightly on HRT. Report any new pressure symptoms or heavier bleeding.");
  if (extras.fhbreast) notes.push("A close family history of breast cancer doesn't rule HRT out: oestrogen-only barely changes risk, and combined HRT adds a small amount that builds with time on treatment. It's worth a proper individual discussion, and a family-history clinic referral if the history is strong.");
  if (extras.enzyme) notes.push("Liver-enzyme-inducing medicines (like carbamazepine) reduce oral HRT's effect; the skin route avoids the interaction, which is why it's boosted in your results.");
  if (extras.migraine) notes.push("Migraine, even with aura, does not rule out HRT (unlike the combined pill). Skin-route oestrogen at a steady dose is the right pattern; report any new or worsening aura.");
  if (extras.smoker) notes.push("Smoking doesn't rule out HRT (again unlike the combined pill); the skin route is the safe choice. Stop-smoking support is worth considering alongside.");
  if (extras.htn) notes.push("Controlled high blood pressure is not a barrier; skin-route oestrogen doesn't raise it. Keep it monitored.");
  if (extras.dm) notes.push("Diabetes is not a barrier; the skin route is preferred because guidance treats diabetes as adding cardiovascular considerations.");
  if (extras.poi) notes.push("Under 45, hormone treatment is recommended even if symptoms are mild, continuing at least to the natural menopause age (around 51): it replaces hormones the body should still have, and often needs higher oestrogen doses. Specialist input is worthwhile, and pregnancy should be excluded before starting.");
  if (extras.lateInit) notes.push("Starting at 55+ (especially over 60, or more than 10 years after the menopause) means low-dose skin-route oestrogen with micronised progesterone, and a specialist review if higher doses are wanted. Guidance advises transdermal oestrogen for anyone continuing HRT beyond 60.");
  if (extras.both) notes.push("For your vaginal or urinary symptoms, local vaginal oestrogen can be added to any option here. It needs no extra progestogen and doesn't count towards the systemic dose.");
  if (extras.contra) notes.push(`Contraception is needed until ${extras.under50 ? "2 years" : "1 year"} after your last period, and can stop at 55. The coil option covers it; the others need a separate method. A monthly HRT bleed can't be used to judge where you are in the menopause.`);

  const specialist = [];
  if ((a.risk || []).includes("pvte")) specialist.push("A previous provoked clot: guidance treats factors predisposing to clots as a caution: skin-route oestrogen only, with a haematology opinion before starting as the careful path.");
  if ((a.risk || []).includes("fvte")) specialist.push("A family history of clots: skin route only, and consider a haematology assessment first if the history is strong (a first-degree relative, or clots at a young age).");
  if ((a.risk || []).includes("cvd")) specialist.push("A past heart attack or stroke, even fully recovered: specialist input first; if HRT is used it's low-dose skin-route, with risk factors optimised.");

  // ── Scan-first summary fields ──
  const bestRoute = top[0]
    ? (top[0].name.toLowerCase().includes("tablet") || top[0].name.toLowerCase().includes("coc") ? "By mouth" : "Through the skin")
    : "Needs your answers reviewed with a clinician";
  const progestogenNeeded = needsProg(a) ? "Yes, alongside your oestrogen" : "No, not after a hysterectomy";
  const contraceptionNeeded = extras.contra ? "Yes, still needed" : (canConceive(a) ? "Not based on your answer" : "Not applicable at your stage");
  const vaginalEnough = a.symptoms === "vaginal" ? "Yes, this looks like the main route for you" : (a.symptoms === "both" ? "Possibly alongside your other treatment" : "Unlikely to be enough on its own for body-wide symptoms");
  const specialistText = specialist.length ? "Yes, see the flags below" : (extras.poi ? "Worth a specialist conversation, see notes below" : null);

  return (
    <div>
      <div style={{ background: C.moss, borderRadius: 18, padding: "22px 22px" }}>
        <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#BCD5BE" }}>Your results</div>
        <div style={{ fontFamily: serif, fontSize: 25, fontWeight: 600, color: "#fff", marginTop: 6, lineHeight: 1.2 }}>Your likely best options</div>
        <div style={{ fontFamily: sans, fontSize: 13.5, color: "#DDEBDA", marginTop: 7, lineHeight: 1.55 }}>Safety first, then your preferences. Tap any card for detail.</div>
      </div>

      <ResultSummary route={bestRoute} progestogen={progestogenNeeded} contraception={contraceptionNeeded} vaginalMayBeEnough={vaginalEnough} specialistReview={specialistText} />

      <PatientDisclaimer />

      <TakeToAppointment payload={{
        heading: "Your likely best options",
        intro: "Body-wide (systemic) HRT",
        summary: [
          { label: "Best route for you", value: bestRoute },
          { label: "Second, protective hormone", value: progestogenNeeded },
          { label: "Contraception still needed", value: contraceptionNeeded },
          { label: "Vaginal treatment", value: vaginalEnough },
          ...(specialistText ? [{ label: "Specialist review", value: specialistText }] : []),
        ],
        options: [...top, ...mid].map((o) => ({ name: o.name, tag: o.tag, how: o.how, brands: o.brands })),
        notes,
        points: specialist,
        answers: describeAnswers(a),
      }} />

      <TierSection tier="top" items={top} contraNote={extras.contra} />
      <TierSection tier="mid" items={mid} contraNote={extras.contra} />
      <TierSection tier="low" items={low} contraNote={extras.contra} />
      <TierSection tier="no" items={no} contraNote={false} />

      {specialist.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: C.sandTx, marginBottom: 6 }}>Specialist input first</div>
          {specialist.map((t, i) => <Banner key={i}>{t}</Banner>)}
        </div>
      )}

      {notes.length > 0 && (
        <Expandable title="Notes specific to your answers" defaultOpen>
          {notes.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9, fontFamily: sans, fontSize: 14, color: C.ink, lineHeight: 1.6 }}>
              <span style={{ color: C.moss, fontWeight: 800, flexShrink: 0 }}>›</span><span>{t}</span>
            </div>
          ))}
        </Expandable>
      )}

      <SafetyNet mode="systemic" hasUterus={needsProg(a)} />

      <MoreInfo />

      <CommonQuestions />

      <Resources
        showSpecialist={specialist.length > 0 || extras.poi || extras.lateInit}
        general={[
          { href: WHC.typesDoses, label: "HRT: types, doses and regimens", note: "Updated May 2026" },
          { href: WHC.benefitsRisks, label: "HRT: benefits and risks" },
          { href: WHC.questions, label: "Perimenopause and menopause: your questions answered", note: "Updated April 2026" },
        ]}
        items={[
          ...(extras.contra ? [{ href: WHC.contraception, label: "Contraception over the age of 40", note: "Updated December 2025" }] : []),
          ...(extras.both ? [{ href: WHC.vaginalDryness, label: "Vaginal dryness" }] : []),
          ...(extras.migraine ? [{ href: WHC.migraine, label: "Migraine and HRT" }] : []),
          ...(extras.fhbreast ? [{ href: WHC.breastCancer, label: "Breast cancer risk factors" }] : []),
          ...(extras.endo ? [{ href: WHC.endometriosis, label: "Induced menopause in women with endometriosis", note: "Updated February 2026" }] : []),
          ...(extras.fibroids ? [{ href: WHC.fibroids, label: "Fibroids", note: "Updated March 2026" }] : []),
          ...(extras.ablation ? [{ href: WHC.ablation, label: "Endometrial ablation", note: "Updated March 2026" }] : []),
          ...(extras.enzyme ? [{ href: WHC.epilepsy, label: "Epilepsy, the menopause and HRT" }] : []),
          ...(!needsProg(a) ? [{ href: WHC.surgical, label: "Surgical menopause", note: "Updated September 2025" }] : []),
        ]}
      />

      <Expandable title="Side effects & fixes"><SideEffects /></Expandable>
      <Expandable title="If you can't, or would rather not, take hormones"><NonHormonal /></Expandable>

      <Expandable title="For professionals">
        <ProZone a={a} />
      </Expandable>

      <Sources />
      <ToolFooter onFeedback={onFeedback} />
    </div>
  );
}

// ── Reference-panel primitives: monospace dose chips, ladders, if/then rows ──
function NoteIcon({ id }) {
  const p = { fill: "none", stroke: C.moss, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const w = (k) => <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>{k}</svg>;
  switch (id) {
    case "titrate": return w(<><path d={"M4 15l5-5 4 4 7-8"} {...p} /><path d={"M17 6h3v3"} {...p} /></>);
    case "switch": return w(<><path d={"M6 9h11l-3-3"} {...p} /><path d={"M18 15H7l3 3"} {...p} /></>);
    case "transition": return w(<path d={"M4 12h14m0 0l-4-4m4 4l-4 4"} {...p} />);
    case "bleed": return w(<path d={"M12 4s6 6.2 6 10a6 6 0 01-12 0c0-3.8 6-10 6-10z"} {...p} />);
    case "addons": return w(<><circle cx="12" cy="12" r="8" {...p} /><path d={"M12 8.5v7M8.5 12h7"} {...p} /></>);
    default: return w(<circle cx="12" cy="12" r="8" {...p} />);
  }
}
function Chip({ children }) {
  return <span style={{ fontFamily: mono, fontSize: 11.5, color: C.mossDk, background: C.mossTint, border: `1px solid ${C.mossLn}`, borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap", display: "inline-block" }}>{children}</span>;
}
function Arr() {
  return <span style={{ fontFamily: mono, fontSize: 12, color: C.moss, margin: "0 4px" }}>→</span>;
}
function Ladder({ label, steps, unit }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 2px", padding: "4px 0" }}>
      <span style={{ fontFamily: sans, fontSize: 12.5, fontWeight: 500, color: C.moss, minWidth: 58, flexShrink: 0 }}>{label}</span>
      {steps.map((s, i) => (
        <React.Fragment key={i}>{i > 0 && <Arr />}<Chip>{s}</Chip></React.Fragment>
      ))}
      {unit && <span style={{ fontFamily: sans, fontSize: 12.5, color: C.ink2, marginLeft: 6 }}>{unit}</span>}
    </div>
  );
}
function IfRow({ label, children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", padding: "6px 0" }}>
      <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: C.moss, minWidth: 96, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: sans, fontSize: 13, color: C.ink2, lineHeight: 1.6, flex: 1, minWidth: 200 }}>{children}</span>
    </div>
  );
}
function NoteSection({ icon, title, sub, last, children }) {
  return (
    <div style={{ padding: "17px 0", borderBottom: last ? "none" : `1px solid #E7ECDD` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <NoteIcon id={icon} />
        <span style={{ fontFamily: sans, fontSize: 14.5, fontWeight: 500, color: C.ink }}>{title}</span>
      </div>
      {sub && <div style={{ fontFamily: sans, fontSize: 12.5, color: C.ink2, margin: "3px 0 0 31px" }}>{sub}</div>}
      <div style={{ margin: "9px 0 0 31px", maxWidth: "66ch" }}>{children}</div>
    </div>
  );
}
function PrescribingNotes() {
  const body = { fontFamily: sans, fontSize: 13, color: C.ink2, lineHeight: 1.6, margin: 0 };
  return (
    <div style={{ background: "#F4F7EC", border: `1px solid ${C.line}`, borderRadius: 16, padding: "2px 20px" }}>
      <NoteSection icon="titrate" title="Routine titration" sub="Review at 3 months, then annually.">
        <div style={{ margin: "0 0 8px" }}>
          <Ladder label="Patch" steps={["25", "37.5/50", "75", "100"]} unit="µg" />
          <Ladder label="Gel" steps={["1", "2-3", "4"]} unit="pumps" />
          <Ladder label="Spray" steps={["1", "3"]} unit="sprays" />
        </div>
        <p style={body}>Raise the progestogen in step at high oestrogen doses: micronised progesterone 300 mg (sequential) or 200 mg (continuous).</p>
      </NoteSection>

      <NoteSection icon="switch" title="Progestogen switching">
        <p style={body}>For persistent progestogenic effects, switch class (MPA and dydrogesterone are less androgenic than NET or LNG; dydrogesterone is contraindicated with a meningioma history), or move to micronised progesterone or a 52 mg LNG-IUS.</p>
      </NoteSection>

      <NoteSection icon="transition" title="Regimen transitions">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 2px", padding: "2px 0 8px" }}>
          <Chip>Sequential</Chip><Arr /><Chip>continuous</Chip>
          <span style={{ fontFamily: sans, fontSize: 12.5, color: C.ink2, marginLeft: 8 }}>after 5 years, or by 54 (whichever comes first)</span>
        </div>
        <p style={body}>If breakthrough bleeding after a sequential → continuous switch has not settled by 3–6 months, revert to sequential for a further year.</p>
      </NoteSection>

      <NoteSection icon="bleed" title="Unscheduled bleeding — clinician reference">
        <p style={{ ...body, fontWeight: 700, color: C.ink, margin: "0 0 6px" }}>⚠ For clinicians.</p>
        <p style={body}>Source: BMS <em>Management of Unscheduled Bleeding on HRT</em>, May 2026 (with RCOG, BGCS, BSGE, CoSRH, GIRFT, RCGP) and NICE NG23 1.8.4/1.8.5. The 6-month threshold below supersedes the "4–6 months" figure in the older BMS <em>Progestogens and endometrial protection</em> tool; the May 2026 joint guideline takes precedence.</p>
        <p style={{ ...body, marginTop: 8, fontWeight: 600, color: C.ink }}>Expected windows (NG23 1.8.4, amended Apr 2026)</p>
        <p style={body}>Bleeding is common in the first 6 months of systemic HRT, or within any 3 months of a dose/preparation change. Advise prompt review outside these windows.</p>
        <p style={{ ...body, marginTop: 8, fontWeight: 600, color: C.ink }}>Urgent TVS within 6 weeks — three independent triggers, each sufficient alone</p>
        <p style={body}>1. First bleeding presents &gt;6 months after starting, or &gt;3 months after a change.<br />2. Bleeding is prolonged (withdrawal bleed &gt;7 days), heavy (flooding/clots), or persistent (even light, most days for ≥4 weeks) — irrespective of timing.<br />3. 2 minor risk factors — irrespective of timing.</p>
        <p style={{ ...body, marginTop: 8, fontWeight: 600, color: C.ink }}>USCP referral (separate pathway)</p>
        <p style={body}>1 major, or ≥3 minor, risk factors — irrespective of bleeding type or interval. Offer progestogen adjustment or HRT cessation while awaiting assessment. (Seen within 2 weeks; 28-day Faster Diagnosis Standard.)</p>
        <p style={{ ...body, marginTop: 8, fontWeight: 600, color: C.ink }}>Major risk factors (BMS May 2026, Table 1)</p>
        <p style={body}>BMI ≥40 · genetic predisposition (Lynch/Cowden) · oestrogen-only HRT &gt;6 months with a uterus · tricycling (quarterly progestogen) &gt;12 months · sHRT &gt;5 years when started aged ≥45 · ≥12 months of NET or MPA &lt;10 days/month, or micronised progesterone &lt;12 days/month, in a sequential regimen.</p>
        <p style={{ ...body, marginTop: 8, fontWeight: 600, color: C.ink }}>Minor risk factors (BMS May 2026, Table 1)</p>
        <p style={body}>BMI 30–39 · unopposed oestrogen &gt;3 but &lt;6 months · tricycling &gt;6 but &lt;12 months · &gt;6 but &lt;12 months of NET/MPA &lt;10 days/month or micronised progesterone &lt;12 days/month (sequential) · progestogen out of proportion to oestrogen &gt;12 months, incl. an expired 52 mg LNG-IUS* · anovulatory cycles e.g. PCOS · diabetes.</p>
        <p style={{ ...body, fontSize: 12 }}>* Limited evidence on endometrial-cancer impact; BMS designates it a research priority — apply judgement.</p>
        <p style={{ ...body, marginTop: 8, fontWeight: 600, color: C.ink }}>Conservative management</p>
        <p style={body}>Only where all apply: no major or minor risk factors; no heavy/prolonged/daily bleeding; bleeding within the expected window. Offer progestogen adjustment (dose, duration or class) totalling 6 months from first presentation (not from HRT start). If it persists at 6 months or worsens at any point, offer urgent TVS within 6 weeks. One minor risk factor within the window with no heavy/prolonged/daily bleeding is not scripted by the guideline — use individual judgement; do not escalate by default.</p>
        <p style={{ ...body, marginTop: 8, fontWeight: 600, color: C.ink }}>TVS interpretation</p>
        <p style={body}>Uniform, fully visualised endometrium ≤4 mm on ccHRT or ≤7 mm on sHRT → low risk; offer HRT adjustments for 6 months, refer urgently if bleeding increases or continues beyond that. &gt;4 mm ccHRT / &gt;7 mm sHRT → USCP for endometrial assessment (biopsy and/or hysteroscopy). Not fully visualised (even if the visible area is within limits) → urgent endometrial assessment within 6 weeks.</p>
        <p style={{ ...body, marginTop: 8, fontWeight: 600, color: C.ink }}>52 mg LNG-IUS at 4 years</p>
        <p style={body}>New unscheduled bleeding at/after 4 years of use → offer a device change once cancer-exclusion tests are normal, particularly with above-licence oestrogen doses or BMI ≥40.</p>
        <p style={{ ...body, marginTop: 10, fontWeight: 600, color: C.ink }}>First-line progestogen modification</p>
        <IfRow label="Cyclical"><Chip>200</Chip><Arr /><Chip>300 mg</Chip> micronised progesterone, or extend to <Chip>14 d</Chip>, or <Chip>21 of 28</Chip></IfRow>
        <IfRow label="Continuous"><Chip>100</Chip><Arr /><Chip>200 mg</Chip></IfRow>
        <IfRow label="Combined / LNG-IUD">add micronised progesterone, MPA or NET</IfRow>
      </NoteSection>

      <div style={{ display: "flex", gap: 12, background: "#FAEBE6", border: "1px solid #E6B6A8", borderRadius: 12, padding: "14px 16px", margin: "16px 0" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 3l9 16H3z" fill="none" stroke="#B23A22" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4" stroke="#B23A22" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="16.6" r="1" fill="#B23A22" /></svg>
        <div>
          <div style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 500, color: "#8A2B15" }}>Safety flag</div>
          <div style={{ fontFamily: sans, fontSize: 13.5, color: "#7A2C18", lineHeight: 1.55, maxWidth: "62ch", marginTop: 2 }}>Unopposed oestrogen with a uterus for more than 6 months is a major endometrial-cancer risk factor. Correct promptly.</div>
        </div>
      </div>

      <NoteSection icon="addons" title="Add-ons & stopping" last>
        <IfRow label="Route">oral → transdermal for anyone continuing past 60</IfRow>
        <IfRow label="Testosterone">off-licence for persistent low libido after HRT optimisation, with baseline and follow-up total testosterone / SHBG</IfRow>
        <IfRow label="Stopping">no fixed maximum duration; gradual withdrawal limits short-term vasomotor recurrence, with equivalent long-term outcomes. Vaginal oestrogen may continue independently</IfRow>
      </NoteSection>
    </div>
  );
}
function ProZone({ a }) {
  const eyebrow = (t) => (
    <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.moss, marginBottom: 12 }}>{t}</div>
  );
  return (
    <div>
      <div>
        {eyebrow("Decision tool")}
        <div style={{ background: "#fff", border: `1.5px solid ${C.mossLn}`, borderRadius: 18, padding: "16px 16px 6px", boxShadow: "0 6px 22px rgba(53,80,60,.09)" }}>
          <ClinicalAlgorithm a={a} />
        </div>
      </div>
      <div style={{ height: 46 }} />
      <div>
        {eyebrow("Prescribing notes")}
        <PrescribingNotes />
      </div>
    </div>
  );
}

function AdjustOutcome({ a, onFeedback }) {
  const { top, mid, low, flags } = rankAdjust(a);
  return (
    <div>
      <div style={{ background: C.moss, borderRadius: 18, padding: "22px 22px" }}>
        <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#BCD5BE" }}>Your review</div>
        <div style={{ fontFamily: serif, fontSize: 25, fontWeight: 600, color: "#fff", marginTop: 6, lineHeight: 1.2 }}>Ways to adjust your HRT</div>
        <div style={{ fontFamily: sans, fontSize: 13.5, color: "#DDEBDA", marginTop: 7, lineHeight: 1.55 }}>Ranked against the reasons you gave. Tap any card for detail.</div>
      </div>
      {(flags.unopposed || flags.bleedAssess) && <SpecialistPill />}

      <PatientDisclaimer />

      <TakeToAppointment payload={{
        heading: "Ways to adjust your HRT",
        intro: "Reviewing HRT you already take",
        summary: [],
        options: [...top, ...mid].map((o) => ({ name: o.name, tag: o.tag, how: o.how, brands: o.brands })),
        notes: [],
        points: [
          ...(flags.unopposed ? ["Your answers suggest oestrogen without protection for the uterus lining. This needs correcting, so book in soon rather than waiting for a routine review."] : []),
          ...(flags.bleedAssess ? ["Unexpected, irregular or heavy bleeding beyond the settling-in period should be assessed (usually an examination, sometimes a scan) before any regimen change."] : []),
          ...(flags.earlyBleed ? ["Early spotting is usually the regimen settling and often resolves by 6 months. Book a review if it is heavy, painful, or continues past that."] : []),
          ...(flags.noUterusCombined ? ["You are on a combined product without a uterus, so ask whether the progestogen is still needed."] : []),
        ],
        answers: describeAnswers(a),
      }} />

      {flags.unopposed && (
        <Banner tone="clay" title="Worth a prompt appointment">
          Your answers suggest oestrogen without any protection for the uterus lining. That combination needs correcting, see the top card, and book in soon rather than waiting for a routine review.
        </Banner>
      )}
      {flags.bleedAssess && (
        <Banner tone="clay" title="Bleeding needs checking before anything changes">
          Unexpected, irregular or heavy bleeding beyond the settling-in period should be assessed first, usually an examination, and sometimes a scan, before any regimen change. Adjustments can wait a week or two; the check shouldn't.
        </Banner>
      )}
      {flags.earlyBleed && (
        <Banner title="Early bleeding is usually the regimen settling">
          Spotting and irregular bleeding are common in the first months of a new regimen and usually settle by 6 months. If it's heavy, painful, or carries on past that, book a review.
        </Banner>
      )}
      {flags.noUterusCombined && (
        <Banner title="A simplification may be available">
          You're on a combined product without a uterus, see the card below about whether the progestogen is still needed.
        </Banner>
      )}

      <TierSection tier="top" items={top} />
      <TierSection tier="mid" items={mid} />
      <TierSection tier="low" items={low} />

      <SafetyNet mode="systemic" hasUterus={needsProg(a)} />

      <MoreInfo />

      <CommonQuestions />

      <Resources
        showSpecialist={flags.unopposed || flags.bleedAssess}
        general={[
          { href: WHC.typesDoses, label: "HRT: types, doses and regimens", note: "Updated May 2026" },
          { href: WHC.benefitsRisks, label: "HRT: benefits and risks" },
        ]}
        items={[
          ...((a.reasons || []).includes("bleeding") ? [{ href: WHC.bleeding, label: "Managing unscheduled bleeding on HRT", note: "Updated May 2026" }] : []),
          ...((a.reasons || []).includes("libido") ? [{ href: WHC.testosterone, label: "Testosterone for women" }] : []),
          ...((a.reasons || []).includes("gu") ? [{ href: WHC.vaginalDryness, label: "Vaginal dryness" }] : []),
          ...((a.reasons || []).includes("contraNeed") ? [{ href: WHC.contraception, label: "Contraception over the age of 40", note: "Updated December 2025" }] : []),
        ]}
      />

      <Expandable title="Side effects & fixes"><SideEffects /></Expandable>

      <Expandable title="For professionals">
        <ProZone a={a} />
      </Expandable>

      <Sources />
      <ToolFooter onFeedback={onFeedback} />
    </div>
  );
}

// ══════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// SECTION 5 — APP SHELL
// Screen state, navigation, and the meadow visual shell. Routes
// between the intro, the questions (SECTION 2 data), the feedback
// screen, and the outcome pages (built from SECTION 3's output).
// ══════════════════════════════════════════════════════════════
function HRTOptionsFinder() {
  const [screen, setScreen] = useState("intro");
  const [history, setHistory] = useState([]);
  const [a, setA] = useState({});
  const [tempMulti, setTempMulti] = useState([]);

  useEffect(() => {
    const h = (e) => { const m = (e && e.detail) || "start"; setA({ mode: m }); setHistory(["intro"]); setScreen("redflags"); setTempMulti([]); };
    const f = () => { setHistory((prev) => (prev.length ? prev : ["intro"])); setScreen("feedback"); };
    window.addEventListener("hrt-start", h);
    window.addEventListener("hrt-feedback", f);
    // Pick up an intent set before this component finished mounting (deferred mount handoff).
    if (window.__hrtPendingMode) { const m = window.__hrtPendingMode; window.__hrtPendingMode = null; setA({ mode: m }); setHistory(["intro"]); setScreen("redflags"); setTempMulti([]); }
    else if (window.__hrtPendingFeedback) { window.__hrtPendingFeedback = false; setHistory((prev) => (prev.length ? prev : ["intro"])); setScreen("feedback"); }
    return () => { window.removeEventListener("hrt-start", h); window.removeEventListener("hrt-feedback", f); };
  }, []);

  const skippedFirstScroll = useRef(false);
  useEffect(() => {
    if (!skippedFirstScroll.current) { skippedFirstScroll.current = true; return; }
    const el = document.getElementById("tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 56, behavior: "smooth" });
  }, [screen]);

  const back = () => setHistory((h) => { const c = [...h]; const p = c.pop(); if (p) setScreen(p); return c; });
  const restart = () => { setScreen("intro"); setHistory([]); setA({}); setTempMulti([]); };
  const goFeedback = () => setHistory((h) => { setScreen("feedback"); return [...h, screen]; });
  const answer = (key, val) => { const na = { ...a, [key]: val }; setA(na); setHistory((h) => [...h, screen]); setScreen(nextScreen(screen, na)); setTempMulti([]); };

  const shell = (children, opts = {}) => (
    <div aria-live="polite" style={{ minHeight: 520, background: "transparent", fontFamily: sans, color: C.ink, position: "relative", overflow: "hidden" }}>
      <style>{FONTS}</style>
      <div style={{ maxWidth: "clamp(660px, 82vw, 1060px)", margin: "0 auto", padding: "clamp(20px, 4.5vw, 40px)", position: "relative" }}>
        {opts.progress && (
          <div style={{ marginBottom: 22, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: C.mossDk }}>Question {Math.min(history.length, a.mode === "adjust" ? 6 : 8)} of up to {a.mode === "adjust" ? 6 : 8}</span>
              <button onClick={restart} style={{ fontFamily: sans, fontSize: 13, color: C.ink2, background: "rgba(255,255,255,.6)", border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 13px", cursor: "pointer", fontWeight: 700 }}>Restart</button>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: "#DCE5D6", overflow: "hidden", maxWidth: 680 }}>
              <div style={{ height: "100%", borderRadius: 999, background: C.moss, width: `${Math.min(100, Math.round(Math.min(history.length, a.mode === "adjust" ? 6 : 8) / (a.mode === "adjust" ? 6 : 8) * 100))}%`, transition: "width .4s ease" }} />
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );

  if (screen === "intro") {
    return shell(
      <div style={{ paddingTop: 8, maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, justifyContent: "center", whiteSpace: "nowrap" }}>
            <span style={{ width: 28, height: 3, borderRadius: 2, background: C.clayTx, display: "inline-block" }} />
            <span style={{ fontFamily: mono, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: C.clayTx }}>Start here</span>
            <span style={{ width: 28, height: 3, borderRadius: 2, background: C.clayTx, display: "inline-block" }} />
          </div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 600, lineHeight: 1.12, margin: "14px 0 0", letterSpacing: "-0.015em", color: C.ink }}>
            Which path are you on?
          </h1>
          <p style={{ fontFamily: sans, fontSize: 16, color: C.ink2, lineHeight: 1.6, margin: "12px auto 0", maxWidth: 560 }}>
            Answer a few short questions and see the HRT options that fit your situation, ranked and explained. Choose where you're starting from.
          </p>
          <p style={{ fontFamily: sans, fontSize: 13.5, color: C.ink2, lineHeight: 1.6, margin: "8px auto 0", maxWidth: 520 }}>
            Each answer shapes which options you see. Your answers stay on this page and are never saved or sent anywhere.
          </p>
        </div>

        {/* The two paths: the page's only actions */}
        <div className="pathlist" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 14, marginTop: 26, textAlign: "left" }}>
          {[
            { m: "start", t: "I'm considering starting HRT", n: "Weigh up your options from the beginning" },
            { m: "adjust", t: "I'm already taking HRT", n: "Review or change what you're on" },
          ].map((p) => (
            <button key={p.m} className="pathcard" onClick={() => { setA({ mode: p.m }); setHistory(["intro"]); setScreen("redflags"); }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.clayTx; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(58,80,60,.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.mossLn; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(58,80,60,.05)"; }}
              style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 14, width: "100%", minHeight: 96, boxSizing: "border-box", textAlign: "left", padding: "20px 22px", borderRadius: 18, border: `1.5px solid ${C.mossLn}`, background: C.card, cursor: "pointer", boxShadow: "0 2px 10px rgba(58,80,60,.05)", transition: "all .18s ease" }}>
              <span>
                <span style={{ display: "block", fontFamily: serif, fontSize: "clamp(17px, 4.4vw, 20px)", fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>{p.t}</span>
                <span style={{ display: "block", fontFamily: sans, fontSize: 13.5, color: C.ink2, marginTop: 5 }}>{p.n}</span>
              </span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, fontFamily: sans, fontSize: 12, color: C.ink2, lineHeight: 1.6 }}>
          Follows {SRC_NG23} and {SRC_BMS}.
        </div>
      </div>,
    );
  }
  if (screen === "feedback") {
    return shell(<FeedbackScreen onBack={back} />);
  }

  if (screen === "outcome") {
    const referFlags = [...(a.redflags || []), ...(fvteStrong(a) ? ["fvteStrong"] : [])];
    const flagged = referFlags.length;
    return shell(
      <div style={{ paddingTop: 26 }}>
        {flagged ? <ReferOutcome a={a} flags={referFlags} onFeedback={goFeedback} />
          : a.mode === "adjust" ? <AdjustOutcome a={a} onFeedback={goFeedback} />
          : a.symptoms === "vaginal" ? <VaginalOutcome a={a} onFeedback={goFeedback} />
          : <SystemicOutcome a={a} onFeedback={goFeedback} />}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Btn onClick={back} small>← Back</Btn>
          <Btn primary onClick={restart} small>Start again</Btn>
        </div>
      </div>,
    );
  }

  const s = SCREENS[screen];
  if (!s) return shell(<div>…</div>);

  if (s.kind === "multi") {
    const toggle = (v) => setTempMulti((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
    return shell(
      <div>
        <h2 id="q-heading" style={{ fontFamily: serif, fontSize: "clamp(22px, 5vw, 27px)", fontWeight: 600, lineHeight: 1.22, margin: 0, color: C.ink }}>{s.q}</h2>
        <p style={{ fontFamily: sans, fontSize: 15, color: C.ink2, lineHeight: 1.6, margin: "10px 0 22px" }}>{s.sub}</p>
        <div className="optlist" role="group" aria-labelledby="q-heading" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {s.options.map((o) => <OptionRow key={o.v} opt={o} multi selected={tempMulti.includes(o.v)} onClick={() => toggle(o.v)} />)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
          <Btn onClick={() => answer(screen === "adjReasons" ? "reasons" : screen, [])}>{s.none}</Btn>
          <Btn primary disabled={tempMulti.length === 0} onClick={() => answer(screen === "adjReasons" ? "reasons" : screen, tempMulti)}>Continue with selected →</Btn>
        </div>
        <div style={{ marginTop: 14 }}><Btn onClick={back} small>← Back</Btn></div>
      </div>,
      { progress: true },
    );
  }

  const keyFor = screen === "adjRegimen" ? "regimen" : screen === "adjDuration" ? "duration" : screen;
  return shell(
    <div>
      <h2 id="q-heading" style={{ fontFamily: serif, fontSize: "clamp(22px, 5vw, 27px)", fontWeight: 600, lineHeight: 1.22, margin: 0, color: C.ink }}>{s.q}</h2>
      <p style={{ fontFamily: sans, fontSize: 15, color: C.ink2, lineHeight: 1.6, margin: "10px 0 22px" }}>{s.sub}</p>
      <div className="optlist" role="group" aria-labelledby="q-heading" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {s.options.map((o) => <OptionRow key={o.v} opt={o} selected={a[keyFor] === o.v} onClick={() => setA({ ...a, [keyFor]: o.v })} />)}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
        <Btn primary disabled={!a[keyFor]} onClick={() => answer(keyFor, a[keyFor])}>Continue →</Btn>
      </div>
      <div style={{ marginTop: 14 }}><Btn onClick={back} small>← Back</Btn></div>
    </div>,
    { progress: true },
  );
}

window.HRTOptionsFinder = HRTOptionsFinder;

// Exposes the pure decision-logic functions to the Node test runner (see
// tests/rank-logic.test.js). Inert in the browser: `module` is undefined
// there, so this whole block never runs and nothing about the shipped
// bundle changes.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { rankOptions, rankAdjust, nextScreen, needsProg, canConceive, under50 };
}
