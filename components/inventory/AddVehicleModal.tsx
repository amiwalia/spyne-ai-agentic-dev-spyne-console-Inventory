"use client"

import { useState } from "react"
import { Loader2, X } from "lucide-react"
import type { Condition, Vehicle } from "@/lib/types"
import type { UatVinDecodeResult } from "@/lib/uat-adapter"
import { COLOR } from "@/lib/tokens"

interface AddVehicleModalProps {
  open: boolean
  onClose: () => void
  onAdd: (vehicle: Vehicle) => void
}

const BODY_TYPE_OPTIONS = ["Sedan", "SUV", "Truck", "Sport Coupe", "Minivan", "Crossover"]

/**
 * Best-effort mapping from the VIN decoder's free-text "style" field (e.g.
 * "COUPE 2-DR", "SPORT UTILITY") onto this app's fixed body-type taxonomy.
 * Not authoritative — the decoder's vocabulary won't always cleanly match
 * ours, so an unrecognized style is left for the dealer to set manually
 * rather than guessed at.
 */
export function styleToBodyType(style: string | null): string | null {
  if (!style) return null
  const s = style.toUpperCase()
  if (s.includes("COUPE")) return "Sport Coupe"
  if (s.includes("SUV") || s.includes("SPORT UTILITY")) return "SUV"
  if (s.includes("TRUCK") || s.includes("PICKUP")) return "Truck"
  if (s.includes("VAN")) return "Minivan"
  if (s.includes("CROSSOVER")) return "Crossover"
  if (s.includes("SEDAN")) return "Sedan"
  return null
}

const FIELD_STYLE: React.CSSProperties = {
  width: "100%",
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: `1px solid ${COLOR.borderSoft}`,
  fontSize: 13,
  fontFamily: "inherit",
  color: COLOR.ink,
  boxSizing: "border-box",
}

const LABEL_STYLE: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: COLOR.textSecondary, marginBottom: 5 }

export function AddVehicleModal({ open, onClose, onAdd }: AddVehicleModalProps) {
  const [year, setYear] = useState("2024")
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [stockNumber, setStockNumber] = useState("")
  const [vin, setVin] = useState("")
  const [mileage, setMileage] = useState("0")
  const [bodyType, setBodyType] = useState("Sedan")
  const [price, setPrice] = useState("")
  const [condition, setCondition] = useState<Condition>("pre-owned")
  const [decodeState, setDecodeState] = useState<{ status: "idle" | "loading" | "error"; message?: string }>({ status: "idle" })

  if (!open) return null

  const handleDecodeVin = () => {
    const trimmed = vin.trim()
    if (!trimmed) return
    setDecodeState({ status: "loading" })
    fetch(`/api/inventory/vin-decode?vin=${encodeURIComponent(trimmed)}`)
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as UatVinDecodeResult
      })
      .then((result) => {
        if (result.year) setYear(String(result.year))
        if (result.make) setMake(result.make)
        if (result.model) setModel(result.model)
        const mappedBodyType = styleToBodyType(result.style)
        if (mappedBodyType) setBodyType(mappedBodyType)
        setDecodeState({ status: "idle" })
      })
      .catch((err: Error) => {
        setDecodeState({ status: "error", message: err.message })
      })
  }

  const canSubmit = make.trim() && model.trim() && stockNumber.trim() && vin.trim() && price.trim()

  const handleSubmit = () => {
    if (!canSubmit) return
    const vehicle: Vehicle = {
      id: `v-${Date.now()}`,
      stockNumber: stockNumber.trim(),
      vin: vin.trim(),
      year: Number(year) || new Date().getFullYear(),
      make: make.trim(),
      model: model.trim(),
      mileage: Number(mileage) || 0,
      bodyType,
      photoUrl: null,
      price: Number(price) || 0,
      daysSupply: 0,
      daysSupplyStatus: "on_target",
      source: { channel: "IMS", detail: "DMS feed" },
      ageDays: 0,
      listedAt: new Date().toISOString(),
      holdingCost: 0,
      salesInquiries: 0,
      condition,
      needsAction: { noPhotos: true, needsPromotion: false, notLiveYet: true },
    }
    onAdd(vehicle)
    setMake("")
    setModel("")
    setStockNumber("")
    setVin("")
    setMileage("0")
    setPrice("")
    setDecodeState({ status: "idle" })
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(20,16,35,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          maxWidth: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 30px 70px -20px rgba(20,16,40,0.4)",
        }}
        className="spyne-animate-slide-up"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${COLOR.borderShell}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: COLOR.ink }}>Add vehicle</span>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", color: COLOR.textSecondary }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
            <div>
              <label style={LABEL_STYLE}>Year</label>
              <input style={FIELD_STYLE} value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div>
              <label style={LABEL_STYLE}>Make</label>
              <input style={FIELD_STYLE} value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={LABEL_STYLE}>Model</label>
              <input style={FIELD_STYLE} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" />
            </div>
            <div>
              <label style={LABEL_STYLE}>Body type</label>
              <select style={FIELD_STYLE} value={bodyType} onChange={(e) => setBodyType(e.target.value)}>
                {BODY_TYPE_OPTIONS.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={LABEL_STYLE}>Stock #</label>
              <input style={FIELD_STYLE} value={stockNumber} onChange={(e) => setStockNumber(e.target.value)} placeholder="STK-2200" />
            </div>
            <div>
              <label style={LABEL_STYLE}>VIN</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...FIELD_STYLE, flex: 1 }}
                  value={vin}
                  onChange={(e) => {
                    setVin(e.target.value)
                    if (decodeState.status === "error") setDecodeState({ status: "idle" })
                  }}
                  placeholder="VIN..."
                />
                <button
                  type="button"
                  onClick={handleDecodeVin}
                  disabled={!vin.trim() || decodeState.status === "loading"}
                  style={{
                    flexShrink: 0,
                    height: 38,
                    padding: "0 12px",
                    borderRadius: 10,
                    border: `1px solid ${COLOR.borderSoft}`,
                    background: "#fff",
                    color: COLOR.primary,
                    fontWeight: 700,
                    fontSize: 12.5,
                    fontFamily: "inherit",
                    cursor: !vin.trim() || decodeState.status === "loading" ? "not-allowed" : "pointer",
                    opacity: !vin.trim() ? 0.5 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {decodeState.status === "loading" && <Loader2 size={13} className="spyne-spin" />}
                  Decode
                </button>
              </div>
              {decodeState.status === "error" && (
                <p style={{ margin: "5px 0 0", fontSize: 11.5, fontWeight: 600, color: "rgb(192,38,26)" }}>{decodeState.message}</p>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={LABEL_STYLE}>Mileage</label>
              <input style={FIELD_STYLE} value={mileage} onChange={(e) => setMileage(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label style={LABEL_STYLE}>Price ($)</label>
              <input style={FIELD_STYLE} value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" placeholder="24999" />
            </div>
          </div>

          <div>
            <label style={LABEL_STYLE}>Condition</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["new", "pre-owned"] as Condition[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 10,
                    border: `1px solid ${condition === c ? COLOR.chipActiveBorder : COLOR.borderSoft}`,
                    background: condition === c ? COLOR.chipActiveBg : "#fff",
                    color: condition === c ? COLOR.primary : COLOR.textSecondary,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button type="button" disabled={!canSubmit} onClick={handleSubmit} className="spyne-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 6, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}>
            Add to inventory
          </button>
        </div>
      </div>
    </div>
  )
}
