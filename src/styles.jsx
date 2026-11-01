import { girihTile, tileBand } from "./components/ornaments";

// ---- "Samarqand tuni" palitrasi ----
// lojuvard (lapis) — asosiy to'q ko'k, firuza — koshin yashil-moviy, oltin — naqsh va urg'u.
const LAPIS = "#0E2A5C";
const LAPIS_DEEP = "#081B3D";
const FIRUZA = "#1C8B80";
const GOLD = "#C9A24A";
const GOLD_DEEP = "#A8812F";
const CREAM = "#F7F0E1";
const PAGE_TILE = girihTile();
const NIGHT_TILE = girihTile({ size: 72, stroke: "rgba(201,162,74,0.10)", accent: "rgba(201,162,74,0.22)" });
const BAND = tileBand();

export function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap');
      * { box-sizing: border-box; }
      html, body { margin: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background: ${CREAM}; }
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes hotpulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(178,64,42,0.55); background:#fff; }
        50% { box-shadow: 0 0 0 8px rgba(178,64,42,0); background:#FBEAE6; }
      }
      .pin-hot { animation: hotpulse 1.4s ease-in-out infinite; }
      @keyframes flagPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      @keyframes pinHalo { 0% { transform: scale(0.3); opacity: 0.45; } 100% { transform: scale(2.2); opacity: 0; } }
      input:focus, select:focus, textarea:focus { outline: 2px solid #1C8B80; outline-offset: 1px; }
      button:focus-visible { outline: 2px solid #1C8B80; outline-offset: 2px; }
      button, input, select, textarea, a { transition: box-shadow .15s ease, transform .12s ease, filter .15s ease, background-color .15s ease, border-color .15s ease; }
      button:not(:disabled):hover { filter: brightness(0.97); }
      button:not(:disabled):active { transform: scale(0.96); }
      button:disabled { cursor: default; }
      .oc-card { transition: box-shadow .18s ease, transform .18s ease, border-color .18s ease; }
      .oc-card:hover { box-shadow: 0 14px 30px rgba(8,27,61,0.16), 0 0 0 1px rgba(201,162,74,0.55); transform: translateY(-3px); border-color: rgba(201,162,74,0.7) !important; }
      .leaflet-container { font-family: 'Inter', sans-serif; }
      @keyframes flyerFade { 0% { opacity: 0; transform: translateY(4px); } 12%, 88% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; } }
      .oc-flyer-fade { animation: flyerFade 3.5s ease-in-out; }

      /* ---- sahifa/bosqich almashganda silliq o'tish ---- */
      @keyframes viewFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      .oc-view-fade { animation: viewFadeIn 0.35s cubic-bezier(0.22,1,0.36,1); }
      @media (prefers-reduced-motion: reduce) {
        .oc-view-fade, .oc-flyer-fade { animation: none; }
      }

      /* ---- zamonaviy "aurora" fon: sahifa ortida yumshoq, sokin harakatlanuvchi rangli dog'lar ---- */
      .oc-aurora { position: relative; isolation: isolate; }
      .oc-aurora::before, .oc-aurora::after {
        content: ""; position: fixed; z-index: 0; pointer-events: none; border-radius: 50%;
        filter: blur(70px); opacity: 0.5; animation: auroraDrift 22s ease-in-out infinite alternate;
      }
      .oc-aurora::before {
        top: -220px; left: -180px; width: 560px; height: 560px;
        background: radial-gradient(circle, rgba(23,58,102,0.32), transparent 70%);
      }
      .oc-aurora::after {
        bottom: -260px; right: -220px; width: 620px; height: 620px;
        background: radial-gradient(circle, rgba(28,139,128,0.28), transparent 70%);
        animation-delay: -11s;
      }
      @keyframes auroraDrift {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(40px, 30px) scale(1.08); }
      }
      .oc-topbar, .oc-body-content { position: relative; z-index: 1; }
      @media (prefers-reduced-motion: reduce) {
        .oc-aurora::before, .oc-aurora::after { animation: none; }
      }

      /* ---- kirish sahifasi: Samarqand tuni ---- */
      /* iOS Safari'da manzil satri balandligi o'zgarganda sakramasligi uchun dvh, qollamasa vh */
      .oc-signin-bg {
        position: relative; isolation: isolate; min-height: 100vh; min-height: 100dvh;
        background:
          radial-gradient(ellipse 70% 55% at 50% 38%, rgba(28,139,128,0.30), transparent 70%),
          radial-gradient(ellipse 90% 70% at 50% 110%, rgba(201,162,74,0.20), transparent 60%),
          linear-gradient(180deg, #061430 0%, ${LAPIS} 55%, #12366E 100%);
      }
      .oc-girih-overlay { position: absolute; inset: 0; z-index: 0; pointer-events: none;
        background-image: ${NIGHT_TILE}; background-size: 72px 72px;
        -webkit-mask-image: radial-gradient(ellipse 75% 65% at 50% 45%, black 20%, transparent 80%);
        mask-image: radial-gradient(ellipse 75% 65% at 50% 45%, black 20%, transparent 80%);
      }
      @keyframes twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.15); } }
      .oc-twinkle { animation: twinkle 3.4s ease-in-out infinite; box-shadow: 0 0 6px rgba(244,227,176,0.8); }
      @keyframes rosetteSpin { to { transform: rotate(360deg); } }
      .oc-rosette-spin { animation: rosetteSpin 160s linear infinite; }
      .oc-arch::before {
        content: ""; position: absolute; inset: 7px; border-radius: inherit; pointer-events: none;
        border: 1px solid rgba(201,162,74,0.55);
      }
      .oc-tile-icon { position: relative; }
      .oc-tile-icon::after {
        content: ""; position: absolute; inset: -3px; border-radius: 14px; pointer-events: none;
        border: 1px dashed rgba(201,162,74,0.55);
      }
      @media (prefers-reduced-motion: reduce) {
        .oc-twinkle, .oc-rosette-spin { animation: none; }
      }
      @media (max-width: 520px) {
        .oc-arch { border-radius: 150px 150px 22px 22px !important; padding: 34px 22px 30px !important; }
      }

      /* ---- topbar: lojuvard tasma + ostida koshin naqshli chiziq ---- */
      .oc-topbar::after {
        content: ""; position: absolute; left: 0; right: 0; bottom: -6px; height: 6px; pointer-events: none;
        background: ${BAND}; background-size: 12px 6px;
      }
      .oc-sidenav-item { position: relative; }
      .oc-sidenav-item:not(.oc-nav-active):hover { background: rgba(14,42,92,0.06) !important; color: ${LAPIS} !important; }
      .oc-nav-active::before {
        content: ""; position: absolute; left: -10px; top: 8px; bottom: 8px; width: 4px; border-radius: 0 4px 4px 0;
        background: linear-gradient(180deg, ${GOLD}, ${FIRUZA});
      }
      .oc-card { position: relative; }
      .oc-stat-tile::before {
        content: ""; position: absolute; left: 14px; right: 14px; top: 0; height: 3px; border-radius: 0 0 3px 3px;
        background: var(--accent, ${GOLD}); opacity: 0.85;
      }
      .oc-section-title::before {
        content: "✦"; color: ${GOLD}; font-size: 0.8em; margin-right: 8px; vertical-align: 0.08em;
      }
      .oc-map-frame { position: relative; }
      .oc-map-frame::before, .oc-map-frame::after {
        content: ""; position: absolute; width: 26px; height: 26px; pointer-events: none; z-index: 2;
        border: 2px solid ${GOLD};
      }
      .oc-map-frame::before { top: -4px; left: -4px; border-right: none; border-bottom: none; border-radius: 10px 0 0 0; }
      .oc-map-frame::after { bottom: -4px; right: -4px; border-left: none; border-top: none; border-radius: 0 0 10px 0; }
      @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
      .oc-float { animation: floatY 4.2s ease-in-out infinite; }
      @keyframes glowPulse {
        0%, 100% { box-shadow: 0 6px 18px rgba(8,27,61,0.35), 0 0 0 0 rgba(201,162,74,0.45); }
        50% { box-shadow: 0 6px 22px rgba(8,27,61,0.42), 0 0 0 9px rgba(201,162,74,0); }
      }
      .oc-glow { animation: glowPulse 2.6s ease-in-out infinite; }
      @keyframes cardIn { from { opacity: 0; transform: translateY(14px) scale(0.985); } to { opacity: 1; transform: none; } }
      .oc-signin-card-in { animation: cardIn 0.55s cubic-bezier(0.22,1,0.36,1); }
      @media (prefers-reduced-motion: reduce) {
        .oc-signin-bg::before, .oc-float, .oc-glow, .oc-signin-card-in { animation: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        .oc-map-pin *, .oc-map-pin { animation: none !important; }
      }

      /* ---- "butun shahar xaritasi" — ilovaning old eshigi: bosh sahifa xamyoni ---- */
      .oc-map-hero { position: relative; isolation: isolate; }
      .oc-map-hero::before {
        content: ""; position: absolute; inset: -20px -24px auto -24px; height: 220px; z-index: -1;
        pointer-events: none; opacity: 0.6;
        background-image: ${girihTile({ size: 56, stroke: "rgba(14,42,92,0.08)", accent: "rgba(201,162,74,0.30)" })};
        background-size: 56px 56px;
        -webkit-mask-image: linear-gradient(180deg, black, transparent);
        mask-image: linear-gradient(180deg, black, transparent);
      }
      @keyframes liveDotPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(178,64,42,0.5); }
        50% { box-shadow: 0 0 0 6px rgba(178,64,42,0); }
      }
      .oc-live-dot { animation: liveDotPulse 1.7s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .oc-map-hero::before { display: none; }
        .oc-live-dot { animation: none; }
      }

      /* ---- muvaffaqiyat lahzasi: hisobot yuborilgach / muammo hal qilingach ---- */
      @keyframes burstOut {
        0% { transform: rotate(var(--angle)) translateX(6px) scale(1); opacity: 1; }
        100% { transform: rotate(var(--angle)) translateX(130px) scale(0.35); opacity: 0; }
      }
      .oc-burst-dot {
        position: absolute; left: 0; top: 0; width: 10px; height: 10px; margin: -5px 0 0 -5px;
        border-radius: 3px; animation: burstOut 0.85s cubic-bezier(0.15,0.6,0.4,1) forwards;
      }
      @media (prefers-reduced-motion: reduce) {
        .oc-burst-dot { display: none; }
      }

      /* ---- responsive: tablet & phone ---- */
      @media (max-width: 780px) {
        .oc-shell { flex-direction: column !important; }
        .oc-sidenav {
          position: static !important; top: auto !important; width: 100% !important;
          flex-direction: row !important; overflow-x: auto; -webkit-overflow-scrolling: touch;
          padding: 8px 10px !important; gap: 4px !important;
          border-bottom: 1px solid rgba(201,162,74,0.35); background: rgba(247,240,225,0.85); margin-top: 6px;
        }
        .oc-sidenav-item { flex: 0 0 auto !important; white-space: nowrap; padding: 8px 12px !important; }
        .oc-sidenav-label { display: inline; }
        .oc-nav-active::before { left: 10px; right: 10px; top: auto; bottom: 0; width: auto; height: 3px; border-radius: 3px 3px 0 0; }
        .oc-map-hero-rosette { display: none; }
        .oc-row2 { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 780px) {
        .oc-toast { bottom: 92px !important; }
      }
      @media (max-width: 480px) {
        .oc-top-lang { display: none; }
        .oc-portal-tab:not(.is-active) .oc-tab-label { display: none; }
        .oc-topbar-brand { display: none; }
        .oc-sidenav-label { font-size: 12.5px; }
        .oc-avatar-name { display: none; }
        .oc-topbar { gap: 8px !important; padding: 8px 12px !important; }
      }
    `}</style>
  );
}

// Shisha (glassmorphism) effekti — orqadagi "aurora" fon xira ko'rinib tursin deb,
// asosiy kartalar endi to'liq oq emas, yarim shaffof + xiralashtirilgan fonga ega.
const GLASS = {
  background: "rgba(255,253,247,0.78)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};
const GLASS_SOFT = {
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const HERITAGE = "'Fraunces', 'Georgia', serif";

export const S = {
  page: {
    minHeight: "100vh",
    background:
      `radial-gradient(ellipse 80% 40% at 100% 0%, rgba(28,139,128,0.10), transparent 60%), ` +
      `radial-gradient(ellipse 60% 40% at 0% 100%, rgba(201,162,74,0.12), transparent 60%), ` +
      `${PAGE_TILE}, ${CREAM}`,
    backgroundSize: "auto, auto, 64px 64px, auto",
    fontFamily: "'Inter', sans-serif", color: "#16202B",
  },
  bootWrap: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 },
  body: { minHeight: "100%" },

  signinWrap: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 16px 170px", overflow: "hidden" },
  signinCard: {
    position: "relative", zIndex: 2, maxWidth: 440, width: "100%", marginTop: 40,
    background: "linear-gradient(180deg, #FFFBF2 0%, #F7F0E1 100%)",
    borderRadius: "220px 220px 26px 26px", padding: "46px 36px 36px",
    boxShadow: "0 30px 80px rgba(2,10,30,0.55), 0 0 0 1px rgba(201,162,74,0.5), 0 0 60px rgba(28,139,128,0.25)",
  },  signinArchCrown: {
    position: "absolute", left: "50%", top: -40, transform: "translateX(-50%)",
    width: 84, height: 84, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
    background: `radial-gradient(circle, ${LAPIS} 0%, ${LAPIS_DEEP} 100%)`,
    boxShadow: `0 0 0 3px ${GOLD}, 0 0 0 7px rgba(255,251,242,0.95), 0 10px 30px rgba(2,10,30,0.45)`,
  },
  signinLogo: { width: 60, height: 60, borderRadius: 16, objectFit: "cover" },
  brandNameCenter: { fontFamily: HERITAGE, fontWeight: 700, fontSize: 24, color: LAPIS, textAlign: "center", marginTop: 28, letterSpacing: 0.3 },
  signinDivider: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "10px auto 18px", maxWidth: 220 },
  signinDividerLine: { flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` },
  signinDividerStar: { color: GOLD, fontSize: 14, lineHeight: 1 },
  signinRosetteWrap: { position: "absolute", left: "50%", top: "46%", width: "min(900px, 150vw)", aspectRatio: "1", transform: "translate(-50%,-50%)", zIndex: 0, pointerEvents: "none" },
  signinLang: { position: "absolute", top: 16, right: 16, zIndex: 3 },
  signinSkyline: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: "none", filter: "drop-shadow(0 -6px 24px rgba(28,139,128,0.25))" },

  signinFeatureRow: { display: "flex", justifyContent: "center", gap: 18, marginTop: 24, paddingTop: 20, borderTop: "1px dashed rgba(201,162,74,0.5)" },
  signinFeature: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 11, color: "#5B6772", fontWeight: 600, maxWidth: 90, textAlign: "center" },
  signinFeatureIcon: { width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", boxShadow: "0 4px 12px rgba(14,42,92,0.10)" },
  brandRow: { display: "flex", alignItems: "center", gap: 11, marginBottom: 26 },
  brandMark: { width: 44, height: 44, borderRadius: 12, objectFit: "cover", boxShadow: "0 6px 18px rgba(23,58,102,0.35)", flexShrink: 0 },
  brandMarkSm: { width: 28, height: 28, borderRadius: 8, objectFit: "cover", flexShrink: 0 },
  brandName: { fontFamily: HERITAGE, fontWeight: 600, fontSize: 21, color: "#14213A", letterSpacing: -0.2 },
  h1: { fontFamily: HERITAGE, fontSize: 31, fontWeight: 600, lineHeight: 1.18, margin: "0 0 10px", background: `linear-gradient(120deg, ${LAPIS_DEEP} 0%, ${LAPIS} 50%, ${FIRUZA} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" },
  lead: { fontSize: 14.5, color: "#4B5B68", lineHeight: 1.55, margin: "0 0 24px" },
  fine: { fontSize: 12, color: "#7A8A99", lineHeight: 1.5, margin: "10px 0 0" },

  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3D4C57", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #D9CFB8", fontSize: 14, fontFamily: "inherit", background: "#FFFDF7", color: "#16202B" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },

  googleBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 16px", borderRadius: 14, border: `1px solid ${GOLD}`, background: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer", color: LAPIS },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${LAPIS} 0%, #154A8A 50%, ${FIRUZA} 100%)`, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 14px rgba(14,42,92,0.32), inset 0 0 0 1px rgba(201,162,74,0.45)` },
  secondaryBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 12, border: "1px solid rgba(201,162,74,0.55)", background: "#FFFDF7", color: LAPIS, fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  dangerBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid #E3B3AC", background: "#FBEEEC", color: "#A33A3A", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  linkBtn: { display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#5B6772", fontSize: 13, cursor: "pointer", padding: "4px 0", marginBottom: 10 },
  iconBtn: { position: "relative", width: 32, height: 32, borderRadius: 9, border: "1px solid #E4EAEE", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#3D4C57" },

  topbar: {
    display: "flex", alignItems: "center", gap: 16, padding: "10px 20px",
    background: `linear-gradient(90deg, ${LAPIS_DEEP} 0%, ${LAPIS} 55%, #133F7A 100%)`,
    boxShadow: "0 6px 20px rgba(8,27,61,0.25)", position: "sticky", top: 0, zIndex: 5, flexWrap: "wrap", color: CREAM,
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  topbarBrand: { fontFamily: HERITAGE, fontWeight: 700, fontSize: 17, color: CREAM, letterSpacing: 0.3 },
  portalSwitch: { display: "flex", gap: 4, background: "#F0F4F6", padding: 4, borderRadius: 10, flexWrap: "wrap" },
  portalTab: { display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 7, border: "none", background: "transparent", fontSize: 12.5, fontWeight: 600, color: "#5B6772", cursor: "pointer" },
  portalTabActive: { background: `linear-gradient(135deg, ${LAPIS_DEEP} 0%, ${LAPIS} 100%)`, color: "#fff" },  portalSwitchDark: { display: "flex", gap: 4, background: "rgba(255,255,255,0.08)", padding: 4, borderRadius: 12, flexWrap: "wrap", border: "1px solid rgba(201,162,74,0.25)" },
  portalTabDark: { color: "rgba(247,240,225,0.75)" },
  portalTabActiveDark: { background: `linear-gradient(135deg, #E2C276 0%, ${GOLD} 60%, ${GOLD_DEEP} 100%)`, color: LAPIS_DEEP, boxShadow: "0 2px 8px rgba(201,162,74,0.35)" },
  topIconBtn: { position: "relative", width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(201,162,74,0.3)", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: CREAM },

  topbarRight: { display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" },
  badge: { position: "absolute", top: -4, right: -4, background: "#B2402A", color: "#fff", fontFamily: MONO, fontSize: 9.5, fontWeight: 700, borderRadius: 8, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" },
  avatarChip: { display: "flex", alignItems: "center", gap: 7, cursor: "pointer", padding: "3px 10px 3px 3px", borderRadius: 20, border: "1px solid rgba(201,162,74,0.35)", background: "rgba(255,255,255,0.06)" },
  avatar: { width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, #E2C276 0%, ${GOLD_DEEP} 100%)`, color: LAPIS_DEEP, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  avatarLg: { width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${LAPIS} 0%, ${FIRUZA} 100%)`, color: "#fff", fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 3px #FFFBF2, 0 0 0 4px ${GOLD}` },
  avatarName: { fontSize: 12.5, fontWeight: 600, color: CREAM },

  withSidebar: { display: "flex", alignItems: "flex-start", gap: 0 },
  sidenav: { width: 220, flexShrink: 0, padding: "24px 10px", position: "sticky", top: 60, display: "flex", flexDirection: "column", gap: 3 },
  sidenavItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#4B5B68", fontSize: 13.5, fontWeight: 500, cursor: "pointer", textAlign: "left" },
  sidenavItemActive: { background: "linear-gradient(135deg, rgba(14,42,92,0.95), rgba(21,74,138,0.95))", color: CREAM, fontWeight: 700, boxShadow: "0 6px 16px rgba(14,42,92,0.25), inset 0 0 0 1px rgba(201,162,74,0.4)" },
  content: { flex: 1, padding: "26px 24px 90px", minWidth: 0, maxWidth: 1100, margin: "0 auto", width: "100%" },
  demoNote: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#7A8A99", background: "#EDF2F4", padding: "7px 12px", borderRadius: 8, marginBottom: 16 },

  heroEyebrowDark: { fontSize: 12, color: GOLD_DEEP, fontWeight: 800, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.2 },
  pageTitleLg: { fontFamily: HERITAGE, fontSize: 28, fontWeight: 600, color: LAPIS_DEEP, margin: "0 0 6px", maxWidth: 460 },

  statsRow: { display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" },
  statCard: { ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 4px 14px rgba(14,42,92,0.07)", borderRadius: 16, padding: "16px 20px 14px", minWidth: 140, overflow: "hidden" },
  statValue: { fontFamily: HERITAGE, fontSize: 30, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: "lining-nums tabular-nums" },
  statLabel: { fontSize: 12, color: "#6B7A88", marginTop: 4, fontWeight: 600 },

  orgPromo: { display: "flex", alignItems: "center", gap: 14, ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: "14px 18px", marginBottom: 22, cursor: "pointer" },

  flyer: { display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(120deg, rgba(246,238,218,0.88) 0%, rgba(234,242,240,0.85) 60%, rgba(246,238,218,0.88) 100%)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid #E4D3A0", boxShadow: "0 4px 16px rgba(182,144,63,0.14)", borderRadius: 18, padding: "16px 22px", marginBottom: 22, overflow: "hidden" },
  flyerLabel: { fontSize: 11, fontWeight: 700, color: "#8A6A22", textTransform: "uppercase", letterSpacing: 1, flexShrink: 0, writingMode: "horizontal-tb" },
  flyerContent: { display: "flex", alignItems: "center", gap: 12, flex: 1, color: "#4A3B1C", minWidth: 0 },
  flyerLogo: { width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0, boxShadow: "0 2px 8px rgba(182,144,63,0.3)" },
  flyerLogoPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" },
  flyerTextCol: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  flyerName: { fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  flyerType: { fontSize: 11.5, fontWeight: 600, color: "#8A6A22", background: "rgba(182,144,63,0.16)", padding: "2px 9px", borderRadius: 20, alignSelf: "flex-start" },
  flyerDots: { display: "flex", gap: 5, flexShrink: 0 },
  flyerDot: { width: 6, height: 6, borderRadius: "50%", background: "rgba(182,144,63,0.35)" },
  flyerDotActive: { background: "#B6903F" },
  orgPromoTitle: { fontSize: 14, fontWeight: 700, color: "#16202B" },
  orgPromoSub: { fontSize: 12.5, color: "#7A8A99", marginTop: 2 },

  sectionTitle: { fontFamily: HERITAGE, fontSize: 18, fontWeight: 600, color: LAPIS_DEEP, margin: "24px 0 12px" },
  pageTitle: { fontFamily: HERITAGE, fontSize: 24, fontWeight: 600, color: LAPIS_DEEP, margin: "0 0 4px" },
  rowHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 14, flexWrap: "wrap" },

  reportGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 },
  reportCard: { ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 18, overflow: "hidden", cursor: "pointer" },
  reportImg: { width: "100%", height: 120, objectFit: "cover", display: "block" },
  reportImgPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#EFE6D2", backgroundImage: PAGE_TILE, backgroundSize: "40px 40px" },
  hotBadge: { position: "absolute", top: 6, left: 6, display: "flex", alignItems: "center", gap: 3, background: "#B2402A", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20 },
  reportCardBody: { padding: "10px 12px 12px" },
  reportCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 4 },
  catChip: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5B6772", background: "#F0F4F6", padding: "3px 8px", borderRadius: 20, fontWeight: 600 },
  statusPill: { fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20 },
  reportCardTitle: { fontSize: 14.5, fontWeight: 700, color: LAPIS_DEEP, marginBottom: 3, lineHeight: 1.3 },
  reportCardMeta: { fontSize: 11.5, color: "#8A97A2" },
  reportCardVotes: { display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#7A8A99", marginTop: 6, fontFamily: MONO },
  reportCardVoteBtn: { marginTop: 6, padding: "4px 10px", fontSize: 11.5 },
  sponsorBadge: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, color: "#8A6A22", background: "#F6EEDA", padding: "3px 8px", borderRadius: 20, marginTop: 2 },
  sponsorBanner: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B5220", background: "#F6EEDA", border: "1px solid #E4D3A0", borderRadius: 10, padding: "9px 12px", marginTop: 6 },
  claimBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "none", background: "#2E9A5C", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(46,154,92,0.35)", marginTop: 14, marginBottom: 6 },

  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 20px", ...GLASS_SOFT, border: "1px dashed #D8E1E6", borderRadius: 14, textAlign: "center" },
  emptyText: { fontSize: 13.5, color: "#7A8A99", margin: 0, maxWidth: 280 },

  wizardWrap: { maxWidth: 640 },
  wizardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  stepIndicator: { display: "flex", gap: 6 },
  stepDot: { width: 22, height: 22, borderRadius: "50%", background: "#EEF3F5", color: "#8A97A2", fontFamily: MONO, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  stepDotActive: { background: `linear-gradient(135deg, ${LAPIS} 0%, ${FIRUZA} 100%)`, color: "#fff", boxShadow: `0 0 0 2px #FFFBF2, 0 0 0 3px ${GOLD}` },
  wizardTitle: { fontFamily: HERITAGE, fontSize: 21, fontWeight: 600, color: "#14213A", margin: "4px 0 18px" },
  wizardFooter: { display: "flex", alignItems: "center", gap: 10, marginTop: 20 },

  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 },
  catBtn: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "14px 12px", borderRadius: 14, border: "1px solid rgba(201,162,74,0.35)", background: "#FFFDF7", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#3D4C57", textAlign: "left" },
  catBtnActive: { background: `linear-gradient(135deg, ${LAPIS} 0%, ${FIRUZA} 100%)`, borderColor: GOLD, color: "#fff", boxShadow: "0 6px 16px rgba(14,42,92,0.3)" },

  uploadZone: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  uploadBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 50px", borderRadius: 12, border: "1.5px dashed #B7CBD3", background: "#F5F9FA", cursor: "pointer", color: "#1C8B80", fontSize: 13, fontWeight: 600 },
  photoPreviewWrap: { position: "relative" },
  photoPreview: { maxWidth: 320, maxHeight: 220, borderRadius: 10, display: "block" },
  removePhotoBtn: { position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(15,42,67,0.75)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },

  pickGrid: { position: "relative", width: "100%", maxWidth: 480, height: 220, borderRadius: 12, overflow: "hidden", border: "1px solid #D8E1E6" },
  pickPin: { position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "#B2402A", border: "3px solid #fff", transform: "translate(-50%,-50%)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" },
  coordConfirm: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#2E9A5C", marginTop: 8, fontWeight: 600 },

  similarCard: { display: "flex", flexDirection: "column", gap: 8 },

  reviewCard: { ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: 18 },
  reviewImg: { width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8, marginBottom: 12 },
  reviewRow: { fontSize: 13.5, color: "#3D4C57", marginBottom: 8, lineHeight: 1.5 },

  detailWrap: { maxWidth: 640 },
  detailHeader: { display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" },
  detailImg: { width: 160, height: 120, objectFit: "cover", borderRadius: 10, flexShrink: 0, cursor: "zoom-in" },
  detailTitle: { fontFamily: HERITAGE, fontWeight: 600, fontSize: 21, margin: "6px 0", color: "#14213A" },
  detailDesc: { fontSize: 13.5, color: "#4B5B68", marginTop: 8, lineHeight: 1.55 },
  detailCard: { ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: 20, maxWidth: 560 },

  proofRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  proofImg: { width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #E4EAEE", cursor: "zoom-in" },
  uploadMini: { width: 72, height: 72, borderRadius: 8, border: "1.5px dashed #B7CBD3", background: "#F5F9FA", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#1C8B80" },

  lightboxBackdrop: { position: "fixed", inset: 0, background: "rgba(10,15,25,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 3000 },
  lightboxImg: { maxWidth: "92vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },

  timeline: { marginTop: 6 },
  timelineRow: { display: "flex", gap: 12 },
  timelineDotWrap: { display: "flex", flexDirection: "column", alignItems: "center" },
  timelineDot: { width: 12, height: 12, borderRadius: "50%", marginTop: 3 },
  timelineLine: { width: 2, flex: 1, background: "#E4EAEE", minHeight: 24 },
  timelineBody: { paddingBottom: 18 },
  timelineStatus: { fontSize: 13.5, fontWeight: 700, color: "#16202B" },
  timelineMeta: { fontSize: 11.5, color: "#8A97A2", margin: "2px 0 4px", fontFamily: MONO },
  timelineNote: { fontSize: 12.5, color: "#4B5B68" },

  filterRow: { display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#4B5B68" },
  selectSm: { padding: "7px 10px", borderRadius: 10, border: "1px solid #D9CFB8", fontSize: 12.5, background: "#FFFDF7", color: "#3D4C57" },
  bigMap: { position: "relative", width: "100%", height: 480, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(201,162,74,0.4)" },
  compactMap: { position: "relative", width: "100%", height: 260, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", marginBottom: 20 },
  mapPin: { position: "absolute", width: 24, height: 24, borderRadius: "50%", background: "#fff", border: "2px solid", transform: "translate(-50%,-50%)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" },
  mapPreviewCard: { position: "relative", maxWidth: 260, marginTop: 14 },
  locateBtn: { position: "absolute", bottom: 14, right: 14, zIndex: 1000, width: 38, height: 38, borderRadius: "50%", border: "none", background: "#fff", color: "#1C8B80", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(15,42,67,0.3)" },
  locateError: { position: "absolute", bottom: 60, right: 14, left: 14, zIndex: 1000, background: "#0F2A43", color: "#fff", fontSize: 12, lineHeight: 1.4, padding: "10px 30px 10px 12px", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.25)" },
  locateErrorClose: { position: "absolute", top: 6, right: 6, background: "none", border: "none", color: "#fff", opacity: 0.7, cursor: "pointer", padding: 4 },

  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(8,27,61,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 2000 },
  modalCard: { position: "relative", ...GLASS_SOFT, background: "rgba(255,251,242,0.96)", borderRadius: 20, padding: 24, maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 70px rgba(2,10,30,0.45), inset 0 0 0 1px rgba(201,162,74,0.4)" },
  modalClose: { position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%", border: "none", background: "#F0F4F6", color: "#3D4C57", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1 },

  votingList: { display: "flex", flexDirection: "column", gap: 8 },
  votingRow: { display: "flex", alignItems: "center", gap: 12, ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 12, padding: "10px 14px" },
  voteBtn: { display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20, border: "1px solid #D8E1E6", background: "#fff", color: "#3D4C57", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: MONO },
  voteBtnActive: { background: "#E3F1EE", borderColor: "#1C8B80", color: "#1C8B80" },

  reopenBox: { ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: 16, marginTop: 16, display: "flex", flexDirection: "column", gap: 10, maxWidth: 480 },
  reopenText: { fontSize: 13, color: "#4B5B68", lineHeight: 1.5 },

  notifList: { display: "flex", flexDirection: "column", gap: 8 },
  notifRow: { display: "flex", alignItems: "flex-start", gap: 10, ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 12, padding: "12px 14px" },
  notifRowUnread: { background: "linear-gradient(90deg, rgba(23,58,102,0.10), rgba(28,139,128,0.07))", borderColor: "#BFDEDA" },
  notifUnreadBadge: { width: 8, height: 8, borderRadius: "50%", background: "#1C8B80", flexShrink: 0, marginTop: 4 },
  notifDot: { width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0 },
  notifTitle: { fontSize: 13.5, fontWeight: 700, color: "#16202B" },
  notifMsg: { fontSize: 12.5, color: "#4B5B68", margin: "2px 0" },
  notifTime: { fontSize: 11, color: "#9AA7B2", fontFamily: MONO },

  profileCard: { display: "flex", alignItems: "center", gap: 14, ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: 18, marginBottom: 10 },
  profileName: { fontSize: 16, fontWeight: 700, color: "#16202B" },
  profileRole: { fontSize: 12.5, color: "#7A8A99", marginTop: 2 },
  infoBanner: { display: "flex", alignItems: "flex-start", gap: 10, ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 12, padding: "12px 14px", fontSize: 13 },

  orgActionBox: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "flex-start" },
  adminActionBox: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: 16, marginTop: 16, maxWidth: 460 },
  chartBox: { ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: "14px 10px 4px", marginBottom: 8 },
  appList: { display: "flex", flexDirection: "column", gap: 8 },
  appRow: { display: "flex", alignItems: "center", gap: 12, ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 12, padding: "10px 14px", cursor: "pointer" },
  orgCard: { ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 4 },
  orgLogo: { width: 48, height: 48, borderRadius: 10, objectFit: "cover", marginBottom: 4 },
  orgLogoPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4F6" },

  staffForm: { display: "flex", flexDirection: "column", gap: 10, ...GLASS, border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: 16, marginBottom: 22, maxWidth: 520 },

  bulkBar: { display: "flex", alignItems: "center", gap: 10, background: "#0F2A43", color: "#fff", padding: "10px 14px", borderRadius: 12, marginBottom: 14, flexWrap: "wrap" },
  bulkCheckbox: { position: "absolute", top: 8, right: 8, zIndex: 2, width: 18, height: 18, cursor: "pointer" },

  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: LAPIS_DEEP, color: CREAM, padding: "11px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(201,162,74,0.5)", zIndex: 50, maxWidth: "calc(100vw - 32px)" },

  reportFab: {
    position: "fixed", bottom: 20, left: 20, zIndex: 60, display: "flex", alignItems: "center", gap: 9,
    border: "none", borderRadius: 30, padding: "6px 20px 6px 6px",
    background: `linear-gradient(135deg, ${LAPIS_DEEP} 0%, ${LAPIS} 50%, ${FIRUZA} 100%)`, color: CREAM,
    cursor: "pointer", boxShadow: `0 8px 24px rgba(8,27,61,0.45), inset 0 0 0 1px rgba(201,162,74,0.6)`, fontSize: 13.5, fontWeight: 700,
  },
  reportFabIcon: {
    width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, #F1D98F, ${GOLD})`,
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  mapHero: { position: "relative", padding: "8px 0 26px", marginBottom: 4 },
  mapHeroEyebrow: {
    display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700,
    color: "#B2402A", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8,
  },
  livePulseDot: { width: 8, height: 8, borderRadius: "50%", background: "#B2402A", flexShrink: 0 },
  mapHeroTitle: {
    fontFamily: HERITAGE, fontWeight: 700, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.05, margin: "0 0 12px", maxWidth: 560,
    background: `linear-gradient(120deg, ${LAPIS_DEEP} 0%, ${LAPIS} 40%, ${FIRUZA} 80%, ${GOLD_DEEP} 100%)`,
    WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
  },
  mapHeroSub: { fontSize: 14.5, color: "#4B5B68", lineHeight: 1.55, margin: "0 0 22px", maxWidth: 520 },
  mapHeroStats: { display: "flex", gap: 12, flexWrap: "wrap" },  mapHeroRosette: { position: "absolute", right: -30, top: -40, width: 280, height: 280, zIndex: -1, pointerEvents: "none" },


  mapFrame: {
    padding: 12, borderRadius: 26, marginTop: 18,
    background: `linear-gradient(135deg, rgba(14,42,92,0.06), rgba(201,162,74,0.16)), #FFFBF2`,
    border: "1px solid rgba(201,162,74,0.45)", boxShadow: "0 20px 50px rgba(8,27,61,0.14)",
  },

  leaderboardList: { display: "flex", flexDirection: "column", gap: 10, marginTop: 8 },
  leaderboardRow: {
    display: "flex", alignItems: "center", gap: 14, ...GLASS,
    border: "1px solid rgba(201,162,74,0.28)", boxShadow: "0 2px 10px rgba(14,42,92,0.06)", borderRadius: 14, padding: "12px 16px",
  },
  leaderboardRank: {
    width: 36, height: 36, borderRadius: "50%", flexShrink: 0, fontFamily: MONO, fontWeight: 700, fontSize: 15,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  leaderboardBarTrack: { height: 6, borderRadius: 4, background: "#EEF3F5", marginTop: 8, overflow: "hidden" },
  leaderboardBarFill: { height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${GOLD}, ${FIRUZA}, ${LAPIS})`, transition: "width .5s ease" },
  leaderboardCount: { fontFamily: MONO, fontWeight: 700, fontSize: 22, color: "#14213A", flexShrink: 0, fontVariantNumeric: "tabular-nums" },
};
