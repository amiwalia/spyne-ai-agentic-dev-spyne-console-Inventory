"use client"

import { ChevronDown, Plus } from "lucide-react"
import { COLOR, GRADIENT, SHADOW } from "@/lib/tokens"

export function InventoryHeader({ holdingCostPerDay = 50, onAddVehicle }: { holdingCostPerDay?: number; onAddVehicle: () => void }) {
  const lastSynced = new Date().toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "rgb(8,8,8)" }}>Hi John, 👋</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "rgb(111,106,128)", marginTop: 2 }}>
          Last synced: Today, {lastSynced}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="button"
          style={{
            height: 44,
            minWidth: 160,
            padding: "0 16px",
            borderRadius: 12,
            border: `1px solid ${COLOR.borderSoft}`,
            background: "transparent",
            fontWeight: 700,
            fontSize: 13.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: SHADOW.pillBrand,
          }}
        >
          <span style={{ color: COLOR.primary, fontWeight: 600 }}>
            Holding Cost: <span style={{ fontWeight: 700 }}>${holdingCostPerDay}/day</span>
          </span>
          <ChevronDown size={15} color={COLOR.primary} />
        </button>

        <button
          type="button"
          onClick={onAddVehicle}
          style={{
            height: 44,
            width: 160,
            justifyContent: "center",
            background: GRADIENT.addVehicle,
            border: "1px solid transparent",
            borderRadius: 12,
            padding: "0 16px 0 12px",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: SHADOW.addVehicle,
          }}
        >
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>
    </div>
  )
}
