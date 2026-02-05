import type { Expert, Call, Transcript, AISurvey } from "./types"

/* ------------------------------------------------------------------ */
/*  Synthetic demo data – loaded on first visit                       */
/* ------------------------------------------------------------------ */

function id() {
  return Math.random().toString(36).slice(2, 10)
}

const now = new Date().toISOString()

export const seedExperts: Expert[] = [
  {
    id: "exp-001", name: "Dr. Sarah Chen", title: "VP of R&D", company: "BioGen Corp",
    industry: "Healthcare", network: "GLG", compliance: "cleared", tags: ["mRNA", "regulatory"],
    callCount: 4, createdAt: "2026-01-15T10:00:00Z", updatedAt: now,
  },
  {
    id: "exp-002", name: "James Rivera", title: "Former CTO", company: "DataStream Inc",
    industry: "Technology", network: "AlphaSights", compliance: "cleared", tags: ["SaaS", "data infrastructure"],
    callCount: 2, createdAt: "2026-01-18T09:00:00Z", updatedAt: now,
  },
  {
    id: "exp-003", name: "Mark Thompson", title: "Director of Strategy", company: "EnergyX",
    industry: "Energy", network: "Third Bridge", compliance: "blocked",
    complianceNote: "Pending legal review -- potential conflict with target company",
    tags: ["renewables", "grid storage"], callCount: 0,
    createdAt: "2026-01-20T14:00:00Z", updatedAt: now,
  },
  {
    id: "exp-004", name: "Priya Sharma", title: "Head of Product", company: "FinTech Solutions",
    industry: "Finance", network: "GLG", compliance: "pending", tags: ["payments", "B2B SaaS"],
    callCount: 1, createdAt: "2026-01-22T11:00:00Z", updatedAt: now,
  },
  {
    id: "exp-005", name: "Alex Nguyen", title: "SVP Operations", company: "ConsumerCo",
    industry: "Consumer", network: "Guidepoint", compliance: "cleared", tags: ["supply chain", "DTC"],
    callCount: 3, createdAt: "2026-01-25T08:30:00Z", updatedAt: now,
  },
  {
    id: "exp-006", name: "Dr. Lisa Park", title: "Chief Medical Officer", company: "MedTech Innovations",
    industry: "Healthcare", network: "AlphaSights", compliance: "cleared", tags: ["diagnostics", "AI in healthcare"],
    callCount: 5, createdAt: "2026-01-10T07:00:00Z", updatedAt: now,
  },
  {
    id: "exp-007", name: "Robert Kim", title: "VP Engineering", company: "CloudScale",
    industry: "Technology", network: "Direct", compliance: "cleared", tags: ["cloud", "kubernetes", "platform"],
    callCount: 3, createdAt: "2026-01-28T13:00:00Z", updatedAt: now,
  },
  {
    id: "exp-008", name: "Maria Gonzalez", title: "Partner", company: "Energy Capital Partners",
    industry: "Energy", network: "GLG", compliance: "pending", tags: ["PE", "energy transition"],
    callCount: 0, createdAt: "2026-02-01T09:00:00Z", updatedAt: now,
  },
  {
    id: "exp-009", name: "David Chen", title: "Head of Strategy", company: "RetailMax",
    industry: "Consumer", network: "Third Bridge", compliance: "cleared", tags: ["e-commerce", "private label"],
    callCount: 2, createdAt: "2026-02-02T10:00:00Z", updatedAt: now,
  },
  {
    id: "exp-010", name: "Jennifer Walsh", title: "Managing Director", company: "HealthBridge Capital",
    industry: "Finance", network: "Guidepoint", compliance: "cleared",
    tags: ["healthcare investing", "biotech"], callCount: 1,
    createdAt: "2026-02-03T08:00:00Z", updatedAt: now,
  },
  {
    id: "exp-011", name: "Tom Hartley", title: "CTO", company: "BatteryWorks",
    industry: "Energy", network: "AlphaSights", compliance: "cleared",
    tags: ["battery tech", "cathode materials", "EV"], callCount: 6,
    createdAt: "2025-12-15T10:00:00Z", updatedAt: now,
  },
  {
    id: "exp-012", name: "Anika Patel", title: "VP Product", company: "InsurTech Global",
    industry: "Finance", network: "GLG", compliance: "cleared",
    tags: ["insurance", "underwriting AI"], callCount: 2,
    createdAt: "2026-01-05T12:00:00Z", updatedAt: now,
  },
]

