import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, persistToken } from "../services/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = "MEDAPP_TOKEN";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSuccess = useCallback(async (response: AuthResponse) => {
    setToken(response.token);
    setUser(response.user);
    await persistToken(response.token);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    await handleSuccess(data);
  }, [handleSuccess]);

  const register = useCallback(async (payload: Record<string, unknown>) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    await handleSuccess(data);
  }, [handleSuccess]);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await persistToken(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      setToken(storedToken);
      const { data } = await api.get<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch (error) {
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout, refresh }),
    [isLoading, login, logout, refresh, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};


