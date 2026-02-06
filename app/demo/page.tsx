"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Upload,
  FileText,
  Mail,
  Table2,
  Copy,
  Check,
  Download,
  ArrowRight,
  AlertCircle,
  Users,
  Phone,
  ShieldCheck,
  Brain,
  Search as SearchIcon,
  FileBarChart,
  Building2,
} from "lucide-react"
import { Construction } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Demo scenario                                                      */
/*                                                                     */
/*  DD Target: "Meridian Controls" -- a mid-market industrial          */
/*  automation company. The PE buyer is evaluating the acquisition      */
/*  under codename "Project Atlas". Networks do NOT know the target.   */
/*                                                                     */
/*  Expert types:                                                      */
/*    - Customer: companies that purchase automation / controls         */
/*    - Competitor: companies that compete with Meridian Controls       */
/*                                                                     */
/*  Meridian Controls is among the competitors listed, but the         */
/*  networks have not been told it is the target.                       */
/*                                                                     */
/*  Screening questions (embedded in each file):                       */
/*    Customers -- Q1 Which vendors have you evaluated in the last     */
/*      24 months? Q2 What drove your most recent vendor selection?    */
/*      Q3 How would you rate your satisfaction with your current      */
/*      vendor (1-10)? Q4 What would trigger you to switch providers?  */
/*    Competitors -- Q1 How do you view the competitive landscape in   */
/*      industrial controls? Q2 Which competitors are you losing       */
/*      deals to most often? Q3 How does your pricing compare to      */
/*      mid-market players? Q4 Where are you investing in R&D over    */
/*      the next 2 years?                                              */
/*                                                                     */
/*  Overlapping experts across files:                                  */
/*    - Raj Patel appears in File 1 (raw text) and File 3 (CSV)       */
/*    - Laura Fischer appears in File 2 (email) and File 3 (CSV)      */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Sample data: Raw text (AlphaSights email body)                     */
/* ------------------------------------------------------------------ */

