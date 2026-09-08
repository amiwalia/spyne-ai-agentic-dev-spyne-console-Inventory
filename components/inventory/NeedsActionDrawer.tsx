"use client"

import { useState } from "react"
import { AlertTriangle, ChevronRight, Flame, ImageOff, Megaphone, Radio, TrendingDown, X } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { isHighDemand } from "@/lib/mock-data"
import type { QuickFilter } from "./FilterBar"

interface Row {
  label: string
  count: number
  icon: typeof ImageOff
  filter: QuickFilter
}

interface NeedsActionDrawerProps {
  vehicles: Vehicle[]
  onSelectFilter: (filter: QuickFilter) => void
}

const RED = "rgb(211,0,0)"

export function NeedsActionDrawer({ vehicles, onSelectFilter }: NeedsActionDrawerProps) {
  const [open, setOpen] = useState(false)

  const rows: Row[] = [
    { label: "No Photos", count: vehicles.filter((v) => v.needsAction.noPhotos).length, icon: ImageOff, filter: "noPhotos" },
    { label: "High Demand Vehicles", count: vehicles.filter(isHighDemand).length, icon: Flame, filter: "highDemand" },
    { label: "Not Live Yet", count: vehicles.filter((v) => v.needsAction.notLiveYet).length, icon: Radio, filter: "notLiveYet" },
    { label: "Overstocked", count: vehicles.filter((v) => v.daysSupplyStatus === "overstocked").length, icon: TrendingDown, filter: "overstocked" },
    { label: "Needs Promotion", count: vehicles.filter((v) => v.needsAction.needsPromotion).length, icon: Megaphone, filter: "needsPromotion" },
  ]

  const total = vehicles.filter(
    (v) => v.needsAction.noPhotos || v.needsAction.needsPromotion || v.needsAction.notLiveYet || v.daysSupplyStatus === "overstocked" || isHighDemand(v)
  ).length

  return (
    <>
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", justifyContent: "flex-end", alignItems: "flex-end", pointerEvents: "none" }}>
          <div
            className="spyne-animate-slide-up"
            style={{
              position: "relative",
              width: 360,
              maxWidth: "94%",
              margin: "20px 20px 20px 0",
              maxHeight: "calc(100% - 40px)",
              overflowY: "auto",
              pointerEvents: "auto",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              padding: "24px 16px 16px",
              borderRadius: 20,
              background: "rgb(246,244,244)",
              boxShadow: "rgba(19,16,28,0.15) 0px 7px 24px 0px",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 20,
                overflow: "hidden",
                pointerEvents: "none",
                backgroundImage:
                  "radial-gradient(130px 95px at 272px -6px, rgba(211,0,0,0.2), rgba(211,0,0,0) 72%), radial-gradient(95px 72px at 197px 8px, rgba(211,0,0,0.14), rgba(211,0,0,0) 70%), radial-gradient(160px 130px at 292px 100%, rgba(116,141,234,0.45), rgba(116,141,234,0) 72%)",
              }}
            />

            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              style={{ position: "absolute", top: 20, right: 16, zIndex: 3, width: 32, height: 32, padding: 0, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={20} color="rgba(40,35,70,0.34)" />
            </button>

            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ position: "relative", width: 8, height: 8, display: "inline-flex" }}>
                  <span style={{ position: "absolute", inset: -3, borderRadius: 100, border: `1.5px solid ${RED}` }} />
                  <span style={{ width: 8, height: 8, borderRadius: 100, background: RED, display: "inline-block" }} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "rgb(98,111,129)" }}>Need Action</span>
              </div>
              <p style={{ margin: 0, color: RED, whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 24, fontWeight: 700 }}>{total} </span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>Vehicles</span>
              </p>
            </div>

            <div style={{ position: "relative", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20, padding: "16px 15px", borderRadius: 16, background: "#fff" }}>
              {rows.map((row) => (
                <div
                  key={row.label}
                  onClick={() => {
                    onSelectFilter(row.filter)
                    setOpen(false)
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 10, height: 20, width: "100%", cursor: "pointer" }}
                >
                  <div style={{ flex: "1 0 0px", minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <row.icon size={17} color="#636363" strokeWidth={1.6} />
                    <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "16px", color: "rgb(3,7,18)", whiteSpace: "nowrap" }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "rgb(89,79,79)", whiteSpace: "nowrap" }}>{row.count}</span>
                  <ChevronRight size={13} color="#8D8D8D" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 28,
          right: 32,
          zIndex: 25,
          border: "none",
          borderRadius: 999,
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, rgb(255,106,99) 0%, rgb(252,71,71) 55%, rgb(231,50,47) 100%)",
          boxShadow: "rgba(231,50,47,0.55) 0px 10px 30px -8px, rgba(255,255,255,0.2) 0px 1px 0px inset",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", padding: 10 }}>
          <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 999, background: "rgba(255,255,255,0.2)", flexShrink: 0 }}>
            <AlertTriangle size={17} color="#fff" style={{ opacity: 0.9 }} />
          </span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "10px 18px 10px 0" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{total} Vehicles</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.75)", letterSpacing: -0.1 }}>Need Actions</span>
        </span>
      </button>
    </>
  )
}
