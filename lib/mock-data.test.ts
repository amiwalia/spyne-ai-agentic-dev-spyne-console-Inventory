import { describe, expect, it } from "vitest"
import {
  VEHICLES,
  SOLD_VEHICLES,
  getSegmentBreakdown,
  getDaysSupplyBreakdown,
  getTimeToMarketBuckets,
  getHoldingCostBuckets,
  needsAnyAction,
  HIGH_DEMAND_THRESHOLD,
  isHighDemand,
  getDemandSignal,
  totalDaysSupply,
  totalTimeToMarket,
  totalHoldingCost,
  getTrendSeries,
  PRICING_AGE_THRESHOLD,
  getPricingInsight,
} from "./mock-data"
import { makeVehicle } from "./test-fixtures"
import type { Vehicle } from "./types"

const ALLOWED_BODY_TYPES = new Set(["SUV", "Sedan", "Truck", "Sport Coupe", "Crossover", "Minivan"])
const VALID_STATUSES = new Set(["on_target", "overstocked", "understocked"])

describe("mock data integrity", () => {
  it("every vehicle has a unique id, VIN, and stock number", () => {
    expect(new Set(VEHICLES.map((v) => v.id)).size).toBe(VEHICLES.length)
    expect(new Set(VEHICLES.map((v) => v.vin)).size).toBe(VEHICLES.length)
    expect(new Set(VEHICLES.map((v) => v.stockNumber)).size).toBe(VEHICLES.length)
  })

  it("every sold vehicle has a unique id and VIN", () => {
    expect(new Set(SOLD_VEHICLES.map((v) => v.id)).size).toBe(SOLD_VEHICLES.length)
    expect(new Set(SOLD_VEHICLES.map((v) => v.vin)).size).toBe(SOLD_VEHICLES.length)
  })

  it("every vehicle's bodyType is one of the consolidated top-level categories", () => {
    // Regression guard: an earlier version split these into Midsize/Compact/
    // Full-size tiers, which the segments page was explicitly changed to stop
    // showing. A granular value sneaking back in would silently re-fragment it.
    for (const v of VEHICLES) {
      expect(ALLOWED_BODY_TYPES.has(v.bodyType), `unexpected bodyType "${v.bodyType}" on ${v.id}`).toBe(true)
    }
  })

  it("every vehicle's daysSupplyStatus is a valid enum value", () => {
    for (const v of VEHICLES) {
      expect(VALID_STATUSES.has(v.daysSupplyStatus), `invalid status "${v.daysSupplyStatus}" on ${v.id}`).toBe(true)
    }
  })

  it("every vehicle's condition is new or pre-owned", () => {
    for (const v of VEHICLES) {
      expect(["new", "pre-owned"]).toContain(v.condition)
    }
  })
})

describe("getSegmentBreakdown", () => {
  it("segment vehicle counts sum to the total input", () => {
    const segments = getSegmentBreakdown(VEHICLES)
    const total = segments.reduce((sum, s) => sum + s.vehicleCount, 0)
    expect(total).toBe(VEHICLES.length)
  })

  it("each segment's vehicleCount matches an actual filter of that body type", () => {
    const segments = getSegmentBreakdown(VEHICLES)
    for (const seg of segments) {
      const actual = VEHICLES.filter((v) => v.bodyType === seg.bodyType).length
      expect(seg.vehicleCount).toBe(actual)
    }
  })

  it("avgDaysSupply is the rounded mean of the segment's vehicles", () => {
    const segments = getSegmentBreakdown(VEHICLES)
    for (const seg of segments) {
      const vehiclesInSegment = VEHICLES.filter((v) => v.bodyType === seg.bodyType)
      const expected = Math.round(vehiclesInSegment.reduce((s, v) => s + v.daysSupply, 0) / vehiclesInSegment.length)
      expect(seg.avgDaysSupply).toBe(expected)
    }
  })

  it("a tie between on_target and understocked resolves to understocked, not on_target", () => {
    // Regression test for the real bug this session: a plain count-sort with
    // no tie-breaker kept insertion order, so a 1-1 split silently defaulted
    // to on_target and hid a real short-supply segment (Sport Coupe).
    const tied: Vehicle[] = [
      makeVehicle({ bodyType: "Wagon", daysSupplyStatus: "on_target", daysSupply: 30 }),
      makeVehicle({ bodyType: "Wagon", daysSupplyStatus: "understocked", daysSupply: 10 }),
    ]
    const [segment] = getSegmentBreakdown(tied)
    expect(segment.status).toBe("understocked")
  })

  it("a tie between on_target and overstocked resolves to overstocked, not on_target", () => {
    const tied: Vehicle[] = [
      makeVehicle({ bodyType: "Wagon", daysSupplyStatus: "on_target", daysSupply: 30 }),
      makeVehicle({ bodyType: "Wagon", daysSupplyStatus: "overstocked", daysSupply: 80 }),
    ]
    const [segment] = getSegmentBreakdown(tied)
    expect(segment.status).toBe("overstocked")
  })

  it("a clear on_target majority still wins on_target", () => {
    const mostlyFine: Vehicle[] = [
      makeVehicle({ bodyType: "Wagon", daysSupplyStatus: "on_target" }),
      makeVehicle({ bodyType: "Wagon", daysSupplyStatus: "on_target" }),
      makeVehicle({ bodyType: "Wagon", daysSupplyStatus: "understocked" }),
    ]
    const [segment] = getSegmentBreakdown(mostlyFine)
    expect(segment.status).toBe("on_target")
  })

  it("sorts overstocked segments before understocked, before on_target", () => {
    const segments = getSegmentBreakdown(VEHICLES)
    const statusOrder = segments.map((s) => s.status)
    const firstUnderstocked = statusOrder.indexOf("understocked")
    const firstOnTarget = statusOrder.indexOf("on_target")
    const lastOverstocked = statusOrder.lastIndexOf("overstocked")
    if (firstUnderstocked !== -1 && lastOverstocked !== -1) {
      expect(lastOverstocked).toBeLessThan(firstUnderstocked)
    }
    if (firstOnTarget !== -1 && firstUnderstocked !== -1) {
      expect(firstUnderstocked).toBeLessThan(firstOnTarget)
    }
  })
})

