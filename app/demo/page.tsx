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
  Users,
  Phone,
  ShieldCheck,
  Brain,
  Search as SearchIcon,
  FileBarChart,
  Building2,
} from "lucide-react"
import WipBanner from "../components/wip-banner"

/* ------------------------------------------------------------------ */
/*  Sample data: Raw text (typical network email body)                 */
/* ------------------------------------------------------------------ */

const SAMPLE_RAW_TEXT = `Expert Network Recommendations - Project Helios

From: AlphaSights Research Team
Date: 15 January 2025
Project: Competitive landscape review - industrial automation

Below are 5 expert recommendations for your consideration:

1. Dr. Sarah Chen
   Current Role: Former VP of Engineering, Rockwell Automation (departed June 2024)
   Background: 18 years in industrial automation. Led the PLC division (2019-2024) overseeing $400M revenue. Previously at Siemens Digital Industries for 8 years.
   Relevant Expertise: Competitive positioning vs Siemens/ABB, pricing strategy for mid-market PLCs, customer switching costs
   Compliance: No known conflicts. Never employed by target company.
   Rate: $850/hr | Network: AlphaSights | ID: AS-2025-00142

2. James Okoro
   Current Role: Director of Operations, Fanuc America
   Background: 12 years in robotics and factory automation. Currently manages NA operations for Fanuc's CNC division. Previously at ABB Robotics (2015-2019).
   Relevant Expertise: CNC market share dynamics, Fanuc vs Mazak competitive positioning, Japanese vs European automation vendors
   Compliance: Currently employed at Fanuc - competitor to target. Requires clearance.
   Rate: $1,100/hr | Network: AlphaSights | ID: AS-2025-00143

3. Maria Gonzalez
   Current Role: Independent Consultant (formerly Chief Commercial Officer, Emerson Electric)
   Background: 22 years across Emerson, Honeywell, and Schneider Electric. Led Emerson's $2.1B process automation commercial org until 2023.
   Relevant Expertise: Process automation market sizing, Emerson/Honeywell duopoly dynamics, M&A integration in automation
   Compliance: Clear - no advisory or board relationships with target.
   Rate: $950/hr | Network: AlphaSights | ID: AS-2025-00144

4. Thomas Weber
   Current Role: Principal Analyst, ARC Advisory Group
   Background: 15 years covering industrial automation as an industry analyst. Publishes quarterly market share reports on PLC, DCS, and SCADA segments.
   Relevant Expertise: Market share data, vendor rankings, technology adoption curves in automation
   Compliance: Analyst - may have NDA restrictions with specific vendors. Needs pre-screen.
   Rate: $700/hr | Network: AlphaSights | ID: AS-2025-00145

5. Priya Nair
   Current Role: Former Head of Digital Solutions, Schneider Electric (departed March 2024)
   Background: 10 years at Schneider, most recently leading their EcoStruxure industrial IoT platform. Previously at Honeywell Connected Enterprise.
   Relevant Expertise: Industrial IoT platforms, Schneider vs Siemens MindSphere, software attach rates in automation
   Compliance: Non-compete expired. No target-company involvement.
   Rate: $900/hr | Network: AlphaSights | ID: AS-2025-00146

Please let us know which experts you would like to schedule, and we will coordinate availability.

Best regards,
AlphaSights Research Team`

/* ------------------------------------------------------------------ */
/*  Sample data: CSV (spreadsheet export)                              */
/* ------------------------------------------------------------------ */

const SAMPLE_CSV = `Name,Title,Company,Industry,Network,Compliance,Tags
Dr. Sarah Chen,Former VP of Engineering,Rockwell Automation,Technology,AlphaSights,cleared,PLC;industrial-automation;pricing
James Okoro,Director of Operations,Fanuc America,Technology,AlphaSights,pending,CNC;robotics;competitor
Maria Gonzalez,Former Chief Commercial Officer,Emerson Electric,Technology,AlphaSights,cleared,process-automation;M&A;market-sizing
Thomas Weber,Principal Analyst,ARC Advisory Group,Technology,AlphaSights,pending,market-share;analyst;NDA-check
Priya Nair,Former Head of Digital Solutions,Schneider Electric,Technology,AlphaSights,cleared,IoT;EcoStruxure;software
Henrik Larsson,VP Manufacturing,ABB Robotics,Technology,GLG,pending,robotics;ABB;factory-automation
Rachel Kim,Former Director Product Management,Siemens Digital Industries,Technology,Third Bridge,cleared,MindSphere;digital-twin;Siemens
David Okonkwo,Head of Automation Strategy,Honeywell Process Solutions,Technology,Guidepoint,pending,DCS;process-control;Honeywell
Lisa Tanaka,Former SVP Sales,Yokogawa Electric,Technology,GLG,cleared,DCS;Japan;process-industries
Mark Phillips,Managing Director,Industrial Automation Partners (PE),Finance,Direct,cleared,PE;buy-side;automation-M&A`

/* ------------------------------------------------------------------ */
/*  Sample data: Email (.eml format)                                   */
/* ------------------------------------------------------------------ */

