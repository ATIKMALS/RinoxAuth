"use client";

import { useState, useEffect, useCallback } from "react";
import { CLIENT_BACKEND_BASE_URL } from "@/lib/client-env";
import { Button } from "@/components/ui/button";
import { 
  Key, 
  Layers,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  Eye,
  EyeOff,
  Copy,
  Loader2,
  Shield,
  Calendar
} from "lucide-react";

interface AppRecord {
  id: number;
  name: string;
  version: string;
  status: string;
}

interface GenerateApiKeyFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function GenerateApiKeyForm({ onClose, onSuccess }: GenerateApiKeyFormProps) {
  const [formData, setFormData] = useState({
    app_id: "",
    key_name: "",
    expires_in_days: 90,
    permissions: ["read"],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<{ key: string; secret: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    try {
      setIsLoadingApps(true);
      setFetchError(null);

      const response = await fetch("/api/apps");

      if (!response.ok) {
        throw new Error("Failed to fetch apps");
      }

      const data = await response.json();
      const appsList = data.data || data || [];

      if (Array.isArray(appsList)) {
        setApps(appsList);
        if (appsList.length > 0) {
          setFormData((prev) => (prev.app_id ? prev : { ...prev, app_id: String(appsList[0].id) }));
        }
      }
    } catch (error: unknown) {
      setFetchError(error instanceof Error ? error.message : "Failed to load applications");
    } finally {
      setIsLoadingApps(false);
    }
  }, []);

  useEffect(() => {
    void fetchApps();
  }, [fetchApps]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.app_id) {
      newErrors.app_id = "Please select an application";
    }
    
    if (!formData.key_name || formData.key_name.length < 2) {
      newErrors.key_name = "Key name must be at least 2 characters";
    }
    
    if (formData.permissions.length === 0) {
      newErrors.permissions = "Select at least one permission";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${CLIENT_BACKEND_BASE_URL}/api/admin/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: Number(formData.app_id),
          name: formData.key_name,
          expires_in_days: formData.expires_in_days,
          permissions: formData.permissions,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        const keyData = data.data || data;
        setGeneratedKey({
          key: keyData.key || keyData.api_key || "key_xxxxxxxxxxxxxxxx",
          secret: keyData.secret || keyData.api_secret || "secret_xxxxxxxxxxxxxxxxxxxxxxxx",
        });
        onSuccess?.();
      } else {
        const errorMessage = data?.message || data?.detail || "Failed to generate API key";
        setErrors({ submit: errorMessage });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const selectedApp = apps.find(app => String(app.id) === formData.app_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {generatedKey ? (
        /* Success State - Show Generated Key */
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">API Key Generated!</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Copy your API key now. You won&apos;t be able to see the secret again.
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Key className="h-3.5 w-3.5" /> API Key
            </label>
            <div className="relative group">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 pr-12 text-sm text-white font-mono break-all">
                {generatedKey.key}
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(generatedKey.key, "key")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
              >
                {copiedField === "key" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* API Secret */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" /> API Secret
            </label>
            <div className="relative group">
              <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 pr-24 text-sm text-white font-mono break-all">
                {showSecret ? generatedKey.secret : "••••••••••••••••••••••••••••••••••••••••"}
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedKey.secret, "secret")}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                >
                  {copiedField === "secret" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Make sure to copy your API secret now. You will not be able to see it again!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
          >
            Done
          </button>
        </div>
      ) : (
        <>
          {/* Application Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Select Application <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Layers className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${formData.app_id ? "text-indigo-400" : "text-zinc-500"}`} />
              <select
                value={formData.app_id}
                onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
                disabled={isLoadingApps}
                className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-10 py-2.5 text-sm text-white backdrop-blur-sm focus:outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 ${
                  errors.app_id ? "border-red-500/50" : "border-zinc-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                }`}
              >
                <option value="" className="bg-zinc-900 text-zinc-500">
                  {isLoadingApps ? "Loading..." : apps.length === 0 ? "No apps available" : "Select application"}
                </option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id} className="bg-zinc-900 text-white">
                    {app.name} {app.version ? `(v${app.version})` : ""}
                  </option>
                ))}
              </select>
              {isLoadingApps && <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 animate-spin" />}
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {selectedApp && (
              <p className="text-xs text-zinc-500 mt-1">{selectedApp.name} • v{selectedApp.version}</p>
            )}
            {errors.app_id && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.app_id}</p>
            )}
          </div>

          {/* Key Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Key Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={formData.key_name}
                onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                placeholder="e.g., Production Key, Test Key"
                className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm focus:outline-none transition-all ${
                  errors.key_name ? "border-red-500/50" : "border-zinc-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                }`}
              />
            </div>
            {errors.key_name && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.key_name}</p>
            )}
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Expires In
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <select
                value={formData.expires_in_days}
                onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 pl-10 pr-10 py-2.5 text-sm text-white backdrop-blur-sm focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>1 year</option>
                <option value={0}>Never expires</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Permissions <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "read", label: "Read", icon: Eye, color: "sky" },
                { value: "write", label: "Write", icon: Key, color: "amber" },
                { value: "delete", label: "Delete", icon: AlertCircle, color: "rose" },
                { value: "admin", label: "Admin", icon: Shield, color: "violet" },
              ].map((perm) => (
                <button
                  key={perm.value}
                  type="button"
                  onClick={() => togglePermission(perm.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                    formData.permissions.includes(perm.value)
                      ? `bg-${perm.color}-500/10 border-${perm.color}-500/30 text-${perm.color}-400`
                      : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <perm.icon className="h-4 w-4" />
                  {perm.label}
                  {formData.permissions.includes(perm.value) && (
                    <CheckCircle2 className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
            {errors.permissions && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.permissions}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-300">
              API keys grant programmatic access to your application. Keep them secure and rotate regularly.
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700/50 transition-all duration-300">
              Cancel
            </button>
            <Button type="submit" disabled={isLoading} className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : "Generate Key"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}