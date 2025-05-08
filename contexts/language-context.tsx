"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { th } from "@/lib/translations/th"
import { en } from "@/lib/translations/en"

type Language = "th" | "en"
type Translations = typeof th

interface LanguageContextType {
  language: Language
  t: Translations
  changeLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("th")
  const [translations, setTranslations] = useState<Translations>(th)

  useEffect(() => {
    // ดึงค่าภาษาจาก localStorage เมื่อโหลดหน้า
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "th" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
      setTranslations(savedLanguage === "th" ? th : en)
    }
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    setTranslations(lang === "th" ? th : en)
    localStorage.setItem("language", lang)
  }

  return (
    <LanguageContext.Provider value={{ language, t: translations, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
