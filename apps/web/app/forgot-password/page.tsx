"use client";

import { useState } from "react";
import Link from "next/link";
import { CLIENT_BACKEND_BASE_URL } from "@/lib/client-env";
import { Shield, ArrowLeft, Mail, LockKeyhole, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${CLIENT_BACKEND_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSent(true);
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(29,78,216,0.20),transparent_45%)]" />

      {/* Back to Login */}
      <Link
        href="/login"
        className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800/80 hover:text-white backdrop-blur-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-xl shadow-2xl">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-indigo-600/20 p-3 ring-1 ring-indigo-500/30">
            <Shield className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-sm text-zinc-400">
            {isSent 
              ? "Check your email for reset instructions" 
              : "Enter your email and we'll send you a reset link"
            }
          </p>
        </div>

        {isSent ? (
          /* Success State */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Email Sent!</h3>
            <p className="text-sm text-zinc-400 mb-6">
              If an account exists for <span className="text-indigo-400">{email}</span>, 
              you will receive a password reset link shortly.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-all duration-300 outline-none ${
                    error 
                      ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                      : "border-zinc-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  }`}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-indigo-500 hover:to-violet-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 mt-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>

            {/* Back Link */}
            <p className="text-center text-sm text-zinc-400">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-6 rounded-xl border border-zinc-800/50 bg-zinc-800/30 p-3 backdrop-blur-sm">
          <p className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <LockKeyhole className="h-3.5 w-3.5 text-indigo-400" />
            Protected by CloudAuth Security
          </p>
        </div>
      </div>
    </main>
  );
}