"use client"

import { Car, CheckCircle2, Image as ImageIcon, ImageOff, Info, LayoutGrid, Pencil, X, XCircle } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import type { UatPhotoScore } from "@/lib/uat-adapter"
import { COLOR, GRADIENT } from "@/lib/tokens"

type IssueStatus = "pass" | "fail" | "warning"

interface PhotoIssue {
  key: string
  title: string
  status: IssueStatus
  subtitle: string
  count?: string
  icon: typeof ImageIcon
  iconBg: string
  iconColor: string
}

const STATUS_ICON: Record<IssueStatus, { icon: typeof CheckCircle2; color: string }> = {
  pass: { icon: CheckCircle2, color: "rgb(10,124,74)" },
  fail: { icon: XCircle, color: "rgb(192,38,26)" },
  warning: { icon: Info, color: "rgb(178,94,0)" },
}

const GENERIC_ISSUE_ICONS = [ImageIcon, LayoutGrid, Car, ImageOff]

/** Renders whatever action items the real API returned, generically — the
 * only real-world sample seen while building this had OTHER_IMAGES and
 * INCONSISTENT_BACKGROUND, but any other key the backend returns is still
 * shown (title-cased) rather than silently dropped. All real action items
 * are rendered as "fail" since the API only lists items that need fixing. */
function buildRealIssues(real: UatPhotoScore): PhotoIssue[] {
  if (real.issues.length === 0) {
    return [
      {
        key: "all-clear",
        title: "No open issues",
        status: "pass",
        subtitle: "Meets the current photo quality bar",
        icon: CheckCircle2,
        iconBg: "rgb(231,247,239)",
        iconColor: "rgb(10,124,74)",
      },
    ]
  }
  return real.issues.map((issue, i) => ({
    key: issue.key,
    title: issue.label,
    status: "fail",
    subtitle: "Needs attention",
    count: issue.target !== undefined ? `${issue.actual ?? 0}/${issue.target}` : undefined,
    icon: GENERIC_ISSUE_ICONS[i % GENERIC_ISSUE_ICONS.length],
    iconBg: "rgb(253,236,234)",
    iconColor: "rgb(192,38,26)",
  }))
}

function buildIssues(poor: boolean): PhotoIssue[] {
  return [
    {
      key: "hero",
      title: "Hero Angle Image",
      status: "pass",
      subtitle: "Consistent with inventory",
      icon: ImageIcon,
      iconBg: "rgb(231,247,239)",
      iconColor: "rgb(10,124,74)",
    },
    {
      key: "background",
      title: "Background Image",
      status: poor ? "fail" : "pass",
      subtitle: poor ? "Inconsistent with inventory" : "Consistent with inventory",
      icon: LayoutGrid,
      iconBg: poor ? "rgb(253,236,234)" : "rgb(231,247,239)",
      iconColor: poor ? "rgb(192,38,26)" : "rgb(10,124,74)",
    },
    {
      key: "exterior",
      title: "Exterior Images",
      status: poor ? "warning" : "pass",
      subtitle: poor ? "Not enough images" : "Meets requirements",
      count: poor ? "4/5" : "5/5",
      icon: Car,
      iconBg: "rgb(255,244,229)",
      iconColor: "rgb(178,94,0)",
    },
    {
      key: "interior",
      title: "Interior Images",
      status: poor ? "fail" : "pass",
      subtitle: poor ? "Add more images" : "Meets requirements",
      count: poor ? "0/10" : "10/10",
      icon: ImageOff,
      iconBg: poor ? "rgb(253,236,234)" : "rgb(231,247,239)",
      iconColor: poor ? "rgb(192,38,26)" : "rgb(10,124,74)",
    },
  ]
}

