export type Condition = "new" | "pre-owned"

export type DaysSupplyStatus = "on_target" | "overstocked" | "understocked"

export type SourceChannel = "IMS" | "Website" | "Marketplace"

export interface VehicleSource {
  channel: SourceChannel
  detail: string
}

export type HoldingCostNoteKind = "loss" | "margin" | "add_cost_price"

export interface HoldingCostNote {
  kind: HoldingCostNoteKind
  text: string
}

export interface Vehicle {
  id: string
  stockNumber: string
  vin: string
  year: number
  make: string
  model: string
  trim?: string
  mileage: number
  bodyType: string
  exteriorColor?: string
  interiorTrim?: string
  photoUrl: string | null
  price: number
  daysSupply: number
  daysSupplyStatus: DaysSupplyStatus
  source: VehicleSource
  ageDays: number
  listedAt: string
  holdingCost: number
  holdingCostNote?: HoldingCostNote
  /** Sales inquiries Vini AI has logged for this unit in the last 14 days — the demand signal. */
  salesInquiries: number
  condition: Condition
  needsAction: {
    noPhotos: boolean
    needsPromotion: boolean
    notLiveYet: boolean
  }
}

export interface DaysSupplyBreakdownEntry {
  status: DaysSupplyStatus
  typeCount: number
  bodyTypes: { name: string; days: number }[]
}

export interface SegmentDaysSupply {
  bodyType: string
  vehicleCount: number
  // Nullable because the real days-supply/segments backend hasn't computed
  // a value for every segment yet — not every segment has enough sales
  // history to derive a days-supply figure from.
  avgDaysSupply: number | null
  status: DaysSupplyStatus | null
}

export interface TimeToMarketBucket {
  label: string
  count: number
}

export interface HoldingCostBucket {
  label: string
  count: number
}

/**
 * Shopper-engagement signal for one vehicle's listing, rolled up from the
 * site chatbot's tracked event categories (page, clicks, vehicle media,
 * interest, forms). Interest is kept as a summarized record, not a raw
 * event pile — matching how the tracker itself treats that category.
 */
export interface DemandSignal {
  page: {
    pageViews: number
    avgScrollDepth: number
    sectionReached: string
    exitIntent: boolean
  }
  clicks: {
    ctaClicks: number
  }
  vehicle: {
    photosOpened: number
    photosReopened: number
    galleryFinished: boolean
    windowStickerViewed: boolean
    spin360Viewed: boolean
  }
  interest: {
    summary: string
  }
  forms: {
    started: boolean
    submitted: boolean
  }
}

export interface CompetitorRadiusInsight {
  radiusMiles: number
  competitorCount: number
  avgPrice: number
  lowestPrice: number
}

export interface PricingRecommendation {
  suggestedPrice: number
  deltaAmount: number
  deltaPct: number
  reason: string
}

export interface PricingInsight {
  radii: CompetitorRadiusInsight[]
  recommendation: PricingRecommendation | null
}

export interface SoldVehicle {
  id: string
  stockNumber: string
  vin: string
  year: number
  make: string
  model: string
  trim?: string
  bodyType: string
  photoUrl: string | null
  soldPrice: number
  daysToSell: number
  soldAt: string
  buyerSource: VehicleSource
}
