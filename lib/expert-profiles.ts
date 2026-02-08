/* ------------------------------------------------------------------ */
/*  Consensus -- ExpertProfile seed data for the Experts table         */
/*                                                                     */
/*  ExpertProfile extends the LLM's ExtractedExpert with UI-layer      */
/*  fields (network_prices, screening_status, notes, cid_clearance).   */
/*  These profiles mirror the demo scenario (Project Atlas / Zephyr    */
/*  Controls).                                                         */
/* ------------------------------------------------------------------ */

import type { ExtractedExpert } from "./llm"

/* ------------------------------------------------------------------ */
/*  ExpertProfile -- the shape consumed by the experts table           */
/* ------------------------------------------------------------------ */

export type ExpertLens =
  | "all"
  | "customer"
  | "competitor"
  | "target"
  | "competitor_customer"

/** CID clearance status -- 5 possible states */
export type CidStatus =
  | "not_checked"   // No CID check performed yet
  | "no_conflict"   // Checked -- no matching names found in the conflict list
  | "pending"       // Checked -- match found, approval request sent, awaiting response
  | "approved"      // Checked -- compliance approved the engagement
  | "declined"      // Checked -- compliance declined the engagement

/** Screening triage state for an expert */
export type ScreeningStatus = "pending" | "shortlisted" | "discarded"

/** Compliance flags that can be attached to an expert */
export type ComplianceFlag =
  | "ben_advisor"       // Expert is a BAN (Bain Advisor Network) advisor
  | "compliance_flagged" // Compliance has flagged the expert as potentially fraudulent
  | "client_advisor"    // Expert is a current client advisor

export interface ExpertProfile extends ExtractedExpert {
  /** Prices per network.  e.g. { AlphaView: 650, GLS: 700 } */
  network_prices: Record<string, number | null>
  /** Triage state: pending (not yet reviewed), shortlisted, or discarded */
  screening_status: ScreeningStatus
  /** @deprecated -- kept for backward compat migration only */
  shortlisted?: boolean
  notes: string
  /** CID clearance status */
  cid_status: CidStatus
  /** @deprecated -- kept for backward compat migration only */
  cid_clearance_requested?: boolean
  /** Compliance & CID flags. Empty array = no flags. */
  compliance_flags: ComplianceFlag[]
}

/** Default networks in the demo data set */
export const DEFAULT_NETWORKS = ["AlphaView", "GLS", "FifthBridge"] as const

/**
 * Derive the full set of network names from the current data set.
 * Returns at least DEFAULT_NETWORKS, plus any extras found in profiles.
 */
export function getNetworks(profiles?: ExpertProfile[]): string[] {
  const set = new Set<string>(DEFAULT_NETWORKS)
  const list = profiles ?? getExpertProfiles()
  for (const p of list) {
    for (const n of Object.keys(p.network_prices ?? {})) set.add(n)
    if (p.network) set.add(p.network)
  }
  return Array.from(set)
}

/* ------------------------------------------------------------------ */
/*  localStorage keys                                                  */
/* ------------------------------------------------------------------ */

const LS_KEY = "consensus_expert_profiles"
const LS_SEEDED_KEY = "consensus_expert_profiles_seeded_v5"

/* ------------------------------------------------------------------ */
/*  Read / write helpers                                               */
/* ------------------------------------------------------------------ */

/** Ensure seed data is written to localStorage on first visit. */
function ensureSeeded(): void {
  if (typeof window === "undefined") return
  if (localStorage.getItem(LS_SEEDED_KEY)) return
  localStorage.setItem(LS_KEY, JSON.stringify(SEED_PROFILES))
  localStorage.setItem(LS_SEEDED_KEY, "1")
}

