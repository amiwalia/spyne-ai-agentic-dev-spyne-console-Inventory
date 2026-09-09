"use client"

import { useState } from "react"
import { ArrowRight, Download, ExternalLink, Flame, ImageOff } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { formatCurrency, formatListedAt, formatMileage } from "@/lib/format"
import { isHighDemand } from "@/lib/mock-data"
import { COLOR, GRADIENT } from "@/lib/tokens"

const GRID_COLUMNS = "36px 2.6fr 1fr 1fr 1fr 150px"
const CAPTION = "rgb(153,170,170)"

function holdingSeverityPct(cost: number): number {
  return Math.min(100, Math.max(10, Math.round((cost / 4000) * 100)))
}

function HighDemandBadge({ salesInquiries }: { salesInquiries: number }) {
  const [hover, setHover] = useState(false)

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        top: -6,
        left: -6,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "rgb(178,94,0)",
        border: "2px solid #fff",
        boxShadow: "0 1px 3px rgba(20,16,40,0.25)",
        cursor: "default",
        zIndex: 1,
      }}
    >
      <Flame size={11} color="#fff" />
      {hover && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 20,
            width: 188,
            padding: "8px 10px",
            borderRadius: 8,
            background: "rgb(21,19,28)",
            color: "#fff",
            fontSize: 11.5,
            fontWeight: 500,
            lineHeight: 1.4,
            whiteSpace: "normal",
            boxShadow: "0 8px 20px -6px rgba(20,16,40,0.4)",
          }}
        >
          <span style={{ display: "block", fontWeight: 700, marginBottom: 2 }}>High Demand</span>
          {salesInquiries} sales {salesInquiries === 1 ? "inquiry" : "inquiries"} logged in the last 14 days.
        </span>
      )}
    </span>
  )
}

interface VehicleRowProps {
  vehicle: Vehicle
  selected: boolean
  onToggle: () => void
  onTakeAction: () => void
}

export function VehicleRow({ vehicle, selected, onToggle, onTakeAction }: VehicleRowProps) {
  const highDemand = isHighDemand(vehicle)

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: GRID_COLUMNS,
        padding: "18px 24px 18px 20px",
        minHeight: 84,
        alignItems: "start",
        boxSizing: "border-box",
        borderBottom: `1px solid ${COLOR.borderSofterer}`,
      }}
    >
      <div
        onClick={onToggle}
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: `1.5px solid ${selected ? COLOR.primary : "rgba(40,35,70,0.22)"}`,
          background: selected ? COLOR.primary : "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {selected && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0, paddingRight: 12 }}>
        <div style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}>
          <div style={{ width: 76, height: 56, borderRadius: 10, background: "rgb(244,244,248)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {vehicle.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vehicle.photoUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: "rgb(180,180,190)" }}>
                <ImageOff size={16} />
                <span style={{ fontSize: 8.5, fontWeight: 600 }}>No photos</span>
              </div>
            )}
          </div>
          <div style={{ position: "absolute", left: 4, right: 4, bottom: 4, display: "flex", justifyContent: "center", gap: 4 }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Download size={10} color="#fff" />
            </span>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ExternalLink size={10} color="#fff" />
            </span>
          </div>
          {highDemand && <HighDemandBadge salesInquiries={vehicle.salesInquiries} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: COLOR.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim ?? ""}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: 11.5, color: CAPTION }}>
            {vehicle.stockNumber} · {vehicle.vin}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: CAPTION }}>{formatMileage(vehicle.mileage)}</p>
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.ink }}>{formatCurrency(vehicle.price)}</div>

      <div>
        <p style={{ margin: 0, fontSize: 13.5, color: COLOR.ink }}>{vehicle.ageDays} days</p>
        <p style={{ margin: "3px 0 0", fontSize: 11, color: CAPTION }}>{formatListedAt(vehicle.listedAt)}</p>
      </div>

      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.dangerText }}>{formatCurrency(vehicle.holdingCost)}</div>
        <div style={{ height: 5, borderRadius: 4, background: "rgba(40,35,70,0.08)", margin: "7px 0 0", width: 90, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${holdingSeverityPct(vehicle.holdingCost)}%`, borderRadius: 4, background: GRADIENT.holdingBar }} />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onTakeAction}
          style={{
            height: 38,
            boxSizing: "border-box",
            padding: "0 14px",
            borderRadius: 10,
            border: `1px solid ${COLOR.borderButton}`,
            background: "#fff",
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: COLOR.primary,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Take Action
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
