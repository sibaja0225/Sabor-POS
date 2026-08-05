import { getSalesData } from "@/lib/dashboard-data";
import { SaleForm } from "@/components/forms/sale-form";
import { SalesTable } from "@/components/tables/sales-table";
import { getDictionary } from "@/lib/i18n/server";

export default async function SalesPage() {
  const t = await getDictionary();
  const { sales, products } = await getSalesData();

  return (
    <section className="page-grid">
      <header className="page-header">
        <h1>{t.sales.title}</h1>
        <p>{t.sales.subtitle}</p>
      </header>

      <div className="two-columns">
        <article className="card">
          <h2>{t.sales.newSale}</h2>
          {products.length ? (
            <SaleForm products={products} />
          ) : (
            <div className="topbar-card">{t.sales.noActiveProducts}</div>
          )}
        </article>
        <article className="card">
          <h2>{t.sales.invoiceHistory}</h2>
          <SalesTable sales={sales} />
        </article>
      </div>
    </section>
  );
}
