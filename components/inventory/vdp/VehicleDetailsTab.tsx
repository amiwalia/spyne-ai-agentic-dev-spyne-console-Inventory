"use client"

import { useState } from "react"
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
  const [values, setValues] = useState<Record<string, string>>(() => buildInitialValues(vehicle))

  const yearOptions = Array.from({ length: 6 }, (_, i) => String(vehicle.year - i))
  const sections = buildSections(yearOptions)

  const onChange = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }))

  return (
    <div style={{ paddingBottom: 4 }}>
      {sections.map((section, i) => (
        <div key={section.title} style={i === 0 ? undefined : { marginTop: 24, paddingTop: 22, borderTop: `1px solid ${COLOR.borderSofter}` }}>
          <h3 style={{ margin: "0 0 0", fontSize: 14, fontWeight: 600, color: COLOR.ink, letterSpacing: -0.1 }}>{section.title}</h3>
          <FieldsGrid fields={section.fields} values={values} onChange={onChange} />
        </div>
      ))}
    </div>
  )
}
