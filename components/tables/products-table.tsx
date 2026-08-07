"use client";

import { useSearchFilter } from "@/hooks/use-search-filter";
import { SearchFilter } from "@/components/ui/search-filter";
import { ProductActions } from "@/components/forms/product-actions";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  sale_price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  active: boolean;
};

export function ProductsTable({ products }: { products: Product[] }) {
  const { t } = useLanguage();

  const categories = [...new Set(products.map((p) => p.category))].sort();

  const { query, filterValue, page, totalPages, total, paginated, onQueryChange, onFilterChange, setPage } =
    useSearchFilter(products, ["name", "sku", "category"] as (keyof Product)[], "category");

  return (
    <>
      <SearchFilter
        query={query}
        onQueryChange={onQueryChange}
        filterValue={filterValue}
        onFilterChange={onFilterChange}
        filterOptions={categories.map((c) => ({ value: c, label: c }))}
        filterLabel={t.products.category}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>{t.search.noResults}</td>
              </tr>
            ) : (
              paginated.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="muted">{product.category}</div>
                  </td>
                  <td>{product.sku}</td>
                  <td>{formatCurrency(product.sale_price)}</td>
                  <td>
                    <span className={product.stock <= product.min_stock ? "status-badge status-warn" : ""}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.active ? "status-ok" : "status-neutral"}`}>
                      {product.active ? t.common.active : t.common.inactive}
                    </span>
                  </td>
                  <td>
                    <ProductActions product={product} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
