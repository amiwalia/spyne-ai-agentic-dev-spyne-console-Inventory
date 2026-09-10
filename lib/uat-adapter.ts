import type { TimeToMarketBucket, Vehicle } from "./types"

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

/** One facet option from `/inventory/v2/filters`, e.g. a single make or year. */
interface UatFacetOption {
  key: string
  label: string
  count?: number
  min?: number
  max?: number
}

interface UatFacet {
  label: string
  type?: string
  options: UatFacetOption[]
}

export interface UatFiltersResponse {
  success: boolean
  message?: string
  data: {
    makes?: UatFacet
    models?: UatFacet
    years?: UatFacet
    priceRange?: UatFacet
    odometerRange?: UatFacet
    [key: string]: UatFacet | undefined
  }
}

export interface FacetOption<T> {
  value: T
  label: string
  count: number
}

export interface UatFilterOptions {
  makes: FacetOption<string>[]
  models: FacetOption<string>[]
  years: FacetOption<number>[]
  priceBounds: { min: number; max: number }
  odometerBounds: { min: number; max: number }
}

/**
 * Maps the real filters-facet response onto the option shapes the Filters
 * panel renders. Make/model values are lowercased here — the real dataset
 * has inconsistent casing across records ("Toyota" / "TOYOTA" / "toyota"),
 * and the panel's selection Set is matched case-insensitively against
 * vehicle.make/model for exactly that reason. Year keys arrive as strings
 * ("2023") and are converted to numbers to match Vehicle.year.
 */