const SAMPLE_RAW_TEXT = `Expert Network Recommendations - Project Atlas

From: AlphaSights Research Team
Date: 15 January 2025
Project: Commercial due diligence - industrial controls & automation

Below are 5 expert recommendations for your consideration. We have conducted initial screening calls and included responses to your standard questions below each profile.

1. Raj Patel
   Type: Customer
   Current Role: VP of Plant Engineering, Solaris Packaging (CPG manufacturer)
   Background: 16 years in plant operations. Manages automation procurement across 12 North American facilities. Annual controls spend ~$8M. Previously at Unilever manufacturing ops.
   Relevant Expertise: Multi-vendor evaluation processes, total cost of ownership analysis, mid-market vs enterprise vendor trade-offs
   Compliance: No known conflicts. Never employed by any automation vendor.
   Rate: $650/hr | Network: AlphaSights | ID: AS-2025-00201

   Screening Responses (Customer):
   Q1 - Which vendors have you evaluated in the last 24 months?
   "We looked at Meridian Controls, Beckhoff, and Omron for our latest line expansion. Also got proposals from Rockwell but they were out of budget."

   Q2 - What drove your most recent vendor selection?
   "Ultimately it came down to integration support and total cost. The mid-market players were much more hands-on during commissioning."

   Q3 - How would you rate your satisfaction with your current vendor (1-10)?
   "I'd give our primary vendor an 8. Good product, responsive support, though documentation could be better."

   Q4 - What would trigger you to switch providers?
   "If lead times slipped consistently or if they couldn't support our move to more networked architectures. We need Ethernet/IP native, not bolted on."

2. Diane Kowalski
   Type: Competitor
   Current Role: Former SVP Sales, Beckhoff Automation North America (departed Aug 2024)
   Background: 19 years in industrial automation sales. Built Beckhoff's NA business from $40M to $180M revenue. Previously at B&R Automation (now ABB) and Bosch Rexroth.
   Relevant Expertise: PC-based control market dynamics, competitive win/loss patterns, channel strategy for mid-market automation
   Compliance: Non-compete expired. No current advisory or board roles.
   Rate: $950/hr | Network: AlphaSights | ID: AS-2025-00202

   Screening Responses (Competitor):
   Q1 - How do you view the competitive landscape in industrial controls?
   "The mid-market is getting crowded. You have Beckhoff, Meridian Controls, WAGO, and Omron all fighting for the same $2-10M plant budgets. Rockwell and Siemens own the top end."

   Q2 - Which competitors are you losing deals to most often?
   "When I was at Beckhoff, we lost most often to Meridian Controls in food & beverage and to Omron in automotive Tier 2. Meridian's local support model is very effective."

   Q3 - How does your pricing compare to mid-market players?
   "Beckhoff is slightly premium but justifiable on total cost. Meridian is maybe 10-15% cheaper on hardware but closes the gap on service contracts."

   Q4 - Where are you investing in R&D over the next 2 years?
   "Beckhoff is all-in on XTS linear transport and TwinCAT cloud engineering. The industry is moving toward software-defined control."

3. Marcus Oyelaran
   Type: Customer
   Current Role: Director of Manufacturing Technology, Hartwell Brewing Co.
   Background: 11 years in food & beverage manufacturing. Oversees automation strategy for 4 breweries. Manages $3.5M annual controls budget.
   Relevant Expertise: F&B-specific automation requirements, hygiene/washdown considerations, vendor support expectations in continuous production
   Compliance: Clear. No vendor relationships beyond standard procurement.
   Rate: $550/hr | Network: AlphaSights | ID: AS-2025-00203

   Screening Responses (Customer):
   Q1 - Which vendors have you evaluated in the last 24 months?
   "Meridian Controls and Rockwell. We also looked at Siemens but their local distributor coverage was thin in our regions."

   Q2 - What drove your most recent vendor selection?
   "Meridian won our latest project because their field engineers actually understood our washdown requirements without us having to educate them."

   Q3 - How would you rate your satisfaction with your current vendor (1-10)?
   "Meridian gets a 9 from us. Very responsive, and their PLC programming environment has gotten much better in the last two releases."

   Q4 - What would trigger you to switch providers?
   "Acquisition by a larger company that changed the support model. That hands-on approach is why we chose them."

4. Sandra Voss
   Type: Competitor
   Current Role: Head of Strategy, Omron Industrial Automation, Americas
   Background: 13 years at Omron. Leads corporate strategy and M&A evaluation for the Americas region. Previously at McKinsey (industrials practice).
   Relevant Expertise: Competitive intelligence on mid-market controls, M&A landscape, Japanese vs Western automation vendor strategies
   Compliance: Currently employed at Omron. Requires pre-screening for confidentiality.
   Rate: $1,100/hr | Network: AlphaSights | ID: AS-2025-00204

   Screening Responses (Competitor):
   Q1 - How do you view the competitive landscape in industrial controls?
   "The mid-market is fragmenting. Meridian Controls has built a strong regional presence in North America, while Beckhoff is pushing hard from Europe. Omron differentiates on vision and robotics integration."

   Q2 - Which competitors are you losing deals to most often?
   "In discrete manufacturing we lose to Beckhoff on innovation and to Meridian Controls on price-for-value in the $1-5M project range."

   Q3 - How does your pricing compare to mid-market players?
   "We are competitive but the Japanese yen fluctuation creates margin pressure. Meridian and Beckhoff both have domestic manufacturing advantages."

   Q4 - Where are you investing in R&D over the next 2 years?
   "AI-enabled quality inspection and tighter robotics-PLC integration. We think the control layer and the robot layer merge within 5 years."

5. Chen Wei-Lin
   Type: Customer
   Current Role: Chief Engineer, TerraForge Metals (specialty metals fabrication)
   Background: 14 years in metals and heavy manufacturing. Manages automation for high-temperature and hazardous environments. Previously at Nucor Steel.
   Relevant Expertise: Harsh-environment automation requirements, vendor reliability benchmarking, maintenance cost comparisons
   Compliance: No conflicts. Pure end-user perspective.
   Rate: $600/hr | Network: AlphaSights | ID: AS-2025-00205

   Screening Responses (Customer):
   Q1 - Which vendors have you evaluated in the last 24 months?
   "Rockwell, Siemens, and Meridian Controls. For our environment we need proven high-temp rated hardware so the field narrows quickly."

   Q2 - What drove your most recent vendor selection?
   "Rockwell won on installed base compatibility, but Meridian came very close. Their newer high-temp rated I/O modules impressed our maintenance team."

   Q3 - How would you rate your satisfaction with your current vendor (1-10)?
   "Rockwell is a 7 -- solid but expensive. I'd rate Meridian an 8 on the project we trialled them on."

   Q4 - What would trigger you to switch providers?
   "Significant cost savings with equivalent reliability data. We need at least 3 years of MTBF data before we commit to a new vendor at scale."

Please let us know which experts you would like to schedule, and we will coordinate availability.

Best regards,
AlphaSights Research Team`

