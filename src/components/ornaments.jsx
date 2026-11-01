// O'zbek me'morchiligidan ilhomlangan bezaklar: girih (xotam) yulduzlari, koshin naqshli
// tasma va Registon uslubidagi gumbaz-minoralar silueti. Hammasi inline SVG — tashqi rasm yo'q.

// 8 burchakli xotam yulduzi: ikki kvadratning ustma-ust qo'yilishidan hosil bo'ladi.
export function khatamPath(cx, cy, R, rot = -90) {
  const r = R * Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const a = ((rot + i * 22.5) * Math.PI) / 180;
    const rr = i % 2 ? r : R;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

function svgUri(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Sahifa foni uchun takrorlanuvchi girih plitkasi (CSS background-image sifatida).
export function girihTile({ size = 64, stroke = "rgba(23,58,102,0.07)", accent = "rgba(201,162,74,0.16)" } = {}) {
  const h = size / 2, R = size * 0.3;
  const corners = [[0, 0], [size, 0], [0, size], [size, size]].map(([x, y]) => khatamPath(x, y, R)).join(" ");
  return svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>` +
    `<g fill='none' stroke-width='1'>` +
    `<path d='${khatamPath(h, h, R)}' stroke='${accent}'/>` +
    `<path d='${corners}' stroke='${stroke}'/>` +
    `<path d='${khatamPath(h, h, R * 0.42, -90 + 22.5)}' stroke='${stroke}'/>` +
    `</g></svg>`
  );
}

// Ingichka koshin tasmasi: topbar ostida va kartalar tepasida ishlatiladi.
export function tileBand({ h = 8, a = "#C9A24A", b = "#1C8B80", bg = "#0E2A5C" } = {}) {
  const w = h * 2;
  return svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
    `<rect width='${w}' height='${h}' fill='${bg}'/>` +
    `<path d='M0 ${h / 2}L${h / 2} 0L${h} ${h / 2}L${h / 2} ${h}Z' fill='${a}'/>` +
    `<path d='M${h} ${h / 2}L${h * 1.5} 0L${w} ${h / 2}L${h * 1.5} ${h}Z' fill='${b}'/>` +
    `<circle cx='${h / 2}' cy='${h / 2}' r='${h * 0.14}' fill='${bg}'/>` +
    `</svg>`
  );
}

// Katta, sekin aylanadigan girih rozetkasi — kirish sahifasi va xarita sarlavhasi bezagi.
export function Rosette({ size = 420, color = "#C9A24A", opacity = 1, className = "", style }) {
  const c = 100;
  const rings = [92, 74, 56, 38, 20];
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className}
      style={{ opacity, pointerEvents: "none", ...style }} aria-hidden="true">
      <g fill="none" stroke={color} strokeLinejoin="round">
        <circle cx={c} cy={c} r="97" strokeWidth="0.6" strokeDasharray="1.5 3" />
        {rings.map((R, i) => (
          <path key={R} d={khatamPath(c, c, R, -90 + (i % 2) * 22.5)} strokeWidth={i === 0 ? 1.1 : 0.8} />
        ))}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5 * Math.PI) / 180;
          return <line key={i} x1={c + 20 * Math.cos(a)} y1={c + 20 * Math.sin(a)} x2={c + 92 * Math.cos(a)} y2={c + 92 * Math.sin(a)} strokeWidth="0.35" />;
        })}
        <circle cx={c} cy={c} r="6" strokeWidth="0.9" />
      </g>
    </svg>
  );
}

// Kichik yulduzcha belgisi (bo'lim sarlavhalari, faol menyu elementi uchun).
export function StarMark({ size = 12, color = "#C9A24A", style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0, ...style }} aria-hidden="true">
      <path d={khatamPath(12, 12, 11)} fill={color} />
      <circle cx="12" cy="12" r="3.2" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

// Registon uslubidagi siluet: peshtoqlar, gumbazlar, minoralar.
export function Skyline({ color = "#081B3D", height = 150, style }) {
  return (
    <svg viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax slice" width="100%" height={height}
      style={{ display: "block", pointerEvents: "none", ...style }} aria-hidden="true">
      <path fill={color} d={
        // chap minora
        "M0 160V120H40V104H52V60l4-8 4 8V104H66V120H110" +
        // chap madrasa: peshtoq + ravoq
        "V84H130V70H210V84H230V120H250" +
        // gumbaz (firuza gumbaz shakli)
        "V96C250 70 270 52 300 46C302 36 306 30 310 26C314 30 318 36 320 46C350 52 370 70 370 96V120" +
        // markaziy peshtoq — baland ravoq
        "H420V100H440V40H460L462 32H478L480 40H500V40H520V100H540V120" +
        // markaziy katta gumbaz
        "H560V90C560 58 590 34 630 28C633 14 638 8 640 4C642 8 647 14 650 28C690 34 720 58 720 90V120" +
        // markaziy minoralar
        "H740V56l5-9 5 9V120H770V100H800V74H880V100H900V120" +
        // o'ng gumbaz
        "H920V100C920 78 938 62 962 58C964 50 967 46 970 43C973 46 976 50 978 58C1002 62 1020 78 1020 100V120" +
        // o'ng minora va uylar
        "H1050V112H1070V64l4-8 4 8V112H1092V120H1120V100H1160V110H1200V160Z"
      } />
      <g fill="rgba(201,162,74,0.55)">
        {[[170, 98], [190, 98], [470, 70], [470, 88], [840, 88], [860, 88], [1140, 112]].map(([x, y], i) => (
          <rect key={i} x={x - 4} y={y} width="8" height="12" rx="4" />
        ))}
      </g>
    </svg>
  );
}
