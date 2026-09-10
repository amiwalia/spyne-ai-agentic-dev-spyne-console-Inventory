"use client"

import { useState } from "react"
import type { UatPartnerStatus } from "@/lib/uat-adapter"
import { formatListedAt } from "@/lib/format"
import { COLOR } from "@/lib/tokens"

/** Freshest of "never synced" (null), "synced once, a while ago" (still a
 * connected partner — this endpoint distinguishes that from never having
 * connected at all), and "synced recently." No documented freshness
 * threshold exists for this endpoint, so "recent" is a judgment call: within
 * the last 24 hours, matching how often a nightly IMS/DMS sync typically
 * runs. */
const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000

export function statusColor(partners: UatPartnerStatus[] | undefined, nowMs: number): string {
  if (!partners) return "rgba(40,35,70,0.25)"
  const synced = partners.filter((p) => p.lastReceivedAt)
  if (synced.length === 0) return "rgb(192,38,26)"
  const freshest = Math.max(...synced.map((p) => new Date(p.lastReceivedAt!).getTime()))
  return nowMs - freshest <= FRESH_WINDOW_MS ? "rgb(10,124,74)" : "rgb(178,94,0)"
}

export function summaryText(partners: UatPartnerStatus[] | undefined): string {
  if (!partners) return "Checking sync status…"
  const synced = partners.filter((p) => p.lastReceivedAt)
  if (synced.length === 0) return "Not yet synced"
  const freshest = synced.reduce((a, b) => (new Date(a.lastReceivedAt!) > new Date(b.lastReceivedAt!) ? a : b))
  return `Last synced: ${formatListedAt(freshest.lastReceivedAt!)}`
}

export function IntegrationStatusIndicator({ partners }: { partners: UatPartnerStatus[] | undefined }) {
  const [hover, setHover] = useState(false)
  const nowMs = Date.now()

  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 7, cursor: "default" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(partners, nowMs), flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 500, color: "rgb(111,106,128)" }}>{summaryText(partners)}</span>

      {hover && partners && partners.length > 0 && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 30,
            width: 260,
            padding: "10px 12px",
            borderRadius: 10,
            background: "#fff",
            border: `1px solid ${COLOR.borderSoft}`,
            boxShadow: "rgba(20,16,40,0.22) 0px 14px 32px -14px",
          }}
        >
          <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: COLOR.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
            DMS / IMS connections
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {partners.map((p) => (
              <span key={p.partnerId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: p.lastReceivedAt ? "rgb(10,124,74)" : "rgb(192,38,26)",
                  }}
                />
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: COLOR.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.partnerName}
                </span>
                <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 500, color: p.lastReceivedAt ? COLOR.textMuted : "rgb(192,38,26)" }}>
                  {p.lastReceivedAt ? formatListedAt(p.lastReceivedAt) : "Not connected yet"}
                </span>
              </span>
            ))}
          </span>
        </span>
      )}
    </span>
  )
}
