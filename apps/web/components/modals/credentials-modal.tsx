"use client";

import { useState, useEffect, useCallback } from "react";
import { CLIENT_BACKEND_BASE_URL } from "@/lib/client-env";
import { createPortal } from "react-dom";
import { 
  Eye, EyeOff, Copy, Check, Smartphone, Lock, 
  Package, AlertTriangle, Globe, Loader2, User, X
} from "lucide-react";

interface AppCredentials {
  app_name: string;
  owner_id: string;
  app_key: string;
  app_secret: string;
  version: string;
  client_portal: string;
}

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
}

export function CredentialsModal({ isOpen, onClose, appId }: CredentialsModalProps) {
  const [credentials, setCredentials] = useState<AppCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCredentials = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${CLIENT_BACKEND_BASE_URL}/api/admin/apps/${appId}/credentials`
      );
      if (!response.ok) throw new Error(`Failed (${response.status})`);
      const data = await response.json();
      setCredentials(data.data || data);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    if (isOpen && appId) {
      void fetchCredentials();
    }
  }, [isOpen, appId, fetchCredentials]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  if (!mounted || !isOpen) return null;

  // ✅ Portal দিয়ে সরাসরি body-তে render
  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 99999 }}>
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800 flex-shrink-0">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-indigo-400" />
              Application Credentials
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Body - Scrollable */}
          <div className="p-5 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                <p className="text-sm text-zinc-400">Loading credentials...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 font-medium mb-2">Failed to load</p>
                <p className="text-sm text-zinc-500 mb-4">{error}</p>
                <button 
                  onClick={fetchCredentials}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : credentials ? (
              <div className="space-y-4">
                {/* App Name */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-indigo-400" /> 📱 Application Name
                  </label>
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white font-medium">
                    {credentials.app_name}
                  </div>
                </div>

                {/* Owner ID */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <User className="h-3.5 w-3.5 text-amber-400" /> 🔑 Owner ID
                  </label>
                  <div className="relative group">
                    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 pr-12 text-sm text-white font-mono break-all">
                      {credentials.owner_id}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(credentials.owner_id, "owner")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {copiedField === "owner" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* App Secret */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <Lock className="h-3.5 w-3.5 text-rose-400" /> 🔐 App Secret
                  </label>
                  <div className="relative group">
                    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 pr-20 text-xs text-white font-mono break-all">
                      {showSecret ? credentials.app_secret : "••••••••••••••••••••••••••••••••"}
                    </div>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                      <button 
                        onClick={() => setShowSecret(!showSecret)} 
                        className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                      >
                        {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(credentials.app_secret, "secret")} 
                        className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                      >
                        {copiedField === "secret" ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Version */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <Package className="h-3.5 w-3.5 text-emerald-400" /> 📦 Version
                  </label>
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white">
                    {credentials.version}
                  </div>
                </div>

                {/* Warning */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">
                    Never share your App Secret publicly or commit it to version control.
                  </p>
                </div>

                {/* Client Portal */}
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                  <label className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Globe className="h-3.5 w-3.5" /> 🔗 Client Portal
                  </label>
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-xs text-white font-mono break-all">
                    {credentials.client_portal || CLIENT_BACKEND_BASE_URL}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body  // ✅ সরাসরি body-তে render
  );
}