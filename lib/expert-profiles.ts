/* ------------------------------------------------------------------ */
/*  Helmsman -- ExpertProfile seed data for the Experts table          */
/*                                                                     */
/*  ExpertProfile extends the LLM's ExtractedExpert with UI-layer      */
/*  fields (network_prices, shortlisted, notes, cid_clearance).        */
/*  These profiles mirror the demo scenario (Project Atlas / Meridian  */
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

export interface ExpertProfile extends ExtractedExpert {
  /** Prices per network.  e.g. { AlphaSights: 650, GLG: 700 } */
  network_prices: Record<string, number | null>
  shortlisted: boolean
  notes: string
  cid_clearance_requested: boolean
}

/** All networks present in the current data set */
export const NETWORKS = ["AlphaSights", "GLG", "Third Bridge"] as const

/* ------------------------------------------------------------------ */
/*  Read / write helpers (localStorage stubs)                          */
/* ------------------------------------------------------------------ */

export function getExpertProfiles(): ExpertProfile[] {
  // TODO: read from localStorage first, fall back to seeds
  return SEED_PROFILES
}

export function saveExpertProfiles(_profiles: ExpertProfile[]): void {
  // TODO: localStorage.setItem("helmsman_expert_profiles", JSON.stringify(profiles))
}

/* ------------------------------------------------------------------ */
/*  Convert a raw LLM ExtractedExpert into an ExpertProfile            */
/*  (used when new experts come from the upload pipeline)              */
/* ------------------------------------------------------------------ */

export function toExpertProfile(e: ExtractedExpert): ExpertProfile {
  const network_prices: Record<string, number | null> = {}
  for (const n of NETWORKS) {
    network_prices[n] = n === e.network ? e.price : null
  }
  return {
    ...e,
    network_prices,
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
  }
}

/* ------------------------------------------------------------------ */
/*  Project context (for CID clearance form auto-generation)           */
/* ------------------------------------------------------------------ */

export const PROJECT_CONTEXT = {
  projectName: "Project Atlas",
  targetCompany: "Meridian Controls",
  caseLeader: "[Case Leader Name]",
  seniorManager: "[Senior Manager Name]",
  projectDescription:
    "Commercial due diligence on Meridian Controls, a mid-market industrial controls and automation company. Evaluating growth trajectory, competitive positioning, customer retention, and margin sustainability ahead of a potential acquisition.",
}

/* ------------------------------------------------------------------ */
/*  Seed profiles                                                      */
/* ------------------------------------------------------------------ */

