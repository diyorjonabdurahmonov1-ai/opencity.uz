export function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap');
      * { box-sizing: border-box; }
      html, body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
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
      .oc-card:hover { box-shadow: 0 10px 26px rgba(15,42,67,0.14); transform: translateY(-2px); border-color: rgba(23,58,102,0.35); }
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

      /* ---- kirish sahifasi: qo'shimcha uchinchi rangli dog' + texnologik nuqtali panjara ---- */
      /* iOS Safari'da manzil satri balandligi o'zgarganda sakramasligi uchun dvh, qollamasa vh */
      .oc-signin-bg { position: relative; isolation: isolate; min-height: 100vh; min-height: 100dvh; }
      .oc-signin-bg::before {
        content: ""; position: fixed; z-index: 0; pointer-events: none; border-radius: 50%;
        top: 50%; left: 50%; width: 720px; height: 720px; transform: translate(-50%,-58%);
        background: radial-gradient(circle, rgba(182,144,63,0.18), transparent 68%);
        animation: auroraDrift 26s ease-in-out infinite alternate;
      }
      .oc-dotgrid { position: absolute; inset: 0; z-index: 0; pointer-events: none;
        background-image:
          linear-gradient(45deg, rgba(23,58,102,0.09) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(23,58,102,0.09) 1px, transparent 1px),
          linear-gradient(45deg, transparent 74%, rgba(182,144,63,0.16) 74.5%, rgba(182,144,63,0.16) 75.5%, transparent 76%),
          linear-gradient(-45deg, transparent 74%, rgba(182,144,63,0.16) 74.5%, rgba(182,144,63,0.16) 75.5%, transparent 76%);
        background-size: 46px 46px;
        -webkit-mask-image: radial-gradient(ellipse 60% 55% at 50% 42%, black 35%, transparent 75%);
        mask-image: radial-gradient(ellipse 60% 55% at 50% 42%, black 35%, transparent 75%);
      }
      @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
      .oc-float { animation: floatY 4.2s ease-in-out infinite; }
      @keyframes glowPulse {
        0%, 100% { box-shadow: 0 4px 14px rgba(23,58,102,0.30), 0 0 0 0 rgba(182,144,63,0.35); }
        50% { box-shadow: 0 4px 18px rgba(23,58,102,0.38), 0 0 0 8px rgba(182,144,63,0); }
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
        background-image:
          linear-gradient(45deg, rgba(182,144,63,0.14) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(182,144,63,0.14) 1px, transparent 1px);
        background-size: 34px 34px;
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
          border-bottom: 1px solid #E4EAEE; background: rgba(255,255,255,0.75);
        }
        .oc-sidenav-item { flex: 0 0 auto !important; white-space: nowrap; padding: 8px 12px !important; }
        .oc-sidenav-label { display: inline; }
        .oc-row2 { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 480px) {
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
  background: "rgba(255,255,255,0.66)",
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
    minHeight: "100%",
    background:
      "linear-gradient(180deg, rgba(246,241,228,0) 0%, rgba(246,241,228,0.7) 320px), " +
      "repeating-linear-gradient(45deg, rgba(23,58,102,0.028) 0, rgba(23,58,102,0.028) 1px, transparent 1px, transparent 27px), " +
      "repeating-linear-gradient(-45deg, rgba(23,58,102,0.028) 0, rgba(23,58,102,0.028) 1px, transparent 1px, transparent 27px), " +
      "#F6F1E4",
    fontFamily: "'Inter', sans-serif", color: "#16202B",
  },
  bootWrap: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 },
  body: { minHeight: "100%" },

  signinWrap: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, overflow: "hidden" },
  signinCard: { position: "relative", zIndex: 1, maxWidth: 440, width: "100%", ...GLASS_SOFT, borderRadius: "64px 64px 24px 24px", padding: "44px 36px 40px", boxShadow: "0 24px 60px rgba(15,42,67,0.16)", border: "1px solid rgba(255,255,255,0.6)" },
  signinFeatureRow: { display: "flex", justifyContent: "center", gap: 22, marginTop: 28 },
  signinFeature: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 11, color: "#5B6772", fontWeight: 600, maxWidth: 90, textAlign: "center" },
  signinFeatureIcon: { width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(23,58,102,0.14), rgba(28,139,128,0.14))" },
  brandRow: { display: "flex", alignItems: "center", gap: 11, marginBottom: 26 },
  brandMark: { width: 44, height: 44, borderRadius: 12, objectFit: "cover", boxShadow: "0 6px 18px rgba(23,58,102,0.35)", flexShrink: 0 },
  brandMarkSm: { width: 28, height: 28, borderRadius: 8, objectFit: "cover", flexShrink: 0 },
  brandName: { fontFamily: HERITAGE, fontWeight: 600, fontSize: 21, color: "#14213A", letterSpacing: -0.2 },
  h1: { fontFamily: HERITAGE, fontSize: 31, fontWeight: 600, lineHeight: 1.22, margin: "0 0 10px", background: "linear-gradient(120deg, #14213A 0%, #173A66 55%, #1C8B80 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" },
  lead: { fontSize: 14.5, color: "#4B5B68", lineHeight: 1.55, margin: "0 0 24px" },
  fine: { fontSize: 12, color: "#7A8A99", lineHeight: 1.5, margin: "10px 0 0" },

  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3D4C57", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #D8E1E6", fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#16202B" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },

  googleBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 16px", borderRadius: 10, border: "1px solid #D8E1E6", background: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#16202B" },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #173A66 0%, #1C8B80 100%)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(23,58,102,0.32)" },
  secondaryBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid #D8E1E6", background: "#fff", color: "#16202B", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  dangerBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid #E3B3AC", background: "#FBEEEC", color: "#A33A3A", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  linkBtn: { display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#5B6772", fontSize: 13, cursor: "pointer", padding: "4px 0", marginBottom: 10 },
  iconBtn: { position: "relative", width: 32, height: 32, borderRadius: 9, border: "1px solid #E4EAEE", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#3D4C57" },

  topbar: { display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 1px 3px rgba(15,42,67,0.06)", position: "sticky", top: 0, zIndex: 5, flexWrap: "wrap" },
  topbarLeft: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  topbarBrand: { fontFamily: HERITAGE, fontWeight: 600, fontSize: 16, color: "#14213A" },
  portalSwitch: { display: "flex", gap: 4, background: "#F0F4F6", padding: 4, borderRadius: 10, flexWrap: "wrap" },
  portalTab: { display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 7, border: "none", background: "transparent", fontSize: 12.5, fontWeight: 600, color: "#5B6772", cursor: "pointer" },
  portalTabActive: { background: "linear-gradient(135deg, #14213A 0%, #173A66 100%)", color: "#fff" },
  topbarRight: { display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" },
  badge: { position: "absolute", top: -4, right: -4, background: "#B2402A", color: "#fff", fontFamily: MONO, fontSize: 9.5, fontWeight: 700, borderRadius: 8, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" },
  avatarChip: { display: "flex", alignItems: "center", gap: 7, cursor: "pointer", padding: "3px 8px 3px 3px", borderRadius: 20, border: "1px solid #E4EAEE" },
  avatar: { width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #173A66 0%, #1C8B80 100%)", color: "#fff", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  avatarLg: { width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #173A66 0%, #1C8B80 100%)", color: "#fff", fontSize: 19, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  avatarName: { fontSize: 12.5, fontWeight: 600, color: "#3D4C57" },

  withSidebar: { display: "flex", alignItems: "flex-start", gap: 0 },
  sidenav: { width: 210, flexShrink: 0, padding: "18px 10px", position: "sticky", top: 53, display: "flex", flexDirection: "column", gap: 3 },
  sidenavItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#4B5B68", fontSize: 13.5, fontWeight: 500, cursor: "pointer", textAlign: "left" },
  sidenavItemActive: { background: "linear-gradient(135deg, rgba(23,58,102,0.12), rgba(28,139,128,0.12))", color: "#173A66", fontWeight: 700, boxShadow: "inset 0 0 0 1px rgba(23,58,102,0.18)" },
  content: { flex: 1, padding: "20px 24px 60px", minWidth: 0, maxWidth: 1100, margin: "0 auto", width: "100%" },
  demoNote: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#7A8A99", background: "#EDF2F4", padding: "7px 12px", borderRadius: 8, marginBottom: 16 },

  heroEyebrowDark: { fontSize: 12.5, color: "#1C8B80", fontWeight: 700, marginBottom: 4 },
  pageTitleLg: { fontFamily: HERITAGE, fontSize: 24, fontWeight: 600, color: "#14213A", margin: "0 0 6px", maxWidth: 420 },

  statsRow: { display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" },
  statCard: { ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: "14px 18px", minWidth: 130 },
  statValue: { fontFamily: MONO, fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  statLabel: { fontSize: 12, color: "#7A8A99", marginTop: 2 },

  orgPromo: { display: "flex", alignItems: "center", gap: 14, ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: "14px 18px", marginBottom: 22, cursor: "pointer" },

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

  sectionTitle: { fontFamily: HERITAGE, fontSize: 17, fontWeight: 600, color: "#14213A", margin: "22px 0 12px" },
  pageTitle: { fontFamily: HERITAGE, fontSize: 22, fontWeight: 600, color: "#14213A", margin: "0 0 4px" },
  rowHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 14, flexWrap: "wrap" },

  reportGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 },
  reportCard: { ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, overflow: "hidden", cursor: "pointer" },
  reportImg: { width: "100%", height: 110, objectFit: "cover", display: "block" },
  reportImgPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", background: "#EEF3F5" },
  hotBadge: { position: "absolute", top: 6, left: 6, display: "flex", alignItems: "center", gap: 3, background: "#B2402A", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20 },
  reportCardBody: { padding: "10px 12px 12px" },
  reportCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 4 },
  catChip: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5B6772", background: "#F0F4F6", padding: "3px 8px", borderRadius: 20, fontWeight: 600 },
  statusPill: { fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20 },
  reportCardTitle: { fontSize: 14, fontWeight: 700, color: "#16202B", marginBottom: 3, lineHeight: 1.3 },
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
  stepDotActive: { background: "linear-gradient(135deg, #173A66 0%, #1C8B80 100%)", color: "#fff" },
  wizardTitle: { fontFamily: HERITAGE, fontSize: 21, fontWeight: 600, color: "#14213A", margin: "4px 0 18px" },
  wizardFooter: { display: "flex", alignItems: "center", gap: 10, marginTop: 20 },

  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 },
  catBtn: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "14px 12px", borderRadius: 12, border: "1px solid #D8E1E6", background: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#3D4C57", textAlign: "left" },
  catBtnActive: { background: "linear-gradient(135deg, #173A66 0%, #1C8B80 100%)", borderColor: "transparent", color: "#fff", boxShadow: "0 4px 14px rgba(23,58,102,0.3)" },

  uploadZone: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  uploadBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 50px", borderRadius: 12, border: "1.5px dashed #B7CBD3", background: "#F5F9FA", cursor: "pointer", color: "#1C8B80", fontSize: 13, fontWeight: 600 },
  photoPreviewWrap: { position: "relative" },
  photoPreview: { maxWidth: 320, maxHeight: 220, borderRadius: 10, display: "block" },
  removePhotoBtn: { position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(15,42,67,0.75)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },

  pickGrid: { position: "relative", width: "100%", maxWidth: 480, height: 220, borderRadius: 12, overflow: "hidden", border: "1px solid #D8E1E6" },
  pickPin: { position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "#B2402A", border: "3px solid #fff", transform: "translate(-50%,-50%)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" },
  coordConfirm: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#2E9A5C", marginTop: 8, fontWeight: 600 },

  similarCard: { display: "flex", flexDirection: "column", gap: 8 },

  reviewCard: { ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: 18 },
  reviewImg: { width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8, marginBottom: 12 },
  reviewRow: { fontSize: 13.5, color: "#3D4C57", marginBottom: 8, lineHeight: 1.5 },

  detailWrap: { maxWidth: 640 },
  detailHeader: { display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" },
  detailImg: { width: 160, height: 120, objectFit: "cover", borderRadius: 10, flexShrink: 0, cursor: "zoom-in" },
  detailTitle: { fontFamily: HERITAGE, fontWeight: 600, fontSize: 21, margin: "6px 0", color: "#14213A" },
  detailDesc: { fontSize: 13.5, color: "#4B5B68", marginTop: 8, lineHeight: 1.55 },
  detailCard: { ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: 20, maxWidth: 560 },

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
  selectSm: { padding: "7px 10px", borderRadius: 8, border: "1px solid #D8E1E6", fontSize: 12.5, background: "#fff", color: "#3D4C57" },
  bigMap: { position: "relative", width: "100%", maxWidth: 720, height: 320, borderRadius: 14, overflow: "hidden", border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)" },
  compactMap: { position: "relative", width: "100%", height: 260, borderRadius: 16, overflow: "hidden", border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", marginBottom: 20 },
  mapPin: { position: "absolute", width: 24, height: 24, borderRadius: "50%", background: "#fff", border: "2px solid", transform: "translate(-50%,-50%)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" },
  mapPreviewCard: { position: "relative", maxWidth: 260, marginTop: 14 },
  locateBtn: { position: "absolute", bottom: 14, right: 14, zIndex: 1000, width: 38, height: 38, borderRadius: "50%", border: "none", background: "#fff", color: "#1C8B80", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(15,42,67,0.3)" },
  locateError: { position: "absolute", bottom: 60, right: 14, left: 14, zIndex: 1000, background: "#0F2A43", color: "#fff", fontSize: 12, lineHeight: 1.4, padding: "10px 30px 10px 12px", borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.25)" },
  locateErrorClose: { position: "absolute", top: 6, right: 6, background: "none", border: "none", color: "#fff", opacity: 0.7, cursor: "pointer", padding: 4 },

  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(15,42,67,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 2000 },
  modalCard: { position: "relative", ...GLASS_SOFT, borderRadius: 16, padding: 24, maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" },
  modalClose: { position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%", border: "none", background: "#F0F4F6", color: "#3D4C57", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1 },

  votingList: { display: "flex", flexDirection: "column", gap: 8 },
  votingRow: { display: "flex", alignItems: "center", gap: 12, ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 12, padding: "10px 14px" },
  voteBtn: { display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20, border: "1px solid #D8E1E6", background: "#fff", color: "#3D4C57", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: MONO },
  voteBtnActive: { background: "#E3F1EE", borderColor: "#1C8B80", color: "#1C8B80" },

  reopenBox: { ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: 16, marginTop: 16, display: "flex", flexDirection: "column", gap: 10, maxWidth: 480 },
  reopenText: { fontSize: 13, color: "#4B5B68", lineHeight: 1.5 },

  notifList: { display: "flex", flexDirection: "column", gap: 8 },
  notifRow: { display: "flex", alignItems: "flex-start", gap: 10, ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 12, padding: "12px 14px" },
  notifRowUnread: { background: "linear-gradient(90deg, rgba(23,58,102,0.10), rgba(28,139,128,0.07))", borderColor: "#BFDEDA" },
  notifUnreadBadge: { width: 8, height: 8, borderRadius: "50%", background: "#1C8B80", flexShrink: 0, marginTop: 4 },
  notifDot: { width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0 },
  notifTitle: { fontSize: 13.5, fontWeight: 700, color: "#16202B" },
  notifMsg: { fontSize: 12.5, color: "#4B5B68", margin: "2px 0" },
  notifTime: { fontSize: 11, color: "#9AA7B2", fontFamily: MONO },

  profileCard: { display: "flex", alignItems: "center", gap: 14, ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: 18, marginBottom: 10 },
  profileName: { fontSize: 16, fontWeight: 700, color: "#16202B" },
  profileRole: { fontSize: 12.5, color: "#7A8A99", marginTop: 2 },
  infoBanner: { display: "flex", alignItems: "flex-start", gap: 10, ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 12, padding: "12px 14px", fontSize: 13 },

  orgActionBox: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "flex-start" },
  adminActionBox: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: 16, marginTop: 16, maxWidth: 460 },
  chartBox: { ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: "14px 10px 4px", marginBottom: 8 },
  appList: { display: "flex", flexDirection: "column", gap: 8 },
  appRow: { display: "flex", alignItems: "center", gap: 12, ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 12, padding: "10px 14px", cursor: "pointer" },
  orgCard: { ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 4 },
  orgLogo: { width: 48, height: 48, borderRadius: 10, objectFit: "cover", marginBottom: 4 },
  orgLogoPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4F6" },

  staffForm: { display: "flex", flexDirection: "column", gap: 10, ...GLASS, border: "1px solid #E4EAEE", boxShadow: "0 1px 3px rgba(15,42,67,0.05)", borderRadius: 14, padding: 16, marginBottom: 22, maxWidth: 520 },

  bulkBar: { display: "flex", alignItems: "center", gap: 10, background: "#0F2A43", color: "#fff", padding: "10px 14px", borderRadius: 12, marginBottom: 14, flexWrap: "wrap" },
  bulkCheckbox: { position: "absolute", top: 8, left: 8, zIndex: 2, width: 18, height: 18, cursor: "pointer" },

  toast: { position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#0F2A43", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", zIndex: 50 },

  reportFab: {
    position: "fixed", bottom: 20, left: 20, zIndex: 60, display: "flex", alignItems: "center", gap: 9,
    border: "none", borderRadius: 30, padding: "6px 18px 6px 6px",
    background: "linear-gradient(135deg, #173A66 0%, #1C8B80 100%)", color: "#fff",
    cursor: "pointer", boxShadow: "0 6px 20px rgba(23,58,102,0.4)", fontSize: 13.5, fontWeight: 700,
  },
  reportFabIcon: {
    width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  mapHero: { position: "relative", padding: "6px 0 26px", marginBottom: 4 },
  mapHeroEyebrow: {
    display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700,
    color: "#B2402A", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8,
  },
  livePulseDot: { width: 8, height: 8, borderRadius: "50%", background: "#B2402A", flexShrink: 0 },
  mapHeroTitle: {
    fontFamily: HERITAGE, fontWeight: 600, fontSize: 40, lineHeight: 1.08, margin: "0 0 10px",
    background: "linear-gradient(120deg, #14213A 0%, #173A66 45%, #1C8B80 100%)",
    WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
  },
  mapHeroSub: { fontSize: 14.5, color: "#4B5B68", lineHeight: 1.55, margin: "0 0 22px", maxWidth: 520 },
  mapHeroStats: { display: "flex", gap: 12, flexWrap: "wrap" },

  mapFrame: {
    padding: 10, borderRadius: 24, marginTop: 18,
    background: "linear-gradient(120deg, rgba(182,144,63,0.16), rgba(23,58,102,0.10))",
    border: "1px solid rgba(182,144,63,0.35)", boxShadow: "0 16px 40px rgba(15,42,67,0.14)",
  },
};
