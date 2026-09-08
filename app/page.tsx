"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "@/components/inventory/Sidebar"
import { Topbar } from "@/components/inventory/Topbar"
import { InventoryHeader } from "@/components/inventory/InventoryHeader"
import { VehicleTabs, type TabValue } from "@/components/inventory/VehicleTabs"
import { FilterBar, type QuickFilter } from "@/components/inventory/FilterBar"
import { KpiCard } from "@/components/inventory/KpiCard"
import { DaysSupplySegmentPopover } from "@/components/inventory/DaysSupplySegmentPopover"
import { InventoryTable } from "@/components/inventory/InventoryTable"
import { Pagination } from "@/components/inventory/Pagination"
import { NeedsActionDrawer } from "@/components/inventory/NeedsActionDrawer"
import { VehicleActionDrawer } from "@/components/inventory/VehicleActionDrawer"
import { AddVehicleModal } from "@/components/inventory/AddVehicleModal"
import { FiltersPanel, emptyAdvancedFilters, type AdvancedFilters } from "@/components/inventory/FiltersPanel"
import { Toast } from "@/components/inventory/Toast"
import {
  VEHICLES,
  getDaysSupplyBreakdown,
  getHoldingCostBuckets,
  getTimeToMarketBuckets,
  isHighDemand,
  totalDaysSupply,
  totalHoldingCost,
  totalTimeToMarket,
} from "@/lib/mock-data"
import type { Vehicle } from "@/lib/types"
import { formatCurrency } from "@/lib/format"