/** Read expert profiles from localStorage (seeds automatically on first call). */
export function getExpertProfiles(): ExpertProfile[] {
  if (typeof window === "undefined") return SEED_PROFILES
  ensureSeeded()
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return SEED_PROFILES
    const profiles = JSON.parse(raw) as ExpertProfile[]
    // Backward compat: ensure compliance_flags, cid_status & screening_status exist
    for (const p of profiles) {
      if (!p.compliance_flags) p.compliance_flags = []
      // Migrate old boolean shortlisted -> screening_status
      if (!p.screening_status) {
        p.screening_status = p.shortlisted ? "shortlisted" : "pending"
      }
      // Migrate old cid_clearance_requested / cid_cleared flag
      if (!p.cid_status) {
        if ((p.compliance_flags as string[]).includes("cid_cleared")) {
          p.cid_status = "approved"
          p.compliance_flags = p.compliance_flags.filter((f) => f !== ("cid_cleared" as ComplianceFlag))
        } else if (p.cid_clearance_requested) {
          p.cid_status = "pending"
        } else {
          p.cid_status = "not_checked"
        }
      }
    }
    return profiles
  } catch {
    return SEED_PROFILES
  }
}

/** Persist expert profiles to localStorage. */
export function saveExpertProfiles(profiles: ExpertProfile[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_KEY, JSON.stringify(profiles))
}

/** Reset to seed data (useful for demo resets). */
export function resetExpertProfiles(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(LS_KEY)
  localStorage.removeItem(LS_SEEDED_KEY)
}

/* ------------------------------------------------------------------ */
/*  Fuzzy name matching (Levenshtein distance)                         */
/* ------------------------------------------------------------------ */

function levenshtein(a: string, b: string): number {
  const la = a.length
  const lb = b.length
  const dp: number[][] = Array.from({ length: la + 1 }, () =>
    Array(lb + 1).fill(0) as number[],
  )
  for (let i = 0; i <= la; i++) dp[i][0] = i
  for (let j = 0; j <= lb; j++) dp[0][j] = j
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[la][lb]
}

