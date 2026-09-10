"use client"

import { AlertTriangle, ImageOff } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import type { UatPhotoScore } from "@/lib/uat-adapter"
import { COLOR, GRADIENT } from "@/lib/tokens"

export function MerchandiseStatusTab({
  vehicle,
  onFixPhotos,
  realPhotoScore,
}: {
  vehicle: Vehicle
  onFixPhotos: () => void
  realPhotoScore?: UatPhotoScore | null
}) {
  const needsPhotos = vehicle.needsAction.noPhotos
  // Real when available (Single VIN Detail API) — falls back to the
  // needsAction-derived estimate while loading or if the call fails.
  const photoScore = realPhotoScore?.score ?? (needsPhotos ? 2.8 : 8.4)
  const poorGrade = realPhotoScore ? realPhotoScore.grade.toUpperCase() !== "GOOD" : needsPhotos
  const scoreColor = photoScore < 7 ? "rgb(192,38,26)" : "rgb(10,124,74)"
  const imageCount = needsPhotos ? 0 : 8
  const thumbs = Array.from({ length: imageCount }, (_, i) => i)

  return (
    <div style={{ paddingBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLOR.ink, letterSpacing: -0.3 }}>Photo score</h3>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, fontWeight: 500, color: "rgba(40,35,70,0.45)" }}>
            Under the 7.0 bar — buyers scroll past listings that score low.
          </p>
        </span>
        <span style={{ flexShrink: 0, textAlign: "right" }}>
          <span style={{ display: "block", fontSize: 30, fontWeight: 700, letterSpacing: -0.8, color: scoreColor }}>
            {photoScore.toFixed(1)}
            <span style={{ fontSize: 20, fontWeight: 700 }}>/10</span>
          </span>
        </span>
      </div>

      <div style={{ background: "#fff", display: "grid", gridTemplateColumns: "repeat(3,1fr)", overflow: "hidden", borderRadius: 14, border: `1px solid ${COLOR.borderSoft}`, marginTop: 18 }}>
        <MediaStat label="Images" value={String(imageCount)} tone={imageCount > 0 ? "ok" : "bad"} />
        <MediaStat label="360° spin" value={needsPhotos ? "Not added" : "Added"} tone={needsPhotos ? "bad" : "ok"} />
        <MediaStat label="Video tour" value={needsPhotos ? "Not added" : "Added"} tone={needsPhotos ? "bad" : "ok"} />
      </div>

      <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 16, marginTop: 28, background: "rgb(242,242,245)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {vehicle.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vehicle.photoUrl} alt={vehicle.model} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ImageOff size={28} color="rgb(190,190,200)" />
        )}
      </div>

      {thumbs.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto" }}>
          {thumbs.map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`Image ${i + 1}`}
              style={{ flexShrink: 0, width: 76, height: 56, padding: 0, borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "none", border: `1px solid ${COLOR.borderSoft}`, boxSizing: "border-box" }}
            >
              {vehicle.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vehicle.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
            </button>
          ))}
        </div>
      )}

      {poorGrade && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            marginTop: 24,
            marginLeft: -24,
            marginRight: -24,
            marginBottom: -24,
            padding: "14px 24px",
            borderTop: `1px solid ${COLOR.borderSoft}`,
            borderBottomLeftRadius: 19,
            borderBottomRightRadius: 19,
            background: "#fff",
            boxShadow: "rgba(20,16,40,0.12) 0px -8px 18px -16px",
            display: "flex",
            alignItems: "center",
            gap: 13,
          }}
        >
          <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 11, background: "rgb(253,236,234)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={17} color="#c0261a" />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: COLOR.ink, letterSpacing: -0.1 }}>Photo score {photoScore.toFixed(1)}/10</span>
            <span style={{ display: "block", marginTop: 2, fontSize: 12.5, fontWeight: 500, color: "rgba(40,35,70,0.45)" }}>Under the 7.0 bar — buyers scroll past listings that score low.</span>
          </span>
          <button
            type="button"
            onClick={onFixPhotos}
            style={{ flexShrink: 0, height: 38, padding: "0 22px", borderRadius: 10, border: "1px solid transparent", background: GRADIENT.addVehicle, color: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}
          >
            Fix now
          </button>
        </div>
      )}
    </div>
  )
}

function MediaStat({ label, value, tone }: { label: string; value: string; tone: "ok" | "bad" }) {
  return (
    <div style={{ padding: "15px 16px 17px", minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: "rgba(40,35,70,0.4)", whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, letterSpacing: -0.4, color: tone === "ok" ? COLOR.ink : "rgb(192,38,26)", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  )
}
