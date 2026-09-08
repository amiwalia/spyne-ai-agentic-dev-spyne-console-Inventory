"use client"

import type { Vehicle } from "@/lib/types"
import { COLOR } from "@/lib/tokens"

interface Channel {
  name: string
  color: string
  label: string
}

const SYNDICATION: Channel[] = [{ name: "Vincue", color: "rgb(245,0,60)", label: "V" }]
const MARKETPLACES: Channel[] = [
  { name: "Autotrader", color: "rgb(208,1,27)", label: "AT" },
  { name: "Cars.com", color: "rgb(0,120,215)", label: "C" },
  { name: "KBB", color: "rgb(0,71,161)", label: "KBB" },
  { name: "CarGurus", color: "rgb(0,140,110)", label: "CG" },
  { name: "TrueCar", color: "rgb(237,137,57)", label: "TC" },
]
const WEBSITE: Channel[] = [
  { name: "Spyne Smartview", color: "rgb(70,0,242)", label: "S" },
  { name: "Dealer.com", color: "rgb(90,95,110)", label: "D" },
  { name: "DealerOn", color: "rgb(90,95,110)", label: "D" },
]
const SOCIAL: Channel[] = [
  { name: "Facebook", color: "rgb(24,119,242)", label: "f" },
  { name: "Instagram", color: "rgb(193,53,132)", label: "IG" },
  { name: "TikTok", color: "rgb(20,20,20)", label: "TT" },
  { name: "X", color: "rgb(20,20,20)", label: "X" },
]

export function PublishStatusTab({ vehicle, onFixListing }: { vehicle: Vehicle; onFixListing: () => void }) {
  const websiteLive = !vehicle.needsAction.notLiveYet

  return (
    <div style={{ paddingBottom: 4, display: "flex", flexDirection: "column", gap: 22 }}>
      <ChannelGroup title="Syndication Partners" live channels={SYNDICATION} />
      <ChannelGroup title={`Marketplaces (${MARKETPLACES.length})`} live channels={MARKETPLACES} />
      <ChannelGroup title={`Website (${WEBSITE.length})`} live={websiteLive} channels={WEBSITE} />
      <ChannelGroup title={`Social Channels (${SOCIAL.length})`} live channels={SOCIAL} />

      <div style={{ border: `1px solid ${COLOR.borderCard}`, borderRadius: 14, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <span>
          <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLOR.ink }}>Publish settings</span>
          <span style={{ display: "block", marginTop: 2, fontSize: 12.5, fontWeight: 500, color: "rgba(40,35,70,0.45)" }}>Choose which channels this unit syndicates to.</span>
        </span>
        <button
          type="button"
          onClick={onFixListing}
          style={{ flexShrink: 0, height: 38, padding: "0 16px", borderRadius: 10, border: `1px solid ${COLOR.borderButton}`, background: "#fff", color: COLOR.ink, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Configure settings
        </button>
      </div>
    </div>
  )
}

function ChannelGroup({ title, live, channels }: { title: string; live: boolean; channels: Channel[] }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: COLOR.ink, letterSpacing: -0.1 }}>{title}</h4>
        <span
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            height: 22,
            padding: "0 9px",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: "nowrap",
            background: live ? "rgb(231,247,239)" : "rgb(253,236,234)",
            color: live ? "rgb(10,124,74)" : "rgb(192,38,26)",
          }}
        >
          {live ? "Live" : "Not live"}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "14px 18px", marginTop: 14 }}>
        {channels.map((ch) => (
          <span key={ch.name} style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <span
              style={{
                width: 38,
                height: 38,
                flexShrink: 0,
                borderRadius: 10,
                background: ch.color,
                boxSizing: "border-box",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {ch.label}
            </span>
            <span style={{ minWidth: 0, fontSize: 14, fontWeight: 500, color: COLOR.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ch.name}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
