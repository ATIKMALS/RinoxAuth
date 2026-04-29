import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthUser } from "@/lib/types";

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

interface AuthState {
  // User data
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
  sessionExpiry: number | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  
  // Session management
  updateActivity: () => void;
  checkSession: () => boolean;
  extendSession: (minutes?: number) => void;
  
  // Permissions
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  
  // Computed
  isAdmin: () => boolean;
  isSessionExpired: () => boolean;
  getSessionRemaining: () => number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      lastActivity: Date.now(),
      sessionExpiry: null,

      // Set user
      setUser: (user) => {
        const expiry = user ? Date.now() + SESSION_TIMEOUT : null;
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          lastActivity: Date.now(),
          sessionExpiry: expiry,
        });
      },

      // Update partial user data
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
            lastActivity: Date.now(),
          });
        }
      },

      // Clear user (logout)
      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          lastActivity: 0,
          sessionExpiry: null,
        });
        
        // Clear persisted storage
        localStorage.removeItem("auth-storage");
        sessionStorage.removeItem("auth-storage");
      },

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),

      // Update last activity timestamp
      updateActivity: () => {
        const { sessionExpiry } = get();
        if (sessionExpiry) {
          set({
            lastActivity: Date.now(),
            sessionExpiry: Date.now() + SESSION_TIMEOUT,
          });
        }
      },

      // Check if session is valid
      checkSession: () => {
        const { isAuthenticated, sessionExpiry } = get();
        if (!isAuthenticated || !sessionExpiry) return false;
        return Date.now() < sessionExpiry;
      },

      // Extend session
      extendSession: (minutes = 30) => {
        const { isAuthenticated } = get();
        if (isAuthenticated) {
          set({
            sessionExpiry: Date.now() + minutes * 60 * 1000,
            lastActivity: Date.now(),
          });
        }
      },

      // Check if user has specific permission
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user?.permissions) return false;
        return user.permissions.includes(permission);
      },

      // Check if user has specific role
      hasRole: (role: string) => {
        const { user } = get();
        if (!user?.role) return false;
        return user.role === role;
      },

      // Check if admin
      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin" || user?.role === "super_admin";
      },

      // Check if session expired
      isSessionExpired: () => {
        const { sessionExpiry } = get();
        if (!sessionExpiry) return false;
        return Date.now() > sessionExpiry;
      },

      // Get remaining session time in minutes
      getSessionRemaining: () => {
        const { sessionExpiry } = get();
        if (!sessionExpiry) return 0;
        const remaining = sessionExpiry - Date.now();
        return Math.max(0, Math.floor(remaining / 60000));
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        // Use localStorage for persistent storage
        // Use sessionStorage for session-only storage
        if (typeof window !== "undefined") {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// ============================================
// ACTIVITY TRACKER HOOK
// ============================================
export function useActivityTracker() {
  const updateActivity = useAuthStore((state) => state.updateActivity);
  
  if (typeof window !== "undefined") {
    // Track user activity
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Check session every minute
    const interval = setInterval(() => {
      const checkSession = useAuthStore.getState().checkSession;
      if (!checkSession()) {
        useAuthStore.getState().clearUser();
      }
    }, 60000);
    
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }
}

// ============================================
// SELECTOR HOOKS (Performance optimized)
// ============================================
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin());
export const useSessionRemaining = () => useAuthStore((state) => state.getSessionRemaining());

// ============================================
// TYPES UPDATE (add to lib/types.ts if needed)
// ============================================
// Extend AuthUser interface:
// export interface AuthUser {
//   id: string;
//   username: string;
//   email?: string;
//   role?: "admin" | "super_admin" | "user" | "reseller";
//   permissions?: string[];
//   plan?: string;
//   avatar?: string;
//   created_at?: string;
//   last_login?: string;
// }