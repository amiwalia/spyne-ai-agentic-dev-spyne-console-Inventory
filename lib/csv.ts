import type { Vehicle } from "./types"

export function vehiclesToCsv(vehicles: Vehicle[]): string {
  const header = ["Stock #", "VIN", "Year", "Make", "Model", "Price", "Days Supply", "Source", "Age (days)", "Holding Cost"]
  const rows = vehicles.map((v) => [v.stockNumber, v.vin, v.year, v.make, v.model, v.price, v.daysSupply, v.source.channel, v.ageDays, v.holdingCost])
  return [header, ...rows].map((row) => row.join(",")).join("\n")
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
