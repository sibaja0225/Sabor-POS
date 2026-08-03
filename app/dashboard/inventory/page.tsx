import { ensureRole } from "@/lib/auth";
import { getInventoryMovements, getProducts } from "@/lib/dashboard-data";
import { InventoryForm } from "@/components/forms/inventory-form";
import { formatDate } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/server";

export default async function InventoryPage() {
  await ensureRole(["admin", "manager"]);
  const t = await getDictionary();
  const [products, movements] = await Promise.all([getProducts(), getInventoryMovements()]);

  return (
    <section className="page-grid">
      <header className="page-header">
        <h1>{t.inventory.title}</h1>
        <p>{t.inventory.subtitle}</p>
      </header>

      <div className="two-columns">
        <article className="card">
          <h2>{t.inventory.registerMovement}</h2>
          {products.length ? (
            <InventoryForm products={products.map((product) => ({ id: product.id, name: product.name, sku: product.sku }))} />
          ) : (
            <div className="topbar-card">{t.inventory.needProducts}</div>
          )}
        </article>

        <article className="card">
          <h2>{t.inventory.stockOnHand}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.inventory.product}</th>
                  <th>{t.inventory.sku}</th>
                  <th>{t.inventory.stock}</th>
                  <th>{t.inventory.min}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.stock}</td>
                    <td>{product.min_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <article className="card">
        <h2>{t.inventory.lastMovements}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.inventory.product}</th>
                <th>{t.inventory.type}</th>
                <th>{t.inventory.quantity}</th>
                <th>{t.inventory.notes}</th>
                <th>{t.common.date}</th>
              </tr>
            </thead>
            <tbody>
              {movements.length ? (
                movements.map((movement) => {
                  const product = movement.products as { name?: string; sku?: string } | null;

                  return (
                    <tr key={movement.id}>
                      <td>
                        {product?.name ?? t.inventory.product}
                        <div className="muted">{product?.sku ?? ""}</div>
                      </td>
                      <td>{movement.movement_type}</td>
                      <td>{movement.quantity}</td>
                      <td>{movement.notes ?? "-"}</td>
                      <td>{formatDate(movement.created_at)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5}>{t.inventory.noMovements}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
