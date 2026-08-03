import { ensureRole } from "@/lib/auth";
import { getReportsData } from "@/lib/dashboard-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceActions } from "@/components/forms/invoice-actions";
import { getDictionary } from "@/lib/i18n/server";

export default async function ReportsPage() {
  await ensureRole(["admin", "manager"]);
  const t = await getDictionary();
  const { todaySales, monthSales, products, topProducts } = await getReportsData();
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const monthTotal = monthSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const averageTicket = todaySales.length ? todayTotal / todaySales.length : 0;
  const lowStock = products.filter((product) => product.stock <= product.min_stock);
  const maxTopQuantity = topProducts[0]?.quantity ?? 1;

  return (
    <section className="page-grid">
      <header className="page-header">
        <h1>{t.reports.title}</h1>
        <p>{t.reports.subtitle}</p>
      </header>

      <div className="cards-grid">
        <article className="card">
          <div className="metric-label">{t.reports.soldToday}</div>
          <p className="metric-value">{formatCurrency(todayTotal)}</p>
        </article>
        <article className="card">
          <div className="metric-label">{t.reports.monthSales}</div>
          <p className="metric-value">{formatCurrency(monthTotal)}</p>
        </article>
        <article className="card">
          <div className="metric-label">{t.reports.avgTicketToday}</div>
          <p className="metric-value">{formatCurrency(averageTicket)}</p>
        </article>
        <article className="card">
          <div className="metric-label">{t.reports.lowStockProducts}</div>
          <p className="metric-value">{lowStock.length}</p>
        </article>
      </div>



      <article className="card">
        <h2>{t.reports.monthInvoices}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.sales.invoice}</th>
                <th>{t.reports.payment}</th>
                <th>{t.common.total}</th>
                <th>{t.common.date}</th>
                <th>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {monthSales.length ? (
                monthSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.invoice_number}</td>
                    <td>{sale.payment_method}</td>
                    <td>{formatCurrency(sale.total_amount)}</td>
                    <td>{formatDate(sale.created_at)}</td>
                    <td><InvoiceActions sale={sale} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>{t.reports.noInvoicesMonth}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <div className="two-columns">
        <article className="card">
          <h2>{t.reports.topProducts}</h2>
          <div className="report-bars">
            {topProducts.length ? (
              topProducts.map((product) => (
                <div key={product.name} className="report-bar">
                  <div>
                    <strong>{product.name}</strong>
                    <div className="muted">
                      {product.quantity} {t.reports.units} | {formatCurrency(product.subtotal)}
                    </div>
                  </div>
                  <div
                    className="report-bar-fill"
                    style={{ width: `${Math.max(15, (product.quantity / maxTopQuantity) * 100)}%` }}
                  />
                </div>
              ))
            ) : (
              <div className="topbar-card">{t.reports.notEnoughData}</div>
            )}
          </div>
        </article>

        <article className="card">
          <h2>{t.reports.inventoryAlerts}</h2>
          <div className="form-grid">
            {lowStock.length ? (
              lowStock.map((product) => (
                <div key={product.id} className="topbar-card">
                  <strong>{product.name}</strong>
                  <div className="muted">
                    {t.dashboard.stock} {product.stock} | {t.dashboard.min} {product.min_stock}
                  </div>
                  <div>{formatCurrency(product.sale_price)} {t.reports.salePriceLabel}</div>
                </div>
              ))
            ) : (
              <div className="topbar-card">{t.reports.noInventoryAlerts}</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
