"use client"

import { useState, type ReactNode } from "react"
import { COLOR, KPI_ART_BASE, SHADOW } from "@/lib/tokens"
import { Sparkline } from "./Sparkline"

export interface KpiLegendItem {
  tone: "success" | "danger" | "warning"
  label: string
  count: string | number
  tooltipTitle?: string
  tooltipDetail?: string
}

export interface KpiCardProps {
  titleLead: string
  titleBold: string
  tooltip: string
  value: string
  unit: string
  wash: string
  glyph: string
  legend: KpiLegendItem[]
  trendExtra?: ReactNode
  trendPoints: number[]
  trendChangePct: number
  trendGood: boolean
  /** True when the real backend hasn't computed a week-over-week change yet
   * (e.g. holding-cost/summary's totalHoldingCost: null) — shows a neutral
   * "Not yet available" line instead of a real-looking arrow/percentage
   * built from data that doesn't exist. */
  trendUnavailable?: boolean
}

const DOT_COLOR: Record<KpiLegendItem["tone"], string> = {
  success: COLOR.success,
  danger: COLOR.danger,
  warning: "rgb(230,160,20)",
}

function InfoIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ cursor: "pointer", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,0.32)" strokeWidth="1.7" />
      <path d="M12 10.6v5.2M12 8.1h.01" stroke="rgba(0,0,0,0.32)" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

export function KpiCard({
  titleLead,
  titleBold,
  tooltip,
  value,
  unit,
  wash,
  glyph,
  legend,
  trendExtra,
  trendPoints,
  trendChangePct,
  trendGood,
  trendUnavailable,
}: KpiCardProps) {
  const [titleTip, setTitleTip] = useState(false)
  const [legendTip, setLegendTip] = useState<number | null>(null)
  const trendDown = trendChangePct <= 0
  const trendColor = trendUnavailable ? "rgb(150,146,168)" : trendGood ? "rgb(10,124,74)" : "#e0392e"
  const trendBg = trendUnavailable ? "rgba(120,116,138,0.08)" : trendGood ? "rgba(10,124,74,0.07)" : "rgba(224,57,46,0.06)"

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0%",
        minWidth: 0,
        minHeight: 174,
        boxSizing: "border-box",
        padding: "20px 20px 13px",
        borderRadius: 16,
        background: "#fff",
        border: `1px solid ${COLOR.borderCard}`,
        boxShadow: SHADOW.card,
        overflow: "hidden",
      }}
    >
      {/* decorative wash + glyph artwork, hot-linked from the live Studio OS host */}
      <span aria-hidden style={{ position: "absolute", top: -13, right: -19, width: 149, height: 149, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.42) 62%, rgba(255,255,255,0) 86%)", pointerEvents: "none" }} />
      <img alt="" src={`${KPI_ART_BASE}/${wash}`} width={140} height={140} style={{ position: "absolute", top: -50, right: -40, pointerEvents: "none" }} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
      <img alt="" src={`${KPI_ART_BASE}/${glyph}`} width={34} height={34} style={{ position: "absolute", top: 20, right: 20, pointerEvents: "none" }} onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20, lineHeight: "34px", fontWeight: 500, color: "rgb(8,8,8)", whiteSpace: "nowrap" }}>
          {titleLead} <strong style={{ fontWeight: 800 }}>{titleBold}</strong>
        </span>
        <span
          style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
          onMouseEnter={() => setTitleTip(true)}
          onMouseLeave={() => setTitleTip(false)}
        >
          <InfoIcon />
          {titleTip && (
            <span
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 20,
                width: 210,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#fff",
                border: "1px solid rgba(40,35,70,0.1)",
                boxShadow: "rgba(40,35,80,0.28) 0px 12px 30px -10px",
                fontSize: 12,
                fontWeight: 500,
                color: "rgb(91,86,112)",
                lineHeight: "17px",
              }}
            >
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: COLOR.ink, marginBottom: 4 }}>
                What is {titleLead} {titleBold}?
              </span>
              {tooltip}
            </span>
          )}
        </span>
      </div>

      <div style={{ position: "relative", marginTop: 4, fontSize: 32, lineHeight: "50px", fontWeight: 700, color: "rgb(0,0,0)", whiteSpace: "nowrap" }}>
        {value}
        <span style={{ fontSize: 20 }}> {unit}</span>
        <span
          aria-label={trendUnavailable ? "trend not available" : trendDown ? "trending down" : "trending up"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            verticalAlign: "middle",
            position: "relative",
            top: -3,
            marginLeft: 10,
            width: 30,
            height: 30,
            borderRadius: 10,
            background: trendBg,
          }}
        >
          {trendUnavailable ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 12h12" stroke={trendColor} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: trendDown ? "none" : "rotate(180deg)" }}>
              <path d="M12 4v16M12 20l-6.5-6.5M12 20l6.5-6.5" stroke={trendColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </div>

      <div style={{ position: "relative", marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
        {trendUnavailable ? (
          <span style={{ fontSize: 12, fontWeight: 600, color: COLOR.textMuted }}>Not computed by the backend yet</span>
        ) : (
          <>
            <Sparkline points={trendPoints} color={trendColor} />
            <span style={{ fontSize: 12, fontWeight: 700, color: trendColor }}>
              {trendChangePct > 0 ? "+" : ""}
              {trendChangePct}%
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: COLOR.textMuted }}>vs last week</span>
          </>
        )}
        {trendExtra && <span style={{ marginLeft: "auto" }}>{trendExtra}</span>}
      </div>

      <div style={{ position: "relative", marginTop: 12, height: 1, background: COLOR.divider }} />

      <div style={{ position: "relative", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {legend.map((item, i) => (
          <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: DOT_COLOR[item.tone], flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.8)", whiteSpace: "nowrap" }}>{item.label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "rgb(0,0,0)", whiteSpace: "nowrap" }}>{item.count}</span>
            {item.tooltipDetail && (
              <span
                style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
                onMouseEnter={() => setLegendTip(i)}
                onMouseLeave={() => setLegendTip(null)}
              >
                <InfoIcon size={13} />
                {legendTip === i && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 30,
                      width: 196,
                      padding: "9px 11px",
                      borderRadius: 10,
                      background: "#fff",
                      border: "1px solid rgba(40,35,70,0.1)",
                      boxShadow: "rgba(20,16,40,0.28) 0px 14px 34px -14px",
                      whiteSpace: "normal",
                    }}
                  >
                    <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLOR.ink, marginBottom: 3 }}>{item.tooltipTitle}</span>
                    <span style={{ display: "block", fontSize: 12, fontWeight: 500, lineHeight: "17px", color: "rgba(40,35,70,0.6)" }}>
                      {item.tooltipDetail}
                    </span>
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
