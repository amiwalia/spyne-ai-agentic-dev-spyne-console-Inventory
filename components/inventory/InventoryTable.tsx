"use client"

import type { Vehicle } from "@/lib/types"
import { VehicleRow } from "./VehicleRow"
import { EmptyState } from "./EmptyState"
import { COLOR, SHADOW } from "@/lib/tokens"

const GRID_COLUMNS = "36px 2.6fr 1.3fr 1fr 1.2fr 1fr 0.9fr 150px"
const SORTABLE_COLUMNS = new Set(["Type", "Price", "Age", "Hold. Cost"])
const COLUMNS = ["Vehicle", "Type", "Price", "Source", "Age", "Hold. Cost", "Action"]

function SortChevron() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.7 }}>
      <path d="M8 9l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 15l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface InventoryTableProps {
  vehicles: Vehicle[]
  selected: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  onTakeAction: (id: string) => void
}

export function InventoryTable({ vehicles, selected, onToggle, onToggleAll, onTakeAction }: InventoryTableProps) {
  const allSelected = vehicles.length > 0 && vehicles.every((v) => selected.has(v.id))

  return (
    <div
      style={{
        position: "relative",
        flex: "1 1 0%",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${COLOR.borderTable}`,
        borderRadius: 22,
        boxShadow: SHADOW.table,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: GRID_COLUMNS, padding: "0 24px 0 20px", height: 48, alignItems: "center", borderBottom: `1px solid ${COLOR.borderSofter}`, flexShrink: 0 }}>
        <div
          onClick={onToggleAll}
          style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${allSelected ? COLOR.primary : "rgba(40,35,70,0.22)"}`, background: allSelected ? COLOR.primary : "#fff", cursor: "pointer" }}
        />
        {COLUMNS.map((col) => (
          <span
            key={col}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              gap: 6,
              fontSize: 11.5,
              fontWeight: 700,
              color: COLOR.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              cursor: SORTABLE_COLUMNS.has(col) ? "pointer" : "default",
            }}
          >
            {col}
            {SORTABLE_COLUMNS.has(col) && <SortChevron />}
          </span>
        ))}
      </div>

      {vehicles.length === 0 ? (
        <EmptyState title="No vehicles match these filters" helper="Try clearing a filter or searching a different year, make, or model." />
      ) : (
        vehicles.map((vehicle) => (
          <VehicleRow
            key={vehicle.id}
            vehicle={vehicle}
            selected={selected.has(vehicle.id)}
            onToggle={() => onToggle(vehicle.id)}
            onTakeAction={() => onTakeAction(vehicle.id)}
          />
        ))
      )}
    </div>
  )
}
