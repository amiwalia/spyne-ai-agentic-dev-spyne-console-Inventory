import { NextResponse } from "next/server"
import { mapUatScoreAttributesCount, type UatScoreAttributesCountResponse } from "@/lib/uat-adapter"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const token = process.env.UAT_API_BEARER_TOKEN
  const baseUrl = process.env.UAT_API_BASE_URL
  const enterpriseId = process.env.UAT_ENTERPRISE_ID
  const teamId = process.env.UAT_TEAM_ID

  if (!token || !baseUrl || !enterpriseId || !teamId) {
    return NextResponse.json(
      { error: "UAT API is not configured on the server (missing env vars)." },
      { status: 500 },
    )
  }

  const url = new URL(request.url)
  const isSold = url.searchParams.get("isSold") === "true"

  const upstreamUrl = new URL(`${baseUrl}/inventory/v2/score-attributes-count`)
  upstreamUrl.searchParams.set("enterpriseId", enterpriseId)
  upstreamUrl.searchParams.set("teamId", teamId)
  upstreamUrl.searchParams.set("isSold", String(isSold))

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ error: "Could not reach the UAT score-attributes-count API." }, { status: 502 })
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "")
    return NextResponse.json({ error: `UAT API returned ${upstream.status}`, detail: body.slice(0, 500) }, { status: 502 })
  }

  const data: UatScoreAttributesCountResponse = await upstream.json()
  if (data.error) {
    return NextResponse.json({ error: data.message ?? "UAT score-attributes-count API reported failure." }, { status: 502 })
  }

  return NextResponse.json(mapUatScoreAttributesCount(data))
}
