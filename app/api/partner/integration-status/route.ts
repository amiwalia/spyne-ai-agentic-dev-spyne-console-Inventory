import { NextResponse } from "next/server"
import { mapUatPartnerIntegrationStatus, type UatPartnerIntegrationStatusResponse } from "@/lib/uat-adapter"

export const dynamic = "force-dynamic"

export async function GET() {
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

  const upstreamUrl = new URL(`${baseUrl}/partner/integration-status`)
  upstreamUrl.searchParams.set("enterpriseId", enterpriseId)
  upstreamUrl.searchParams.set("teamId", teamId)

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ error: "Could not reach the UAT partner integration-status API." }, { status: 502 })
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "")
    return NextResponse.json({ error: `UAT API returned ${upstream.status}`, detail: body.slice(0, 500) }, { status: 502 })
  }

  const data: UatPartnerIntegrationStatusResponse = await upstream.json()
  if (!data.success) {
    return NextResponse.json({ error: data.message ?? "UAT partner integration-status API reported failure." }, { status: 502 })
  }

  return NextResponse.json({ partners: mapUatPartnerIntegrationStatus(data) })
}
