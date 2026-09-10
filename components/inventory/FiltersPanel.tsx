"use client"

import { useMemo, useState, type ReactNode } from "react"
import { ChevronUp, X } from "lucide-react"
import type { SourceChannel, Vehicle } from "@/lib/types"
import type { UatFilterOptions } from "@/lib/uat-adapter"
import { COLOR } from "@/lib/tokens"

export interface AdvancedFilters {
  minPrice: string
  maxPrice: string
  bodyTypes: Set<string>
  sources: Set<SourceChannel>
  makes: Set<string>
  models: Set<string>
  years: Set<number>
  mediaStatus: Set<string>
  mediaType: Set<string>
}

export function emptyAdvancedFilters(): AdvancedFilters {
  return {
    minPrice: "",
    maxPrice: "",
    bodyTypes: new Set(),
    sources: new Set(),
    makes: new Set(),
    models: new Set(),
    years: new Set(),
    mediaStatus: new Set(),
    mediaType: new Set(),
  }
}

interface FiltersPanelProps {
  open: boolean
  onClose: () => void
  filters: AdvancedFilters
  onChange: (next: AdvancedFilters) => void
  vehicles: Vehicle[]
  onReset: () => void
  /** Real, whole-dataset facet counts from /inventory/v2/filters, when
   * available — falls back to counting only the currently-fetched vehicles
   * (which may be a truncated sample) when not provided. */
  realFilterOptions?: UatFilterOptions
}

interface CountedOption<T> {
  value: T
  label: string
  count: number
}

function countBy<T extends string | number>(vehicles: Vehicle[], keyFn: (v: Vehicle) => T): CountedOption<T>[] {
  const counts = new Map<T, number>()
  for (const v of vehicles) {
    const key = keyFn(v)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: String(value), count }))
    .sort((a, b) => b.count - a.count)
}

/** Like countBy, but groups case-insensitively and keeps the first-seen
 * casing as the display label — the real dataset mixes "Toyota" / "TOYOTA" /
 * "toyota" for the same make, which would otherwise fragment into separate
 * checkbox rows that don't match each other. */
function countByCaseInsensitive(vehicles: Vehicle[], keyFn: (v: Vehicle) => string): CountedOption<string>[] {
  const counts = new Map<string, { label: string; count: number }>()
  for (const v of vehicles) {
    const raw = keyFn(v)
    const key = raw.toLowerCase()
    const entry = counts.get(key) ?? { label: raw, count: 0 }
    entry.count += 1
    counts.set(key, entry)
  }
  return Array.from(counts.entries())
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => b.count - a.count)
}

