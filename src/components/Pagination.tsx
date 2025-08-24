// components/Pagination.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  page: number;           // 1-based
  limit: number;
  totalCount: number;
};

export default function Pagination({ page, limit, totalCount }: Props) {
  const search = useSearchParams();
  const lastPage = Math.max(1, Math.ceil(totalCount / limit));

  const mkHref = (p: number) => {
    const params = new URLSearchParams(search?.toString() ?? "");
    params.set("page", String(p));
    params.set("limit", String(limit));
    return `/?${params.toString()}`;
  };

  return (
    <nav className="flex items-center gap-2 my-6">
      <Link
        aria-disabled={page <= 1}
        className={`px-3 py-2 rounded-xl shadow ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
        href={mkHref(page - 1)}
      >
        ← Prev
      </Link>
      <span className="text-sm">
        Page <strong>{page}</strong> / {lastPage}
      </span>
      <Link
        aria-disabled={page >= lastPage}
        className={`px-3 py-2 rounded-xl shadow ${page >= lastPage ? "pointer-events-none opacity-40" : ""}`}
        href={mkHref(page + 1)}
      >
        Next →
      </Link>
    </nav>
  );
}