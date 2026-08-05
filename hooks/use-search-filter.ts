"use client";

import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

export function useSearchFilter<T extends Record<string, unknown>>(
  items: T[],
  searchKeys: (keyof T)[],
  filterKey?: keyof T
) {
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = items;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key];
          return typeof val === "string" && val.toLowerCase().includes(q);
        })
      );
    }

    if (filterKey && filterValue !== "all") {
      result = result.filter((item) => String(item[filterKey]) === filterValue);
    }

    return result;
  }, [items, query, filterValue, searchKeys, filterKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function onQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function onFilterChange(value: string) {
    setFilterValue(value);
    setPage(1);
  }

  return {
    query,
    filterValue,
    page: safePage,
    totalPages,
    total: filtered.length,
    paginated,
    onQueryChange,
    onFilterChange,
    setPage
  };
}
