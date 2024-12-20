import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: require("../messages/en.json")
    },
    ja: {
      translation: require("../messages/ja.json")
    },
    ko: {
      translation: require("../messages/ko.json")
    },
    zh: {
      translation: require("../messages/zh.json")
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
})

export default i18n
