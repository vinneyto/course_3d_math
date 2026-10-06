"use client";
import { useEffect, useState } from "react";
import type { Language } from "../courses/rotation/content";

export function useLanguage(): [Language, (value: Language) => void] {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    try {
      if (localStorage.getItem("course-language") === "ru") setLanguage("ru");
    } catch {
      /* Storage is optional. */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return [
    language,
    (value) => {
      setLanguage(value);
      try {
        localStorage.setItem("course-language", value);
      } catch {
        /* Storage is optional. */
      }
    },
  ];
}
