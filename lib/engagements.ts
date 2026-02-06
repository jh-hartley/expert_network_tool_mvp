/* ------------------------------------------------------------------ */
/*  Helmsman -- Call & AI Survey engagement records                     */
/*                                                                     */
/*  Each record links back to an ExpertProfile by name+company.        */
/*  Data is persisted to localStorage with seed data on first visit.   */
/* ------------------------------------------------------------------ */

import type { ExpertProfile } from "./expert-profiles"
import { getExpertProfiles, getNetworks } from "./expert-profiles"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type EngagementStatus =
  | "invited"
  | "scheduled"
  | "completed"
  | "cancelled"

export type EngagementType = "call" | "survey"

export interface EngagementRecord {
  id: string
  type: EngagementType
  /* Expert identity (links to expert profiles) */
  expert_name: string
  expert_company: string
  expert_role: string
  anonymised_role: string
  expert_type: ExpertProfile["expert_type"]
  /* Engagement details */
  status: EngagementStatus
  /** ISO date -- call date for calls, invite date for surveys */
  date: string
  /** Minutes -- calls only, 0 for surveys */
  duration_minutes: number
  /** Per-network prices for this engagement ($/hr for calls, flat EUR for surveys) */
  network_prices: Record<string, number | null>
  /** Primary network this was booked through */
  network: string
  /** User notes */
  notes: string
  created_at: string
}

/* ------------------------------------------------------------------ */
/*  ID generation                                                      */
/* ------------------------------------------------------------------ */

let counter = 0
export function generateId(): string {
  counter++
  return `eng_${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 7)}`
}

/* ------------------------------------------------------------------ */
/*  localStorage                                                       */
/* ------------------------------------------------------------------ */

const CALLS_KEY = "helmsman_calls"
const CALLS_SEEDED = "helmsman_calls_seeded"
const SURVEYS_KEY = "helmsman_surveys"
const SURVEYS_SEEDED = "helmsman_surveys_seeded"

function ensureCallsSeeded(): void {
  if (typeof window === "undefined") return
  if (localStorage.getItem(CALLS_SEEDED)) return
  localStorage.setItem(CALLS_KEY, JSON.stringify(SEED_CALLS))
  localStorage.setItem(CALLS_SEEDED, "1")
}

function ensureSurveysSeeded(): void {
  if (typeof window === "undefined") return
  if (localStorage.getItem(SURVEYS_SEEDED)) return
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(SEED_SURVEYS))
  localStorage.setItem(SURVEYS_SEEDED, "1")
}

export function getCalls(): EngagementRecord[] {
  if (typeof window === "undefined") return SEED_CALLS
  ensureCallsSeeded()
  try {
    const raw = localStorage.getItem(CALLS_KEY)
    return raw ? (JSON.parse(raw) as EngagementRecord[]) : SEED_CALLS
  } catch {
    return SEED_CALLS
  }
}

export function saveCalls(records: EngagementRecord[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CALLS_KEY, JSON.stringify(records))
}

export function getSurveys(): EngagementRecord[] {
  if (typeof window === "undefined") return SEED_SURVEYS
  ensureSurveysSeeded()
  try {
    const raw = localStorage.getItem(SURVEYS_KEY)
    return raw ? (JSON.parse(raw) as EngagementRecord[]) : SEED_SURVEYS
  } catch {
    return SEED_SURVEYS
  }
}

export function saveSurveys(records: EngagementRecord[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(records))
}

/* ------------------------------------------------------------------ */
/*  Create a new engagement from an ExpertProfile                      */
/* ------------------------------------------------------------------ */

