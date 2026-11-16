import { useState, useEffect, useMemo } from "react";
import { isAxiosError } from "axios";
import api from "../../api/axios";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MasterDataTable,
  DAY_NAMES,
  LOW_STOCK,
  getField,
} from "./MasterDataTable";
import MasterDataForm from "./MasterDataForm";
import {
  Plus,
  Loader2,
  Search,
  SearchX,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { MasterEntity, MasterItem, Polyclinic, Doctor } from "../../types";

const PAGE_SIZE = 10;

const TABS: { value: MasterEntity; label: string }[] = [
  { value: "patients", label: "Pasien" },
  { value: "polyclinics", label: "Poli" },
  { value: "doctors", label: "Dokter" },
  { value: "schedules", label: "Jadwal" },
  { value: "actions", label: "Tindakan" },
  { value: "medicines", label: "Obat" },
];

const TAB_CLASS =
  "px-1 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-800 transition-all";

// Kolom yang dicari per entitas
const SEARCH_FIELDS: Partial<Record<MasterEntity, string[]>> = {
  patients: ["medical_record_number", "full_name", "nik", "phone_number"],
  polyclinics: ["name", "description"],
  doctors: ["name", "specialization", "polyclinic_name"],
  schedules: ["doctor_name", "start_time", "end_time"],
  actions: ["code", "name"],
  medicines: ["code", "name"],
};

const SEARCH_PLACEHOLDERS: Partial<Record<MasterEntity, string>> = {
  patients: "Cari nama, No. RM, NIK, atau telepon...",
  polyclinics: "Cari nama atau deskripsi poli...",
  doctors: "Cari nama dokter, spesialisasi, atau poli...",
  schedules: "Cari nama dokter atau hari...",
  actions: "Cari kode atau nama tindakan...",
  medicines: "Cari kode atau nama obat...",
};

const DAY_OPTIONS = Object.entries(DAY_NAMES).map(([value, label]) => ({
  value,
  label,
}));

// ---------------------------------------------------------------------
// Membaca error response backend
// ---------------------------------------------------------------------

interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
  status?: number;
}

const firstMessage = (v: unknown): string => {
  if (Array.isArray(v)) return v.length ? firstMessage(v[0]) : "";
  return typeof v === "string" ? v : "";
};

/**
 * Mengubah error response backend (Yii2) menjadi pesan umum + error per field.
 * Format yang didukung:
 *  1. { errors: { nik: ["NIK sudah terdaftar"] } }
 *  2. { errors: { nik: "NIK sudah terdaftar" } }
 *  3. [ { field: "nik", message: "..." } ]  (format bawaan Yii2 REST)
 */
function parseApiError(err: unknown, fallback: string): ParsedApiError {
  if (!isAxiosError(err)) {
    return { message: fallback, fieldErrors: {} };
  }
  if (!err.response) {
    return {
      message: "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
      fieldErrors: {},
    };
  }

  const { status, data } = err.response;
  const body = (Array.isArray(data) ? {} : (data ?? {})) as {
    message?: unknown;
    errors?: unknown;
  };
  const rawErrors = Array.isArray(data) ? data : body.errors;

  const fieldErrors: Record<string, string> = {};
  if (Array.isArray(rawErrors)) {
    for (const e of rawErrors) {
      const field = (e as { field?: string }).field;
      const msg = (e as { message?: string }).message;
      if (field && msg && !fieldErrors[field]) fieldErrors[field] = msg;
    }
  } else if (rawErrors && typeof rawErrors === "object") {
    for (const [key, value] of Object.entries(rawErrors)) {
      const msg = firstMessage(value);
      if (msg) fieldErrors[key] = msg;
    }
  }

  let message =
    typeof body.message === "string" && body.message ? body.message : "";

  if (!message) {
    if (status === 401) message = "Sesi berakhir, silakan login kembali.";
    else if (status === 403)
      message = "Anda tidak memiliki akses untuk aksi ini.";
    else if (status === 404) message = "Data tidak ditemukan.";
    else if (status === 409) message = "Data sudah ada (duplikat).";
    else if (status === 422) message = "Data yang dimasukkan tidak valid.";
    else if (status >= 500) message = "Terjadi kesalahan pada server.";
    else message = fallback;
  }

  return { message, fieldErrors, status };
}

// ---------------------------------------------------------------------
// Toolbar pencarian + filter
// ---------------------------------------------------------------------

interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

