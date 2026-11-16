import { useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContextDef";
import type { User } from "../types";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      // Mendukung response Yii2 dengan atau tanpa wrapper data
      const data = response.data.data ?? response.data;

      if (!data.token) {
        throw new Error("Token tidak ditemukan");
      }

      if (!data.user) {
        throw new Error("Data user tidak ditemukan");
      }

      const loggedInUser: User = {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        roles: data.user.roles ?? [],
      };

      if (!loggedInUser.role) {
        throw new Error("Role pengguna tidak ditemukan");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);

      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
