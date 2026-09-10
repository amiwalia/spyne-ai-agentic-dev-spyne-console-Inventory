import { NextResponse } from "next/server"
import { mapUatHoldingCost, type UatCentralConfigResponse } from "@/lib/uat-adapter"

export const dynamic = "force-dynamic"

function envOrError() {
  const token = process.env.UAT_API_BEARER_TOKEN
  const baseUrl = process.env.UAT_API_BASE_URL
  const enterpriseId = process.env.UAT_ENTERPRISE_ID
  const teamId = process.env.UAT_TEAM_ID
  if (!token || !baseUrl || !enterpriseId || !teamId) return null
  return { token, baseUrl, enterpriseId, teamId }
}

export async function GET() {
  const env = envOrError()
  if (!env) {
    return NextResponse.json({ error: "UAT API is not configured on the server (missing env vars)." }, { status: 500 })
  }

  const upstreamUrl = new URL(`${env.baseUrl}/central-config/v1/integration`)
  upstreamUrl.searchParams.set("enterpriseId", env.enterpriseId)
  upstreamUrl.searchParams.set("teamId", env.teamId)
  upstreamUrl.searchParams.set("domain", "rooftop")
  upstreamUrl.searchParams.set("entity", "INFO")

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, { headers: { Authorization: `Bearer ${env.token}` }, cache: "no-store" })
  } catch {
    return NextResponse.json({ error: "Could not reach the UAT central-config API." }, { status: 502 })
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "")
    return NextResponse.json({ error: `UAT API returned ${upstream.status}`, detail: body.slice(0, 500) }, { status: 502 })
  }

  const data: UatCentralConfigResponse = await upstream.json()
  const holdingCost = mapUatHoldingCost(data)
  if (holdingCost === null) {
    return NextResponse.json({ error: "No holding cost configured for this rooftop yet." }, { status: 404 })
  }

  return NextResponse.json({ holdingCost })
}

export async function POST(request: Request) {
  const env = envOrError()
  if (!env) {
    return NextResponse.json({ error: "UAT API is not configured on the server (missing env vars)." }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const holdingCost = body?.holdingCost
  if (typeof holdingCost !== "number" || !Number.isFinite(holdingCost) || holdingCost < 0) {
    return NextResponse.json({ error: "holdingCost must be a non-negative number." }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${env.baseUrl}/central-config/v1/integration`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.token}`, "Content-Type": "application/json" },
      // Only holdingCost is sent — confirmed live this merges into the
      // existing entityconfig rather than replacing it, so the rest of the
      // rooftop's config (vehicleType, sharedRooftops, vin_live_check,
      // firstTimeUserExperience) is left untouched.
      body: JSON.stringify({
        enterpriseId: env.enterpriseId,
        teamId: env.teamId,
        domain: "rooftop",
        entity: "INFO",
        entityconfig: { holdingCost },
      }),
    })
  } catch {
    return NextResponse.json({ error: "Could not reach the UAT central-config API." }, { status: 502 })
  }

  if (!upstream.ok) {
    const responseBody = await upstream.text().catch(() => "")
    return NextResponse.json({ error: `UAT API returned ${upstream.status}`, detail: responseBody.slice(0, 500) }, { status: 502 })
  }

  const data: UatCentralConfigResponse = await upstream.json()
  const saved = mapUatHoldingCost(data)
  return NextResponse.json({ holdingCost: saved ?? holdingCost })
}
