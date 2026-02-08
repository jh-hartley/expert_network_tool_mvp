"use client"

import { useState, type ReactNode } from "react"
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
  Heart,
  Users,
  Phone,
  Brain,
  Search as SearchIcon,
  FileBarChart,
  Building2,
  ChevronDown,
  EyeOff,
  RotateCcw,
} from "lucide-react"
import { hardResetAll } from "@/lib/storage"

/* ------------------------------------------------------------------ */
/*  Demo scenario data (unchanged)                                     */
/* ------------------------------------------------------------------ */

const SAMPLE_RAW_TEXT = `Expert Network Recommendations - Project Atlas

From: AlphaView Research Team
Date: 15 January 2025
Project: Commercial due diligence - industrial controls & automation

Below are 5 expert recommendations for your consideration. We have conducted initial screening calls and included responses to your standard questions below each profile.

1. Raj Patel
   Type: Customer
   Current Role: VP of Plant Engineering, Orion Packaging (CPG manufacturer)
   Background: 16 years in plant operations. Manages automation procurement across 12 North American facilities. Annual controls spend ~$8M. Previously at Unilever manufacturing ops.
   Relevant Expertise: Multi-vendor evaluation processes, total cost of ownership analysis, mid-market vs enterprise vendor trade-offs
   Compliance: No known conflicts. Never employed by any automation vendor.
   Rate: $650/hr | Network: AlphaView | ID: AS-2025-00201

   Screening Responses (Customer):
   Q1 - Which vendors have you evaluated in the last 24 months?
   "We looked at Zephyr Controls, Kestrel, and Trilon for our latest line expansion. Also got proposals from Stonemill but they were out of budget."

   Q2 - What drove your most recent vendor selection?
   "Ultimately it came down to integration support and total cost. The mid-market players were much more hands-on during commissioning."

   Q3 - How would you rate your satisfaction with your current vendor (1-10)?
   "I'd give our primary vendor an 8. Good product, responsive support, though documentation could be better."

   Q4 - What would trigger you to switch providers?
   "If lead times slipped consistently or if they couldn't support our move to more networked architectures. We need Ethernet/IP native, not bolted on."

2. Diane Kowalski
   Type: Competitor
   Current Role: Former SVP Sales, Kestrel Automation North America (departed Aug 2024)
   Background: 19 years in industrial automation sales. Built Kestrel's NA business from $40M to $180M revenue. Previously at B&R Automation (now ABB) and Bosch Rexroth.
   Relevant Expertise: PC-based control market dynamics, competitive win/loss patterns, channel strategy for mid-market automation
   Compliance: Non-compete expired. No current advisory or board roles.
   Rate: $950/hr | Network: AlphaView | ID: AS-2025-00202

   Screening Responses (Competitor):
   Q1 - How do you view the competitive landscape in industrial controls?
   "The mid-market is getting crowded. You have Kestrel, Zephyr Controls, WAGO, and Trilon all fighting for the same $2-10M plant budgets. Stonemill and Siemens own the top end."

   Q2 - Which competitors are you losing deals to most often?
   "When I was at Kestrel, we lost most often to Zephyr Controls in food & beverage and to Trilon in automotive Tier 2. Zephyr's local support model is very effective."

   Q3 - How does your pricing compare to mid-market players?
   "Kestrel is slightly premium but justifiable on total cost. Zephyr is maybe 10-15% cheaper on hardware but closes the gap on service contracts."

   Q4 - Where are you investing in R&D over the next 2 years?
   "Kestrel is all-in on XTS linear transport and TwinCAT cloud engineering. The industry is moving toward software-defined control."

3. Marcus Oyelaran
   Type: Customer
   Current Role: Director of Manufacturing Technology, Hartwell Brewing Co.
   Background: 11 years in food & beverage manufacturing. Oversees automation strategy for 4 breweries. Manages $3.5M annual controls budget.
   Relevant Expertise: F&B-specific automation requirements, hygiene/washdown considerations, vendor support expectations in continuous production
   Compliance: Clear. No vendor relationships beyond standard procurement.
   Rate: $550/hr | Network: AlphaView | ID: AS-2025-00203

   Screening Responses (Customer):
   Q1 - Which vendors have you evaluated in the last 24 months?
   "Zephyr Controls and Stonemill. We also looked at Siemens but their local distributor coverage was thin in our regions."

   Q2 - What drove your most recent vendor selection?
   "Zephyr won our latest project because their field engineers actually understood our washdown requirements without us having to educate them."

   Q3 - How would you rate your satisfaction with your current vendor (1-10)?
   "Zephyr gets a 9 from us. Very responsive, and their PLC programming environment has gotten much better in the last two releases."

   Q4 - What would trigger you to switch providers?
   "Acquisition by a larger company that changed the support model. That hands-on approach is why we chose them."

4. Sandra Voss
   Type: Competitor
   Current Role: Head of Strategy, Trilon Industrial Automation, Americas
   Background: 13 years at Trilon. Leads corporate strategy and M&A evaluation for the Americas region. Previously at McKinsey (industrials practice).
   Relevant Expertise: Competitive intelligence on mid-market controls, M&A landscape, Japanese vs Western automation vendor strategies
   Compliance: Currently employed at Trilon. Requires pre-screening for confidentiality.
   Rate: $1,100/hr | Network: AlphaView | ID: AS-2025-00204

   Screening Responses (Competitor):
   Q1 - How do you view the competitive landscape in industrial controls?
   "The mid-market is fragmenting. Zephyr Controls has built a strong regional presence in North America, while Kestrel is pushing hard from Europe. Trilon differentiates on vision and robotics integration."

   Q2 - Which competitors are you losing deals to most often?
   "In discrete manufacturing we lose to Kestrel on innovation and to Zephyr Controls on price-for-value in the $1-5M project range."

   Q3 - How does your pricing compare to mid-market players?
   "We are competitive but the Japanese yen fluctuation creates margin pressure. Zephyr and Kestrel both have domestic manufacturing advantages."

   Q4 - Where are you investing in R&D over the next 2 years?
   "AI-enabled quality inspection and tighter robotics-PLC integration. We think the control layer and the robot layer merge within 5 years."

5. Chen Wei-Lin
   Type: Customer
   Current Role: Chief Engineer, TerraForge Metals (specialty metals fabrication)
   Background: 14 years in metals and heavy manufacturing. Manages automation for high-temperature and hazardous environments. Previously at Nucor Steel.
   Relevant Expertise: Harsh-environment automation requirements, vendor reliability benchmarking, maintenance cost comparisons
   Compliance: No conflicts. Pure end-user perspective.
   Rate: $600/hr | Network: AlphaView | ID: AS-2025-00205

   Screening Responses (Customer):
   Q1 - Which vendors have you evaluated in the last 24 months?
   "Stonemill, Siemens, and Zephyr Controls. For our environment we need proven high-temp rated hardware so the field narrows quickly."

   Q2 - What drove your most recent vendor selection?
   "Stonemill won on installed base compatibility, but Zephyr came very close. Their newer high-temp rated I/O modules impressed our maintenance team."

   Q3 - How would you rate your satisfaction with your current vendor (1-10)?
   "Stonemill is a 7 -- solid but expensive. I'd rate Zephyr an 8 on the project we trialled them on."

   Q4 - What would trigger you to switch providers?
   "Significant cost savings with equivalent reliability data. We need at least 3 years of MTBF data before we commit to a new vendor at scale."

6. Felicity Okonjo
   Type: Customer
   Current Role: VP of Engineering, Ridgeline Automotive Components (Tier 1 supplier)
   Background: 17 years in automotive manufacturing. Oversees automation across 6 plants serving BMW, Toyota, and Ford. Annual controls budget ~$12M. Previously at Magna International.
   Relevant Expertise: Automotive OEM compliance requirements, high-volume line integration, vendor qualification processes for IATF 16949 environments
   Compliance: No known conflicts. Pure end-user perspective.
   Rate: $700/hr | Network: AlphaView | ID: AS-2025-00206

   Screening Responses (Customer):
   Q1 - Which vendors have you evaluated in the last 24 months?
   "Stonemill, Kestrel, Zephyr Controls, and Siemens. We run mostly Stonemill but have been diversifying to reduce single-vendor risk."

   Q2 - What drove your most recent vendor selection?
   "Kestrel won our latest high-speed press line project because of their motion control performance. Zephyr Controls came second -- very competitive on price but lacking automotive-specific reference installs."

   Q3 - How would you rate your satisfaction with your current vendor (1-10)?
   "Stonemill is a 7 -- reliable but the annual price increases are aggressive. Kestrel is an 8 on the new line."

   Q4 - What would trigger you to switch providers?
   "If a mid-market vendor could demonstrate IATF 16949 compliance support and sub-100ms cycle time performance consistently, we would seriously consider switching more lines."

7. Declan Moriarty
   Type: Competitor
   Current Role: Former VP Engineering, Stonemill Automation (departed March 2024)
   Background: 22 years at Stonemill. Led PLC and PAC product development for the last 8 years. Holds 12 patents in industrial control architectures. Previously at Honeywell Process Solutions.
   Relevant Expertise: Stonemill product roadmap insights, large enterprise controls architecture, competitive positioning vs mid-market disruptors
   Compliance: Non-compete expired. No active advisory or board roles. Requires CID check given target-adjacent overlap.
   Rate: $1,300/hr | Network: AlphaView | ID: AS-2025-00207

   Screening Responses (Competitor):
   Q1 - How do you view the competitive landscape in industrial controls?
   "Stonemill still dominates in installed base, but the mid-market players are eroding share faster than the market realises. Zephyr Controls in particular has built a very effective land-and-expand strategy in food & beverage."

   Q2 - Which competitors are you losing deals to most often?
   "When I was at Stonemill, the biggest surprise losses were to Zephyr Controls in brownfield upgrades where the customer didn't want to pay for a full ControlLogix migration."

   Q3 - How does your pricing compare to mid-market players?
   "Stonemill hardware is typically 30-50% more expensive than Zephyr or Kestrel. The justification is ecosystem lock-in and FactoryTalk, but that argument is weakening."

   Q4 - Where are you investing in R&D over the next 2 years?
   "When I left, the big bets were cloud-native engineering tools, simplified micro-PLCs for OEM, and AI-assisted troubleshooting. The threat from software-defined control was taken very seriously."

8. Amara Diallo
   Type: Customer
   Current Role: Director of Process Engineering, Clearwater Pharmaceuticals
   Background: 13 years in pharmaceutical manufacturing. Manages automation for 2 sterile manufacturing facilities and 1 API production plant. Strict FDA/GMP validation requirements.
   Relevant Expertise: Pharma-grade automation requirements, 21 CFR Part 11 compliance, validation lifecycle costs, vendor audit processes
   Compliance: Clear. No vendor relationships beyond standard procurement.
   Rate: $800/hr | Network: AlphaView | ID: AS-2025-00208

   Screening Responses (Customer):
   Q1 - Which vendors have you evaluated in the last 24 months?
   "Siemens, Stonemill, and Zephyr Controls. We also considered Kestrel but they lacked pharma reference sites at the time."

   Q2 - What drove your most recent vendor selection?
   "Siemens won our latest cleanroom expansion because of their SIMATIC Batch integration. However, Zephyr Controls is being piloted on our packaging lines where the validation burden is lower."

   Q3 - How would you rate your satisfaction with your current vendor (1-10)?
   "Siemens is a 7 -- powerful but complex. Zephyr is too early to rate on the pilot, but their engineering team has been very responsive to our validation documentation needs."

   Q4 - What would trigger you to switch providers?
   "If a vendor could significantly reduce our validation lifecycle cost -- which currently runs $200K+ per system -- that would be transformative for our procurement decisions."

9. Niall Brennan
   Type: Competitor
   Current Role: Chief Commercial Officer, WestBridge Automation (emerging UK-based controls vendor)
   Background: 15 years in industrial automation sales. Built WestBridge's North American business from scratch. Previously at Schneider Electric and ABB.
   Relevant Expertise: Emerging competitor strategies, transatlantic market entry, channel partner dynamics in mid-market controls
   Compliance: Currently employed at WestBridge. Requires pre-screening for confidentiality.
   Rate: $850/hr | Network: AlphaView | ID: AS-2025-00209

   Screening Responses (Competitor):
   Q1 - How do you view the competitive landscape in industrial controls?
   "North America is the battleground. Everyone -- Zephyr, Kestrel, WAGO, and us -- is going after the same underserved mid-market that Stonemill has overcharged for years."

   Q2 - Which competitors are you losing deals to most often?
   "Zephyr Controls is our most frequent competitor in the $1-3M project range. They win on local service and established distributor relationships that we are still building."

   Q3 - How does your pricing compare to mid-market players?
   "We are aggressive on entry pricing -- typically 15-20% below Zephyr -- to build reference sites. The challenge is proving long-term support capability from a UK base."

   Q4 - Where are you investing in R&D over the next 2 years?
   "Container-based runtimes, digital twin integration, and simplified HMI development. We think the next generation of controls buyers will choose based on software experience, not hardware specs."

10. Gloria Stenberg
    Type: Customer
    Current Role: VP Operations, Nordic Cold Storage (temperature-controlled logistics)
    Background: 12 years in cold chain logistics. Manages automation for 8 distribution centres with -30C to +4C zones. $5M annual automation spend. Previously at Lineage Logistics.
    Relevant Expertise: Cold chain automation requirements, energy efficiency considerations, multi-site standardisation challenges
    Compliance: No conflicts. Pure end-user perspective.
    Rate: $550/hr | Network: AlphaView | ID: AS-2025-00210

    Screening Responses (Customer):
    Q1 - Which vendors have you evaluated in the last 24 months?
    "Stonemill for our main warehouse management systems, Zephyr Controls for conveyor and sortation PLCs, and Siemens for refrigeration control."

    Q2 - What drove your most recent vendor selection?
    "Zephyr won our latest DC build-out because they offered a bundled PLC + I/O + engineering package that was 25% cheaper than Stonemill for equivalent functionality."

    Q3 - How would you rate your satisfaction with your current vendor (1-10)?
    "Zephyr is an 8. Their cold-rated hardware has performed well and remote diagnostics have cut our unplanned downtime by about 30%."

    Q4 - What would trigger you to switch providers?
    "If energy monitoring and optimisation were better integrated into the control platform. We spend $2M/year on refrigeration energy alone."

11. Kwame Asante
    Type: Competitor
    Current Role: Former Director of Product Marketing, Trilon Industrial Automation (departed June 2024)
    Background: 9 years at Trilon. Ran product positioning and competitive analysis for the Americas division. Deep knowledge of Trilon's go-to-market strategy and win/loss analysis.
    Relevant Expertise: Mid-market competitive positioning, Trilon's strategic priorities, customer perception benchmarking across vendors
    Compliance: Non-compete expired. No active advisory or board roles.
    Rate: $750/hr | Network: AlphaView | ID: AS-2025-00211

    Screening Responses (Competitor):
    Q1 - How do you view the competitive landscape in industrial controls?
    "Zephyr Controls has been the story of the last 3 years. They have taken share from everyone in the mid-market by out-executing on customer service and local support."

    Q2 - Which competitors are you losing deals to most often?
    "At Trilon, Zephyr was our #1 loss reason in food & beverage and general discrete manufacturing. Kestrel was #1 in machine building and automotive."

    Q3 - How does your pricing compare to mid-market players?
    "Trilon was generally cheaper than Zephyr on hardware, but Zephyr's bundled service packages made the total cost comparison unfavourable for us."

    Q4 - Where are you investing in R&D over the next 2 years?
    "When I left, Trilon was pivoting hard toward collaborative robotics integration and vision-guided automation. The PLC side was getting less R&D investment."

12. Ingrid Haugen
    Type: Customer
    Current Role: Chief Technology Officer, FjordSteel AS (Norwegian specialty steel manufacturer)
    Background: 20 years in metals and heavy industry. Leads digital transformation and automation strategy for 3 production facilities. Annual automation investment ~$9M.
    Relevant Expertise: European industrial automation procurement, harsh-environment reliability benchmarking, Stonemill vs Siemens vs mid-market vendor comparison from a global end-user perspective
    Compliance: No conflicts. Norway-based, available for video calls.
    Rate: $900/hr | Network: AlphaView | ID: AS-2025-00212

    Screening Responses (Customer):
    Q1 - Which vendors have you evaluated in the last 24 months?
    "Siemens is our standard in Europe. We evaluated Zephyr Controls when they entered the Nordic market last year, along with Kestrel and ABB for specific applications."

    Q2 - What drove your most recent vendor selection?
    "Siemens won on ecosystem -- TIA Portal integration across our plants. But Zephyr Controls submitted a very compelling proposal for a new rolling mill line that was 35% cheaper."

    Q3 - How would you rate your satisfaction with your current vendor (1-10)?
    "Siemens is a solid 8 globally. Zephyr Controls we cannot rate yet as we have not deployed, but their technical pre-sales team impressed our engineers."

    Q4 - What would trigger you to switch providers?
    "Proven reliability data in high-vibration, high-temperature steel mill environments. The mid-market vendors need to demonstrate they can handle harsh conditions at scale."

13. Trevor Pham
    Type: Competitor
    Current Role: Senior Director of Strategic Partnerships, Kestrel Automation
    Background: 11 years in industrial automation. Manages Kestrel's technology partnerships and OEM channel strategy in North America. Previously at National Instruments (now NI).
    Relevant Expertise: OEM channel dynamics, technology partnership strategies, Kestrel's competitive response to mid-market disruptors
    Compliance: Currently employed at Kestrel. Requires pre-screening for confidentiality.
    Rate: $1,000/hr | Network: AlphaView | ID: AS-2025-00213

    Screening Responses (Competitor):
    Q1 - How do you view the competitive landscape in industrial controls?
    "Kestrel and Zephyr Controls are on a collision course in the mid-market. We both target the same customer tier but from different angles -- Kestrel leads with technology, Zephyr leads with service."

    Q2 - Which competitors are you losing deals to most often?
    "Zephyr Controls in end-user projects where the customer values local support over cutting-edge features. We win machine builder deals where cycle time and precision matter."

    Q3 - How does your pricing compare to mid-market players?
    "Kestrel is 10-20% premium over Zephyr on hardware. We justify it with TwinCAT's engineering productivity and our motion control performance."

    Q4 - Where are you investing in R&D over the next 2 years?
    "Vision integration, XPlanar next-gen, and TwinCAT Chat -- an AI assistant for PLC programming. We believe software differentiation is the future moat."

14. Miriam Rothschild
    Type: Customer
    Current Role: Head of Manufacturing Excellence, Luminos Solar (solar panel manufacturer)
    Background: 10 years in high-tech manufacturing. Manages automation for 2 gigawatt-scale panel production facilities. Rapid expansion requiring aggressive vendor evaluation cycles.
    Relevant Expertise: High-speed discrete manufacturing automation, cleanroom-adjacent requirements, rapid scaling challenges, vendor evaluation for greenfield facilities
    Compliance: No conflicts. Pure end-user perspective.
    Rate: $650/hr | Network: AlphaView | ID: AS-2025-00214

    Screening Responses (Customer):
    Q1 - Which vendors have you evaluated in the last 24 months?
    "Kestrel, Zephyr Controls, Siemens, and Trilon. Solar manufacturing needs fast cycle times and high reliability -- not all vendors can deliver both."

    Q2 - What drove your most recent vendor selection?
    "Kestrel won our newest line on motion control performance. But Zephyr Controls is being seriously evaluated for our material handling and packaging subsystems where cost matters more than cycle time."

    Q3 - How would you rate your satisfaction with your current vendor (1-10)?
    "Kestrel is a 9 for the core process. For auxiliary systems, we need a more cost-effective solution and Zephyr looks very promising."

    Q4 - What would trigger you to switch providers?
    "If Zephyr could demonstrate 50ms deterministic cycle times we would consider them for more critical applications. Right now they are strong on the $500K-$2M subsystem projects."

15. Oscar Lindqvist
    Type: Competitor
    Current Role: Former Chief Strategy Officer, WAGO Corporation (departed January 2025)
    Background: 16 years in industrial automation strategy. Most recently led WAGO's global strategy including M&A pipeline and competitive intelligence. Previously at BCG (industrials practice).
    Relevant Expertise: Mid-market M&A landscape, open-standards vs proprietary control strategies, WAGO's assessment of Zephyr Controls as an acquisition target
    Compliance: Non-compete waived per separation agreement. CID clearance recommended given strategic role.
    Rate: $1,400/hr | Network: AlphaView | ID: AS-2025-00215

    Screening Responses (Competitor):
    Q1 - How do you view the competitive landscape in industrial controls?
    "The mid-market is ripe for consolidation. Zephyr Controls, Kestrel, and WAGO are all potential acquirers or targets depending on strategic direction. The question is who moves first."

    Q2 - Which competitors are you losing deals to most often?
    "At WAGO, Zephyr Controls was increasingly our primary competitor in North America. They out-executed us on go-to-market and channel development."

    Q3 - How does your pricing compare to mid-market players?
    "WAGO and Zephyr are very close on pricing. The differentiation comes down to software ecosystem and local support -- areas where Zephyr has invested heavily."

    Q4 - Where are you investing in R&D over the next 2 years?
    "When I left, WAGO was all-in on Linux-based open runtimes and container orchestration on the edge. The belief was that open platforms would win long-term over proprietary ecosystems."

Please let us know which experts you would like to schedule, and we will coordinate availability.

Best regards,
AlphaView Research Team`

