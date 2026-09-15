"use client"

import { Plus } from "lucide-react"
import type { UatPartnerStatus } from "@/lib/uat-adapter"
import { GRADIENT, SHADOW } from "@/lib/tokens"
import { HoldingCostPopover } from "./HoldingCostPopover"
import { IntegrationStatusIndicator } from "./IntegrationStatusIndicator"

interface InventoryHeaderProps {
  holdingCostPerDay: number
  onHoldingCostChange: (value: number) => void
  onAddVehicle: () => void
  /** undefined while the /partner/integration-status fetch is in flight. */
  partners?: UatPartnerStatus[]
}

export function InventoryHeader({ holdingCostPerDay, onHoldingCostChange, onAddVehicle, partners }: InventoryHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "rgb(8,8,8)" }}>Hi John, 👋</div>
        <div style={{ marginTop: 2 }}>
          <IntegrationStatusIndicator partners={partners} />
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
