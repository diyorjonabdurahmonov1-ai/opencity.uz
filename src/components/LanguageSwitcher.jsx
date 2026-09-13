import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import { setProfileLanguage } from "../lib/api/profiles";
import { S } from "../styles";

const LANGS = [
  { code: "uz", short: "UZ" },
  { code: "ru", short: "RU" },
  { code: "en", short: "EN" },
];

export function LanguageSwitcher({ profile, compact = false }) {
  const { i18n, t } = useTranslation();

  const select = async (code) => {
    if (code === i18n.language) return;
    changeLanguage(code);
    if (profile) {
      try { await setProfileLanguage(profile.id, code); } catch { /* keyingi safar sinxronlanadi */ }
    }
  };

  return (
    <div style={S.portalSwitch} title={compact ? t("citizen.profile.languageTitle") : undefined}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => select(l.code)}
          style={{ ...S.portalTab, ...(i18n.language === l.code ? S.portalTabActive : {}) }}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
