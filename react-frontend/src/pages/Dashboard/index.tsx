import { useState, useEffect } from "react";
import nodeApi from "@/api/nodeApi";
import api from "@/api/axios";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Activity,
  DollarSign,
  FileCheck,
  FileWarning,
  Loader2,
  RefreshCw,
  BarChart3,
  FileText,
  Pill,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type {
  DashboardSummary,
  VisitsByPolyclinic,
  ActionStat,
  MedicineStat,
} from "@/types";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"ringkasan" | "laporan">(
    "ringkasan",
  );

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [visitsByPoli, setVisitsByPoli] = useState<VisitsByPolyclinic[]>([]);
  const [actions, setActions] = useState<ActionStat[]>([]);
  const [medicines, setMedicines] = useState<MedicineStat[]>([]);

  const [loading, setLoading] = useState(true);

  // State Drill-down (Detail)
  const [drillDownType, setDrillDownType] = useState<"poli" | "bills" | null>(
    null,
  );
  const [drillDownTitle, setDrillDownTitle] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [drillDownData, setDrillDownData] = useState<any[]>([]);
  const [isLoadingDrill, setIsLoadingDrill] = useState(false);

  // State Filter Laporan
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };

      const [resSummary, resVisits, resActions, resMedicines] =
        await Promise.all([
          nodeApi.get("/dashboard/summary", { params }),
          nodeApi.get("/dashboard/visits-by-polyclinic", { params }),
          nodeApi.get("/dashboard/actions", { params }),
          nodeApi.get("/dashboard/medicines", { params }),
        ]);

      setSummary(resSummary.data.data || null);
      setVisitsByPoli(resVisits.data.data || []);
      setActions(resActions.data.data || []);
      setMedicines(resMedicines.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const params = { start_date: startDate, end_date: endDate };
        const [resSummary, resVisits, resActions, resMedicines] =
          await Promise.all([
            nodeApi.get("/dashboard/summary", { params }),
            nodeApi.get("/dashboard/visits-by-polyclinic", { params }),
            nodeApi.get("/dashboard/actions", { params }),
            nodeApi.get("/dashboard/medicines", { params }),
          ]);
        if (!ignore) {
          setSummary(resSummary.data.data || null);
          setVisitsByPoli(resVisits.data.data || []);
          setActions(resActions.data.data || []);
          setMedicines(resMedicines.data.data || []);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) toast.error("Gagal memuat data dashboard.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [startDate, endDate]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // --- FITUR DRILL DOWN ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDrillDown = async (type: "poli" | "bills", payload: any) => {
    setDrillDownType(type);
    setIsLoadingDrill(true);
    setDrillDownData([]);

    try {
      if (type === "poli") {
        setDrillDownTitle(`Detail Kunjungan: ${payload.name}`);
        const res = await nodeApi.get("/dashboard/visits-detail", {
          params: {
            start_date: startDate,
            end_date: endDate,
            polyclinic_id: payload.id,
          },
        });
        setDrillDownData(res.data.data || []);
      } else if (type === "bills") {
        setDrillDownTitle(`Detail Tagihan: ${payload.label}`);
        const res = await nodeApi.get("/dashboard/bills-detail", {
          params: {
            start_date: startDate,
            end_date: endDate,
            status: payload.status,
          },
        });
        setDrillDownData(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat detail data.");
    } finally {
      setIsLoadingDrill(false);
    }
  };

  // --- FITUR EXPORT EXCEL DARI FRONTEND ---
  const handleExportReport = async (type: "visits" | "bills" | "medicines") => {
    try {
      toast.info(`Menyiapkan laporan ${type}...`);

      const res = await api.get(`/reports/${type}`, {
        params: { start_date: startDate, end_date: endDate },
      });

      const data = res.data.data;
      if (!data || data.length === 0) {
        return toast.error("Tidak ada data untuk diunduh pada periode ini.");
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
      XLSX.writeFile(workbook, `Laporan_${type}_${startDate}_${endDate}.xlsx`);

      toast.success("Laporan berhasil diunduh.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh laporan.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" /> Dashboard &
            Laporan
          </h1>
          <p className="text-slate-500 mt-1">
            Pantau statistik operasional dan unduh laporan.
          </p>
        </div>

        {/* Filter Tanggal */}
        <div className="flex items-end gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <Label className="text-xs">Dari</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sampai</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <Button
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Tab Navigasi */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-100">
        <button
          onClick={() => setActiveTab("ringkasan")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "ringkasan" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          <BarChart3 className="w-4 h-4" /> Ringkasan
        </button>
        <button
          onClick={() => setActiveTab("laporan")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "laporan" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          <FileText className="w-4 h-4" /> Laporan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* ================= TAB RINGKASAN ================= */}
          {activeTab === "ringkasan" && (
            <div className="space-y-6">
              {/* Statistik Ringkas */}
              {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Kunjungan */}
                  <div
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() =>
                      handleDrillDown("poli", { id: null, name: "Semua Poli" })
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-500 font-medium">
                          Total Kunjungan
                        </p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">
                          {Number(summary.total_visits)}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Pendapatan */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-500 font-medium">
                          Total Pendapatan
                        </p>
                        <p className="text-xl font-bold text-slate-900 mt-1">
                          Rp{" "}
                          {Number(summary.total_revenue).toLocaleString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Lunas */}
                  <div
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-green-400 transition-colors"
                    onClick={() =>
                      handleDrillDown("bills", {
                        status: "paid",
                        label: "Lunas",
                      })
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-500 font-medium">
                          Tagihan Lunas
                        </p>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                          {Number(summary.paid_bills)}
                        </p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FileCheck className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Belum Lunas */}
                  <div
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm cursor-pointer hover:border-red-400 transition-colors"
                    onClick={() =>
                      handleDrillDown("bills", {
                        status: "unpaid",
                        label: "Belum Lunas",
                      })
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-500 font-medium">
                          Belum Lunas
                        </p>
                        <p className="text-3xl font-bold text-red-600 mt-1">
                          {Number(summary.unpaid_bills) +
                            Number(summary.partial_bills)}
                        </p>
                      </div>
                      <div className="bg-red-100 p-2 rounded-lg">
                        <FileWarning className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grafik */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kunjungan per Poli */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">
                    Kunjungan per Poliklinik
                  </h3>
                  <div className="h-75 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={visitsByPoli.map((v, idx) => ({
                            ...v,
                            id: idx,
                            total_visits: Number(v.total_visits),
                          }))}
                          dataKey="total_visits"
                          nameKey="polyclinic_name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({ name, percent }) =>
                            `${name} ${((percent || 0) * 100).toFixed(0)}%`
                          }
                          onClick={(data) =>
                            handleDrillDown("poli", {
                              id: null,
                              name:
                                (data as unknown as { polyclinic_name: string })
                                  .polyclinic_name || "Poli",
                            })
                          }
                          className="cursor-pointer"
                        >
                          {visitsByPoli.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-2">
                    * Klik potongan grafik untuk melihat detail
                  </p>
                </div>

                {/* Tindakan Terbanyak */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">
                    Tindakan Medis Terbanyak
                  </h3>
                  <div className="h-75 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={actions.map((a) => ({
                          ...a,
                          total_performed: Number(a.total_performed),
                        }))}
                        layout="vertical"
                        margin={{ left: 40, right: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="action_name"
                          type="category"
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="total_performed"
                          fill="#3b82f6"
                          radius={[0, 4, 4, 0]}
                          name="Total Dilakukan"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB LAPORAN ================= */}
          {activeTab === "laporan" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Unduh Laporan
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Pilih jenis laporan yang ingin diunduh berdasarkan rentang
                tanggal yang dipilih di atas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleExportReport("visits")}
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-none"
                >
                  <FileText className="w-6 h-6" />
                  <span className="font-semibold">Laporan Kunjungan</span>
                </Button>
                <Button
                  onClick={() => handleExportReport("bills")}
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 shadow-none"
                >
                  <DollarSign className="w-6 h-6" />
                  <span className="font-semibold">Laporan Keuangan</span>
                </Button>
                <Button
                  onClick={() => handleExportReport("medicines")}
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-none"
                >
                  <Pill className="w-6 h-6" />
                  <span className="font-semibold">Laporan Obat</span>
                </Button>
              </div>

              {/* Tabel Obat Terlaris */}
              <div className="mt-8">
                <h4 className="font-bold text-slate-800 mb-3">
                  Preview Penggunaan Obat
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Nama Obat
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                          Jumlah Digunakan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-800">
                            {m.medicine_name}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600 font-medium">
                            {Number(m.total_used)}
                          </td>
                        </tr>
                      ))}
                      {medicines.length === 0 && (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-4 py-6 text-center text-slate-500 italic"
                          >
                            Tidak ada data obat pada periode ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL DRILL DOWN (DETAIL) */}
      {drillDownType && (
        <Dialog open={true} onOpenChange={() => setDrillDownType(null)}>
          <DialogContent className="sm:max-w-175 bg-white shadow-2xl border-slate-200 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4 mb-4">
              <DialogTitle className="text-xl font-bold text-slate-900">
                {drillDownTitle}
              </DialogTitle>
            </DialogHeader>

            {isLoadingDrill ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : drillDownData.length === 0 ? (
              <p className="text-center text-slate-500 italic py-6">
                Tidak ada detail data.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    {drillDownType === "poli" ? (
                      <tr>
                        <th className="px-4 py-2 font-semibold text-slate-600">
                          Tanggal
                        </th>
                        <th className="px-4 py-2 font-semibold text-slate-600">
                          Pasien
                        </th>
                        <th className="px-4 py-2 font-semibold text-slate-600">
                          Antrean
                        </th>
                        <th className="px-4 py-2 font-semibold text-slate-600">
                          Dokter
                        </th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-4 py-2 font-semibold text-slate-600">
                          Tanggal
                        </th>
                        <th className="px-4 py-2 font-semibold text-slate-600">
                          Pasien
                        </th>
                        <th className="px-4 py-2 font-semibold text-slate-600 text-right">
                          Total
                        </th>
                        <th className="px-4 py-2 font-semibold text-slate-600 text-right">
                          Status
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drillDownType === "poli"
                      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        drillDownData.map((d: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-slate-800">
                              {new Date(d.visit_date).toLocaleDateString(
                                "id-ID",
                              )}
                            </td>
                            <td className="px-4 py-2 text-slate-800 font-medium">
                              {d.patient_name}
                            </td>
                            <td className="px-4 py-2 text-slate-600">
                              {d.queue_number}
                            </td>
                            <td className="px-4 py-2 text-slate-600">
                              {d.doctor_name}
                            </td>
                          </tr>
                        ))
                      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        drillDownData.map((d: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-slate-800">
                              {new Date(d.created_at).toLocaleDateString(
                                "id-ID",
                              )}
                            </td>
                            <td className="px-4 py-2 text-slate-800 font-medium">
                              {d.patient_name}
                            </td>
                            <td className="px-4 py-2 text-right text-slate-800 font-medium">
                              Rp{" "}
                              {Number(d.total_amount).toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  d.status === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : d.status === "partial"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {d.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
