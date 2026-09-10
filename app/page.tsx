"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/inventory/Sidebar"
import { Topbar } from "@/components/inventory/Topbar"
import { InventoryHeader } from "@/components/inventory/InventoryHeader"
import { VehicleTabs, type TabValue } from "@/components/inventory/VehicleTabs"
import { FilterBar, type QuickFilter } from "@/components/inventory/FilterBar"
import { KpiCard } from "@/components/inventory/KpiCard"
import { DaysSupplySegmentLink } from "@/components/inventory/DaysSupplySegmentLink"
import { InventoryTable, type SortDirection, type SortKey } from "@/components/inventory/InventoryTable"
import { Pagination } from "@/components/inventory/Pagination"
import { NeedsActionDrawer } from "@/components/inventory/NeedsActionDrawer"
import { VehicleActionDrawer } from "@/components/inventory/VehicleActionDrawer"
import { AddVehicleModal } from "@/components/inventory/AddVehicleModal"
import { FiltersPanel, emptyAdvancedFilters, type AdvancedFilters } from "@/components/inventory/FiltersPanel"
import { Toast } from "@/components/inventory/Toast"
import {
  getDaysSupplyBreakdown,
  getHoldingCostBuckets,
  getPricingInsight,
  getTimeToMarketBuckets,
  getTrendSeries,
  isHighDemand,
  totalDaysSupply,
  totalHoldingCost,
  totalTimeToMarket,
} from "@/lib/mock-data"
import type { Vehicle } from "@/lib/types"
import type { UatFilterOptions } from "@/lib/uat-adapter"
import { formatCurrency } from "@/lib/format"

