import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
  Pill,
  Loader2,
  FileText,
  User,
  Stethoscope,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { PrescriptionDetail } from "@/types";
import DetailResep from "./DetailResep";

export default function Farmasi() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionDetail | null>(null);
  const [dispensingId, setDispensingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // --- Effect: fetch data inline dengan cleanup ---
  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const res = await api.get("/prescriptions/pending");
        if (!ignore) {
          setPrescriptions(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          toast.error("Gagal memuat daftar resep.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);

  // --- Refresh manual: dipanggil dari event handler (bukan effect) ---
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await api.get("/prescriptions/pending");
      setPrescriptions(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat daftar resep.");
    } finally {
      setLoading(false);
    }
  };

  // Serahkan obat ke pasien
  const handleDispense = async (prescriptionId: number) => {
    if (
      !window.confirm(
        "Serahkan obat ini ke pasien? Stok akan otomatis berkurang.",
      )
    )
      return;

    setDispensingId(prescriptionId);
    try {
      await api.post(`/prescriptions/${prescriptionId}/dispense`);
      toast.success("Obat berhasil diserahkan ke pasien.");

      setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
      setSelectedPrescription(null);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Gagal menyerahkan obat.",
      );
    } finally {
      setDispensingId(null);
    }
  };

  // Batalkan resep
  const handleCancel = async (prescriptionId: number) => {
    if (
      !window.confirm(
        "Batalkan resep ini? Resep akan dihapus dan tidak bisa dikembalikan.",
      )
    )
      return;

    setCancellingId(prescriptionId);
    try {
      await api.delete(`/prescriptions/${prescriptionId}`);
      toast.success("Resep berhasil dibatalkan.");

      setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
      setSelectedPrescription(null);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Gagal membatalkan resep.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-8 h-8 text-purple-600" /> Farmasi
          </h1>
          <p className="text-slate-500 mt-1">
            Daftar resep yang menunggu diserahkan ke pasien.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Statistik ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Total Pending</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {prescriptions.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Total Item Obat</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {prescriptions.reduce((sum, p) => sum + (p.items?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Status</p>
          <p className="text-sm font-semibold text-orange-600 mt-2 flex items-center gap-1">
            <Clock className="w-4 h-4" /> Menunggu Penyerahan
          </p>
        </div>
      </div>

      {/* Daftar Resep */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-green-300 mb-3" />
          <p className="text-lg font-medium text-slate-700">
            Tidak ada resep pending.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Semua resep sudah diserahkan atau belum ada resep baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prescriptions.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all overflow-hidden flex flex-col"
            >
              {/* Header card */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                    Resep #{p.id}
                  </span>
                  {p.visit?.queue_number && (
                    <span className="text-xs font-medium text-slate-500">
                      Antrean {p.visit.queue_number}
                    </span>
                  )}
                </div>
                <Pill className="w-4 h-4 text-purple-500" />
              </div>

              {/* Body card */}
              <div className="p-5 flex-1">
                <h3 className="font-bold text-lg text-slate-900 mb-1">
                  {p.visit?.patient?.full_name || "Pasien"}
                </h3>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> RM:{" "}
                  {p.visit?.patient?.medical_record_number || "-"}
                </p>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
                  <Stethoscope className="w-3.5 h-3.5" />{" "}
                  {p.visit?.polyclinic?.name || "Poli"}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    {p.items?.length || 0} item obat:
                  </p>
                  <ul className="text-sm text-slate-700 space-y-0.5">
                    {p.items?.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="truncate">
                        • {item.name}{" "}
                        <span className="text-purple-600 font-semibold">
                          x{item.quantity}
                        </span>
                      </li>
                    ))}
                    {(p.items?.length || 0) > 3 && (
                      <li className="text-xs text-slate-500 italic">
                        +{(p.items?.length || 0) - 3} lainnya...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Footer actions */}
              <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedPrescription(p)}
                  >
                    <FileText className="w-4 h-4 mr-1" /> Detail
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => handleDispense(p.id)}
                    disabled={dispensingId === p.id || cancellingId === p.id}
                  >
                    {dispensingId === p.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />{" "}
                        Proses...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Serahkan
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleCancel(p.id)}
                  disabled={dispensingId === p.id || cancellingId === p.id}
                >
                  {cancellingId === p.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />{" "}
                      Membatalkan...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" /> Batalkan Resep
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail */}
      {selectedPrescription && (
        <DetailResep
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          onDispense={() => handleDispense(selectedPrescription.id)}
          onCancel={() => handleCancel(selectedPrescription.id)}
          isDispensing={dispensingId === selectedPrescription.id}
          isCancelling={cancellingId === selectedPrescription.id}
        />
      )}
    </div>
  );
}
