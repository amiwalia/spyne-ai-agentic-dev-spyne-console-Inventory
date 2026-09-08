"use client"

import { Camera, CheckCircle2, ImageOff, Megaphone, Radio, Tag, X } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { formatCurrency, formatMileage } from "@/lib/format"
import { COLOR } from "@/lib/tokens"

interface ActionRow {
  key: "noPhotos" | "needsPromotion" | "notLiveYet"
  label: string
  helper: string
  cta: string
  icon: typeof Camera
}

const ACTION_ROWS: ActionRow[] = [
  { key: "noPhotos", label: "No photos", helper: "Studio AI can generate a full 360° photo set from a phone walk-around.", cta: "Generate Photos", icon: Camera },
  { key: "needsPromotion", label: "Needs promotion", helper: "This unit is aging faster than its body type sells — boost it to marketplaces.", cta: "Boost Listing", icon: Megaphone },
  { key: "notLiveYet", label: "Not live yet", helper: "Listing is built but hasn't been published to the website or feeds.", cta: "Publish Listing", icon: Radio },
]

interface VehicleActionDrawerProps {
  vehicle: Vehicle | null
  onClose: () => void
  onResolve: (vehicleId: string, key: ActionRow["key"]) => void
  onAdjustPrice: (vehicleId: string) => void
}

export function VehicleActionDrawer({ vehicle, onClose, onResolve, onAdjustPrice }: VehicleActionDrawerProps) {
  if (!vehicle) return null

  const pendingRows = ACTION_ROWS.filter((row) => vehicle.needsAction[row.key])

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,16,35,0.35)", zIndex: 40 }} />
      <div
        className="spyne-animate-slide-in-right"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 400,
          background: "#fff",
          zIndex: 41,
          boxShadow: "-16px 0 40px -20px rgba(20,16,40,0.35)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${COLOR.borderShell}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: COLOR.ink }}>Vehicle actions</span>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", color: COLOR.textSecondary }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 88, height: 64, borderRadius: 10, background: "rgb(244,244,248)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {vehicle.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vehicle.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <ImageOff size={18} color="rgb(180,180,190)" />
              )}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: COLOR.ink }}>
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim ?? ""}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: COLOR.textSecondary }}>
                {vehicle.stockNumber} · {formatMileage(vehicle.mileage)}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 700, color: COLOR.ink }}>{formatCurrency(vehicle.price)}</p>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: COLOR.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {pendingRows.length > 0 ? `${pendingRows.length} action${pendingRows.length === 1 ? "" : "s"} needed` : "All merchandising tasks complete"}
            </p>

            {pendingRows.length === 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 10, background: "rgba(0,196,136,0.08)", color: "rgb(0,150,105)", fontSize: 13, fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                Nothing outstanding on this unit
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingRows.map((row) => (
                <div key={row.key} style={{ border: `1px solid ${COLOR.borderCard}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <row.icon size={15} color={COLOR.primary} />
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: COLOR.ink }}>{row.label}</span>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: "17px", color: COLOR.textSecondary }}>{row.helper}</p>
                  <button
                    type="button"
                    onClick={() => onResolve(vehicle.id, row.key)}
                    className="spyne-btn-primary"
                    style={{ fontSize: 12.5, height: 32 }}
                  >
                    {row.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, borderTop: `1px solid ${COLOR.divider}`, paddingTop: 16 }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: COLOR.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Other actions
            </p>
            <button
              type="button"
              onClick={() => onAdjustPrice(vehicle.id)}
              className="spyne-btn-secondary"
              style={{ width: "100%", justifyContent: "center", fontSize: 12.5 }}
            >
              <Tag size={14} />
              Reprice to clear faster
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
