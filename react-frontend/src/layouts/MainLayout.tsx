import { useContext } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../context/AuthContextDef";
import { Button } from "@/components/ui/button";

import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Activity,
  LogOut,
  Database,
  Pill,
  TestTube,
  DollarSign,
} from "lucide-react";

import type { User } from "../types";

const menuItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [
      "Administrator",
      "Kasir",
      "Dokter",
      "Petugas Pendaftaran",
      "Petugas Farmasi",
      "Petugas Laboratorium",
    ],
  },
  {
    path: "/master-data",
    label: "Master Data",
    icon: Database,
    roles: ["Administrator"],
  },
  {
    path: "/pendaftaran",
    label: "Pendaftaran",
    icon: Users,
    roles: ["Administrator", "Petugas Pendaftaran"],
  },
  {
    path: "/pemeriksaan",
    label: "Pemeriksaan",
    icon: Stethoscope,
    roles: ["Administrator", "Dokter"],
  },
  {
    path: "/farmasi",
    label: "Farmasi",
    icon: Pill,
    roles: ["Administrator", "Petugas Farmasi"],
  },
  {
    path: "/lab",
    label: "Laboratorium",
    icon: TestTube,
    roles: ["Administrator", "Petugas Laboratorium"],
  },
  {
    path: "/bill",
    label: "Kasir",
    icon: DollarSign,
    roles: ["Administrator", "Kasir"],
  },
];

const hasMenuAccess = (user: User | null, allowedRoles: string[]) => {
  if (!user) return false;

  // Mendukung multi-role
  const userRoles = user.roles?.length
    ? user.roles
    : user.role
      ? [user.role]
      : [];

  return userRoles.some((role) => allowedRoles.includes(role));
};

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const filteredMenus = menuItems.filter((item) =>
    hasMenuAccess(user, item.roles),
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-6 h-6 text-blue-700" />
          </div>

          <span className="font-bold text-lg text-slate-800">SIMRS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenus.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-blue-700" : "text-slate-400"
                  }`}
                />

                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.username}
              </p>

              <p className="text-xs text-slate-500 truncate">
                {user?.role || "Tidak ada role"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
