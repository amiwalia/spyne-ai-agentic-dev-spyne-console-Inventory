import type { Vehicle } from "./types"

let counter = 0

/** A fully-valid Vehicle with sane defaults, overridable per test. Never uses
 * Date.now()/Math.random() — callers pass any time-dependent fields explicitly. */
export function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  counter += 1
  return {
    id: `test-v-${counter}`,
    stockNumber: `TEST-${counter}`,
    vin: `VINTEST${counter.toString().padStart(10, "0")}`,
    year: 2023,
    make: "TestMake",
    model: "TestModel",
    mileage: 20000,
    bodyType: "Sedan",
    photoUrl: null,
    price: 25000,
    daysSupply: 40,
    daysSupplyStatus: "on_target",
    source: { channel: "IMS", detail: "DMS feed" },
    ageDays: 10,
    listedAt: "2026-08-01T00:00:00.000Z",
    holdingCost: 300,
    salesInquiries: 1,
    condition: "pre-owned",
    needsAction: { noPhotos: false, needsPromotion: false, notLiveYet: false },
    ...overrides,
  }
}
