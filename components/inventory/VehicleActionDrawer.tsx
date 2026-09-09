"use client"

import { useState, type ReactNode } from "react"
import { ArrowLeft, Check, Eye, ImageOff, MousePointerClick, RotateCw } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { formatCurrency, formatMileage } from "@/lib/format"
import { getDemandSignal, isHighDemand } from "@/lib/mock-data"
import { COLOR, GRADIENT, SHELL } from "@/lib/tokens"
import { VehicleDetailsTab } from "./vdp/VehicleDetailsTab"
import { MerchandiseStatusTab } from "./vdp/MerchandiseStatusTab"
import { PublishStatusTab } from "./vdp/PublishStatusTab"
import { PricingTab } from "./vdp/PricingTab"

type ActionKey = "noPhotos" | "needsPromotion" | "notLiveYet"

interface VehicleActionDrawerProps {
  vehicle: Vehicle | null
  onClose: () => void
  onResolve: (vehicleId: string, key: ActionKey) => void
  onApplyPrice: (vehicleId: string, newPrice: number) => void
}

const TABS = ["Overview", "Vehicle Details", "Merchandise Status", "Publish Status", "Pricing"] as const
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

export function VehicleActionDrawer({ vehicle, onClose, onResolve, onApplyPrice }: VehicleActionDrawerProps) {
  const [tab, setTab] = useState<Tab>("Overview")

  if (!vehicle) return null

  const pendingChecklist = CHECKLIST.filter((row) => vehicle.needsAction[row.key])
  const merchandisedDone = pendingChecklist.length === 0
  const openCount = merchandisedDone ? 0 : 1
  const demand = getDemandSignal(vehicle)

  const handleFixNow = () => {
    pendingChecklist.forEach((row) => onResolve(vehicle.id, row.key))
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

                {tab === "Vehicle Details" && <VehicleDetailsTab key={vehicle.id} vehicle={vehicle} />}

                {tab === "Merchandise Status" && (
                  <MerchandiseStatusTab vehicle={vehicle} onFixPhotos={() => onResolve(vehicle.id, "noPhotos")} />
                )}

                {tab === "Publish Status" && (
                  <PublishStatusTab vehicle={vehicle} onFixListing={() => onResolve(vehicle.id, "notLiveYet")} />
                )}

                {tab === "Pricing" && <PricingTab vehicle={vehicle} onApplyPrice={(price) => onApplyPrice(vehicle.id, price)} />}
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

              <ProcessStep title="Demand" subtitle={demand.interest.summary} status={isHighDemand(vehicle) ? "done" : "pending"} last>
                <div style={{ marginTop: 11, border: `1px solid ${COLOR.borderSoft}`, borderRadius: 12, padding: "0 13px" }}>
                  <DemandRow icon={Eye} label="Page views" value={String(demand.page.pageViews)} sub={`${demand.page.avgScrollDepth}% scroll · ${demand.page.sectionReached}`} first />
                  <DemandRow icon={MousePointerClick} label="CTA clicks" value={String(demand.clicks.ctaClicks)} />
                  <DemandRow icon={ImageOff} label="Photos opened" value={String(demand.vehicle.photosOpened)} sub={demand.vehicle.photosReopened > 0 ? `${demand.vehicle.photosReopened} re-opened` : undefined} />
                  <DemandRow icon={RotateCw} label="360° spin" value={demand.vehicle.spin360Viewed ? "Viewed" : "Not viewed"} tone={demand.vehicle.spin360Viewed ? "positive" : "muted"} />
                </div>
              </ProcessStep>
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

const DEMAND_TONE_COLOR: Record<"positive" | "warning" | "muted" | "default", string> = {
  positive: "rgb(10,124,74)",
  warning: "rgb(178,94,0)",
  muted: "rgba(40,35,70,0.4)",
  default: COLOR.ink,
}

function DemandRow({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
  first = false,
}: {
  icon: typeof Eye
  label: string
  value: string
  sub?: string
  tone?: "positive" | "warning" | "muted" | "default"
  first?: boolean
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", boxSizing: "border-box", padding: "11px 0", borderTop: first ? "none" : `1px solid ${COLOR.borderSofter}` }}>
      <Icon size={14} color="rgba(40,35,70,0.4)" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: "rgba(40,35,70,0.6)", whiteSpace: "nowrap" }}>{label}</span>
        {sub && <span style={{ display: "block", marginTop: 2, fontSize: 11.5, fontWeight: 500, color: "rgba(40,35,70,0.4)" }}>{sub}</span>}
      </span>
      <span style={{ flexShrink: 0, fontSize: 13.5, fontWeight: 700, color: DEMAND_TONE_COLOR[tone] }}>{value}</span>
    </div>
  )
}
