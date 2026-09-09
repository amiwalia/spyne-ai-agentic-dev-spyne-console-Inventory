"use client"

import { useState } from "react"
import { COLOR } from "@/lib/tokens"

type Scope = "group" | "rooftop"

export function DealerScopeToggle() {
  const [scope, setScope] = useState<Scope>("rooftop")

  const segment = (value: Scope, label: string) => {
    const isActive = scope === value
    return (
      <button
        type="button"
        onClick={() => setScope(value)}
        style={{
          height: 36,
          padding: "0 16px",
          borderRadius: 9,
          border: "none",
          background: isActive ? COLOR.chipActiveBg : "transparent",
          color: isActive ? COLOR.primary : COLOR.ink,
          fontWeight: isActive ? 700 : 600,
          fontSize: 13.5,
          fontFamily: "inherit",
          cursor: "pointer",
          transition: "0.16s",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: 44,
        padding: 4,
        boxSizing: "border-box",
        borderRadius: 12,
        border: `1px solid ${COLOR.borderSoft}`,
        background: "#fff",
      }}
    >
      {segment("group", "Group Dealer")}
      {segment("rooftop", "Rooftop")}
    </div>
  )
}
