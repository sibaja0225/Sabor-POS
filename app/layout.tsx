import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { getLocale } from "@/lib/i18n/server";
import { ThemeProvider } from "@/lib/theme/context";
import { getTheme } from "@/lib/theme/server";

export const metadata: Metadata = {
  title: "Sabor POS",
  description: "El sabor de administrar tu negocio fácilmente."
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [locale, theme] = await Promise.all([getLocale(), getTheme()]);

  return (
    <html lang={locale} data-theme={theme} suppressHydrationWarning>
      <body>
        <ThemeProvider initialTheme={theme}>
          <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
