import { env } from "@/lib/config";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ============================================
// CUSTOM API ERROR CLASS
// ============================================
class ApiError extends Error {
  status: number;
  data: any;
  path: string;
  timestamp: string;

  constructor(message: string, status: number, path: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  get isNotFound(): boolean { return this.status === 404; }
  get isUnauthorized(): boolean { return this.status === 401; }
  get isForbidden(): boolean { return this.status === 403; }
  get isValidationError(): boolean { return this.status === 422; }
  get isServerError(): boolean { return this.status >= 500; }
  get isConflict(): boolean { return this.status === 409; }
  get isRateLimited(): boolean { return this.status === 429; }
  get isTimeout(): boolean { return this.status === 408; }
  get isNetworkError(): boolean { return this.status === 0; }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      path: this.path,
      timestamp: this.timestamp,
      data: this.data,
    };
  }
}

// ============================================
// REQUEST OPTIONS TYPE
// ============================================
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  useAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
  responseType?: "json" | "text" | "blob";
}

// ============================================
// ✅ COOKIE HELPER FUNCTIONS
// ============================================

async function getCurrentAppId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("currentAppId")?.value || null;
  } catch {
    return null;
  }
}

export async function setAppCookie(appId: string): Promise<{ success: boolean; appId: string }> {
  try {
    const cookieStore = await cookies();
    cookieStore.set("currentAppId", appId, {
      path: "/",
      maxAge: 86400,
      httpOnly: true,
      sameSite: "lax",
    });
    console.log(`✅ currentAppId cookie set to: ${appId}`);
    return { success: true, appId };
  } catch (error) {
    console.error("❌ Failed to set cookie:", error);
    return { success: false, appId };
  }
}

