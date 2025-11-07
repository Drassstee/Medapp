import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import api, { setAuthToken } from "../services/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: "doctor" | "patient";
  doctorProfile?: Record<string, unknown> | null;
  patientProfile?: Record<string, unknown> | null;
}

interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "medapp_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [isLoading, setIsLoading] = useState<boolean>(!!token);
  const navigate = useNavigate();

  const handleAuthSuccess = useCallback((response: AuthResponse) => {
    setToken(response.token);
    setAuthToken(response.token);
    setUser(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const { data } = await api.post<AuthResponse>("/auth/login", {
          email,
          password,
        });
        handleAuthSuccess(data);
        notifications.show({
          title: "Welcome back",
          message: `Hello ${data.user.fullName}!`,
          color: "blue",
        });
        if (data.user.role === "doctor") {
          navigate("/dashboard/doctor", { replace: true });
        } else {
          navigate("/dashboard/patient", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess, navigate]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsLoading(true);
      try {
        const { data } = await api.post<AuthResponse>("/auth/register", payload);
        handleAuthSuccess(data);
        notifications.show({
          title: "Account ready",
          message: "You are now part of MedApp",
          color: "teal",
        });
        if (data.user.role === "doctor") {
          navigate("/dashboard/doctor", { replace: true });
        } else {
          navigate("/dashboard/patient", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess, navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem(TOKEN_KEY);
    navigate("/", { replace: true });
  }, [navigate]);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const { data } = await api.get<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch (error) {
      console.error("Failed to refresh profile", error);
      logout();
    }
  }, [logout, token]);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, register, logout, refreshProfile }),
    [isLoading, login, logout, register, refreshProfile, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};