const SAMPLE_EML = `From: research-team@glg.com
To: project-team@bain.com
Subject: GLG Expert Recommendations - Project Helios (Industrial Automation)
Date: Thu, 16 Jan 2025 09:30:00 +0000
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Hi team,

Please find below our initial expert recommendations for Project Helios.

EXPERT 1
Name: Henrik Larsson
Title: VP Manufacturing, ABB Robotics
Geography: Zurich, Switzerland
Background: 20 years at ABB across robotics and discrete automation. Currently oversees manufacturing operations for ABB's collaborative robot (cobot) line. Previously ran the ABB Robotics R&D center in Vasteras, Sweden.
Why relevant: Deep knowledge of ABB's cobot strategy, competitive positioning vs Universal Robots and Fanuc, and European manufacturing cost structures.
Compliance note: Currently employed at ABB. May need CID clearance if ABB is in scope.
Hourly rate: EUR 900
GLG Member ID: GLG-EU-88421

EXPERT 2
Name: Rachel Kim
Title: Former Director, Product Management - Siemens Digital Industries
Geography: Chicago, IL
Background: 9 years at Siemens (2014-2023). Led product management for the MindSphere industrial IoT platform and TIA Portal engineering framework. Now independent consultant.
Why relevant: First-hand perspective on Siemens' digital strategy, MindSphere adoption challenges, and competitive dynamics with Schneider EcoStruxure and Rockwell FactoryTalk.
Compliance note: Left Siemens 18+ months ago. No active non-compete.
Hourly rate: USD 1,000
GLG Member ID: GLG-US-77203

EXPERT 3
Name: David Okonkwo
Title: Head of Automation Strategy, Honeywell Process Solutions
Geography: Houston, TX
Background: 14 years at Honeywell. Currently defines the automation strategy for Honeywell's process solutions division, covering DCS, safety systems, and advanced process control. Previously at Emerson (5 years).
Why relevant: Understands Honeywell's competitive positioning in process automation, DCS market dynamics, and the Honeywell/Emerson competitive landscape.
Compliance note: Current Honeywell employee. Requires pre-screening for confidentiality.
Hourly rate: USD 1,200
GLG Member ID: GLG-US-81057

Please confirm which experts you'd like to proceed with and we'll send calendar invitations.

Best,
GLG Research Team`

/* ------------------------------------------------------------------ */
/*  Pipeline steps for the rest of the guide                           */
/* ------------------------------------------------------------------ */

const futureSteps: {
  step: number
  title: string
  description: string
  icon: React.ElementType
  status: "coming-soon" | "planned"
}[] = [
  {
    step: 2,
    title: "Track & Shortlist",
    description:
      "Once ingested, navigate to the Experts page to view all parsed profiles in a unified table. Tag experts into shortlist groups (customer, competitor, target) and track their lifecycle from recommended through to call completed.",
    icon: Users,
    status: "coming-soon",
  },
  {
    step: 3,
    title: "Schedule Calls & Track Spend",
    description:
      "Move to the Calls page to log scheduled calls. The system auto-populates expert details from the central database and provides live budget roll-ups covering scheduled, completed, and cancelled calls.",
    icon: Phone,
    status: "coming-soon",
  },
  {
    step: 4,
    title: "Enrich & Classify",
    description:
      "Profiles are automatically enriched with anonymised titles for client-safe sharing, company firmographics from BI integrations, and current/former employee classification with departure-date checks.",
    icon: Building2,
    status: "planned",
  },
  {
    step: 5,
    title: "Compliance & Clearance",
    description:
      "Cross-check profiles against client advisor lists, BEN advisors, and do-not-contact lists. Mark companies or individuals as cleared for CID purposes, with auto-populated clearance request forms.",
    icon: ShieldCheck,
    status: "planned",
  },
  {
    step: 6,
    title: "Transcripts & KPI Extraction",
    description:
      "Upload call transcripts for AI-generated summaries, KPI extraction into the call tracker, and flagging of references that may need anonymising before client sharing.",
    icon: Brain,
    status: "planned",
  },
  {
    step: 7,
    title: "Search & Discovery",
    description:
      "Use expert search (database filters + natural language) and transcript search (filter by expert type, then query for supporting quotes) to surface profiles and insights faster.",
    icon: SearchIcon,
    status: "planned",
  },
  {
    step: 8,
    title: "Reconciliation & Reporting",
    description:
      "Generate structured summary tables for network reconciliation, cost verification with audit trails, and pre-formatted exports ready to paste into emails or slides.",
    icon: FileBarChart,
    status: "planned",
  },
]

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
          Walk through each stage of Helmsman using the sample data below. Start
          by ingesting unstructured expert profiles, then explore how the
          platform handles tracking, compliance, and reporting.
        </p>
      </div>

      <WipBanner feature="demo" />

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
          The first step is to upload expert profile data in whatever format you
          have it. In practice this comes as network emails, shared spreadsheets,
          or raw text pasted from screening responses. Try each of the three
          sample formats below to see how the parser handles them.
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
                A typical expert recommendation email from AlphaSights containing
                5 expert profiles with names, roles, compliance notes, and rates.
                Copy the text below and paste it into the{" "}
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
                A standard .eml file representing a GLG recommendation email
                with 3 expert profiles. Download and upload it to test email
                ingestion.
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
                      "glg-recommendations-project-helios.eml",
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
                A CSV file with 10 expert profiles across multiple networks.
                This is the structured format that the upload page currently
                accepts directly. Download and drag it onto the{" "}
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
                      "expert-recommendations-helios.csv",
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
            Try uploading the CSV file first -- it works with the current parser.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DIVIDER                                                       */}
      {/* ============================================================ */}
      <div className="my-12 border-t border-border" />

      {/* ============================================================ */}
      {/*  STEPS 2-8 -- Coming soon                                     */}
      {/* ============================================================ */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
          Next Steps
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          The rest of the pipeline
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Each stage below will be expanded with its own walkthrough and sample
          data as the prototype progresses.
        </p>

        <div className="mt-6 grid gap-3">
          {futureSteps.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.step}
                className="flex items-start gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:border-primary/15"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[11px] font-bold">
                  {s.step}
                </span>
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {s.title}
                    </h3>
                    <span
                      className={[
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        s.status === "coming-soon"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {s.status === "coming-soon" ? "Coming soon" : "Planned"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </div>
            )
          })}
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
