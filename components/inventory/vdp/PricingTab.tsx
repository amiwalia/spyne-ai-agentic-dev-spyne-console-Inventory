"use client"

import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { getPricingInsight } from "@/lib/mock-data"
import { COLOR, GRADIENT } from "@/lib/tokens"

export function PricingTab({ vehicle, onApplyPrice }: { vehicle: Vehicle; onApplyPrice: (price: number) => void }) {
  const insight = getPricingInsight(vehicle)

  return (
    <div style={{ paddingBottom: 4, display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLOR.ink, letterSpacing: -0.3 }}>Competitive Pricing</h3>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, fontWeight: 500, color: "rgba(40,35,70,0.45)" }}>
          Your price: <strong style={{ color: COLOR.ink }}>{formatCurrency(vehicle.price)}</strong> · {vehicle.ageDays}d in stock
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {insight.radii.map((r) => {
          const deltaPct = Math.round(((vehicle.price - r.avgPrice) / vehicle.price) * 100)
          const above = deltaPct > 0
          return (
            <div
              key={r.radiusMiles}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 16px",
                border: `1px solid ${COLOR.borderCard}`,
                borderRadius: 14,
                boxShadow: "rgba(20,16,40,0.02) 0px 1px 2px, rgba(20,16,40,0.07) 0px 5px 12px -12px",
              }}
            >
              <div>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLOR.ink }}>{r.radiusMiles} mile radius</span>
                <span style={{ display: "block", marginTop: 2, fontSize: 12, color: "rgba(40,35,70,0.45)" }}>{r.competitorCount} competing listings</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLOR.ink }}>{formatCurrency(r.avgPrice)} avg</span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    justifyContent: "flex-end",
                    marginTop: 2,
                    fontSize: 12,
                    fontWeight: 700,
                    color: above ? "rgb(192,38,26)" : "rgb(10,124,74)",
                  }}
                >
                  {above ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {above ? "+" : ""}
                  {deltaPct}% vs market
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {insight.recommendation ? (
        <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", border: "1px solid rgba(224,134,0,0.3)", borderRadius: 14, background: "rgb(255,250,240)" }}>
          <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 11, background: "rgb(255,244,229)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={17} color="rgb(178,94,0)" />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLOR.ink }}>Recommend dropping to {formatCurrency(insight.recommendation.suggestedPrice)}</span>
            <span style={{ display: "block", marginTop: 2, fontSize: 12.5, fontWeight: 500, color: "rgba(40,35,70,0.5)" }}>{insight.recommendation.reason}</span>
          </span>
          <button
            type="button"
            onClick={() => onApplyPrice(insight.recommendation!.suggestedPrice)}
            style={{
              flexShrink: 0,
              height: 38,
              padding: "0 18px",
              borderRadius: 10,
              border: "1px solid transparent",
              background: GRADIENT.addVehicle,
              color: "#fff",
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Apply price
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", border: `1px solid ${COLOR.borderCard}`, borderRadius: 14, background: "rgb(231,247,239)" }}>
          <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 11, background: "rgba(10,124,74,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingDown size={17} color="rgb(10,124,74)" />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLOR.ink }}>Priced competitively</span>
            <span style={{ display: "block", marginTop: 2, fontSize: 12.5, fontWeight: 500, color: "rgba(40,35,70,0.5)" }}>
              No pricing action needed right now — this unit is in line with or below nearby market averages.
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
