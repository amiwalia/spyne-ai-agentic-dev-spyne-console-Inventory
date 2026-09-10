import { NextResponse } from "next/server"
import { mapUatVinDecode, type UatVinDecodeResponse } from "@/lib/uat-adapter"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const token = process.env.UAT_API_BEARER_TOKEN
  const baseUrl = process.env.UAT_API_BASE_URL

  if (!token || !baseUrl) {
    return NextResponse.json({ error: "UAT API is not configured on the server (missing env vars)." }, { status: 500 })
  }

  const url = new URL(request.url)
  const vin = url.searchParams.get("vin")
  const registrationNumber = url.searchParams.get("registrationNumber")
  if (!vin) {
    return NextResponse.json({ error: "vin query param is required." }, { status: 400 })
  }

  const upstreamUrl = new URL(`${baseUrl}/inventory/v1/vins/get-vin-data`)
  upstreamUrl.searchParams.set("vin", vin)
  if (registrationNumber) upstreamUrl.searchParams.set("registrationNumber", registrationNumber)

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ error: "Could not reach the UAT VIN decode API." }, { status: 502 })
  }

  // The invalid-VIN response is a different shape entirely —
  // {vin, isVinValid: false, message} — not {error, data}.
  if (!upstream.ok) {
    const body = await upstream.json().catch(() => null)
    const message = body?.message ?? `UAT API returned ${upstream.status}`
    return NextResponse.json({ error: message }, { status: upstream.status === 400 ? 400 : 502 })
  }

  const data: UatVinDecodeResponse = await upstream.json()
  if (data.error) {
    return NextResponse.json({ error: data.message ?? "UAT VIN decode API reported failure." }, { status: 502 })
  }

  const result = mapUatVinDecode(data)
  if (!result) {
    return NextResponse.json({ error: "No vehicle data found for this VIN." }, { status: 404 })
  }

  return NextResponse.json(result)
}
