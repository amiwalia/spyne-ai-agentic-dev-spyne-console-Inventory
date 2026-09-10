import { describe, expect, it } from "vitest"
import { mapUatDocumentToVehicle, mapUatFacetsToFilterOptions, type UatDocument, type UatFiltersResponse } from "./uat-adapter"

const NOW = new Date("2026-09-10T12:00:00.000Z").getTime()
const DAY = 86_400_000

function makeDoc(overrides: Partial<UatDocument> = {}): UatDocument {
  return {
    id: "doc-1",
    dealerVinId: "dealer-vin-1",
    stockNumber: "",
    vin: "DUMMYVIN123456",
    year: 2024,
    make: "Toyota",
    model: "Camry",
    trim: "XSE",
    price: 25000,
    car_ownership: "used",
    liveOnWeb: false,
    sold: false,
    car_type: "",
    styles: "",
    thumbnail_output_url: "",
    thumbnail_input_url: "",
    isImages: false,
    input_image_count: 0,
    lead_count: 0,
    ageDateEpoch: NOW - 10 * DAY,
    creationEpoch: NOW - 10 * DAY,
    ...overrides,
  }
}

describe("mapUatDocumentToVehicle", () => {
  it("maps the core identity and pricing fields directly", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ vin: "ABC123", year: 2023, make: "Honda", model: "Accord", price: 31000 }), 50, NOW)
    expect(v.vin).toBe("ABC123")
    expect(v.year).toBe(2023)
    expect(v.make).toBe("Honda")
    expect(v.model).toBe("Accord")
    expect(v.price).toBe(31000)
  })

  it("falls back to dealerVinId when stockNumber is blank", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ stockNumber: "  ", dealerVinId: "fallback-id" }), 50, NOW)
    expect(v.stockNumber).toBe("fallback-id")
  })

  it("uses the real stockNumber when present", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ stockNumber: "STK-999" }), 50, NOW)
    expect(v.stockNumber).toBe("STK-999")
  })

  it("falls back bodyType to Unspecified when both car_type and styles are blank", () => {
    // The real UAT dataset has this blank on most records today — this is a
    // known gap, not a mapping bug, and the fallback should read as such.
    const v = mapUatDocumentToVehicle(makeDoc({ car_type: "", styles: "" }), 50, NOW)
    expect(v.bodyType).toBe("Unspecified")
  })

  it("prefers car_type over styles when both are present", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ car_type: "SUV", styles: "Sedan" }), 50, NOW)
    expect(v.bodyType).toBe("SUV")
  })

  it("reads mileage from odometer.value, not the formatted mileage string", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ odometer: { value: 42000, unit: "miles" } }), 50, NOW)
    expect(v.mileage).toBe(42000)
  })

  it("defaults mileage to 0 when odometer is absent", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ odometer: undefined }), 50, NOW)
    expect(v.mileage).toBe(0)
  })

  it("prefers thumbnail_output_url, falls back to thumbnail_input_url, then null", () => {
    expect(mapUatDocumentToVehicle(makeDoc({ thumbnail_output_url: "out.jpg", thumbnail_input_url: "in.jpg" }), 50, NOW).photoUrl).toBe("out.jpg")
    expect(mapUatDocumentToVehicle(makeDoc({ thumbnail_output_url: "", thumbnail_input_url: "in.jpg" }), 50, NOW).photoUrl).toBe("in.jpg")
    expect(mapUatDocumentToVehicle(makeDoc({ thumbnail_output_url: "", thumbnail_input_url: "" }), 50, NOW).photoUrl).toBeNull()
  })

  it("maps car_ownership to condition, defaulting anything but 'new' to pre-owned", () => {
    expect(mapUatDocumentToVehicle(makeDoc({ car_ownership: "new" }), 50, NOW).condition).toBe("new")
    expect(mapUatDocumentToVehicle(makeDoc({ car_ownership: "used" }), 50, NOW).condition).toBe("pre-owned")
    expect(mapUatDocumentToVehicle(makeDoc({ car_ownership: "" }), 50, NOW).condition).toBe("pre-owned")
  })

  it("maps liveOnWeb to needsAction.notLiveYet, inverted", () => {
    expect(mapUatDocumentToVehicle(makeDoc({ liveOnWeb: true }), 50, NOW).needsAction.notLiveYet).toBe(false)
    expect(mapUatDocumentToVehicle(makeDoc({ liveOnWeb: false }), 50, NOW).needsAction.notLiveYet).toBe(true)
  })

  it("flags noPhotos when isImages is false or there are zero uploaded images", () => {
    expect(mapUatDocumentToVehicle(makeDoc({ isImages: false, input_image_count: 5 }), 50, NOW).needsAction.noPhotos).toBe(true)
    expect(mapUatDocumentToVehicle(makeDoc({ isImages: true, input_image_count: 0 }), 50, NOW).needsAction.noPhotos).toBe(true)
    expect(mapUatDocumentToVehicle(makeDoc({ isImages: true, input_image_count: 5 }), 50, NOW).needsAction.noPhotos).toBe(false)
  })

  it("carries lead_count through as salesInquiries", () => {
    expect(mapUatDocumentToVehicle(makeDoc({ lead_count: 7 }), 50, NOW).salesInquiries).toBe(7)
  })

  it("computes ageDays from ageDateEpoch against the passed-in now", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ ageDateEpoch: NOW - 15 * DAY }), 50, NOW)
    expect(v.ageDays).toBe(15)
  })

  it("falls back to creationEpoch when ageDateEpoch is missing", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ ageDateEpoch: 0, creationEpoch: NOW - 4 * DAY }), 50, NOW)
    expect(v.ageDays).toBe(4)
  })

  it("never returns a negative ageDays for a future timestamp", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ ageDateEpoch: NOW + 5 * DAY }), 50, NOW)
    expect(v.ageDays).toBe(0)
  })

  it("computes holdingCost as ageDays times the passed-in rate", () => {
    const v = mapUatDocumentToVehicle(makeDoc({ ageDateEpoch: NOW - 8 * DAY }), 60, NOW)
    expect(v.holdingCost).toBe(8 * 60)
  })

  it("buckets the ageDays-based daysSupplyStatus at the documented PRD thresholds", () => {
    // Placeholder metric (see PRD: real days-supply is segment-level, not
    // per-vehicle) — but it should at least honor the thresholds we agreed on.
    expect(mapUatDocumentToVehicle(makeDoc({ ageDateEpoch: NOW - 10 * DAY }), 50, NOW).daysSupplyStatus).toBe("understocked")
    expect(mapUatDocumentToVehicle(makeDoc({ ageDateEpoch: NOW - 45 * DAY }), 50, NOW).daysSupplyStatus).toBe("on_target")
    expect(mapUatDocumentToVehicle(makeDoc({ ageDateEpoch: NOW - 60 * DAY }), 50, NOW).daysSupplyStatus).toBe("overstocked")
  })
})

