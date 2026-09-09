"use client"

import { useState } from "react"
import { ChevronDown, ImageOff } from "lucide-react"
import type { SegmentDaysSupply, Vehicle } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { COLOR, SHADOW } from "@/lib/tokens"
import { SupplyStatusBadge } from "./SupplyStatusBadge"

interface SegmentAccordionProps {
  segments: SegmentDaysSupply[]
  vehicles: Vehicle[]
}

export function SegmentAccordion({ segments, vehicles }: SegmentAccordionProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (bodyType: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(bodyType) ? next.delete(bodyType) : next.add(bodyType)
      return next
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {segments.map((seg) => {
        const isOpen = expanded.has(seg.bodyType)
        const segVehicles = vehicles.filter((v) => v.bodyType === seg.bodyType)

        return (
          <div
            key={seg.bodyType}
            style={{
              background: "#fff",
              border: `1px solid ${COLOR.borderCard}`,
              borderRadius: 16,
              boxShadow: SHADOW.card,
              overflow: "hidden",
            }}
          >
            <div
              onClick={() => toggle(seg.bodyType)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && toggle(seg.bodyType)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer", userSelect: "none" }}
            >
              <ChevronDown
                size={17}
                color={COLOR.textMuted}
                style={{ transform: isOpen ? "none" : "rotate(-90deg)", transition: "transform 0.15s", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLOR.ink }}>{seg.bodyType}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLOR.textMuted }}>
                  {seg.vehicleCount} vehicle{seg.vehicleCount === 1 ? "" : "s"} · click to view vehicle details
                </p>
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, color: COLOR.ink, flexShrink: 0 }}>{seg.avgDaysSupply}d</span>
              <div style={{ flexShrink: 0 }}>
                <SupplyStatusBadge status={seg.status} />
              </div>
            </div>

            {isOpen && (
              <div style={{ borderTop: `1px solid ${COLOR.borderSofter}` }}>
                {segVehicles.map((v) => (
                  <div
                    key={v.id}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px 12px 51px", borderBottom: `1px solid ${COLOR.borderSofterer}` }}
                  >
                    <div
                      style={{
                        width: 58,
                        height: 42,
                        borderRadius: 8,
                        background: "rgb(244,244,248)",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {v.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <ImageOff size={14} color="rgb(180,180,190)" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: COLOR.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {v.year} {v.make} {v.model} {v.trim ?? ""}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgb(153,170,170)" }}>
                        {v.stockNumber} · {v.vin}
                      </p>
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: COLOR.ink, width: 88, flexShrink: 0 }}>{formatCurrency(v.price)}</span>
                    <span style={{ fontSize: 12.5, color: COLOR.textSecondary, width: 72, flexShrink: 0 }}>{v.daysSupply}d supply</span>
                    <span style={{ fontSize: 12.5, color: COLOR.textSecondary, width: 62, flexShrink: 0 }}>{v.ageDays}d age</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgb(192,38,26)", width: 84, flexShrink: 0, textAlign: "right" }}>
                      {formatCurrency(v.holdingCost)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