export function mapUatFacetsToFilterOptions(res: UatFiltersResponse): UatFilterOptions {
  const makes = (res.data.makes?.options ?? []).map((o) => ({ value: o.key.toLowerCase(), label: o.label, count: o.count ?? 0 }))
  const models = (res.data.models?.options ?? []).map((o) => ({ value: o.key.toLowerCase(), label: o.label, count: o.count ?? 0 }))
  const years = (res.data.years?.options ?? [])
    .map((o) => ({ value: Number(o.key), label: o.label, count: o.count ?? 0 }))
    .filter((o) => Number.isFinite(o.value))
  const priceOpt = res.data.priceRange?.options?.[0]
  const odometerOpt = res.data.odometerRange?.options?.[0]

  return {
    makes,
    models,
    years,
    priceBounds: { min: priceOpt?.min ?? 0, max: priceOpt?.max ?? 0 },
    odometerBounds: { min: odometerOpt?.min ?? 0, max: odometerOpt?.max ?? 0 },
  }
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

export interface UatTimeToMarketResponse {
  message?: string
  data: {
    averageDelayInDays: number
    timeToMarketBuckets: {
      lessThan3Days: { vinCount: number }
      between3And6Days: { vinCount: number }
      moreThan6Days: { vinCount: number }
    }
  }
}

export interface UatTimeToMarket {
  averageDays: number
  buckets: TimeToMarketBucket[]
}

/**
 * Maps `/inventory/v2/time-to-market` onto the app's TimeToMarketBucket
 * shape. Unlike days-supply, this is a real, purpose-built backend metric —
 * not a placeholder — but it measures something different from the mock
 * version: the average delay for vehicles that actually went live within
 * the requested date range, not a snapshot of current inventory age. There
 * is no real trend/history endpoint yet, so the KPI card's week-over-week
 * sparkline stays synthetic, seeded from this real average.
 */
export function mapUatTimeToMarket(res: UatTimeToMarketResponse): UatTimeToMarket {
  const b = res.data.timeToMarketBuckets
  return {
    averageDays: Math.round(res.data.averageDelayInDays * 10) / 10,
    buckets: [
      { label: "< 3 days", count: b.lessThan3Days?.vinCount ?? 0 },
      { label: "3–6 days", count: b.between3And6Days?.vinCount ?? 0 },
      { label: "6+ days", count: b.moreThan6Days?.vinCount ?? 0 },
    ],
  }
}

interface UatActionItem {
  actual?: number
  target?: number
}

export interface UatVehicleDetailResponse {
  error: boolean
  message?: string
  data: {
    dealerVinId: string
    vin: string
    vehicleScore?: {
      actionItems?: Record<string, UatActionItem>
      output?: { score: number; grade: string }
      qc?: { score: number; grade: string }
    }
  }
}

export interface UatPhotoScoreIssue {
  key: string
  label: string
  actual?: number
  target?: number
}

export interface UatPhotoScore {
  score: number
  grade: string
  issues: UatPhotoScoreIssue[]
}

function humanizeActionItemKey(key: string): string {
  return key
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Maps the Single VIN Detail endpoint's `vehicleScore` onto a simplified
 * shape the Photo Score UI can render. This is a real backend score, not a
 * placeholder — but action-item keys are only known from the one sample
 * vehicle inspected while building this (OTHER_IMAGES, INCONSISTENT_
 * BACKGROUND); any other key the real system returns is still rendered
 * (title-cased generically) rather than dropped, since the alternative is
 * silently hiding a real issue the dealer should see.
 */
export function mapUatPhotoScore(res: UatVehicleDetailResponse): UatPhotoScore | null {
  const vs = res.data.vehicleScore
  if (!vs?.output) return null

  const issues: UatPhotoScoreIssue[] = Object.entries(vs.actionItems ?? {}).map(([key, item]) => ({
    key,
    label: humanizeActionItemKey(key),
    actual: item.actual,
    target: item.target,
  }))

  return { score: vs.output.score, grade: vs.output.grade, issues }
}

export interface UatScoreAttributesCountResponse {
  error: boolean
  message?: string
  vehicleCount?: { actionableCount: number }
  attributesCount: { attribute: string; count: number }[]
}

export interface UatScoreAttributesCount {
  actionableCount: number
  noPhotosCount: number
  /** Every attribute the API returned, keyed as-is (e.g. CGI_PRESENT,
   * INCOMPLETE_MEDIA, LESS_IMAGE, LOW_QUALITY_MEDIA, WRONG_HERO_ANGLE,
   * NO_MEDIA_SCORE) — only NO_PHOTOS is wired into the UI today, the rest
   * are carried through for whoever adds more Needs Action categories next. */
  byAttribute: Record<string, number>
}

/**
 * Maps `/inventory/v2/score-attributes-count` onto real, whole-account media
 * needs-action counts — replaces the Needs Action drawer's "No Photos" count,
 * which was otherwise computed client-side from whatever vehicle sample is
 * currently fetched (capped, see the truncation note on /api/inventory).
 */
export function mapUatScoreAttributesCount(res: UatScoreAttributesCountResponse): UatScoreAttributesCount {
  const byAttribute: Record<string, number> = {}
  for (const { attribute, count } of res.attributesCount ?? []) {
    byAttribute[attribute] = count
  }
  return {
    actionableCount: res.vehicleCount?.actionableCount ?? 0,
    noPhotosCount: byAttribute.NO_PHOTOS ?? 0,
    byAttribute,
  }
}

export interface UatPartnerIntegrationStatusResponse {
  success: boolean
  message?: string
  data: {
    partnerId: string
    partnerName: string
    partnerLogo: string | null
    /** ISO timestamp of the last feed received from this partner, or null
     * if this partner has never sent one — i.e. the connection exists but
     * has never actually synced, not the same as "not connected at all". */
    lastReceivedAt: string | null
  }[]
}

export type UatPartnerStatus = UatPartnerIntegrationStatusResponse["data"][number]

/**
 * Pass-through with a type guard, not really a transform — the real
 * response already matches the shape the UI wants. Kept as an adapter
 * function anyway for the same reason every other endpoint has one: a
 * single, testable seam between "what the UAT API returns today" and
 * "what the UI reads," so a future field-name change breaks one place.
 */
export function mapUatPartnerIntegrationStatus(res: UatPartnerIntegrationStatusResponse): UatPartnerStatus[] {
  return res.data ?? []
}

interface UatVinSnapField {
  value?: string | number | string[]
}

export interface UatVinDecodeResponse {
  error: boolean
  message?: string
  data?: {
    vinData?: {
      vehicleSnap?: Record<string, UatVinSnapField>
    }
  }
}

export interface UatVinDecodeResult {
  year: number | null
  make: string | null
  model: string | null
  trim: string | null
  style: string | null
  engine: string | null
}

function vinFieldString(vehicleSnap: Record<string, UatVinSnapField> | undefined, key: string): string | null {
  const v = vehicleSnap?.[key]?.value
  if (typeof v === "string") return v.trim() || null
  if (typeof v === "number") return String(v)
  return null
}

/**
 * Maps `/inventory/v1/vins/get-vin-data` onto the handful of fields the Add
 * Vehicle form can actually use today. The real payload carries the same
 * ~86-field vehicleSnap/featureSnap/engineTransmission/... shape as the
 * Single VIN Detail endpoint (see mapUatPhotoScore's neighbor types) — only
 * vehicleSnap's year/make/model/trim/style/engine are pulled out here.
 * Returns null when the response has no vinData at all (the invalid-VIN
 * response shape — {isVinValid:false} — has no `data` key to begin with;
 * the route handler surfaces that case's message separately).
 */
export function mapUatVinDecode(res: UatVinDecodeResponse): UatVinDecodeResult | null {
  const vs = res.data?.vinData?.vehicleSnap
  if (!vs) return null
  const yearStr = vinFieldString(vs, "year")
  return {
    year: yearStr ? Number(yearStr) : null,
    make: vinFieldString(vs, "make"),
    model: vinFieldString(vs, "model"),
    trim: vinFieldString(vs, "trim"),
    style: vinFieldString(vs, "style"),
    engine: vinFieldString(vs, "engine"),
  }
}

export interface UatCentralConfigResponse {
  success: boolean
  message?: string
  data?: {
    entityconfig?: {
      holdingCost?: number
      [key: string]: unknown
    }
  }
}

/**
 * Reads just the holding-cost rate out of the rooftop's INFO config —
 * confirmed live that POSTing back only {holdingCost} merges into the
 * existing entityconfig rather than replacing it (vehicleType,
 * sharedRooftops, vin_live_check, and firstTimeUserExperience all survived
 * an update that only touched holdingCost), so that's the only field this
 * app ever sends.
 */
export function mapUatHoldingCost(res: UatCentralConfigResponse): number | null {
  const value = res.data?.entityconfig?.holdingCost
  return typeof value === "number" ? value : null
}
