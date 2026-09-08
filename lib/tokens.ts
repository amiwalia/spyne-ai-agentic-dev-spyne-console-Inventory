// Design tokens captured directly (computed styles) from uat-dealer-os.spyne.ai/studio/inventory
// so this prototype matches the live Studio OS Inventory tab pixel-for-pixel.

export const COLOR = {
  pageBg: "rgb(251,251,254)",
  primary: "rgb(70,0,242)",
  primaryTab: "rgb(106,75,242)",
  ink: "rgb(21,19,28)",
  inkStrong: "rgb(0,0,0)",
  textSecondary: "rgb(91,86,112)",
  textTabInactive: "rgb(111,106,128)",
  textTabInactiveCount: "rgb(138,133,152)",
  textMuted: "rgba(40,35,70,0.5)",
  textFaint: "rgba(0,0,0,0.8)",
  borderCard: "rgb(230,228,238)",
  borderSoft: "rgba(40,35,70,0.12)",
  borderSofter: "rgba(40,35,70,0.07)",
  borderSofterer: "rgba(40,35,70,0.05)",
  borderTable: "rgb(236,236,240)",
  borderShell: "rgb(238,240,243)",
  borderButton: "rgb(225,227,233)",
  divider: "rgb(237,237,237)",
  success: "rgb(0,196,136)",
  danger: "rgb(239,33,33)",
  dangerText: "rgb(224,57,46)",
  chipActiveBg: "rgba(70,0,242,0.07)",
  chipActiveBorder: "rgba(70,0,242,0.35)",
  badgeBg: "rgb(241,240,245)",
} as const

export const SHADOW = {
  card: "rgba(40,35,80,0.03) 0px 1px 3px 0px, rgba(40,35,80,0.1) 0px 6px 20px -14px",
  table: "rgba(40,35,80,0.2) 0px 14px 34px -26px",
  pillBrand: "rgba(70,0,242,0.09) 0px 6px 16px -8px",
  addVehicle: "rgba(70,0,242,0.21) 0px 8px 18px -8px",
} as const

export const GRADIENT = {
  addVehicle: "linear-gradient(91.865deg, rgb(74,31,214) 0%, rgb(106,75,242) 55%, rgb(167,139,250) 100%)",
  holdingBar: "linear-gradient(90deg, rgb(224,83,63), rgb(255,122,89))",
  upgradePro: "linear-gradient(91.38deg, rgb(127,106,242), rgb(182,81,215), rgb(232,62,84), rgb(237,137,57))",
} as const

export const SHELL = {
  sidebarWidth: 76,
  topbarHeight: 61,
  sidebarBorder: "rgb(238,240,243)",
  pillBorder: "rgba(48,38,103,0.1)",
} as const

// Decorative KPI-card artwork, hot-linked from the live UAT host — internal Spyne
// brand assets, not reproduced locally so this stays a thin prototype.
export const KPI_ART_BASE = "https://uat-dealer-os.spyne.ai/studio/kpi"
