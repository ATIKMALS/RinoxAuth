"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { CredentialsModal } from "@/components/modals/credentials-modal";

export function CredentialsButton({ appId }: { appId: string | number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-all duration-300 hover:scale-110 border border-indigo-500/20"
        title="View Credentials"
      >
        <Eye className="h-4 w-4" />
      </button>

      <CredentialsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        appId={String(appId)}
      />
    </>
  );
}