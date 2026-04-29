"use client";

import { useRouter } from "next/navigation";
import { Save, RefreshCw } from "lucide-react";

export function SettingsClientWrapper() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700/50 hover:border-zinc-600/70 transition-all duration-300 backdrop-blur-sm group"
      >
        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
        Refresh
      </button>
    </div>
  );
}