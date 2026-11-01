import { S } from "../styles";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Rosette, Skyline } from "./ornaments";

// Kirish ekranlari foni: Samarqand tuni — lojuvard osmon, oltin girih naqshi,
// sekin aylanadigan rozetka, miltillovchi yulduzlar va pastda Registon silueti.
const STARS = [
  [8, 12, 2], [18, 30, 1.5], [27, 8, 1.5], [40, 20, 2.5], [52, 6, 1.5], [63, 26, 2], [74, 10, 1.5],
  [86, 22, 2.5], [93, 6, 1.5], [12, 48, 1.5], [90, 44, 2], [70, 52, 1.5], [4, 64, 2], [96, 62, 1.5],
];

export function NightScene({ children }) {
  return (
    <div style={S.signinWrap} className="oc-signin-bg">
      <div className="oc-girih-overlay" />
      {STARS.map(([x, y, s], i) => (
        <span key={i} className="oc-twinkle"
          style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: s * 2, height: s * 2, borderRadius: "50%", background: "#F4E3B0", animationDelay: `${(i % 7) * 0.6}s`, zIndex: 0 }} />
      ))}
      <div style={S.signinRosetteWrap}>
        <Rosette size="100%" color="#C9A24A" opacity={0.32} className="oc-rosette-spin" />
      </div>
      <div style={S.signinLang}><LanguageSwitcher dark /></div>
      {children}
      <div style={S.signinSkyline}>
        <Skyline color="#071634" height={150} />
      </div>
    </div>
  );
}