export function FiltersPanel({ open, onClose, filters, onChange, vehicles, onReset, realFilterOptions }: FiltersPanelProps) {
  if (!open) return null

  const makeOptions = useMemo(() => realFilterOptions?.makes ?? countByCaseInsensitive(vehicles, (v) => v.make), [vehicles, realFilterOptions])
  const modelOptions = useMemo(() => realFilterOptions?.models ?? countByCaseInsensitive(vehicles, (v) => v.model), [vehicles, realFilterOptions])
  const yearOptions = useMemo(() => realFilterOptions?.years ?? countBy(vehicles, (v) => v.year), [vehicles, realFilterOptions])
  const bodyTypeOptions = useMemo(() => countBy(vehicles, (v) => v.bodyType), [vehicles])
  const sourceOptions = useMemo(() => countBy(vehicles, (v) => v.source.channel), [vehicles])

  const draftCount = vehicles.filter((v) => v.needsAction.notLiveYet).length
  const imageStudioCount = vehicles.filter((v) => !v.needsAction.noPhotos).length
  const spin360Count = Math.min(1, imageStudioCount)

  const priceBounds = useMemo(() => {
    if (realFilterOptions?.priceBounds) return realFilterOptions.priceBounds
    const prices = vehicles.map((v) => v.price)
    return { min: 0, max: prices.length ? Math.max(...prices) : 0 }
  }, [vehicles, realFilterOptions])

  const toggleInSet = <T,>(key: keyof AdvancedFilters, value: T) => {
    const current = filters[key] as Set<T>
    const next = new Set(current)
    next.has(value) ? next.delete(value) : next.add(value)
    onChange({ ...filters, [key]: next })
  }

  const activePriceMin = filters.minPrice === "" ? priceBounds.min : Number(filters.minPrice)
  const activePriceMax = filters.maxPrice === "" ? priceBounds.max : Number(filters.maxPrice)

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,16,35,0.35)", zIndex: 40 }} />
      <div
        className="spyne-animate-slide-in-right"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, background: "#fff", zIndex: 41, boxShadow: "-16px 0 40px -20px rgba(20,16,40,0.35)", display: "flex", flexDirection: "column" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${COLOR.borderShell}`, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: COLOR.ink }}>Filters</span>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", color: COLOR.textSecondary }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          <TreeSection
            title="Media/Product Status"
            rows={[
              { key: "draft", label: "Draft", count: draftCount },
              {
                key: "imageStudio",
                label: "Image Studio",
                count: imageStudioCount,
                children: [{ key: "imageStudioReview", label: "In review", count: imageStudioCount }],
              },
              {
                key: "spin360",
                label: "360 Spin",
                count: spin360Count,
                children: [{ key: "spin360Review", label: "In review", count: spin360Count }],
              },
            ]}
            checked={filters.mediaStatus}
            onToggle={(key) => toggleInSet("mediaStatus", key)}
          />

          <CheckboxSection
            title="Media Type"
            options={[{ value: "capturedMedia", label: "Captured Media", count: imageStudioCount }]}
            checked={filters.mediaType}
            onToggle={(v) => toggleInSet("mediaType", v)}
          />

          <CheckboxSection title="Source" options={sourceOptions} checked={filters.sources} onToggle={(v) => toggleInSet("sources", v)} />

          <CollapsibleSection title="Price Range">
            <PriceRangeControl
              bounds={priceBounds}
              min={activePriceMin}
              max={activePriceMax}
              onChange={(next) => onChange({ ...filters, minPrice: String(next.min), maxPrice: String(next.max) })}
            />
          </CollapsibleSection>

          <CheckboxSection title="Make" options={makeOptions} checked={filters.makes} onToggle={(v) => toggleInSet("makes", v)} limit={4} />

          <CheckboxSection title="Model" options={modelOptions} checked={filters.models} onToggle={(v) => toggleInSet("models", v)} limit={4} />

          <CheckboxSection title="Year" options={yearOptions} checked={filters.years} onToggle={(v) => toggleInSet("years", v)} limit={4} />

          <CheckboxSection title="Body Type" options={bodyTypeOptions} checked={filters.bodyTypes} onToggle={(v) => toggleInSet("bodyTypes", v)} limit={4} />
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${COLOR.borderShell}`, display: "flex", gap: 10, flexShrink: 0 }}>
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

function CollapsibleSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ borderBottom: `1px solid ${COLOR.borderShell}`, padding: "18px 20px" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", border: "none", background: "none", cursor: "pointer", padding: 0 }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: COLOR.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</span>
        <ChevronUp size={16} color={COLOR.textMuted} style={{ transform: open ? "none" : "rotate(180deg)", transition: "transform 0.15s" }} />
      </button>
      {open && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  )
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: `1.5px solid ${checked ? COLOR.primary : "rgba(40,35,70,0.25)"}`,
        background: checked ? COLOR.primary : "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

