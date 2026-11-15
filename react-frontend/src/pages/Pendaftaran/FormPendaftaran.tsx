import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  UserCheck,
  Ticket,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import type { Patient, Polyclinic, Doctor, VisitResult } from "../../types";

// Komponen FormField (Reusable)
const FormField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  formData,
  handleChange,
  fieldErrors,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  formData: Record<string, unknown>;
  handleChange: (key: string, value: string) => void;
  fieldErrors: Record<string, string>;
}) => (
  <div className="space-y-1.5">
    <Label className={fieldErrors[name] ? "text-red-500" : "text-slate-700"}>
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      type={type}
      value={String(formData[name] || "")}
      onChange={(e) => handleChange(name, e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`h-10 rounded-lg border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors[name] ? "border-red-500 bg-red-50" : ""}`}
    />
    {fieldErrors[name] && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" /> {fieldErrors[name]}
      </p>
    )}
  </div>
);

export default function FormPendaftaran() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPolyclinic, setSelectedPolyclinic] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<VisitResult | null>(null);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newPatientData, setNewPatientData] = useState<Record<string, string>>({
    medical_record_number: "",
    nik: "",
    full_name: "",
    date_of_birth: "",
    gender: "L",
    phone_number: "",
    address: "",
  });

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
    if (search.trim() === "") return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/master/patients?q=${search}`);
        setPatients(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

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
      toast.success("Pendaftaran berhasil!");
      setSelectedPatient(null);
      setSearch("");
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
      setNewPatientData({
        medical_record_number: "",
        nik: "",
        full_name: "",
        date_of_birth: "",
        gender: "L",
        phone_number: "",
        address: "",
      });
      setSearch("");
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

  return (
    <div className="space-y-8">
      {/* Hasil Antrean */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-medium mb-1">
              Pendaftaran Berhasil
            </p>
            <h2 className="text-5xl font-extrabold text-blue-600 mb-2">
              {result.queue_number}
            </h2>
            <p className="text-slate-500 text-sm">
              ID Kunjungan: #{result.id} | {result.visit_date}
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-full">
            <Ticket className="w-16 h-16 text-blue-600" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Cari Pasien */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Cari Pasien</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsModalOpen(true);
                setFieldErrors({});
                setNewPatientData({
                  medical_record_number: "",
                  nik: "",
                  full_name: "",
                  date_of_birth: "",
                  gender: "L",
                  phone_number: "",
                  address: "",
                });
              }}
            >
              Pasien Baru
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Cari nama, NIK, atau No. RM..."
                className="pl-10 h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-3 h-5 w-5 text-blue-600 animate-spin" />
              )}
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {patients.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-lg border cursor-pointer ${selectedPatient?.id === p.id ? "bg-blue-50 border-blue-300" : "bg-white border-slate-200 hover:border-blue-200"}`}
                  onClick={() => setSelectedPatient(p)}
                >
                  <p className="font-semibold text-slate-800">{p.full_name}</p>
                  <p className="text-xs text-slate-500">
                    RM: {p.medical_record_number} | NIK: {p.nik}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Pilih Poli & Dokter */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    {selectedPatient.full_name}
                  </p>
                  <p className="text-xs text-blue-700">
                    RM: {selectedPatient.medical_record_number}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic mb-4">
                Pilih pasien terlebih dahulu.
              </p>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Poli / Unit Pelayanan</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  value={selectedPolyclinic}
                  onChange={(e) => {
                    setSelectedPolyclinic(e.target.value);
                    setSelectedDoctor("");
                  }}
                  disabled={!selectedPatient}
                  required
                >
                  <option value="">-- Pilih Poli --</option>
                  {polyclinics.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Dokter Praktik</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  disabled={!selectedPolyclinic}
                  required
                >
                  <option value="">-- Pilih Dokter --</option>
                  {doctors
                    .filter(
                      (d) => d.polyclinic_id.toString() === selectedPolyclinic,
                    )
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                disabled={
                  loading ||
                  !selectedPatient ||
                  !selectedPolyclinic ||
                  !selectedDoctor
                }
              >
                {loading ? (
                  "Memproses..."
                ) : (
                  <>
                    Daftarkan Pasien <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modal Tambah Pasien */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-125 bg-white">
          <DialogHeader className="border-b pb-4 mb-2">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Tambah Pasien Baru
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePatient} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="No. RM"
                name="medical_record_number"
                required
                formData={newPatientData}
                handleChange={(k, v) =>
                  setNewPatientData({ ...newPatientData, [k]: v })
                }
                fieldErrors={fieldErrors}
              />
              <FormField
                label="NIK"
                name="nik"
                type="number"
                required
                formData={newPatientData}
                handleChange={(k, v) =>
                  setNewPatientData({ ...newPatientData, [k]: v })
                }
                fieldErrors={fieldErrors}
              />
            </div>
            <FormField
              label="Nama Lengkap"
              name="full_name"
              required
              formData={newPatientData}
              handleChange={(k, v) =>
                setNewPatientData({ ...newPatientData, [k]: v })
              }
              fieldErrors={fieldErrors}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Tanggal Lahir"
                name="date_of_birth"
                type="date"
                required
                formData={newPatientData}
                handleChange={(k, v) =>
                  setNewPatientData({ ...newPatientData, [k]: v })
                }
                fieldErrors={fieldErrors}
              />
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
                  value={newPatientData.gender}
                  onChange={(e) =>
                    setNewPatientData({
                      ...newPatientData,
                      gender: e.target.value,
                    })
                  }
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>
            <FormField
              label="Telepon"
              name="phone_number"
              formData={newPatientData}
              handleChange={(k, v) =>
                setNewPatientData({ ...newPatientData, [k]: v })
              }
              fieldErrors={fieldErrors}
            />

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