const SAMPLE_EML = `From: research-team@glg.com
To: project-team@deal.com
Subject: GLS Expert Recommendations - Project Atlas (Industrial Controls)
Date: Thu, 17 Jan 2025 10:15:00 +0000
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Hi team,

Please find below our expert recommendations for Project Atlas. Each profile includes responses to your screening questions.

---

EXPERT 1
Name: Laura Fischer
Type: Competitor
Title: Former COO, Zephyr Controls (departed November 2024)
Geography: Milwaukee, WI
Background: 21 years in industrial automation. Most recently COO at Zephyr Controls where she oversaw manufacturing, supply chain, and field operations for 7 years. Previously held senior operations roles at Stonemill Automation and Parker Hannifin.
Why relevant: Direct operational knowledge of the target's cost structure, manufacturing footprint, supply chain, and go-to-market model.
Compliance note: Left Zephyr Controls 2+ months ago. No active non-compete per Wisconsin law. Will need CID clearance given recency.
Hourly rate: USD 1,200
GLS Member ID: GLS-US-90102

Screening Responses (Competitor):
Q1 - How do you view the competitive landscape in industrial controls?
"Zephyr occupies a strong niche in the mid-market. The company competes primarily with Kestrel, Trilon, and WAGO, while trying to pull customers down from Stonemill. The value proposition is local service plus competitive pricing."

Q2 - Which competitors are you losing deals to most often?
"While I was there, Kestrel was the toughest competitor on technology. Trilon competed hard on price in automotive. Stonemill was difficult to displace in brownfield sites."

Q3 - How does your pricing compare to mid-market players?
"Zephyr typically prices 10-20% below Stonemill and roughly in line with Kestrel, but margins are protected by the service contract attach rate which runs around 65%."

Q4 - Where are you investing in R&D over the next 2 years?
"When I left, the roadmap priorities were Ethernet-APL I/O for process industries, a cloud-based engineering toolkit, and edge analytics modules. The R&D budget was growing about 15% YoY."

---

EXPERT 2
Name: James Achebe
Type: Customer
Title: Global Automation Manager, Brambleway Foods (multinational food manufacturer)
Geography: Toronto, Canada
Background: 18 years in food manufacturing. Manages global automation standards and vendor relationships across 22 plants in North America and Europe. $15M annual automation spend.
Why relevant: Large-scale multi-vendor customer with direct procurement experience across Zephyr Controls, Stonemill, and Siemens.
Compliance note: No conflicts. End-user only.
Hourly rate: USD 750
GLS Member ID: GLS-CA-88714

Screening Responses (Customer):
Q1 - Which vendors have you evaluated in the last 24 months?
"Stonemill is our global standard but we have been piloting Zephyr Controls in 3 plants for secondary lines. We also evaluated Kestrel for a new greenfield facility in Ontario."

Q2 - What drove your most recent vendor selection?
"For the Zephyr pilots, it was 30% cost savings on hardware plus their willingness to provide on-site commissioning support at no extra charge for the first year."

Q3 - How would you rate your satisfaction with your current vendor (1-10)?
"Stonemill is a 7 -- reliable but the cost keeps climbing. Zephyr is an 8 so far on the pilots, but it is early days."

Q4 - What would trigger you to switch providers?
"If Zephyr can demonstrate consistent performance across all 3 pilot plants over 18 months, we would consider them for our global approved vendor list."

---

EXPERT 3
Name: Tomoko Sato
Type: Competitor
Title: Director of Business Development, WAGO Corporation (Americas)
Geography: Germantown, WI
Background: 10 years at WAGO. Leads BD for industrial automation products across North and South America. Previously at Phoenix Contact in product management.
Compliance note: Currently employed at WAGO. Requires pre-screening.
Hourly rate: USD 900
GLS Member ID: GLS-US-91330

Screening Responses (Competitor):
Q1 - How do you view the competitive landscape in industrial controls?
"The mid-market is the most dynamic part of the controls industry right now. WAGO, Zephyr Controls, and Kestrel are all growing faster than the large incumbents. The customer base is looking for alternatives to Stonemill's pricing."

Q2 - Which competitors are you losing deals to most often?
"Zephyr Controls in food & beverage and general manufacturing. Kestrel in high-performance machine building. We differentiate on open standards and DIN-rail I/O density."

Q3 - How does your pricing compare to mid-market players?
"WAGO is generally in line with Zephyr on I/O pricing. They tend to win on the PLC/controller level where they have stronger software."

Q4 - Where are you investing in R&D over the next 2 years?
"Docker-based runtime environments on our controllers, expanded MQTT/OPC-UA connectivity, and compact safety I/O. We see the edge compute layer as key."

---

EXPERT 4
Name: Roberto Garza
Type: Customer
Title: Maintenance & Reliability Director, Cascadia Paper Products
Geography: Portland, OR
Background: 15 years in pulp & paper manufacturing. Responsible for automation reliability across 3 mills. Has evaluated and deployed systems from Stonemill, Zephyr Controls, and ABB.
Compliance note: Clear. No vendor advisory roles.
Hourly rate: USD 600
GLS Member ID: GLS-US-92008

Screening Responses (Customer):
Q1 - Which vendors have you evaluated in the last 24 months?
"ABB for our main DCS, Zephyr Controls for discrete PLC applications on packaging lines, and Stonemill for some legacy upgrades."

Q2 - What drove your most recent vendor selection?
"Zephyr was selected for the packaging line retrofit because their lead time was 6 weeks vs 14 weeks from Stonemill. In our industry, downtime costs $50K/hour so speed matters enormously."

Q3 - How would you rate your satisfaction with your current vendor (1-10)?
"Zephyr is a solid 8. Their tech support response time averages under 2 hours. ABB is a 7 on the DCS side. Stonemill is a 6 -- great products but support is slow."

Q4 - What would trigger you to switch providers?
"If Zephyr's support model degraded after growth or acquisition, that would be a red flag. We chose them specifically because they act like a partner, not a vendor."

Please confirm which experts you'd like to proceed with and we'll send calendar invitations.

Best,
GLS Research Team`

