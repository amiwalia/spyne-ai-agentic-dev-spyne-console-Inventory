import { NextResponse } from "next/server"
import { mapUatHomeStats, type UatHomeStatsResponse } from "@/lib/uat-adapter"

export const dynamic = "force-dynamic"

const WINDOW_DAYS = 7

export async function GET() {
  const token = process.env.UAT_API_BEARER_TOKEN
  const baseUrl = process.env.UAT_API_BASE_URL
  const enterpriseId = process.env.UAT_ENTERPRISE_ID
  const teamId = process.env.UAT_TEAM_ID

  if (!token || !baseUrl || !enterpriseId || !teamId) {
    return NextResponse.json({ error: "UAT API is not configured on the server (missing env vars)." }, { status: 500 })
  }

  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - WINDOW_DAYS * 86_400_000)

  const upstreamUrl = new URL(`${baseUrl}/inventory/v2/home/stats`)
  upstreamUrl.searchParams.set("enterpriseId", enterpriseId)
  upstreamUrl.searchParams.set("teamId", teamId)
  upstreamUrl.searchParams.set("startDate", startDate.toISOString())
  upstreamUrl.searchParams.set("endDate", endDate.toISOString())

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ error: "Could not reach the UAT home/stats API." }, { status: 502 })
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "")
    return NextResponse.json({ error: `UAT API returned ${upstream.status}`, detail: body.slice(0, 500) }, { status: 502 })
  }

  const data: UatHomeStatsResponse = await upstream.json()
  if (data.error) {
    return NextResponse.json({ error: data.message ?? "UAT home/stats API reported failure." }, { status: 502 })
  }

  return NextResponse.json(mapUatHomeStats(data))
}
