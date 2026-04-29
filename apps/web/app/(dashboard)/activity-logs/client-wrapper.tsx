"use client";

import { useRouter } from "next/navigation";
import { RefreshCw, Trash2 } from "lucide-react";
import { ExportCsvButton } from "@/components/ui/export-csv-button";
import { CLIENT_BACKEND_BASE_URL } from "@/lib/client-env";
import type { ActivityLogRecord } from "@/lib/types";

export function ActivityLogsClientWrapper({ logs }: { logs: ActivityLogRecord[] }) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all activity logs? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${CLIENT_BACKEND_BASE_URL}/api/admin/activity-logs`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json().catch(() => null);
        alert(data?.message || "Failed to clear logs");
      }
    } catch {
      alert("Network error. Please try again.");
    }
  };

  const exportRows = logs.map((l) => [
    l.id,
    l.category,
    l.severity,
    l.message.replace(/\r?\n/g, " "),
    l.created_at,
    l.ip_address ?? "",
  ]);

  return (
    <div className="flex items-center gap-3">
      <ExportCsvButton
        filename={`activity-logs-${new Date().toISOString().slice(0, 10)}.csv`}
        headers={["ID", "Category", "Severity", "Message", "Created at", "IP"]}
        rows={exportRows}
        label="Export"
      />
      <button
        type="button"
        onClick={handleRefresh}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700/50 hover:border-zinc-600/70 transition-all duration-300 backdrop-blur-sm group"
      >
        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
        Refresh
      </button>
      <button
        type="button"
        onClick={handleClearLogs}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/30 transition-all duration-300 group"
      >
        <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
        Clear Logs
      </button>
    </div>
  );
}
