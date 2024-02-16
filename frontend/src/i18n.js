import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { translationDe, translationEn } from "./data/Translations";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)

  .init({
    resources: {
      en: { translation: translationEn },
      de: { translation: translationDe },
    },
    debug: true,
    //lng: "en",
    fallbackLng: "en",
    nonExplicitSupportedLngs: true,

    interpolation: {
      escapeValue: false,
    },
    detection: {
      //order: ['path', 'cookie', 'htmlTag'],
      caches: ["cookie"],
    },
  });
