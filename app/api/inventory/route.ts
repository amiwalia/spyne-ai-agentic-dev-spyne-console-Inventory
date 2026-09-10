import { NextResponse } from "next/server"
import { mapUatDocumentToVehicle, type UatListResponse } from "@/lib/uat-adapter"

// Always hits the live UAT API fresh — this route holds the only place the
// bearer token is read, and it never reaches the client.
export const dynamic = "force-dynamic"

// Single request, no real server-side pagination yet. This is a known
// ceiling, not a design choice — see the note in the GET handler below and
// the PRD's "filters won't survive a real rooftop's inventory size" risk.
const FETCH_BATCH_SIZE = 1000

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
  const holdingCostPerDay = Number(url.searchParams.get("holdingCostPerDay") ?? 50)

  let upstream: Response
  try {
    upstream = await fetch(`${baseUrl}/inventory/v2/list`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enterpriseId,
        teamId,
        page: 1,
        per_page: FETCH_BATCH_SIZE,
        sort_by: { creationEpoch: "desc" },
        dealerLang: "en",
        isSold,
      }),
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ error: "Could not reach the UAT inventory API." }, { status: 502 })
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "")
    return NextResponse.json({ error: `UAT API returned ${upstream.status}`, detail: body.slice(0, 500) }, { status: 502 })
  }

  const data: UatListResponse = await upstream.json()
  const now = Date.now()
  const vehicles = (data.vinResp ?? []).map((r) => mapUatDocumentToVehicle(r.document, holdingCostPerDay, now))

  return NextResponse.json({
    vehicles,
    meta: {
      fetchedCount: vehicles.length,
      // Observed to disagree with the actual filtered result count against
      // this UAT tenant — reported as-is, not trusted for pagination math.
      enterpriseTeamVinsCount: data.enterpriseTeamVinsCount,
      totalVinsCount: data.totalVinsCount,
      batchSizeCeiling: FETCH_BATCH_SIZE,
      truncated: vehicles.length >= FETCH_BATCH_SIZE,
    },
  })
}
