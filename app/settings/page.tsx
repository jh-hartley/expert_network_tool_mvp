import { Settings, Database, Users, Shield, Bell } from "lucide-react"
import PageHeader from "../components/page-header"

const settingSections = [
  {
    icon: Database,
    title: "Data Sources",
    description: "Configure connected expert networks, API keys, and import schedules.",
    items: ["GLG Integration", "AlphaSights Integration", "Third Bridge Integration", "Custom CSV Mapping"],
  },
  {
    icon: Users,
    title: "Team & Access",
    description: "Manage team members, roles, and permissions for the workspace.",
    items: ["Team Members (4)", "Role Permissions", "Invite Link"],
  },
  {
    icon: Shield,
    title: "Compliance",
    description: "Set clearance rules, conflict-of-interest checks, and approval workflows.",
    items: ["Auto-clearance Rules", "Blocked Companies List", "Approval Workflow"],
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure email and in-app notification preferences.",
    items: ["Email Alerts", "Call Reminders", "Survey Deadlines", "Compliance Flags"],
  },
]

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Settings"
        description="Configure project parameters, integrations, team access, and compliance rules."
      />

      <div className="mt-8 flex flex-col gap-6">
        {settingSections.map(({ icon: Icon, title, description, items }) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-card"
          >
            <div className="flex items-start gap-4 border-b border-border p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <span className="text-sm text-foreground">{item}</span>
                  <button
                    type="button"
                    className="h-7 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Configure
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground">
          Settings are display-only in this prototype. Configuration changes will
          not persist.
        </p>
      </div>
    </div>
  )
}
