import { z } from "zod";

// ============================================
// AUTH VALIDATORS
// ============================================
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  remember_me: z.boolean().optional(),
});

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirm_password: z.string(),
  plan: z.enum(["free", "starter", "professional", "enterprise"]).default("free"),
  agree_terms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

// ============================================
// USER VALIDATORS
// ============================================
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  plan: z.enum(["free", "starter", "professional", "enterprise", "trial"]).default("free"),
  expires_in_days: z.number().min(0).max(3650).default(30),
  expires_in_seconds: z.number().min(0).optional(),
  hwid_lock: z.boolean().default(true),
  app_id: z.number().optional(),
  device_limit: z.number().min(1).max(100).default(1),
  notes: z.string().max(500).optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  plan: z.enum(["free", "starter", "professional", "enterprise", "trial"]).optional(),
  status: z.enum(["active", "inactive", "banned"]).optional(),
  expires_at: z.string().optional(),
  hwid_lock: z.boolean().optional(),
  device_limit: z.number().min(1).max(100).optional(),
  notes: z.string().max(500).optional(),
});

// ============================================
// LICENSE VALIDATORS
// ============================================
export const createLicenseSchema = z.object({
  key: z.string().min(8).max(100).optional(),
  plan: z.enum(["standard", "professional", "enterprise", "trial"]).default("standard"),
  expires_in_days: z.number().min(0).max(3650).default(30),
  is_lifetime: z.boolean().default(false),
  device_limit: z.number().min(1).max(1000).default(1),
  issued_to: z.string().email().optional().or(z.literal("")),
  note: z.string().max(500).optional(),
  app_id: z.number().optional(),
  user_id: z.number().optional(),
});

// ============================================
// APPLICATION VALIDATORS
// ============================================
export const createAppSchema = z.object({
  app_name: z
    .string()
    .min(2, "App name must be at least 2 characters")
    .max(50, "App name must be less than 50 characters")
    .trim(),
  version: z
    .string()
    .min(1, "Version is required")
    .max(20, "Version is too long")
    .regex(/^\d+\.\d+\.\d+$/, "Version must be in format x.y.z"),
  owner_id: z.string().optional(),
  description: z.string().max(500).optional(),
});

// ============================================
// RESELLER VALIDATORS
// ============================================
export const createResellerSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6).max(100),
  credits: z.number().min(0).max(10000).default(100),
  commission_rate: z.number().min(0).max(100).default(20),
  phone: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// ============================================
// API KEY VALIDATORS
// ============================================
export const createApiKeySchema = z.object({
  name: z.string().min(2).max(50).trim(),
  app_id: z.number().optional(),
  permissions: z.array(z.enum(["read", "write", "delete", "admin"])).default(["read"]),
  expires_in_days: z.number().min(0).max(365).default(90),
});

// ============================================
// SETTINGS VALIDATORS
// ============================================
export const updateSettingsSchema = z.object({
  app_name: z.string().min(2).max(50).optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  date_format: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).optional(),
  notifications_enabled: z.boolean().optional(),
  two_factor_required: z.boolean().optional(),
  session_timeout: z.number().min(5).max(1440).optional(), // 5 min to 24 hours
});

// ============================================
// SEARCH & FILTER VALIDATORS
// ============================================
export const searchParamsSchema = z.object({
  query: z.string().max(200).optional(),
  category: z.string().optional(),
  severity: z.enum(["info", "warning", "error", "critical", "all"]).optional(),
  status: z.enum(["active", "inactive", "banned", "expired", "all"]).optional(),
  plan: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
});

// ============================================
// TYPE EXPORTS
// ============================================
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
export type CreateAppInput = z.infer<typeof createAppSchema>;
export type CreateResellerInput = z.infer<typeof createResellerSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type SearchParamsInput = z.infer<typeof searchParamsSchema>;