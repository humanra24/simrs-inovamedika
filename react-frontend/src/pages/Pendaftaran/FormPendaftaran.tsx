import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  UserPlus,
  Ticket,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  Stethoscope,
  Building2,
  SearchX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import type { Patient, Polyclinic, Doctor, VisitResult } from "../../types";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const EMPTY_PATIENT = {
  medical_record_number: "",
  nik: "",
  full_name: "",
  date_of_birth: "",
  gender: "L",
  phone_number: "",
  address: "",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// Komponen FormField (Reusable)
const FormField = ({
  label,
  name,
  type = "text",
  inputMode,
  placeholder = "",
  required = false,
  formData,
  handleChange,
  fieldErrors,
}: {
  label: string;
  name: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "text";
  placeholder?: string;
  required?: boolean;
  formData: Record<string, unknown>;
  handleChange: (key: string, value: string) => void;
  fieldErrors: Record<string, string>;
}) => (
  <div className="space-y-1.5">
    <Label
      className={`text-xs font-semibold ${fieldErrors[name] ? "text-red-500" : "text-slate-600"}`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      type={type}
      inputMode={inputMode}
      value={String(formData[name] || "")}
      onChange={(e) => handleChange(name, e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`h-11 rounded-xl border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 ${
        fieldErrors[name] ? "border-red-400 bg-red-50/60" : ""
      }`}
    />
    {fieldErrors[name] && (
      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
        <AlertCircle className="h-3 w-3" /> {fieldErrors[name]}
      </p>
    )}
  </div>
);

const StepTitle = ({
  step,
  title,
  desc,
  done,
}: {
  step: number;
  title: string;
  desc: string;
  done?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
        done ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"
      }`}
    >
      {done ? <Check className="h-4 w-4" /> : step}
    </div>
    <div>
      <h2 className="font-semibold leading-tight text-slate-900">{title}</h2>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  </div>
);

export default function FormPendaftaran() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [search, setSearch] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPolyclinic, setSelectedPolyclinic] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<VisitResult | null>(null);
  const [lastSummary, setLastSummary] = useState<{
    patient: string;
    poli: string;
    doctor: string;
  } | null>(null);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newPatientData, setNewPatientData] =
    useState<Record<string, string>>(EMPTY_PATIENT);

  // Fetch Master Data
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [resPoli, resDokter] = await Promise.all([
          api.get("/master/polyclinics"),
          api.get("/master/doctors"),
        ]);
        setPolyclinics(resPoli.data.data);
        setDoctors(resDokter.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMaster();
  }, []);

  // Debounce Search
  useEffect(() => {
    const q = search.trim();
    if (q === "") return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get("/master/patients", { params: { q } });
        setPatients(res.data.data);
        setSearchedQuery(q);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim() === "") {
      setPatients([]);
      setSearchedQuery("");
    }
  };

  // Register Visit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedPolyclinic || !selectedDoctor) {
      setError("Harap pilih pasien, poli, dan dokter.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.post("/visits/register", {
        patient_id: selectedPatient.id,
        polyclinic_id: selectedPolyclinic,
        doctor_id: selectedDoctor,
      });
      setResult(res.data.data);
      setLastSummary({
        patient: selectedPatient.full_name,
        poli:
          polyclinics.find((p) => String(p.id) === selectedPolyclinic)?.name ||
          "-",
        doctor:
          doctors.find((d) => String(d.id) === selectedDoctor)?.name || "-",
      });
      toast.success("Pendaftaran berhasil!");
      setSelectedPatient(null);
      setSearch("");
      setSearchedQuery("");
      setPatients([]);
      setSelectedPolyclinic("");
      setSelectedDoctor("");
    } catch (err: unknown) {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || "Gagal mendaftarkan pasien.");
    } finally {
      setLoading(false);
    }
  };

  // Create New Patient
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      const res = await api.post("/master/patients", newPatientData);
      toast.success("Pasien baru berhasil ditambahkan!");
      setIsModalOpen(false);
      setSelectedPatient(res.data.data);
      setNewPatientData(EMPTY_PATIENT);
      setSearch("");
      setSearchedQuery("");
      setPatients([]);
    } catch (err: unknown) {
      if (
        isAxiosError<{ errors?: Record<string, string[]> }>(err) &&
        err.response?.data?.errors
      ) {
        const errors = err.response.data.errors;
        const formatted: Record<string, string> = {};
        Object.keys(errors).forEach((key) => {
          formatted[key] = errors[key]?.[0] ?? "";
        });
        setFieldErrors(formatted);
      } else {
        toast.error("Gagal menambahkan pasien.");
      }
    }
  };

  const setField = (k: string, v: string) =>
    setNewPatientData((prev) => ({ ...prev, [k]: v }));

  const filteredDoctors = doctors.filter(
    (d) => d.polyclinic_id.toString() === selectedPolyclinic,
  );

  const notFound =
    search.trim() !== "" &&
    searchedQuery === search.trim() &&
    !isSearching &&
    patients.length === 0;

  return (
    <div className="space-y-6">
      {/* ===== Tiket Antrean ===== */}
      {result && (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-blue-600/20 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/5" />

          <button
            onClick={() => {
              setResult(null);
              setLastSummary(null);
            }}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-1.5 text-white/90 transition hover:bg-white/25"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pendaftaran Berhasil
              </span>
              <p className="mt-4 text-sm text-blue-100">Nomor Antrean</p>
              <h2 className="text-6xl font-extrabold tracking-tight">
                {result.queue_number}
              </h2>
              <p className="mt-2 text-xs text-blue-100">
                ID Kunjungan #{result.id} · {result.visit_date}
              </p>
            </div>

            <div className="flex items-center gap-5 sm:border-l sm:border-dashed sm:border-white/30 sm:pl-8">
              {lastSummary && (
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-blue-200">Pasien</p>
                    <p className="font-semibold">{lastSummary.patient}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Poli · Dokter</p>
                    <p className="font-semibold">
                      {lastSummary.poli} · {lastSummary.doctor}
                    </p>
                  </div>
                </div>
              )}
              <div className="hidden rounded-2xl bg-white/15 p-4 sm:block">
                <Ticket className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ===== Step 1: Cari Pasien ===== */}
        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 lg:col-span-3">
          <div className="mb-5 flex items-start justify-between gap-3">
            <StepTitle
              step={1}
              title="Cari Pasien"
              desc="Cari berdasarkan nama, NIK, atau No. RM"
              done={!!selectedPatient}
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 rounded-xl border-slate-200 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                setIsModalOpen(true);
                setFieldErrors({});
                setNewPatientData(EMPTY_PATIENT);
              }}
            >
              <UserPlus className="h-4 w-4" /> Pasien Baru
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Ketik nama, NIK, atau No. RM..."
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-12 pr-11 text-sm shadow-none transition focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-blue-600" />
            )}
          </div>

          <div className="mt-4 max-h-85 space-y-2 overflow-y-auto pr-1">
            {patients.map((p) => {
              const active = selectedPatient?.id === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                    active
                      ? "border-blue-500 bg-blue-50/70 ring-4 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {getInitials(p.full_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {p.full_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      RM {p.medical_record_number} · NIK {p.nik}
                    </p>
                  </div>
                  {active && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Empty states */}
            {search.trim() === "" && patients.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                <div className="mb-3 rounded-2xl bg-slate-100 p-3">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Mulai dengan mencari pasien
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Hasil pencarian akan muncul di sini
                </p>
              </div>
            )}
            {notFound && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                <div className="mb-3 rounded-2xl bg-slate-100 p-3">
                  <SearchX className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Pasien tidak ditemukan
                </p>
                <p className="mb-3 mt-1 text-xs text-slate-400">
                  Belum terdaftar? Tambahkan sebagai pasien baru.
                </p>
                <Button
                  size="sm"
                  className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    setIsModalOpen(true);
                    setFieldErrors({});
                    setNewPatientData(EMPTY_PATIENT);
                  }}
                >
                  <UserPlus className="mr-1.5 h-4 w-4" /> Pasien Baru
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* ===== Step 2: Pilih Layanan ===== */}
        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="mb-5">
            <StepTitle
              step={2}
              title="Pilih Layanan"
              desc="Tentukan poli dan dokter praktik"
              done={!!selectedPatient && !!selectedDoctor}
            />
          </div>

          {selectedPatient ? (
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 p-3 ring-1 ring-blue-100">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {getInitials(selectedPatient.full_name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-blue-950">
                  {selectedPatient.full_name}
                </p>
                <p className="text-xs text-blue-700">
                  RM {selectedPatient.medical_record_number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setSelectedPolyclinic("");
                  setSelectedDoctor("");
                }}
                className="rounded-full p-1.5 text-blue-400 transition hover:bg-white hover:text-blue-700"
                aria-label="Ganti pasien"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-400">
              Pilih pasien terlebih dahulu.
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Building2 className="h-3.5 w-3.5" /> Poli / Unit Pelayanan
              </Label>
              <select
                className={selectClass}
                value={selectedPolyclinic}
                onChange={(e) => {
                  setSelectedPolyclinic(e.target.value);
                  setSelectedDoctor("");
                }}
                disabled={!selectedPatient}
                required
              >
                <option value="">Pilih poli</option>
                {polyclinics.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Stethoscope className="h-3.5 w-3.5" /> Dokter Praktik
              </Label>
              <select
                className={selectClass}
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                disabled={!selectedPolyclinic}
                required
              >
                <option value="">
                  {selectedPolyclinic && filteredDoctors.length === 0
                    ? "Tidak ada dokter di poli ini"
                    : "Pilih dokter"}
                </option>
                {filteredDoctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 ring-1 ring-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:shadow-none"
              disabled={
                loading ||
                !selectedPatient ||
                !selectedPolyclinic ||
                !selectedDoctor
              }
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  Daftarkan Pasien <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </section>
      </div>

      {/* ===== Modal Tambah Pasien ===== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-slate-200 bg-white sm:max-w-lg">
          <DialogHeader className="space-y-1">
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Tambah Pasien Baru
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Lengkapi data pasien. Kolom bertanda * wajib diisi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePatient} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="No. RM"
                name="medical_record_number"
                required
                formData={newPatientData}
                handleChange={setField}
                fieldErrors={fieldErrors}
              />
              <FormField
                label="NIK"
                name="nik"
                inputMode="numeric"
                required
                formData={newPatientData}
                handleChange={setField}
                fieldErrors={fieldErrors}
              />
            </div>

            <FormField
              label="Nama Lengkap"
              name="full_name"
              required
              formData={newPatientData}
              handleChange={setField}
              fieldErrors={fieldErrors}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Tanggal Lahir"
                name="date_of_birth"
                type="date"
                required
                formData={newPatientData}
                handleChange={setField}
                fieldErrors={fieldErrors}
              />
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">
                  Jenis Kelamin
                </Label>
                <div className="grid h-11 grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                  {[
                    { v: "L", l: "Laki-laki" },
                    { v: "P", l: "Perempuan" },
                  ].map((g) => (
                    <button
                      type="button"
                      key={g.v}
                      onClick={() => setField("gender", g.v)}
                      className={`rounded-lg text-sm font-semibold transition-all ${
                        newPatientData.gender === g.v
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <FormField
              label="Telepon"
              name="phone_number"
              type="tel"
              inputMode="tel"
              formData={newPatientData}
              handleChange={setField}
              fieldErrors={fieldErrors}
            />
            <FormField
              label="Alamat"
              name="address"
              formData={newPatientData}
              handleChange={setField}
              fieldErrors={fieldErrors}
            />

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 text-white shadow-sm hover:bg-blue-700"
              >
                Simpan Data
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
