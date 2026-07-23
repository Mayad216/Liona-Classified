import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, AUTH_TOKEN_KEY, ApiError } from "@/lib/api";
import { isLiveApi } from "@/lib/apiMode";
import type { User } from "@/types";

export const AUTH_USER_KEY = "khaleej:auth_user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: User["role"];
  verified: boolean;
  joinedAt: string;
}

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  demoLogin: (role: "lister" | "seeker" | "admin") => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  isAdmin: boolean;
};

const DEMO_ACCOUNTS: Record<
  string,
  { password: string; user: AuthUser }
> = {
  "aisha@khaleej.ae": {
    password: "password",
    user: {
      id: "u1",
      name: "Aisha Al Marri",
      email: "aisha@khaleej.ae",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      role: "lister",
      verified: true,
      joinedAt: "2024-03-15",
    },
  },
  "rohan@khaleej.ae": {
    password: "password",
    user: {
      id: "u2",
      name: "Rohan Mehta",
      email: "rohan@khaleej.ae",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      role: "seeker",
      verified: true,
      joinedAt: "2025-01-08",
    },
  },
  "admin@khaleej.ae": {
    password: "password",
    user: {
      id: "admin",
      name: "Platform Admin",
      email: "admin@khaleej.ae",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
      role: "admin",
      verified: true,
      joinedAt: "2023-01-01",
    },
  },
};

const DEMO_BY_ROLE: Record<"lister" | "seeker" | "admin", AuthUser> = {
  lister: DEMO_ACCOUNTS["aisha@khaleej.ae"].user,
  seeker: DEMO_ACCOUNTS["rohan@khaleej.ae"].user,
  admin: DEMO_ACCOUNTS["admin@khaleej.ae"].user,
};

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function normalizeApiUser(raw: unknown, email: string): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as Record<string, unknown>;
  const role = u.role as User["role"] | undefined;
  if (!role) return null;
  return {
    id: String(u.id ?? email),
    name: String(u.name ?? email.split("@")[0]),
    email: String(u.email ?? email),
    avatar: String(
      u.avatar ??
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
    ),
    role,
    verified: Boolean(u.is_verified ?? u.verified ?? false),
    joinedAt: String(u.created_at ?? u.joinedAt ?? new Date().toISOString()),
  };
}

function persistSession(user: AuthUser, token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    try {
      const res = await api.login(normalized, password);
      const apiUser =
        normalizeApiUser(res.user, normalized) ??
        DEMO_ACCOUNTS[normalized]?.user;
      if (!apiUser) throw new ApiError(422, "Invalid user response");
      persistSession(apiUser, res.token);
      setUser(apiUser);
      return;
    } catch (err) {
      if (isLiveApi()) {
        throw err instanceof ApiError ? err : new ApiError(401, "Invalid email or password");
      }
      const demo = DEMO_ACCOUNTS[normalized];
      if (demo && demo.password === password) {
        const token = `demo-${demo.user.id}-${Date.now()}`;
        persistSession(demo.user, token);
        setUser(demo.user);
        return;
      }
      throw new ApiError(401, "Invalid email or password");
    }
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      const normalized = payload.email.trim().toLowerCase();
      try {
        const res = await api.register({ ...payload, email: normalized });
        const apiUser =
          normalizeApiUser(res.user, normalized) ?? {
            id: `u-${Date.now()}`,
            name: payload.name,
            email: normalized,
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
            role: "seeker" as const,
            verified: false,
            joinedAt: new Date().toISOString(),
          };
        persistSession(apiUser, res.token);
        setUser(apiUser);
      } catch (err) {
        if (isLiveApi()) {
          throw err instanceof ApiError ? err : new ApiError(422, "Registration failed");
        }
        const newUser: AuthUser = {
          id: `u-${Date.now()}`,
          name: payload.name,
          email: normalized,
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
          role: "seeker",
          verified: false,
          joinedAt: new Date().toISOString(),
        };
        persistSession(newUser, `demo-${newUser.id}`);
        setUser(newUser);
      }
    },
    []
  );

  const demoLogin = useCallback((role: "lister" | "seeker" | "admin") => {
    const demoUser = DEMO_BY_ROLE[role];
    persistSession(demoUser, `demo-${demoUser.id}`);
    setUser(demoUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      demoLogin,
      logout,
      updateUser,
      isAdmin: user?.role === "admin",
    }),
    [user, loading, login, register, demoLogin, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
