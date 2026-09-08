"use client"

import { COLOR, SHELL } from "@/lib/tokens"

const NAV = [
  { icon: "home", label: "Home" },
  { icon: "grid_view", label: "Studio OS" },
  { icon: "inventory_2", label: "Inventory", active: true },
  { icon: "campaign", label: "Marketing" },
  { icon: "shopping_cart", label: "Sales" },
  { icon: "build", label: "Service" },
  { icon: "support_agent", label: "Reception" },
  { icon: "group", label: "Customers" },
]

export function Sidebar() {
  return (
    <aside
      style={{
        width: SHELL.sidebarWidth,
        flexShrink: 0,
        background: "#fff",
        borderRight: `1px solid ${SHELL.sidebarBorder}`,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 12,
        gap: 4,
      }}
    >
      {NAV.map((item) => (
        <a
          key={item.label}
          href="#"
          style={{
            width: 63,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: "10px 4px",
            borderRadius: 8,
            color: item.active ? COLOR.primary : "rgb(26,26,26)",
            background: item.active ? "rgba(70,0,242,0.08)" : "transparent",
            textDecoration: "none",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22, width: 22, height: 22, lineHeight: 1 }}>
            {item.icon}
          </span>
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>{item.label}</span>
        </a>
      ))}
    </aside>
  )
}
