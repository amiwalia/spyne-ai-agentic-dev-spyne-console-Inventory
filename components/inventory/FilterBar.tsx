"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Download, Search, SlidersHorizontal } from "lucide-react"
import { COLOR } from "@/lib/tokens"

export type QuickFilter = "aging60" | "aging40" | "aging30" | "noPhotos" | "overstocked" | "needsPromotion" | "notLiveYet" | "highDemand" | "needsPriceReview"

const CHIPS: { value: QuickFilter; label: string }[] = [
  { value: "aging60", label: "Aging 60+" },
  { value: "aging40", label: "Aging 40+" },
  { value: "noPhotos", label: "No photos" },
  { value: "overstocked", label: "Overstocked" },
]

const PLACEHOLDERS = ["Search any VIN from Spyne", "Search by Year, Make, Modal", "Enter a VIN or Stock#", "where is my VIN?"]

export const PRESET_QUERIES = [
  "Active and aging past 30 days",
  "Needs a price review",
  "Not published",
  "Waiting on a reply",
  "Ready for Studio Instant",
  "Sourced from Marketplace",
]

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  active: Set<QuickFilter>
  onToggle: (value: QuickFilter) => void
  onExport: () => void
  onOpenFilters: () => void
  activeAdvancedCount: number
  onSelectPreset: (query: string) => void
}

export function FilterBar({ search, onSearchChange, active, onToggle, onExport, onOpenFilters, activeAdvancedCount, onSelectPreset }: FilterBarProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showPresets, setShowPresets] = useState(false)

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
          onFocus={() => setShowPresets(true)}
          onBlur={() => setTimeout(() => setShowPresets(false), 150)}
          style={{
            width: "100%",
            height: 38,
            padding: "0 12px 0 36px",
            border: `1px solid ${showPresets ? COLOR.primary : COLOR.borderSoft}`,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            color: COLOR.ink,
            background: "#fff",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
            boxShadow: showPresets ? `0 0 0 3px color-mix(in srgb, ${COLOR.primary} 14%, transparent)` : "none",
          }}
        />
        {!search && (
          <div style={{ position: "absolute", inset: "0 12px 0 36px", display: "flex", alignItems: "center", overflow: "hidden", pointerEvents: "none" }}>
            <span key={placeholderIndex} className="ph-scroll" style={{ fontSize: 13, color: "rgba(40,35,70,0.42)", whiteSpace: "nowrap" }}>
              {PLACEHOLDERS[placeholderIndex]}
            </span>
          </div>
        )}

        {showPresets && (
          <div
            className="spyne-animate-slide-up"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              width: 260,
              zIndex: 50,
              background: "#fff",
              borderRadius: 12,
              border: `1px solid ${COLOR.borderSoft}`,
              boxShadow: "rgba(20,16,40,0.18) 0px 16px 34px -14px",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "10px 14px 6px", fontSize: 11, fontWeight: 700, color: COLOR.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Try Asking
            </div>
            {PRESET_QUERIES.map((query) => (
              <button
                key={query}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectPreset(query)
                  setShowPresets(false)
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  border: "none",
                  borderTop: `1px solid ${COLOR.borderSofter}`,
                  background: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  color: COLOR.ink,
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLOR.pageBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {query}
              </button>
            ))}
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

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <Link
          href="/sold-inventory"
          style={{
            height: 38,
            boxSizing: "border-box",
            padding: "0 14px",
            borderRadius: 10,
            border: `1px solid ${COLOR.borderButton}`,
            background: "#fff",
            fontWeight: 700,
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: COLOR.primary,
            textDecoration: "none",
          }}
        >
          View Sold Inventory
          <ArrowRight size={15} />
        </Link>
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