function ScoreGauge({ value }: { value: number }) {
  const size = 220
  const height = 178
  const cx = size / 2
  const cy = 135
  const radius = 88
  const tickCount = 28
  const startAngle = 200
  const endAngle = -20
  const filledTicks = Math.round((value / 10) * tickCount)
  const color = value >= 7 ? "rgb(10,124,74)" : value >= 4 ? "rgb(178,94,0)" : "rgb(192,38,26)"

  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = startAngle - (i / (tickCount - 1)) * (startAngle - endAngle)
    const rad = (angle * Math.PI) / 180
    const x1 = cx + radius * Math.cos(rad)
    const y1 = cy - radius * Math.sin(rad)
    const x2 = cx + (radius - 12) * Math.cos(rad)
    const y2 = cy - (radius - 12) * Math.sin(rad)
    const filled = i < filledTicks
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={filled ? color : "rgba(40,35,70,0.14)"} strokeWidth={5} strokeLinecap="round" />
  })

  return (
    <div style={{ position: "relative", width: size, margin: "0 auto" }}>
      <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
        {ticks}
      </svg>
      <div style={{ position: "absolute", top: cy - 20, left: 0, right: 0, textAlign: "center", fontSize: 34, fontWeight: 700, color: COLOR.ink }}>
        {value.toFixed(1)}
      </div>
    </div>
  )
}

export function PhotoScoreModal({
  vehicle,
  onClose,
  onFix,
  realPhotoScore,
}: {
  vehicle: Vehicle
  onClose: () => void
  onFix: () => void
  realPhotoScore?: UatPhotoScore | null
}) {
  // Real when available (Single VIN Detail API) — falls back to the
  // needsAction-derived estimate while loading or if the call fails.
  const poor = realPhotoScore ? realPhotoScore.grade.toUpperCase() !== "GOOD" : vehicle.needsAction.noPhotos
  const score = realPhotoScore?.score ?? (poor ? 2.8 : 8.4)
  const issues = realPhotoScore ? buildRealIssues(realPhotoScore) : buildIssues(poor)
  const issueCount = issues.filter((i) => i.status !== "pass").length

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(20,16,35,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="spyne-animate-slide-up"
        style={{
          width: 420,
          maxWidth: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 30px 70px -20px rgba(20,16,40,0.4)",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: COLOR.ink }}>Photo Score</h2>
            <Info size={16} color="rgba(40,35,70,0.4)" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 26,
                padding: "0 12px",
                borderRadius: 999,
                background: poor ? "rgb(253,236,234)" : "rgb(231,247,239)",
                color: poor ? "rgb(192,38,26)" : "rgb(10,124,74)",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              {realPhotoScore ? realPhotoScore.grade : poor ? "Poor" : "Good"}
            </span>
            <button type="button" onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", color: COLOR.textSecondary, padding: 0 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <ScoreGauge value={score} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: poor ? "rgb(192,38,26)" : COLOR.ink }}>{poor ? "Action Required" : "All Clear"}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: COLOR.textMuted }}>{issueCount} issue{issueCount === 1 ? "" : "s"}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {issues.map((issue) => {
            const statusMeta = STATUS_ICON[issue.status]
            return (
              <div
                key={issue.key}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, background: "rgb(247,247,249)" }}
              >
                <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, background: issue.iconBg, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <issue.icon size={19} color={issue.iconColor} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: COLOR.ink }}>{issue.title}</span>
                    <statusMeta.icon size={15} color={statusMeta.color} />
                  </span>
                  <span style={{ display: "block", marginTop: 2, fontSize: 12.5, color: COLOR.textSecondary }}>
                    {issue.subtitle} {issue.count && <span style={{ fontWeight: 700, color: "rgb(178,94,0)" }}>{issue.count}</span>}
                  </span>
                </span>
                <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: "rgb(234,229,255)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Pencil size={15} color={COLOR.primary} />
                </span>
              </div>
            )
          })}
        </div>

        {poor && (
          <button
            type="button"
            onClick={onFix}
            style={{
              marginTop: 18,
              width: "100%",
              height: 46,
              borderRadius: 12,
              border: "1px solid transparent",
              background: GRADIENT.addVehicle,
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "rgba(70,0,242,0.21) 0px 8px 18px -8px",
            }}
          >
            Fix with Studio AI
          </button>
        )}
      </div>
    </div>
  )
}
