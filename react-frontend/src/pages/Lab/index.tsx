import { useState, useEffect } from "react";
import nodeApi from "@/api/nodeApi";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
  TestTube,
  Loader2,
  RefreshCw,
  CheckCircle2,
  FileText,
  User,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { LabOrder } from "@/types";
import DetailOrder from "./DetailOrder";

// ============================================================
// Helper: mapping response flat dari backend → nested LabOrder
// ============================================================
interface RawLabOrder {
  id: number;
  visit_id: number;
  test_name: string;
  status: string;
  result_data?: string | null;
  notes?: string | null;
  created_at?: string;
  patient_name?: string | null;
  medical_record_number?: string | null;
  queue_number?: string | null;
  polyclinic_name?: string | null;
  doctor_name?: string | null;
}

const mapLabOrder = (raw: RawLabOrder): LabOrder => ({
  id: raw.id,
  visit_id: raw.visit_id,
  test_name: raw.test_name,
  status: raw.status as LabOrder["status"],
  result: raw.result_data ?? null,
  notes: raw.notes ?? null,
  created_at: raw.created_at,
  visit: {
    id: raw.visit_id,
    queue_number: raw.queue_number ?? "-",
    patient: {
      full_name: raw.patient_name ?? "Pasien",
      medical_record_number: raw.medical_record_number ?? "-",
    },
    polyclinic: raw.polyclinic_name ? { name: raw.polyclinic_name } : undefined,
    doctor: raw.doctor_name ? { name: raw.doctor_name } : undefined,
  },
});

export default function Lab() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // ============================================================
  // Fetch order lab pending
  // ============================================================
  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const res = await nodeApi.get("/lab/orders", {
          params: { status: "pending" },
        });

        if (!ignore) {
          setOrders((res.data.data || []).map(mapLabOrder));
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          toast.error("Gagal memuat order lab.");
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

  // ============================================================
  // Refresh order lab
  // ============================================================
  const handleRefresh = async () => {
    setLoading(true);

    try {
      const res = await nodeApi.get("/lab/orders", {
        params: { status: "pending" },
      });

      setOrders((res.data.data || []).map(mapLabOrder));
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat order lab.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Cancel order lab
  // ============================================================
  const handleCancel = async (orderId: number) => {
    if (!window.confirm("Batalkan order lab ini?")) return;

    setCancellingId(orderId);

    try {
      await api.post(`/lab/orders/${orderId}/cancel`);

      toast.success("Order lab dibatalkan.");

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setSelectedOrder(null);
    } catch (err: unknown) {
      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        apiError.response?.data?.message || "Gagal membatalkan order lab.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ============================================================
  // Statistik order lab
  // ============================================================
  const totalOrders = orders.length;

  const uniquePatients = new Set(
    orders.map((o) => o.visit?.patient?.medical_record_number).filter(Boolean),
  ).size;

  const uniqueTestNames = Array.from(new Set(orders.map((o) => o.test_name)));

  const uniqueTestCount = uniqueTestNames.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TestTube className="w-8 h-8 text-orange-600" />
            Laboratorium
          </h1>

          <p className="text-slate-500 mt-1">
            Daftar order lab yang menunggu hasil pemeriksaan.
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

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Order */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Total Order</p>

          <p className="text-3xl font-bold text-orange-600 mt-1">
            {totalOrders}
          </p>
        </div>

        {/* Pasien Unik */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Pasien Unik</p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {uniquePatients}
          </p>

          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Berdasarkan No. RM
          </p>
        </div>

        {/* Jenis Pemeriksaan */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Jenis Pemeriksaan
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {uniqueTestCount}
          </p>

          {uniqueTestCount > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {uniqueTestNames.slice(0, 3).map((name) => (
                <span
                  key={name}
                  className="text-[10px] font-medium bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded"
                >
                  {name}
                </span>
              ))}

              {uniqueTestCount > 3 && (
                <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5">
                  +{uniqueTestCount - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Daftar Order */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-green-300 mb-3" />

          <p className="text-lg font-medium text-slate-700">
            Tidak ada order lab pending.
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Semua order sudah diproses atau belum ada order baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all overflow-hidden flex flex-col"
            >
              {/* Header Card */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                    Order #{order.id}
                  </span>

                  {order.visit?.queue_number && (
                    <span className="text-xs font-medium text-slate-500">
                      Antrean {order.visit.queue_number}
                    </span>
                  )}
                </div>

                <TestTube className="w-4 h-4 text-orange-500" />
              </div>

              {/* Body */}
              <div className="p-5 flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Pemeriksaan
                </p>

                <h3 className="font-bold text-lg text-orange-700 mb-3">
                  {order.test_name}
                </h3>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {order.visit?.patient?.full_name || "Pasien"}
                  </p>

                  <p className="text-xs text-slate-500">
                    RM: {order.visit?.patient?.medical_record_number || "-"}
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" />
                    {order.visit?.polyclinic?.name || "Poli"}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedOrder(order)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Proses
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    if (order.id !== undefined) handleCancel(order.id);
                  }}
                  disabled={order.id === undefined || cancellingId === order.id}
                >
                  {cancellingId === order.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Batal
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail + Form Hasil */}
      {selectedOrder && (
        <DetailOrder
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSuccess={(updatedOrder) => {
            setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
