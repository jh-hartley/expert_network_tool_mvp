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

  /* ---------- NPS fields (populated for survey transcripts) ---------- */
  /** The product/company being rated (e.g. "Meridian Controls") */
  product?: string | null
  /** NPS score 0-10 */
  nps_score?: number | null
  /** Short reasons for the score */
  key_reasons?: string[] | null
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
  /* ---- AI Survey Transcripts (NPS) -------------------------------- */
  /* NOTE: In a full implementation these NPS scores and reasons would  */
  /* be extracted automatically by an LLM when the transcript is        */
  /* uploaded. They are hardcoded here for the demo.                    */

  /* -- Meridian Controls NPS surveys (from customers) -- */
  {
    engagement_id: "surv_nps_mc_1",
    expert_name: "Raj Patel",
    expert_company: "Solaris Packaging",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-10T11:00:00Z",
    product: "Meridian Controls",
    nps_score: 9,
    key_reasons: ["30% lower TCO than Rockwell", "Excellent API documentation", "Predictive maintenance cut downtime from 12% to 7.5%"],
    text: `AI SURVEY RESPONSE -- Raj Patel, Solaris Packaging
Product evaluated: Meridian Controls
NPS Score: 9 (Promoter)

Q: How likely are you to recommend Meridian Controls to a peer? (0-10)
A: 9

Q: What are the main reasons for your score?
A: Three things stand out. The total cost of ownership is roughly 30% lower than Rockwell over five years. Their API documentation is vastly better than what we experienced with Honeywell or Rockwell. And the predictive maintenance module has already cut our unplanned downtime from 12% to about 7.5%.

Q: What could they improve?
A: Lead times on IO modules -- we had a six-week wait on analog input cards which held up commissioning. That needs to be addressed for them to compete at scale.`,
  },
  {
    engagement_id: "surv_nps_mc_2",
    expert_name: "Marcus Oyelaran",
    expert_company: "Hartwell Brewing Co.",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-11T10:30:00Z",
    product: "Meridian Controls",
    nps_score: 9,
    key_reasons: ["Field engineers understand washdown requirements", "PLC programming environment greatly improved", "Partner-like support model"],
    text: `AI SURVEY RESPONSE -- Marcus Oyelaran, Hartwell Brewing Co.
Product evaluated: Meridian Controls
NPS Score: 9 (Promoter)

Q: How likely are you to recommend Meridian Controls to a peer? (0-10)
A: 9

Q: What are the main reasons for your score?
A: Their field engineers actually understand our washdown requirements without needing to be educated. The PLC programming environment has improved significantly in the last two releases. They act like a partner, not just a vendor.

Q: What could they improve?
A: Broader availability of spare parts regionally. We sometimes have to wait for shipments from their central warehouse.`,
  },
  {
    engagement_id: "surv_nps_mc_3",
    expert_name: "James Achebe",
    expert_company: "FreshPath Foods",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-15T14:00:00Z",
    product: "Meridian Controls",
    nps_score: 8,
    key_reasons: ["Best-in-class batch recipe management", "40% faster recipe configuration", "Compelling per-site licensing model"],
    text: `AI SURVEY RESPONSE -- James Achebe, FreshPath Foods
Product evaluated: Meridian Controls
NPS Score: 8 (Promoter)

Q: How likely are you to recommend Meridian Controls to a peer? (0-10)
A: 8

Q: What are the main reasons for your score?
A: Their batch recipe management module is genuinely best-in-class for food and beverage. Our process engineers configure new recipes in about 40% less time. The per-site licensing at $380K/year vs Rockwell's $2.4M enterprise agreement is compelling.

Q: What could they improve?
A: They need to prove performance in high-speed continuous process environments, not just batch. And their global support -- especially in Southeast Asia -- needs work.`,
  },
  {
    engagement_id: "surv_nps_mc_4",
    expert_name: "Roberto Garza",
    expert_company: "Cascadia Paper Products",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-16T09:00:00Z",
    product: "Meridian Controls",
    nps_score: 8,
    key_reasons: ["Sub-2-hour tech support response", "6-week vs 14-week lead time advantage", "Speed matters when downtime costs $50K/hour"],
    text: `AI SURVEY RESPONSE -- Roberto Garza, Cascadia Paper Products
Product evaluated: Meridian Controls
NPS Score: 8 (Promoter)

Q: How likely are you to recommend Meridian Controls to a peer? (0-10)
A: 8

Q: What are the main reasons for your score?
A: Tech support response averages under 2 hours. When we needed a packaging line retrofit, their lead time was 6 weeks vs 14 weeks from Rockwell. In our industry, downtime costs $50K per hour so speed matters enormously.

Q: What could they improve?
A: I worry about what happens if they get acquired. The hands-on support model is why we chose them.`,
  },
  {
    engagement_id: "surv_nps_mc_5",
    expert_name: "Chen Wei-Lin",
    expert_company: "TerraForge Metals",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-17T11:00:00Z",
    product: "Meridian Controls",
    nps_score: 7,
    key_reasons: ["Impressive high-temp I/O modules", "Competitive pricing", "Need more MTBF reliability data"],
    text: `AI SURVEY RESPONSE -- Chen Wei-Lin, TerraForge Metals
Product evaluated: Meridian Controls
NPS Score: 7 (Passive)

Q: How likely are you to recommend Meridian Controls to a peer? (0-10)
A: 7

Q: What are the main reasons for your score?
A: Their newer high-temp rated I/O modules impressed our maintenance team and pricing is competitive. However, we need at least 3 years of MTBF data before committing at scale. They came very close to winning our last project.

Q: What could they improve?
A: Publish more reliability data for harsh environments. Heavy industry customers need proof points.`,
  },
  {
    engagement_id: "surv_nps_mc_6",
    expert_name: "Angela Moretti",
    expert_company: "GreenValley Chemicals",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-18T15:00:00Z",
    product: "Meridian Controls",
    nps_score: 6,
    key_reasons: ["Adequate process control", "Limited chemical industry references", "Prefer established DCS vendors for safety-critical"],
    text: `AI SURVEY RESPONSE -- Angela Moretti, GreenValley Chemicals
Product evaluated: Meridian Controls
NPS Score: 6 (Passive)

Q: How likely are you to recommend Meridian Controls to a peer? (0-10)
A: 6

Q: What are the main reasons for your score?
A: Their process control is adequate but for safety-critical chemical operations we still prefer established DCS vendors. Limited chemical industry references make it hard to justify internally.

Q: What could they improve?
A: SIL-rated safety modules and more chemical process industry case studies.`,
  },

  /* -- Beckhoff NPS surveys (from competitor customers) -- */
  {
    engagement_id: "surv_nps_bk_1",
    expert_name: "Raj Patel",
    expert_company: "Solaris Packaging",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-10T12:00:00Z",
    product: "Beckhoff Automation",
    nps_score: 7,
    key_reasons: ["Strong EtherCAT hardware ecosystem", "TwinCAT software is powerful but complex", "Premium pricing"],
    text: `AI SURVEY RESPONSE -- Raj Patel, Solaris Packaging
Product evaluated: Beckhoff Automation
NPS Score: 7 (Passive)

Q: How likely are you to recommend Beckhoff to a peer? (0-10)
A: 7

Q: What are the main reasons for your score?
A: The EtherCAT hardware ecosystem is excellent and the IPC platform is very capable. However, TwinCAT is powerful but has a steep learning curve. Pricing sits at a slight premium.

Q: What could they improve?
A: Simplify the programming environment for mid-market customers who don't have dedicated PLC programmers.`,
  },
  {
    engagement_id: "surv_nps_bk_2",
    expert_name: "James Achebe",
    expert_company: "FreshPath Foods",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-15T15:00:00Z",
    product: "Beckhoff Automation",
    nps_score: 6,
    key_reasons: ["Good high-speed motion control", "Weak food & bev specific features", "Expensive for batch processes"],
    text: `AI SURVEY RESPONSE -- James Achebe, FreshPath Foods
Product evaluated: Beckhoff Automation
NPS Score: 6 (Passive)

Q: How likely are you to recommend Beckhoff to a peer? (0-10)
A: 6

Q: What are the main reasons for your score?
A: Great for high-speed motion control but lacks food & beverage-specific batch management features. Expensive for what you get in a batch processing environment.

Q: What could they improve?
A: Industry-specific recipe management tools and better washdown-rated enclosures.`,
  },
  {
    engagement_id: "surv_nps_bk_3",
    expert_name: "Chen Wei-Lin",
    expert_company: "TerraForge Metals",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-17T12:00:00Z",
    product: "Beckhoff Automation",
    nps_score: 7,
    key_reasons: ["In-house manufacturing ensures supply", "Good harsh environment options", "Limited local field support"],
    text: `AI SURVEY RESPONSE -- Chen Wei-Lin, TerraForge Metals
Product evaluated: Beckhoff Automation
NPS Score: 7 (Passive)

Q: How likely are you to recommend Beckhoff to a peer? (0-10)
A: 7

Q: What are the main reasons for your score?
A: In-house manufacturing in Verl gives them tight supply chain control. They have decent options for harsh environments. But local field support is thinner than Rockwell's in our region.

Q: What could they improve?
A: Expand field engineering presence in the US Southeast and Midwest.`,
  },
  {
    engagement_id: "surv_nps_bk_4",
    expert_name: "Roberto Garza",
    expert_company: "Cascadia Paper Products",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-16T10:00:00Z",
    product: "Beckhoff Automation",
    nps_score: 5,
    key_reasons: ["Considered but not selected", "Lead times acceptable but not best", "Programming model too complex for our team"],
    text: `AI SURVEY RESPONSE -- Roberto Garza, Cascadia Paper Products
Product evaluated: Beckhoff Automation
NPS Score: 5 (Detractor)

Q: How likely are you to recommend Beckhoff to a peer? (0-10)
A: 5

Q: What are the main reasons for your score?
A: We evaluated them but the programming model was too complex for our maintenance team. Lead times were acceptable but Meridian was significantly faster. Not a bad product, just not the right fit for us.

Q: What could they improve?
A: A simplified programming tier for maintenance technicians who need to make basic changes without learning TwinCAT.`,
  },

  /* -- Rockwell Automation NPS surveys -- */
  {
    engagement_id: "surv_nps_rw_1",
    expert_name: "Raj Patel",
    expert_company: "Solaris Packaging",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-10T13:00:00Z",
    product: "Rockwell Automation",
    nps_score: 5,
    key_reasons: ["Reliable but expensive", "Locked-in ecosystem", "Costs climbing year on year"],
    text: `AI SURVEY RESPONSE -- Raj Patel, Solaris Packaging
Product evaluated: Rockwell Automation
NPS Score: 5 (Detractor)

Q: How likely are you to recommend Rockwell to a peer? (0-10)
A: 5

Q: What are the main reasons for your score?
A: Reliable products but the costs keep climbing. The ecosystem feels locked-in and proprietary. We evaluated alternatives specifically because Rockwell's five-year TCO was 30% higher.

Q: What could they improve?
A: More open standards support and competitive pricing for mid-market customers.`,
  },
  {
    engagement_id: "surv_nps_rw_2",
    expert_name: "James Achebe",
    expert_company: "FreshPath Foods",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-15T16:00:00Z",
    product: "Rockwell Automation",
    nps_score: 6,
    key_reasons: ["15-year track record", "Known failure modes", "Global enterprise agreement is expensive"],
    text: `AI SURVEY RESPONSE -- James Achebe, FreshPath Foods
Product evaluated: Rockwell Automation
NPS Score: 6 (Passive)

Q: How likely are you to recommend Rockwell to a peer? (0-10)
A: 6

Q: What are the main reasons for your score?
A: We have a 15-year track record with Rockwell and know their failure modes intimately. Reliability is at 99.8%. But the global enterprise agreement at $2.4M annually is hard to justify when alternatives exist at a fraction of the cost.

Q: What could they improve?
A: Flexible licensing models for phased rollouts instead of all-or-nothing enterprise agreements.`,
  },
  {
    engagement_id: "surv_nps_rw_3",
    expert_name: "Chen Wei-Lin",
    expert_company: "TerraForge Metals",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-17T13:00:00Z",
    product: "Rockwell Automation",
    nps_score: 7,
    key_reasons: ["Proven in harsh environments", "Extensive MTBF data", "Expensive but justified for critical processes"],
    text: `AI SURVEY RESPONSE -- Chen Wei-Lin, TerraForge Metals
Product evaluated: Rockwell Automation
NPS Score: 7 (Passive)

Q: How likely are you to recommend Rockwell to a peer? (0-10)
A: 7

Q: What are the main reasons for your score?
A: Proven track record in harsh, high-temperature environments with extensive MTBF data. Expensive but justified for safety-critical processes. Won our last project on installed base compatibility.

Q: What could they improve?
A: More competitive pricing for smaller projects and better integration support for mixed-vendor environments.`,
  },
  {
    engagement_id: "surv_nps_rw_4",
    expert_name: "Roberto Garza",
    expert_company: "Cascadia Paper Products",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-16T11:00:00Z",
    product: "Rockwell Automation",
    nps_score: 4,
    key_reasons: ["Great products but slow support", "14-week lead times unacceptable", "Downtime costs $50K/hour"],
    text: `AI SURVEY RESPONSE -- Roberto Garza, Cascadia Paper Products
Product evaluated: Rockwell Automation
NPS Score: 4 (Detractor)

Q: How likely are you to recommend Rockwell to a peer? (0-10)
A: 4

Q: What are the main reasons for your score?
A: Great products but support is slow -- I'd rate them a 6 on support vs Meridian's 8. The 14-week lead time on our last retrofit was unacceptable. When downtime costs $50K per hour, speed matters more than brand name.

Q: What could they improve?
A: Dramatically improve lead times and support response. Match the service level of mid-market competitors.`,
  },

  /* -- Omron NPS surveys -- */
  {
    engagement_id: "surv_nps_om_1",
    expert_name: "Raj Patel",
    expert_company: "Solaris Packaging",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-10T14:00:00Z",
    product: "Omron Industrial",
    nps_score: 6,
    key_reasons: ["Good vision and robotics integration", "Weaker PLC offering vs specialised vendors", "Competitive on price"],
    text: `AI SURVEY RESPONSE -- Raj Patel, Solaris Packaging
Product evaluated: Omron Industrial
NPS Score: 6 (Passive)

Q: How likely are you to recommend Omron to a peer? (0-10)
A: 6

Q: What are the main reasons for your score?
A: Strong on vision systems and robotics integration. But their standalone PLC offering is weaker than specialised vendors like Meridian or Beckhoff. Competitive on price though.

Q: What could they improve?
A: A more capable standalone PLC platform without requiring the full Omron robotics stack.`,
  },
  {
    engagement_id: "surv_nps_om_2",
    expert_name: "James Achebe",
    expert_company: "FreshPath Foods",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-15T17:00:00Z",
    product: "Omron Industrial",
    nps_score: 5,
    key_reasons: ["Not strong in food & bev", "Better suited for automotive", "Limited batch processing features"],
    text: `AI SURVEY RESPONSE -- James Achebe, FreshPath Foods
Product evaluated: Omron Industrial
NPS Score: 5 (Detractor)

Q: How likely are you to recommend Omron to a peer? (0-10)
A: 5

Q: What are the main reasons for your score?
A: Omron is better suited for automotive and electronics than food & beverage. Limited batch processing features and their local support in food manufacturing is thin.

Q: What could they improve?
A: Invest in food & beverage-specific solutions and batch recipe management.`,
  },
  {
    engagement_id: "surv_nps_om_3",
    expert_name: "Yuki Tanaka",
    expert_company: "Nippon Precision Components",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-17T09:00:00Z",
    product: "Omron Industrial",
    nps_score: 8,
    key_reasons: ["Excellent for automotive precision", "Strong Japan-NA support network", "Tight robotics-PLC integration"],
    text: `AI SURVEY RESPONSE -- Yuki Tanaka, Nippon Precision Components
Product evaluated: Omron Industrial
NPS Score: 8 (Promoter)

Q: How likely are you to recommend Omron to a peer? (0-10)
A: 8

Q: What are the main reasons for your score?
A: Excellent for automotive precision manufacturing. Their Japan-NA support network is seamless and the robotics-PLC integration is the tightest in the industry.

Q: What could they improve?
A: Broader industry coverage beyond automotive. Some of our non-automotive lines could benefit from their technology.`,
  },
  {
    engagement_id: "surv_nps_om_4",
    expert_name: "Priya Chakraborty",
    expert_company: "Atlas Cement Corp",
    expert_type: "customer",
    engagement_type: "survey",
    uploaded_at: "2025-11-18T08:00:00Z",
    product: "Omron Industrial",
    nps_score: 4,
    key_reasons: ["Poor fit for heavy industry", "Limited harsh environment products", "Vision systems not relevant for cement"],
    text: `AI SURVEY RESPONSE -- Priya Chakraborty, Atlas Cement Corp
Product evaluated: Omron Industrial
NPS Score: 4 (Detractor)

Q: How likely are you to recommend Omron to a peer? (0-10)
A: 4

Q: What are the main reasons for your score?
A: Poor fit for heavy industry. Limited harsh environment products and their strength in vision systems isn't particularly relevant for cement manufacturing.

Q: What could they improve?
A: Ruggedised product lines for heavy industry and process control applications.`,
  },
]