export const seedCalls: Call[] = [
  {
    id: "call-001", expertId: "exp-001", expertName: "Dr. Sarah Chen",
    date: "2026-02-03T14:00:00Z", duration: 45, project: "Project Alpha",
    status: "completed", cost: 75000, notes: "Discussed mRNA pipeline timeline",
    transcriptId: "tx-001", createdAt: "2026-02-01T10:00:00Z", updatedAt: now,
  },
  {
    id: "call-002", expertId: "exp-002", expertName: "James Rivera",
    date: "2026-02-04T10:00:00Z", duration: 30, project: "Project Alpha",
    status: "completed", cost: 50000, transcriptId: "tx-002",
    createdAt: "2026-02-02T09:00:00Z", updatedAt: now,
  },
  {
    id: "call-003", expertId: "exp-005", expertName: "Alex Nguyen",
    date: "2026-02-05T15:00:00Z", duration: 60, project: "Project Beta",
    status: "scheduled", cost: 100000,
    createdAt: "2026-02-03T11:00:00Z", updatedAt: now,
  },
  {
    id: "call-004", expertId: "exp-004", expertName: "Priya Sharma",
    date: "2026-02-06T09:00:00Z", duration: 45, project: "Project Gamma",
    status: "scheduled", cost: 75000,
    createdAt: "2026-02-03T14:00:00Z", updatedAt: now,
  },
  {
    id: "call-005", expertId: "exp-003", expertName: "Mark Thompson",
    date: "2026-02-02T11:00:00Z", duration: 0, project: "Project Alpha",
    status: "cancelled", cost: 0, notes: "Compliance hold",
    createdAt: "2026-01-30T08:00:00Z", updatedAt: now,
  },
  {
    id: "call-006", expertId: "exp-006", expertName: "Dr. Lisa Park",
    date: "2026-02-01T10:00:00Z", duration: 50, project: "Project Alpha",
    status: "completed", cost: 83000, transcriptId: "tx-003",
    createdAt: "2026-01-28T09:00:00Z", updatedAt: now,
  },
  {
    id: "call-007", expertId: "exp-011", expertName: "Tom Hartley",
    date: "2026-02-04T16:00:00Z", duration: 40, project: "Project Beta",
    status: "completed", cost: 67000, transcriptId: "tx-004",
    createdAt: "2026-02-02T10:00:00Z", updatedAt: now,
  },
  {
    id: "call-008", expertId: "exp-007", expertName: "Robert Kim",
    date: "2026-02-07T11:00:00Z", duration: 30, project: "Project Gamma",
    status: "scheduled", cost: 50000,
    createdAt: "2026-02-04T08:00:00Z", updatedAt: now,
  },
  {
    id: "call-009", expertId: "exp-009", expertName: "David Chen",
    date: "2026-02-03T09:00:00Z", duration: 35, project: "Project Beta",
    status: "completed", cost: 58000,
    createdAt: "2026-02-01T07:00:00Z", updatedAt: now,
  },
  {
    id: "call-010", expertId: "exp-012", expertName: "Anika Patel",
    date: "2026-02-05T14:00:00Z", duration: 45, project: "Project Gamma",
    status: "scheduled", cost: 75000,
    createdAt: "2026-02-04T09:00:00Z", updatedAt: now,
  },
  {
    id: "call-011", expertId: "exp-001", expertName: "Dr. Sarah Chen",
    date: "2026-01-28T10:00:00Z", duration: 30, project: "Project Alpha",
    status: "completed", cost: 50000,
    createdAt: "2026-01-25T09:00:00Z", updatedAt: now,
  },
  {
    id: "call-012", expertId: "exp-005", expertName: "Alex Nguyen",
    date: "2026-01-30T14:00:00Z", duration: 45, project: "Project Beta",
    status: "completed", cost: 75000,
    createdAt: "2026-01-28T10:00:00Z", updatedAt: now,
  },
  {
    id: "call-013", expertId: "exp-010", expertName: "Jennifer Walsh",
    date: "2026-02-04T11:00:00Z", duration: 0, project: "Project Alpha",
    status: "no-show", cost: 0,
    createdAt: "2026-02-02T08:00:00Z", updatedAt: now,
  },
  {
    id: "call-014", expertId: "exp-002", expertName: "James Rivera",
    date: "2026-01-27T15:00:00Z", duration: 40, project: "Project Alpha",
    status: "completed", cost: 67000,
    createdAt: "2026-01-24T09:00:00Z", updatedAt: now,
  },
]

