"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const links = [
    { href: "/dashboard", label: t.nav.summary, icon: "⌂" },
    { href: "/dashboard/products", label: t.nav.products, icon: "▣" },
    { href: "/dashboard/inventory", label: t.nav.inventory, icon: "▤" },
    { href: "/dashboard/sales", label: t.nav.sales, icon: "◈" },
    { href: "/dashboard/reports", label: t.nav.reports, icon: "◉" },
    { href: "/dashboard/users", label: t.nav.users, icon: "◇" }
  ];

  return (
    <aside className="sidebar">
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
    </aside>
  );
}