/* ------------------------------------------------------------------ */
/*  localStorage persistence                                           */
/* ------------------------------------------------------------------ */

const LS_KEY = "helmsman_transcripts"
const TRANSCRIPTS_SEEDED = "helmsman_transcripts_seeded_v2"

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

/* ------------------------------------------------------------------ */
/*  NPS computation from transcripts                                   */
/*                                                                     */
/*  NPS = (% promoters - % detractors) * 100                           */
/*  Promoter: 9-10, Passive: 7-8, Detractor: 0-6                      */
/* ------------------------------------------------------------------ */

export interface NPSResult {
  product: string
  nps: number
  responses: number
  promoters: number
  passives: number
  detractors: number
}

/** Compute NPS scores grouped by product from all transcripts with nps_score. */
export function computeNPSFromTranscripts(transcripts?: Transcript[]): NPSResult[] {
  const list = transcripts ?? readAll()
  const byProduct = new Map<string, number[]>()

  for (const t of list) {
    if (t.nps_score != null && t.product) {
      const scores = byProduct.get(t.product) ?? []
      scores.push(t.nps_score)
      byProduct.set(t.product, scores)
    }
  }

  const results: NPSResult[] = []
  for (const [product, scores] of byProduct) {
    const promoters = scores.filter((s) => s >= 9).length
    const detractors = scores.filter((s) => s <= 6).length
    const passives = scores.length - promoters - detractors
    const nps = Math.round(((promoters - detractors) / scores.length) * 100)
    results.push({ product, nps, responses: scores.length, promoters, passives, detractors })
  }

  // Sort by NPS descending
  results.sort((a, b) => b.nps - a.nps)
  return results
}

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
