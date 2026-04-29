import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { AnalyticsRecord } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ExportCsvButton } from "@/components/ui/export-csv-button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Key, 
  Activity, 
  BarChart3,
  Target,
  RefreshCw,
  Eye,
} from "lucide-react";

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color,
  subtitle 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  trend?: "up" | "down" | "neutral"; 
  icon: any; 
  color: string;
  subtitle?: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;
  
  return (
    <Card className="card-hover-effect relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-${color}-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-zinc-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center group-hover:bg-${color}-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-${color}-500/20`}>
            <Icon className={`h-6 w-6 text-${color}-400`} />
          </div>
          {trend && TrendIcon && (
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
              trend === "up" 
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
                : trend === "down"
                ? "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                : "text-zinc-400 bg-zinc-500/10 border border-zinc-500/20"
            }`}>
              <TrendIcon className="h-3.5 w-3.5" />
              {change}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm text-zinc-400 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300 origin-left">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-1.5">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-end gap-1 mt-3 h-8">
          {[60, 45, 75, 50, 80, 65, 90].map((height, i) => (
            <div 
              key={i}
              className={`flex-1 rounded-t-sm bg-gradient-to-t from-${color}-500/40 to-${color}-400 transition-all duration-300 group-hover:from-${color}-500/60 group-hover:to-${color}-400/80`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================
function ProgressBar({ 
  label, 
  value, 
  max, 
  color 
}: { 
  label: string; 
  value: number; 
  max: number; 
  color: string;
}) {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-sm font-semibold text-white">{value.toLocaleString()}</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r from-${color}-500 to-${color}-400 transition-all duration-1000 ease-out group-hover:from-${color}-400 group-hover:to-${color}-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500 mt-1">{percentage}% of total</p>
    </div>
  );
}

// ============================================
// ACTIVITY ITEM COMPONENT
// ============================================
function ActivityItem({ 
  icon: Icon, 
  title, 
  time, 
  type 
}: { 
  icon: any; 
  title: string; 
  time: string; 
  type: "success" | "warning" | "info" | "error";
}) {
  const colors = {
    success: "emerald",
    warning: "amber",
    info: "indigo",
    error: "rose"
  };
  
  return (
    <div className="flex items-center gap-3 py-3 group hover:bg-zinc-800/30 rounded-lg px-3 -mx-3 transition-all duration-300">
      <div className={`w-9 h-9 rounded-full bg-${colors[type]}-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`h-4 w-4 text-${colors[type]}-400`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{time}</p>
      </div>
      <div className={`w-2 h-2 rounded-full bg-${colors[type]}-400 flex-shrink-0`} />
    </div>
  );
}

// ============================================
// ✅ DATA FETCHING - app_id অটোমেটিক কুকি থেকে যাবে
// ============================================
async function getAnalytics() {
  try {
    // api.analytics.get() অটোমেটিক কুকি থেকে app_id এড করবে
    const res = await api.analytics.get();
    if (res && typeof res === "object" && "total_users" in res) return res;
    return null;
  } catch {
    return null;
  }
}

async function getActivityLogs() {
  try {
    // api.activity.list() অটোমেটিক কুকি থেকে app_id এড করবে
    const res = await api.activity.list();
    const list = Array.isArray(res) ? res : [];
    return list.slice(0, 5);
  } catch {
    return [];
  }
}

