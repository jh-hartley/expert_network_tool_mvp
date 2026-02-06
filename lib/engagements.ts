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
  /** Whether this is a follow-up engagement (25% discount on hourly rate) */
  is_follow_up: boolean
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
const CALLS_SEEDED = "helmsman_calls_seeded_v2"
const SURVEYS_KEY = "helmsman_surveys"
const SURVEYS_SEEDED = "helmsman_surveys_seeded_v2"

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
/*  Call pricing logic                                                 */
/*                                                                     */
/*  Hourly rate = network price for the selected network.              */
/*  Duration must be a 15-minute interval.                             */
/*  < 60 min → charged at 75% of the 1-hr cost.                       */
/*  Follow-up → 25% discount on the hourly rate.                       */
/*  Follow-up + 15 min → 50% of 1-hr cost.                            */
/*  Survey pricing is flat (EUR per survey), no duration logic.        */
/* ------------------------------------------------------------------ */

export function computeCallPrice(
  hourlyRate: number,
  durationMinutes: number,
  isFollowUp: boolean,
): number {
  if (hourlyRate <= 0 || durationMinutes <= 0) return 0

  const effectiveRate = isFollowUp ? hourlyRate * 0.75 : hourlyRate

  // Special case: follow-up + 15 min → 50% of full hourly rate
  if (isFollowUp && durationMinutes === 15) {
    return Math.round(hourlyRate * 0.5)
  }

  // Sub-60 min (but not the follow-up+15 case above) → 75% of 1-hr cost
  if (durationMinutes < 60) {
    return Math.round(effectiveRate * 0.75)
  }

  // 60+ min → pro-rata on the effective rate
  return Math.round(effectiveRate * (durationMinutes / 60))
}

/** Duration options in 15-minute intervals */
export const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 105, 120]

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
    is_follow_up: false,
    notes: "",
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

/* ------------------------------------------------------------------ */
/*  Stats helpers                                                      */
/* ------------------------------------------------------------------ */

export interface EngagementStats {
  /** Unique experts contacted, grouped by expert_type */
  uniqueByType: Record<string, number>
  /** Total unique experts */
  uniqueExperts: number
  byStatus: Record<EngagementStatus, number>
  totalSpendByStatus: Record<EngagementStatus, number>
}

export function computeStats(records: EngagementRecord[]): EngagementStats {
  const expertSeen = new Set<string>()
  const expertsByType: Record<string, Set<string>> = {}
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
    // Unique experts by name+company
    const key = `${r.expert_name}|||${r.expert_company}`
    expertSeen.add(key)
    if (!expertsByType[r.expert_type]) expertsByType[r.expert_type] = new Set()
    expertsByType[r.expert_type].add(key)

    // Count by status
    byStatus[r.status]++

    // Compute spend
    if (r.type === "call") {
      const hourlyRate = r.network_prices?.[r.network] ?? 0
      const cost = computeCallPrice(hourlyRate, r.duration_minutes, r.is_follow_up ?? false)
      totalSpendByStatus[r.status] += cost
    } else {
      // Survey: flat fee from the selected network
      const price = r.network_prices?.[r.network] ?? 0
      totalSpendByStatus[r.status] += price
    }
  }

  const uniqueByType: Record<string, number> = {}
  for (const [type, set] of Object.entries(expertsByType)) {
    uniqueByType[type] = set.size
  }

  return { uniqueByType, uniqueExperts: expertSeen.size, byStatus, totalSpendByStatus }
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
    duration_minutes: 60,
    network_prices: { AlphaSights: 650, GLG: null, "Third Bridge": null },
    network: "AlphaSights",
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
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
    is_follow_up: false,
    notes: "Cancelled -- scheduling conflict.",
    created_at: "2025-11-10T11:00:00Z",
  },
]
