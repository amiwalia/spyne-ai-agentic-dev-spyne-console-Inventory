"use client"

import type { Condition } from "@/lib/types"
import { COLOR, SHELL } from "@/lib/tokens"

export type TabValue = "all" | Condition

interface VehicleTabsProps {
  active: TabValue
  onChange: (value: TabValue) => void
  counts: { all: number; new: number; "pre-owned": number }
}

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All vehicles" },
  { value: "new", label: "New" },
  { value: "pre-owned", label: "Pre-owned" },
]

export function VehicleTabs({ active, onChange, counts }: VehicleTabsProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 28, marginTop: 16, borderBottom: `1px solid ${SHELL.sidebarBorder}` }}>
      {TABS.map((tab) => {
        const isActive = active === tab.value
        const count = tab.value === "all" ? counts.all : tab.value === "new" ? counts.new : counts["pre-owned"]
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            style={{
              position: "relative",
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 0 12px",
              marginBottom: -1,
              fontSize: 16,
              fontWeight: isActive ? 700 : 500,
              letterSpacing: -0.2,
              color: isActive ? COLOR.primaryTab : COLOR.textTabInactive,
              transition: "color 0.2s",
            }}
          >
            <span style={{ lineHeight: 1 }}>{tab.label}</span>
            <span
              style={{
                width: 1,
                height: 14,
                alignSelf: "center",
                background: isActive ? "rgba(106,75,242,0.35)" : "rgb(220,218,226)",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1, color: isActive ? COLOR.primaryTab : COLOR.textTabInactiveCount }}>
              {count}
            </span>
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -1,
                height: 2,
                borderRadius: 2,
                background: COLOR.primary,
                transform: isActive ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left center",
                transition: "transform 0.26s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
