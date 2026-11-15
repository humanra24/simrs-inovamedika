import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContextDef";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // <-- State Loading
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Mulai loading
    try {
      await login(username, password);
      toast.success("Login berhasil!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Username atau password salah.",
      );
    } finally {
      setIsLoading(false); // Hentikan loading (baik sukses maupun gagal)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
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
                disabled={isLoading} // Nonaktifkan saat loading
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
                disabled={isLoading} // Nonaktifkan saat loading
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading} // Nonaktifkan tombol saat loading
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