function makeFiltersResponse(data: UatFiltersResponse["data"]): UatFiltersResponse {
  return { success: true, message: "ok", data }
}

describe("mapUatFacetsToFilterOptions", () => {
  it("lowercases make/model values but keeps the real label casing", () => {
    const res = makeFiltersResponse({
      makes: { label: "MAKE", options: [{ key: "toyota", label: "Toyota", count: 768 }] },
      models: { label: "MODEL", options: [{ key: "camry", label: "Camry", count: 385 }] },
    })
    const opts = mapUatFacetsToFilterOptions(res)
    expect(opts.makes).toEqual([{ value: "toyota", label: "Toyota", count: 768 }])
    expect(opts.models).toEqual([{ value: "camry", label: "Camry", count: 385 }])
  })

  it("converts year keys from strings to numbers", () => {
    const res = makeFiltersResponse({
      years: { label: "YEAR", options: [{ key: "2023", label: "2023", count: 653 }] },
    })
    const opts = mapUatFacetsToFilterOptions(res)
    expect(opts.years).toEqual([{ value: 2023, label: "2023", count: 653 }])
  })

  it("drops a year option whose key isn't a valid number", () => {
    const res = makeFiltersResponse({
      years: { label: "YEAR", options: [{ key: "unknown", label: "Unknown", count: 4 }] },
    })
    expect(mapUatFacetsToFilterOptions(res).years).toEqual([])
  })

  it("reads price and odometer bounds from the range facet's single option", () => {
    const res = makeFiltersResponse({
      priceRange: { label: "PRICE RANGE", type: "range", options: [{ key: "priceRange", label: "Price Range", min: 0, max: 84728724 }] },
      odometerRange: { label: "ODOMETER RANGE", type: "range", options: [{ key: "odometerRange", label: "Odometer Range", min: 0, max: 29478656 }] },
    })
    const opts = mapUatFacetsToFilterOptions(res)
    expect(opts.priceBounds).toEqual({ min: 0, max: 84728724 })
    expect(opts.odometerBounds).toEqual({ min: 0, max: 29478656 })
  })

  it("defaults every facet to an empty/zeroed shape when the data object is bare", () => {
    const opts = mapUatFacetsToFilterOptions(makeFiltersResponse({}))
    expect(opts).toEqual({
      makes: [],
      models: [],
      years: [],
      priceBounds: { min: 0, max: 0 },
      odometerBounds: { min: 0, max: 0 },
    })
  })
})
