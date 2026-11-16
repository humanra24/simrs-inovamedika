import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { MasterEntity, MasterItem, Polyclinic, Doctor } from "../../types";
import api from "../../api/axios";

interface MasterDataFormProps {
  entity: MasterEntity;
  initialData?: MasterItem | null;
  onSubmit: (data: Partial<MasterItem>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  /** Error per field dari backend */
  fieldErrors?: Record<string, string>;
  /** Pesan umum dari backend (mis. duplikasi) */
  formError?: string;
  /** Dipanggil saat pengguna mengubah field, untuk menghapus error server field itu */
  onClearError?: (field: string) => void;
}

// ---------------------------------------------------------------------
// Komponen field (di luar agar tidak remount saat formData berubah)
// ---------------------------------------------------------------------

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" /> {message}
    </p>
  ) : null;

const FormField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  min,
  maxLength,
  inputMode,
  formData,
  handleChange,
  fieldErrors,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: number | string;
  maxLength?: number;
  inputMode?: "numeric" | "tel" | "text";
  formData: Partial<MasterItem>;
  handleChange: (key: string, value: string) => void;
  fieldErrors: Record<string, string>;
}) => (
  <div className="space-y-1.5">
    <Label className={fieldErrors[name] ? "text-red-500" : "text-slate-700"}>
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      type={type}
      inputMode={inputMode}
      maxLength={maxLength}
      value={String(formData[name as keyof MasterItem] || "")}
      onChange={(e) => handleChange(name, e.target.value)}
      placeholder={placeholder}
      min={min}
      className={`h-10 rounded-lg border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors[name] ? "border-red-500 bg-red-50" : ""}`}
    />
    <FieldError message={fieldErrors[name]} />
  </div>
);

