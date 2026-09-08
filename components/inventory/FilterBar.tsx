"use client"

import { useEffect, useState } from "react"
import { Download, Search, SlidersHorizontal } from "lucide-react"
import { COLOR } from "@/lib/tokens"

export type QuickFilter = "aging60" | "aging40" | "noPhotos" | "overstocked" | "needsPromotion" | "notLiveYet" | "highDemand"

const CHIPS: { value: QuickFilter; label: string }[] = [
  { value: "aging60", label: "Aging 60+" },
  { value: "aging40", label: "Aging 40+" },
  { value: "noPhotos", label: "No photos" },
  { value: "overstocked", label: "Overstocked" },
]

const PLACEHOLDERS = ["Search by Year, Make, Modal", "where is my VIN?", "try '2022 Camry'"]

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  active: Set<QuickFilter>
  onToggle: (value: QuickFilter) => void
  onExport: () => void
  onOpenFilters: () => void
  activeAdvancedCount: number
}

export function FilterBar({ search, onSearchChange, active, onToggle, onExport, onOpenFilters, activeAdvancedCount }: FilterBarProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length), 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
      <div style={{ position: "relative", width: 250, flexShrink: 0 }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLOR.primary, display: "flex", pointerEvents: "none" }}>
          <Search size={16} />
        </div>
        <input
          aria-label="Search inventory"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            height: 38,
            padding: "0 12px 0 36px",
            border: `1px solid ${COLOR.borderSoft}`,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            color: COLOR.ink,
            background: "#fff",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        {!search && (
          <div style={{ position: "absolute", inset: "0 12px 0 36px", display: "flex", alignItems: "center", overflow: "hidden", pointerEvents: "none" }}>
            <span key={placeholderIndex} className="ph-scroll" style={{ fontSize: 13, color: "rgba(40,35,70,0.42)", whiteSpace: "nowrap" }}>
              {PLACEHOLDERS[placeholderIndex]}
            </span>
          </div>
        )}
      </div>

      {CHIPS.map((chip) => {
        const isActive = active.has(chip.value)
        return (
          <div
            key={chip.value}
            role="button"
            tabIndex={0}
            onClick={() => onToggle(chip.value)}
            onKeyDown={(e) => e.key === "Enter" && onToggle(chip.value)}
            style={{
              padding: "6px 13px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: `1px solid ${isActive ? COLOR.chipActiveBorder : COLOR.borderSoft}`,
              color: isActive ? COLOR.primary : COLOR.textSecondary,
              background: isActive ? COLOR.chipActiveBg : "#fff",
              transition: "0.16s",
            }}
          >
            {chip.label}
          </div>
        )
      })}

      <select
        style={{
          height: 38,
          padding: "0 10px",
          borderRadius: 10,
          border: `1px solid ${COLOR.borderSoft}`,
          background: "#fff",
          fontSize: 13,
          fontWeight: 600,
          color: COLOR.textSecondary,
        }}
        defaultValue=""
      >
        <option value="">Source</option>
        <option value="IMS">IMS</option>
        <option value="Website">Website</option>
        <option value="Marketplace">Marketplace</option>
      </select>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={onExport}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: 10,
            border: `1px solid ${COLOR.borderButton}`,
            background: "#fff",
            fontWeight: 700,
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: COLOR.ink,
            cursor: "pointer",
          }}
        >
          <Download size={15} />
          Export
        </button>
        <button
          type="button"
          onClick={onOpenFilters}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: 10,
            border: `1px solid ${activeAdvancedCount > 0 ? COLOR.chipActiveBorder : COLOR.borderButton}`,
            background: activeAdvancedCount > 0 ? COLOR.chipActiveBg : "#fff",
            fontWeight: 700,
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: activeAdvancedCount > 0 ? COLOR.primary : COLOR.ink,
            cursor: "pointer",
          }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeAdvancedCount > 0 && (
            <span style={{ background: COLOR.primary, color: "#fff", borderRadius: 999, fontSize: 10.5, fontWeight: 700, padding: "1px 6px" }}>
              {activeAdvancedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
