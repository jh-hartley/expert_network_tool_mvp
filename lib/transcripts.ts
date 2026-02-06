/* ------------------------------------------------------------------ */
/*  Helmsman -- Transcript storage                                     */
/*                                                                     */
/*  Transcripts are stored in localStorage keyed by engagement ID.     */
/*  Each transcript carries the expert name, company, and expert type  */
/*  so they can be queried/filtered independently.                     */
/* ------------------------------------------------------------------ */

export interface Transcript {
  /** The engagement record ID this transcript belongs to */
  engagement_id: string
  /** Expert name (for searching/filtering) */
  expert_name: string
  /** Expert company */
  expert_company: string
  /** Expert type: customer | competitor | target | competitor_customer */
  expert_type: string
  /** "call" or "survey" */
  engagement_type: "call" | "survey"
  /** Raw transcript text */
  text: string
  /** ISO date when the transcript was uploaded */
  uploaded_at: string
}

/* ------------------------------------------------------------------ */
/*  Seed transcripts for completed calls                               */
/* ------------------------------------------------------------------ */

const SEED_TRANSCRIPTS: Transcript[] = [
  {
    engagement_id: "call_seed_1",
    expert_name: "Raj Patel",
    expert_company: "Solaris Packaging",
    expert_type: "customer",
    engagement_type: "call",
    uploaded_at: "2025-11-14T11:15:00Z",
    text: `CALL TRANSCRIPT -- Raj Patel, VP of Plant Engineering, Solaris Packaging
Date: 14 November 2025 | Duration: 60 min | Network: AlphaSights

INTERVIEWER: Thank you for joining, Raj. Could you start by walking us through how Solaris first evaluated Meridian Controls?

RAJ PATEL: Sure. We began our evaluation roughly eighteen months ago when we needed to replace aging Rockwell PLCs across three of our packaging lines. Meridian came onto our radar through an industry conference -- their demo of the real-time adaptive control loop was genuinely impressive compared to what we'd seen from incumbents.

INTERVIEWER: What were the key selection criteria for Solaris?

RAJ PATEL: Three things drove it. First, total cost of ownership -- Meridian's licensing model was roughly 30% lower over a five-year horizon compared to Rockwell and Siemens. Second, ease of integration with our existing SCADA layer. Third, and this was the clincher, their predictive maintenance module. We'd been losing about 12% of uptime annually on unplanned stoppages, and their analytics showed credible paths to cutting that by half.

INTERVIEWER: How has the rollout gone so far?

RAJ PATEL: We're about eight months in and we've completed two of the three lines. I'd say 80% positive. The initial integration was smoother than expected -- their API documentation is vastly better than what we experienced with Honeywell. The main friction point has been lead times on replacement IO modules. We had a six-week wait on a batch of analog input cards which held up Line 2 commissioning. That's something they need to address if they want to compete seriously at scale.

INTERVIEWER: And the predictive maintenance results?

RAJ PATEL: Early data looks promising. We've seen unplanned downtime drop from about 12% to roughly 7.5% on Line 1 which has been live longest. The anomaly detection catches bearing wear patterns about two weeks before we'd typically notice vibration issues. I'm cautiously optimistic we'll hit the 6% target by end of year once the models have a full seasonal cycle of data.

INTERVIEWER: Would you recommend Meridian to a peer in your position?

RAJ PATEL: With caveats, yes. If your operation is mid-scale -- say 5 to 15 lines -- and you're not locked into a long-term Rockwell enterprise agreement, Meridian is worth serious consideration. For very large plants with 50+ lines, I'd want to see more proof points on their scalability. But for our size, it's been a good decision.

INTERVIEWER: Thank you, Raj. Very helpful.

[END OF TRANSCRIPT]`,
  },
  {
    engagement_id: "call_seed_2",
    expert_name: "Diane Kowalski",
    expert_company: "Beckhoff Automation",
    expert_type: "competitor",
    engagement_type: "call",
    uploaded_at: "2025-11-15T16:00:00Z",
    text: `CALL TRANSCRIPT -- Diane Kowalski, Former SVP Sales, Beckhoff Automation North America
Date: 15 November 2025 | Duration: 60 min | Network: AlphaSights

INTERVIEWER: Diane, thank you for your time. We'd love to hear your perspective on Meridian Controls' competitive positioning relative to Beckhoff.

DIANE KOWALSKI: Happy to share. I left Beckhoff about ten months ago so my perspective is reasonably current. Meridian is interesting because they're attacking a gap that the larger players have been slow to fill -- the mid-market industrial automation space where customers want sophisticated control but don't want the complexity and cost of a full Siemens or Rockwell stack.

INTERVIEWER: Where do you see Meridian's key strengths versus Beckhoff specifically?

DIANE KOWALSKI: Software, full stop. Their control algorithms and especially the predictive maintenance analytics layer are genuinely ahead of what Beckhoff offers natively. Beckhoff's strength has always been hardware -- the EtherCAT ecosystem, the IPC platform. But on the software and analytics side, Meridian has a legitimate two-year head start. Their engineering team clearly comes from a software-first background.

INTERVIEWER: And their weaknesses?

DIANE KOWALSKI: Scale and service infrastructure. Beckhoff has offices and field engineers in 40 countries. Meridian has -- what, maybe 120 people total? When a customer's line goes down at 2 AM on a Saturday, Beckhoff can have someone on-site within hours in most major markets. Meridian relies heavily on remote support and a thin partner network. For mission-critical processes, that's a real concern.

The other weakness is their hardware supply chain. They're still reliant on a small number of contract manufacturers for their IO modules. I've heard from contacts that lead times have stretched to 6-8 weeks on certain cards. Beckhoff manufactures in-house in Verl and has much tighter control.

INTERVIEWER: How seriously does Beckhoff view Meridian as a competitive threat?

DIANE KOWALSKI: More seriously than they'd publicly admit. When I was there, Meridian came up in every quarterly competitive review. They'd won about a dozen accounts that Beckhoff had expected to close -- mostly in food and beverage and packaging. The internal estimate when I left was that Meridian had taken roughly EUR 8-10 million in annual revenue that would have otherwise gone to Beckhoff in North America.

INTERVIEWER: Do you expect Meridian to move upmarket?

DIANE KOWALSKI: They'll try, but that's where it gets much harder. Enterprise-scale industrial automation requires a level of system integration capability, global support, and regulatory compliance that takes a decade to build. My bet is they'll dominate the mid-market and become an attractive acquisition target for one of the majors within 3-5 years.

INTERVIEWER: Very insightful, Diane. Thank you.

[END OF TRANSCRIPT]`,
  },
  {
    engagement_id: "call_seed_7",
    expert_name: "James Achebe",
    expert_company: "FreshPath Foods",
    expert_type: "customer",
    engagement_type: "call",
    uploaded_at: "2025-11-20T13:00:00Z",
    text: `CALL TRANSCRIPT -- James Achebe, Global Automation Manager, FreshPath Foods
Date: 20 November 2025 | Duration: 45 min | Network: GLG

INTERVIEWER: James, thank you for making time. Could you describe FreshPath's experience evaluating Meridian Controls alongside Rockwell?

JAMES ACHEBE: Of course. FreshPath operates 22 food processing facilities globally and we've been on Rockwell ControlLogix for about fifteen years. When the time came to upgrade our batch control systems -- starting with four pilot sites -- we ran a formal evaluation that included Rockwell, Siemens, and Meridian.

INTERVIEWER: What set Meridian apart in the evaluation?

JAMES ACHEBE: Two things. First, their batch recipe management module is genuinely best-in-class for food and beverage. It handles complex multi-stage processes with variable ingredient inputs far more elegantly than what Rockwell offers out of the box. Our process engineers could configure new product recipes in about 40% less time during the pilot.

Second, their pricing model. Rockwell wanted us to commit to a global enterprise agreement -- roughly $2.4 million annually. Meridian's per-site licensing for the same four pilot facilities came in at about $380,000 per year. Even accounting for Rockwell's broader feature set, the value proposition was compelling for a phased rollout.

INTERVIEWER: Were there concerns about switching from an established vendor like Rockwell?

JAMES ACHEBE: Absolutely. Our reliability engineering team was initially sceptical. Rockwell has a 15-year track record with us and we know their failure modes intimately. Meridian was an unknown. We negotiated an extended proof-of-concept at our Charlotte facility -- 90 days of parallel running alongside the existing Rockwell system.

The results were encouraging. System availability was 99.7% versus Rockwell's 99.8% over the same period, which is well within our tolerance. And the Meridian system flagged two equipment anomalies that the Rockwell predictive module missed entirely.

INTERVIEWER: How is the broader rollout progressing?

JAMES ACHEBE: We've approved Meridian for the four pilot sites and we're six months in. Two sites are fully cut over, two are in parallel testing. The board has approved conditional expansion to eight additional sites pending the 12-month review. If the pilot sites maintain current performance metrics, I expect we'll move to a broader global evaluation in 2026.

INTERVIEWER: What would need to change for FreshPath to move entirely away from Rockwell?

JAMES ACHEBE: Meridian needs to demonstrate three things: proven performance in high-speed continuous process environments (not just batch), a credible global support presence -- especially in our Southeast Asian facilities -- and a migration toolset that can port our existing Rockwell ladder logic without a full rewrite. If they can tick those boxes in the next 18-24 months, a full transition becomes thinkable.

INTERVIEWER: Excellent context, James. Thank you.

[END OF TRANSCRIPT]`,
  },
]

