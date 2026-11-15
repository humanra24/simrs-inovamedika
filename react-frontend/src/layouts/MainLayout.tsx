import { useContext } from "react";
import { AuthContext } from "../context/AuthContextDef";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Activity,
  LogOut,
  Database,
} from "lucide-react";

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
      roles: ["Petugas Pendaftaran", "Administrator"],
    },
    {
      path: "/pemeriksaan",
      label: "Pemeriksaan",
      icon: Stethoscope,
      roles: ["Dokter", "Administrator"],
    },
    // Menu lain menyusul
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-6 h-6 text-blue-700" />
          </div>
          <span className="font-bold text-lg text-slate-800">SIMRS</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems
            .filter((item) => !user?.role || item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-slate-400"}`}
                  />{" "}
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
