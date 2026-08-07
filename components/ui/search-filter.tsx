"use client";

import { useLanguage } from "@/lib/i18n/context";

type Option = { value: string; label: string };

type SearchFilterProps = {
  query: string;
  onQueryChange: (v: string) => void;
  filterValue?: string;
  onFilterChange?: (v: string) => void;
  filterOptions?: Option[];
  filterLabel?: string;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
};

export function SearchFilter({
  query,
  onQueryChange,
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel,
  page,
  totalPages,
  total,
  onPageChange
}: SearchFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="search-filter-bar">
      <div className="search-filter-controls">
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t.search.placeholder}
            className="search-input"
            aria-label={t.search.placeholder}
          />
        </div>
        {filterOptions && filterOptions.length > 0 && onFilterChange ? (
          <div className="filter-wrap">
            {filterLabel ? <label className="filter-label">{filterLabel}</label> : null}
            <select
              value={filterValue ?? "all"}
              onChange={(e) => onFilterChange(e.target.value)}
              className="filter-select"
              aria-label={filterLabel ?? t.search.filter}
            >
              <option value="all">{t.search.all}</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="search-filter-footer">
        <span className="muted search-count">
          {t.search.showing} {Math.min((page - 1) * 10 + 1, total)}–{Math.min(page * 10, total)} {t.search.of} {total}
        </span>
        <div className="pagination">
          <button
            type="button"
            className="button-secondary pagination-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={t.search.prev}
          >
            &#8592;
          </button>
          <span className="muted pagination-info">{page} / {totalPages}</span>
          <button
            type="button"
            className="button-secondary pagination-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label={t.search.next}
          >
            &#8594;
          </button>
        </div>
      </div>
    </div>
  );
}
