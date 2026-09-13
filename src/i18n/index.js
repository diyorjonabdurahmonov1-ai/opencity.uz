import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "./locales/uz";
import ru from "./locales/ru";
import en from "./locales/en";

const STORAGE_KEY = "oc-language";

export function getStoredLanguage() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
export function setStoredLanguage(lang) {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* no-op */ }
}

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: getStoredLanguage() || "uz",
  fallbackLng: "uz",
  interpolation: { escapeValue: false },
});

export function changeLanguage(lang) {
  i18n.changeLanguage(lang);
  setStoredLanguage(lang);
}

export default i18n;
