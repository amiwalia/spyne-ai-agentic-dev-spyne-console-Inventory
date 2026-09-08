"use client"

import clsx from "clsx"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-1 text-[12.5px] text-spyne-text-muted">
      <span>
        Showing {start}–{end} of {total} vehicles
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="spyne-focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-spyne-border text-spyne-text-secondary disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={clsx(
              "spyne-focus-ring flex h-7 w-7 items-center justify-center rounded-md text-[12px] font-semibold",
              p === page ? "bg-spyne-primary text-white" : "text-spyne-text-secondary hover:bg-spyne-page"
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="spyne-focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-spyne-border text-spyne-text-secondary disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