async function getUsers() {
  try {
    // api.users.list() অটোমেটিক কুকি থেকে app_id এড করবে
    const res = await api.users.list();
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

async function getApps(createdBy?: string) {
  try {
    const params = createdBy ? { created_by: createdBy } : undefined;
    const res = await api.apps.list(params);
    return Array.isArray(res) ? res : [];
  } catch { return []; }
}

// ============================================
// ✅ MAIN PAGE - অটোমেটিক app_id ফিল্টারিং
// ============================================
export default async function AnalyticsPage() {
  // Get session and current user
  const session = await getServerSession(authOptions);
  const currentUser = session?.user?.username;
  
  // Get user's apps
  const userApps = await getApps(currentUser || undefined);
  
  // ✅ ডাটা ফেচ করো - api.ts অটোমেটিক app_id এড করবে
  const [analytics, recentActivity, users] = await Promise.all([
    getAnalytics(),
    getActivityLogs(),
    getUsers()
  ]);

  // Calculate derived metrics
  const totalUsers = users.length;
  const activeUsers = users.filter((u: any) => u.status === "active").length;
  const activeLicenses = analytics?.active_licenses ?? 0;
  const totalLicenses = (analytics?.active_licenses ?? 0) + (analytics?.expired_licenses ?? 0);
  const loginActivity = analytics?.login_activity_24h ?? 0;
  const successRate = analytics?.success_rate ?? 99.8;
  const failedLogins = analytics?.failed_logins ?? 0;

  // Device distribution
  const deviceData = {
    desktop: Math.round(totalUsers * 0.55),
    mobile: Math.round(totalUsers * 0.30),
    tablet: Math.round(totalUsers * 0.15),
  };

  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  const analyticsExportFilename = `analytics-report-${new Date().toISOString().slice(0, 10)}.csv`;
  const analyticsExportHeaders = ["Metric", "Value"];
  const analyticsExportRows = [
    ["Total users", totalUsers],
    ["Active users", activeUsers],
    ["Active licenses", activeLicenses],
    ["Total licenses (active + expired)", totalLicenses],
    ["Login activity (24h)", loginActivity],
    ["Success rate %", successRate],
    ["Failed logins", failedLogins],
    ["Desktop (est.)", deviceData.desktop],
    ["Mobile (est.)", deviceData.mobile],
    ["Tablet (est.)", deviceData.tablet],
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
            </div>
            Analytics Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Performance overview for {currentMonth}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-1 backdrop-blur-sm">
            {["7D", "30D", "90D", "1Y", "ALL"].map((period) => (
              <button
                key={period}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  period === "30D"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          
          <ExportCsvButton
            filename={analyticsExportFilename}
            headers={analyticsExportHeaders}
            rows={analyticsExportRows}
            label="Export Report"
          />
          
          <button className="p-2.5 rounded-xl border border-zinc-700/50 bg-zinc-800/50 text-zinc-400 hover:text-white transition-all duration-300">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          change="12.5%"
          trend="up"
          icon={Users}
          color="indigo"
          subtitle={`${activeUsers} active`}
        />
        <StatCard
          title="Active Licenses"
          value={activeLicenses.toLocaleString()}
          change="8.3%"
          trend="up"
          icon={Key}
          color="emerald"
          subtitle={`Out of ${totalLicenses} total`}
        />
        <StatCard
          title="Login Activity (24h)"
          value={loginActivity.toLocaleString()}
          change="2.1%"
          trend="down"
          icon={Activity}
          color="sky"
          subtitle={`${failedLogins} failed attempts`}
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          change="0.5%"
          trend="up"
          icon={Target}
          color="violet"
          subtitle="Request success rate"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">User Growth Timeline</h2>
              <p className="text-sm text-zinc-400 mt-1">Monthly user acquisition</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-end gap-3 h-48">
              {analytics?.user_growth && analytics.user_growth.length > 0 ? (
                analytics.user_growth.map((point: any, idx: number) => (
                  <div key={point.label || idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex flex-col items-center gap-1">
                      <div className="w-full relative">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300 group-hover:from-indigo-500 group-hover:to-indigo-300"
                          style={{ height: `${Math.min((point.value / (totalUsers || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500">{point.label}</span>
                  </div>
                ))
              ) : (
                <div className="w-full flex items-center justify-center h-full">
                  <p className="text-zinc-500 text-sm">No growth data available yet</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">License Distribution</h2>
          <div className="space-y-6">
            <ProgressBar label="Starter" value={12} max={totalLicenses || 1} color="indigo" />
            <ProgressBar label="Professional" value={5} max={totalLicenses || 1} color="emerald" />
            <ProgressBar label="Enterprise" value={2} max={totalLicenses || 1} color="amber" />
            <ProgressBar label="Trial" value={activeLicenses} max={totalLicenses || 1} color="violet" />
          </div>
        </Card>
      </div>

      {/* Recent Activity & Performance */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity: any, idx: number) => (
                <ActivityItem
                  key={activity.id || idx}
                  icon={Activity}
                  title={activity.message || "Activity event"}
                  time={activity.created_at || "Recently"}
                  type={activity.severity === "error" ? "error" : activity.severity === "warning" ? "warning" : "success"}
                />
              ))
            ) : (
              <>
                <ActivityItem icon={Eye} title="Dashboard viewed" time="Just now" type="info" />
                <ActivityItem icon={Users} title="New user registered" time="15 min ago" type="success" />
                <ActivityItem icon={Activity} title="System health check passed" time="2 hours ago" type="success" />
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Performance Metrics</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-400">System Uptime</span>
                <span className="text-sm font-semibold text-emerald-400">99.99%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800">
                <div className="h-full w-[99.99%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-zinc-400">Avg Response Time</span>
                <span className="text-sm font-semibold text-indigo-400">45ms</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800">
                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