/* ------------------------------------------------------------------ */
/*  localStorage persistence                                           */
/* ------------------------------------------------------------------ */

const LS_KEY = "helmsman_transcripts"
const TRANSCRIPTS_SEEDED = "helmsman_transcripts_seeded_v1"

function ensureTranscriptsSeeded(): void {
  if (typeof window === "undefined") return
  if (localStorage.getItem(TRANSCRIPTS_SEEDED)) return
  // Merge seed transcripts into any existing data without overwriting
  const existing = (() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? (JSON.parse(raw) as Transcript[]) : []
    } catch {
      return []
    }
  })()
  const existingIds = new Set(existing.map((t) => t.engagement_id))
  const toAdd = SEED_TRANSCRIPTS.filter((t) => !existingIds.has(t.engagement_id))
  if (toAdd.length > 0) {
    localStorage.setItem(LS_KEY, JSON.stringify([...existing, ...toAdd]))
  }
  localStorage.setItem(TRANSCRIPTS_SEEDED, "1")
}

function readAll(): Transcript[] {
  if (typeof window === "undefined") return []
  ensureTranscriptsSeeded()
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Transcript[]) : []
  } catch {
    return []
  }
}

function writeAll(transcripts: Transcript[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_KEY, JSON.stringify(transcripts))
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/** Get a transcript by engagement ID, or null if none exists. */
export function getTranscript(engagementId: string): Transcript | null {
  return readAll().find((t) => t.engagement_id === engagementId) ?? null
}

/** Get all transcripts (optionally filtered). */
export function getTranscripts(filters?: {
  expert_name?: string
  expert_type?: string
  engagement_type?: "call" | "survey"
}): Transcript[] {
  let list = readAll()
  if (filters?.expert_name) {
    const q = filters.expert_name.toLowerCase()
    list = list.filter(
      (t) =>
        t.expert_name.toLowerCase().includes(q) ||
        t.expert_company.toLowerCase().includes(q),
    )
  }
  if (filters?.expert_type) {
    list = list.filter((t) => t.expert_type === filters.expert_type)
  }
  if (filters?.engagement_type) {
    list = list.filter((t) => t.engagement_type === filters.engagement_type)
  }
  return list
}

/** Save or update a transcript for a given engagement. */
export function saveTranscript(transcript: Transcript): void {
  const all = readAll()
  const idx = all.findIndex((t) => t.engagement_id === transcript.engagement_id)
  if (idx >= 0) {
    all[idx] = transcript
  } else {
    all.push(transcript)
  }
  writeAll(all)
}

/** Delete a transcript by engagement ID. */
export function deleteTranscript(engagementId: string): void {
  writeAll(readAll().filter((t) => t.engagement_id !== engagementId))
}

/** Check if a transcript exists for a given engagement ID. */
export function hasTranscript(engagementId: string): boolean {
  return readAll().some((t) => t.engagement_id === engagementId)
}

/** Get a map of engagement_id -> true for all engagements that have transcripts. */
export function getTranscriptMap(): Set<string> {
  return new Set(readAll().map((t) => t.engagement_id))
}
