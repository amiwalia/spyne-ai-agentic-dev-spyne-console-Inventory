"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Sidebar } from "@/components/inventory/Sidebar"
import { Topbar } from "@/components/inventory/Topbar"
import { SoldInventoryTable } from "@/components/inventory/SoldInventoryTable"
import { SOLD_VEHICLES } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/format"
import { COLOR } from "@/lib/tokens"

export default function SoldInventoryPage() {
  const totalRevenue = SOLD_VEHICLES.reduce((sum, v) => sum + v.soldPrice, 0)
  const avgDaysToSell = Math.round(SOLD_VEHICLES.reduce((sum, v) => sum + v.daysToSell, 0) / SOLD_VEHICLES.length)

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

          <div style={{ fontSize: 22, fontWeight: 700, color: "rgb(8,8,8)" }}>Sold Inventory</div>
          <p style={{ fontSize: 14, color: "rgb(111,106,128)", marginTop: 2 }}>{SOLD_VEHICLES.length} vehicles sold in the last 45 days</p>

          <div style={{ display: "flex", gap: 16, marginTop: 20, marginBottom: 20 }}>
            <div style={{ flex: 1, padding: "16px 20px", borderRadius: 16, background: "#fff", border: `1px solid ${COLOR.borderCard}` }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: COLOR.textSecondary }}>Total revenue</p>
              <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, color: COLOR.ink }}>{formatCurrency(totalRevenue)}</p>
            </div>
            <div style={{ flex: 1, padding: "16px 20px", borderRadius: 16, background: "#fff", border: `1px solid ${COLOR.borderCard}` }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: COLOR.textSecondary }}>Avg days to sell</p>
              <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, color: COLOR.ink }}>{avgDaysToSell} days</p>
            </div>
            <div style={{ flex: 1, padding: "16px 20px", borderRadius: 16, background: "#fff", border: `1px solid ${COLOR.borderCard}` }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: COLOR.textSecondary }}>Units sold</p>
              <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, color: COLOR.ink }}>{SOLD_VEHICLES.length}</p>
            </div>
          </div>

          <SoldInventoryTable vehicles={SOLD_VEHICLES} />
        </main>
      </div>
    </div>
  )
}