describe("getDaysSupplyBreakdown", () => {
  it("on_target and overstocked type counts sum to the number of distinct body types", () => {
    const breakdown = getDaysSupplyBreakdown(VEHICLES)
    const distinctBodyTypes = new Set(VEHICLES.map((v) => v.bodyType)).size
    const totalTypes = breakdown.reduce((sum, entry) => sum + entry.typeCount, 0)
    expect(totalTypes).toBe(distinctBodyTypes)
  })

  it("a body type is only bucketed overstocked when overstocked strictly outnumbers the rest combined", () => {
    // Distinct from getSegmentBreakdown's tie-break on purpose — this is the
    // KPI card's two-bucket legend, which intentionally treats a tie as
    // "not overstocked" rather than flagging it. Guards against the two
    // implementations silently converging or diverging unintentionally.
    const tied: Vehicle[] = [
      makeVehicle({ bodyType: "Wagon", daysSupplyStatus: "on_target" }),
      makeVehicle({ bodyType: "Wagon", daysSupplyStatus: "overstocked" }),
    ]
    const breakdown = getDaysSupplyBreakdown(tied)
    const onTargetEntry = breakdown.find((e) => e.status === "on_target")!
    expect(onTargetEntry.bodyTypes.map((b) => b.name)).toContain("Wagon")
  })
})

describe("getTimeToMarketBuckets", () => {
  it("buckets ageDays at the documented boundaries: <3 / 3-6 / 6+", () => {
    const vehicles = [2, 3, 6, 7].map((ageDays) => makeVehicle({ ageDays }))
    const buckets = getTimeToMarketBuckets(vehicles)
    expect(buckets.find((b) => b.label === "< 3 days")!.count).toBe(1) // ageDays=2
    expect(buckets.find((b) => b.label === "3–6 days")!.count).toBe(2) // ageDays=3,6
    expect(buckets.find((b) => b.label === "6+ days")!.count).toBe(1) // ageDays=7
  })

  it("counts sum to the total vehicle count", () => {
    const buckets = getTimeToMarketBuckets(VEHICLES)
    expect(buckets.reduce((sum, b) => sum + b.count, 0)).toBe(VEHICLES.length)
  })
})

describe("getHoldingCostBuckets", () => {
  it("buckets holdingCost at the documented boundaries: <$500 / $500-1000 / >$1000", () => {
    const vehicles = [499, 500, 1000, 1001].map((holdingCost) => makeVehicle({ holdingCost }))
    const buckets = getHoldingCostBuckets(vehicles)
    expect(buckets.find((b) => b.label === "< $500")!.count).toBe(1) // 499
    expect(buckets.find((b) => b.label === "$500 – $1,000")!.count).toBe(2) // 500, 1000
    expect(buckets.find((b) => b.label === "> $1,000")!.count).toBe(1) // 1001
  })

  it("counts sum to the total vehicle count", () => {
    const buckets = getHoldingCostBuckets(VEHICLES)
    expect(buckets.reduce((sum, b) => sum + b.count, 0)).toBe(VEHICLES.length)
  })
})

