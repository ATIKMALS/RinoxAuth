import { Activity, TrendingUp, Users, Zap } from "lucide-react";
import { api } from "@/services/api";
import type { DashboardStats } from "@/lib/types";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

async function loadStats(): Promise<DashboardStats> {
  const fallback: DashboardStats = {
    requests_today: 0,
    active_users: 0,
    failed_logins: 0,
    success_rate: 0,
  };
  try {
    const raw = await api.get<DashboardStats>("/api/dashboard/stats");
    if (raw && typeof raw === "object" && "requests_today" in raw) {
      return { ...fallback, ...raw };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function DashboardStatsBar() {
  const stats = await loadStats();
  const requests = stats.requests_today ?? 0;
  const usersCount = stats.total_users ?? stats.active_users ?? 0;

  const statsRow = [
    {
      label: "CPU",
      value: "—",
      icon: Activity,
      bars: [30, 45, 25, 60, 35, 50, 40] as const,
      barClass: "bg-emerald-400",
      iconWrap: "bg-emerald-500/10",
      iconClass: "text-emerald-400",
      foot: null as string | null,
    },
    {
      label: "Memory",
      value: "—",
      icon: Zap,
      bars: [40, 35, 50, 45, 55, 40, 48] as const,
      barClass: "bg-amber-400",
      iconWrap: "bg-amber-500/10",
      iconClass: "text-amber-400",
      foot: null,
    },
    {
      label: "Requests",
      value: formatCount(requests),
      icon: TrendingUp,
      bars: [20, 40, 30, 60, 45, 70, 55] as const,
      barClass: "bg-indigo-400",
      iconWrap: "bg-indigo-500/10",
      iconClass: "text-indigo-400",
      foot: "Live from dashboard API",
    },
    {
      label: "Users",
      value: formatCount(usersCount),
      icon: Users,
      bars: [50, 45, 60, 55, 70, 65, 80] as const,
      barClass: "bg-violet-400",
      iconWrap: "bg-violet-500/10",
      iconClass: "text-violet-400",
      foot: "Total registered users",
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {statsRow.map((stat) => (
        <div
          key={stat.label}
          className="glass-panel group relative cursor-default overflow-hidden rounded-xl p-3 transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/25 hover:shadow-[0_0_28px_-8px_rgba(99,102,241,0.45)]"
        >
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-600/10" />
          </div>
          <div className="absolute top-0 right-0 h-full w-20 opacity-25 transition-opacity group-hover:opacity-45">
            <div className="flex h-full items-end justify-between gap-[2px] px-1 py-2">
              {stat.bars.map((height, i) => (
                <div key={i} className={`w-1 rounded-t-sm ${stat.barClass}`} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
              <p className="mt-0.5 bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-lg font-bold text-transparent">
                {stat.value}
              </p>
              {stat.foot && <p className="mt-0.5 text-[9px] text-zinc-600">{stat.foot}</p>}
            </div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconWrap}`}>
              <stat.icon className={`h-4 w-4 ${stat.iconClass}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
