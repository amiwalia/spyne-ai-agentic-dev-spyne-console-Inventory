"use client"

import { useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { getSegmentBreakdown } from "@/lib/mock-data"
import { COLOR } from "@/lib/tokens"
import { SupplyStatusBadge } from "./SupplyStatusBadge"

export function DaysSupplySegmentPopover({ vehicles }: { vehicles: Vehicle[] }) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const open = pos !== null
  const segments = getSegmentBreakdown(vehicles)

  const handleOpen = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = 340
    setPos({ top: rect.bottom + 8, left: Math.min(rect.left, window.innerWidth - width - 16), width })
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setPos(null) : handleOpen())}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          border: "none",
          background: "none",
          cursor: "pointer",
          padding: 0,
          fontSize: 12.5,
          fontWeight: 700,
          color: COLOR.primary,
        }}
      >
        View by segment
        <ChevronRight size={13} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
      </button>

      {open && (
        <>
          <div onClick={() => setPos(null)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
          <div
            className="spyne-animate-slide-up"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 61,
              background: "#fff",
              borderRadius: 14,
              border: `1px solid ${COLOR.borderCard}`,
              boxShadow: "rgba(20,16,40,0.25) 0px 20px 44px -18px",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${COLOR.borderSofter}` }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: COLOR.ink }}>Days Supply by Segment</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {segments.map((seg) => (
                <div
                  key={seg.bodyType}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: `1px solid ${COLOR.borderSofterer}` }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLOR.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{seg.bodyType}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: COLOR.textMuted }}>{seg.vehicleCount} vehicle{seg.vehicleCount === 1 ? "" : "s"}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLOR.ink, flexShrink: 0 }}>{seg.avgDaysSupply}d</span>
                  <div style={{ flexShrink: 0 }}>
                    <SupplyStatusBadge status={seg.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
