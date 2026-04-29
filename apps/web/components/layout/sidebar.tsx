"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  AppWindow, 
  KeyRound, 
  Users, 
  BarChart3, 
  Handshake, 
  KeySquare, 
  History, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  ExternalLink,
  ArrowUpRight,
  X
} from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";

const nav = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard,
    color: "indigo",
    badge: null
  },
  { 
    href: "/apps", 
    label: "Applications", 
    icon: AppWindow,
    color: "emerald",
    badge: null
  },
  { 
    href: "/licenses", 
    label: "License Keys", 
    icon: KeyRound,
    color: "amber",
    badge: "5"
  },
  { 
    href: "/users", 
    label: "Users", 
    icon: Users,
    color: "sky",
    badge: null
  },
  { 
    href: "/analytics", 
    label: "Analytics", 
    icon: BarChart3,
    color: "violet",
    badge: "New"
  },
  { 
    href: "/resellers", 
    label: "Resellers", 
    icon: Handshake,
    color: "rose",
    badge: null
  },
  { 
    href: "/credentials", 
    label: "Credentials", 
    icon: KeySquare,
    color: "cyan",
    badge: null
  },
  { 
    href: "/activity-logs", 
    label: "Activity Logs", 
    icon: History,
    color: "orange",
    badge: null
  },
  { 
    href: "/settings", 
    label: "Settings", 
    icon: Settings,
    color: "slate",
    badge: null
  }
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Keyboard shortcut for collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const SidebarContent = () => (
    <>
      {/* Logo / Brand */}
      <div className={cn(
        "flex items-center gap-3 mb-8",
        isCollapsed && !isMobileOpen && "justify-center"
      )}>
        <div className="relative flex-shrink-0">
          <BrandLogo size={40} className="shadow-indigo-500/30" />
          <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-400 animate-pulse" />
        </div>
        
        {(!isCollapsed || isMobileOpen) && (
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white leading-tight">
              RinoxAuth
            </h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-zinc-500 font-medium">v2.0 Pro</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          const isHovered = hoveredItem === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href as any}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 group",
                isActive
                  ? `bg-${item.color}-500/10 text-${item.color}-400 border border-${item.color}-500/20 shadow-lg shadow-${item.color}-500/5`
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/30",
                isCollapsed && !isMobileOpen && "justify-center px-2"
              )}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b",
                  `from-${item.color}-400 to-${item.color}-500`
                )} />
              )}
              
              {/* Icon */}
              <div className={cn(
                "relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300",
                isActive 
                  ? `bg-${item.color}-500/20 text-${item.color}-400`
                  : "bg-zinc-800/50 text-zinc-500 group-hover:bg-zinc-700/50 group-hover:text-white",
                isCollapsed && !isMobileOpen && "w-10 h-10"
              )}>
                <Icon className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isHovered && !isActive && "scale-110"
                )} />
                
                {/* Active Dot */}
                {isActive && (
                  <div className={cn(
                    "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-950",
                    `bg-${item.color}-400`
                  )} />
                )}
              </div>
              
              {/* Label */}
              {(!isCollapsed || isMobileOpen) && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  
                  {/* Badge */}
                  {item.badge && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0",
                      item.badge === "New" 
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                        : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Active Arrow */}
                  {isActive && (
                    <ChevronRight className={cn("h-3.5 w-3.5 flex-shrink-0", `text-${item.color}-400`)} />
                  )}
                </>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && !isMobileOpen && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 border border-zinc-700/50 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl z-50">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 text-[10px] text-indigo-400">({item.badge})</span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Bottom Section */}
      <div className={cn(
        "pt-4 mt-4 border-t border-zinc-800/50 space-y-3",
        isCollapsed && !isMobileOpen && "text-center"
      )}>
        {/* Help & Docs */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="space-y-2">
            <a
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-300 group"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Help & Documentation</span>
              <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-300 group"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>What&apos;s New</span>
              <ArrowUpRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        )}
        
        {/* Status */}
        <div className={cn(
          "rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3",
          isCollapsed && !isMobileOpen && "p-2"
        )}>
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <p className="text-[10px] text-emerald-400 font-medium">All Systems Operational</p>
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mx-auto" />
          )}
        </div>
        
        {/* Version */}
        {(!isCollapsed || isMobileOpen) && (
          <p className="text-center text-[10px] text-zinc-600">
            RinoxAuth v2.0.0 • Premium
          </p>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-900/90 border border-zinc-700/50 text-zinc-400 hover:text-white backdrop-blur-sm shadow-lg"
      >
        <PanelLeftOpen className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 border-r border-indigo-500/10 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          "p-4"
        )}
      >
        <SidebarContent />
        
        {/* Collapse Toggle - Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-zinc-700/50 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all duration-300 flex items-center justify-center shadow-lg"
          title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 backdrop-blur-xl border-r border-indigo-500/10 p-4 transition-transform duration-300 ease-in-out shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>
        
        <SidebarContent />
      </aside>

      {/* CSS for thin scrollbar */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </>
  );
}