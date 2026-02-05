import { Database, Users, Shield, Bell } from "lucide-react"
import PageHeader from "../components/page-header"

const sections = [
  {
    icon: Database,
    title: "Data Sources",
    desc: "Configure connected expert networks, API keys, and import schedules.",
    items: ["GLG Integration", "AlphaSights Integration", "Third Bridge Integration", "Custom CSV Mapping"],
  },
  {
    icon: Users,
    title: "Team & Access",
    desc: "Manage team members, roles, and permissions for the workspace.",
    items: ["Team Members (4)", "Role Permissions", "Invite Link"],
  },
  {
    icon: Shield,
    title: "Compliance",
    desc: "Set clearance rules, conflict-of-interest checks, and approval workflows.",
    items: ["Auto-clearance Rules", "Blocked Companies List", "Approval Workflow"],
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Configure email and in-app notification preferences.",
    items: ["Email Alerts", "Call Reminders", "Survey Deadlines", "Compliance Flags"],
  },
]

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Settings"
        description="Configure project parameters, integrations, team access, and compliance rules."
      />

      <div className="mt-6 flex flex-col gap-4">
        {sections.map(({ icon: Icon, title, desc, items }) => (
          <div key={title} className="rounded-lg border border-border bg-card">
            <div className="flex items-start gap-3 border-b border-border px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{desc}</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-foreground">{item}</span>
                  <button
                    type="button"
                    className="h-7 rounded-md border border-border bg-background px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Configure
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-[11px] text-muted-foreground">
          Settings are display-only in this prototype. Configuration changes will not persist.
        </p>
      </div>
    </div>
  )
}
