import { describe, expect, it } from "vitest"
import {
  mapUatDocumentToVehicle,
  mapUatFacetsToFilterOptions,
  mapUatHoldingCost,
  mapUatPartnerIntegrationStatus,
  mapUatPhotoScore,
  mapUatScoreAttributesCount,
  mapUatTimeToMarket,
  mapUatVinDecode,
  type UatCentralConfigResponse,
  type UatDocument,
  type UatFiltersResponse,
  type UatPartnerIntegrationStatusResponse,
  type UatScoreAttributesCountResponse,
  type UatTimeToMarketResponse,
  type UatVehicleDetailResponse,
  type UatVinDecodeResponse,
} from "./uat-adapter"

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

function makeTtmResponse(overrides: Partial<UatTimeToMarketResponse["data"]> = {}): UatTimeToMarketResponse {
  return {
    message: "ok",
    data: {
      averageDelayInDays: 1.28,
      timeToMarketBuckets: {
        lessThan3Days: { vinCount: 4 },
        between3And6Days: { vinCount: 2 },
        moreThan6Days: { vinCount: 0 },
      },
      ...overrides,
    },
  }
}

describe("mapUatTimeToMarket", () => {
  it("maps the three buckets onto the app's TimeToMarketBucket labels, in order", () => {
    const ttm = mapUatTimeToMarket(makeTtmResponse())
    expect(ttm.buckets).toEqual([
      { label: "< 3 days", count: 4 },
      { label: "3–6 days", count: 2 },
      { label: "6+ days", count: 0 },
    ])
  })

  it("rounds averageDays to one decimal place", () => {
    const ttm = mapUatTimeToMarket(makeTtmResponse({ averageDelayInDays: 1.2837 }))
    expect(ttm.averageDays).toBe(1.3)
  })

  it("carries a whole-number average through unchanged", () => {
    const ttm = mapUatTimeToMarket(makeTtmResponse({ averageDelayInDays: 5 }))
    expect(ttm.averageDays).toBe(5)
  })
})

function makeDetailResponse(vehicleScore: UatVehicleDetailResponse["data"]["vehicleScore"]): UatVehicleDetailResponse {
  return { error: false, message: "ok", data: { dealerVinId: "d-1", vin: "VIN1", vehicleScore } }
}

describe("mapUatPhotoScore", () => {
  it("maps score, grade, and humanizes each action-item key into a label", () => {
    const result = mapUatPhotoScore(
      makeDetailResponse({
        actionItems: { OTHER_IMAGES: { actual: 0, target: 5 }, INCONSISTENT_BACKGROUND: {} },
        output: { score: 5, grade: "POOR" },
      }),
    )
    expect(result).toEqual({
      score: 5,
      grade: "POOR",
      issues: [
        { key: "OTHER_IMAGES", label: "Other Images", actual: 0, target: 5 },
        { key: "INCONSISTENT_BACKGROUND", label: "Inconsistent Background", actual: undefined, target: undefined },
      ],
    })
  })

  it("returns an empty issues list for a clean vehicle, not null", () => {
    const result = mapUatPhotoScore(makeDetailResponse({ actionItems: {}, output: { score: 9, grade: "GOOD" } }))
    expect(result).toEqual({ score: 9, grade: "GOOD", issues: [] })
  })

  it("returns null when the API has no score for this vehicle yet", () => {
    expect(mapUatPhotoScore(makeDetailResponse(undefined))).toBeNull()
    expect(mapUatPhotoScore(makeDetailResponse({}))).toBeNull()
  })

  it("does not drop an action-item key it doesn't recognize", () => {
    // Only OTHER_IMAGES/INCONSISTENT_BACKGROUND were ever observed live —
    // any other key the backend returns should still render, not vanish.
    const result = mapUatPhotoScore(
      makeDetailResponse({ actionItems: { SOME_NEW_ISSUE_TYPE: { actual: 1, target: 3 } }, output: { score: 6, grade: "POOR" } }),
    )
    expect(result?.issues).toEqual([{ key: "SOME_NEW_ISSUE_TYPE", label: "Some New Issue Type", actual: 1, target: 3 }])
  })
})

function makeScoreAttrsResponse(overrides: Partial<UatScoreAttributesCountResponse> = {}): UatScoreAttributesCountResponse {
  return {
    error: false,
    message: "ok",
    vehicleCount: { actionableCount: 1293 },
    attributesCount: [
      { attribute: "NO_PHOTOS", count: 1264 },
      { attribute: "CGI_PRESENT", count: 108 },
      { attribute: "INCOMPLETE_MEDIA", count: 100 },
    ],
    ...overrides,
  }
}

