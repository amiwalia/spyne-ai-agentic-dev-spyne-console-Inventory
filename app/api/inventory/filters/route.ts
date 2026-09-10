import { NextResponse } from "next/server"
import { mapUatFacetsToFilterOptions, type UatFiltersResponse } from "@/lib/uat-adapter"

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

  let upstream: Response
  try {
    upstream = await fetch(`${baseUrl}/inventory/v2/filters`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enterpriseId, teamId, filters: {}, isSold }),
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ error: "Could not reach the UAT filters API." }, { status: 502 })
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "")
    return NextResponse.json({ error: `UAT API returned ${upstream.status}`, detail: body.slice(0, 500) }, { status: 502 })
  }

  const data: UatFiltersResponse = await upstream.json()
  if (!data.success) {
    return NextResponse.json({ error: data.message ?? "UAT filters API reported failure." }, { status: 502 })
  }

  return NextResponse.json(mapUatFacetsToFilterOptions(data))
}
