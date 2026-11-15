import { useState } from "react";
import { History } from "lucide-react";
import FormPendaftaran from "./FormPendaftaran";
import RiwayatPendaftaran from "./RiwayatPendaftaran";

export default function Pendaftaran() {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Pendaftaran
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola pendaftaran baru dan riwayat kunjungan pasien.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "new" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Pendaftaran Baru
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              <History className="w-4 h-4" /> Riwayat
            </button>
          </div>
        </div>
      </div>

      {activeTab === "new" ? <FormPendaftaran /> : <RiwayatPendaftaran />}
    </div>
  );
}
