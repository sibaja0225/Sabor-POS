import { getSalesData } from "@/lib/dashboard-data";
import { SaleForm } from "@/components/forms/sale-form";
import { InvoiceActions } from "@/components/forms/invoice-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
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
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.sales.invoice}</th>
                  <th>{t.sales.customer}</th>
                  <th>{t.sales.payment}</th>
                  <th>{t.common.total}</th>
                  <th>{t.common.date}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {sales.length ? (
                  sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.invoice_number}</td>
                      <td>{sale.customer_name ?? t.common.finalConsumer}</td>
                      <td>{sale.payment_method}</td>
                      <td>{formatCurrency(sale.total_amount)}</td>
                      <td>{formatDate(sale.created_at)}</td>
                      <td><InvoiceActions sale={sale} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>{t.sales.noInvoices}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}
