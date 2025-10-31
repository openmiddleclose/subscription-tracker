// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import all your locale JSON files
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import ar from "./locales/ar.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import hi from "./locales/hi.json";

i18n
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next) // Bind react-i18next
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
      zh: { translation: zh },
      ja: { translation: ja },
      ar: { translation: ar },
      pt: { translation: pt },
      ru: { translation: ru },
      hi: { translation: hi },
    },
    fallbackLng: "en", // default language
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
