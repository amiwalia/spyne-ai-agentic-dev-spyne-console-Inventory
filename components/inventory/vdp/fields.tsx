"use client"

import type { CSSProperties } from "react"
import { ChevronDown } from "lucide-react"
import { COLOR } from "@/lib/tokens"

export type FieldDef =
  | { type: "text"; label: string; key: string }
  | { type: "combo"; label: string; key: string; codeKey: string }
  | { type: "comboSelect"; label: string; key: string; unitKey: string; unitOptions: string[] }
  | { type: "select"; label: string; key: string; options: string[] }

export interface FieldSection {
  title: string
  fields: FieldDef[]
}

export const STD_OPT_NA = ["Std.", "Opt.", "N/A"]

function t(label: string, key: string): FieldDef {
  return { type: "text", label, key }
}
function combo(label: string, key: string, codeKey: string): FieldDef {
  return { type: "combo", label, key, codeKey }
}
function comboSelect(label: string, key: string, unitKey: string, unitOptions: string[]): FieldDef {
  return { type: "comboSelect", label, key, unitKey, unitOptions }
}
function sel(label: string, key: string, options: string[]): FieldDef {
  return { type: "select", label, key, options }
}

const TOGGLE_FIELDS_SAFETY = [
  "ABS Brakes",
  "Driver Airbag",
  "Passenger Airbag",
  "Front Side Airbag",
  "Side Head Curtain Airbag",
  "Traction Control",
  "Vehicle Stability Control",
  "Tire Pressure Monitor",
  "Daytime Running Lights",
  "Child Safety Door Locks",
  "Rear Wiper",
  "Fog Lights",
  "Vehicle Anti-Theft System",
  "Rain-Sensing Wipers",
  "Automatic Headlights",
]

const TOGGLE_FIELDS_COMFORT = [
  "Air Conditioning",
  "Cruise Control",
  "Power Windows",
  "Power Door Locks",
  "Keyless Entry",
  "Remote Ignition",
  "Navigation System",
  "Telematics System",
  "Leather Seat",
  "Front Heated Seat",
  "Front Cooled Seat",
  "Heated Steering Wheel",
  "Power Sunroof",
  "Alloy Wheels",
  "Running Boards",
]

function keyOf(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_")
}

export function buildSections(yearOptions: string[]): FieldSection[] {
  return [
    {
      title: "Details",
      fields: [
        combo("Exterior Color", "exteriorColor", "exteriorColorCode"),
        combo("Interior Trim", "interiorTrim", "interiorColorCode"),
        comboSelect("Mileage", "mileage", "mileageUnit", ["Miles", "Kilometres"]),
        t("Transmission Short", "transmissionShort"),
        t("Engine", "engine"),
        t("Trim", "trim"),
        t("Driveline", "driveline"),
        t("Fuel", "fuel"),
        sel("Disposition", "disposition", ["Demo", "Retail", "Wholesale", "Loaner"]),
        t("Style", "style"),
        sel("Year", "year", yearOptions),
        t("Price", "price"),
        t("Make", "make"),
        t("Model", "model"),
        sel("Stock Status", "stockStatus", ["In stock", "In transit", "On order", "Sold"]),
        t("Owner", "owner"),
        t("Insurance Date", "insuranceDate"),
        t("Category", "category"),
        t("Segment", "segment"),
        t("CC", "cc"),
        t("Chassis No.", "chassisNo"),
        t("Website URL", "websiteUrl"),
      ],
    },
    {
      title: "Engine & drivetrain",
      fields: [
        t("Transmission Long", "transmissionLong"),
        t("Displacement / cylinders", "displacement"),
        t("4WD / AWD", "driveType"),
        t("Mileage — city / highway", "mileageCityHwy"),
        t("Seating — std / opt", "seating"),
        t("Doors", "doors"),
        t("Made In", "madeIn"),
        t("Production Sequence No.", "productionSeqNo"),
      ],
    },
    {
      title: "Dimensions & capacity",
      fields: [
        t("Length", "length"),
        t("Width", "width"),
        t("Height", "height"),
        t("Wheelbase", "wheelbase"),
        t("Track — front / rear", "trackFrontRear"),
        t("Ground Clearance", "groundClearance"),
        t("Turning Diameter", "turningDiameter"),
        t("Fuel Tank", "fuelTank"),
        t("Cargo Volume", "cargoVolume"),
        t("Passenger Volume", "passengerVolume"),
        t("GVWR — max / std", "gvwr"),
        t("Curb Weight", "curbWeight"),
        t("Payload — max / std", "payload"),
        t("Towing — max / std", "towing"),
        t("Legroom — front / rear", "legroom"),
        t("Headroom — front / rear", "headroom"),
        t("Shoulder room — front / rear", "shoulderRoom"),
      ],
    },
    {
      title: "Factory pricing & warranty",
      fields: [
        t("MSRP", "msrp"),
        t("Invoice", "invoice"),
        t("Destination Charge", "destinationCharge"),
        t("Cost Price", "costPrice"),
        t("Basic warranty — distance / duration", "basicWarranty"),
        t("Powertrain — distance / duration", "powertrainWarranty"),
        t("Corrosion — distance / duration", "corrosionWarranty"),
        t("Stock Number", "stockNumber"),
        t("Purchase Type", "purchaseType"),
      ],
    },
    {
      title: "Safety & security",
      fields: TOGGLE_FIELDS_SAFETY.map((label) => sel(label, keyOf(label), STD_OPT_NA)),
    },
    {
      title: "Comfort & convenience",
      fields: TOGGLE_FIELDS_COMFORT.map((label) => sel(label, keyOf(label), STD_OPT_NA)),
    },
  ]
}

const fieldsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "26px 22px",
  marginTop: 14,
}

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 7,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(40,35,70,0.55)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}

const inputStyle: CSSProperties = {
  width: "100%",
  height: 40,
  boxSizing: "border-box",
  border: `1px solid ${COLOR.borderSoft}`,
  borderRadius: 10,
  padding: "0 12px",
  fontSize: 13.5,
  fontWeight: 500,
  color: COLOR.ink,
  background: "#fff",
  fontFamily: "inherit",
}

const bareInputStyle: CSSProperties = {
  border: "none",
  outline: "none",
  padding: "0 12px",
  fontSize: 13.5,
  fontWeight: 500,
  color: COLOR.ink,
  background: "transparent",
  height: 38,
  fontFamily: "inherit",
  minWidth: 0,
}

function SelectChevron() {
  return (
    <ChevronDown
      size={14}
      style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}
    />
  )
}

export function FieldsGrid({
  fields,
  values,
  onChange,
}: {
  fields: FieldDef[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
}) {
  return (
    <div style={fieldsGridStyle}>
      {fields.map((field) => (
        <label key={field.key} style={{ display: "block", minWidth: 0 }}>
          <span style={labelStyle}>{field.label}</span>

          {field.type === "text" && (
            <input style={inputStyle} type="text" value={values[field.key] ?? ""} onChange={(e) => onChange(field.key, e.target.value)} />
          )}

          {field.type === "combo" && (
            <span style={{ display: "flex", height: 40, border: `1px solid ${COLOR.borderSoft}`, borderRadius: 10, background: "#fff" }}>
              <input
                style={{ ...bareInputStyle, flex: 1 }}
                aria-label={field.label}
                type="text"
                value={values[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
              <span style={{ width: 1, height: 22, alignSelf: "center", background: COLOR.borderSoft, flexShrink: 0 }} />
              <input
                style={{ ...bareInputStyle, width: 108, flexShrink: 0 }}
                aria-label={`${field.label} Code`}
                value={values[field.codeKey] ?? ""}
                onChange={(e) => onChange(field.codeKey, e.target.value)}
              />
            </span>
          )}

          {field.type === "comboSelect" && (
            <span style={{ display: "flex", height: 40, border: `1px solid ${COLOR.borderSoft}`, borderRadius: 10, background: "#fff" }}>
              <input
                style={{ ...bareInputStyle, flex: 1 }}
                inputMode="numeric"
                aria-label={field.label}
                type="text"
                value={values[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
              <span style={{ width: 1, height: 22, alignSelf: "center", background: COLOR.borderSoft, flexShrink: 0 }} />
              <span style={{ position: "relative", width: 118, flexShrink: 0, height: "100%" }}>
                <select
                  style={{ ...bareInputStyle, width: "100%", appearance: "none" }}
                  aria-label={`${field.label} unit`}
                  value={values[field.unitKey] ?? field.unitOptions[0]}
                  onChange={(e) => onChange(field.unitKey, e.target.value)}
                >
                  {field.unitOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </span>
            </span>
          )}

          {field.type === "select" && (
            <span style={{ position: "relative" }}>
              <select style={{ ...inputStyle, appearance: "none" }} value={values[field.key] ?? field.options[0]} onChange={(e) => onChange(field.key, e.target.value)}>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </span>
          )}
        </label>
      ))}
    </div>
  )
}
