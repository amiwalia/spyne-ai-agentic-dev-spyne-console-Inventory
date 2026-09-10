import type { Vehicle } from "./types"

/** Shape of one `document` inside `/inventory/v2/list`'s `vinResp[]`, limited
 * to the fields this adapter actually reads. The real payload has many more. */
export interface UatDocument {
  id: string
  dealerVinId: string
  stockNumber: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  price: number
  car_ownership: string
  liveOnWeb: boolean
  sold: boolean
  car_type: string
  styles: string
  thumbnail_output_url: string
  thumbnail_input_url: string
  isImages: boolean
  input_image_count: number
  odometer?: { value: number; unit: string }
  lead_count: number
  ageDateEpoch: number
  creationEpoch: number
  exterior_colour?: unknown[]
  interior_colour?: unknown[]
}

export interface UatListResponse {
  vinResp: { document: UatDocument }[]
  totalVinsCount: number
  enterpriseTeamVinsCount: number
  currencyConfig?: { currencyCode: string; currencySign: string }
}

const MS_PER_DAY = 86_400_000

function firstColorName(list: unknown[] | undefined): string | undefined {
  const first = list?.[0]
  if (typeof first === "string") return first
  if (first && typeof first === "object" && "name" in first) {
    const name = (first as { name: unknown }).name
    return typeof name === "string" ? name : undefined
  }
  return undefined
}

/**
 * Maps one UAT `/inventory/v2/list` document into the app's Vehicle shape.
 *
 * Several Vehicle fields have no real source in this endpoint yet and are
 * clearly-labeled placeholders rather than invented data:
 *  - bodyType falls back to "Unspecified" when car_type/styles are blank,
 *    which is common in this dataset — the Segments view will show a large
 *    Unspecified bucket until the real field is populated upstream.
 *  - daysSupply/daysSupplyStatus reuse ageDays against the thresholds
 *    documented in the PRD (40-50 on target, <40 short, >50 overstocked).
 *    This is NOT real days-supply — that's a segment-level sell-through
 *    calculation this endpoint doesn't provide (see PRD "days supply at
 *    vehicle vs rooftop level"). It's a placeholder so the UI has *something*
 *    directionally reasonable to show, not a claim of accuracy.
 *  - source.channel/detail and needsAction.needsPromotion have no mapped
 *    field at all and are fixed defaults.
 *
 * `nowMs` and `holdingCostPerDay` are passed in rather than read internally,
 * so this stays a pure function — easy to unit test, and safe to call from a
 * server request handler without any client/server clock disagreement.
 */
export function mapUatDocumentToVehicle(doc: UatDocument, holdingCostPerDay: number, nowMs: number): Vehicle {
  const ageEpoch = doc.ageDateEpoch || doc.creationEpoch
  const ageDays = Math.max(0, Math.floor((nowMs - ageEpoch) / MS_PER_DAY))
  const daysSupplyStatus = ageDays < 40 ? "understocked" : ageDays > 50 ? "overstocked" : "on_target"

  return {
    id: doc.id,
    stockNumber: doc.stockNumber?.trim() || doc.dealerVinId,
    vin: doc.vin,
    year: doc.year,
    make: doc.make,
    model: doc.model,
    trim: doc.trim || undefined,
    mileage: doc.odometer?.value ?? 0,
    bodyType: doc.car_type?.trim() || doc.styles?.trim() || "Unspecified",
    exteriorColor: firstColorName(doc.exterior_colour),
    interiorTrim: firstColorName(doc.interior_colour),
    photoUrl: doc.thumbnail_output_url || doc.thumbnail_input_url || null,
    price: doc.price,
    daysSupply: ageDays,
    daysSupplyStatus,
    source: { channel: "IMS", detail: "Studio OS sync" },
    ageDays,
    listedAt: new Date(ageEpoch).toISOString(),
    holdingCost: ageDays * holdingCostPerDay,
    salesInquiries: doc.lead_count ?? 0,
    condition: doc.car_ownership === "new" ? "new" : "pre-owned",
    needsAction: {
      noPhotos: !doc.isImages || (doc.input_image_count ?? 0) === 0,
      needsPromotion: false,
      notLiveYet: !doc.liveOnWeb,
    },
  }
}
