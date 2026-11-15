import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Loader2, History, Clock, UserCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { VisitHistory } from "../../types";

export default function RiwayatPendaftaran() {
  const [history, setHistory] = useState<VisitHistory[]>([]);
  const [loading, setLoading] = useState(true);

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

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return (
          <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Menunggu
          </span>
        );
      case "examined":
        return (
          <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
            <UserCheck className="w-3 h-3" /> Diperiksa
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold">
            {status}
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <History className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-lg font-medium text-slate-700">
            Belum ada riwayat kunjungan.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Antrean</th>
                <th className="px-6 py-4">Nama Pasien</th>
                <th className="px-6 py-4">No. RM</th>
                <th className="px-6 py-4">Poli / Dokter</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h) => (
                <tr
                  key={h.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {h.visit_date}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md">
                      {h.queue_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {h.patient?.full_name || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {h.patient?.medical_record_number || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">
                      {h.polyclinic?.name || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {h.doctor?.name || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">{renderStatusBadge(h.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