const PAGE_SIZE = 8

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES)
  const [tab, setTab] = useState<TabValue>("all")
  const [search, setSearch] = useState("")
  const [quickFilters, setQuickFilters] = useState<Set<QuickFilter>>(new Set())
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [holdingCostPerDay, setHoldingCostPerDay] = useState(50)
  const [actionVehicleId, setActionVehicleId] = useState<string | null>(null)
  const [addVehicleOpen, setAddVehicleOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const flashToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2600)
  }

  const toggleFilter = (value: QuickFilter) => {
    setQuickFilters((prev) => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
    setPage(1)
  }

  const counts = useMemo(
    () => ({
      all: vehicles.length,
      new: vehicles.filter((v) => v.condition === "new").length,
      "pre-owned": vehicles.filter((v) => v.condition === "pre-owned").length,
    }),
    [vehicles]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const min = advancedFilters.minPrice ? Number(advancedFilters.minPrice) : null
    const max = advancedFilters.maxPrice ? Number(advancedFilters.maxPrice) : null
    // Mirrors FiltersPanel's illustrative "1 vehicle has a 360 spin" count.
    const spin360VehicleId = vehicles.find((v) => !v.needsAction.noPhotos)?.id
    return vehicles.filter((v) => {
      if (tab !== "all" && v.condition !== tab) return false
      if (q) {
        const haystack = `${v.year} ${v.make} ${v.model} ${v.trim ?? ""}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (quickFilters.has("aging60") && v.ageDays < 60) return false
      if (quickFilters.has("aging40") && v.ageDays < 40) return false
      if (quickFilters.has("noPhotos") && v.photoUrl !== null) return false
      if (quickFilters.has("overstocked") && v.daysSupplyStatus !== "overstocked") return false
      if (quickFilters.has("needsPromotion") && !v.needsAction.needsPromotion) return false
      if (quickFilters.has("notLiveYet") && !v.needsAction.notLiveYet) return false
      if (quickFilters.has("highDemand") && !isHighDemand(v)) return false
      if (min !== null && v.price < min) return false
      if (max !== null && v.price > max) return false
      if (advancedFilters.bodyTypes.size > 0 && !advancedFilters.bodyTypes.has(v.bodyType)) return false
      if (advancedFilters.sources.size > 0 && !advancedFilters.sources.has(v.source.channel)) return false
      if (advancedFilters.makes.size > 0 && !advancedFilters.makes.has(v.make)) return false
      if (advancedFilters.models.size > 0 && !advancedFilters.models.has(v.model)) return false
      if (advancedFilters.years.size > 0 && !advancedFilters.years.has(v.year)) return false
      if (advancedFilters.mediaType.has("capturedMedia") && v.needsAction.noPhotos) return false
      if (advancedFilters.mediaStatus.has("draft") && !v.needsAction.notLiveYet) return false
      if ((advancedFilters.mediaStatus.has("imageStudio") || advancedFilters.mediaStatus.has("imageStudioReview")) && v.needsAction.noPhotos) return false
      if ((advancedFilters.mediaStatus.has("spin360") || advancedFilters.mediaStatus.has("spin360Review")) && v.id !== spin360VehicleId) return false
      return true
    })
  }, [vehicles, tab, search, quickFilters, advancedFilters])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const daysSupplyBreakdown = useMemo(() => getDaysSupplyBreakdown(vehicles), [vehicles])
  const timeToMarketBuckets = useMemo(() => getTimeToMarketBuckets(vehicles), [vehicles])
  const holdingCostBuckets = useMemo(() => getHoldingCostBuckets(vehicles), [vehicles])
  const onTargetTypes = daysSupplyBreakdown.find((b) => b.status === "on_target")
  const overstockedTypes = daysSupplyBreakdown.find((b) => b.status === "overstocked")

  const advancedFilterCount =
    (advancedFilters.minPrice || advancedFilters.maxPrice ? 1 : 0) +
    (advancedFilters.bodyTypes.size > 0 ? 1 : 0) +
    (advancedFilters.sources.size > 0 ? 1 : 0) +
    (advancedFilters.makes.size > 0 ? 1 : 0) +
    (advancedFilters.models.size > 0 ? 1 : 0) +
    (advancedFilters.years.size > 0 ? 1 : 0) +
    (advancedFilters.mediaStatus.size > 0 ? 1 : 0) +
    (advancedFilters.mediaType.size > 0 ? 1 : 0)

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) => {
      const allOnPage = paginated.every((v) => prev.has(v.id))
      const next = new Set(prev)
      paginated.forEach((v) => (allOnPage ? next.delete(v.id) : next.add(v.id)))
      return next
    })
  }

  const actionVehicle = vehicles.find((v) => v.id === actionVehicleId) ?? null

  const handleResolveAction = (vehicleId: string, key: "noPhotos" | "needsPromotion" | "notLiveYet") => {
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, needsAction: { ...v.needsAction, [key]: false } } : v)))
    const labels: Record<typeof key, string> = { noPhotos: "Photos generated", needsPromotion: "Listing boosted", notLiveYet: "Listing published" }
    flashToast(labels[key])
  }

  const handleAdjustPrice = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, price: Math.round(v.price * 0.97), daysSupplyStatus: "on_target" as const } : v))
    )
    flashToast("Price adjusted to market")
    setActionVehicleId(null)
  }

  const handleAddVehicle = (vehicle: Vehicle) => {
    setVehicles((prev) => [vehicle, ...prev])
    setAddVehicleOpen(false)
    flashToast(`${vehicle.year} ${vehicle.make} ${vehicle.model} added to inventory`)
  }

  const handleExport = () => {
    const header = ["Stock #", "VIN", "Year", "Make", "Model", "Price", "Days Supply", "Source", "Age (days)", "Holding Cost"]
    const rows = filtered.map((v) => [v.stockNumber, v.vin, v.year, v.make, v.model, v.price, v.daysSupply, v.source.channel, v.ageDays, v.holdingCost])
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "inventory-export.csv"
    link.click()
    URL.revokeObjectURL(url)
    flashToast(`Exported ${filtered.length} vehicles`)
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "rgb(251,251,254)" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <main className="inventory-console" style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 0 }}>
          <InventoryHeader
            holdingCostPerDay={holdingCostPerDay}
            onHoldingCostChange={(v) => {
              setHoldingCostPerDay(v)
              flashToast(`Holding cost set to $${v}/day`)
            }}
            onAddVehicle={() => setAddVehicleOpen(true)}
          />

          <VehicleTabs active={tab} onChange={(v) => { setTab(v); setPage(1) }} counts={counts} />

          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            <KpiCard
              titleLead="Time to"
              titleBold="Market"
              tooltip="Average time from vehicle acquisition to a published, ready-to-sell listing."
              value={String(totalTimeToMarket(vehicles))}
              unit="Days"
              wash="wash-ttm.svg"
              glyph="glyph-ttm.png"
              legend={timeToMarketBuckets.map((bucket, i) => ({
                tone: (i === 0 ? "success" : i === 1 ? "warning" : "danger") as "success" | "warning" | "danger",
                label: bucket.label,
                count: bucket.count,
              }))}
            />

            <KpiCard
              titleLead="Holding"
              titleBold="Cost"
              tooltip="What the unsold inventory is costing to hold, and how that risk is spread."
              value={formatCurrency(totalHoldingCost(vehicles)).replace("$", "$ ")}
              unit=""
              wash="wash-holding-blue.svg"
              glyph="glyph-holding-blue.svg"
              legend={holdingCostBuckets.map((bucket, i) => ({
                tone: (i === 0 ? "success" : i === 1 ? "warning" : "danger") as "success" | "warning" | "danger",
                label: bucket.label,
                count: bucket.count,
              }))}
            />

            <KpiCard
              titleLead="Days"
              titleBold="Supply"
              tooltip="Units on hand ÷ the daily retail rate over the trailing 90 days. Age tells you to reprice a unit; this tells you to stop buying the type."
              value={String(totalDaysSupply(vehicles))}
              unit="Days"
              wash="wash-health.svg"
              glyph="glyph-health.png"
              legend={[
                {
                  tone: "success",
                  label: "On target",
                  count: `${onTargetTypes?.typeCount ?? 0} types`,
                  tooltipTitle: "On target",
                  tooltipDetail: onTargetTypes?.bodyTypes.map((t) => `${t.name} ${t.days}d`).join(" · "),
                },
                {
                  tone: "danger",
                  label: "Overstocked",
                  count: `${overstockedTypes?.typeCount ?? 0} type${(overstockedTypes?.typeCount ?? 0) === 1 ? "" : "s"}`,
                  tooltipTitle: "Overstocked",
                  tooltipDetail: overstockedTypes?.bodyTypes.map((t) => `${t.name} ${t.days}d`).join(" · "),
                },
              ]}
              footer={<DaysSupplySegmentPopover vehicles={vehicles} />}
            />
          </div>

          <FilterBar
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            active={quickFilters}
            onToggle={toggleFilter}
            onExport={handleExport}
            onOpenFilters={() => setFiltersOpen(true)}
            activeAdvancedCount={advancedFilterCount}
          />

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            <InventoryTable
              vehicles={paginated}
              selected={selected}
              onToggle={toggleSelected}
              onToggleAll={toggleAll}
              onTakeAction={setActionVehicleId}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </div>
        </main>
      </div>

      <NeedsActionDrawer
        vehicles={vehicles}
        onSelectFilter={(filter) => {
          setQuickFilters(new Set([filter]))
          setPage(1)
        }}
      />

      <VehicleActionDrawer
        vehicle={actionVehicle}
        onClose={() => setActionVehicleId(null)}
        onResolve={handleResolveAction}
        onAdjustPrice={handleAdjustPrice}
      />

      <AddVehicleModal open={addVehicleOpen} onClose={() => setAddVehicleOpen(false)} onAdd={handleAddVehicle} />

      <FiltersPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={advancedFilters}
        onChange={setAdvancedFilters}
        vehicles={vehicles}
        onReset={() => setAdvancedFilters(emptyAdvancedFilters())}
      />

      <Toast message={toast} />
    </div>
  )
}
