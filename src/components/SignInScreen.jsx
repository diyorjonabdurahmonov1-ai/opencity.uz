import { Camera, ThumbsUp, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { S } from "../styles";
import { LanguageSwitcher } from "./LanguageSwitcher";

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12.9 24 12.9c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.9 29.6 4.9 24 4.9c-7.6 0-14.2 4.3-17.7 9.8z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2 14-5.3l-6.5-5.4c-2 1.4-4.6 2.3-7.5 2.3-5.3 0-9.8-3.4-11.4-8.1l-6.6 5.1C9.7 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.6-2.6 4.8-4.8 6.3l6.5 5.4C40.1 36.9 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export function SignInScreen({ onSignIn }) {
  const { t } = useTranslation();
  return (
    <div style={S.signinWrap} className="oc-signin-bg">
      <div className="oc-dotgrid" />
      <div style={S.signinCard} className="oc-signin-card-in">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
          <LanguageSwitcher />
        </div>
        <div style={S.brandRow}>
          <img src="/icon-192.png" alt="OpenCity" style={{ ...S.brandMark, width: 56, height: 56, borderRadius: 16 }} className="oc-float" />
          <div style={S.brandName}>OpenCity</div>
        </div>
        <h1 style={S.h1}>{t("signIn.heading")}</h1>
        <p style={S.lead}>{t("signIn.lead")}</p>
        <button style={S.googleBtn} onClick={onSignIn} className="oc-glow">
          <GoogleG /> {t("signIn.googleButton")}
        </button>
        <p style={S.fine}>{t("signIn.gpsNote")}</p>
        <div style={S.signinFeatureRow}>
          <div style={S.signinFeature}>
            <div style={S.signinFeatureIcon}><Camera size={17} color="#1E88A8" /></div>
            {t("signIn.feature1")}
          </div>
          <div style={S.signinFeature}>
            <div style={S.signinFeatureIcon}><ThumbsUp size={17} color="#8759B3" /></div>
            {t("signIn.feature2")}
          </div>
          <div style={S.signinFeature}>
            <div style={S.signinFeatureIcon}><Building2 size={17} color="#2E9A5C" /></div>
            {t("signIn.feature3")}
          </div>
        </div>
      </div>
    </div>
  );
}
