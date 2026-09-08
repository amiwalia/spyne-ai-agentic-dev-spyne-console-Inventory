"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft, ArrowRight, Check, ImageOff } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { formatCurrency, formatMileage } from "@/lib/format"
import { COLOR, GRADIENT, SHELL } from "@/lib/tokens"

type ActionKey = "noPhotos" | "needsPromotion" | "notLiveYet"

interface VehicleActionDrawerProps {
  vehicle: Vehicle | null
  onClose: () => void
  onResolve: (vehicleId: string, key: ActionKey) => void
  onAdjustPrice: (vehicleId: string) => void
}

const TABS = ["Overview", "Vehicle Details", "Merchandise Status", "Publish Status"] as const
type Tab = (typeof TABS)[number]

const CHECKLIST: { key: ActionKey; label: string; value: string }[] = [
  { key: "noPhotos", label: "Photo score", value: "Not scored" },
  { key: "notLiveYet", label: "Website listing", value: "Not live" },
  { key: "needsPromotion", label: "Promotion", value: "Off" },
]

const DETAIL_ROWS = (v: Vehicle) => [
  { label: "Exterior Color", value: v.exteriorColor ?? "Not specified" },
  { label: "Interior Trim", value: v.interiorTrim ?? "Not specified" },
  { label: "Make", value: v.make },
  { label: "Mileage", value: formatMileage(v.mileage) },
  { label: "Model", value: v.model },
  { label: "Trim", value: v.trim ?? "—" },
  { label: "Year", value: String(v.year) },
  { label: "Price", value: formatCurrency(v.price) },
  { label: "Provenance", value: `${v.source.channel} · ${v.source.detail}` },
]

