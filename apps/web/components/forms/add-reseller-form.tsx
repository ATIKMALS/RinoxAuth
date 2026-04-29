"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CLIENT_BACKEND_BASE_URL } from "@/lib/client-env";
import { 
  User, 
  Mail, 
  Lock, 
  Coins,
  AlertCircle,
  CheckCircle2,
  Info,
  Eye,
  EyeOff,
  Loader2,
  Percent,
  Phone
} from "lucide-react";

interface AddResellerFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddResellerForm({ onClose, onSuccess }: AddResellerFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    credits: 100,
    commission_rate: 20,
    phone: "",
    notes: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username || formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = "Username must be between 3-50 characters";
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.credits < 0 || formData.credits > 10000) {
      newErrors.credits = "Credits must be between 0-10000";
    }
    
    if (formData.commission_rate < 0 || formData.commission_rate > 100) {
      newErrors.commission_rate = "Commission rate must be between 0-100%";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${CLIENT_BACKEND_BASE_URL}/api/admin/resellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          credits: formData.credits,
          commission_rate: formData.commission_rate,
          phone: formData.phone || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        onSuccess?.();
        onClose();
      } else {
        const errorMessage = data?.message || data?.detail || "Failed to add reseller";
        setErrors({ submit: errorMessage });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Username */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Username <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={formData.username}
            onChange={(e) => {
              setFormData({ ...formData, username: e.target.value });
              if (errors.username) setErrors({ ...errors, username: "" });
            }}
            placeholder="reseller_name"
            className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm focus:outline-none transition-all ${
              errors.username 
                ? "border-red-500/50 focus:ring-red-500/20" 
                : "border-zinc-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            }`}
            autoFocus
          />
          {formData.username && !errors.username && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400" />
          )}
          {errors.username && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
          )}
        </div>
        {errors.username && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />{errors.username}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Email Address <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            placeholder="reseller@example.com"
            className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm focus:outline-none transition-all ${
              errors.email 
                ? "border-red-500/50 focus:ring-red-500/20" 
                : "border-zinc-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            }`}
          />
          {formData.email && !errors.email && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400" />
          )}
          {errors.email && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
          )}
        </div>
        {errors.email && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />{errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            placeholder="Min 6 characters"
            className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-12 py-2.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm focus:outline-none transition-all ${
              errors.password 
                ? "border-red-500/50 focus:ring-red-500/20" 
                : "border-zinc-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            }`}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />{errors.password}
          </p>
        )}
      </div>

      {/* Phone (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Phone <span className="text-zinc-600">(Optional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Credits & Commission Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Credits */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Initial Credits
          </label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="number"
              min="0"
              max="10000"
              value={formData.credits}
              onChange={(e) => {
                setFormData({ ...formData, credits: parseInt(e.target.value) || 0 });
                if (errors.credits) setErrors({ ...errors, credits: "" });
              }}
              className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm focus:outline-none transition-all ${
                errors.credits 
                  ? "border-red-500/50 focus:ring-red-500/20" 
                  : "border-zinc-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              }`}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">License generation credits</p>
          {errors.credits && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{errors.credits}
            </p>
          )}
        </div>

        {/* Commission Rate */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Commission Rate (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="number"
              min="0"
              max="100"
              value={formData.commission_rate}
              onChange={(e) => {
                setFormData({ ...formData, commission_rate: parseInt(e.target.value) || 0 });
                if (errors.commission_rate) setErrors({ ...errors, commission_rate: "" });
              }}
              className={`w-full rounded-xl border bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm focus:outline-none transition-all ${
                errors.commission_rate 
                  ? "border-red-500/50 focus:ring-red-500/20" 
                  : "border-zinc-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              }`}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">Percentage per sale</p>
          {errors.commission_rate && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{errors.commission_rate}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
          Notes <span className="text-zinc-600">(Optional)</span>
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Internal notes about this reseller..."
          rows={2}
          className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
        />
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-300">
          Reseller will receive login credentials and can start generating licenses immediately.
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
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700/50 transition-all duration-300"
        >
          Cancel
        </button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </span>
          ) : (
            "Add Reseller"
          )}
        </Button>
      </div>
    </form>
  );
}