import { NextResponse } from "next/server"
import { mapUatPhotoScore, type UatVehicleDetailResponse } from "@/lib/uat-adapter"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const token = process.env.UAT_API_BEARER_TOKEN
  const baseUrl = process.env.UAT_API_BASE_URL

  if (!token || !baseUrl) {
    return NextResponse.json({ error: "UAT API is not configured on the server (missing env vars)." }, { status: 500 })
  }

  const url = new URL(request.url)
  const dealerVinId = url.searchParams.get("dealerVinId")
  if (!dealerVinId) {
    return NextResponse.json({ error: "dealerVinId query param is required." }, { status: 400 })
  }

  const upstreamUrl = new URL(`${baseUrl}/inventory/v2`)
  upstreamUrl.searchParams.set("dealerVinId", dealerVinId)

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ error: "Could not reach the UAT vehicle detail API." }, { status: 502 })
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "")
    return NextResponse.json({ error: `UAT API returned ${upstream.status}`, detail: body.slice(0, 500) }, { status: 502 })
  }

  const data: UatVehicleDetailResponse = await upstream.json()
  if (data.error) {
    return NextResponse.json({ error: data.message ?? "UAT vehicle detail API reported failure." }, { status: 502 })
  }

  return NextResponse.json({ photoScore: mapUatPhotoScore(data) })
}
