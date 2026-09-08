"use client"

import { ArrowRight, CheckCircle2, Download, ExternalLink, Flame, ImageOff, TrendingDown, TrendingUp } from "lucide-react"
import type { DaysSupplyStatus, Vehicle } from "@/lib/types"
import { formatCurrency, formatListedAt, formatMileage } from "@/lib/format"
import { isHighDemand } from "@/lib/mock-data"
import { COLOR, GRADIENT } from "@/lib/tokens"

const GRID_COLUMNS = "36px 2.6fr 1.6fr 1fr 1fr 1fr 150px"
const CAPTION = "rgb(153,170,170)"

function holdingSeverityPct(cost: number): number {
  return Math.min(100, Math.max(10, Math.round((cost / 4000) * 100)))
}

const SUPPLY_STATUS_META: Record<DaysSupplyStatus, { label: string; bg: string; text: string; icon: typeof TrendingUp }> = {
  overstocked: { label: "Overstocked", bg: "rgb(253,236,234)", text: "rgb(192,38,26)", icon: TrendingDown },
  understocked: { label: "Short Supply", bg: "rgb(234,240,253)", text: "rgb(37,84,214)", icon: TrendingUp },
  on_target: { label: "On Target", bg: "rgb(231,247,239)", text: "rgb(10,124,74)", icon: CheckCircle2 },
}

function SupplyStatusBadge({ status }: { status: DaysSupplyStatus }) {
  const meta = SUPPLY_STATUS_META[status]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px 3px 7px",
        borderRadius: 999,
        background: meta.bg,
        color: meta.text,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <meta.icon size={11} />
      {meta.label}
    </span>
  )
}

function HighDemandTag() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px 3px 7px",
        borderRadius: 999,
        background: "rgb(255,244,229)",
        color: "rgb(178,94,0)",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <Flame size={11} />
      High Demand
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

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0, paddingRight: 32 }}>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: COLOR.ink }}>{vehicle.bodyType}</p>
        <p style={{ margin: 0, fontSize: 11, color: CAPTION }}>{vehicle.daysSupply}d supply</p>
        {highDemand ? <HighDemandTag /> : <SupplyStatusBadge status={vehicle.daysSupplyStatus} />}
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
