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
import { getPricingInsight, getTimeToMarketBuckets, getTrendSeries, isHighDemand, totalTimeToMarket } from "@/lib/mock-data"
import type { Vehicle } from "@/lib/types"
import type {
  UatDaysSupplySummary,
  UatFilterOptions,
  UatHoldingCostSummary,
  UatHomeStats,
  UatPartnerStatus,
  UatScoreAttributesCount,
  UatTimeToMarket,
} from "@/lib/uat-adapter"
import { formatCurrency } from "@/lib/format"
import { downloadCsv, vehiclesToCsv } from "@/lib/csv"

const PAGE_SIZE = 8

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadState, setLoadState] = useState<{ status: "loading" | "ready" | "error"; error?: string; meta?: { fetchedCount: number; truncated: boolean } }>({
    status: "loading",
  })
  const [realFilterOptions, setRealFilterOptions] = useState<UatFilterOptions | undefined>(undefined)
  const [realTtm, setRealTtm] = useState<UatTimeToMarket | undefined>(undefined)
  const [realScoreAttrs, setRealScoreAttrs] = useState<UatScoreAttributesCount | undefined>(undefined)
  const [realPartnerStatus, setRealPartnerStatus] = useState<UatPartnerStatus[] | undefined>(undefined)
  const [realHoldingCostSummary, setRealHoldingCostSummary] = useState<UatHoldingCostSummary | undefined>(undefined)
  const [realHomeStats, setRealHomeStats] = useState<UatHomeStats | undefined>(undefined)
  const [realDaysSupplySummary, setRealDaysSupplySummary] = useState<UatDaysSupplySummary | undefined>(undefined)
  const [tab, setTab] = useState<TabValue>("all")
  const [search, setSearch] = useState("")
  const [quickFilters, setQuickFilters] = useState<Set<QuickFilter>>(new Set())
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters())
  // Set once from the /segments handoff (?bodyType=). Rendering it as a
  // derived banner (below) rather than trusting this flag alone means it
  // auto-hides the moment the dealer's own filter edits stop matching a
  // single clean segment, instead of lying about what's on screen.
  const [segmentContext, setSegmentContext] = useState<string | null>(null)
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

  // Picks up the segment handoff from /segments' "View all" link
  // (?bodyType=SUV) so the table opens pre-scoped instead of dumping the
  // whole rooftop's inventory on the dealer — pre-sorted highest holding
  // cost first, matching the priority order the segment accordion itself
  // already promised before the dealer ever clicked through.
  useEffect(() => {
    const bodyType = new URLSearchParams(window.location.search).get("bodyType")
    if (!bodyType) return
    setAdvancedFilters((prev) => ({ ...prev, bodyTypes: new Set([bodyType]) }))
    setSegmentContext(bodyType)
    setSortKey("holdingCost")
    setSortDirection("desc")
  }, [])

  const clearSegmentContext = () => {
    setAdvancedFilters((prev) => ({ ...prev, bodyTypes: new Set() }))
    setSegmentContext(null)
    setPage(1)
  }

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

  useEffect(() => {
    let cancelled = false
    fetch("/api/inventory/time-to-market")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as UatTimeToMarket
      })
      .then((ttm) => {
        if (!cancelled) setRealTtm(ttm)
      })
      .catch(() => {
        // Non-fatal — the Time to Market card falls back to bucketing the
        // fetched vehicle sample's current ageDays when realTtm is undefined.
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/inventory/score-attributes-count?isSold=false")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as UatScoreAttributesCount
      })
      .then((counts) => {
        if (!cancelled) setRealScoreAttrs(counts)
      })
      .catch(() => {
        // Non-fatal — the Needs Action drawer's "No Photos" row falls back
        // to counting the fetched vehicle sample when this is undefined.
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/partner/integration-status")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as { partners: UatPartnerStatus[] }
      })
      .then((body) => {
        if (!cancelled) setRealPartnerStatus(body.partners)
      })
      .catch(() => {
        // Non-fatal — the header shows "Checking sync status…" indefinitely
        // rather than a fabricated timestamp when this fails.
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Fleet-wide holding-cost total from the backend — deliberately not in the
  // `filtered` dependency chain, since this KPI is meant to stay fixed
  // regardless of what's selected in the table (unlike the vehicle-derived
  // fallback below, which only sees whatever's in the fetched sample).
  useEffect(() => {
    let cancelled = false
    fetch("/api/inventory/holding-cost-summary")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as UatHoldingCostSummary
      })
      .then((summary) => {
        if (!cancelled) setRealHoldingCostSummary(summary)
      })
      .catch(() => {
        // Non-fatal — the Holding Cost KPI card falls back to summing the
        // fetched vehicle sample when this is undefined.
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Real week-over-week deltas, home/stats. Only inventoryTurnoverInDays
  // corresponds to anything on screen today (the Days Supply card's trend
  // %) — totalInventory/totalInventoryValue/ageingVehicles are real numbers
  // with no matching card yet, so they're fetched but not displayed.
  useEffect(() => {
    let cancelled = false
    fetch("/api/inventory/home-stats")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as UatHomeStats
      })
      .then((stats) => {
        if (!cancelled) setRealHomeStats(stats)
      })
      .catch(() => {
        // Non-fatal — the Days Supply card's trend % falls back to the
        // synthetic client-computed one when this is undefined.
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Fleet-wide Days Supply headline + on-target/overstocked type counts,
  // from the same days-supply/segments endpoint the /segments page already
  // uses for its per-segment rows. avgDaysSupply comes back real but
  // implausibly large on every dealer tested (85,618 / 1,031,603 "days") —
  // the same backend data-quality issue as the per-segment values — shown
  // as-is, same as the holding-cost card shows its own real empty state
  // rather than a nicer client-computed number that isn't what the backend
  // actually has.
  useEffect(() => {
    let cancelled = false
    fetch("/api/inventory/days-supply-segments")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as { summary: UatDaysSupplySummary }
      })
      .then((body) => {
        if (!cancelled) setRealDaysSupplySummary(body.summary)
      })
      .catch(() => {
        // Non-fatal — the Days Supply card shows its loading/empty "—"
        // state when this is undefined, same as it does while real data is
        // simply still in flight.
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Loads the rooftop's real persisted holding-cost rate once on mount,
  // overwriting the 50 default above. Deliberately a one-shot fetch, not a
  // dependency of anything else — updating holdingCostPerDay afterward (via
  // the popover) is a write the user made, not something to re-fetch over.
  useEffect(() => {
    let cancelled = false
    fetch("/api/rooftop/holding-cost")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as { holdingCost: number }
      })
      .then((body) => {
        if (!cancelled) setHoldingCostPerDay(body.holdingCost)
      })
      .catch(() => {
        // Non-fatal — keeps the $50/day default when this fails.
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

  // Real when available (see the time-to-market fetch below) — falls back to
  // bucketing the fetched vehicles' current ageDays, which measures a
  // different thing (a snapshot of today's inventory, not the average delay
  // for units that actually went live in the last 30 days).
  const timeToMarketBuckets = useMemo(() => realTtm?.buckets ?? getTimeToMarketBuckets(vehicles), [vehicles, realTtm])
  const timeToMarketValue = realTtm?.averageDays ?? totalTimeToMarket(vehicles)
  // Trusts /inventory/v2/holding-cost/summary as-is, including its empty
  // state — every UAT dealer tested comes back with totalHoldingCost: null
  // and all-zero buckets ("not computed yet" on the backend), and the card
  // shows that real state directly rather than masking it with a
  // client-computed number that isn't what the backend actually has.
  const holdingCostValue = realHoldingCostSummary?.totalHoldingCost ?? null
  const holdingCostBuckets = realHoldingCostSummary?.buckets ?? []
  // Trusts days-supply/segments' fleet-wide aggregate as-is too — real but
  // implausibly large on every dealer tested (a backend bug, not a UI one),
  // shown directly rather than swapped for a nicer client-computed number.
  const daysSupplyValue = realDaysSupplySummary?.avgDaysSupply ?? null

  // No real trend/history endpoint yet — this sparkline stays synthetic,
  // just seeded from the real current average when we have one.
  const timeToMarketTrend = useMemo(() => getTrendSeries(timeToMarketValue, "down"), [timeToMarketValue])
  const holdingCostTrend = useMemo(() => getTrendSeries(holdingCostValue ?? 0, "down"), [holdingCostValue])
  // Sparkline shape stays synthetic (no real time-series endpoint) but the
  // week-over-week % swaps to the real value from home/stats when the
  // backend has actually computed one — both UAT dealers tested come back
  // with inventoryTurnoverInDays at changePct: null, so this still shows
  // the synthetic % today, but will pick up the real one the moment it's
  // populated, with no further code change.
  const daysSupplyTrend = useMemo(() => getTrendSeries(daysSupplyValue ?? 0, "down"), [daysSupplyValue])
  const daysSupplyChangePct = realHomeStats?.inventoryTurnoverInDays?.changePct ?? daysSupplyTrend.changePct

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

  const handleAddVehicle = (vehicle: Vehicle) => {
    setVehicles((prev) => [vehicle, ...prev])
    setAddVehicleOpen(false)
    flashToast(`${vehicle.year} ${vehicle.make} ${vehicle.model} added to inventory`)
  }

  const handleExport = () => {
    downloadCsv(vehiclesToCsv(filtered), "inventory-export.csv")
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
              const previous = holdingCostPerDay
              setHoldingCostPerDay(v)
              fetch("/api/rooftop/holding-cost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ holdingCost: v }),
              })
                .then((res) => {
                  if (!res.ok) throw new Error()
                  flashToast(`Holding cost set to $${v}/day`)
                })
                .catch(() => {
                  setHoldingCostPerDay(previous)
                  flashToast("Couldn't save the holding cost rate — try again")
                })
            }}
            onAddVehicle={() => setAddVehicleOpen(true)}
            partners={realPartnerStatus}
          />

          <VehicleTabs active={tab} onChange={(v) => { setTab(v); setPage(1) }} counts={counts} />

          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            <KpiCard
              titleLead="Time to"
              titleBold="Market"
              tooltip="Average time from vehicle acquisition to a published, ready-to-sell listing."
              value={String(timeToMarketValue)}
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
              value={holdingCostValue != null ? formatCurrency(holdingCostValue).replace("$", "$ ") : "—"}
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
              trendUnavailable={holdingCostValue == null}
            />

            <KpiCard
              titleLead="Days"
              titleBold="Supply"
              tooltip="Units on hand ÷ the daily retail rate over the trailing 90 days. Age tells you to reprice a unit; this tells you to stop buying the type."
              value={daysSupplyValue != null ? daysSupplyValue.toLocaleString("en-US") : "—"}
              unit="Days"
              wash="wash-health.svg"
              glyph="glyph-health.png"
              legend={[
                {
                  tone: "success",
                  label: "On target",
                  count: `${realDaysSupplySummary?.onTargetTypes ?? 0} types`,
                },
                {
                  tone: "danger",
                  label: "Overstocked",
                  count: `${realDaysSupplySummary?.overstockedTypes ?? 0} type${(realDaysSupplySummary?.overstockedTypes ?? 0) === 1 ? "" : "s"}`,
                },
              ]}
              trendPoints={daysSupplyTrend.points}
              trendChangePct={daysSupplyChangePct}
              trendGood={daysSupplyChangePct <= 0}
              trendUnavailable={daysSupplyValue == null}
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

          {segmentContext !== null && advancedFilters.bodyTypes.size === 1 && advancedFilters.bodyTypes.has(segmentContext) && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 16px",
                borderRadius: 10,
                background: "rgb(245,241,255)",
                border: "1px solid rgb(225,214,255)",
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgb(76,44,181)" }}>
                Showing {filtered.length} {segmentContext} vehicle{filtered.length === 1 ? "" : "s"}, highest holding cost first
              </span>
              <button
                type="button"
                onClick={clearSegmentContext}
                style={{ padding: 0, border: "none", background: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "rgb(76,44,181)", textDecoration: "underline" }}
              >
                Clear
              </button>
            </div>
          )}

          {loadState.status === "error" && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "rgb(253,236,234)", color: "rgb(192,38,26)", fontSize: 13, fontWeight: 600 }}>
              Couldn&apos;t load live inventory from the UAT API: {loadState.error}
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
        realNoPhotosCount={realScoreAttrs?.noPhotosCount}
        onSelectFilter={(filter) => {
          setQuickFilters(new Set([filter]))
          setPage(1)
        }}
      />

      <VehicleActionDrawer vehicle={actionVehicle} onClose={() => setActionVehicleId(null)} onResolve={handleResolveAction} />

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
