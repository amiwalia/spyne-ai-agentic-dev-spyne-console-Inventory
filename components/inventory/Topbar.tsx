"use client"

import { ChevronDown } from "lucide-react"
import { SpyneLogo } from "./SpyneLogo"
import { GRADIENT, SHELL } from "@/lib/tokens"

export function Topbar() {
  return (
    <header
      style={{
        height: SHELL.topbarHeight,
        background: "#fff",
        borderBottom: `1px solid ${SHELL.sidebarBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SpyneLogo size={36} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "rgb(26,26,26)", lineHeight: 1.15 }}>Dealer OS</div>
          <div style={{ fontSize: 11, color: "rgb(111,106,128)", lineHeight: 1.15 }}>by spyne</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "rgb(107,114,128)" }}>Lite</span>
          <button
            type="button"
            style={{
              height: 34,
              padding: "0 14px",
              borderRadius: 9,
              border: "none",
              background: GRADIENT.upgradePro,
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Upgrade to Pro
          </button>
        </div>

        <button
          type="button"
          style={{
            height: 44,
            padding: "6px 12px",
            borderRadius: 10,
            border: `1px solid ${SHELL.pillBorder}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: "rgb(26,26,26)",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            public
          </span>
          Website
          <ChevronDown size={15} />
        </button>

        <div style={{ width: 1, height: 28, background: SHELL.sidebarBorder }} />

        <button
          type="button"
          style={{
            height: 44,
            padding: "6px 12px",
            borderRadius: 10,
            border: `1px solid ${SHELL.pillBorder}`,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            storefront
          </span>
          <span style={{ textAlign: "left" }}>
            <span style={{ display: "block", fontSize: 11, color: "rgb(111,106,128)", lineHeight: 1.2 }}>Mega Dealer</span>
            <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "rgb(26,26,26)", lineHeight: 1.2 }}>Ford Sec 48</span>
          </span>
          <ChevronDown size={15} />
        </button>

        <button
          type="button"
          aria-label="Account menu"
          style={{ width: 44, height: 44, borderRadius: 9999, overflow: "hidden", border: "none", padding: 0, cursor: "pointer", background: "rgb(230,228,238)" }}
        />
      </div>
    </header>
  )
}
