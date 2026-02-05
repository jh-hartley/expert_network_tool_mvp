import {
  Users,
  UserPlus,
  Copy,
  Phone,
  PhoneOff,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Clock,
  Upload,
  UserCheck,
} from "lucide-react"
import PageHeader from "../components/page-header"
import StatCard from "../components/stat-card"

const recentActivity = [
  { icon: Upload, text: "Uploaded 12 expert profiles from GLG export", time: "2 hours ago" },
  { icon: UserCheck, text: "Dr. Sarah Chen cleared for Project Alpha", time: "3 hours ago" },
  { icon: Phone, text: "Call completed with James Rivera (45 min)", time: "5 hours ago" },
  { icon: Copy, text: "3 duplicate profiles flagged for review", time: "Yesterday" },
  { icon: ClipboardList, text: "AI survey sent to 8 experts on battery tech", time: "Yesterday" },
  { icon: ShieldAlert, text: "Compliance hold on Mark Thompson -- pending review", time: "2 days ago" },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Overview"
        description="High-level metrics and recent activity across the expert network."
      />

      {/* Expert stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Experts" value={247} change="+12 this week" changeType="positive" icon={Users} />
        <StatCard label="New This Week" value={12} change="from 3 uploads" changeType="neutral" icon={UserPlus} />
        <StatCard label="Duplicates Flagged" value={8} change="3 pending" changeType="negative" icon={Copy} />
        <StatCard label="Cleared" value={189} change="76% rate" changeType="positive" icon={ShieldCheck} />
      </div>

      {/* Calls + Spend */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Calls This Week" value={14} change="6 scheduled" changeType="neutral" icon={Phone} />
        <StatCard label="Cancelled" value={2} changeType="negative" icon={PhoneOff} />
        <StatCard label="Spend (Actual)" value="$18,400" change="72% of forecast" changeType="positive" icon={DollarSign} />
        <StatCard label="Spend (Forecast)" value="$25,500" change="$7,100 remaining" changeType="neutral" icon={TrendingUp} />
      </div>

      {/* Compliance + Surveys */}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <StatCard label="Compliance Blocked" value={3} change="requires attention" changeType="negative" icon={ShieldAlert} />
        <StatCard label="Surveys Completed" value={24} change="avg NPS: 72" changeType="positive" icon={ClipboardList} />
        <StatCard label="Surveys Pending" value={8} change="sent 2 days ago" changeType="neutral" icon={Clock} />
      </div>

      {/* Activity feed */}
      <div className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Recent Activity
        </h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {recentActivity.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="flex-1 text-sm text-foreground">{item.text}</p>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