export function createEngagementFromExpert(
  expert: ExpertProfile,
  type: EngagementType,
  overrides?: Partial<EngagementRecord>,
): EngagementRecord {
  const networks = getNetworks()
  const np: Record<string, number | null> = {}
  for (const n of networks) {
    np[n] = expert.network_prices[n] ?? null
  }
  return {
    id: generateId(),
    type,
    expert_name: expert.name,
    expert_company: expert.company,
    expert_role: expert.original_role ?? expert.role,
    anonymised_role: expert.role,
    expert_type: expert.expert_type,
    status: "invited",
    date: new Date().toISOString().slice(0, 10),
    duration_minutes: 0,
    network_prices: np,
    network: expert.network ?? "",
    notes: "",
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

/* ------------------------------------------------------------------ */
/*  Stats helpers                                                      */
/* ------------------------------------------------------------------ */

export interface EngagementStats {
  byType: Record<string, number>
  byStatus: Record<EngagementStatus, number>
  totalSpendByStatus: Record<EngagementStatus, number>
}

export function computeStats(records: EngagementRecord[]): EngagementStats {
  const byType: Record<string, number> = {}
  const byStatus: Record<EngagementStatus, number> = {
    invited: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  }
  const totalSpendByStatus: Record<EngagementStatus, number> = {
    invited: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  }

  for (const r of records) {
    // Count by expert_type
    byType[r.expert_type] = (byType[r.expert_type] ?? 0) + 1
    // Count by status
    byStatus[r.status]++
    // Compute spend (primary network price)
    const price = r.network_prices[r.network] ?? 0
    totalSpendByStatus[r.status] += price
  }

  return { byType, byStatus, totalSpendByStatus }
}

/* ------------------------------------------------------------------ */
/*  Autocomplete: search expert profiles for name/company matches      */
/* ------------------------------------------------------------------ */

export function searchExperts(query: string): ExpertProfile[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return getExpertProfiles().filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.company.toLowerCase().includes(q),
  )
}

/* ------------------------------------------------------------------ */
/*  Seed data -- calls                                                 */
/* ------------------------------------------------------------------ */

export const SEED_CALLS: EngagementRecord[] = [
  {
    id: "call_seed_1",
    type: "call",
    expert_name: "Raj Patel",
    expert_company: "Solaris Packaging",
    expert_role: "VP of Plant Engineering",
    anonymised_role: "Senior Plant Engineering Leader",
    expert_type: "customer",
    status: "completed",
    date: "2025-11-14",
    duration_minutes: 55,
    network_prices: { AlphaSights: 650, GLG: null, "Third Bridge": null },
    network: "AlphaSights",
    notes: "Very insightful on Meridian adoption drivers. Follow up on lead times.",
    created_at: "2025-11-10T09:00:00Z",
  },
  {
    id: "call_seed_2",
    type: "call",
    expert_name: "Diane Kowalski",
    expert_company: "Beckhoff Automation",
    expert_role: "Former SVP Sales, Beckhoff Automation North America",
    anonymised_role: "Former Senior Sales Executive",
    expert_type: "competitor",
    status: "completed",
    date: "2025-11-15",
    duration_minutes: 60,
    network_prices: { AlphaSights: 950, GLG: 1000, "Third Bridge": null },
    network: "AlphaSights",
    notes: "Strong views on Meridian's competitive positioning vs Beckhoff.",
    created_at: "2025-11-12T14:00:00Z",
  },
  {
    id: "call_seed_3",
    type: "call",
    expert_name: "Marcus Oyelaran",
    expert_company: "Hartwell Brewing Co.",
    expert_role: "Director of Manufacturing Technology",
    anonymised_role: "Manufacturing Technology Director",
    expert_type: "customer",
    status: "scheduled",
    date: "2025-12-02",
    duration_minutes: 0,
    network_prices: { AlphaSights: 550, GLG: 600, "Third Bridge": null },
    network: "AlphaSights",
    notes: "",
    created_at: "2025-11-20T10:00:00Z",
  },
  {
    id: "call_seed_4",
    type: "call",
    expert_name: "Laura Fischer",
    expert_company: "Meridian Controls",
    expert_role: "Former COO, Meridian Controls",
    anonymised_role: "Former Chief Operations Executive",
    expert_type: "target",
    status: "scheduled",
    date: "2025-12-05",
    duration_minutes: 0,
    network_prices: { AlphaSights: null, GLG: 1200, "Third Bridge": 1150 },
    network: "GLG",
    notes: "Key target interview -- need CID clearance first.",
    created_at: "2025-11-22T11:00:00Z",
  },
  {
    id: "call_seed_5",
    type: "call",
    expert_name: "Chen Wei-Lin",
    expert_company: "TerraForge Metals",
    expert_role: "Chief Engineer",
    anonymised_role: "Chief Engineering Officer",
    expert_type: "customer",
    status: "invited",
    date: "2025-11-25",
    duration_minutes: 0,
    network_prices: { AlphaSights: 600, GLG: null, "Third Bridge": 575 },
    network: "AlphaSights",
    notes: "",
    created_at: "2025-11-23T08:00:00Z",
  },
  {
    id: "call_seed_6",
    type: "call",
    expert_name: "Sandra Voss",
    expert_company: "Omron Industrial Automation",
    expert_role: "Head of Strategy, Omron Industrial Automation, Americas",
    anonymised_role: "Head of Corporate Strategy",
    expert_type: "competitor",
    status: "cancelled",
    date: "2025-11-18",
    duration_minutes: 0,
    network_prices: { AlphaSights: 1100, GLG: null, "Third Bridge": null },
    network: "AlphaSights",
    notes: "Cancelled -- compliance concern re current employment.",
    created_at: "2025-11-14T09:00:00Z",
  },
  {
    id: "call_seed_7",
    type: "call",
    expert_name: "James Achebe",
    expert_company: "FreshPath Foods",
    expert_role: "Global Automation Manager",
    anonymised_role: "Global Automation Standards Leader",
    expert_type: "customer",
    status: "completed",
    date: "2025-11-20",
    duration_minutes: 45,
    network_prices: { AlphaSights: null, GLG: 750, "Third Bridge": null },
    network: "GLG",
    notes: "Excellent perspective on Meridian vs Rockwell evaluation process.",
    created_at: "2025-11-16T10:00:00Z",
  },
  {
    id: "call_seed_8",
    type: "call",
    expert_name: "Roberto Garza",
    expert_company: "Cascadia Paper Products",
    expert_role: "Maintenance & Reliability Director",
    anonymised_role: "Reliability & Maintenance Director",
    expert_type: "customer",
    status: "invited",
    date: "2025-11-28",
    duration_minutes: 0,
    network_prices: { AlphaSights: 650, GLG: 600, "Third Bridge": null },
    network: "GLG",
    notes: "",
    created_at: "2025-11-25T09:00:00Z",
  },
]

/* ------------------------------------------------------------------ */
/*  Seed data -- surveys                                               */
/* ------------------------------------------------------------------ */

export const SEED_SURVEYS: EngagementRecord[] = [
  {
    id: "surv_seed_1",
    type: "survey",
    expert_name: "Raj Patel",
    expert_company: "Solaris Packaging",
    expert_role: "VP of Plant Engineering",
    anonymised_role: "Senior Plant Engineering Leader",
    expert_type: "customer",
    status: "completed",
    date: "2025-11-10",
    duration_minutes: 0,
    network_prices: { AlphaSights: 300, GLG: null, "Third Bridge": null },
    network: "AlphaSights",
    notes: "NPS 8. Strong on vendor evaluation process.",
    created_at: "2025-11-08T09:00:00Z",
  },
  {
    id: "surv_seed_2",
    type: "survey",
    expert_name: "Marcus Oyelaran",
    expert_company: "Hartwell Brewing Co.",
    expert_role: "Director of Manufacturing Technology",
    anonymised_role: "Manufacturing Technology Director",
    expert_type: "customer",
    status: "completed",
    date: "2025-11-11",
    duration_minutes: 0,
    network_prices: { AlphaSights: 300, GLG: 300, "Third Bridge": null },
    network: "AlphaSights",
    notes: "NPS 9. Very positive on Meridian service model.",
    created_at: "2025-11-09T10:00:00Z",
  },
  {
    id: "surv_seed_3",
    type: "survey",
    expert_name: "Angela Moretti",
    expert_company: "GreenValley Chemicals",
    expert_role: "Plant Manager",
    anonymised_role: "Plant Operations Manager",
    expert_type: "customer",
    status: "invited",
    date: "2025-11-20",
    duration_minutes: 0,
    network_prices: { AlphaSights: null, GLG: null, "Third Bridge": 300 },
    network: "Third Bridge",
    notes: "",
    created_at: "2025-11-18T14:00:00Z",
  },
  {
    id: "surv_seed_4",
    type: "survey",
    expert_name: "Priya Chakraborty",
    expert_company: "Atlas Cement Corp",
    expert_role: "Engineering Manager",
    anonymised_role: "Senior Engineering Manager",
    expert_type: "customer",
    status: "invited",
    date: "2025-11-21",
    duration_minutes: 0,
    network_prices: { AlphaSights: null, GLG: null, "Third Bridge": 300 },
    network: "Third Bridge",
    notes: "",
    created_at: "2025-11-19T08:00:00Z",
  },
  {
    id: "surv_seed_5",
    type: "survey",
    expert_name: "Yuki Tanaka",
    expert_company: "Nippon Precision Components",
    expert_role: "Director of Automation",
    anonymised_role: "Automation Engineering Director",
    expert_type: "customer",
    status: "cancelled",
    date: "2025-11-12",
    duration_minutes: 0,
    network_prices: { AlphaSights: null, GLG: 300, "Third Bridge": 300 },
    network: "Third Bridge",
    notes: "Cancelled -- scheduling conflict.",
    created_at: "2025-11-10T11:00:00Z",
  },
]
