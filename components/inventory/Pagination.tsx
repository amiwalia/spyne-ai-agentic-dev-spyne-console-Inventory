"use client"

import clsx from "clsx"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

const SIBLING_COUNT = 1

/** Always includes page 1 and the last page, a window of SIBLING_COUNT pages
 * on either side of the current page, and "…" wherever a gap is skipped —
 * the standard windowed-pagination pattern. Caps out at a handful of
 * elements regardless of how many total pages there are, unlike rendering
 * every page number directly. */
export function buildPageWindow(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 5 + SIBLING_COUNT * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const left = Math.max(2, page - SIBLING_COUNT)
  const right = Math.min(totalPages - 1, page + SIBLING_COUNT)
  const pages: (number | "ellipsis")[] = [1]

  if (left > 2) pages.push("ellipsis")
  for (let p = left; p <= right; p++) pages.push(p)
  if (right < totalPages - 1) pages.push("ellipsis")

  pages.push(totalPages)
  return pages
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const pageWindow = buildPageWindow(page, totalPages)

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
          aria-label="Previous page"
          className="spyne-focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-spyne-border text-spyne-text-secondary disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        {pageWindow.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="flex h-7 w-7 items-center justify-center text-[12px] text-spyne-text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={clsx(
                "spyne-focus-ring flex h-7 w-7 items-center justify-center rounded-md text-[12px] font-semibold",
                p === page ? "bg-spyne-primary text-white" : "text-spyne-text-secondary hover:bg-spyne-page"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="spyne-focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-spyne-border text-spyne-text-secondary disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