const PAGE_SIZE = 8

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadState, setLoadState] = useState<{ status: "loading" | "ready" | "error"; error?: string; meta?: { fetchedCount: number; truncated: boolean } }>({
    status: "loading",
  })
  const [realFilterOptions, setRealFilterOptions] = useState<UatFilterOptions | undefined>(undefined)
  const [tab, setTab] = useState<TabValue>("all")
  const [search, setSearch] = useState("")
  const [quickFilters, setQuickFilters] = useState<Set<QuickFilter>>(new Set())
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [holdingCostPerDay, setHoldingCostPerDay] = useState(50)
  const [actionVehicleId, setActionVehicleId] = useState<string | null>(null)
  const [addVehicleOpen, setAddVehicleOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoadState((prev) => ({ status: "loading", meta: prev.meta }))
    fetch(`/api/inventory?isSold=false&holdingCostPerDay=${holdingCostPerDay}`)
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as { vehicles: Vehicle[]; meta: { fetchedCount: number; truncated: boolean } }
      })
      .then((body) => {
        if (cancelled) return
        setVehicles(body.vehicles)
        setLoadState({ status: "ready", meta: body.meta })
      })
      .catch((err: Error) => {
        if (cancelled) return
        setLoadState({ status: "error", error: err.message })
      })
    return () => {
      cancelled = true
    }
    // Re-fetches when the dealer's holding-cost rate changes, since that rate
    // is baked into each vehicle's holdingCost server-side.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdingCostPerDay])

  useEffect(() => {
    let cancelled = false
    fetch("/api/inventory/filters?isSold=false")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as UatFilterOptions
      })
      .then((options) => {
        if (!cancelled) setRealFilterOptions(options)
      })
      .catch(() => {
        // Non-fatal — FiltersPanel falls back to counting the fetched
        // vehicle sample when realFilterOptions is undefined.
      })
    return () => {
      cancelled = true
    }
  }, [])

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

  const handleSelectPreset = (query: string) => {
    setSearch("")
    setAdvancedFilters(emptyAdvancedFilters())
    const presetFilters: Partial<Record<string, QuickFilter>> = {
      "Active and aging past 30 days": "aging30",
      "Needs a price review": "needsPriceReview",
      "Not published": "notLiveYet",
      "Waiting on a reply": "highDemand",
      "Ready for Studio Instant": "noPhotos",
    }
    if (query === "Sourced from Marketplace") {
      setQuickFilters(new Set())
      setAdvancedFilters({ ...emptyAdvancedFilters(), sources: new Set(["Marketplace"]) })
    } else {
      const filter = presetFilters[query]
      setQuickFilters(filter ? new Set([filter]) : new Set())
    }
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
      if (quickFilters.has("aging30") && v.ageDays < 30) return false
      if (quickFilters.has("noPhotos") && v.photoUrl !== null) return false
      if (quickFilters.has("overstocked") && v.daysSupplyStatus !== "overstocked") return false
      if (quickFilters.has("needsPromotion") && !v.needsAction.needsPromotion) return false
      if (quickFilters.has("notLiveYet") && !v.needsAction.notLiveYet) return false
      if (quickFilters.has("highDemand") && !isHighDemand(v)) return false
      if (quickFilters.has("needsPriceReview") && !getPricingInsight(v).recommendation) return false
      if (min !== null && v.price < min) return false
      if (max !== null && v.price > max) return false
      if (advancedFilters.bodyTypes.size > 0 && !advancedFilters.bodyTypes.has(v.bodyType)) return false
      if (advancedFilters.sources.size > 0 && !advancedFilters.sources.has(v.source.channel)) return false
      // Case-insensitive: real make/model values are inconsistently cased
      // ("Toyota" / "TOYOTA" / "toyota") across the live dataset, and the
      // selected filter values are always lowercased (see FiltersPanel).
      if (advancedFilters.makes.size > 0 && !advancedFilters.makes.has(v.make.toLowerCase())) return false
      if (advancedFilters.models.size > 0 && !advancedFilters.models.has(v.model.toLowerCase())) return false
      if (advancedFilters.years.size > 0 && !advancedFilters.years.has(v.year)) return false
      if (advancedFilters.mediaType.has("capturedMedia") && v.needsAction.noPhotos) return false
      if (advancedFilters.mediaStatus.has("draft") && !v.needsAction.notLiveYet) return false
      if ((advancedFilters.mediaStatus.has("imageStudio") || advancedFilters.mediaStatus.has("imageStudioReview")) && v.needsAction.noPhotos) return false
      if ((advancedFilters.mediaStatus.has("spin360") || advancedFilters.mediaStatus.has("spin360Review")) && v.id !== spin360VehicleId) return false
      return true
    })
  }, [vehicles, tab, search, quickFilters, advancedFilters])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const factor = sortDirection === "asc" ? 1 : -1
    const getValue = (v: Vehicle) => (sortKey === "price" ? v.price : sortKey === "age" ? v.ageDays : v.holdingCost)
    return [...filtered].sort((a, b) => (getValue(a) - getValue(b)) * factor)
  }, [filtered, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
    setPage(1)
  }

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sorted.slice(start, start + PAGE_SIZE)
  }, [sorted, page])

  const daysSupplyBreakdown = useMemo(() => getDaysSupplyBreakdown(vehicles), [vehicles])
  const timeToMarketBuckets = useMemo(() => getTimeToMarketBuckets(vehicles), [vehicles])
  const holdingCostBuckets = useMemo(() => getHoldingCostBuckets(vehicles), [vehicles])
  const onTargetTypes = daysSupplyBreakdown.find((b) => b.status === "on_target")
  const overstockedTypes = daysSupplyBreakdown.find((b) => b.status === "overstocked")

  const timeToMarketTrend = useMemo(() => getTrendSeries(totalTimeToMarket(vehicles), "down"), [vehicles])
  const holdingCostTrend = useMemo(() => getTrendSeries(totalHoldingCost(vehicles), "down"), [vehicles])
  const daysSupplyTrend = useMemo(() => getTrendSeries(totalDaysSupply(vehicles), "down"), [vehicles])

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

  const handleApplyPrice = (vehicleId: string, newPrice: number) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, price: newPrice, daysSupplyStatus: v.daysSupplyStatus === "overstocked" ? ("on_target" as const) : v.daysSupplyStatus } : v))
    )
    flashToast(`Price updated to ${formatCurrency(newPrice)}`)
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
              trendPoints={timeToMarketTrend.points}
              trendChangePct={timeToMarketTrend.changePct}
              trendGood={timeToMarketTrend.changePct <= 0}
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
              trendPoints={holdingCostTrend.points}
              trendChangePct={holdingCostTrend.changePct}
              trendGood={holdingCostTrend.changePct <= 0}
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
              trendPoints={daysSupplyTrend.points}
              trendChangePct={daysSupplyTrend.changePct}
              trendGood={daysSupplyTrend.changePct <= 0}
              trendExtra={<DaysSupplySegmentLink />}
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
            onSelectPreset={handleSelectPreset}
          />

          {loadState.status === "error" && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "rgb(253,236,234)", color: "rgb(192,38,26)", fontSize: 13, fontWeight: 600 }}>
              Couldn&apos;t load live inventory from the UAT API: {loadState.error}
            </div>
          )}

          {loadState.status === "ready" && loadState.meta?.truncated && (
            <div style={{ marginTop: 16, padding: "10px 16px", borderRadius: 10, background: "rgb(255,244,229)", color: "rgb(178,94,0)", fontSize: 12.5, fontWeight: 600 }}>
              Showing the {loadState.meta.fetchedCount} most recently created active vehicles — this rooftop has more than that, and there&apos;s no real server-side pagination wired up yet.
            </div>
          )}

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {loadState.status === "loading" && vehicles.length === 0 ? (
              <div style={{ padding: "60px 0", textAlign: "center", color: "rgb(111,106,128)", fontSize: 14, fontWeight: 500 }}>
                Loading live inventory from UAT…
              </div>
            ) : (
              <>
                <InventoryTable
                  vehicles={paginated}
                  selected={selected}
                  onToggle={toggleSelected}
                  onToggleAll={toggleAll}
                  onTakeAction={setActionVehicleId}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
              </>
            )}
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
        onApplyPrice={handleApplyPrice}
      />

      <AddVehicleModal open={addVehicleOpen} onClose={() => setAddVehicleOpen(false)} onAdd={handleAddVehicle} />

      <FiltersPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={advancedFilters}
        onChange={setAdvancedFilters}
        vehicles={vehicles}
        realFilterOptions={realFilterOptions}
        onReset={() => setAdvancedFilters(emptyAdvancedFilters())}
      />

      <Toast message={toast} />
    </div>
  )
}
