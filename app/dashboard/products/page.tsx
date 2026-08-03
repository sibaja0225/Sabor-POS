import { ensureRole } from "@/lib/auth";
import { getProducts } from "@/lib/dashboard-data";
import { ProductForm } from "@/components/forms/product-form";
import { ProductActions } from "@/components/forms/product-actions";
import { formatCurrency } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/server";

export default async function ProductsPage() {
  await ensureRole(["admin", "manager"]);
  const t = await getDictionary();
  const products = await getProducts();

  return (
    <section className="page-grid">
      <header className="page-header">
        <h1>{t.products.title}</h1>
        <p>{t.products.subtitle}</p>
      </header>

      <div className="two-columns">
        <article className="card">
          <h2>{t.products.newProduct}</h2>
          <ProductForm />
        </article>
        <article className="card">
          <h2>{t.products.currentCatalog}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.products.product}</th>
                  <th>{t.products.sku}</th>
                  <th>{t.products.price}</th>
                  <th>{t.products.stock}</th>
                  <th>{t.common.status}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <div className="muted">{product.category}</div>
                    </td>
                    <td>{product.sku}</td>
                    <td>{formatCurrency(product.sale_price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status-badge ${product.active ? "status-ok" : "status-neutral"}`}>
                        {product.active ? t.common.active : t.common.inactive}
                      </span>
                    </td>
                    <td><ProductActions product={product} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}