function CheckboxSection<T extends string | number>({
  title,
  options,
  checked,
  onToggle,
  limit,
}: {
  title: string
  options: CountedOption<T>[]
  checked: Set<T>
  onToggle: (value: T) => void
  limit?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = limit && !expanded ? options.slice(0, limit) : options
  const remaining = limit ? options.length - limit : 0

  return (
    <CollapsibleSection title={title}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {visible.map((opt) => (
          <label key={String(opt.value)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={checked.has(opt.value)} onChange={() => onToggle(opt.value)} style={{ display: "none" }} />
            <Checkbox checked={checked.has(opt.value)} />
            <span style={{ fontSize: 14, color: COLOR.ink }}>
              {opt.label} <span style={{ color: COLOR.textMuted }}>({opt.count})</span>
            </span>
          </label>
        ))}
      </div>
      {limit && remaining > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{ marginTop: 12, border: "none", background: "none", cursor: "pointer", padding: 0, fontSize: 13.5, fontWeight: 700, color: COLOR.primary }}
        >
          +{remaining} more
        </button>
      )}
    </CollapsibleSection>
  )
}

interface TreeRow {
  key: string
  label: string
  count: number
  children?: TreeRow[]
}

function TreeSection({
  title,
  rows,
  checked,
  onToggle,
}: {
  title: string
  rows: TreeRow[]
  checked: Set<string>
  onToggle: (key: string) => void
}) {
  return (
    <CollapsibleSection title={title}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((row) => (
          <div key={row.key}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <Checkbox checked={checked.has(row.key)} />
              <span onClick={() => onToggle(row.key)} style={{ fontSize: 14, color: COLOR.ink }}>
                {row.label} <span style={{ color: COLOR.textMuted }}>({row.count})</span>
              </span>
            </label>
            {row.children && (
              <div style={{ marginTop: 14, marginLeft: 9, paddingLeft: 16, borderLeft: `1px solid ${COLOR.borderShell}`, display: "flex", flexDirection: "column", gap: 14 }}>
                {row.children.map((child) => (
                  <label key={child.key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onToggle(child.key)}>
                    <Checkbox checked={checked.has(child.key)} />
                    <span style={{ fontSize: 14, color: COLOR.ink }}>
                      {child.label} <span style={{ color: COLOR.textMuted }}>({child.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  )
}

function PriceRangeControl({
  bounds,
  min,
  max,
  onChange,
}: {
  bounds: { min: number; max: number }
  min: number
  max: number
  onChange: (next: { min: number; max: number }) => void
}) {
  const span = Math.max(1, bounds.max - bounds.min)
  const minPct = ((min - bounds.min) / span) * 100
  const maxPct = ((max - bounds.min) / span) * 100

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="number"
          value={min}
          min={bounds.min}
          max={max}
          onChange={(e) => onChange({ min: Math.min(Number(e.target.value), max), max })}
          style={{ width: "100%", height: 40, borderRadius: 10, border: `1px solid ${COLOR.borderSoft}`, padding: "0 12px", fontSize: 14, fontWeight: 600, color: COLOR.primary }}
        />
        <span style={{ color: COLOR.textMuted }}>—</span>
        <input
          type="number"
          value={max}
          min={min}
          max={bounds.max}
          onChange={(e) => onChange({ min, max: Math.max(Number(e.target.value), min) })}
          style={{ width: "100%", height: 40, borderRadius: 10, border: `1px solid ${COLOR.borderSoft}`, padding: "0 12px", fontSize: 14, fontWeight: 600, color: COLOR.primary }}
        />
      </div>

      <div style={{ position: "relative", height: 20, marginTop: 22 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 9, height: 2, borderRadius: 2, background: "rgba(40,35,70,0.12)" }} />
        <div style={{ position: "absolute", left: `${minPct}%`, right: `${100 - maxPct}%`, top: 9, height: 2, borderRadius: 2, background: COLOR.primary }} />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={min}
          onChange={(e) => onChange({ min: Math.min(Number(e.target.value), max), max })}
          className="dual-range-input"
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={max}
          onChange={(e) => onChange({ min, max: Math.max(Number(e.target.value), min) })}
          className="dual-range-input"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: COLOR.primary }}>${min}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: COLOR.primary }}>${max}</span>
      </div>
    </div>
  )
}