describe("mapUatScoreAttributesCount", () => {
  it("pulls noPhotosCount specifically from the NO_PHOTOS attribute", () => {
    const result = mapUatScoreAttributesCount(makeScoreAttrsResponse())
    expect(result.noPhotosCount).toBe(1264)
  })

  it("carries actionableCount through from vehicleCount", () => {
    const result = mapUatScoreAttributesCount(makeScoreAttrsResponse())
    expect(result.actionableCount).toBe(1293)
  })

  it("keeps every attribute in byAttribute, not just NO_PHOTOS", () => {
    const result = mapUatScoreAttributesCount(makeScoreAttrsResponse())
    expect(result.byAttribute).toEqual({ NO_PHOTOS: 1264, CGI_PRESENT: 108, INCOMPLETE_MEDIA: 100 })
  })

  it("defaults noPhotosCount to 0 when NO_PHOTOS is absent from the response", () => {
    const result = mapUatScoreAttributesCount(makeScoreAttrsResponse({ attributesCount: [{ attribute: "CGI_PRESENT", count: 5 }] }))
    expect(result.noPhotosCount).toBe(0)
  })

  it("defaults actionableCount to 0 when vehicleCount is missing", () => {
    const result = mapUatScoreAttributesCount(makeScoreAttrsResponse({ vehicleCount: undefined }))
    expect(result.actionableCount).toBe(0)
  })
})

describe("mapUatPartnerIntegrationStatus", () => {
  it("passes through the partner list as-is", () => {
    const res: UatPartnerIntegrationStatusResponse = {
      success: true,
      data: [
        { partnerId: "1", partnerName: "VAuto", partnerLogo: null, lastReceivedAt: "2026-09-03T10:45:16.465Z" },
        { partnerId: "2", partnerName: "Autograph/EVN", partnerLogo: "logo.png", lastReceivedAt: null },
      ],
    }
    expect(mapUatPartnerIntegrationStatus(res)).toEqual(res.data)
  })

  it("defaults to an empty array when data is missing", () => {
    expect(mapUatPartnerIntegrationStatus({ success: true, data: undefined as never })).toEqual([])
  })
})

function makeVinSnap(fields: Record<string, { value?: string | number | string[] }>): UatVinDecodeResponse {
  return { error: false, message: "ok", data: { vinData: { vehicleSnap: fields } } }
}

describe("mapUatVinDecode", () => {
  it("pulls year/make/model/trim/style/engine out of vehicleSnap", () => {
    const result = mapUatVinDecode(
      makeVinSnap({
        year: { value: 2003 },
        make: { value: "Honda" },
        model: { value: "Accord" },
        trim: { value: "EX V6 Coupe AT with Navigation System" },
        style: { value: "COUPE 2-DR" },
        engine: { value: "V6 SOHC 24V" },
      }),
    )
    expect(result).toEqual({
      year: 2003,
      make: "Honda",
      model: "Accord",
      trim: "EX V6 Coupe AT with Navigation System",
      style: "COUPE 2-DR",
      engine: "V6 SOHC 24V",
    })
  })

  it("returns null fields for blank strings rather than empty strings", () => {
    const result = mapUatVinDecode(makeVinSnap({ make: { value: "" }, model: { value: "  " } }))
    expect(result?.make).toBeNull()
    expect(result?.model).toBeNull()
  })

  it("returns null overall when there is no vinData at all", () => {
    expect(mapUatVinDecode({ error: false, data: undefined })).toBeNull()
    expect(mapUatVinDecode({ error: false, data: { vinData: undefined } })).toBeNull()
  })

  it("ignores array-valued fields like exteriorColor rather than throwing", () => {
    const result = mapUatVinDecode(makeVinSnap({ make: { value: "Honda" }, exteriorColor: { value: ["Red", "Blue"] } }))
    expect(result?.make).toBe("Honda")
  })
})

describe("mapUatHoldingCost", () => {
  it("reads holdingCost out of data.entityconfig", () => {
    const res: UatCentralConfigResponse = { success: true, data: { entityconfig: { holdingCost: 65 } } }
    expect(mapUatHoldingCost(res)).toBe(65)
  })

  it("returns 0 as a real, valid value rather than treating it as missing", () => {
    // The real rooftop this was built against actually had holdingCost: 0 —
    // falsy but meaningful, must not get coerced to null/default.
    const res: UatCentralConfigResponse = { success: true, data: { entityconfig: { holdingCost: 0 } } }
    expect(mapUatHoldingCost(res)).toBe(0)
  })

  it("returns null when entityconfig has no holdingCost at all", () => {
    expect(mapUatHoldingCost({ success: true, data: { entityconfig: {} } })).toBeNull()
    expect(mapUatHoldingCost({ success: true, data: {} })).toBeNull()
    expect(mapUatHoldingCost({ success: true })).toBeNull()
  })

  it("does not lose the other real config fields carried in the same response (documentation, not code under test)", () => {
    // entityconfig has more than holdingCost — vehicleType, sharedRooftops,
    // vin_live_check, firstTimeUserExperience. This adapter only reads
    // holdingCost, and the route only ever sends holdingCost back, which a
    // live POST test confirmed merges rather than replacing the rest.
    const res: UatCentralConfigResponse = {
      success: true,
      data: { entityconfig: { holdingCost: 50, firstTimeUserExperience: true, vehicleType: { new: true } } },
    }
    expect(mapUatHoldingCost(res)).toBe(50)
  })
})