describe("isHighDemand", () => {
  it("is false just under the threshold and true at the threshold", () => {
    const justUnder = makeVehicle({ salesInquiries: HIGH_DEMAND_THRESHOLD - 1 })
    const atThreshold = makeVehicle({ salesInquiries: HIGH_DEMAND_THRESHOLD })
    expect(isHighDemand(justUnder)).toBe(false)
    expect(isHighDemand(atThreshold)).toBe(true)
  })
})

describe("needsAnyAction", () => {
  it("is false when every flag is false", () => {
    const clean = makeVehicle({ needsAction: { noPhotos: false, needsPromotion: false, notLiveYet: false } })
    expect(needsAnyAction(clean)).toBe(false)
  })

  it("is true when any single flag is true", () => {
    const oneFlag = makeVehicle({ needsAction: { noPhotos: false, needsPromotion: true, notLiveYet: false } })
    expect(needsAnyAction(oneFlag)).toBe(true)
  })
})

describe("totals", () => {
  it("return 0 for an empty vehicle list instead of NaN", () => {
    expect(totalDaysSupply([])).toBe(0)
    expect(totalTimeToMarket([])).toBe(0)
    expect(totalHoldingCost([])).toBe(0)
  })

  it("totalDaysSupply is the rounded mean of daysSupply", () => {
    const vehicles = [10, 20, 45].map((daysSupply) => makeVehicle({ daysSupply }))
    expect(totalDaysSupply(vehicles)).toBe(25) // round(75/3)
  })

  it("totalHoldingCost is the sum of holdingCost, not an average", () => {
    const vehicles = [100, 200, 300].map((holdingCost) => makeVehicle({ holdingCost }))
    expect(totalHoldingCost(vehicles)).toBe(600)
  })
})

describe("getTrendSeries", () => {
  it("is deterministic for the same inputs", () => {
    const a = getTrendSeries(50, "down")
    const b = getTrendSeries(50, "down")
    expect(a).toEqual(b)
  })

  it("always returns 7 points ending at the current value", () => {
    const { points } = getTrendSeries(80, "up")
    expect(points).toHaveLength(7)
    expect(points[6]).toBe(80)
  })

  it("never returns a negative point", () => {
    const { points } = getTrendSeries(2, "down")
    for (const p of points) expect(p).toBeGreaterThanOrEqual(0)
  })
})

describe("getPricingInsight", () => {
  it("is deterministic for the same vehicle", () => {
    const vehicle = makeVehicle({ stockNumber: "STK-DETERMINISTIC", ageDays: 45 })
    expect(getPricingInsight(vehicle)).toEqual(getPricingInsight(vehicle))
  })

  it("never recommends a price change for a unit younger than the aging threshold", () => {
    const fresh = makeVehicle({ ageDays: PRICING_AGE_THRESHOLD - 1 })
    expect(getPricingInsight(fresh).recommendation).toBeNull()
  })

  it("recommends a lower price for an aged unit", () => {
    const aged = makeVehicle({ ageDays: PRICING_AGE_THRESHOLD + 15, price: 30000 })
    const insight = getPricingInsight(aged)
    expect(insight.recommendation).not.toBeNull()
    expect(insight.recommendation!.suggestedPrice).toBeLessThan(aged.price)
    expect(insight.recommendation!.deltaAmount).toBe(aged.price - insight.recommendation!.suggestedPrice)
  })

  it("always returns exactly three radii, at 30/50/100 miles", () => {
    const { radii } = getPricingInsight(makeVehicle())
    expect(radii.map((r) => r.radiusMiles)).toEqual([30, 50, 100])
  })
})

describe("getDemandSignal", () => {
  it("scales page views and CTA clicks with salesInquiries", () => {
    const low = getDemandSignal(makeVehicle({ salesInquiries: 0 }))
    const high = getDemandSignal(makeVehicle({ salesInquiries: 8 }))
    expect(high.page.pageViews).toBeGreaterThan(low.page.pageViews)
    expect(high.clicks.ctaClicks).toBeGreaterThan(low.clicks.ctaClicks)
  })

  it("flags exit intent only for low-engagement visits", () => {
    expect(getDemandSignal(makeVehicle({ salesInquiries: 0 })).page.exitIntent).toBe(true)
    expect(getDemandSignal(makeVehicle({ salesInquiries: 5 })).page.exitIntent).toBe(false)
  })
})