const SEED_PROFILES: ExpertProfile[] = [
  /* ---- Customers ------------------------------------------------- */
  {
    name: "Raj Patel",
    role: "Senior Plant Engineering Leader",
    original_role: "VP of Plant Engineering",
    company: "Solaris Packaging",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 650,
    network: "AlphaSights",
    network_prices: { AlphaSights: 650, GLG: null, "Third Bridge": null },
    industry_guess: "Paper & Packaging",
    fte_estimate: "1,000-5,000",
    screener_vendors_evaluated:
      "We looked at Meridian Controls, Beckhoff, and Omron for our latest line expansion. Also got proposals from Rockwell but they were out of budget.",
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
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
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
    network: "AlphaSights",
    network_prices: { AlphaSights: 550, GLG: 600, "Third Bridge": null },
    industry_guess: "Food & Beverage Manufacturing",
    fte_estimate: "500-1,000",
    screener_vendors_evaluated:
      "Meridian Controls and Rockwell. We also looked at Siemens but their local distributor coverage was thin in our regions.",
    screener_vendor_selection_driver:
      "Meridian won our latest project because their field engineers actually understood our washdown requirements without us having to educate them.",
    screener_vendor_satisfaction:
      "Meridian gets a 9 from us. Very responsive, and their PLC programming environment has gotten much better in the last two releases.",
    screener_switch_trigger:
      "Acquisition by a larger company that changed the support model. That hands-on approach is why we chose them.",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "11 years in food & beverage manufacturing. Oversees automation strategy for 4 breweries. Manages $3.5M annual controls budget.",
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
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
    network: "AlphaSights",
    network_prices: { AlphaSights: 600, GLG: null, "Third Bridge": 575 },
    industry_guess: "Specialty Metals",
    fte_estimate: "500-1,000",
    screener_vendors_evaluated:
      "Rockwell, Siemens, and Meridian Controls. For our environment we need proven high-temp rated hardware so the field narrows quickly.",
    screener_vendor_selection_driver:
      "Rockwell won on installed base compatibility, but Meridian came very close. Their newer high-temp rated I/O modules impressed our maintenance team.",
    screener_vendor_satisfaction:
      "Rockwell is a 7 -- solid but expensive. I'd rate Meridian an 8 on the project we trialled them on.",
    screener_switch_trigger:
      "Significant cost savings with equivalent reliability data. We need at least 3 years of MTBF data before we commit to a new vendor at scale.",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "14 years in metals and heavy manufacturing. Manages automation for high-temperature and hazardous environments. Previously at Nucor Steel.",
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
  },
  {
    name: "James Achebe",
    role: "Global Automation Standards Leader",
    original_role: "Global Automation Manager",
    company: "FreshPath Foods",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 750,
    network: "GLG",
    network_prices: { AlphaSights: null, GLG: 750, "Third Bridge": null },
    industry_guess: "Food & Beverage Manufacturing",
    fte_estimate: "10,000-50,000",
    screener_vendors_evaluated:
      "Rockwell is our global standard but we have been piloting Meridian Controls in 3 plants for secondary lines. We also evaluated Beckhoff for a new greenfield facility in Ontario.",
    screener_vendor_selection_driver:
      "For the Meridian pilots, it was 30% cost savings on hardware plus their willingness to provide on-site commissioning support at no extra charge for the first year.",
    screener_vendor_satisfaction:
      "Rockwell is a 7 -- reliable but the cost keeps climbing. Meridian is an 8 so far on the pilots, but it is early days.",
    screener_switch_trigger:
      "If Meridian can demonstrate consistent performance across all 3 pilot plants over 18 months, we would consider them for our global approved vendor list.",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "18 years in food manufacturing. Manages global automation standards and vendor relationships across 22 plants in North America and Europe. $15M annual automation spend.",
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
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
    network: "GLG",
    network_prices: { AlphaSights: 650, GLG: 600, "Third Bridge": null },
    industry_guess: "Paper & Packaging",
    fte_estimate: "1,000-5,000",
    screener_vendors_evaluated:
      "ABB for our main DCS, Meridian Controls for discrete PLC applications on packaging lines, and Rockwell for some legacy upgrades.",
    screener_vendor_selection_driver:
      "Meridian was selected for the packaging line retrofit because their lead time was 6 weeks vs 14 weeks from Rockwell. In our industry, downtime costs $50K/hour so speed matters enormously.",
    screener_vendor_satisfaction:
      "Meridian is a solid 8. Their tech support response time averages under 2 hours. ABB is a 7 on the DCS side. Rockwell is a 6 -- great products but support is slow.",
    screener_switch_trigger:
      "If Meridian's support model degraded after growth or acquisition, that would be a red flag. We chose them specifically because they act like a partner, not a vendor.",
    screener_competitive_landscape: null,
    screener_losing_deals_to: null,
    screener_pricing_comparison: null,
    screener_rd_investment: null,
    additional_info:
      "15 years in pulp & paper manufacturing. Responsible for automation reliability across 3 mills. Has deployed systems from Rockwell, Meridian Controls, and ABB.",
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
  },
  {
    name: "Angela Moretti",
    role: "Plant Operations Manager",
    original_role: "Plant Manager",
    company: "GreenValley Chemicals",
    expert_type: "customer",
    former: false,
    date_left: "N/A",
    price: 500,
    network: "Third Bridge",
    network_prices: { AlphaSights: null, GLG: null, "Third Bridge": 500 },
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
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
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
    network: "Third Bridge",
    network_prices: { AlphaSights: null, GLG: 725, "Third Bridge": 700 },
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
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
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
    network: "Third Bridge",
    network_prices: { AlphaSights: null, GLG: null, "Third Bridge": 550 },
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
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
  },

  /* ---- Competitors ----------------------------------------------- */
  {
    name: "Diane Kowalski",
    role: "Former Senior Sales Executive",
    original_role: "Former SVP Sales, Beckhoff Automation North America",
    company: "Beckhoff Automation",
    expert_type: "competitor",
    former: true,
    date_left: "2024-08",
    price: 950,
    network: "AlphaSights",
    network_prices: { AlphaSights: 950, GLG: 1000, "Third Bridge": null },
    industry_guess: "Industrial Automation",
    fte_estimate: "5,000-10,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape:
      "The mid-market is getting crowded. You have Beckhoff, Meridian Controls, WAGO, and Omron all fighting for the same $2-10M plant budgets. Rockwell and Siemens own the top end.",
    screener_losing_deals_to:
      "When I was at Beckhoff, we lost most often to Meridian Controls in food & beverage and to Omron in automotive Tier 2. Meridian's local support model is very effective.",
    screener_pricing_comparison:
      "Beckhoff is slightly premium but justifiable on total cost. Meridian is maybe 10-15% cheaper on hardware but closes the gap on service contracts.",
    screener_rd_investment:
      "Beckhoff is all-in on XTS linear transport and TwinCAT cloud engineering. The industry is moving toward software-defined control.",
    additional_info:
      "19 years in industrial automation sales. Built Beckhoff's NA business from $40M to $180M revenue. Previously at B&R Automation (now ABB) and Bosch Rexroth. Non-compete expired.",
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
  },
  {
    name: "Sandra Voss",
    role: "Head of Corporate Strategy",
    original_role: "Head of Strategy, Omron Industrial Automation, Americas",
    company: "Omron Industrial Automation",
    expert_type: "competitor",
    former: false,
    date_left: "N/A",
    price: 1100,
    network: "AlphaSights",
    network_prices: { AlphaSights: 1100, GLG: null, "Third Bridge": null },
    industry_guess: "Industrial Automation",
    fte_estimate: "10,000-50,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape:
      "The mid-market is fragmenting. Meridian Controls has built a strong regional presence in North America, while Beckhoff is pushing hard from Europe. Omron differentiates on vision and robotics integration.",
    screener_losing_deals_to:
      "In discrete manufacturing we lose to Beckhoff on innovation and to Meridian Controls on price-for-value in the $1-5M project range.",
    screener_pricing_comparison:
      "We are competitive but the Japanese yen fluctuation creates margin pressure. Meridian and Beckhoff both have domestic manufacturing advantages.",
    screener_rd_investment:
      "AI-enabled quality inspection and tighter robotics-PLC integration. We think the control layer and the robot layer merge within 5 years.",
    additional_info:
      "13 years at Omron. Leads corporate strategy and M&A evaluation for the Americas region. Previously at McKinsey (industrials practice). Currently employed -- requires pre-screening for confidentiality.",
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
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
    network: "GLG",
    network_prices: { AlphaSights: null, GLG: 900, "Third Bridge": 875 },
    industry_guess: "Industrial Automation",
    fte_estimate: "5,000-10,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape:
      "The mid-market is the most dynamic part of the controls industry right now. WAGO, Meridian Controls, and Beckhoff are all growing faster than the large incumbents. The customer base is looking for alternatives to Rockwell's pricing.",
    screener_losing_deals_to:
      "Meridian Controls in food & beverage and general manufacturing. Beckhoff in high-performance machine building. We differentiate on open standards and DIN-rail I/O density.",
    screener_pricing_comparison:
      "WAGO is generally in line with Meridian on I/O pricing. They tend to win on the PLC/controller level where they have stronger software.",
    screener_rd_investment:
      "Docker-based runtime environments on our controllers, expanded MQTT/OPC-UA connectivity, and compact safety I/O. We see the edge compute layer as key.",
    additional_info:
      "10 years at WAGO. Leads BD for industrial automation products across North and South America. Previously at Phoenix Contact in product management. Currently employed -- requires pre-screening.",
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
  },
  {
    name: "Henrik Larsson",
    role: "VP Manufacturing Operations",
    original_role: "VP Manufacturing",
    company: "Beckhoff Automation",
    expert_type: "competitor",
    former: false,
    date_left: "N/A",
    price: 850,
    network: "Third Bridge",
    network_prices: { AlphaSights: null, GLG: null, "Third Bridge": 850 },
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
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
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
    network: "Third Bridge",
    network_prices: { AlphaSights: 825, GLG: null, "Third Bridge": 800 },
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
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
  },

  /* ---- Target (Meridian Controls insiders) ----------------------- */
  {
    name: "Laura Fischer",
    role: "Former Chief Operations Executive",
    original_role: "Former COO, Meridian Controls",
    company: "Meridian Controls",
    expert_type: "target",
    former: true,
    date_left: "2024-11",
    price: 1200,
    network: "GLG",
    network_prices: { AlphaSights: null, GLG: 1200, "Third Bridge": 1150 },
    industry_guess: "Industrial Automation",
    fte_estimate: "1,000-5,000",
    screener_vendors_evaluated: null,
    screener_vendor_selection_driver: null,
    screener_vendor_satisfaction: null,
    screener_switch_trigger: null,
    screener_competitive_landscape:
      "Meridian occupies a strong niche in the mid-market. The company competes primarily with Beckhoff, Omron, and WAGO, while trying to pull customers down from Rockwell. The value proposition is local service plus competitive pricing.",
    screener_losing_deals_to:
      "While I was there, Beckhoff was the toughest competitor on technology. Omron competed hard on price in automotive. Rockwell was difficult to displace in brownfield sites.",
    screener_pricing_comparison:
      "Meridian typically prices 10-20% below Rockwell and roughly in line with Beckhoff, but margins are protected by the service contract attach rate which runs around 65%.",
    screener_rd_investment:
      "When I left, the roadmap priorities were Ethernet-APL I/O for process industries, a cloud-based engineering toolkit, and edge analytics modules. The R&D budget was growing about 15% YoY.",
    additional_info:
      "21 years in industrial automation. Most recently COO at Meridian Controls overseeing manufacturing, supply chain, and field operations for 7 years. Previously at Rockwell Automation and Parker Hannifin. Left 2+ months ago, no active non-compete. Will need CID clearance given recency.",
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
  },
  {
    name: "Nathan Cross",
    role: "Former Product Strategy Leader",
    original_role: "Former VP Product, Meridian Controls",
    company: "Meridian Controls",
    expert_type: "target",
    former: true,
    date_left: "Unknown",
    price: 950,
    network: "Third Bridge",
    network_prices: { AlphaSights: null, GLG: null, "Third Bridge": 950 },
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
    shortlisted: false,
    notes: "",
    cid_clearance_requested: false,
  },
]
