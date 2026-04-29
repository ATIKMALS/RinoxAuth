import type { NextAuthOptions, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/lib/config";

async function syncOAuthUser(params: {
  provider: string;
  providerAccountId: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  try {
    const res = await fetch(`${env.BACKEND_BASE_URL}/api/auth/oauth-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: params.provider,
        provider_account_id: params.providerAccountId,
        username: params.name,
        email: params.email,
        image: params.image,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error("OAuth sync failed");
    const data = await res.json();
    return data.data || {
      id: params.providerAccountId,
      username: params.name || params.email?.split("@")[0] || "user",
      role: "user",
      plan: "free",
    };
  } catch {
    return {
      id: params.providerAccountId,
      username: params.name || params.email?.split("@")[0] || "user",
      role: "user",
      plan: "free",
    };
  }
}

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 60, 
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // ✅ Always include OAuth providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || env.GITHUB_CLIENT_SECRET || "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || env.DISCORD_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        app_id: { label: "Application ID", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) return null;
        
        // Get app_id from request cookies
        let appId = credentials.app_id;
        if (!appId && req?.headers?.cookie) {
          const cookies = req.headers.cookie.split(';').reduce((acc: Record<string, string>, cookie: string) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          appId = cookies['currentAppId'];
        }
        
        if (!appId) {
          console.error('❌ No app_id found for login');
          return null;
        }
        
        try {
          const res = await fetch(`${env.BACKEND_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              username: credentials.username, 
              password: credentials.password,
              app_id: parseInt(appId)
            }),
          });

          if (!res.ok) return null;
          const data = await res.json();
          
          if (data.success && data.data) {
            return {
              id: String(data.data.id || "1"),
              name: data.data.username,
              email: data.data.email,
              role: "admin",
              plan: data.data.plan || "enterprise",
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      return !!account;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        if (account.provider !== "credentials") {
          const synced = await syncOAuthUser({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            name: user.name,
            email: user.email,
            image: user.image,
          });
          token.username = synced.username;
          token.role = synced.role;
          token.plan = synced.plan;
        } else {
          token.username = user.name || "user";
          token.role = (user as any).role || "admin";
          token.plan = (user as any).plan || "free";
        }
        token.id = user.id || account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub || "");
        session.user.username = String(token.username || "user");
        session.user.role = String(token.role || "admin");
        session.user.plan = String(token.plan || "free");
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET || env.BACKEND_SECRET,
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email?: string | null;
      role: string;
      plan: string;
      name?: string | null;
      image?: string | null;
    };
  }
  interface User {
    role?: string;
    plan?: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    role?: string;
    plan?: string;
  }
}
