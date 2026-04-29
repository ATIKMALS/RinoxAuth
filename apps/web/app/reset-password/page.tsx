import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";
import { Loader2 } from "lucide-react";

function ResetPasswordFallback() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_50%)]" />
      <div className="relative z-10 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 px-10 py-12 backdrop-blur-xl">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm text-zinc-400">Loading…</p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