const SAMPLE_CSV = `Name,Title,Company,Industry,Network,Compliance,Rate_USD,Tags
Raj Patel,VP of Plant Engineering,Orion Packaging,Technology,FifthBridge,cleared,650,customer;multi-vendor;CPG;packaging
Laura Fischer,Former COO,Zephyr Controls,Technology,FifthBridge,pending,1200,competitor;target-company;operations;supply-chain
Henrik Larsson,VP Manufacturing,Kestrel Automation,Technology,FifthBridge,cleared,850,competitor;PC-based-control;Europe
Angela Moretti,Plant Manager,Cedarpoint Chemicals,Technology,FifthBridge,cleared,500,customer;process-industries;chemicals;safety
Nathan Cross,Former VP Product,Zephyr Controls,Technology,FifthBridge,pending,950,competitor;target-company;product-roadmap;R&D
Yuki Tanaka,Director of Automation,Nippon Precision Components,Technology,FifthBridge,cleared,700,customer;automotive-tier2;Japan-NA;precision
Derek Otieno,Head of Industrial Strategy,Turck Inc.,Technology,FifthBridge,pending,800,competitor;sensor-IO;fieldbus;connectivity
Priya Chakraborty,Engineering Manager,Atlas Cement Corp,Technology,FifthBridge,cleared,550,customer;heavy-industry;harsh-environment;cement`

