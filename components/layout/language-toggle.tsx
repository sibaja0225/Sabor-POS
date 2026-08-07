"use client";

import { useLanguage } from "@/lib/i18n/context";
import { classNames } from "@/lib/utils";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="language-toggle" role="group" aria-label={t.common.language}>
      <button
        type="button"
        className={classNames("language-toggle-option", locale === "es" && "active")}
        aria-pressed={locale === "es"}
        onClick={() => setLocale("es")}
      >
        ES
      </button>
      <button
        type="button"
        className={classNames("language-toggle-option", locale === "en" && "active")}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
