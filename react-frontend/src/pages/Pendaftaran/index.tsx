import { useState } from "react";
import { ClipboardPlus, History } from "lucide-react";
import FormPendaftaran from "./FormPendaftaran";
import RiwayatPendaftaran from "./RiwayatPendaftaran";

const TABS = [
  { key: "new", label: "Pendaftaran Baru", icon: ClipboardPlus },
  { key: "history", label: "Riwayat", icon: History },
] as const;

export default function Pendaftaran() {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25">
            <ClipboardPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Pendaftaran
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Kelola pendaftaran baru dan riwayat kunjungan pasien.
            </p>
          </div>
        </div>

        {/* Segmented control */}
        <div className="inline-flex w-full rounded-2xl bg-slate-100 p-1 sm:w-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none ${
                  active
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/60"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "new" ? <FormPendaftaran /> : <RiwayatPendaftaran />}
    </div>
  );
}