const SAMPLE_TRANSCRIPT_RAJ = `CALL TRANSCRIPT -- Raj Patel, VP of Plant Engineering, Orion Packaging
Date: 14 November 2025 | Duration: 60 min | Network: AlphaView
NPS Score: 8

INTERVIEWER: Thank you for joining, Raj. Could you start by walking us through how Orion first evaluated Zephyr Controls?

RAJ PATEL: Sure. We began our evaluation roughly eighteen months ago when we needed to replace aging Stonemill PLCs across three of our packaging lines. Zephyr came onto our radar through an industry conference -- their demo of the real-time adaptive control loop was genuinely impressive compared to what we'd seen from incumbents.

INTERVIEWER: What were the key selection criteria for Orion?

RAJ PATEL: Three things drove it. First, total cost of ownership -- Zephyr's licensing model was roughly 30% lower over a five-year horizon compared to Stonemill and Siemens. Second, ease of integration with our existing SCADA layer. Third, and this was the clincher, their predictive maintenance module. We'd been losing about 12% of uptime annually on unplanned stoppages, and their analytics showed credible paths to cutting that by half.

INTERVIEWER: How has the rollout gone so far?

RAJ PATEL: We're about eight months in and we've completed two of the three lines. I'd say 80% positive. The initial integration was smoother than expected -- their API documentation is vastly better than what we experienced with Honeywell. The main friction point has been lead times on replacement IO modules. We had a six-week wait on a batch of analog input cards which held up Line 2 commissioning.

INTERVIEWER: Would you recommend Zephyr to a peer in your position?

RAJ PATEL: With caveats, yes. If your operation is mid-scale -- say 5 to 15 lines -- and you're not locked into a long-term Stonemill enterprise agreement, Zephyr is worth serious consideration. For very large plants with 50+ lines, I'd want to see more proof points on their scalability.

[END OF TRANSCRIPT]`

