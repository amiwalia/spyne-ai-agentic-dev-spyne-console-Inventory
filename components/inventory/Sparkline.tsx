"use client"

export function Sparkline({ points, width = 56, height = 22, color }: { points: number[]; width?: number; height?: number; color: string }) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = Math.max(1, max - min)
  const stepX = width / (points.length - 1)
  const coords = points.map((p, i) => {
    const x = i * stepX
    const y = height - ((p - min) / span) * (height - 3) - 1.5
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden>
      <polyline points={coords.join(" ")} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={coords[coords.length - 1].split(",")[1]} r={2} fill={color} />
    </svg>
  )
}
