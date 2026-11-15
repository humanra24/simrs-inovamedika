import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AuthContext } from "./context/AuthContextDef";
import { useContext } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pendaftaran from "./pages/Pendaftaran";
import MainLayout from "./layouts/MainLayout";
import { Toaster } from "sonner";
import Pemeriksaan from "./pages/Pemeriksaan";
import MasterData from "./pages/MasterData";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="master-data" element={<MasterData />} />
            <Route path="pendaftaran" element={<Pendaftaran />} />
            <Route path="pemeriksaan" element={<Pemeriksaan />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
