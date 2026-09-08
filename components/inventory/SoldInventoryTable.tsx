"use client"

import { ArrowRight, ImageOff } from "lucide-react"
import type { SoldVehicle } from "@/lib/types"
import { formatCurrency, formatListedAt } from "@/lib/format"
import { COLOR, SHADOW } from "@/lib/tokens"

const GRID_COLUMNS = "2.4fr 1.2fr 1fr 1.2fr 1.2fr 150px"
const COLUMNS = ["Vehicle", "Type", "Sold Price", "Buyer Source", "Sold", "Action"]

export function SoldInventoryTable({ vehicles }: { vehicles: SoldVehicle[] }) {
  return (
    <div
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${COLOR.borderTable}`,
        borderRadius: 22,
        boxShadow: SHADOW.table,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: GRID_COLUMNS, padding: "0 24px 0 20px", height: 48, alignItems: "center", borderBottom: `1px solid ${COLOR.borderSofter}` }}>
        {COLUMNS.map((col) => (
          <span key={col} style={{ fontSize: 11.5, fontWeight: 700, color: COLOR.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
            {col}
          </span>
        ))}
      </div>

      {vehicles.map((v) => (
        <div key={v.id} style={{ display: "grid", gridTemplateColumns: GRID_COLUMNS, padding: "16px 24px 16px 20px", alignItems: "center", borderBottom: `1px solid ${COLOR.borderSofterer}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, paddingRight: 24 }}>
            <div style={{ width: 76, height: 56, borderRadius: 10, background: "rgb(244,244,248)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {v.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <ImageOff size={16} color="rgb(180,180,190)" />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: COLOR.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {v.year} {v.make} {v.model} {v.trim ?? ""}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "rgb(153,170,170)" }}>
                {v.stockNumber} · {v.vin}
              </p>
            </div>
          </div>
          <div style={{ fontSize: 13.5, color: COLOR.ink }}>{v.bodyType}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.ink }}>{formatCurrency(v.soldPrice)}</div>
          <div>
            <span style={{ display: "inline-flex", padding: "5px 13px", borderRadius: 9, background: COLOR.badgeBg, color: COLOR.textSecondary, fontSize: 13, fontWeight: 700 }}>
              {v.buyerSource.channel}
            </span>
            <p style={{ margin: "5px 0 0", fontSize: 11.5, color: "rgb(153,170,170)" }}>{v.buyerSource.detail}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13.5, color: COLOR.ink }}>{v.daysToSell} days to sell</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgb(153,170,170)" }}>{formatListedAt(v.soldAt)}</p>
          </div>
          <div>
            <button
              type="button"
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
                color: COLOR.primary,
                cursor: "pointer",
              }}
            >
              View Deal
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
