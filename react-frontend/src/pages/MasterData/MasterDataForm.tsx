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
  fieldErrors?: Record<string, string>;
}

// Komponen FormField (dipindah ke luar agar tidak remount saat formData berubah)
const FormField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  min,
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
      value={String(formData[name as keyof MasterItem] || "")}
      onChange={(e) => handleChange(name, e.target.value)}
      placeholder={placeholder}
      required={required}
      min={min}
      className={`h-10 rounded-lg border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors[name] ? "border-red-500 bg-red-50" : ""}`}
    />
    {fieldErrors[name] && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" /> {fieldErrors[name]}
      </p>
    )}
  </div>
);

export default function MasterDataForm({
  entity,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  fieldErrors = {},
}: MasterDataFormProps) {
  const [formData, setFormData] = useState<Partial<MasterItem>>(
    initialData || {},
  );

  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>([]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
                fieldErrors={fieldErrors}
              />
              <FormField
                label="NIK"
                name="nik"
                type="number"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
              />
            </div>
            <FormField
              label="Nama Lengkap"
              name="full_name"
              required
              formData={formData}
              handleChange={handleChange}
              fieldErrors={fieldErrors}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Tanggal Lahir"
                name="date_of_birth"
                type="date"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
              />
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
                  value={String(formData.gender || "L")}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>
            <FormField
              label="Telepon"
              name="phone_number"
              formData={formData}
              handleChange={handleChange}
              fieldErrors={fieldErrors}
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
              fieldErrors={fieldErrors}
            />
            <FormField
              label="Deskripsi"
              name="description"
              formData={formData}
              handleChange={handleChange}
              fieldErrors={fieldErrors}
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
              fieldErrors={fieldErrors}
            />
            <FormField
              label="Spesialisasi"
              name="specialization"
              formData={formData}
              handleChange={handleChange}
              fieldErrors={fieldErrors}
            />

            {/* Dropdown ID Poli */}
            <div className="space-y-1.5">
              <Label
                className={
                  fieldErrors.polyclinic_id ? "text-red-500" : "text-slate-700"
                }
              >
                Poli / Unit Pelayanan <span className="text-red-500">*</span>
              </Label>
              <select
                className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.polyclinic_id ? "border-red-500 bg-red-50" : "border-slate-300"}`}
                value={String(formData.polyclinic_id || "")}
                onChange={(e) => handleChange("polyclinic_id", e.target.value)}
                required
              >
                <option value="">-- Pilih Poli --</option>
                {polyclinics.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {fieldErrors.polyclinic_id && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />{" "}
                  {fieldErrors.polyclinic_id}
                </p>
              )}
            </div>
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
                fieldErrors={fieldErrors}
              />
              <FormField
                label="Nama Obat"
                name="name"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Satuan"
                name="unit"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
              />
              <FormField
                label="Harga"
                name="price"
                type="number"
                required
                min={0}
                formData={formData}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
              />
              <FormField
                label="Stok"
                name="stock"
                type="number"
                required
                min={0}
                formData={formData}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
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
                fieldErrors={fieldErrors}
              />
              <FormField
                label="Nama Tindakan"
                name="name"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
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
              fieldErrors={fieldErrors}
            />
          </>
        );
      case "schedules":
        return (
          <>
            {/* Dropdown ID Dokter */}
            <div className="space-y-1.5">
              <Label
                className={
                  fieldErrors.doctor_id ? "text-red-500" : "text-slate-700"
                }
              >
                Dokter <span className="text-red-500">*</span>
              </Label>
              <select
                className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.doctor_id ? "border-red-500 bg-red-50" : "border-slate-300"}`}
                value={String(formData.doctor_id || "")}
                onChange={(e) => handleChange("doctor_id", e.target.value)}
                required
              >
                <option value="">-- Pilih Dokter --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
              {fieldErrors.doctor_id && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.doctor_id}
                </p>
              )}
            </div>

            {/* Dropdown Hari */}
            <div className="space-y-1.5">
              <Label
                className={
                  fieldErrors.day_of_week ? "text-red-500" : "text-slate-700"
                }
              >
                Hari Praktik <span className="text-red-500">*</span>
              </Label>
              <select
                className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.day_of_week ? "border-red-500 bg-red-50" : "border-slate-300"}`}
                value={String(formData.day_of_week || "")}
                onChange={(e) => handleChange("day_of_week", e.target.value)}
                required
              >
                <option value="">-- Pilih Hari --</option>
                <option value="1">Senin</option>
                <option value="2">Selasa</option>
                <option value="3">Rabu</option>
                <option value="4">Kamis</option>
                <option value="5">Jumat</option>
                <option value="6">Sabtu</option>
                <option value="7">Minggu</option>
              </select>
              {fieldErrors.day_of_week && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.day_of_week}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Jam Mulai"
                name="start_time"
                type="time"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
              />
              <FormField
                label="Jam Selesai"
                name="end_time"
                type="time"
                required
                formData={formData}
                handleChange={handleChange}
                fieldErrors={fieldErrors}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
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
