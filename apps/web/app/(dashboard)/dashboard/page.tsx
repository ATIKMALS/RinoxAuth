import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { AppRecord, DashboardStats, LicenseRecord, UserRecord } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { 
  Plus, 
  Activity, 
  ShieldCheck, 
  Users, 
  KeyRound,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
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
  color 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  trend?: "up" | "down"; 
  icon: any; 
  color: string;
}) {
  return (
    <Card className="card-hover-effect relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-${color}-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-zinc-400 flex items-center gap-2">
            <Icon className={`h-4 w-4 text-${color}-400`} />
            {title}
          </p>
          {trend && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${
              trend === "up" ? "text-emerald-400" : "text-rose-400"
            }`}>
              {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change}
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <Clock className="h-3 w-3" />
          <span>Updated just now</span>
        </div>
      </div>
    </Card>
  );
}

// ============================================
// QUICK ACTION COMPONENT
// ============================================
function QuickAction({ href, label, icon: Icon, color }: { href: string; label: string; icon: any; color: string }) {
  return (
    <Link 
      href={href as never} 
      className={`flex items-center gap-3 rounded-xl border border-${color}-500/20 bg-${color}-500/10 px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-${color}-500/20 hover:border-${color}-500/30 hover:shadow-lg hover:shadow-${color}-500/10 group`}
    >
      <Icon className={`h-4 w-4 text-${color}-400 group-hover:scale-110 transition-transform duration-300`} />
      {label}
      <ArrowUpRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
    </Link>
  );
}

// ============================================
// ACTIVITY ITEM COMPONENT
// ============================================
function ActivityItem({ title, description, time, type }: { title: string; description: string; time: string; type: "success" | "warning" | "error" | "info" }) {
  const colors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    info: "bg-sky-500"
  };
  
  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Activity
  };
  
  const Icon = icons[type];

  return (
    <div className="flex items-start gap-3 py-3 group hover:bg-zinc-800/30 rounded-lg px-2 transition-all duration-300">
      <div className={`w-8 h-8 rounded-full ${colors[type]}/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`h-4 w-4 text-${type === "success" ? "emerald" : type === "warning" ? "amber" : type === "error" ? "rose" : "sky"}-400`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">{title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
      </div>
      <span className="text-xs text-zinc-500 flex-shrink-0">{time}</span>
    </div>
  );
}

// ============================================
// ✅ FIXED: getStats with appId filter
// ============================================
async function getStats(appId?: number) {
  const defaults: DashboardStats = {
    requests_today: 0,
    active_users: 0,
    failed_logins: 0,
    success_rate: 0,
  };
  try {
    const query = appId ? `?app_id=${appId}` : '';
    const res = await api.get<DashboardStats>(`/api/dashboard/stats${query}`);
    if (res && typeof res === "object" && "requests_today" in res) {
      return { ...defaults, ...res };
    }
    return defaults;
  } catch {
    return defaults;
  }
}

// ============================================
// ✅ FIXED: getSnapshot with appId filter
// ============================================
async function getSnapshot(appId?: number) {
  const [apps, users, licenses] = await Promise.all([
    api.get<AppRecord[]>("/api/apps"),
    api.get<UserRecord[]>(`/api/users${appId ? `?app_id=${appId}` : ''}`),
    api.get<LicenseRecord[]>(`/api/licenses${appId ? `?app_id=${appId}` : ''}`),
  ]);

  return {
    apps: Array.isArray(apps) ? apps : [],
    users: Array.isArray(users) ? users : [],
    licenses: Array.isArray(licenses) ? licenses : [],
  };
}

// ============================================
// ✅ FIXED: Main Dashboard Page with app isolation
// ============================================
export default async function DashboardPage() {
  // Get session and current user
  const session = await getServerSession(authOptions);
  const currentUser = session?.user?.username;
  
  // Get user's apps
  const appsRes = await api.get<AppRecord[]>("/api/apps");
  const allApps = Array.isArray(appsRes) ? appsRes : [];
  const userApps = currentUser 
    ? allApps.filter((a: any) => a.created_by === currentUser || !a.created_by)
    : allApps;
  const userAppIds = userApps.map((a: any) => a.id);
  const currentAppId = userAppIds.length > 0 ? userAppIds[0] : undefined;

  // Fetch data with app filter
  const [stats, snapshot] = await Promise.all([
    getStats(currentAppId), 
    getSnapshot(currentAppId)
  ]);
  
  // Filter snapshot data by user's apps
  const filteredUsers = snapshot.users.filter((u: any) => 
    userAppIds.includes(u.application_id) || !u.application_id
  );
  const filteredLicenses = snapshot.licenses.filter((l: any) => 
    userAppIds.includes(l.application_id) || !l.application_id
  );
  
  const activeLicenses = filteredLicenses.filter(l => l.status === "active").length;
  const activeUsers = filteredUsers.filter(u => u.status === "active").length;
  const successRate = stats.success_rate || 99.8;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={stats.requests_today.toLocaleString()}
          change="12.5%"
          trend="up"
          icon={Activity}
          color="indigo"
        />
        <StatCard
          title="Active Users"
          value={activeUsers.toLocaleString()}
          change="8.2%"
          trend="up"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Active Licenses"
          value={activeLicenses.toLocaleString()}
          change="3.1%"
          trend="down"
          icon={KeyRound}
          color="amber"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={ShieldCheck}
          color="sky"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Analytics Chart Area - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Metrics */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Performance Overview</h2>
                <p className="text-sm text-zinc-400 mt-1">Request success rate over time</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="space-y-4">
              <div className="flex items-end gap-2 h-40">
                {[85, 92, 78, 95, 88, 98, 94].map((height, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative">
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg transition-all duration-300 group-hover:from-indigo-400 group-hover:to-violet-400"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                <span>Success Rate: {successRate}%</span>
                <span className="text-emerald-400">+5.2% vs last week</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Link href="/activity-logs" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                View All <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-zinc-800">
              <ActivityItem
                title="New user registered"
                description="john.doe@example.com signed up"
                time="2 min ago"
                type="success"
              />
              <ActivityItem
                title="License validation request"
                description="License key XXXXX-YYYYY validated"
                time="15 min ago"
                type="info"
              />
              <ActivityItem
                title="Failed login attempt"
                description="Invalid credentials from IP 192.168.1.1"
                time="1 hour ago"
                type="warning"
              />
              <ActivityItem
                title="API key generated"
                description="New API key created for app 'MyApp'"
                time="3 hours ago"
                type="success"
              />
              <ActivityItem
                title="System update"
                description="Security patches applied successfully"
                time="5 hours ago"
                type="info"
              />
            </div>
          </Card>
        </div>

        {/* Right Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              <QuickAction href="/apps" label="Create Application" icon={Plus} color="indigo" />
              <QuickAction href="/licenses" label="Generate License" icon={KeyRound} color="emerald" />
              <QuickAction href="/users" label="Add New User" icon={Users} color="sky" />
              <QuickAction href="/analytics" label="View Analytics" icon={BarChart3} color="amber" />
            </div>
          </Card>

          {/* System Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
            <div className="space-y-3">
              {[
                { label: "API Server", status: "Operational", uptime: "99.9%" },
                { label: "Database", status: "Healthy", uptime: "100%" },
                { label: "Authentication", status: "Active", uptime: "99.99%" },
                { label: "License Service", status: "Running", uptime: "99.95%" },
              ].map((service) => (
                <div key={service.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm text-zinc-300">{service.label}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{service.uptime}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Resource Usage */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Resource Usage</h2>
            <div className="space-y-4">
              {[
                { label: "CPU", usage: 45, color: "indigo" },
                { label: "Memory", usage: 62, color: "emerald" },
                { label: "Storage", usage: 28, color: "amber" },
              ].map((resource) => (
                <div key={resource.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">{resource.label}</span>
                    <span className="text-zinc-300">{resource.usage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r from-${resource.color}-500 to-${resource.color}-400 transition-all duration-500`}
                      style={{ width: `${resource.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
