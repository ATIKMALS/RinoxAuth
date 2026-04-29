"use client";

import { useState, useEffect, useCallback } from "react";
import { CLIENT_BACKEND_BASE_URL } from "@/lib/client-env";
import { Card } from "@/components/ui/card";
import { 
  Settings, Shield, Key, CreditCard, Users, Bell,
  Globe, Clock, Monitor, Moon, Sun, Save, Info, Loader2, CheckCircle2
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  // Settings state
  const [settings, setSettings] = useState({
    app_name: "RinoxAuth",
    owner_id: "admin",
    timezone: "Asia/Dhaka (GMT+6)",
    date_format: "DD/MM/YYYY",
    language: "English",
    theme: "dark",
    auth_mode: "OAuth 2.0 + JWT",
  });

  // Notification toggles
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    login_alerts: true,
    license_expiry: true,
    weekly_report: false,
  });

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${CLIENT_BACKEND_BASE_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setSettings(prev => ({ ...prev, ...data.data }));
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveMessage("");
      
      const res = await fetch(`${CLIENT_BACKEND_BASE_URL}/api/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          notifications_enabled: notifications.email,
          push_enabled: notifications.push,
          login_alerts: notifications.login_alerts,
          license_expiry_alerts: notifications.license_expiry,
          weekly_report: notifications.weekly_report,
        }),
      });

      if (res.ok) {
        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to save settings");
      }
    } catch (error) {
      setSaveMessage("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "api", label: "API & Webhooks", icon: Key },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "team", label: "Team", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-indigo-400" />
            </div>
            Settings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your account preferences and configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`rounded-xl p-3 flex items-center gap-2 ${
          saveMessage.includes("success") 
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border border-red-500/20 text-red-400"
        }`}>
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">{saveMessage}</span>
        </div>
      )}

      {/* Settings Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Sidebar - Navigation Tabs */}
        <div className="lg:col-span-1">
          <Card className="p-2 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">General Settings</h2>
                  <p className="text-xs text-zinc-400">Manage your basic application configuration</p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Application Name
                      </label>
                      <input
                        type="text"
                        value={settings.app_name}
                        onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                        className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Owner ID
                      </label>
                      <input
                        type="text"
                        value={settings.owner_id}
                        readOnly
                        className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white opacity-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        <Globe className="h-3.5 w-3.5 inline mr-1" /> Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                        className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white cursor-pointer focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      >
                        <option>Asia/Dhaka (GMT+6)</option>
                        <option>Asia/Kolkata (GMT+5:30)</option>
                        <option>America/New_York (GMT-5)</option>
                        <option>Europe/London (GMT+0)</option>
                        <option>Asia/Dubai (GMT+4)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        <Clock className="h-3.5 w-3.5 inline mr-1" /> Date Format
                      </label>
                      <select
                        value={settings.date_format}
                        onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                        className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white cursor-pointer focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      >
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white cursor-pointer focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      >
                        <option>English</option>
                        <option>Bengali</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "light", label: "Light", icon: Sun },
                        { id: "system", label: "System", icon: Monitor },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSettings({ ...settings, theme: theme.id })}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                            settings.theme === theme.id
                              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                              : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                          }`}
                        >
                          <theme.icon className="h-4 w-4" />
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Security</h2>
                  <p className="text-xs text-zinc-400">Manage your security preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-700/50 bg-zinc-800/30">
                  <div>
                    <p className="text-sm font-medium text-white">Authentication Mode</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{settings.auth_mode}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-700/50 bg-zinc-800/30">
                  <div>
                    <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Add an extra layer of security</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-all">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-700/50 bg-zinc-800/30">
                  <div>
                    <p className="text-sm font-medium text-white">Active Sessions</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Manage your active login sessions</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-all">
                    View Sessions
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-700/50 bg-zinc-800/30">
                  <div>
                    <p className="text-sm font-medium text-white">API Key Rotation</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Rotate your API keys periodically</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-all">
                    Rotate Keys
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Notifications</h2>
                  <p className="text-xs text-zinc-400">Configure how you receive alerts</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive alerts via email" },
                  { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                  { key: "login_alerts", label: "Login Alerts", desc: "Get notified of new logins" },
                  { key: "license_expiry", label: "License Expiry Alerts", desc: "Alerts for expiring licenses" },
                  { key: "weekly_report", label: "Weekly Report", desc: "Weekly summary report" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-zinc-700/50 bg-zinc-800/30">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key as keyof typeof notifications]
                      })}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                        notifications[item.key as keyof typeof notifications] ? "bg-indigo-600" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                        notifications[item.key as keyof typeof notifications] ? "left-6" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Other tabs - Coming Soon */}
          {["api", "billing", "team"].includes(activeTab) && (
            <Card className="p-6">
              <div className="text-center py-8">
                <Info className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-white capitalize">{activeTab} Settings</h2>
                <p className="text-sm text-zinc-400 mt-1">Coming soon...</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}