import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import {
  Loader2,
  History,
  Clock,
  UserCheck,
  CheckCircle2,
  Search,
  CalendarDays,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import type { VisitHistory } from "../../types";

type StatusFilter = "all" | "waiting" | "examined" | "completed";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "waiting", label: "Menunggu" },
  { key: "examined", label: "Diperiksa" },
  { key: "completed", label: "Selesai" },
];

const getInitials = (name?: string) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const formatDate = (value: string) => {
  const d = new Date(value);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const StatusBadge = ({ status }: { status: string }) => {
  const base =
    "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";
  switch (status) {
    case "waiting":
      return (
        <span className={`${base} bg-amber-50 text-amber-700 ring-amber-200`}>
          <Clock className="h-3 w-3" /> Menunggu
        </span>
      );
    case "examined":
      return (
        <span className={`${base} bg-blue-50 text-blue-700 ring-blue-200`}>
          <UserCheck className="h-3 w-3" /> Diperiksa
        </span>
      );
    case "completed":
      return (
        <span
          className={`${base} bg-emerald-50 text-emerald-700 ring-emerald-200`}
        >
          <CheckCircle2 className="h-3 w-3" /> Selesai
        </span>
      );
    default:
      return (
        <span className={`${base} bg-slate-50 text-slate-700 ring-slate-200`}>
          {status}
        </span>
      );
  }
};

export default function RiwayatPendaftaran() {
  const [history, setHistory] = useState<VisitHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/visits/history");
        setHistory(res.data.data || []);
      } catch {
        toast.error("Gagal memuat riwayat.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: history.length,
      waiting: 0,
      examined: 0,
      completed: 0,
    };
    history.forEach((h) => {
      if (h.status in c) c[h.status as StatusFilter] += 1;
    });
    return c;
  }, [history]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter((h) => {
      if (filter !== "all" && h.status !== filter) return false;
      if (!q) return true;
      return (
        h.patient?.full_name?.toLowerCase().includes(q) ||
        h.patient?.medical_record_number?.toLowerCase().includes(q) ||
        String(h.queue_number).toLowerCase().includes(q)
      );
    });
  }, [history, query, filter]);

  if (loading)
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  if (history.length === 0)
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center">
        <div className="mb-4 rounded-2xl bg-slate-100 p-4">
          <History className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-lg font-semibold text-slate-800">
          Belum ada riwayat kunjungan
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Pendaftaran yang sudah dibuat akan tampil di sini.
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, No. RM, atau antrean..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? "bg-white/25" : "bg-white text-slate-500"
                  }`}
                >
                  {counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Tidak ada data yang cocok dengan pencarian.
        </div>
      ) : (
        <>
          {/* Tabel (desktop) */}
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">Pasien</th>
                  <th className="px-6 py-4 font-semibold">Antrean</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Poli / Dokter</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((h) => (
                  <tr
                    key={h.id}
                    className="transition-colors hover:bg-blue-50/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-bold text-blue-700">
                          {getInitials(h.patient?.full_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {h.patient?.full_name || "-"}
                          </p>
                          <p className="text-xs text-slate-500">
                            RM {h.patient?.medical_record_number || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-bold text-blue-700">
                        {h.queue_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(h.visit_date)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {h.polyclinic?.name || "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {h.doctor?.name || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={h.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kartu (mobile) */}
          <div className="space-y-3 md:hidden">
            {filtered.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-bold text-blue-700">
                      {getInitials(h.patient?.full_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {h.patient?.full_name || "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        RM {h.patient?.medical_record_number || "-"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-bold text-blue-700">
                    {h.queue_number}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(h.visit_date)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Stethoscope className="h-3.5 w-3.5" />
                    {h.polyclinic?.name || "-"} · {h.doctor?.name || "-"}
                  </p>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <StatusBadge status={h.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
