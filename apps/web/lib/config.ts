import { z } from "zod";

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_NAME: z.string().default("RinoxAuth"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  /** Optional absolute or site-relative URL for sidebar brand image (e.g. https://cdn.example.com/logo.png or /my-logo.png). */
  NEXT_PUBLIC_BRAND_LOGO_URL: z.string().optional(),
  
  // Backend
  BACKEND_BASE_URL: z.string().url(),
  /** Same as BACKEND_BASE_URL for client-side fetches (exposed to the browser). */
  NEXT_PUBLIC_BACKEND_URL: z.string().url().optional(),
  BACKEND_APP_NAME: z.string().default("rinoxauth"),
  BACKEND_OWNER_ID: z.string().default("admin"),
  BACKEND_SECRET: z.string().default("rinoxauth-secret-key-2024"),
  
  // Session
  SESSION_COOKIE_NAME: z.string().default("auth_session"),
  SESSION_MAX_AGE: z.coerce.number().default(86400),
  SESSION_UPDATE_AGE: z.coerce.number().default(3600),
  
  // Auth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  
  // OAuth Providers (Optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  
  // Features
  ENABLE_REGISTRATION: z.coerce.boolean().default(true),
  ENABLE_OAUTH: z.coerce.boolean().default(false),
  
  // Environment (FIXED: Added default)
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Safe parse - won't throw if some vars are missing
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_BRAND_LOGO_URL: process.env.NEXT_PUBLIC_BRAND_LOGO_URL,
  
  BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  BACKEND_APP_NAME: process.env.BACKEND_APP_NAME,
  BACKEND_OWNER_ID: process.env.BACKEND_OWNER_ID,
  BACKEND_SECRET: process.env.BACKEND_SECRET,
  
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
  SESSION_UPDATE_AGE: process.env.SESSION_UPDATE_AGE,
  
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  
  ENABLE_REGISTRATION: process.env.ENABLE_REGISTRATION,
  ENABLE_OAUTH: process.env.ENABLE_OAUTH,
  
  NODE_ENV: process.env.NODE_ENV,
});

// Fallback values if validation fails
export const env = parsed.success ? parsed.data : {
  NEXT_PUBLIC_APP_NAME: "RinoxAuth",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_BRAND_LOGO_URL: process.env.NEXT_PUBLIC_BRAND_LOGO_URL,
  BACKEND_BASE_URL: process.env.BACKEND_BASE_URL || "http://127.0.0.1:8000",
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  BACKEND_APP_NAME: "rinoxauth",
  BACKEND_OWNER_ID: "admin",
  BACKEND_SECRET: "rinoxauth-secret-key-2024",
  SESSION_COOKIE_NAME: "auth_session",
  SESSION_MAX_AGE: 86400,
  SESSION_UPDATE_AGE: 3600,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  NODE_ENV: "development",
  ENABLE_REGISTRATION: true,
  ENABLE_OAUTH: false,
};

// Derived constants
export const APP_CONFIG = {
  name: env.NEXT_PUBLIC_APP_NAME,
  version: "2.0.0",
  environment: env.NODE_ENV || "development",
  isProduction: (env.NODE_ENV || "development") === "production",
  isDevelopment: (env.NODE_ENV || "development") === "development",
} as const;