const SAMPLE_TRANSCRIPT_JAMES = `CALL TRANSCRIPT -- James Achebe, Global Automation Manager, Brambleway Foods
Date: 20 November 2025 | Duration: 45 min | Network: GLS
NPS Score: 7

INTERVIEWER: James, could you describe Brambleway's experience evaluating Zephyr Controls alongside Stonemill?

JAMES ACHEBE: Of course. Brambleway operates 22 food processing facilities globally and we've been on Stonemill ControlLogix for about fifteen years. When the time came to upgrade our batch control systems we ran a formal evaluation that included Stonemill, Siemens, and Zephyr.

INTERVIEWER: What set Zephyr apart in the evaluation?

JAMES ACHEBE: Two things. First, their batch recipe management module is best-in-class for food and beverage. Our process engineers could configure new product recipes in about 40% less time during the pilot. Second, their pricing model -- Stonemill wanted roughly $2.4M annually for a global enterprise agreement, Zephyr's per-site licensing came in at about $380K for four pilot sites.

INTERVIEWER: Were there concerns about switching from Stonemill?

JAMES ACHEBE: Absolutely. Our reliability engineering team was initially sceptical. We negotiated a 90-day proof-of-concept at our Charlotte facility running in parallel with Stonemill. System availability was 99.7% versus Stonemill's 99.8% -- well within tolerance. The Zephyr system also flagged two equipment anomalies that the Stonemill predictive module missed entirely.

INTERVIEWER: How is the broader rollout progressing?

JAMES ACHEBE: We've approved Zephyr for four pilot sites, two are fully cut over. The board has approved conditional expansion to eight additional sites pending a 12-month review.

[END OF TRANSCRIPT]`

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
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

