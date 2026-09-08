export type Condition = "new" | "pre-owned"

export type DaysSupplyStatus = "on_target" | "overstocked"

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

export interface TimeToMarketBucket {
  label: string
  count: number
}

export interface HoldingCostBucket {
  label: string
  count: number
}

export interface NeedsActionBreakdown {
  studioOs: { noPhotos: number; needsPromotion: number; notLiveYet: number }
  viniAi: { sales: number; services: number; receptions: number }
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
