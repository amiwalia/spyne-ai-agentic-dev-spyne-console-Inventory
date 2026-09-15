---
spec_format_version: "0.1"
title: Studio OS Inventory
artifact_type: prd
spec_revision: 1
lifecycle_status: draft
author: Amit Walia
created_at: 2026-09-10T00:00:00Z
updated_at: 2026-09-10T00:00:00Z
---

# Studio OS Inventory

## Problem

Who is hurting, what pain do they feel, and why does it matter?

The used-car manager and GM at a dealership rooftop have no single place that shows which vehicles are costing them money every day they sit unsold. Days supply, aging, and holding cost live scattered across a DMS report, a pricing tool, an imaging vendor's dashboard, and a syndication vendor's portal — none of which agree with each other and none of which are checked daily. Every day a vehicle sits unsold costs the dealer $37 to $75, and turning the same inventory twice as often roughly doubles annual gross with no extra customers — but no vendor and no employee inside the store is accountable for that number end to end. It matters because front-end margin is compressing with no volume tailwind, so the dollars recovered by turning inventory faster are the only lever left that don't depend on selling more cars.

## Hypothesis

What behavior will change if this ships, and why?

If a used-car manager or GM can see, in one view, which vehicles and which body-type segments are aging, overstocked, or losing money to holding cost — with a direct action next to each problem instead of a separate report to reconcile — they will act on it inside days instead of discovering it at a periodic manual walk of the lot. The current alternative (a DMS aging report, checked irregularly) has no per-vehicle call to action and no segment-level view, so problems accumulate silently until a unit is deep enough into aging that it has to be wholesaled at a loss.

## Product Summary

What should exist when the work is done, in plain language?

A dealer-facing web dashboard, scoped per rooftop (or rolled up across a dealer group), that shows:

- Three KPI cards — Time to Market, Holding Cost, Days Supply — each with a color-banded breakdown (green/amber/red) and a week-over-week trend.
- A filterable, sortable inventory table covering the full active lot, with quick filters (aging, no photos, overstocked) and an advanced filter panel (media status, source, price range, make/model/year/body type).
- A Vehicle Detail Page for each unit with five tabs — Overview, Vehicle Details (full spec), Merchandise Status (photo score), Publish Status (per-channel syndication), and Pricing (competitive radius analysis) — plus a "Vehicle Journey" panel showing inventory status, merchandising completeness, and shopper demand signal, each with an inline action to resolve it.
- A Days Supply by Segment page (accordion, one row per body type) so a manager can see which vehicle types are overstocked or in short supply without opening every unit individually.
- A Sold Inventory page and a floating "Needs Action" summary surfacing every vehicle with an open issue, categorized by type.

All of it reads from and writes to Spyne's own backend — which already ingests inventory via IMS sync and website/marketplace scraping, and already owns media/merchandising status (Studio AI) and shopper engagement (Vini AI). This dashboard does not integrate with anything directly; it is a view and action layer over data the backend already collects. The full endpoint-level breakdown of what this view needs from that backend is documented separately in the Studio OS Data Contract.

## Scope

Each scope item is a full sentence or imperative guardrail.

### In

- Ship the three KPI cards with the agreed color thresholds: Time to Market green under 3 days, amber 3–6 days, red 6+ days; Holding Cost green under $500, amber $500–1,000, red over $1,000.
- Ship the inventory table with working client-perceived filtering, sorting (price, age, holding cost), and search, backed by a paginated, server-side-filterable read endpoint.
- Ship the Vehicle Detail Page with all five tabs, including the Vehicle Journey panel with per-issue "Fix now" actions (not a single shared action).
- Ship the Days Supply by Segment accordion page, with single-click expand per segment, computed from a real segment-level days-supply calculation (not a per-vehicle-stored number).
- Ship the Sold Inventory page and the Needs Action drawer.
- Ship the Group Dealer / Rooftop scope toggle wired to actually scope every dataset on the page, not just the header control.
- Persist every write action (resolve a checklist item, apply a recommended price, edit publish-channel settings) to the backend so it survives a page reload.

### Out

- Multi-rooftop roll-up reporting and cross-rooftop benchmarking for dealer groups (Dealer OS workstream F — group control plane).
- Outcome-based or automated pricing that applies a change without a human clicking "Apply."
- Any write path that reaches beyond Spyne's own backend into a dealer's DMS, marketplace account, or website CMS directly from this view — that propagation, if and when it exists, is a backend-team concern outside this product's scope.
- Self-serve packaging and onboarding for the active-independent dealer segment (workstream H).
- Building or licensing a competitive-pricing data source as part of this launch — the Pricing tab ships only if that data source is resolved elsewhere first (see Risks).

### Cut

- The floating "View by segment" popover — replaced by the full Days Supply by Segment accordion page, because a small popover couldn't show vehicle-level detail per segment.
- The Studio OS / Vini AI category split inside the Needs Action drawer — flattened to a single list, because the split was an implementation detail the dealer user didn't need to reason about.
- The "Shopper engaged" chat-transcript step in the Vehicle Journey panel — replaced by a data-driven Demand step (page views, CTA clicks, photo/360 interaction, sales inquiries), because a chat transcript view doesn't generalize to shoppers who never opened chat.
- The shared, single "Fix now" button at the bottom of the Merchandised & Live checklist — replaced with one button per issue, because a shared button gave no way to resolve one issue without triggering all of them.
- The Source dropdown in the main filter bar — removed as a duplicate of the working Source filter already inside the Filters panel.

## Acceptance Criteria

Observable pass/fail behavior before launch.

