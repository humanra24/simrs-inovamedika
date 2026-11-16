import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  Loader2,
  RefreshCw,
  CheckCircle2,
  User,
  FilePlus2,
  CreditCard,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import type { Visit, Bill } from "@/types";
import DetailBill from "./DetailBill";

interface VisitWithBill extends Visit {
  bill_id?: number;
}

interface ApiResponse<T> {
  data: T[];
}

export default function Billing() {
  const [visits, setVisits] = useState<VisitWithBill[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<
    "belum_generate" | "belum_bayar" | "sudah_bayar"
  >("belum_generate");
  const [activeVisitId, setActiveVisitId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [resVisits, resBills] = await Promise.all([
        api.get<ApiResponse<VisitWithBill>>("/visits/history"),
        api.get<ApiResponse<Bill>>("/bills"),
      ]);

      const filteredVisits = (resVisits.data.data || []).filter(
        (v) => v.status === "examined" || v.status === "waiting_payment",
      );

      setVisits(filteredVisits);
      setBills(resBills.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data billing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const [resVisits, resBills] = await Promise.all([
          api.get<ApiResponse<VisitWithBill>>("/visits/history"),
          api.get<ApiResponse<Bill>>("/bills"),
        ]);
        if (!ignore) {
          const filteredVisits = (resVisits.data.data || []).filter(
            (v) => v.status === "examined" || v.status === "waiting_payment",
          );
          setVisits(filteredVisits);
          setBills(resBills.data.data || []);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) toast.error("Gagal memuat data billing.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  const handleGenerateBill = async (visitId: number) => {
    if (!window.confirm("Generate tagihan untuk kunjungan ini?")) return;

    setGeneratingId(visitId);
    try {
      await api.post(`/bills/generate/${visitId}`);
      toast.success("Tagihan berhasil di-generate.");
      handleRefresh();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const errorMsg = apiError.response?.data?.message || "";

      if (errorMsg.toLowerCase().includes("sudah")) {
        toast.info("Tagihan sudah pernah di-generate.");
        handleRefresh();
      } else {
        toast.error(errorMsg || "Gagal generate tagihan.");
      }
    } finally {
      setGeneratingId(null);
    }
  };

  // --- LOGIKA PEMISAHAN DATA PER TAB ---

  const belumGenerate = visits.filter(
    (v) => !bills.some((b) => b.visit_id === v.id),
  );

  const belumBayar = bills.filter(
    (b) => b.status === "unpaid" || b.status === "partial",
  );

  const sudahBayar = bills.filter((b) => b.status === "paid");

  // Helper untuk render card, kita buat tipe parameternya agar fleksibel
  const renderCard = (data: Visit | Bill) => {
    // Kita cek apakah ini data Bill atau Visit
    const isBill = "visit_id" in data;

    // Ambil objek visit (jika data adalah Bill, ambil data.visit. Jika data adalah Visit, pakai data itu sendiri)
    const visitData = isBill ? (data as Bill).visit! : (data as Visit);

    const billData = isBill ? (data as Bill) : undefined;

    const isBillPaid = billData?.status === "paid";
    const isBillPartial = billData?.status === "partial";

    return (
      <div
        key={visitData.id}
        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
      >
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            Antrean {visitData.queue_number}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {visitData.polyclinic?.name || "Poli"}
          </span>
        </div>

        <div className="p-5 flex-1">
          <h3 className="font-bold text-lg text-slate-900 mb-1">
            {visitData.patient?.full_name || "Pasien"}
          </h3>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> RM:{" "}
            {visitData.patient?.medical_record_number || "-"}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100">
            {!billData && (
              <p className="text-xs font-semibold text-green-600 bg-green-50 inline-block px-2 py-1 rounded">
                Selesai Diperiksa
              </p>
            )}
            {isBillPartial && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-orange-600 bg-orange-50 inline-flex items-center gap-1 px-2 py-1 rounded w-max">
                  <Clock className="w-3 h-3" /> Dibayar Sebagian
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Sisa: Rp{" "}
                  {(
                    (billData.total_amount || 0) - (billData.paid_amount || 0)
                  ).toLocaleString("id-ID")}
                </p>
              </div>
            )}
            {billData?.status === "unpaid" && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 inline-flex items-center gap-1 px-2 py-1 rounded">
                <Clock className="w-3 h-3" /> Belum Dibayar
              </p>
            )}
            {isBillPaid && (
              <p className="text-xs font-semibold text-green-600 bg-green-50 inline-flex items-center gap-1 px-2 py-1 rounded">
                <CheckCircle2 className="w-3 h-3" /> Lunas
              </p>
            )}
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100">
          {!billData ? (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={() => handleGenerateBill(visitData.id)}
              disabled={generatingId === visitData.id}
            >
              {generatingId === visitData.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  <FilePlus2 className="w-4 h-4 mr-2" /> Generate Tagihan
                </>
              )}
            </Button>
          ) : isBillPaid ? (
            <Button
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
              onClick={() => setActiveVisitId(visitData.id)}
            >
              <Receipt className="w-4 h-4 mr-2" /> Lihat Rincian
            </Button>
          ) : (
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              onClick={() => setActiveVisitId(visitData.id)}
            >
              <CreditCard className="w-4 h-4 mr-2" /> Bayar Tagihan
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-8 h-8 text-blue-600" /> Kasir & Billing
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola tagihan dan pembayaran pasien.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />{" "}
          Refresh
        </Button>
      </div>

      {/* Tab Navigasi */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("belum_generate")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "belum_generate" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          Belum Generate ({belumGenerate.length})
        </button>
        <button
          onClick={() => setActiveTab("belum_bayar")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "belum_bayar" ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          Belum Bayar ({belumBayar.length})
        </button>
        <button
          onClick={() => setActiveTab("sudah_bayar")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "sudah_bayar" ? "bg-white text-green-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          Sudah Bayar ({sudahBayar.length})
        </button>
      </div>

      {/* Konten Tab */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {activeTab === "belum_generate" &&
            (belumGenerate.length === 0 ? (
              <div className="text-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                Tidak ada antrean.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {belumGenerate.map((v) => renderCard(v))}
              </div>
            ))}

          {activeTab === "belum_bayar" &&
            (belumBayar.length === 0 ? (
              <div className="text-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                Tidak ada tagihan tertunda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {belumBayar.map((b) => renderCard(b))}
              </div>
            ))}

          {activeTab === "sudah_bayar" &&
            (sudahBayar.length === 0 ? (
              <div className="text-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                Belum ada riwayat pembayaran.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sudahBayar.map((b) => renderCard(b))}
              </div>
            ))}
        </>
      )}

      {/* Modal Detail Tagihan */}
      {activeVisitId && (
        <DetailBill
          visitId={activeVisitId}
          onClose={() => setActiveVisitId(null)}
          onSuccess={() => {
            setActiveVisitId(null);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
