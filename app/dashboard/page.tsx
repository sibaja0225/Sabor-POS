import { getDashboardData } from "@/lib/dashboard-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const t = await getDictionary();
  const { metrics, recentSales, products } = await getDashboardData();
  const lowStockProducts = products.filter((product) => product.stock <= product.min_stock).slice(0, 6);

  return (
    <section className="page-grid">
      <header className="page-header">
        <h1>{t.dashboard.title}</h1>
        <p>{t.dashboard.subtitle}</p>
      </header>

      <div className="cards-grid">
        <article className="card metric-card">
          <div className="metric-icon">₡</div>
          <div className="metric-label">{t.dashboard.todaySales}</div>
          <p className="metric-value">{formatCurrency(metrics.todaySalesTotal)}</p>
        </article>
        <article className="card metric-card">
          <div className="metric-icon">🧾</div>
          <div className="metric-label">{t.dashboard.todayInvoices}</div>
          <p className="metric-value">{metrics.todaySalesCount}</p>
        </article>
        <article className="card metric-card">
          <div className="metric-icon">▣</div>
          <div className="metric-label">{t.dashboard.registeredProducts}</div>
          <p className="metric-value">{metrics.totalProducts}</p>
        </article>
        <article className="card metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-label">{t.dashboard.inventoryValue}</div>
          <p className="metric-value">{formatCurrency(metrics.inventoryValue)}</p>
        </article>
      </div>

      <div className="two-columns">
        <article className="card">
          <h2>{t.dashboard.recentSales}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.dashboard.invoice}</th>
                  <th>{t.dashboard.customer}</th>
                  <th>{t.dashboard.payment}</th>
                  <th>{t.common.total}</th>
                  <th>{t.common.date}</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length ? (
                  recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.invoice_number}</td>
                      <td>{sale.customer_name ?? t.common.finalConsumer}</td>
                      <td>{sale.payment_method}</td>
                      <td>{formatCurrency(sale.total_amount)}</td>
                      <td>{formatDate(sale.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>{t.dashboard.noSalesYet}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <h2>{t.dashboard.stockAlerts}</h2>
          <p className="muted">{t.dashboard.stockAlertsHint}</p>
          <div className="form-grid">
            {lowStockProducts.length ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="topbar-card">
                  <strong>{product.name}</strong>
                  <div className="muted">{product.category}</div>
                  <span className="status-badge status-warning">
                    {t.dashboard.stock} {product.stock} / {t.dashboard.min} {product.min_stock}
                  </span>
                </div>
              ))
            ) : (
              <div className="topbar-card">{t.dashboard.allAboveMin}</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
