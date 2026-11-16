import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContextDef";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

const sampleAccounts = [
  { role: "Administrator", username: "admin", password: "123456" },
  { role: "Petugas Pendaftaran", username: "pendaftaran", password: "123456" },
  { role: "Dokter", username: "dokter", password: "123456" },
  { role: "Petugas Farmasi", username: "farmasi", password: "123456" },
  { role: "Petugas Laboratorium", username: "lab", password: "123456" },
  { role: "Kasir", username: "kasir", password: "123456" },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(username, password);
      toast.success("Login berhasil!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        apiError.response?.data?.message || "Username atau password salah.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseAccount = (account: (typeof sampleAccounts)[number]) => {
    setUsername(account.username);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Login Form */}
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                SIMRS Inovamedika
              </h1>

              <p className="text-slate-500 mt-2">Silakan login ke akun Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    className="pl-10 h-11"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    className="pl-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
          </div>

          {/* Demo Accounts */}
          <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-8 md:p-10">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Akun Demo</h2>
              <p className="text-sm text-slate-500 mt-1">
                Pilih akun untuk mengisi form login otomatis.
              </p>
            </div>

            <div className="space-y-3">
              {sampleAccounts.map((account) => (
                <div
                  key={account.username}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {account.role}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {account.username} / {account.password}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleUseAccount(account)}
                  >
                    Gunakan
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-blue-700">
                Password seluruh akun demo: <strong>123456</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
