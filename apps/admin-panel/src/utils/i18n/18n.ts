import { en, ka } from "@/messages";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en,
  ka
};

const defaultLanguage = localStorage.getItem("i18nextLng") || "ka";

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
