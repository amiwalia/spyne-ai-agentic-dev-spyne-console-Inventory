"use client"

import { useState } from "react"
import { ArrowRight, ChevronDown, X } from "lucide-react"
import { COLOR, SHADOW } from "@/lib/tokens"

interface HoldingCostPopoverProps {
  value: number
  onSave: (value: number) => void
}

export function HoldingCostPopover({ value, onSave }: HoldingCostPopoverProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(String(value))

  const close = () => setOpen(false)

  const handleOpen = () => {
    setDraft(String(value))
    setOpen(true)
  }

  const handleSave = () => {
    const parsed = Number(draft)
    if (!Number.isNaN(parsed) && parsed >= 0) onSave(parsed)
    close()
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleOpen}
        style={{
          height: 44,
          minWidth: 160,
          padding: "0 16px",
          borderRadius: 12,
          border: `1px solid ${COLOR.borderSoft}`,
          background: "transparent",
          fontWeight: 700,
          fontSize: 13.5,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: SHADOW.pillBrand,
        }}
      >
        <span style={{ color: COLOR.primary, fontWeight: 600 }}>
          Holding Cost: <span style={{ fontWeight: 700 }}>${value}/day</span>
        </span>
        <ChevronDown size={15} color={COLOR.primary} />
      </button>

      {open && (
        <>
          <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 2000 }} />
          <div
            className="spyne-animate-slide-up"
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              zIndex: 2001,
              width: 400,
              maxWidth: "calc(100vw - 40px)",
              background: "#fff",
              borderRadius: 18,
              border: "1px solid rgba(40,35,70,0.08)",
              boxShadow: "rgba(20,16,40,0.4) 0px 30px 70px -20px",
              padding: "24px 26px 26px",
              textAlign: "left",
            }}
          >
            <div style={{ position: "relative" }}>
              <button aria-label="Close" onClick={close} style={{ position: "absolute", top: -2, right: -4, background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X size={18} color="#15131c" />
              </button>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLOR.ink, letterSpacing: -0.4 }}>Holding Cost</h2>
              <p style={{ margin: "5px 0 0", fontSize: 14, color: "rgba(40,35,70,0.5)", fontWeight: 500 }}>$/car/day applied across your inventory</p>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: COLOR.ink }}>Your daily holding cost</span>
                <span
                  title="Average cost of holding one unsold vehicle per day (financing, depreciation, insurance, floor space)."
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "1.4px solid rgba(40,35,70,0.3)",
                    color: "rgba(40,35,70,0.5)",
                    fontSize: 11,
                    fontWeight: 700,
                    fontStyle: "italic",
                    cursor: "help",
                    flexShrink: 0,
                  }}
                >
                  i
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, height: 54, padding: "0 18px", borderRadius: 12, border: "1.5px solid rgba(40,35,70,0.14)", background: "#fff" }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: COLOR.ink }}>$</span>
                <input
                  type="number"
                  min={0}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 18, fontWeight: 600, color: COLOR.ink, width: "100%" }}
                />
              </div>
            </div>

            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                width: "100%",
                marginTop: 18,
                padding: "14px 18px",
                borderRadius: 12,
                border: "none",
                background: "rgb(242,238,254)",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: COLOR.ink }}>Don&apos;t know your holding cost?</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: COLOR.primary, whiteSpace: "nowrap" }}>
                Let&apos;s calculate
                <ArrowRight size={16} />
              </span>
            </button>

            <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
              <button
                type="button"
                onClick={close}
                style={{ flex: 1, height: 52, borderRadius: 12, border: "1.5px solid rgba(40,35,70,0.15)", background: "#fff", color: COLOR.ink, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 12,
                  border: "none",
                  background: COLOR.primary,
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "rgba(70,0,242,0.275) 0px 10px 24px -10px",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
