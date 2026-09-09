"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Sidebar } from "@/components/inventory/Sidebar"
import { Topbar } from "@/components/inventory/Topbar"
import { SegmentAccordion } from "@/components/inventory/SegmentAccordion"
import { VEHICLES, getSegmentBreakdown } from "@/lib/mock-data"
import { COLOR } from "@/lib/tokens"

export default function SegmentsPage() {
  const segments = getSegmentBreakdown(VEHICLES)

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
            {segments.length} body-type segments across {VEHICLES.length} vehicles — double-click a segment to see its vehicles
          </p>

          <div style={{ marginTop: 20, maxWidth: 900 }}>
            <SegmentAccordion segments={segments} vehicles={VEHICLES} />
          </div>
        </main>
      </div>
    </div>
  )
}
