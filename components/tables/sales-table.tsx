"use client";

import { useSearchFilter } from "@/hooks/use-search-filter";
import { SearchFilter } from "@/components/ui/search-filter";
import { InvoiceActions } from "@/components/forms/invoice-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

type Sale = {
  id: string;
  invoice_number: string;
  customer_name: string | null;
  payment_method: string;
  total_amount: number;
  created_at: string;
};

export function SalesTable({ sales }: { sales: Sale[] }) {
  const { t } = useLanguage();

  const methods = [...new Set(sales.map((s) => s.payment_method))].sort();

  const { query, filterValue, page, totalPages, total, paginated, onQueryChange, onFilterChange, setPage } =
    useSearchFilter(sales, ["invoice_number", "customer_name", "payment_method"] as (keyof Sale)[], "payment_method");

  return (
    <>
      <SearchFilter
        query={query}
        onQueryChange={onQueryChange}
        filterValue={filterValue}
        onFilterChange={onFilterChange}
        filterOptions={methods.map((m) => ({ value: m, label: m }))}
        filterLabel={t.sales.paymentMethod}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  {total === 0 ? t.sales.noInvoices : t.search.noResults}
                </td>
              </tr>
            ) : (
              paginated.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.invoice_number}</td>
                  <td>{sale.customer_name ?? t.common.finalConsumer}</td>
                  <td>{sale.payment_method}</td>
                  <td>{formatCurrency(sale.total_amount)}</td>
                  <td>{formatDate(sale.created_at)}</td>
                  <td>
                    <InvoiceActions sale={sale} />
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
