"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Sidebar } from "@/components/inventory/Sidebar"
import { Topbar } from "@/components/inventory/Topbar"
import { SegmentAccordion } from "@/components/inventory/SegmentAccordion"
import { getSegmentBreakdown } from "@/lib/mock-data"
import type { SegmentDaysSupply, Vehicle } from "@/lib/types"
import { COLOR } from "@/lib/tokens"

export default function SegmentsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadState, setLoadState] = useState<{ status: "loading" | "ready" | "error"; error?: string }>({ status: "loading" })
  // Real, whole-account segment breakdown from /inventory/v2/days-supply/segments
  // when available — falls back to computing it from just the fetched
  // vehicles (a capped, possibly-incomplete sample) when the real fetch
  // hasn't resolved yet.
  const [realSegments, setRealSegments] = useState<SegmentDaysSupply[] | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/inventory?isSold=false&holdingCostPerDay=50`)
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as { vehicles: Vehicle[] }
      })
      .then((body) => {
        if (cancelled) return
        setVehicles(body.vehicles)
        setLoadState({ status: "ready" })
      })
      .catch((err: Error) => {
        if (cancelled) return
        setLoadState({ status: "error", error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/inventory/days-supply-segments")
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
        return body as { segments: SegmentDaysSupply[] }
      })
      .then((body) => {
        if (!cancelled) setRealSegments(body.segments)
      })
      .catch(() => {
        // Non-fatal — falls back to the client-computed breakdown below.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const segments = realSegments ?? getSegmentBreakdown(vehicles)
  // The real segment breakdown covers the whole account, not just the
  // capped sample of vehicles this page fetches for the inline preview —
  // so the fleet-wide total comes from summing it, not from vehicles.length.
  const totalVehicleCount = realSegments ? realSegments.reduce((sum, s) => sum + s.vehicleCount, 0) : vehicles.length

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "rgb(251,251,254)" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <main className="inventory-console" style={{ flex: 1, padding: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: COLOR.textSecondary, textDecoration: "none", marginBottom: 14 }}>
            <ArrowLeft size={15} />
            Back to Inventory
          </Link>

          <div style={{ fontSize: 22, fontWeight: 700, color: "rgb(8,8,8)" }}>Days Supply by Segment</div>
          <p style={{ fontSize: 14, color: "rgb(111,106,128)", marginTop: 2 }}>
            {loadState.status === "ready"
              ? `${segments.length} body-type segments across ${totalVehicleCount.toLocaleString("en-US")} vehicles — click a segment to see its highest-priority vehicles`
              : "Loading segments from live inventory…"}
          </p>

          {loadState.status === "error" && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "rgb(253,236,234)", color: "rgb(192,38,26)", fontSize: 13, fontWeight: 600 }}>
              Couldn&apos;t load live inventory from the UAT API: {loadState.error}
            </div>
          )}

          <div style={{ marginTop: 20, maxWidth: 900 }}>
            {loadState.status === "loading" ? (
              <div style={{ padding: "60px 0", textAlign: "center", color: "rgb(111,106,128)", fontSize: 14, fontWeight: 500 }}>Loading live inventory from UAT…</div>
            ) : (
              <SegmentAccordion segments={segments} vehicles={vehicles} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