export const seedTranscripts: Transcript[] = [
  {
    id: "tx-001", callId: "call-001", expertName: "Dr. Sarah Chen",
    date: "2026-02-03T14:00:00Z",
    summary: "Discussed mRNA therapeutic development pipeline with timelines for Phase II trials. Key insight: regulatory pathway for mRNA-based treatments may be streamlined post-COVID precedent.",
    fullText: "Full transcript of the 45-minute call with Dr. Sarah Chen covering mRNA pipeline development, BioGen Corp's strategy, and regulatory landscape for novel therapeutics...",
    keyTopics: ["mRNA", "regulatory", "Phase II", "BioGen pipeline"],
    createdAt: now,
  },
  {
    id: "tx-002", callId: "call-002", expertName: "James Rivera",
    date: "2026-02-04T10:00:00Z",
    summary: "Covered data infrastructure trends and the shift from batch to real-time processing. DataStream's lessons on migration from legacy systems. Key insight: most enterprises underestimate migration costs by 40-60%.",
    fullText: "Full transcript of the 30-minute call with James Rivera covering data infrastructure modernisation, real-time processing adoption, and enterprise migration challenges...",
    keyTopics: ["data infrastructure", "real-time processing", "migration", "cost estimation"],
    createdAt: now,
  },
  {
    id: "tx-003", callId: "call-006", expertName: "Dr. Lisa Park",
    date: "2026-02-01T10:00:00Z",
    summary: "AI diagnostics market overview. MedTech Innovations using computer vision for pathology slides. FDA clearance expected Q3 2026. Key concern: reimbursement pathways still unclear for AI-augmented diagnostics.",
    fullText: "Full transcript of the 50-minute call with Dr. Lisa Park on AI in clinical diagnostics, MedTech Innovations product roadmap, and FDA regulatory considerations...",
    keyTopics: ["AI diagnostics", "computer vision", "FDA clearance", "reimbursement"],
    createdAt: now,
  },
  {
    id: "tx-004", callId: "call-007", expertName: "Tom Hartley",
    date: "2026-02-04T16:00:00Z",
    summary: "Deep dive on cathode material sourcing and battery supply chain bottlenecks. Lithium carbonate prices expected to stabilise by Q3, but nickel remains volatile. BatteryWorks exploring sodium-ion as hedge.",
    fullText: "Full transcript of the 40-minute call with Tom Hartley on battery technology supply chain, cathode material markets, and alternative battery chemistries...",
    keyTopics: ["battery supply chain", "cathode materials", "lithium carbonate", "sodium-ion"],
    createdAt: now,
  },
]

export const seedSurveys: AISurvey[] = [
  {
    id: "srv-001", name: "Battery Tech Outlook Q1", topic: "EV battery supply chain",
    status: "completed", sentTo: 8, responses: 6, avgNps: 78,
    createdAt: "2026-01-20T10:00:00Z", updatedAt: now,
  },
  {
    id: "srv-002", name: "SaaS Pricing Trends", topic: "B2B SaaS pricing models",
    status: "completed", sentTo: 12, responses: 9, avgNps: 65,
    createdAt: "2026-01-25T08:00:00Z", updatedAt: now,
  },
  {
    id: "srv-003", name: "Healthcare AI Adoption", topic: "AI in clinical workflows",
    status: "in-progress", sentTo: 10, responses: 3, avgNps: null,
    createdAt: "2026-02-01T09:00:00Z", updatedAt: now,
  },
  {
    id: "srv-004", name: "Fintech Regulation Outlook", topic: "Regulatory impact on digital banking",
    status: "draft", sentTo: 0, responses: 0, avgNps: null,
    createdAt: "2026-02-04T10:00:00Z", updatedAt: now,
  },
]