const SelectField = ({
  label,
  required = false,
  error,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className={error ? "text-red-500" : "text-slate-700"}>
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <select
      className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {children}
    </select>
    <FieldError message={error} />
  </div>
);

// ---------------------------------------------------------------------
// Default & validasi sisi klien
// ---------------------------------------------------------------------

// Nilai default supaya yang tampil di layar = yang tersimpan di state
const DEFAULT_GENDER = "L";

const buildInitialData = (
  entity: MasterEntity,
  initialData?: MasterItem | null,
): Partial<MasterItem> => {
  const base = (initialData || {}) as Partial<MasterItem>;
  if (entity === "patients" && !(base as Record<string, unknown>).gender) {
    return { ...base, gender: DEFAULT_GENDER } as Partial<MasterItem>;
  }
  return base;
};

const validate = (
  entity: MasterEntity,
  data: Record<string, unknown>,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const val = (k: string) => String(data[k] ?? "").trim();
  const req = (k: string, label: string) => {
    if (!val(k)) errors[k] = `${label} wajib diisi.`;
    return !!val(k);
  };
  const minLen = (k: string, label: string, n: number) => {
    if (val(k) && val(k).length < n)
      errors[k] = `${label} minimal ${n} karakter.`;
  };
  const nonNegative = (k: string, label: string, integer = false) => {
    if (!req(k, label)) return;
    const n = Number(val(k));
    if (Number.isNaN(n)) errors[k] = `${label} harus berupa angka.`;
    else if (n < 0) errors[k] = `${label} tidak boleh negatif.`;
    else if (integer && !Number.isInteger(n))
      errors[k] = `${label} harus bilangan bulat.`;
  };

  switch (entity) {
    case "patients": {
      req("medical_record_number", "No. RM");
      if (req("nik", "NIK") && !/^\d{16}$/.test(val("nik")))
        errors.nik = "NIK harus 16 digit angka.";
      if (req("full_name", "Nama lengkap")) minLen("full_name", "Nama", 3);
      if (req("date_of_birth", "Tanggal lahir")) {
        const today = new Date().toISOString().split("T")[0];
        if (val("date_of_birth") > today)
          errors.date_of_birth = "Tanggal lahir tidak boleh di masa depan.";
      }
      if (
        val("phone_number") &&
        !/^[0-9+\-\s]{8,16}$/.test(val("phone_number"))
      )
        errors.phone_number = "Nomor telepon tidak valid (8-16 digit).";
      break;
    }
    case "polyclinics":
      if (req("name", "Nama poli")) minLen("name", "Nama poli", 3);
      break;
    case "doctors":
      if (req("name", "Nama dokter")) minLen("name", "Nama dokter", 3);
      req("polyclinic_id", "Poli");
      break;
    case "medicines":
      req("code", "Kode obat");
      req("name", "Nama obat");
      req("unit", "Satuan");
      nonNegative("price", "Harga");
      nonNegative("stock", "Stok", true);
      break;
    case "actions":
      req("code", "Kode tindakan");
      req("name", "Nama tindakan");
      nonNegative("price", "Tarif");
      break;
    case "schedules": {
      req("doctor_id", "Dokter");
      req("day_of_week", "Hari praktik");
      const hasStart = req("start_time", "Jam mulai");
      const hasEnd = req("end_time", "Jam selesai");
      if (hasStart && hasEnd && val("end_time") <= val("start_time"))
        errors.end_time = "Jam selesai harus lebih besar dari jam mulai.";
      break;
    }
  }
  return errors;
};

// ---------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------

export default function MasterDataForm({
  entity,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  fieldErrors = {},
  formError = "",
  onClearError,
}: MasterDataFormProps) {
  const [formData, setFormData] = useState<Partial<MasterItem>>(() =>
    buildInitialData(entity, initialData),
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Error klien (terbaru) menimpa error server pada field yang sama
  const errors = { ...fieldErrors, ...clientErrors };

  const handleChange = (key: string, value: string) => {
    const next = key === "nik" ? value.replace(/\D/g, "").slice(0, 16) : value;
    setFormData((prev) => ({ ...prev, [key]: next }));
    setClientErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    onClearError?.(key);
  };

  useEffect(() => {
    if (entity === "doctors") {
      api
        .get("/master/polyclinics")
        .then((res) => setPolyclinics(res.data.data || []));
    } else if (entity === "schedules") {
      // Ambil data dokter untuk dropdown jadwal
      api.get("/master/doctors").then((res) => setDoctors(res.data.data || []));
    }
  }, [entity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clientValidation = validate(
      entity,
      formData as Record<string, unknown>,
    );
    if (Object.keys(clientValidation).length > 0) {
      setClientErrors(clientValidation);
      return;
    }
    setClientErrors({});

    // Rapikan spasi di awal/akhir
    const trimmed = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [
        k,
        typeof v === "string" ? v.trim() : v,
      ]),
    ) as Partial<MasterItem>;

    // Pengaman: gender selalu terkirim walau dropdown tidak disentuh.
    // Spread trimmed di belakang, jadi pilihan pengguna/data edit tetap menang.
    const payload =
      entity === "patients"
        ? ({ gender: DEFAULT_GENDER, ...trimmed } as Partial<MasterItem>)
        : trimmed;

    onSubmit(payload);
  };

  const renderFields = () => {
    switch (entity) {
      case "patients":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="No. RM"
                name="medical_record_number"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
              <FormField
                label="NIK"
                name="nik"
                inputMode="numeric"
                maxLength={16}
                placeholder="16 digit"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
            </div>
            <FormField
              label="Nama Lengkap"
              name="full_name"
              required
              formData={formData}
              handleChange={handleChange}
              fieldErrors={errors}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Tanggal Lahir"
                name="date_of_birth"
                type="date"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
              <SelectField
                label="Gender"
                error={errors.gender}
                value={String(formData.gender || DEFAULT_GENDER)}
                onChange={(v) => handleChange("gender", v)}
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </SelectField>
            </div>
            <FormField
              label="Telepon"
              name="phone_number"
              type="tel"
              inputMode="tel"
              formData={formData}
              handleChange={handleChange}
              fieldErrors={errors}
            />
          </>
        );
      case "polyclinics":
        return (
          <>
            <FormField
              label="Nama Poli"
              name="name"
              required
              formData={formData}
              handleChange={handleChange}
              fieldErrors={errors}
            />
            <FormField
              label="Deskripsi"
              name="description"
              formData={formData}
              handleChange={handleChange}
              fieldErrors={errors}
            />
          </>
        );
      case "doctors":
        return (
          <>
            <FormField
              label="Nama Dokter"
              name="name"
              required
              formData={formData}
              handleChange={handleChange}
              fieldErrors={errors}
            />
            <FormField
              label="Spesialisasi"
              name="specialization"
              formData={formData}
              handleChange={handleChange}
              fieldErrors={errors}
            />
            <SelectField
              label="Poli / Unit Pelayanan"
              required
              error={errors.polyclinic_id}
              value={String(formData.polyclinic_id || "")}
              onChange={(v) => handleChange("polyclinic_id", v)}
            >
              <option value="">-- Pilih Poli --</option>
              {polyclinics.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </SelectField>
          </>
        );
      case "medicines":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Kode Obat"
                name="code"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
              <FormField
                label="Nama Obat"
                name="name"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Satuan"
                name="unit"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
              <FormField
                label="Harga"
                name="price"
                type="number"
                required
                min={0}
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
              <FormField
                label="Stok"
                name="stock"
                type="number"
                required
                min={0}
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
            </div>
          </>
        );
      case "actions":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Kode Tindakan"
                name="code"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
              <FormField
                label="Nama Tindakan"
                name="name"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
            </div>
            <FormField
              label="Tarif (Rp)"
              name="price"
              type="number"
              required
              min={0}
              formData={formData}
              handleChange={handleChange}
              fieldErrors={errors}
            />
          </>
        );
      case "schedules":
        return (
          <>
            <SelectField
              label="Dokter"
              required
              error={errors.doctor_id}
              value={String(formData.doctor_id || "")}
              onChange={(v) => handleChange("doctor_id", v)}
            >
              <option value="">-- Pilih Dokter --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                  {d.specialization ? ` (${d.specialization})` : ""}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Hari Praktik"
              required
              error={errors.day_of_week}
              value={String(formData.day_of_week || "")}
              onChange={(v) => handleChange("day_of_week", v)}
            >
              <option value="">-- Pilih Hari --</option>
              <option value="1">Senin</option>
              <option value="2">Selasa</option>
              <option value="3">Rabu</option>
              <option value="4">Kamis</option>
              <option value="5">Jumat</option>
              <option value="6">Sabtu</option>
              <option value="7">Minggu</option>
            </SelectField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Jam Mulai"
                name="start_time"
                type="time"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
              <FormField
                label="Jam Selesai"
                name="end_time"
                type="time"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={errors}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 ring-1 ring-red-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {renderFields()}

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
