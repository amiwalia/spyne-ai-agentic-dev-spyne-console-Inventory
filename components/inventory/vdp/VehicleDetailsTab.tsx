"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { COLOR } from "@/lib/tokens"
import { buildSections, FieldsGrid, STD_OPT_NA } from "./fields"

function buildInitialValues(v: Vehicle): Record<string, string> {
  const values: Record<string, string> = {
    exteriorColor: v.exteriorColor ?? "",
    interiorTrim: v.interiorTrim ?? "",
    mileage: String(v.mileage),
    mileageUnit: "Miles",
    trim: v.trim ?? "",
    disposition: "Retail",
    style: "",
    year: String(v.year),
    price: String(v.price),
    make: v.make,
    model: v.model,
    stockStatus: "In stock",
    category: v.bodyType,
    segment: v.bodyType,
    chassisNo: v.vin,
    msrp: String(v.price),
    stockNumber: v.stockNumber,
    purchaseType: v.source.channel === "IMS" ? "Trade-in" : "Purchase",
  }
  // Safety & security / Comfort & convenience toggles default to "Std." so the
  // form reads as populated, matching the reference's fully-filled spec sheet.
  const TOGGLE_KEYS = [
    "abs_brakes", "driver_airbag", "passenger_airbag", "front_side_airbag", "side_head_curtain_airbag",
    "traction_control", "vehicle_stability_control", "tire_pressure_monitor", "daytime_running_lights",
    "child_safety_door_locks", "rear_wiper", "fog_lights", "vehicle_anti_theft_system", "rain_sensing_wipers",
    "automatic_headlights", "air_conditioning", "cruise_control", "power_windows", "power_door_locks",
    "keyless_entry", "remote_ignition", "navigation_system", "telematics_system", "leather_seat",
    "front_heated_seat", "front_cooled_seat", "heated_steering_wheel", "power_sunroof", "alloy_wheels", "running_boards",
  ]
  TOGGLE_KEYS.forEach((k) => (values[k] = STD_OPT_NA[0]))
  return values
}

export function VehicleDetailsTab({ vehicle }: { vehicle: Vehicle }) {
  const [savedValues, setSavedValues] = useState<Record<string, string>>(() => buildInitialValues(vehicle))
  const [values, setValues] = useState<Record<string, string>>(savedValues)

  const yearOptions = Array.from({ length: 6 }, (_, i) => String(vehicle.year - i))
  const sections = buildSections(yearOptions)

  const onChange = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }))

  const changedCount = Object.keys(values).filter((key) => values[key] !== savedValues[key]).length
  const isDirty = changedCount > 0

  const handleCancel = () => setValues(savedValues)
  const handleSave = () => setSavedValues(values)

  return (
    <div style={{ paddingBottom: isDirty ? 0 : 4 }}>
      {sections.map((section, i) => (
        <div key={section.title} style={i === 0 ? undefined : { marginTop: 24, paddingTop: 22, borderTop: `1px solid ${COLOR.borderSofter}` }}>
          <h3 style={{ margin: "0 0 0", fontSize: 14, fontWeight: 600, color: COLOR.ink, letterSpacing: -0.1 }}>{section.title}</h3>
          <FieldsGrid fields={section.fields} values={values} onChange={onChange} />
        </div>
      ))}

      {isDirty && (
        <div style={{ position: "sticky", bottom: 16, display: "flex", justifyContent: "center", paddingTop: 24, pointerEvents: "none" }}>
          <div
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 14,
              height: 52,
              padding: "0 10px 0 16px",
              borderRadius: 16,
              background: "rgb(24,22,30)",
              boxShadow: "rgba(20,16,40,0.12) 0px 4px 10px, rgba(20,16,40,0.28) 0px 14px 30px -10px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.14)",
                flexShrink: 0,
              }}
            >
              <Check size={13} color="#fff" strokeWidth={2.5} />
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
              {changedCount} {changedCount === 1 ? "change" : "changes"}
            </span>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                height: 36,
                padding: "0 16px",
                border: "none",
                borderRadius: 10,
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.85)",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                height: 36,
                padding: "0 18px",
                border: "none",
                borderRadius: 10,
                background: COLOR.primary,
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