function CopyButton({ text, label = "Copy to clipboard" }: { text: string; label?: string }) {
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
          {label}
        </>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Collapsible section                                                */
/* ------------------------------------------------------------------ */

function Collapsible({
  label,
  defaultOpen = false,
  children,
}: {
  label: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mt-3 rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
        />
        {label}
      </button>
      {open && <div className="border-t border-border px-4 py-3">{children}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step shell                                                         */
/* ------------------------------------------------------------------ */

function DemoStep({
  step,
  icon: Icon,
  title,
  summary,
  href,
  hrefLabel,
  children,
}: {
  step: number
  icon: typeof Upload
  title: string
  summary: string
  href: string
  hrefLabel: string
  children?: ReactNode
}) {
  return (
    <section className="mt-6">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
          {step}
        </span>
        <Icon className="h-4 w-4 text-primary/60" />
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <Link
          href={href}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {hrefLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        {summary}
      </p>
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DemoPage() {
  const [resetting, setResetting] = useState(false)

  function handleReset() {
    if (!window.confirm("Reset all demo data to its initial state? Any changes you have made will be lost.")) return
    setResetting(true)
    hardResetAll()
    // Small delay so the user sees the spinner before the page reloads
    setTimeout(() => window.location.reload(), 300)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Interactive Demo
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Walk through a DD scenario evaluating{" "}
              <strong className="text-foreground font-medium">Zephyr Controls</strong>{" "}
              (codename &ldquo;Project Atlas&rdquo;). Each step links to a live page
              -- expand sections below for detailed instructions and sample data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            <RotateCcw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? "Resetting..." : "Reset Demo Data"}
          </button>
        </div>
      </div>

      {/* Persistence note */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
        <p className="text-xs leading-relaxed text-sky-800">
          <span className="font-medium">Browser-only prototype.</span> Seed data
          is pre-loaded. Your changes persist in localStorage and survive
          reloads but will be lost if you clear site data.
        </p>
      </div>

      {/* ============================================================ */}
      {/*  STEP 1 -- Upload                                              */}
      {/* ============================================================ */}
      <DemoStep
        step={1}
        icon={Upload}
        title="Upload Expert Data"
        summary="Paste or upload unstructured expert profiles from any network (email body, .eml, or CSV) and the AI will parse, deduplicate, and standardise them."
        href="/upload"
        hrefLabel="Upload page"
      >
        <Collapsible label="Detailed instructions">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Three sample files below cover AlphaView (raw text, 5 experts), GLS (email, 4 experts), and FifthBridge (CSV, 8 experts)
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Two experts (Raj Patel, Laura Fischer) appear across multiple files to test deduplication
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Try the CSV first (instant parse), then paste the raw text or upload the .eml
            </li>
          </ul>
        </Collapsible>

        <Collapsible label="Sample data: Raw text (AlphaView, 15 experts)">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-48 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
            {SAMPLE_RAW_TEXT.slice(0, 500)}{"..."}
          </pre>
          <div className="mt-2">
            <CopyButton text={SAMPLE_RAW_TEXT} label="Copy full text" />
          </div>
        </Collapsible>

        <Collapsible label="Sample data: Email file (GLS, 4 experts)">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-48 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
            {SAMPLE_EML.slice(0, 400)}{"..."}
          </pre>
          <div className="mt-2">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(SAMPLE_EML, "glg-recommendations-project-atlas.eml", "message/rfc822")
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              <Download className="h-3 w-3" />
              Download .eml
            </button>
          </div>
        </Collapsible>

        <Collapsible label="Sample data: CSV spreadsheet (FifthBridge, 8 experts)">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-48 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
            {SAMPLE_CSV}
          </pre>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(SAMPLE_CSV, "third-bridge-project-atlas.csv", "text/csv")
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              <Download className="h-3 w-3" />
              Download .csv
            </button>
            <CopyButton text={SAMPLE_CSV} label="Copy CSV" />
          </div>
        </Collapsible>
      </DemoStep>

      <div className="mt-6 border-t border-border" />

      {/* ============================================================ */}
      {/*  STEP 2 -- Review                                              */}
      {/* ============================================================ */}
      <DemoStep
        step={2}
        icon={Heart}
        title="Review Expert Profiles"
        summary="Swipe through experts one at a time to shortlist, discard, or defer -- a focused review flow so nothing slips through the cracks."
        href="/review"
        hrefLabel="Review page"
      >
        <Collapsible label="Detailed instructions">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Card-based interface: shortlist, discard, or review later with one click or keyboard shortcut
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Full profile detail on each card -- background, screener answers, compliance flags, network pricing
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Decisions sync back to the main expert database and carry through to the Experts table
            </li>
          </ul>
        </Collapsible>
      </DemoStep>

      <div className="mt-6 border-t border-border" />

      {/* ============================================================ */}
      {/*  STEP 3 -- All Experts                                         */}
      {/* ============================================================ */}
      <DemoStep
        step={3}
        icon={Users}
        title="View & Search Experts"
        summary="Browse the full expert table with lens-based views (Customer / Competitor / Target), or use the AI-powered natural-language search to find the right profile."
        href="/experts"
        hrefLabel="Experts table"
      >
        <Collapsible label="Detailed instructions">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Try the &ldquo;Find Expert&rdquo; button and describe what you need in plain English
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Run a CID check on target-company experts -- the system searches a mock conflict database and lets you submit an approval request
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Toggle between external experts and the Bain Advisor Network (BAN) advisor pool
            </li>
          </ul>
        </Collapsible>
      </DemoStep>

      <div className="mt-6 border-t border-border" />

      {/* ============================================================ */}
      {/*  STEP 4 -- Calls                                               */}
      {/* ============================================================ */}
      <DemoStep
        step={4}
        icon={Phone}
        title="Schedule Calls & Track Spend"
        summary="Log scheduled calls -- expert details auto-populate from the database, and live budget roll-ups cover scheduled, completed, and cancelled engagements."
        href="/calls"
        hrefLabel="Calls page"
      >
        <Collapsible label="Detailed instructions">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Add calls by typing an expert name -- the system auto-suggests and populates all fields
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Follow-ups are auto-detected when the same expert is contacted through the same network more than once
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Seed data includes 8 calls across different statuses and networks
            </li>
          </ul>
        </Collapsible>
      </DemoStep>

      <div className="mt-6 border-t border-border" />

      {/* ============================================================ */}
      {/*  STEP 5 -- AI Surveys                                          */}
      {/* ============================================================ */}
      <DemoStep
        step={5}
        icon={Building2}
        title="AI Surveys"
        summary="AI interview surveys tracked separately from calls with EUR-denominated flat fees -- same auto-population and lens views, adapted for survey-specific fields."
        href="/ai-surveys"
        hrefLabel="Surveys page"
      >
        <Collapsible label="Detailed instructions">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Separate workspace for AI interview billing with flat fees
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Seed data includes 5 surveys across completed, invited, and cancelled statuses
            </li>
          </ul>
        </Collapsible>
      </DemoStep>

      <div className="mt-6 border-t border-border" />

      {/* ============================================================ */}
      {/*  STEP 6 -- Transcripts                                         */}
      {/* ============================================================ */}
      <DemoStep
        step={6}
        icon={Brain}
        title="Upload Transcripts & Extract KPIs"
        summary="Upload call transcripts from the Calls page -- AI generates summaries and extracts KPIs (e.g. NPS scores) that flow into the dashboard automatically."
        href="/calls"
        hrefLabel="Calls page"
      >
        <Collapsible label="Detailed instructions">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Click &ldquo;Upload Transcript&rdquo; on a completed call to paste or upload the text
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Completed calls with transcripts show a green &ldquo;View Transcript&rdquo; button instead
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              NPS score in the header is extracted and linked to the engagement record
            </li>
          </ul>
        </Collapsible>

        <Collapsible label="Sample transcript: Raj Patel (Customer, NPS 8)">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-36 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
            {SAMPLE_TRANSCRIPT_RAJ.slice(0, 400)}{"..."}
          </pre>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(SAMPLE_TRANSCRIPT_RAJ, "transcript-raj-patel.txt", "text/plain")
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              <Download className="h-3 w-3" />
              Download .txt
            </button>
            <CopyButton text={SAMPLE_TRANSCRIPT_RAJ} label="Copy transcript" />
          </div>
        </Collapsible>

        <Collapsible label="Sample transcript: James Achebe (Customer, NPS 7)">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80 font-mono max-h-36 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
            {SAMPLE_TRANSCRIPT_JAMES.slice(0, 400)}{"..."}
          </pre>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(SAMPLE_TRANSCRIPT_JAMES, "transcript-james-achebe.txt", "text/plain")
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              <Download className="h-3 w-3" />
              Download .txt
            </button>
            <CopyButton text={SAMPLE_TRANSCRIPT_JAMES} label="Copy transcript" />
          </div>
        </Collapsible>
      </DemoStep>

      <div className="mt-6 border-t border-border" />

      {/* ============================================================ */}
      {/*  STEP 7 -- Sources List (NEW)                                  */}
      {/* ============================================================ */}
      <DemoStep
        step={7}
        icon={EyeOff}
        title="Anonymised Sources List"
        summary="Review and export anonymised expert titles for sources slides -- companies are labelled as Customer #1, Competitor #2, etc. and roles show Former where applicable."
        href="/sources"
        hrefLabel="Sources page"
      >
        <Collapsible label="Detailed instructions">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Table shows real identity on the left and anonymised values on the right
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Company numbers are assigned first-come-first-served by earliest engagement date
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Filter by type (Customers, Competitors, etc.) and copy each sub-list as bullet points for PowerPoint
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Target-company experts are labelled as Competitors (never &ldquo;Target&rdquo;) for safe external sharing
            </li>
          </ul>
        </Collapsible>
      </DemoStep>

      <div className="mt-6 border-t border-border" />

      {/* ============================================================ */}
      {/*  STEP 8 -- Transcript Search                                   */}
      {/* ============================================================ */}
      <DemoStep
        step={8}
        icon={SearchIcon}
        title="Search Transcripts"
        summary="Query across your transcripts with natural language -- filter by expert type or company first, then ask for quotes to support slide arguments."
        href="/transcripts"
        hrefLabel="Transcripts page"
      >
        <Collapsible label="Detailed instructions">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Browse call and AI survey transcripts with source toggles and expert-type filters
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Live NPS KPI cards computed from survey transcript data
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Try asking &ldquo;Find me quotes about pricing&rdquo; across the seed transcripts
            </li>
          </ul>
        </Collapsible>
      </DemoStep>

      <div className="mt-6 border-t border-border" />

      {/* ============================================================ */}
      {/*  STEP 9 -- Dashboard                                           */}
      {/* ============================================================ */}
      <DemoStep
        step={9}
        icon={FileBarChart}
        title="Dashboard & Reporting"
        summary="Live budget roll-ups, upcoming schedule with copy-to-clipboard, spend-by-status breakdowns, and structured reconciliation tables for network settlement."
        href="/dashboard"
        hrefLabel="Dashboard"
      >
        <Collapsible label="Detailed instructions">
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Upcoming schedule shows call times and lets you copy the list as bullet points for emails
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Expert-type breakdown showing customer, competitor, and target counts
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
              Review budget roll-ups and explore the spend breakdown by status and type
            </li>
          </ul>
        </Collapsible>
      </DemoStep>

      {/* Bottom nav */}
      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
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