export async function clearAppCookie(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("currentAppId");
    console.log("✅ currentAppId cookie cleared");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function autoSetFirstAppCookie(username: string): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const existingAppId = cookieStore.get("currentAppId")?.value;
    
    if (existingAppId) {
      console.log(`ℹ️ Cookie already exists: ${existingAppId}`);
      return existingAppId;
    }

    const BASE_URL = env.BACKEND_BASE_URL || "http://localhost:8000";
    const res = await fetch(`${BASE_URL}/api/apps?created_by=${encodeURIComponent(username)}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.log("⚠️ Failed to fetch apps for auto cookie set");
      return null;
    }

    const data = await res.json();
    const apps = data?.data || [];
    
    if (apps.length > 0) {
      const firstAppId = String(apps[0].id);
      cookieStore.set("currentAppId", firstAppId, {
        path: "/",
        maxAge: 86400,
        httpOnly: true,
        sameSite: "lax",
      });
      console.log(`✅ Auto-set cookie to first app: ${firstAppId} (${apps[0].name})`);
      return firstAppId;
    }
    
    return null;
  } catch (error) {
    console.error("❌ Failed to auto-set app cookie:", error);
    return null;
  }
}

// ============================================
// SESSION HELPER
// ============================================
async function getSessionToken(): Promise<string | undefined> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return (session as any).accessToken || undefined;
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) return sessionCookie;

    const nextAuthToken = cookieStore.get("next-auth.session-token")?.value;
    if (nextAuthToken) return nextAuthToken;

    return undefined;
  } catch {
    return undefined;
  }
}

// ============================================
// BUILD URL WITH QUERY PARAMS
// ============================================
function buildUrl(path: string, params?: Record<string, any>): string {
  const url = `${env.BACKEND_BASE_URL}${path}`;
  
  if (!params || Object.keys(params).length === 0) return url;
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

// ============================================
// ✅ CORE REQUEST FUNCTION - FIXED Double app_id
// ============================================
async function request<T>(
  path: string, 
  options: RequestOptions = {}
): Promise<T> {
  const { 
    body, 
    timeout = 30000, 
    retries = 1,
    retryDelay = 1000,
    useAuth = true,
    params,
    responseType = "json",
    ...init 
  } = options;

  const appId = await getCurrentAppId();
  const finalParams: Record<string, any> = { ...params };

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(appId ? { "X-Application-Id": appId } : {}),
    ...(init?.headers as Record<string, string> ?? {})
  };

  // Add auth token if required
  if (useAuth) {
    const token = await getSessionToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Build full URL with params
  const url = buildUrl(path, finalParams);

  // Log the request URL
  if (env.NODE_ENV === "development") {
    console.log(`📡 API Request: ${init.method || "GET"} ${url}`);
  }

  // Build fetch options
  const fetchOptions: RequestInit = {
    ...init,
    headers,
    cache: "no-store",
    ...(body !== undefined ? { 
      method: init.method || "POST",
      body: JSON.stringify(body) 
    } : {}),
  };

  // Retry logic
  let lastError: Error | null = null;
  const maxRetries = retries;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const startTime = performance.now();
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      clearTimeout(timeoutId);

      if (res.status === 204) {
        return null as T;
      }

      let data: any;
      
      if (responseType === "blob") {
        data = await res.blob();
      } else if (responseType === "text") {
        data = await res.text();
      } else {
        const contentType = res.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          try {
            data = await res.json();
          } catch {
            data = null;
          }
        } else {
          try {
            data = await res.text();
          } catch {
            data = null;
          }
        }
      }

      if (env.NODE_ENV === "development") {
        console.log(
          `✅ API [${res.status}] ${init.method || "GET"} ${path} (${responseTime}ms)`
        );
      }

      if (!res.ok) {
        const errorMessage = data?.message || 
                            data?.detail || 
                            data?.error ||
                            (typeof data === "string" ? data : null) ||
                            `Request failed with status ${res.status}`;
        
        if (env.NODE_ENV === "development") {
          console.error(
            `❌ API Error [${res.status}] ${init.method || "GET"} ${path}:`,
            errorMessage
          );
        }

        if (res.status === 401) {
          console.warn("Session expired or invalid");
        }

        throw new ApiError(errorMessage, res.status, path, data);
      }

      if (data && typeof data === "object" && "data" in data) {
        return data.data as T;
      }

      return data as T;

    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(
          `Request timeout after ${timeout}ms`,
          408,
          path
        );
      }

      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      lastError = error as Error;

      if (attempt >= maxRetries) {
        break;
      }

      const delay = Math.min(retryDelay * Math.pow(2, attempt), 10000);
      
      if (env.NODE_ENV === "development") {
        console.warn(
          `🔄 Retrying ${path} (attempt ${attempt + 1}/${maxRetries}) in ${delay}ms...`
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new ApiError(
    lastError?.message || "Network request failed. Please check your connection.",
    0,
    path
  );
}

// ============================================
// SAFE REQUEST (NON-THROWING)
// ============================================
interface SafeResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
}

async function safeRequest<T>(
  path: string, 
  options: RequestOptions = {}
): Promise<SafeResponse<T>> {
  try {
    const data = await request<T>(path, options);
    return { data, error: null, status: 200, ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { 
        data: null, 
        error: error.message, 
        status: error.status,
        ok: false
      };
    }
    
    const message = error instanceof Error ? error.message : "Network error";
    return { 
      data: null, 
      error: message, 
      status: 0,
      ok: false
    };
  }
}

// ============================================
// API CLIENT
// ============================================
export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) => 
    request<T>(path, { ...options, method: "GET" }),
    
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
    
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),
    
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
    
  del: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),

  safe: {
    get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
      safeRequest<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
      safeRequest<T>(path, { ...options, method: "POST", body }),
    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
      safeRequest<T>(path, { ...options, method: "PUT", body }),
    patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
      safeRequest<T>(path, { ...options, method: "PATCH", body }),
    del: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
      safeRequest<T>(path, { ...options, method: "DELETE" }),
  },

  health: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${env.BACKEND_BASE_URL}/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  users: {
    list: (params?: any) => api.get<any[]>("/api/users", { params }),
    get: (id: number) => api.get<any>(`/api/users/${id}`),
    create: (data: any) => api.post<any>("/api/admin/users", data),
    update: (id: number, data: any) => api.patch<any>(`/api/admin/users/${id}`, data),
    delete: (id: number) => api.del<any>(`/api/admin/users/${id}`),
    resetHwid: (id: number) => api.post<any>(`/api/admin/users/${id}/reset-hwid`, {}),
  },

  licenses: {
    list: (params?: any) => api.get<any[]>("/api/licenses", { params }),
    create: (data: any) => api.post<any>("/api/admin/licenses", data),
    delete: (id: number) => api.del<any>(`/api/admin/licenses/${id}`),
  },

  apps: {
    list: (params?: any) => api.get<any[]>("/api/apps", { params }),
    get: (id: number) => api.get<any>(`/api/apps/${id}`),
    create: (data: any) => api.post<any>("/api/admin/apps", data),
    delete: (id: number) => api.del<any>(`/api/admin/apps/${id}`),
    credentials: (id: number) => api.get<any>(`/api/admin/apps/${id}/credentials`),
  },

  analytics: {
    get: (params?: any) => api.get<any>("/api/analytics", { params }),
  },

  activity: {
    list: (params?: any) => api.get<any[]>("/api/activity-logs", { params }),
    clear: () => api.del<any>("/api/admin/activity-logs"),
  },

  resellers: {
    list: (params?: any) => api.get<any[]>("/api/resellers", { params }),
    create: (data: any) => api.post<any>("/api/admin/resellers", data),
    delete: (id: number) => api.del<any>(`/api/admin/resellers/${id}`),
  },

  settings: {
    get: () => api.get<any>("/api/settings"),
    update: (data: any) => api.patch<any>("/api/settings", data),
  },

  cookie: {
    set: setAppCookie,
    get: getCurrentAppId,
    clear: clearAppCookie,
    autoSet: autoSetFirstAppCookie,
  },
};

export { ApiError };
export type { RequestOptions, SafeResponse };