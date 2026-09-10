import { describe, expect, it } from "vitest"
import { formatCurrency, formatListedAt, formatMileage } from "./format"

describe("formatCurrency", () => {
  it("formats whole dollars with no decimals and a thousands separator", () => {
    expect(formatCurrency(34900)).toBe("$34,900")
  })

  it("rounds off cents rather than showing them", () => {
    expect(formatCurrency(499.6)).toBe("$500")
  })

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0")
  })
})

describe("formatMileage", () => {
  it("appends 'miles' with a thousands separator", () => {
    expect(formatMileage(98230)).toBe("98,230 miles")
  })

  it("formats zero miles", () => {
    expect(formatMileage(0)).toBe("0 miles")
  })
})

describe("formatListedAt", () => {
  // vitest.config.ts pins TZ=UTC, so these ISO inputs map 1:1 to the values below.
  it("formats a morning timestamp with AM", () => {
    expect(formatListedAt("2026-09-01T08:30:00.000Z")).toBe("1 Sep '26, 8:30 AM")
  })

  it("formats an afternoon timestamp with PM", () => {
    expect(formatListedAt("2026-09-01T20:30:00.000Z")).toBe("1 Sep '26, 8:30 PM")
  })

  it("formats noon as 12 PM, not 0 PM", () => {
    expect(formatListedAt("2026-09-01T12:00:00.000Z")).toBe("1 Sep '26, 12:00 PM")
  })

  it("formats midnight as 12 AM, not 0 AM", () => {
    expect(formatListedAt("2026-09-01T00:00:00.000Z")).toBe("1 Sep '26, 12:00 AM")
  })

  it("pads single-digit minutes", () => {
    expect(formatListedAt("2026-09-01T08:05:00.000Z")).toBe("1 Sep '26, 8:05 AM")
  })
})
