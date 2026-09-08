"use client"

import { useState } from "react"
import { AlertTriangle, ImageOff, Megaphone, Radio, Wrench, X } from "lucide-react"
import type { NeedsActionBreakdown } from "@/lib/types"
import type { QuickFilter } from "./FilterBar"

interface Row {
  label: string
  count: number
  icon: typeof ImageOff
  filter?: QuickFilter
}

interface NeedsActionDrawerProps {
  breakdown: NeedsActionBreakdown
  total: number
  onSelectFilter: (filter: QuickFilter) => void
}

export function NeedsActionDrawer({ breakdown, total, onSelectFilter }: NeedsActionDrawerProps) {
  const [open, setOpen] = useState(false)

  const studioRows: Row[] = [
    { label: "No Photos", count: breakdown.studioOs.noPhotos, icon: ImageOff, filter: "noPhotos" },
    { label: "Need Promotions", count: breakdown.studioOs.needsPromotion, icon: Megaphone, filter: "needsPromotion" },
    { label: "Not Live Yet", count: breakdown.studioOs.notLiveYet, icon: Radio, filter: "notLiveYet" },
  ]

  const viniRows: Row[] = [
    { label: "Sales", count: breakdown.viniAi.sales, icon: Wrench },
    { label: "Services", count: breakdown.viniAi.services, icon: Wrench },
    { label: "Receptions", count: breakdown.viniAi.receptions, icon: Wrench },
  ]

  const studioTotal = studioRows.reduce((s, r) => s + r.count, 0)
  const viniTotal = viniRows.reduce((s, r) => s + r.count, 0)

  return (
    <>
      {open && (
        <div className="spyne-animate-slide-up spyne-card fixed bottom-24 right-6 z-30 w-80 overflow-hidden p-0 shadow-xl">
          <div className="flex items-center justify-between border-b border-spyne-border px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-spyne-danger" />
              <span className="text-[13px] font-semibold text-spyne-text-primary">{total} Vehicles</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="spyne-focus-ring text-spyne-text-muted">
              <X size={16} />
            </button>
          </div>

          <div className="px-4 py-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-spyne-text-muted">Studio OS</span>
              <span className="text-[12px] font-semibold text-spyne-danger">{studioTotal} Vehicle</span>
            </div>
            {studioRows.map((row) => (
              <button
                type="button"
                key={row.label}
                onClick={() => {
                  if (row.filter) {
                    onSelectFilter(row.filter)
                    setOpen(false)
                  }
                }}
                className="spyne-focus-ring flex w-full items-center justify-between rounded py-1.5 hover:bg-spyne-page"
              >
                <div className="flex items-center gap-2 text-[12.5px] text-spyne-text-secondary">
                  <row.icon size={14} className="text-spyne-text-muted" />
                  {row.label}
                </div>
                <span className="text-[12.5px] font-semibold text-spyne-text-primary">{row.count}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-spyne-border px-4 py-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-spyne-text-muted">Vini AI</span>
              <span className="text-[12px] font-semibold text-spyne-primary">{viniTotal} Vehicle</span>
            </div>
            {viniRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 text-[12.5px] text-spyne-text-secondary">
                  <row.icon size={14} className="text-spyne-text-muted" />
                  {row.label}
                </div>
                <span className="text-[12.5px] font-semibold text-spyne-text-primary">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="spyne-focus-ring fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-spyne-danger px-4 py-3 text-[12.5px] font-semibold text-white shadow-lg"
      >
        <AlertTriangle size={15} />
        {total} Vehicles Need Actions
      </button>
    </>
  )
}