export function VehicleActionDrawer({ vehicle, onClose, onResolve, onAdjustPrice }: VehicleActionDrawerProps) {
  const [tab, setTab] = useState<Tab>("Overview")
  const [reply, setReply] = useState("")
  const [replySent, setReplySent] = useState(false)

  if (!vehicle) return null

  const pendingChecklist = CHECKLIST.filter((row) => vehicle.needsAction[row.key])
  const merchandisedDone = pendingChecklist.length === 0
  const openCount = (merchandisedDone ? 0 : 1) + 1 // "Shopper engaged" stage is always open in this demo narrative

  const handleFixNow = () => {
    pendingChecklist.forEach((row) => onResolve(vehicle.id, row.key))
  }

  const handleSendReply = (e: FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return
    setReplySent(true)
    setReply("")
    setTimeout(() => setReplySent(false), 2000)
  }

  return (
    <div
      style={{
        position: "fixed",
        top: SHELL.topbarHeight + 1,
        left: SHELL.sidebarWidth,
        right: 0,
        bottom: 0,
        zIndex: 90,
        background: "rgb(252,252,252)",
        overflowY: "auto",
      }}
      className="spyne-animate-slide-up"
    >
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "26px 32px 72px" }}>
        <button
          type="button"
          onClick={onClose}
          style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 22, padding: 0, border: "none", background: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "rgb(58,53,80)" }}
        >
          <ArrowLeft size={18} />
          Back to Inventory
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: 22, alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            <div
              style={{
                background: "radial-gradient(36% 52% at 94% 12%, rgba(178,158,250,0.22) 0%, rgba(178,158,250,0) 72%), rgb(255,255,255)",
                border: `1px solid ${COLOR.borderCard}`,
                borderRadius: 20,
                boxShadow: "rgba(20,16,40,0.02) 0px 1px 2px, rgba(20,16,40,0.08) 0px 6px 16px -14px",
                boxSizing: "border-box",
                padding: "20px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 18,
              }}
            >
              <div style={{ width: 196, height: 126, flexShrink: 0, borderRadius: 18, overflow: "hidden", background: "rgb(244,244,248)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {vehicle.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vehicle.photoUrl} alt={vehicle.model} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <ImageOff size={22} color="rgb(180,180,190)" />
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: -0.7, color: COLOR.ink }}>
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim ?? ""}
                  </h1>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 11px", borderRadius: 8, background: "rgb(231,247,239)", color: "rgb(10,124,74)", fontSize: 13, fontWeight: 700 }}>
                    Active
                  </span>
                </div>
                <p style={{ margin: "13px 0 0", display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", fontSize: 16, fontWeight: 500, color: "rgba(40,35,70,0.5)" }}>
                  <span>{vehicle.vin}</span>
                  <span style={{ opacity: 0.45 }}>·</span>
                  <span>{formatMileage(vehicle.mileage)}</span>
                </p>
                <p style={{ margin: "15px 0 0", fontSize: 18, fontWeight: 400, color: COLOR.ink, letterSpacing: -0.2 }}>
                  <span style={{ fontWeight: 700 }}>{formatCurrency(vehicle.price)}</span> · {vehicle.ageDays}d in stock
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: `1px solid ${COLOR.borderCard}`,
                borderRadius: 20,
                boxShadow: "rgba(20,16,40,0.02) 0px 1px 2px, rgba(20,16,40,0.08) 0px 6px 16px -14px",
                boxSizing: "border-box",
                padding: "0 0 22px",
                minWidth: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "16px 24px 0", borderBottom: `1px solid ${COLOR.borderSofter}` }}>
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      position: "relative",
                      padding: "0 14px 14px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 14.5,
                      fontWeight: tab === t ? 700 : 500,
                      color: tab === t ? COLOR.primary : "rgba(40,35,70,0.58)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t}
                    {tab === t && <span style={{ position: "absolute", left: 10, right: 10, bottom: -1, height: 2, borderRadius: 2, background: COLOR.primary }} />}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0, padding: "22px 24px 0" }}>
                {tab === "Overview" && (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                        overflow: "hidden",
                        borderRadius: 14,
                        border: `1px solid ${COLOR.borderCard}`,
                        background: "#fff",
                        boxShadow: "rgba(20,16,40,0.02) 0px 1px 2px, rgba(20,16,40,0.07) 0px 5px 12px -12px",
                      }}
                    >
                      <StatCell label="Price" value={formatCurrency(vehicle.price)} />
                      <StatCell label="Mileage" value={formatMileage(vehicle.mileage)} />
                      <StatCell label="Days in stock" value={`${vehicle.ageDays}d`} />
                      <StatCell
                        label="Status"
                        value={
                          <span style={{ display: "inline-flex", alignItems: "center", height: 27, padding: "0 11px", borderRadius: 8, background: "rgb(231,247,239)", color: "rgb(10,124,74)", fontSize: 14, fontWeight: 700 }}>
                            Active
                          </span>
                        }
                      />
                    </div>

                    <div style={{ paddingTop: 22, borderTop: `1px solid ${COLOR.borderSofter}` }}>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: COLOR.ink, letterSpacing: -0.1 }}>Details</h2>
                      <DetailGrid rows={DETAIL_ROWS(vehicle)} />
                    </div>
                  </>
                )}

                {tab === "Vehicle Details" && (
                  <div style={{ paddingBottom: 4 }}>
                    <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: COLOR.ink }}>Details</h2>
                    <DetailGrid rows={DETAIL_ROWS(vehicle)} />
                  </div>
                )}

                {tab === "Merchandise Status" && (
                  <div style={{ paddingBottom: 4, display: "flex", flexDirection: "column", gap: 10 }}>
                    {CHECKLIST.map((row) => (
                      <ChecklistLine key={row.key} label={row.label} done={!vehicle.needsAction[row.key]} value={row.value} />
                    ))}
                    {!merchandisedDone && (
                      <button type="button" onClick={handleFixNow} className="vdp-fix-btn" style={{ marginTop: 6 }}>
                        Fix now
                      </button>
                    )}
                  </div>
                )}

                {tab === "Publish Status" && (
                  <div style={{ paddingBottom: 4 }}>
                    <ChecklistLine label="Website listing" done={!vehicle.needsAction.notLiveYet} value="Not live" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column — vehicle process */}
          <div
            style={{
              background: "radial-gradient(150px 110px at 100% 0%, rgba(178,158,250,0.24) 0%, rgba(178,158,250,0) 70%), rgb(255,255,255)",
              border: `1px solid ${COLOR.borderCard}`,
              borderRadius: 20,
              boxShadow: "rgba(20,16,40,0.02) 0px 1px 2px, rgba(20,16,40,0.08) 0px 6px 16px -14px",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: COLOR.ink, letterSpacing: -0.4 }}>Vehicle process</h2>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 22, padding: "0 8px", borderRadius: 7, background: "rgb(255,244,229)", color: "rgb(178,94,0)", fontSize: 12, fontWeight: 700 }}>
                {openCount} open
              </span>
            </div>

            <div style={{ padding: "0 20px 22px" }}>
              <ProcessStep
                title="In inventory"
                subtitle={`${vehicle.source.channel} · ${vehicle.source.detail} · ${vehicle.ageDays}d in stock`}
                status="done"
              />

              <ProcessStep title="Merchandised & live" subtitle={merchandisedDone ? "Live and merchandised" : "Holding cost accrues until these clear"} status={merchandisedDone ? "done" : "pending"}>
                {!merchandisedDone && (
                  <div style={{ marginTop: 11, border: `1px solid ${COLOR.borderSoft}`, borderRadius: 12, padding: "0 13px" }}>
                    {pendingChecklist.map((row, i) => (
                      <button
                        key={row.key}
                        type="button"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "11px 0",
                          border: "none",
                          borderTop: i > 0 ? `1px solid ${COLOR.borderSofter}` : "none",
                          background: "none",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 500, color: "rgba(40,35,70,0.6)", whiteSpace: "nowrap" }}>{row.label}</span>
                        <span style={{ flexShrink: 0, fontSize: 13.5, fontWeight: 700, color: "rgb(192,38,26)" }}>{row.value}</span>
                      </button>
                    ))}
                    <button type="button" onClick={handleFixNow} className="vdp-fix-btn" style={{ marginTop: 12, marginBottom: 12, width: "100%" }}>
                      Fix now
                    </button>
                  </div>
                )}
              </ProcessStep>

              <ProcessStep title="Shopper engaged" subtitle="Vini answered, booked the test drive, and is holding the thread" status="pending">
                <div style={{ marginTop: 14 }}>
                  <div style={{ padding: "9px 12px", borderRadius: "4px 12px 12px", background: "rgb(247,247,250)", fontSize: 13.5, fontWeight: 500, color: "rgb(37,33,58)", lineHeight: 1.45 }}>
                    Is the {vehicle.model} still available? I could come by this week.
                  </div>
                  <div style={{ marginTop: 5, fontSize: 12, fontWeight: 500, color: "rgba(40,35,70,0.42)" }}>Ravi Shah · 2h ago</div>
                  <button
                    type="button"
                    style={{
                      marginTop: 11,
                      width: "100%",
                      boxSizing: "border-box",
                      height: 44,
                      borderRadius: 12,
                      border: `1px solid ${COLOR.chipActiveBorder}`,
                      background: "none",
                      color: COLOR.primary,
                      cursor: "pointer",
                      fontSize: 13.5,
                      fontWeight: 700,
                    }}
                  >
                    Let Vini reply
                  </button>
                  <form onSubmit={handleSendReply} style={{ marginTop: 8, display: "flex", alignItems: "center", height: 44, paddingRight: 4, boxSizing: "border-box", borderRadius: 12, border: `1px solid ${COLOR.borderSoft}`, background: "#fff" }}>
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={replySent ? "Reply sent ✓" : "Or reply yourself…"}
                      aria-label="Reply to the shopper"
                      style={{ flex: 1, minWidth: 0, height: "100%", padding: "0 12px", border: "none", outline: "none", background: "transparent", fontSize: 13, fontWeight: 500, color: COLOR.ink }}
                    />
                    <button
                      type="submit"
                      aria-label="Send reply"
                      disabled={!reply.trim()}
                      style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 10, border: "none", background: COLOR.chipActiveBg, cursor: reply.trim() ? "pointer" : "default", display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: reply.trim() ? 1 : 0.45 }}
                    >
                      <ArrowRight size={15} color={COLOR.primary} />
                    </button>
                  </form>
                </div>
              </ProcessStep>

              <ProcessStep title="At the desk" subtitle="Full thread handed over — nothing re-asked" status="future" />
              <ProcessStep title="In the service drive" subtitle="After delivery, first visit booked" status="future" last />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .vdp-fix-btn {
          height: 44px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: ${GRADIENT.addVehicle};
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 700;
          box-shadow: rgba(70, 0, 242, 0.21) 0px 8px 18px -8px;
        }
      `}</style>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ padding: "15px 16px 17px", minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: "rgba(40,35,70,0.4)", whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 7, fontSize: 18, fontWeight: 700, color: COLOR.ink, letterSpacing: -0.4, whiteSpace: "nowrap" }}>{value}</div>
    </div>
  )
}

function DetailGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14, marginTop: 14 }}>
      {rows.map((row) => (
        <div key={row.label} style={{ minWidth: 0, border: `1px solid ${COLOR.borderCard}`, borderRadius: 14, boxShadow: "rgba(20,16,40,0.02) 0px 1px 2px, rgba(20,16,40,0.07) 0px 5px 12px -12px", padding: "4px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "13px 0" }}>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(40,35,70,0.5)", whiteSpace: "nowrap" }}>{row.label}</span>
            <span style={{ minWidth: 0, fontSize: 14.5, fontWeight: 600, color: COLOR.ink, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChecklistLine({ label, done, value }: { label: string; done: boolean; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", border: `1px solid ${COLOR.borderCard}`, borderRadius: 12 }}>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(40,35,70,0.6)" }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: done ? "rgb(10,124,74)" : "rgb(192,38,26)" }}>{done ? "Done" : value}</span>
    </div>
  )
}

function ProcessStep({
  title,
  subtitle,
  status,
  children,
  last = false,
}: {
  title: string
  subtitle: string
  status: "done" | "pending" | "future"
  children?: ReactNode
  last?: boolean
}) {
  return (
    <div style={{ position: "relative", display: "flex", gap: 14, paddingBottom: last ? 4 : 18 }}>
      {!last && (
        <span
          style={{
            position: "absolute",
            left: 13,
            top: 28,
            bottom: 0,
            width: 2,
            borderRadius: 2,
            background: status === "done" ? "rgba(106,75,242,0.18)" : "rgba(40,35,70,0.055)",
          }}
        />
      )}
      <span
        style={{
          position: "relative",
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: "50%",
          boxSizing: "border-box",
          background: status === "done" ? GRADIENT.addVehicle : "#fff",
          border: status === "done" ? "none" : `2px solid ${status === "pending" ? "rgba(224,134,0,0.38)" : "rgba(40,35,70,0.22)"}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {status === "done" ? (
          <Check size={14} color="#fff" strokeWidth={3} />
        ) : (
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: status === "pending" ? "rgb(224,134,0)" : "rgba(40,35,70,0.22)" }} />
        )}
      </span>
      <span style={{ flex: 1, minWidth: 0, paddingTop: 1, paddingBottom: last ? 0 : 18, borderBottom: last ? "none" : `1px solid ${COLOR.borderSofter}` }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: status === "future" ? "rgba(40,35,70,0.5)" : COLOR.ink, letterSpacing: -0.1 }}>{title}</span>
        <span style={{ display: "block", marginTop: 5, fontSize: 12.5, fontWeight: 500, color: "rgba(40,35,70,0.45)", lineHeight: 1.5 }}>{subtitle}</span>
        {children}
      </span>
    </div>
  )
}
