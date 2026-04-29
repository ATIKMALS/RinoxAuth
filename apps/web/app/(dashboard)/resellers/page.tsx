import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { ResellerRecord } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { 
  Users, 
  Coins, 
  TrendingUp, 
  DollarSign,
  Activity,
  Search,
  Mail,
  Phone,
  Edit,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown
} from "lucide-react";
import { ResellersClientWrapper } from "./client-wrapper";

async function getResellers() {
  try {
    const res = await api.get<ResellerRecord[]>("/api/resellers");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export default async function ResellersPage() {
  const resellers = await getResellers();
  
  const totalCredits = resellers.reduce((a, r) => a + (r.credits || 0), 0);
  const usedCredits = totalCredits > 0 ? Math.round(totalCredits * 0.35) : 0;
  const totalUsersCreated = resellers.reduce((a, r) => a + (r.users_created || 0), 0);
  const activeResellers = resellers.filter(r => r.status === "active").length;
  const totalCommission = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            Resellers Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your reseller network and track performance</p>
        </div>
        <ResellersClientWrapper resellers={resellers} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all duration-300 group-hover:scale-110">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Total Resellers</p>
            <p className="text-2xl font-bold text-white mt-1">{resellers.length}</p>
            <p className="text-xs text-zinc-500 mt-1">{activeResellers} active</p>
          </div>
        </Card>

        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-all duration-300 group-hover:scale-110">
                <Coins className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Credits Used</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{usedCredits}<span className="text-base text-zinc-500">/{totalCredits}</span></p>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0}%` }} />
            </div>
          </div>
        </Card>

        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all duration-300 group-hover:scale-110">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Licenses Sold</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{totalUsersCreated}</p>
            <p className="text-xs text-zinc-500 mt-1">By all resellers</p>
          </div>
        </Card>

        <Card className="card-hover-effect p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-all duration-300 group-hover:scale-110">
                <DollarSign className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Commission Pending</p>
            <p className="text-2xl font-bold text-violet-400 mt-1">${totalCommission}</p>
            <p className="text-xs text-zinc-500 mt-1">Awaiting payout</p>
          </div>
        </Card>
      </div>

      {/* Resellers Table - Now in Server Component */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-zinc-800/50">
          <p className="text-sm text-zinc-400 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            {resellers.length} reseller{resellers.length !== 1 ? "s" : ""} registered
          </p>
        </div>

        {resellers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Users className="h-10 w-10 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">No Resellers Yet</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
                  Add resellers to allow them to generate and manage licenses on your behalf.
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
                      Reseller
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Credits</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Commission</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Users Created</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {resellers.map((reseller, index) => (
                  <tr 
                    key={reseller.id} 
                    className="group border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-all duration-300"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                          reseller.status === "active" ? "from-indigo-500 to-violet-500" : "from-zinc-600 to-zinc-500"
                        }`}>
                          {reseller.username?.[0]?.toUpperCase() || "R"}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-indigo-300 transition-colors duration-300">
                            {reseller.username}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            {reseller.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {reseller.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-semibold text-white">{reseller.credits}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-zinc-300">{reseller.commission_rate || 20}%</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm text-zinc-300">{reseller.users_created || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                        reseller.status === "active" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : reseller.status === "suspended"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          reseller.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                        }`} />
                        {reseller.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-indigo-400 transition-all duration-300 hover:scale-110" title="Edit Reseller">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-all duration-300 hover:scale-110" title="Reset Credits">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <form action={async (formData: FormData) => {
                          "use server";
                          const resellerId = Number(formData.get("reseller_id"));
                          await api.del(`/api/admin/resellers/${resellerId}`);
                          revalidatePath("/resellers");
                        }}>
                          <input type="hidden" name="reseller_id" value={reseller.id} />
                          <button type="submit" className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-all duration-300 hover:scale-110" title="Remove Reseller">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
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