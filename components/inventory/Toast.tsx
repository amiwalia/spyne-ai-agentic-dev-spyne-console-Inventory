"use client"

import { CheckCircle2 } from "lucide-react"

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 999,
        background: "rgb(21,19,28)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 12px 30px -10px rgba(0,0,0,0.4)",
      }}
      className="spyne-animate-slide-up"
    >
      <CheckCircle2 size={16} color="rgb(0,196,136)" />
      {message}
    </div>
  )
}
