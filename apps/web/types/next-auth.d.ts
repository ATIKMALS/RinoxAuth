import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// ============================================
// SESSION TYPE AUGMENTATION
// ============================================
declare module "next-auth" {
  interface Session {
    user: {
      /** Unique user identifier */
      id: string;
      /** Display username */
      username: string;
      /** User email (optional) */
      email?: string | null;
      /** User display name */
      name?: string | null;
      /** User avatar URL */
      image?: string | null;
      /** User role: admin, user, reseller, etc. */
      role: string;
      /** Current plan: free, starter, professional, enterprise */
      plan: string;
      /** Array of permissions */
      permissions?: string[];
      /** Account status */
      status?: "active" | "inactive" | "banned" | "suspended";
      /** Whether 2FA is enabled */
      twoFactorEnabled?: boolean;
      /** Last login timestamp */
      lastLogin?: string;
    };
    /** Session expiry timestamp */
    expires: string;
    /** Custom error message */
    error?: string;
  }

  interface User extends DefaultUser {
    /** User role */
    role?: string;
    /** Current plan */
    plan?: string;
    /** Array of permissions */
    permissions?: string[];
    /** Display username */
    username?: string;
    /** Avatar URL */
    avatar?: string;
    /** Account status */
    status?: string;
    /** Phone number */
    phone?: string;
  }

  interface Profile {
    /** Provider-specific profile ID */
    id?: string;
    /** Display name */
    name?: string;
    /** Email address */
    email?: string;
    /** Profile picture URL */
    picture?: string;
    /** Avatar URL */
    avatar_url?: string;
    /** Username (Discord) */
    username?: string;
    /** Discord discriminator */
    discriminator?: string;
    /** GitHub login */
    login?: string;
    /** GitHub avatar */
    avatar?: string;
    /** Google picture */
    image?: string;
  }

  interface Account {
    /** Provider name */
    provider: string;
    /** Provider account ID */
    providerAccountId: string;
    /** Access token */
    access_token?: string;
    /** Refresh token */
    refresh_token?: string;
    /** Token expiry */
    expires_at?: number;
    /** Token type */
    token_type?: string;
    /** OAuth scope */
    scope?: string;
    /** ID token */
    id_token?: string;
  }
}

// ============================================
// JWT TYPE AUGMENTATION
// ============================================
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** User ID */
    id: string;
    /** Username */
    username?: string;
    /** User role */
    role?: string;
    /** Current plan */
    plan?: string;
    /** Array of permissions */
    permissions?: string[];
    /** Avatar URL */
    avatar?: string;
    /** User email */
    email?: string;
    /** Account status */
    status?: string;
    /** Access token (if using OAuth) */
    accessToken?: string;
    /** Refresh token (if using OAuth) */
    refreshToken?: string;
    /** Token expiry timestamp */
    expiresAt?: number;
    /** Provider name */
    provider?: string;
    /** Issued at timestamp */
    iat?: number;
    /** Expiry timestamp */
    exp?: number;
    /** JTI (JWT ID) */
    jti?: string;
  }
}

// ============================================
// AUTH OPTIONS TYPE AUGMENTATION
// ============================================
declare module "next-auth" {
  interface AuthOptions {
    /** Custom secret */
    secret?: string;
    /** Session configuration */
    session?: {
      strategy?: "jwt" | "database";
      maxAge?: number;
      updateAge?: number;
      generateSessionToken?: () => string;
    };
    /** Custom pages */
    pages?: {
      signIn?: string;
      signOut?: string;
      error?: string;
      verifyRequest?: string;
      newUser?: string;
    };
    /** Callbacks */
    callbacks?: {
      signIn?: (params: {
        user: User;
        account: Account | null;
        profile?: Profile;
        email?: { verificationRequest?: boolean };
        credentials?: Record<string, any>;
      }) => boolean | Promise<boolean>;
      redirect?: (params: { url: string; baseUrl: string }) => string | Promise<string>;
      session?: (params: { session: Session; token: JWT; user: User }) => Session | Promise<Session>;
      jwt?: (params: {
        token: JWT;
        user?: User;
        account?: Account | null;
        profile?: Profile;
        trigger?: "signIn" | "signUp" | "update";
        isNewUser?: boolean;
        session?: any;
      }) => JWT | Promise<JWT>;
    };
    /** Events */
    events?: {
      signIn?: (message: { user: User; account: Account | null; profile?: Profile; isNewUser?: boolean }) => void | Promise<void>;
      signOut?: (message: { token: JWT; session?: Session }) => void | Promise<void>;
      createUser?: (message: { user: User }) => void | Promise<void>;
      updateUser?: (message: { user: User }) => void | Promise<void>;
      linkAccount?: (message: { user: User; account: Account; profile?: Profile }) => void | Promise<void>;
      session?: (message: { session: Session; token: JWT }) => void | Promise<void>;
    };
  }
}

// ============================================
// CLIENT-SIDE TYPE AUGMENTATION
// ============================================
declare module "next-auth/react" {
  interface SignInResponse {
    error?: string;
    status: number;
    ok: boolean;
    url: string | null;
  }

  interface SignOutResponse {
    url: string;
  }

  interface UseSessionOptions {
    required?: boolean;
    onUnauthenticated?: () => void;
  }

  interface SessionProviderProps {
    children: React.ReactNode;
    session?: Session | null;
    baseUrl?: string;
    basePath?: string;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }
}

// ============================================
// REQUEST TYPE AUGMENTATION
// ============================================
declare module "next/server" {
  interface NextRequest {
    /** Get the authenticated session from the request */
    auth?: Session | null;
  }
}

// ============================================
// ENVIRONMENT VARIABLES TYPE
// ============================================
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // NextAuth
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET?: string;
      
      // Backend
      BACKEND_BASE_URL: string;
      BACKEND_APP_NAME: string;
      BACKEND_OWNER_ID: string;
      BACKEND_SECRET: string;
      
      // Session
      SESSION_COOKIE_NAME?: string;
      SESSION_MAX_AGE?: string;
      
      // OAuth
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      GITHUB_CLIENT_ID?: string;
      GITHUB_CLIENT_SECRET?: string;
      DISCORD_CLIENT_ID?: string;
      DISCORD_CLIENT_SECRET?: string;
      
      // App
      NEXT_PUBLIC_APP_NAME?: string;
      NEXT_PUBLIC_APP_URL?: string;
      NODE_ENV?: "development" | "production" | "test";
    }
  }
}

// ============================================
// HELPER TYPE GUARDS
// ============================================
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin" || session?.user?.role === "super_admin";
}

export function hasPermission(session: Session | null, permission: string): boolean {
  return session?.user?.permissions?.includes(permission) ?? false;
}

export function isAuthenticated(session: Session | null): session is Session {
  return session !== null && session?.user !== undefined;
}

export function getSessionUser(session: Session | null) {
  return session?.user ?? null;
}

// ============================================
// EXPORT FOR CONVENIENCE
// ============================================
export type AuthSession = Session;
export type AuthUser = Session["user"];
export type AuthJWT = import("next-auth/jwt").JWT;