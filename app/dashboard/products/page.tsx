import { ensureRole } from "@/lib/auth";
import { getProducts } from "@/lib/dashboard-data";
import { ProductForm } from "@/components/forms/product-form";
import { ProductsTable } from "@/components/tables/products-table";
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
          <ProductsTable products={products} />
        </article>
      </div>
    </section>
  );
}