/* ------------------------------------------------------------------ */
/*  Sample data: Email (.eml format -- GLG)                            */
/* ------------------------------------------------------------------ */

const SAMPLE_EML = `From: research-team@glg.com
To: project-team@deal.com
Subject: GLG Expert Recommendations - Project Atlas (Industrial Controls)
Date: Thu, 17 Jan 2025 10:15:00 +0000
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Hi team,

Please find below our expert recommendations for Project Atlas. Each profile includes responses to your screening questions.

---

EXPERT 1
Name: Laura Fischer
Type: Competitor
Title: Former COO, Meridian Controls (departed November 2024)
Geography: Milwaukee, WI
Background: 21 years in industrial automation. Most recently COO at Meridian Controls where she oversaw manufacturing, supply chain, and field operations for 7 years. Previously held senior operations roles at Rockwell Automation and Parker Hannifin.
Why relevant: Direct operational knowledge of the target's cost structure, manufacturing footprint, supply chain, and go-to-market model.
Compliance note: Left Meridian Controls 2+ months ago. No active non-compete per Wisconsin law. Will need CID clearance given recency.
Hourly rate: USD 1,200
GLG Member ID: GLG-US-90102

Screening Responses (Competitor):
Q1 - How do you view the competitive landscape in industrial controls?
"Meridian occupies a strong niche in the mid-market. The company competes primarily with Beckhoff, Omron, and WAGO, while trying to pull customers down from Rockwell. The value proposition is local service plus competitive pricing."

Q2 - Which competitors are you losing deals to most often?
"While I was there, Beckhoff was the toughest competitor on technology. Omron competed hard on price in automotive. Rockwell was difficult to displace in brownfield sites."

Q3 - How does your pricing compare to mid-market players?
"Meridian typically prices 10-20% below Rockwell and roughly in line with Beckhoff, but margins are protected by the service contract attach rate which runs around 65%."

Q4 - Where are you investing in R&D over the next 2 years?
"When I left, the roadmap priorities were Ethernet-APL I/O for process industries, a cloud-based engineering toolkit, and edge analytics modules. The R&D budget was growing about 15% YoY."

---

EXPERT 2
Name: James Achebe
Type: Customer
Title: Global Automation Manager, FreshPath Foods (multinational food manufacturer)
Geography: Toronto, Canada
Background: 18 years in food manufacturing. Manages global automation standards and vendor relationships across 22 plants in North America and Europe. $15M annual automation spend.
Why relevant: Large-scale multi-vendor customer with direct procurement experience across Meridian Controls, Rockwell, and Siemens.
Compliance note: No conflicts. End-user only.
Hourly rate: USD 750
GLG Member ID: GLG-CA-88714

Screening Responses (Customer):
Q1 - Which vendors have you evaluated in the last 24 months?
"Rockwell is our global standard but we have been piloting Meridian Controls in 3 plants for secondary lines. We also evaluated Beckhoff for a new greenfield facility in Ontario."

Q2 - What drove your most recent vendor selection?
"For the Meridian pilots, it was 30% cost savings on hardware plus their willingness to provide on-site commissioning support at no extra charge for the first year."

Q3 - How would you rate your satisfaction with your current vendor (1-10)?
"Rockwell is a 7 -- reliable but the cost keeps climbing. Meridian is an 8 so far on the pilots, but it is early days."

Q4 - What would trigger you to switch providers?
"If Meridian can demonstrate consistent performance across all 3 pilot plants over 18 months, we would consider them for our global approved vendor list."

---

EXPERT 3
Name: Tomoko Sato
Type: Competitor
Title: Director of Business Development, WAGO Corporation (Americas)
Geography: Germantown, WI
Background: 10 years at WAGO. Leads BD for industrial automation products across North and South America. Previously at Phoenix Contact in product management.
Compliance note: Currently employed at WAGO. Requires pre-screening.
Hourly rate: USD 900
GLG Member ID: GLG-US-91330

Screening Responses (Competitor):
Q1 - How do you view the competitive landscape in industrial controls?
"The mid-market is the most dynamic part of the controls industry right now. WAGO, Meridian Controls, and Beckhoff are all growing faster than the large incumbents. The customer base is looking for alternatives to Rockwell's pricing."

Q2 - Which competitors are you losing deals to most often?
"Meridian Controls in food & beverage and general manufacturing. Beckhoff in high-performance machine building. We differentiate on open standards and DIN-rail I/O density."

Q3 - How does your pricing compare to mid-market players?
"WAGO is generally in line with Meridian on I/O pricing. They tend to win on the PLC/controller level where they have stronger software."

Q4 - Where are you investing in R&D over the next 2 years?
"Docker-based runtime environments on our controllers, expanded MQTT/OPC-UA connectivity, and compact safety I/O. We see the edge compute layer as key."

---

EXPERT 4
Name: Roberto Garza
Type: Customer
Title: Maintenance & Reliability Director, Cascadia Paper Products
Geography: Portland, OR
Background: 15 years in pulp & paper manufacturing. Responsible for automation reliability across 3 mills. Has evaluated and deployed systems from Rockwell, Meridian Controls, and ABB.
Compliance note: Clear. No vendor advisory roles.
Hourly rate: USD 600
GLG Member ID: GLG-US-92008

Screening Responses (Customer):
Q1 - Which vendors have you evaluated in the last 24 months?
"ABB for our main DCS, Meridian Controls for discrete PLC applications on packaging lines, and Rockwell for some legacy upgrades."

Q2 - What drove your most recent vendor selection?
"Meridian was selected for the packaging line retrofit because their lead time was 6 weeks vs 14 weeks from Rockwell. In our industry, downtime costs $50K/hour so speed matters enormously."

Q3 - How would you rate your satisfaction with your current vendor (1-10)?
"Meridian is a solid 8. Their tech support response time averages under 2 hours. ABB is a 7 on the DCS side. Rockwell is a 6 -- great products but support is slow."

Q4 - What would trigger you to switch providers?
"If Meridian's support model degraded after growth or acquisition, that would be a red flag. We chose them specifically because they act like a partner, not a vendor."

Please confirm which experts you'd like to proceed with and we'll send calendar invitations.

Best,
GLG Research Team`

