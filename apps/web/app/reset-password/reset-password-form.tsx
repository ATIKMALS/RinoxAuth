"use client";

import { CLIENT_BACKEND_BASE_URL } from "@/lib/client-env";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${CLIENT_BACKEND_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsDone(true);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_50%)]" />

      <Card className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-indigo-600/20 p-3 ring-1 ring-indigo-500/30">
            <Shield className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-sm text-zinc-400">
            {isDone ? "Password reset successful!" : "Enter your new password"}
          </p>
        </div>

        {isDone ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Password Reset!</h3>
            <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Min 6 characters"
                  className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-12 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all ${
                    error ? "border-red-500/50" : "border-zinc-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Reset Password"}
            </button>
          </form>
        )}
      </Card>
    </main>
  );
}
