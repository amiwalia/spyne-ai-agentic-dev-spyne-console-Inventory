"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { Condition, Vehicle } from "@/lib/types"
import { COLOR } from "@/lib/tokens"

interface AddVehicleModalProps {
  open: boolean
  onClose: () => void
  onAdd: (vehicle: Vehicle) => void
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
  const [bodyType, setBodyType] = useState("Midsize Sedan")
  const [price, setPrice] = useState("")
  const [condition, setCondition] = useState<Condition>("pre-owned")

  if (!open) return null

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
                {["Compact Sedan", "Midsize Sedan", "Full-size Sedan", "Compact SUV", "Midsize SUV", "Full-size SUV", "Full-size Truck", "Sport Coupe", "Minivan", "Crossover"].map((bt) => (
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
              <input style={FIELD_STYLE} value={vin} onChange={(e) => setVin(e.target.value)} placeholder="VIN..." />
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
