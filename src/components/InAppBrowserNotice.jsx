import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { S } from "../styles";
import { LanguageSwitcher } from "./LanguageSwitcher";

// Instagram, Facebook, TikTok va h.k. ilova ichidagi brauzerlarni aniqlaydi.
// Google shu turdagi "in-app" brauzerlardan OAuth orqali kirishni xavfsizlik
// siyosatiga ko'ra bloklaydi — shuning uchun foydalanuvchini alohida ogohlantirib,
// haqiqiy brauzerda ochishni so'raymiz.
export function detectInAppBrowser() {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/\bLine\//i.test(ua)) return "line";
  if (/MicroMessenger/i.test(ua)) return "wechat";
  if (/TikTok/i.test(ua)) return "tiktok";
  return null;
}

export function InAppBrowserNotice({ source }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard ishlamasa ham hech narsa buzilmaydi — foydalanuvchi qo'lda nusxalashi mumkin
    }
  };

  return (
    <div style={S.signinWrap} className="oc-signin-bg">
      <div className="oc-dotgrid" />
      <div style={S.signinCard} className="oc-signin-card-in">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
          <LanguageSwitcher />
        </div>
        <div style={S.brandRow}>
          <img src="/icon-192.png" alt="OpenCity" style={{ ...S.brandMark, width: 56, height: 56, borderRadius: 16 }} />
          <div style={S.brandName}>OpenCity</div>
        </div>
        <h1 style={{ ...S.h1, fontSize: 24 }}>{t("inAppBrowser.heading")}</h1>
        <p style={S.lead}>{t("inAppBrowser.explain", { app: t(`inAppBrowser.apps.${source}`) })}</p>
        <ol style={{ ...S.lead, margin: "0 0 20px", paddingLeft: 20 }}>
          <li>{t("inAppBrowser.step1")}</li>
          <li>{t("inAppBrowser.step2")}</li>
        </ol>
        <button style={S.primaryBtn} onClick={copyLink} className="oc-glow">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? t("inAppBrowser.copied") : t("inAppBrowser.copyLink")}
        </button>
        <p style={S.fine}>
          <ExternalLink size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          {t("inAppBrowser.hint")}
        </p>
      </div>
    </div>
  );
}
