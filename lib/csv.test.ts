import { describe, expect, it } from "vitest"
import { vehiclesToCsv } from "./csv"
import { makeVehicle } from "./test-fixtures"

describe("vehiclesToCsv", () => {
  it("writes a header row followed by one row per vehicle", () => {
    const csv = vehiclesToCsv([makeVehicle({ stockNumber: "S1" }), makeVehicle({ stockNumber: "S2" })])
    const lines = csv.split("\n")
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe("Stock #,VIN,Year,Make,Model,Price,Days Supply,Source,Age (days),Holding Cost")
  })

  it("includes each vehicle's stock number, price, and holding cost", () => {
    const v = makeVehicle({ stockNumber: "S42", price: 30000, holdingCost: 450 })
    const csv = vehiclesToCsv([v])
    const dataRow = csv.split("\n")[1]
    expect(dataRow).toContain("S42")
    expect(dataRow).toContain("30000")
    expect(dataRow).toContain("450")
  })

  it("returns just the header for an empty list", () => {
    const csv = vehiclesToCsv([])
    expect(csv.split("\n")).toHaveLength(1)
  })
})
