"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { COLOR } from "@/lib/tokens"

export function DaysSupplySegmentLink() {
  return (
    <Link
      href="/segments"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12.5,
        fontWeight: 700,
        color: COLOR.primary,
        textDecoration: "none",
      }}
    >
      View by segment
      <ChevronRight size={13} />
    </Link>
  )
}
