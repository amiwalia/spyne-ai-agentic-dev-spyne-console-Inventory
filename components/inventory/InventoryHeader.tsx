"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { GRADIENT, SHADOW } from "@/lib/tokens"
import { HoldingCostPopover } from "./HoldingCostPopover"

interface InventoryHeaderProps {
  holdingCostPerDay: number
  onHoldingCostChange: (value: number) => void
  onAddVehicle: () => void
}

export function InventoryHeader({ holdingCostPerDay, onHoldingCostChange, onAddVehicle }: InventoryHeaderProps) {
  // Computed client-side only, after mount — a server-rendered timestamp would
  // near-inevitably mismatch the client's and trigger a hydration error.
  const [lastSynced, setLastSynced] = useState("")
  useEffect(() => {
    setLastSynced(new Date().toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }))
  }, [])

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "rgb(8,8,8)" }}>Hi John, 👋</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "rgb(111,106,128)", marginTop: 2 }}>
          Last synced: Today, {lastSynced}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <HoldingCostPopover value={holdingCostPerDay} onSave={onHoldingCostChange} />

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