const filterSelectClass =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function MasterDataToolbar({
  entity,
  search,
  onSearchChange,
  filters,
  onFilterChange,
  onReset,
  polyclinics,
  doctors,
  total,
  shown,
}: {
  entity: MasterEntity;
  search: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
  polyclinics: Polyclinic[];
  doctors: Doctor[];
  total: number;
  shown: number;
}) {
  const filterDefs = (): FilterDef[] => {
    switch (entity) {
      case "patients":
        return [
          {
            key: "gender",
            label: "Gender",
            options: [
              { value: "L", label: "Laki-laki" },
              { value: "P", label: "Perempuan" },
            ],
          },
        ];
      case "doctors":
        return [
          {
            key: "polyclinic_id",
            label: "Poli",
            options: polyclinics.map((p) => ({
              value: String(p.id),
              label: p.name,
            })),
          },
        ];
      case "schedules":
        return [
          {
            key: "doctor_id",
            label: "Dokter",
            options: doctors.map((d) => ({
              value: String(d.id),
              label: d.name,
            })),
          },
          { key: "day_of_week", label: "Hari", options: DAY_OPTIONS },
        ];
      case "medicines":
        return [
          {
            key: "stock",
            label: "Stok",
            options: [
              { value: "ok", label: "Tersedia" },
              { value: "low", label: `Menipis (≤ ${LOW_STOCK})` },
              { value: "out", label: "Habis" },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const defs = filterDefs();
  const hasActive =
    search.trim() !== "" || Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-3 border-b border-slate-100 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Pencarian */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={SEARCH_PLACEHOLDERS[entity] ?? "Cari data..."}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-9 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter */}
        {defs.map((def) => (
          <select
            key={def.key}
            className={filterSelectClass}
            value={filters[def.key] ?? ""}
            onChange={(e) => onFilterChange(def.key, e.target.value)}
            aria-label={`Filter ${def.label}`}
          >
            <option value="">Semua {def.label}</option>
            {def.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Menampilkan{" "}
        <span className="font-semibold text-slate-700">{shown}</span> dari{" "}
        <span className="font-semibold text-slate-700">{total}</span> data
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------
// Halaman Master Data
// ---------------------------------------------------------------------

export default function MasterData() {
  const [activeTab, setActiveTab] = useState<MasterEntity>("patients");
  const [data, setData] = useState<MasterItem[]>([]);
  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Pencarian, filter, paginasi
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  // Modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  // Modal hapus
  const [deleteTarget, setDeleteTarget] = useState<MasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Ambil data (dan data pendukung untuk nama poli/dokter) ----
  useEffect(() => {
    let cancelled = false;

    const requests: Promise<unknown>[] = [
      api.get(`/master/${activeTab}`).then((res) => {
        if (!cancelled) setData(res.data.data || []);
      }),
    ];
    if (activeTab === "doctors") {
      requests.push(
        api.get("/master/polyclinics").then((res) => {
          if (!cancelled) setPolyclinics(res.data.data || []);
        }),
      );
    } else if (activeTab === "schedules") {
      requests.push(
        api.get("/master/doctors").then((res) => {
          if (!cancelled) setDoctors(res.data.data || []);
        }),
      );
    }

    Promise.all(requests)
      .catch(() => {
        if (!cancelled) toast.error("Gagal memuat data master.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, refreshKey]);

  const reload = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const polyMap = useMemo(
    () =>
      Object.fromEntries(
        polyclinics.map((p) => [String(p.id), p.name]),
      ) as Record<string, string>,
    [polyclinics],
  );
  const doctorMap = useMemo(
    () =>
      Object.fromEntries(doctors.map((d) => [String(d.id), d.name])) as Record<
        string,
        string
      >,
    [doctors],
  );

  // ---- Pencarian + filter (sisi klien) ----
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fields = SEARCH_FIELDS[activeTab] ?? [];

    return data.filter((item) => {
      if (q) {
        const haystack = fields.map((f) => String(getField(item, f) ?? ""));
        if (activeTab === "doctors") {
          haystack.push(polyMap[String(getField(item, "polyclinic_id"))] ?? "");
        }
        if (activeTab === "schedules") {
          haystack.push(
            doctorMap[String(getField(item, "doctor_id"))] ?? "",
            DAY_NAMES[String(getField(item, "day_of_week"))] ?? "",
          );
        }
        if (!haystack.some((h) => h.toLowerCase().includes(q))) return false;
      }

      switch (activeTab) {
        case "patients":
          if (
            filters.gender &&
            String(getField(item, "gender")) !== filters.gender
          )
            return false;
          break;
        case "doctors":
          if (
            filters.polyclinic_id &&
            String(getField(item, "polyclinic_id")) !== filters.polyclinic_id
          )
            return false;
          break;
        case "schedules":
          if (
            filters.doctor_id &&
            String(getField(item, "doctor_id")) !== filters.doctor_id
          )
            return false;
          if (
            filters.day_of_week &&
            String(getField(item, "day_of_week")) !== filters.day_of_week
          )
            return false;
          break;
        case "medicines": {
          const stock = Number(getField(item, "stock") || 0);
          if (filters.stock === "out" && stock > 0) return false;
          if (filters.stock === "low" && !(stock > 0 && stock <= LOW_STOCK))
            return false;
          if (filters.stock === "ok" && stock <= LOW_STOCK) return false;
          break;
        }
      }
      return true;
    });
  }, [data, search, filters, activeTab, polyMap, doctorMap]);

  // ---- Paginasi ----
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
  const handleResetFilters = () => {
    setSearch("");
    setFilters({});
    setPage(1);
  };

  const handleTabChange = (value: string) => {
    setLoading(true);
    setActiveTab(value as MasterEntity);
    handleResetFilters();
  };

  // ---- Simpan (tambah / ubah) ----
  const handleSave = async (formData: Partial<MasterItem>) => {
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError("");
    try {
      if (editingItem && editingItem.id) {
        await api.put(`/master/${activeTab}/${editingItem.id}`, formData);
        toast.success("Data berhasil diperbarui!");
      } else {
        await api.post(`/master/${activeTab}`, formData);
        toast.success("Data berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      reload();
    } catch (err) {
      const parsed = parseApiError(err, "Gagal menyimpan data.");
      setFieldErrors(parsed.fieldErrors);
      // Pesan umum (mis. 409 duplikasi, 403, atau jaringan putus) tampil di banner form
      if (
        Object.keys(parsed.fieldErrors).length === 0 ||
        parsed.status === 409
      ) {
        setFormError(parsed.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFieldError = (field: string) => {
    setFormError("");
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // ---- Hapus ----
  const itemLabel = (item: MasterItem): string => {
    if (activeTab === "schedules") {
      const name =
        getField(item, "doctor_name") ??
        doctorMap[String(getField(item, "doctor_id"))];
      const day = DAY_NAMES[String(getField(item, "day_of_week"))];
      return [name, day].filter(Boolean).join(" - ") || `Jadwal #${item.id}`;
    }
    return String(
      getField(item, "full_name") ??
        getField(item, "name") ??
        getField(item, "code") ??
        `#${item.id}`,
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/master/${activeTab}/${deleteTarget.id}`);
      toast.success("Data berhasil dihapus!");
      setDeleteTarget(null);
      reload();
    } catch (err) {
      // Mis. data masih dipakai di tabel lain -> pesan dari backend ditampilkan
      toast.error(parseApiError(err, "Gagal menghapus data.").message);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFieldErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const handleEditClick = (item: MasterItem) => {
    setEditingItem(item);
    setFieldErrors({});
    setFormError("");
    setIsModalOpen(true);
  };

  const hasFilter =
    search.trim() !== "" || Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Master Data
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola data referensi operasional SIMRS.
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl px-5"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 border-b border-slate-200 w-full justify-start rounded-none bg-transparent p-0 h-auto gap-6">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className={TAB_CLASS}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <MasterDataToolbar
              entity={activeTab}
              search={search}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              polyclinics={polyclinics}
              doctors={doctors}
              total={data.length}
              shown={filtered.length}
            />

            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-3 rounded-2xl bg-slate-100 p-3">
                  <SearchX className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {hasFilter ? "Tidak ada data yang cocok" : "Belum ada data"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {hasFilter
                    ? "Coba ubah kata kunci atau reset filter."
                    : "Klik Tambah Data untuk membuat data pertama."}
                </p>
                {hasFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-lg"
                    onClick={handleResetFilters}
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            ) : (
              <>
                <MasterDataTable
                  entity={activeTab}
                  data={paged}
                  startIndex={startIndex}
                  polyclinicMap={polyMap}
                  doctorMap={doctorMap}
                  onEdit={handleEditClick}
                  onDelete={setDeleteTarget}
                />

                {/* Paginasi */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                    <p className="text-xs text-slate-500">
                      Halaman{" "}
                      <span className="font-semibold text-slate-700">
                        {currentPage}
                      </span>{" "}
                      dari {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        disabled={currentPage <= 1}
                        onClick={() => setPage(currentPage - 1)}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" /> Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage(currentPage + 1)}
                      >
                        Berikutnya <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Modal tambah / ubah */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setFormError("");
        }}
      >
        <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-slate-200">
          <DialogHeader className="border-b pb-4 mb-2">
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingItem ? "Edit Data" : "Tambah Data Baru"}
            </DialogTitle>
          </DialogHeader>
          <MasterDataForm
            entity={activeTab}
            initialData={editingItem}
            onSubmit={handleSave}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isSubmitting}
            fieldErrors={fieldErrors}
            formError={formError}
            onClearError={handleClearFieldError}
          />
        </DialogContent>
      </Dialog>

      {/* Modal konfirmasi hapus */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white shadow-2xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Hapus Data
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Yakin ingin menghapus{" "}
            <span className="font-semibold text-slate-900">
              {deleteTarget ? itemLabel(deleteTarget) : ""}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
