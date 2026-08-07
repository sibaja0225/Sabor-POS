"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { classNames } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

export function Sidebar({
  role,
  name
}: {
  role: "admin" | "manager" | "cashier";
  name: string;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const links = [
    { href: "/dashboard", label: t.nav.summary, icon: "⌂" },
    { href: "/dashboard/products", label: t.nav.products, icon: "▣" },
    { href: "/dashboard/inventory", label: t.nav.inventory, icon: "▤" },
    { href: "/dashboard/sales", label: t.nav.sales, icon: "◈" },
    { href: "/dashboard/cash-register", label: t.nav.cashRegister, icon: "◻" },
    { href: "/dashboard/reports", label: t.nav.reports, icon: "◉" },
    { href: "/dashboard/users", label: t.nav.users, icon: "◇" },
    { href: "/dashboard/profile", label: t.nav.profile, icon: "◎" }
  ];

  const nav = (
    <>
      <div className="brand">
        <img src="/sabor-pos-logo.png" alt="Sabor POS" className="brand-logo" />
        <div>
          <strong>Sabor POS</strong>
          <span>{t.nav.brandTagline}</span>
        </div>
      </div>
      <nav>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={classNames("nav-link", pathname === link.href && "active")}
          >
            <span className="nav-icon" aria-hidden="true">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <footer>
        <strong>{name}</strong>
        <div className="muted">{t.nav.role}: {role}</div>
      </footer>
    </>
  );

  return (
    <>
      {/* Sidebar desktop — siempre visible */}
      <aside className="sidebar sidebar-desktop">
        {nav}
      </aside>

      {/* Botón hamburguesa — solo móvil */}
      <button
        className="hamburger-btn"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="4" x2="18" y2="18" />
            <line x1="18" y1="4" x2="4" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="19" y2="6" />
            <line x1="3" y1="11" x2="19" y2="11" />
            <line x1="3" y1="16" x2="19" y2="16" />
          </svg>
        )}
      </button>

      {/* Overlay + drawer móvil */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={classNames("sidebar sidebar-mobile", open && "sidebar-mobile-open")}>
        {nav}
      </aside>
    </>
  );
}
