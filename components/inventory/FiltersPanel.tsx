"use client"

import { X } from "lucide-react"
import type { SourceChannel } from "@/lib/types"
import { COLOR } from "@/lib/tokens"

export interface AdvancedFilters {
  minPrice: string
  maxPrice: string
  bodyTypes: Set<string>
  sources: Set<SourceChannel>
}

interface FiltersPanelProps {
  open: boolean
  onClose: () => void
  filters: AdvancedFilters
  onChange: (next: AdvancedFilters) => void
  bodyTypeOptions: string[]
  onReset: () => void
}

const SOURCES: SourceChannel[] = ["IMS", "Website", "Marketplace"]

export function FiltersPanel({ open, onClose, filters, onChange, bodyTypeOptions, onReset }: FiltersPanelProps) {
  if (!open) return null

  const toggleBodyType = (bt: string) => {
    const next = new Set(filters.bodyTypes)
    next.has(bt) ? next.delete(bt) : next.add(bt)
    onChange({ ...filters, bodyTypes: next })
  }

  const toggleSource = (s: SourceChannel) => {
    const next = new Set(filters.sources)
    next.has(s) ? next.delete(s) : next.add(s)
    onChange({ ...filters, sources: next })
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,16,35,0.35)", zIndex: 40 }} />
      <div
        className="spyne-animate-slide-in-right"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 340, background: "#fff", zIndex: 41, boxShadow: "-16px 0 40px -20px rgba(20,16,40,0.35)", display: "flex", flexDirection: "column" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${COLOR.borderShell}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: COLOR.ink }}>Filters</span>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", color: COLOR.textSecondary }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: COLOR.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>Price range</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                value={filters.minPrice}
                onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
                placeholder="Min"
                inputMode="numeric"
                style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${COLOR.borderSoft}`, fontSize: 13 }}
              />
              <span style={{ color: COLOR.textMuted }}>–</span>
              <input
                value={filters.maxPrice}
                onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
                placeholder="Max"
                inputMode="numeric"
                style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${COLOR.borderSoft}`, fontSize: 13 }}
              />
            </div>
          </div>

          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: COLOR.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>Body type</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {bodyTypeOptions.map((bt) => {
                const active = filters.bodyTypes.has(bt)
                return (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => toggleBodyType(bt)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 600,
                      border: `1px solid ${active ? COLOR.chipActiveBorder : COLOR.borderSoft}`,
                      color: active ? COLOR.primary : COLOR.textSecondary,
                      background: active ? COLOR.chipActiveBg : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {bt}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: COLOR.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>Source</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SOURCES.map((s) => {
                const active = filters.sources.has(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSource(s)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 600,
                      border: `1px solid ${active ? COLOR.chipActiveBorder : COLOR.borderSoft}`,
                      color: active ? COLOR.primary : COLOR.textSecondary,
                      background: active ? COLOR.chipActiveBg : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${COLOR.borderShell}`, display: "flex", gap: 10 }}>
          <button type="button" onClick={onReset} className="spyne-btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
            Reset
          </button>
          <button type="button" onClick={onClose} className="spyne-btn-primary" style={{ flex: 1, justifyContent: "center" }}>
            Apply
          </button>
        </div>
      </div>
    </>
  )
}