/* ------------------------------------------------------------------ */
/*  Sample data: CSV (Third Bridge spreadsheet export)                 */
/* ------------------------------------------------------------------ */

const SAMPLE_CSV = `Name,Title,Company,Industry,Network,Compliance,Rate_USD,Tags
Raj Patel,VP of Plant Engineering,Solaris Packaging,Technology,Third Bridge,cleared,650,customer;multi-vendor;CPG;packaging
Laura Fischer,Former COO,Meridian Controls,Technology,Third Bridge,pending,1200,competitor;target-company;operations;supply-chain
Henrik Larsson,VP Manufacturing,Beckhoff Automation,Technology,Third Bridge,cleared,850,competitor;PC-based-control;Europe
Angela Moretti,Plant Manager,GreenValley Chemicals,Technology,Third Bridge,cleared,500,customer;process-industries;chemicals;safety
Nathan Cross,Former VP Product,Meridian Controls,Technology,Third Bridge,pending,950,competitor;target-company;product-roadmap;R&D
Yuki Tanaka,Director of Automation,Nippon Precision Components,Technology,Third Bridge,cleared,700,customer;automotive-tier2;Japan-NA;precision
Derek Otieno,Head of Industrial Strategy,Turck Inc.,Technology,Third Bridge,pending,800,competitor;sensor-IO;fieldbus;connectivity
Priya Chakraborty,Engineering Manager,Atlas Cement Corp,Technology,Third Bridge,cleared,550,customer;heavy-industry;harsh-environment;cement`

/* ------------------------------------------------------------------ */
/*  Pipeline steps for the rest of the guide                           */
/* ------------------------------------------------------------------ */

/* Future steps kept in "Next Steps" section at the bottom -- none currently, all are live or WIP */

/* ------------------------------------------------------------------ */
/*  Sample data: Transcripts (.txt -- customer calls with NPS)         */
/* ------------------------------------------------------------------ */