- Loading the inventory list for a connected pilot rooftop returns real vehicles from the backend read endpoint, not the bundled mock dataset, with pagination that holds at rooftop inventory sizes beyond 25 units.
- For any two vehicles of the same body type, the displayed Days Supply value and status (On Target / Overstocked / Short Supply) are identical, because both are read from the same segment-level computation rather than two independently stored numbers.
- Days Supply status is assigned by these thresholds: **40–50 days is On Target, under 40 days is Short Supply, over 50 days is Overstocked.**
- A body type with a tied count between two statuses (e.g., one on-target and one understocked vehicle) surfaces as the more actionable status, not silently defaulting to On Target.
- Clicking "Fix now" on a single Vehicle Journey checklist item resolves only that item; the other pending items remain open.
- Clicking "Apply price" on a Pricing tab recommendation updates the vehicle's price in the backend and is reflected in the inventory table without a manual refresh.
- Switching the Group Dealer / Rooftop toggle changes the vehicle count, KPI values, and table contents shown, not just the toggle's own visual state.
- Publish Status accurately reflects each channel's real last-sent time and live/not-live state as returned by the backend — no channel shows "Live" if the backend has never recorded a send for it.
- The Pricing tab does not ship displaying fabricated competitor numbers; it either shows real data from a resolved source or is hidden/disabled for rooftops where that source isn't connected.

## Success Metrics

Post-launch user or business outcomes. Targets below are placeholders pending agreement with the pilot dealer — not to be treated as committed numbers until set.

| Metric | Target | Time window |
|---|---|---|
| Share of newly-flagged "needs action" vehicles resolved | TBD with pilot dealer | Within 48 hours of surfacing |
| Average days-to-sale, pilot rooftop | TBD — measured, not preset | Trailing 90 days, pre- vs. post-launch |
| Weekly active use by the used-car manager / GM role | TBD | Rolling 4-week average |

## Solution

Architecture in one paragraph: this is a Next.js dealer-facing view and action layer over a single Spyne backend. The backend already ingests inventory via IMS sync and website/marketplace scraping (per the `source.channel` field already modeled in the prototype), owns merchandising and publish status via Studio AI, and owns shopper engagement via Vini AI. Turn-speed metrics (days supply, holding cost, time to market) are computed once by Spyne from that ingested data, at the body-type-segment level, and displayed both as a segment rollup and inherited onto each vehicle in that segment. Days Supply status bands off that number: 40–50 days is On Target, under 40 days is Short Supply, over 50 days is Overstocked. The full section-by-section endpoint contract this view needs from that backend — what's already live, what needs a dashboard-facing read contract written, and what has no backend owner yet — is documented in the Studio OS Data Contract.

## Risks

- **Competitive pricing has no data owner today.** Inventory pricing and appraisal (vAuto/HomeNet/ProfitTime territory) isn't a layer Spyne currently owns. Shipping the Pricing tab against a real source requires a build-or-partner decision above engineering; shipping it against fabricated numbers risks credibility with a buyer who already runs vAuto.
- **The Vini AI demand-signal taxonomy is unconfirmed.** The Demand step's event categories (page views, CTA clicks, photo/360 interaction, forms) were reconstructed from a description of the site chatbot's tracking, not a live schema. Needs sign-off from whoever owns Vini's tracking before the dashboard is built against this exact shape.
- **A per-vehicle days-supply field that isn't derived from its segment will drift.** If the backend stores `daysSupply` independently per vehicle instead of deriving it from the vehicle's segment cohort, two units of the same body type can silently disagree — this has to be caught in implementation, not just in this PRD.
- **Publishing to a channel the dealer already has a feed for risks duplicate listings.** If a rooftop's website or marketplace feed already runs through another vendor (Dealer.com, vAuto, etc.), Spyne's publish step needs to be additive, not a second competing feed to the same channel.

## Open Questions

- Is IMS sync and scraping ingestion, confirmed live for the pilot rooftop, also live for every rooftop this launches to — or is that a per-rooftop onboarding step?
- Does Spyne already have a VIN-decode data provider under contract (e.g., for Studio AI's window-sticker generation) that the Vehicle Details tab's factory-spec fields can reuse?
- Does the DMS or floor-plan lender expose real per-unit floor-plan interest accrual, which would be more accurate than the flat dealer-set $/day holding-cost rate currently used?
- Who signs off on the Pricing tab's build-or-partner decision, and by when does that need to happen relative to this launch date?

## Agent Handoff

Plain-English build contract for engineering or a coding agent:

- **Build**: the view and action layer described in Product Summary, against the read and action endpoints documented in the Studio OS Data Contract artifact — not against the bundled mock data in `lib/mock-data.ts`, which is prototype-only.
- **Guardrails**: everything in Scope → In ships; everything in Scope → Out does not, even if it looks like a small addition once the backend contract exists.
- **Definition of done**: every item in Acceptance Criteria is independently verifiable against a real pilot rooftop, not the mock dataset.
- **Evidence required at handoff**: a PR per feature area, a verification pass against Acceptance Criteria, and a screenshot or recording of the Days Supply by Segment and Vehicle Journey screens specifically, since those two carry the correctness risks called out in Risks.

## Decision Trace

Real direction changes made during the prototype build, kept here as the record of why the shipped behavior looks the way it does:

- **Segment drill-down**: started as a small floating popover, changed to a full page because a manager needed to see the actual vehicles in an overstocked segment, not just a count.
- **Segment row interaction**: shipped first as double-click-to-expand, changed to single-click after user feedback that double-click wasn't discoverable.
- **Vehicle Journey checklist actions**: started as one shared "Fix now" button resolving every open issue at once, changed to one button per issue so resolving a photo problem doesn't also silently resolve a promotion problem.
- **Demand signal**: started as a literal chat-transcript step ("Shopper engaged"), changed to a data-driven step covering page/click/media/form activity, because a chat-only view doesn't represent shoppers who browsed without ever opening chat.
