"use client"

import { CheckCircle2, TrendingDown, TrendingUp } from "lucide-react"
import type { DaysSupplyStatus } from "@/lib/types"

export const SUPPLY_STATUS_META: Record<DaysSupplyStatus, { label: string; bg: string; text: string; icon: typeof TrendingUp }> = {
  overstocked: { label: "Overstocked", bg: "rgb(253,236,234)", text: "rgb(192,38,26)", icon: TrendingDown },
  understocked: { label: "Short Supply", bg: "rgb(234,240,253)", text: "rgb(37,84,214)", icon: TrendingUp },
  on_target: { label: "On Target", bg: "rgb(231,247,239)", text: "rgb(10,124,74)", icon: CheckCircle2 },
}

export function SupplyStatusBadge({ status }: { status: DaysSupplyStatus | null }) {
  if (status === null) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 9px",
          borderRadius: 999,
          background: "rgb(241,241,245)",
          color: "rgb(120,116,138)",
          fontSize: 11,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        Not yet scored
      </span>
    )
  }

  const meta = SUPPLY_STATUS_META[status]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px 3px 7px",
        borderRadius: 999,
        background: meta.bg,
        color: meta.text,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <meta.icon size={11} />
      {meta.label}
    </span>
  )
}