const SAMPLE_TRANSCRIPT_RAJ = `CALL TRANSCRIPT -- Raj Patel, VP of Plant Engineering, Solaris Packaging
Date: 14 November 2025 | Duration: 60 min | Network: AlphaSights
NPS Score: 8

INTERVIEWER: Thank you for joining, Raj. Could you start by walking us through how Solaris first evaluated Meridian Controls?

RAJ PATEL: Sure. We began our evaluation roughly eighteen months ago when we needed to replace aging Rockwell PLCs across three of our packaging lines. Meridian came onto our radar through an industry conference -- their demo of the real-time adaptive control loop was genuinely impressive compared to what we'd seen from incumbents.

INTERVIEWER: What were the key selection criteria for Solaris?

RAJ PATEL: Three things drove it. First, total cost of ownership -- Meridian's licensing model was roughly 30% lower over a five-year horizon compared to Rockwell and Siemens. Second, ease of integration with our existing SCADA layer. Third, and this was the clincher, their predictive maintenance module. We'd been losing about 12% of uptime annually on unplanned stoppages, and their analytics showed credible paths to cutting that by half.

INTERVIEWER: How has the rollout gone so far?

RAJ PATEL: We're about eight months in and we've completed two of the three lines. I'd say 80% positive. The initial integration was smoother than expected -- their API documentation is vastly better than what we experienced with Honeywell. The main friction point has been lead times on replacement IO modules. We had a six-week wait on a batch of analog input cards which held up Line 2 commissioning.

INTERVIEWER: Would you recommend Meridian to a peer in your position?

RAJ PATEL: With caveats, yes. If your operation is mid-scale -- say 5 to 15 lines -- and you're not locked into a long-term Rockwell enterprise agreement, Meridian is worth serious consideration. For very large plants with 50+ lines, I'd want to see more proof points on their scalability.

[END OF TRANSCRIPT]`

const SAMPLE_TRANSCRIPT_JAMES = `CALL TRANSCRIPT -- James Achebe, Global Automation Manager, FreshPath Foods
Date: 20 November 2025 | Duration: 45 min | Network: GLG
NPS Score: 7

INTERVIEWER: James, could you describe FreshPath's experience evaluating Meridian Controls alongside Rockwell?

JAMES ACHEBE: Of course. FreshPath operates 22 food processing facilities globally and we've been on Rockwell ControlLogix for about fifteen years. When the time came to upgrade our batch control systems we ran a formal evaluation that included Rockwell, Siemens, and Meridian.

INTERVIEWER: What set Meridian apart in the evaluation?

JAMES ACHEBE: Two things. First, their batch recipe management module is best-in-class for food and beverage. Our process engineers could configure new product recipes in about 40% less time during the pilot. Second, their pricing model -- Rockwell wanted roughly $2.4M annually for a global enterprise agreement, Meridian's per-site licensing came in at about $380K for four pilot sites.

INTERVIEWER: Were there concerns about switching from Rockwell?

JAMES ACHEBE: Absolutely. Our reliability engineering team was initially sceptical. We negotiated a 90-day proof-of-concept at our Charlotte facility running in parallel with Rockwell. System availability was 99.7% versus Rockwell's 99.8% -- well within tolerance. The Meridian system also flagged two equipment anomalies that the Rockwell predictive module missed entirely.

INTERVIEWER: How is the broader rollout progressing?

JAMES ACHEBE: We've approved Meridian for four pilot sites, two are fully cut over. The board has approved conditional expansion to eight additional sites pending a 12-month review.

[END OF TRANSCRIPT]`

/* ------------------------------------------------------------------ */
/*  Helper: download a text string as a file                           */
/* ------------------------------------------------------------------ */

function downloadTextFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ------------------------------------------------------------------ */
/*  Component: CopyButton                                              */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy to clipboard
        </>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="pb-6 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Getting Started Guide
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-2xl">
          Walk through a realistic DD scenario using sample data. The case
          involves a PE buyer evaluating <strong className="text-foreground font-medium">Meridian Controls</strong>, a
          mid-market industrial automation company (codename &ldquo;Project Atlas&rdquo;). Follow
          all 8 stages below -- from ingesting unstructured network data through to
          search and reconciliation.
        </p>
      </div>

      {/* Status banner removed -- demo is now comprehensive */}

      {/* ============================================================ */}
      {/*  STEP 1 -- Ingest & Standardise                               */}
      {/* ============================================================ */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
            1
          </span>
          <Upload className="h-4 w-4 text-primary/60" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Ingest Unstructured Data
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Three expert networks (AlphaSights, GLG, Third Bridge) have sent
          recommendations for Project Atlas. Each file contains a mix of
          customer and competitor experts with completed screening responses.
          Two experts (Raj Patel and Laura Fischer) appear across multiple
          files to test deduplication. Try each format below.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* ---- Raw text ---- */}
          <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 bg-muted/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/8 ring-1 ring-primary/15">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Raw Text
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Network email body
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                An AlphaSights email with 5 experts (3 customers, 2 competitors)
                including screening question responses. Copy and paste into the{" "}
                <Link
                  href="/upload"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Upload page
                </Link>
                .
              </p>
              <div className="mt-3 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-3">
                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-48 overflow-y-auto">
                  {SAMPLE_RAW_TEXT.slice(0, 600)}{"..."}
                </pre>
              </div>
              <div className="mt-3">
                <CopyButton text={SAMPLE_RAW_TEXT} />
              </div>
            </div>
          </div>

          {/* ---- Email (.eml) ---- */}
          <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 bg-muted/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/8 ring-1 ring-primary/15">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Email File
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  .eml format
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                A GLG .eml file with 4 experts (2 customers, 2 competitors)
                including a former Meridian Controls executive. Download and
                upload to test email ingestion.
              </p>
              <div className="mt-3 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-3">
                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-48 overflow-y-auto">
                  {SAMPLE_EML.slice(0, 500)}{"..."}
                </pre>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      SAMPLE_EML,
                      "glg-recommendations-project-atlas.eml",
                      "message/rfc822"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
                >
                  <Download className="h-3 w-3" />
                  Download .eml file
                </button>
              </div>
            </div>
          </div>

          {/* ---- CSV (spreadsheet) ---- */}
          <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 bg-muted/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/8 ring-1 ring-primary/15">
                <Table2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Spreadsheet
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  .csv format
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                A Third Bridge CSV with 8 experts (4 customers, 4 competitors)
                including 2 overlapping with the other files. Download and
                drag onto the{" "}
                <Link
                  href="/upload"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  Upload page
                </Link>
                .
              </p>
              <div className="mt-3 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-3">
                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-48 overflow-y-auto">
                  {SAMPLE_CSV.slice(0, 400)}{"..."}
                </pre>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      SAMPLE_CSV,
                      "third-bridge-project-atlas.csv",
                      "text/csv"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
                >
                  <Download className="h-3 w-3" />
                  Download .csv file
                </button>
                <CopyButton text={SAMPLE_CSV} />
              </div>
            </div>
          </div>
        </div>

        {/* CTA to upload page */}
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Upload className="h-3.5 w-3.5" />
            Go to Upload page
          </Link>
          <p className="text-xs text-muted-foreground">
            Try the CSV first (direct parse), then paste the raw text or upload the .eml.
          </p>
        </div>

        {/* Persistence note */}
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <p className="text-xs leading-relaxed text-sky-800">
            <span className="font-medium">Persistence active.</span> New experts extracted from uploads are
            automatically merged into the Experts table. Duplicates are detected by fuzzy name + company
            matching; if an existing expert appears via a new network, the new price is merged in. Data is
            stored in your browser only.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STEP 2 -- View & Screen Experts                               */}
      {/* ============================================================ */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
            2
          </span>
          <Users className="h-4 w-4 text-primary/60" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            View & Screen Your Experts
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Once you have uploaded and parsed your expert data, navigate to the{" "}
          <Link
            href="/experts"
            className="font-medium text-primary underline underline-offset-2"
          >
            Experts
          </Link>{" "}
          tab to view all ingested profiles in a unified table. From there you
          can review each expert{"'"}s details, screening responses, and
          compliance status, and begin shortlisting candidates for calls.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/experts"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Users className="h-3.5 w-3.5" />
            Go to Experts page
          </Link>
          <p className="text-xs text-muted-foreground">
            Review parsed profiles, filter by type, and start building your shortlist.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STEP 3 -- Track & Shortlist                                   */}
      {/* ============================================================ */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
            3
          </span>
          <Users className="h-4 w-4 text-primary/60" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Track & Shortlist
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Tag experts into shortlist groups (customer, competitor, target) and
          track their lifecycle from recommended through to call completed. The
          Experts table supports lens-based views, inline notes, and CID
          clearance requests -- all auto-populated from ingestion.
        </p>
        <ul className="mt-3 flex flex-col gap-1.5 max-w-3xl">
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Switch between Customer, Competitor, and Target lens views to focus on a specific expert type
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Shortlist experts directly from the table -- shortlisted profiles carry through to calls and surveys
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Request CID clearance for target-company experts with one click
          </li>
        </ul>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/experts"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Users className="h-3.5 w-3.5" />
            Go to Experts page
          </Link>
          <p className="text-xs text-muted-foreground">
            Try shortlisting an expert or requesting CID clearance.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STEP 4 -- Schedule Calls & Track Spend                        */}
      {/* ============================================================ */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
            4
          </span>
          <Phone className="h-4 w-4 text-primary/60" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Schedule Calls & Track Spend
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Move to the Calls page to log scheduled calls. The system
          auto-populates expert details from the central database and provides
          live budget roll-ups covering scheduled, completed, and cancelled
          calls. Add new rows directly in the table, and costs are calculated
          automatically from the network rate.
        </p>
        <ul className="mt-3 flex flex-col gap-1.5 max-w-3xl">
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Add calls by typing an expert name -- the system auto-suggests from the database and populates all fields
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Follow-ups are auto-detected when the same expert is contacted through the same network more than once
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Upload transcripts directly from the call row to link them to the engagement
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Export the full call log to Excel with one click
          </li>
        </ul>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/calls"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Phone className="h-3.5 w-3.5" />
            Go to Calls page
          </Link>
          <p className="text-xs text-muted-foreground">
            Seed data includes 8 calls across different statuses and networks.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STEP 5 -- AI Surveys                                          */}
      {/* ============================================================ */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
            5
          </span>
          <Building2 className="h-4 w-4 text-primary/60" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            AI Surveys & Enrichment
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          AI interview surveys are tracked separately from calls, with their own
          cost model (flat EUR-denominated fees). The AI Surveys tab mirrors
          the calls table structure but adapts to survey-specific fields and
          pricing. Enrichment data (anonymised titles, company details) is
          auto-populated from the expert database.
        </p>
        <ul className="mt-3 flex flex-col gap-1.5 max-w-3xl">
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Separate workspace for AI interview billing with EUR-denominated flat fees
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Same expert auto-population and lens-based views as the Calls page
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            All tables exportable to Excel with pre-formatted layouts
          </li>
        </ul>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/ai-surveys"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Building2 className="h-3.5 w-3.5" />
            Go to AI Surveys page
          </Link>
          <p className="text-xs text-muted-foreground">
            Seed data includes 5 surveys across completed, invited, and cancelled statuses.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STEP 6 -- Transcripts & KPI Extraction                        */}
      {/* ============================================================ */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
            6
          </span>
          <Brain className="h-4 w-4 text-primary/60" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Transcripts & KPI Extraction
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Upload call transcripts directly from the Calls page. The system
          stores them alongside the engagement record, and AI generates
          summaries so users can quickly identify which transcript they need.
          KPI scores (e.g. NPS for customer calls) are extracted automatically
          where applicable.
        </p>
        <ul className="mt-3 flex flex-col gap-1.5 max-w-3xl">
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Paste or upload transcript text from any call row using the transcript button
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            AI-generated summaries and KPI extraction into the call tracker
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Transcripts are linked to the engagement and accessible from the call row
          </li>
        </ul>

        {/* ---- Sample transcript files ---- */}
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sample Transcripts
        </p>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Download these sample customer call transcripts, then navigate to the
          Calls page and click {"\"Upload Transcript\""} on the matching completed
          call row. The NPS score is included in the transcript header.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* ---- Raj Patel transcript ---- */}
          <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 bg-muted/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/8 ring-1 ring-primary/15">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Raj Patel -- Solaris Packaging
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Customer call | NPS 8 | .txt format
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                60-minute call covering Meridian evaluation criteria, rollout
                progress, and IO module lead-time concerns.
              </p>
              <div className="mt-3 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-3">
                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-36 overflow-y-auto">
                  {SAMPLE_TRANSCRIPT_RAJ.slice(0, 400)}{"..."}
                </pre>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      SAMPLE_TRANSCRIPT_RAJ,
                      "transcript-raj-patel-solaris-packaging.txt",
                      "text/plain"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
                >
                  <Download className="h-3 w-3" />
                  Download .txt file
                </button>
                <CopyButton text={SAMPLE_TRANSCRIPT_RAJ} />
              </div>
            </div>
          </div>

          {/* ---- James Achebe transcript ---- */}
          <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 bg-muted/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/8 ring-1 ring-primary/15">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  James Achebe -- FreshPath Foods
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Customer call | NPS 7 | .txt format
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                45-minute call covering batch recipe management, Rockwell
                vs Meridian pricing, and pilot site rollout progress.
              </p>
              <div className="mt-3 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-3">
                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-36 overflow-y-auto">
                  {SAMPLE_TRANSCRIPT_JAMES.slice(0, 400)}{"..."}
                </pre>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      SAMPLE_TRANSCRIPT_JAMES,
                      "transcript-james-achebe-freshpath-foods.txt",
                      "text/plain"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
                >
                  <Download className="h-3 w-3" />
                  Download .txt file
                </button>
                <CopyButton text={SAMPLE_TRANSCRIPT_JAMES} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/calls"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Brain className="h-3.5 w-3.5" />
            Go to Calls page
          </Link>
          <p className="text-xs text-muted-foreground">
            Click {"\"Upload Transcript\""} on a completed call to paste or upload the text. Completed calls with transcripts show a green {"\"View Transcript\""} button instead.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DIVIDER -- Work in Progress section                           */}
      {/* ============================================================ */}
      <div className="my-12 border-t border-border" />

      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700">
          Work in Progress
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          Under Active Development
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The following stages have initial implementations but are being
          expanded with additional capabilities.
        </p>
      </div>

      {/* ============================================================ */}
      {/*  STEP 7 -- Search & Discovery (WIP)                            */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
            7
          </span>
          <SearchIcon className="h-4 w-4 text-primary/60" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Search & Discovery
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
            <Construction className="h-3 w-3" />
            Work in Progress
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The Search page provides a unified search across experts, transcripts,
          and survey responses. Type and industry filters narrow results.
          Currently, search is keyword-based across stored data. Future
          enhancements will add vector-embedded semantic search and RAG-powered
          transcript queries with source attribution.
        </p>
        <ul className="mt-3 flex flex-col gap-1.5 max-w-3xl">
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Search across experts, transcripts, and surveys from a single input
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Filter by type (Experts / Transcripts / Surveys) and industry
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
            Planned: vector-embedded semantic search for natural-language queries
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
            Planned: transcript search with supporting quotes linked back to source
          </li>
        </ul>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <SearchIcon className="h-3.5 w-3.5" />
            Go to Search page
          </Link>
          <p className="text-xs text-muted-foreground">
            Try searching for an expert name or company from the demo data.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STEP 8 -- Reconciliation & Reporting (WIP)                    */}
      {/* ============================================================ */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
            8
          </span>
          <FileBarChart className="h-4 w-4 text-primary/60" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Reconciliation & Reporting
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
            <Construction className="h-3 w-3" />
            Work in Progress
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The Dashboard page provides budget roll-ups, expert-type breakdowns,
          and spend-by-status reporting. The Budget tab shows cost breakdowns
          across scheduled, completed, and cancelled calls. Full reconciliation
          tables for network settlement and audit-trail exports are planned.
        </p>
        <ul className="mt-3 flex flex-col gap-1.5 max-w-3xl">
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Dashboard with live budget roll-ups across all statuses
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
            Expert-type breakdown showing customer, competitor, and target counts
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
            Planned: structured reconciliation tables for network settlement
          </li>
          <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
            Planned: cost verification with full audit trail and project close-out
          </li>
        </ul>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <FileBarChart className="h-3.5 w-3.5" />
            Go to Dashboard
          </Link>
          <p className="text-xs text-muted-foreground">
            Review budget roll-ups and explore the spend breakdown by status and type.
          </p>
        </div>
      </section>

      {/* Bottom nav */}
      <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
        <Link
          href="/"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to overview
        </Link>
        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          Start uploading
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
