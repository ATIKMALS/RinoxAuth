import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { ApiKeyRecord } from "@/lib/types";
import { 
  Key, 
  Shield, 
  Clock, 
  AlertTriangle,
  Activity,
  CheckCircle2,
  ArrowUpDown,
  Copy,
  Trash2
} from "lucide-react";
import { CredentialsClientWrapper } from "./client-wrapper";

async function getCredentials() {
  try {
    const res = await api.get<ApiKeyRecord[]>("/api/api-keys");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export default async function CredentialsPage() {
  const credentials = await getCredentials();
  const activeKeys = credentials.filter(c => c.status === "active").length;
  const expiringSoon = 0; // You can calculate based on expiry date
  const lastUsed = credentials.length > 0 ? credentials[0]?.last_used : "-";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-indigo-400" />
            </div>
            API Credentials
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your API keys and access credentials</p>
        </div>
        <CredentialsClientWrapper credentials={credentials} />
      </div>

      {/* Security Warning */}
      <Card className="border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Security Notice</p>
            <p className="text-xs text-amber-400/70 mt-1">
              Keep your API keys secure. Never share them in public repositories or expose them in client-side code.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all duration-300 group-hover:scale-110">
                <Key className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Total API Keys</p>
            <p className="text-2xl font-bold text-white mt-1">{credentials.length}</p>
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
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Active Keys</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{activeKeys}</p>
          </div>
        </Card>

        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-all duration-300 group-hover:scale-110">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Expiring Soon</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{expiringSoon}</p>
          </div>
        </Card>

        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-all duration-300 group-hover:scale-110">
                <Activity className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Last Used</p>
            <p className="text-2xl font-bold text-violet-400 mt-1 text-sm">{lastUsed}</p>
          </div>
        </Card>
      </div>

      {/* Credentials Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-zinc-800/50">
          <p className="text-sm text-zinc-400 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            {credentials.length} API key{credentials.length !== 1 ? "s" : ""} configured
          </p>
        </div>

        {credentials.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Key className="h-10 w-10 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">No API Keys Yet</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
                  Generate your first API key to start integrating with the RinoxAuth platform.
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
                      App Name
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5" />
                      API Key
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Used</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {credentials.map((credential, index) => (
                  <tr 
                    key={credential.id ?? `${credential.name}-${credential.prefix}-${index}`} 
                    className="group border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-all duration-300"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {credential.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <p className="font-medium text-white group-hover:text-indigo-300 transition-colors duration-300">
                          {credential.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm text-zinc-300 bg-zinc-800/50 px-2 py-1 rounded-lg">
                          {credential.prefix}****
                        </code>
                        <button className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100" title="Copy">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-400">
                      {credential.created_at}
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-400">
                      {credential.last_used || "Never"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                        credential.status === "active" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          credential.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                        }`} />
                        {credential.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 hover:scale-110 border border-red-500/20" title="Revoke Key">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}