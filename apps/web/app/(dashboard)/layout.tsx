import { ReactNode, Suspense } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Sidebar } from "@/components/layout/sidebar";
import defaultBrandLogo from "@/logo/logo.png";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { DashboardStatsBar } from "@/components/layout/dashboard-stats-bar";
import { 
  ChevronDown,
  Calendar,
  Clock,
  Zap,
  Key,
  Activity,
  ChevronRight,
  Home,
  Settings,
  Users,
  Star,
  Sparkles,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

// ============================================
// AURORA BACKGROUND COMPONENT
// ============================================
function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 animate-aurora-1" />
      <div className="absolute -top-1/2 -right-1/4 w-[150%] h-[150%] bg-gradient-to-bl from-blue-600/10 via-transparent to-pink-600/10 animate-aurora-2" />
      <div className="absolute -bottom-1/2 left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-violet-600/10 via-transparent to-cyan-600/10 animate-aurora-3" />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float-slower" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-medium" />
      <div className="absolute top-2/3 right-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-float-fast" />
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// LIVE CLOCK
// ============================================
function LiveClock() {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span suppressHydrationWarning>
          {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
        </span>
      </div>
    </div>
  );
}

// ============================================
// QUICK ACTIONS PANEL
// ============================================
function QuickActionsPanel() {
  const actions: {
    icon: typeof Users;
    label: string;
    href: Route;
    color: string;
    shortcut: string;
  }[] = [
    { icon: Users, label: "Add User", href: "/users", color: "indigo", shortcut: "U" },
    { icon: Key, label: "New License", href: "/licenses", color: "emerald", shortcut: "L" },
    { icon: Activity, label: "View Logs", href: "/activity-logs", color: "amber", shortcut: "A" },
    { icon: Settings, label: "Settings", href: "/settings", color: "violet", shortcut: "S" },
  ];

  return (
    <div className="hidden xl:flex items-center gap-1">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-${action.color}-500/10 border border-transparent hover:border-${action.color}-500/20 transition-all duration-300 group`}
        >
          <action.icon className={`h-3.5 w-3.5 group-hover:text-${action.color}-400 transition-colors`} />
          <span className="hidden lg:inline">{action.label}</span>
          <kbd className="hidden lg:inline-flex items-center justify-center w-4 h-4 rounded bg-zinc-800 text-[9px] text-zinc-500 ml-1">{action.shortcut}</kbd>
        </Link>
      ))}
    </div>
  );
}

// ============================================
// BREADCRUMB
// ============================================
function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-xs mb-1">
      <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
        <Home className="h-3 w-3" /> Dashboard
      </Link>
      <ChevronRight className="h-3 w-3 text-zinc-600" />
      <span className="text-indigo-400 font-medium">Overview</span>
    </nav>
  );
}

// ============================================
// MAIN DASHBOARD LAYOUT
// ============================================
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const formattedTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  
  const emojis = ["👋", "✨", "🚀", "💪", "🎯", "⭐", "🔥", "💎"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AuroraBackground />
      <Sidebar />
      
      <main className="flex-1 relative z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-zinc-800/50">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left */}
              <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="hidden sm:block"><Breadcrumb /></div>
                <QuickActionsPanel />
              </div>
              
              {/* Right - Avatar + Name + Logout */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
                  {/* User Info */}
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-white leading-tight">{session.user.username}</p>
                    <p className="text-[10px] text-zinc-500">Administrator</p>
                  </div>
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/20">
                      {session.user.username?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
                  </div>
                </div>
                {/* Logout Button - Avatar এর পাশে */}
                <LogoutButton />
              </div>
            </div>
          </div>
          <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 animate-gradient-x" />
        </header>

        {/* Welcome Panel */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6">
          <div className="glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden group mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-indigo-500/35 shadow-2xl shadow-indigo-500/25 transition-transform duration-500 group-hover:scale-105 group-hover:ring-violet-400/40">
                    <Image
                      src={defaultBrandLogo}
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      priority
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-600/25 via-transparent to-violet-600/20 opacity-80 mix-blend-overlay" />
                    <div
                      className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
                      style={{
                        backgroundImage:
                          "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%)",
                        backgroundSize: "220% 100%",
                        animation: "welcome-shine 5s ease-in-out infinite",
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-indigo-600 to-violet-600 text-[10px] font-bold text-white shadow-lg">
                    {session.user.username?.[0]?.toUpperCase() || "A"}
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">{greeting}, {session.user.username}!</h1>
                    <span className="text-2xl animate-bounce inline-block">{randomEmoji}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-400 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" /><span>{formattedDate}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-600 hidden sm:block" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" /><span>{formattedTime}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-600 hidden sm:block" />
                    <LiveClock />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 group/badge hover:bg-indigo-500/20 transition-all duration-300 cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs text-indigo-200 font-medium">Free Plan</span>
                  <ChevronDown className="h-3 w-3 text-indigo-400 group-hover/badge:rotate-180 transition-transform duration-300" />
                </div>
                <button className="hidden sm:flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105">
                  <Star className="h-3.5 w-3.5" /> Upgrade
                </button>
              </div>
            </div>
            
            <div className="relative mt-5 pt-4 border-t border-zinc-700/30">
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { label: "System", status: "Operational", color: "emerald" },
                  { label: "API", status: "Healthy", color: "emerald" },
                  { label: "Database", status: "Connected", color: "emerald" },
                  { label: "Cache", status: "Active", color: "emerald" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${item.color}-400 animate-pulse`} />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.label}</span>
                    <span className={`text-[10px] text-${item.color}-400 font-medium`}>{item.status}</span>
                  </div>
                ))}
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] text-zinc-500">Latency: </span>
                  <span className="text-[10px] text-emerald-400 font-medium">24ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="glass-panel rounded-xl h-20 bg-zinc-900/40" />
                ))}
              </div>
            }
          >
            <DashboardStatsBar />
          </Suspense>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="animate-fade-in-up relative rounded-2xl border border-zinc-800/70 bg-slate-950/40 p-4 shadow-[0_0_60px_-20px_rgba(99,102,241,0.35)] backdrop-blur-md sm:p-6 before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:rounded-full before:bg-gradient-to-r before:from-transparent before:via-indigo-400/60 before:to-transparent">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(800px_200px_at_50%_-20%,rgba(99,102,241,0.12),transparent_55%)]" />
            <div className="relative">{children}</div>
          </div>
        </div>
        
      </main>
      
      <style>{`
        @keyframes aurora-1 { 0%,100%{transform:translate(0,0) rotate(0deg) scale(1)} 33%{transform:translate(30px,-50px) rotate(5deg) scale(1.05)} 66%{transform:translate(-20px,20px) rotate(-3deg) scale(.95)} }
        @keyframes aurora-2 { 0%,100%{transform:translate(0,0) rotate(0deg) scale(1)} 33%{transform:translate(-40px,-30px) rotate(-5deg) scale(1.1)} 66%{transform:translate(25px,40px) rotate(4deg) scale(.9)} }
        @keyframes aurora-3 { 0%,100%{transform:translate(0,0) rotate(0deg) scale(1.1)} 33%{transform:translate(20px,40px) rotate(3deg) scale(.95)} 66%{transform:translate(-30px,-25px) rotate(-4deg) scale(1.05)} }
        .animate-aurora-1{animation:aurora-1 20s ease-in-out infinite}
        .animate-aurora-2{animation:aurora-2 25s ease-in-out infinite}
        .animate-aurora-3{animation:aurora-3 30s ease-in-out infinite}
        @keyframes float-slow { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-30px) scale(1.1)} }
        @keyframes float-slower { 0%,100%{transform:translate(0,0) scale(1.1)} 50%{transform:translate(-30px,20px) scale(.9)} }
        @keyframes float-medium { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,-25px) scale(1.15)} }
        @keyframes float-fast { 0%,100%{transform:translate(0,0) scale(.9)} 50%{transform:translate(25px,30px) scale(1.05)} }
        .animate-float-slow{animation:float-slow 15s ease-in-out infinite}
        .animate-float-slower{animation:float-slower 18s ease-in-out infinite}
        .animate-float-medium{animation:float-medium 12s ease-in-out infinite}
        .animate-float-fast{animation:float-fast 10s ease-in-out infinite}
        @keyframes particle-float { 0%{transform:translateY(100vh) scale(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(-100vh) scale(1);opacity:0} }
        @keyframes gradient-x { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .animate-gradient-x{background-size:200% 200%;animation:gradient-x 3s ease infinite}
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in-up{animation:fadeInUp .6s ease-out}
        @keyframes welcome-shine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes brand-shine { 0%{background-position:200% 50%} 100%{background-position:-200% 50%} }
        .glass-panel{background:rgba(15,23,42,.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(99,102,241,.1);box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1),inset 0 1px 0 rgba(255,255,255,.05)}
      `}</style>
    </div>
  );
}