/** Normalised similarity 0..1 (1 = identical) */
function similarity(a: string, b: string): number {
  const al = a.toLowerCase().trim()
  const bl = b.toLowerCase().trim()
  if (al === bl) return 1
  const maxLen = Math.max(al.length, bl.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(al, bl) / maxLen
}

/** Check if two experts are likely the same person.
 *  Name similarity >= 0.8 AND company similarity >= 0.7 */
function isSameExpert(
  a: { name: string; company: string },
  b: { name: string; company: string },
): boolean {
  return similarity(a.name, b.name) >= 0.8 && similarity(a.company, b.company) >= 0.7
}

/* ------------------------------------------------------------------ */
/*  Convert + merge helpers                                            */
/* ------------------------------------------------------------------ */

/**
 * Convert a raw LLM ExtractedExpert into an ExpertProfile.
 * Ensures all known networks are represented in network_prices.
 */
export function toExpertProfile(
  e: ExtractedExpert,
  existingNetworks?: string[],
): ExpertProfile {
  const nets = existingNetworks ?? [...DEFAULT_NETWORKS]
  // Make sure the expert's own network is in the set
  if (e.network && !nets.includes(e.network)) nets.push(e.network)
  const network_prices: Record<string, number | null> = {}
  for (const n of nets) {
    network_prices[n] = n === e.network ? e.price : null
  }
  return {
    ...e,
    network_prices,
    screening_status: "pending",
    notes: "",
    cid_status: "not_checked",
    compliance_flags: [],
  }
}

/* ------------------------------------------------------------------ */
/*  mergeNewExperts -- the key function for the upload pipeline         */
/*                                                                     */
/*  Returns a summary of what happened so the UI can display it.       */
/* ------------------------------------------------------------------ */

export interface MergeResult {
  /** Number of brand-new experts added */
  added: number
  /** Number of experts that already existed (skipped) */
  duplicates: number
  /** Number of existing experts that got a new network price merged */
  pricesMerged: number
  /** The full updated profiles list (already saved to localStorage) */
  profiles: ExpertProfile[]
}

export function mergeNewExperts(incoming: ExtractedExpert[]): MergeResult {
  const profiles = getExpertProfiles()
  const networks = getNetworks(profiles)
  let added = 0
  let duplicates = 0
  let pricesMerged = 0

  for (const raw of incoming) {
    // See if we already have this expert
    const existingIdx = profiles.findIndex((p) =>
      isSameExpert(p, raw),
    )

    if (existingIdx >= 0) {
      // Expert exists -- check if this is a new network/price
      const existing = profiles[existingIdx]
      const net = raw.network
      if (
        net &&
        raw.price != null &&
        (existing.network_prices[net] == null ||
          existing.network_prices[net] === undefined)
      ) {
        existing.network_prices[net] = raw.price
        // Also add to global network set if new
        if (!networks.includes(net)) networks.push(net)
        pricesMerged++
      }
      duplicates++
    } else {
      // Brand new expert
      const profile = toExpertProfile(raw, networks)
      profiles.push(profile)
      added++
    }
  }

  // Normalise all profiles so every expert has every network key
  for (const p of profiles) {
    for (const n of networks) {
      if (!(n in p.network_prices)) {
        p.network_prices[n] = null
      }
    }
  }

  saveExpertProfiles(profiles)
  return { added, duplicates, pricesMerged, profiles }
}

/* ------------------------------------------------------------------ */
/*  Project context (for CID clearance form auto-generation)           */
/* ------------------------------------------------------------------ */

export const PROJECT_CONTEXT = {
  projectName: "Project Atlas",
  targetCompany: "Zephyr Controls",
  caseLeader: "[Case Leader Name]",
  seniorManager: "[Senior Manager Name]",
  projectDescription:
    "Commercial due diligence on Zephyr Controls, a mid-market industrial controls and automation company. Evaluating growth trajectory, competitive positioning, customer retention, and margin sustainability ahead of a potential acquisition.",
}

/* ------------------------------------------------------------------ */
/*  Seed profiles                                                      */
/* ------------------------------------------------------------------ */

export const SEED_PROFILES: ExpertProfile[] = [
  /* ---- Customers ------------------------------------------------- */
  {
    name: "Raj Patel",
    role: "Senior Plant Engineering Leader",
    original_role: "VP of Plant Engineering",
    company: "Orion Packaging",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 650,
    network: "AlphaView",
    network_prices: { AlphaView: 650, GLS: null, "FifthBridge": null },
    industry_guess: "Paper & Packaging",
    fte_estimate: "1,000-5,000",
    screener_vendors_evaluated:
      "We looked at Zephyr Controls, Kestrel, and Trilon for our latest line expansion. Also got proposals from Stonemill but they were out of budget.",
    screener_vendor_selection_driver:
      "Ultimately it came down to integration support and total cost. The mid-market players were much more hands-on during commissioning.",
    screener_vendor_satisfaction:
      "I'd give our primary vendor an 8. Good product, responsive support, though documentation could be better.",
    screener_switch_trigger:
      "If lead times slipped consistently or if they couldn't support our move to more networked architectures. We need Ethernet/IP native, not bolted on.",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "16 years in plant operations. Manages automation procurement across 12 North American facilities. Annual controls spend ~$8M. Previously at Unilever manufacturing ops.",
    screening_status: "pending",
    notes: "",
    cid_status: "approved",
    compliance_flags: [],
  },
  {
    name: "Marcus Oyelaran",
    role: "Manufacturing Technology Director",
    original_role: "Director of Manufacturing Technology",
    company: "Hartwell Brewing Co.",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 550,
    network: "AlphaView",
    network_prices: { AlphaView: 550, GLS: 600, "FifthBridge": null },
    industry_guess: "Food & Beverage Manufacturing",
    fte_estimate: "500-1,000",
    screener_vendors_evaluated:
      "Zephyr Controls and Stonemill. We also looked at Siemens but their local distributor coverage was thin in our regions.",
    screener_vendor_selection_driver:
      "Zephyr won our latest project because their field engineers actually understood our washdown requirements without us having to educate them.",
    screener_vendor_satisfaction:
      "Zephyr gets a 9 from us. Very responsive, and their PLC programming environment has gotten much better in the last two releases.",
    screener_switch_trigger:
      "Acquisition by a larger company that changed the support model. That hands-on approach is why we chose them.",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "11 years in food & beverage manufacturing. Oversees automation strategy for 4 breweries. Manages $3.5M annual controls budget.",
    screening_status: "pending",
    notes: "",
    cid_status: "approved",
    compliance_flags: [],
  },
  {
    name: "Chen Wei-Lin",
    role: "Chief Engineering Officer",
    original_role: "Chief Engineer",
    company: "TerraForge Metals",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 600,
    network: "AlphaView",
    network_prices: { AlphaView: 600, GLS: null, "FifthBridge": 575 },
    industry_guess: "Specialty Metals",
    fte_estimate: "500-1,000",
    screener_vendors_evaluated:
      "Stonemill, Siemens, and Zephyr Controls. For our environment we need proven high-temp rated hardware so the field narrows quickly.",
    screener_vendor_selection_driver:
      "Stonemill won on installed base compatibility, but Zephyr came very close. Their newer high-temp rated I/O modules impressed our maintenance team.",
    screener_vendor_satisfaction:
      "Stonemill is a 7 -- solid but expensive. I'd rate Zephyr an 8 on the project we trialled them on.",
    screener_switch_trigger:
      "Significant cost savings with equivalent reliability data. We need at least 3 years of MTBF data before we commit to a new vendor at scale.",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "14 years in metals and heavy manufacturing. Manages automation for high-temperature and hazardous environments. Previously at Nucor Steel.",
    screening_status: "pending",
    notes: "",
    cid_status: "not_checked",
    compliance_flags: [],
  },
  {
    name: "James Achebe",
    role: "Global Automation Standards Leader",
    original_role: "Global Automation Manager",
    company: "Brambleway Foods",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 750,
    network: "GLS",
    network_prices: { AlphaView: null, GLS: 750, "FifthBridge": null },
    industry_guess: "Food & Beverage Manufacturing",
    fte_estimate: "10,000-50,000",
    screener_vendors_evaluated:
      "Stonemill is our global standard but we have been piloting Zephyr Controls in 3 plants for secondary lines. We also evaluated Kestrel for a new greenfield facility in Ontario.",
    screener_vendor_selection_driver:
      "For the Zephyr pilots, it was 30% cost savings on hardware plus their willingness to provide on-site commissioning support at no extra charge for the first year.",
    screener_vendor_satisfaction:
      "Stonemill is a 7 -- reliable but the cost keeps climbing. Zephyr is an 8 so far on the pilots, but it is early days.",
    screener_switch_trigger:
      "If Zephyr can demonstrate consistent performance across all 3 pilot plants over 18 months, we would consider them for our global approved vendor list.",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "18 years in food manufacturing. Manages global automation standards and vendor relationships across 22 plants in North America and Europe. $15M annual automation spend.",
    screening_status: "pending",
    notes: "",
    cid_status: "no_conflict",
    compliance_flags: ["ben_advisor"],
  },
  {
    name: "Roberto Garza",
    role: "Reliability & Maintenance Director",
    original_role: "Maintenance & Reliability Director",
    company: "Cascadia Paper Products",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 600,
    network: "GLS",
    network_prices: { AlphaView: 650, GLS: 600, "FifthBridge": null },
    industry_guess: "Paper & Packaging",
    fte_estimate: "1,000-5,000",
    screener_vendors_evaluated:
      "ABB for our main DCS, Zephyr Controls for discrete PLC applications on packaging lines, and Stonemill for some legacy upgrades.",
    screener_vendor_selection_driver:
      "Zephyr was selected for the packaging line retrofit because their lead time was 6 weeks vs 14 weeks from Stonemill. In our industry, downtime costs $50K/hour so speed matters enormously.",
    screener_vendor_satisfaction:
      "Zephyr is a solid 8. Their tech support response time averages under 2 hours. ABB is a 7 on the DCS side. Stonemill is a 6 -- great products but support is slow.",
    screener_switch_trigger:
      "If Zephyr's support model degraded after growth or acquisition, that would be a red flag. We chose them specifically because they act like a partner, not a vendor.",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "15 years in pulp & paper manufacturing. Responsible for automation reliability across 3 mills. Has deployed systems from Stonemill, Zephyr Controls, and ABB.",
    screening_status: "pending",
    notes: "",
    cid_status: "not_checked",
    compliance_flags: ["client_advisor"],
  },
  {
    name: "Angela Moretti",
    role: "Plant Operations Manager",
    original_role: "Plant Manager",
    company: "Cedarpoint Chemicals",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 500,
    network: "FifthBridge",
    network_prices: { AlphaView: null, GLS: null, "FifthBridge": 500 },
    industry_guess: "Chemicals",
    fte_estimate: "500-1,000",
    screener_vendors_evaluated: "Not answered",
    screener_vendor_selection_driver: "Not answered",
    screener_vendor_satisfaction: "Not answered",
    screener_switch_trigger: "Not answered",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "Process industries customer. Imported from CSV -- no screening responses available.",
    screening_status: "pending",
    notes: "",
    cid_status: "pending",
    compliance_flags: ["compliance_flagged"],
  },
  {
    name: "Yuki Tanaka",
    role: "Automation Engineering Director",
    original_role: "Director of Automation",
    company: "Nippon Precision Components",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 700,
    network: "FifthBridge",
    network_prices: { AlphaView: null, GLS: 725, "FifthBridge": 700 },
    industry_guess: "Automotive Components",
    fte_estimate: "5,000-10,000",
    screener_vendors_evaluated: "Not answered",
    screener_vendor_selection_driver: "Not answered",
    screener_vendor_satisfaction: "Not answered",
    screener_switch_trigger: "Not answered",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "Automotive Tier 2 customer. Japan-NA operations. Imported from CSV -- no screening responses available.",
    screening_status: "pending",
    notes: "",
    cid_status: "not_checked",
    compliance_flags: [],
  },
  {
    name: "Priya Chakraborty",
    role: "Senior Engineering Manager",
    original_role: "Engineering Manager",
    company: "Atlas Cement Corp",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 550,
    network: "FifthBridge",
    network_prices: { AlphaView: null, GLS: null, "FifthBridge": 550 },
    industry_guess: "Building Materials",
    fte_estimate: "1,000-5,000",
    screener_vendors_evaluated: "Not answered",
    screener_vendor_selection_driver: "Not answered",
    screener_vendor_satisfaction: "Not answered",
    screener_switch_trigger: "Not answered",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "Heavy industry / harsh environment customer. Imported from CSV -- no screening responses available.",
    screening_status: "pending",
    notes: "",
    cid_status: "not_checked",
    compliance_flags: [],
  },

  /* ---- Competitors ----------------------------------------------- */
  {
    name: "Diane Kowalski",
    role: "Former Senior Sales Executive",
    original_role: "Former SVP Sales, Kestrel Automation North America",
    company: "Kestrel Automation",
    expert_type: "competitor",
    former: true,
    date_left: "2024-08",
    price: 950,
    network: "AlphaView",
    network_prices: { AlphaView: 950, GLS: 1000, "FifthBridge": null },
    industry_guess: "Industrial Automation",
    fte_estimate: "5,000-10,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape:
      "The mid-market is getting crowded. You have Kestrel, Zephyr Controls, WAGO, and Trilon all fighting for the same $2-10M plant budgets. Stonemill and Siemens own the top end.",
    screener_losing_deals_to:
      "When I was at Kestrel, we lost most often to Zephyr Controls in food & beverage and to Trilon in automotive Tier 2. Zephyr's local support model is very effective.",
    screener_pricing_comparison:
      "Kestrel is slightly premium but justifiable on total cost. Zephyr is maybe 10-15% cheaper on hardware but closes the gap on service contracts.",
    screener_rd_investment:
      "Kestrel is all-in on XTS linear transport and TwinCAT cloud engineering. The industry is moving toward software-defined control.",
    additional_info:
      "19 years in industrial automation sales. Built Kestrel's NA business from $40M to $180M revenue. Previously at B&R Automation (now ABB) and Bosch Rexroth. Non-compete expired.",
    screening_status: "pending",
    notes: "",
    cid_status: "no_conflict",
    compliance_flags: [],
  },
  {
    name: "Sandra Voss",
    role: "Head of Corporate Strategy",
    original_role: "Head of Strategy, Trilon Industrial Automation, Americas",
    company: "Trilon Industrial Automation",
    expert_type: "competitor",
    former: false,
    date_left: "N/A",
    price: 1100,
    network: "AlphaView",
    network_prices: { AlphaView: 1100, GLS: null, "FifthBridge": null },
    industry_guess: "Industrial Automation",
    fte_estimate: "10,000-50,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape:
      "The mid-market is fragmenting. Zephyr Controls has built a strong regional presence in North America, while Kestrel is pushing hard from Europe. Trilon differentiates on vision and robotics integration.",
    screener_losing_deals_to:
      "In discrete manufacturing we lose to Kestrel on innovation and to Zephyr Controls on price-for-value in the $1-5M project range.",
    screener_pricing_comparison:
      "We are competitive but the Japanese yen fluctuation creates margin pressure. Zephyr and Kestrel both have domestic manufacturing advantages.",
    screener_rd_investment:
      "AI-enabled quality inspection and tighter robotics-PLC integration. We think the control layer and the robot layer merge within 5 years.",
    additional_info:
      "13 years at Trilon. Leads corporate strategy and M&A evaluation for the Americas region. Previously at McKinsey (industrials practice). Currently employed -- requires pre-screening for confidentiality.",
    screening_status: "pending",
    notes: "",
    cid_status: "declined",
    compliance_flags: [],
  },
  {
    name: "Tomoko Sato",
    role: "Americas BD Director",
    original_role: "Director of Business Development, WAGO Corporation (Americas)",
    company: "WAGO Corporation",
    expert_type: "competitor",
    former: false,
    date_left: "N/A",
    price: 900,
    network: "GLS",
    network_prices: { AlphaView: null, GLS: 900, "FifthBridge": 875 },
    industry_guess: "Industrial Automation",
    fte_estimate: "5,000-10,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape:
      "The mid-market is the most dynamic part of the controls industry right now. WAGO, Zephyr Controls, and Kestrel are all growing faster than the large incumbents. The customer base is looking for alternatives to Stonemill's pricing.",
    screener_losing_deals_to:
      "Zephyr Controls in food & beverage and general manufacturing. Kestrel in high-performance machine building. We differentiate on open standards and DIN-rail I/O density.",
    screener_pricing_comparison:
      "WAGO is generally in line with Zephyr on I/O pricing. They tend to win on the PLC/controller level where they have stronger software.",
    screener_rd_investment:
      "Docker-based runtime environments on our controllers, expanded MQTT/OPC-UA connectivity, and compact safety I/O. We see the edge compute layer as key.",
    additional_info:
      "10 years at WAGO. Leads BD for industrial automation products across North and South America. Previously at Phoenix Contact in product management. Currently employed -- requires pre-screening.",
    screening_status: "pending",
    notes: "",
    cid_status: "not_checked",
    compliance_flags: [],
  },
  {
    name: "Henrik Larsson",
    role: "VP Manufacturing Operations",
    original_role: "VP Manufacturing",
    company: "Kestrel Automation",
    expert_type: "competitor",
    former: false,
    date_left: "N/A",
    price: 850,
    network: "FifthBridge",
    network_prices: { AlphaView: null, GLS: null, "FifthBridge": 850 },
    industry_guess: "Industrial Automation",
    fte_estimate: "5,000-10,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape: "Not answered",
    screener_losing_deals_to: "Not answered",
    screener_pricing_comparison: "Not answered",
    screener_rd_investment: "Not answered",
    additional_info:
      "PC-based control expert. European perspective. Imported from CSV -- no screening responses available.",
    screening_status: "pending",
    notes: "",
    cid_status: "not_checked",
    compliance_flags: [],
  },
  {
    name: "Derek Otieno",
    role: "Industrial Strategy Director",
    original_role: "Head of Industrial Strategy",
    company: "Turck Inc.",
    expert_type: "competitor",
    former: false,
    date_left: "N/A",
    price: 800,
    network: "FifthBridge",
    network_prices: { AlphaView: 825, GLS: null, "FifthBridge": 800 },
    industry_guess: "Industrial Automation",
    fte_estimate: "5,000-10,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape: "Not answered",
    screener_losing_deals_to: "Not answered",
    screener_pricing_comparison: "Not answered",
    screener_rd_investment: "Not answered",
    additional_info:
      "Sensor/IO and fieldbus/connectivity specialist. Imported from CSV -- no screening responses available.",
    screening_status: "pending",
    notes: "",
    cid_status: "not_checked",
    compliance_flags: [],
  },

  /* ---- Target (Zephyr Controls insiders) ----------------------- */
  {
    name: "Laura Fischer",
    role: "Former Chief Operations Executive",
    original_role: "Former COO, Zephyr Controls",
    company: "Zephyr Controls",
    expert_type: "target",
    former: true,
    date_left: "2024-11",
    price: 1200,
    network: "GLS",
    network_prices: { AlphaView: null, GLS: 1200, "FifthBridge": 1150 },
    industry_guess: "Industrial Automation",
    fte_estimate: "1,000-5,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape:
      "Zephyr occupies a strong niche in the mid-market. The company competes primarily with Kestrel, Trilon, and WAGO, while trying to pull customers down from Stonemill. The value proposition is local service plus competitive pricing.",
    screener_losing_deals_to:
      "While I was there, Kestrel was the toughest competitor on technology. Trilon competed hard on price in automotive. Stonemill was difficult to displace in brownfield sites.",
    screener_pricing_comparison:
      "Zephyr typically prices 10-20% below Stonemill and roughly in line with Kestrel, but margins are protected by the service contract attach rate which runs around 65%.",
    screener_rd_investment:
      "When I left, the roadmap priorities were Ethernet-APL I/O for process industries, a cloud-based engineering toolkit, and edge analytics modules. The R&D budget was growing about 15% YoY.",
    additional_info:
      "21 years in industrial automation. Most recently COO at Zephyr Controls overseeing manufacturing, supply chain, and field operations for 7 years. Previously at Stonemill Automation and Parker Hannifin. Left 2+ months ago, no active non-compete. Will need CID clearance given recency.",
    screening_status: "pending",
    notes: "",
    cid_status: "pending",
    compliance_flags: [],
  },
  {
    name: "Nathan Cross",
    role: "Former Product Strategy Leader",
    original_role: "Former VP Product, Zephyr Controls",
    company: "Zephyr Controls",
    expert_type: "target",
    former: true,
    date_left: "Unknown",
    price: 950,
    network: "FifthBridge",
    network_prices: { AlphaView: null, GLS: null, "FifthBridge": 950 },
    industry_guess: "Industrial Automation",
    fte_estimate: "1,000-5,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape: "Not answered",
    screener_losing_deals_to: "Not answered",
    screener_pricing_comparison: "Not answered",
    screener_rd_investment: "Not answered",
    additional_info:
      "Former target company insider. Product roadmap and R&D perspective. Imported from CSV -- no screening responses available. Compliance pending.",
    screening_status: "pending",
    notes: "",
    cid_status: "declined",
    compliance_flags: [],
  },
]
