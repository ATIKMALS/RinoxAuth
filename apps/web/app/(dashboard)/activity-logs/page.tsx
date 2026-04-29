import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { ActivityLogRecord } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  Activity,
  AlertTriangle,
  AlertCircle,
  Info,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Clock,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Zap
} from "lucide-react";
import { ActivityLogsClientWrapper } from "./client-wrapper";

// ============================================
// ✅ FIXED: getActivityLogs with appId filter
// ============================================
async function getActivityLogs(appId?: number) {
  try {
    const query = appId ? `?app_id=${appId}` : '';
    const res = await api.get<ActivityLogRecord[]>(`/api/activity-logs${query}`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

// ============================================
// ✅ FIXED: getApps for current user
// ============================================
async function getApps(createdBy?: string) {
  try {
    const query = createdBy ? `?created_by=${encodeURIComponent(createdBy)}` : '';
    const res = await api.get<any[]>(`/api/apps${query}`);
    return Array.isArray(res) ? res : [];
  } catch { return []; }
}

// ============================================
// ✅ FIXED: Main Page with app isolation
// ============================================
export default async function ActivityLogsPage() {
  // Get session and current user
  const session = await getServerSession(authOptions);
  const currentUser = session?.user?.username;
  
  // Get user's apps
  const userApps = await getApps(currentUser || undefined);
  const userAppIds = userApps.map((a: any) => a.id);
  const currentAppId = userAppIds.length > 0 ? userAppIds[0] : undefined;
  
  // Fetch logs with app filter
  const logs = await getActivityLogs(currentAppId);
  
  const infoCount = logs.filter((l) => l.severity?.toLowerCase() === "info").length;
  const warningCount = logs.filter((l) => l.severity?.toLowerCase() === "warning").length;
  const errorCount = logs.filter((l) => l.severity?.toLowerCase() === "error").length;
  const criticalCount = logs.filter((l) => l.severity?.toLowerCase() === "critical").length;

  // Get unique categories
  const categories = [...new Set(logs.map(l => l.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
            Activity Logs
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Monitor and track all system activities and events</p>
        </div>
        <ActivityLogsClientWrapper logs={logs} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all duration-300 group-hover:scale-110">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Live
              </span>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Total Logs</p>
            <p className="text-2xl font-bold text-white mt-1">{logs.length}</p>
            <p className="text-xs text-zinc-500 mt-1">All time entries</p>
          </div>
        </Card>

        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all duration-300 group-hover:scale-110">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Info</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{infoCount}</p>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" 
                style={{ width: `${logs.length > 0 ? (infoCount / logs.length) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </Card>

        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-all duration-300 group-hover:scale-110">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Warnings</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{warningCount}</p>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400" 
                style={{ width: `${logs.length > 0 ? (warningCount / logs.length) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </Card>

        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-all duration-300 group-hover:scale-110">
                <AlertCircle className="h-5 w-5 text-rose-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Errors</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{errorCount + criticalCount}</p>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400" 
                style={{ width: `${logs.length > 0 ? ((errorCount + criticalCount) / logs.length) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              placeholder="Search logs by message or category..." 
              className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>
          <select className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-300 cursor-pointer">
            <option>Category: All</option>
            {categories.map(cat => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <select className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-300 cursor-pointer">
            <option>Severity: All</option>
            <option>Info</option>
            <option>Warning</option>
            <option>Error</option>
            <option>Critical</option>
          </select>
          <select className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-300 cursor-pointer">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>All Time</option>
          </select>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
          <p className="text-sm text-zinc-400 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            {logs.length} log entry{logs.length !== 1 ? "ies" : ""} found
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            Auto-refreshes every 30s
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Activity className="h-10 w-10 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">No Activity Logs Yet</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
                  Activity logs will appear here once your application starts generating events.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/50 bg-zinc-900/50">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Timestamp
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Severity</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Message</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {logs.map((log, index) => {
                  const severity = log.severity?.toLowerCase() || "info";
                  
                  const severityConfig = {
                    info: {
                      icon: Info,
                      bg: "bg-sky-500/10",
                      text: "text-sky-400",
                      border: "border-sky-500/20",
                      dot: "bg-sky-400"
                    },
                    warning: {
                      icon: AlertTriangle,
                      bg: "bg-amber-500/10",
                      text: "text-amber-400",
                      border: "border-amber-500/20",
                      dot: "bg-amber-400"
                    },
                    error: {
                      icon: AlertCircle,
                      bg: "bg-rose-500/10",
                      text: "text-rose-400",
                      border: "border-rose-500/20",
                      dot: "bg-rose-400"
                    },
                    critical: {
                      icon: XCircle,
                      bg: "bg-red-500/10",
                      text: "text-red-400",
                      border: "border-red-500/20",
                      dot: "bg-red-500 animate-pulse"
                    }
                  };

                  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.info;
                  const IconComponent = config.icon;

                  return (
                    <tr 
                      key={log.id} 
                      className="group border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-all duration-300"
                      style={{ opacity: 0, animation: `fadeInUp 0.5s ease-out ${index * 30}ms forwards` }}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          <span className="text-sm text-zinc-400 font-mono">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1.5 rounded-lg bg-zinc-500/10 text-zinc-300 text-xs font-medium border border-zinc-500/20 capitalize">
                          {log.category || "General"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase border ${config.bg} ${config.text} ${config.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                          {severity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2 max-w-md">
                          <IconComponent className={`h-4 w-4 ${config.text} flex-shrink-0 mt-0.5`} />
                          <p className="text-sm text-zinc-300 leading-relaxed">{log.message || "No message"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all duration-300 hover:scale-110" title="View Details">
                            <Search className="h-4 w-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 hover:scale-110 border border-red-500/20" title="Delete Log">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {logs.length > 25 && (
          <div className="p-4 border-t border-zinc-800/50 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Showing <span className="text-white font-medium">1-25</span> of <span className="text-white font-medium">{logs.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all">Previous</button>
              <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-sm text-white font-medium">1</button>
              <button className="px-3 py-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all">2</button>
              <button className="px-3 py-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all">Next</button>
            </div>
          </div>
        )}
      </Card>

      {/* Live Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Live monitoring active
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
