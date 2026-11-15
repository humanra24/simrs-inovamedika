import { useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContextDef";
import type { User } from "../types";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    // Sesuaikan dengan struktur response Yii2 Anda
    const data = response.data.data || response.data;

    if (!data.token) throw new Error("Token tidak ditemukan");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
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
