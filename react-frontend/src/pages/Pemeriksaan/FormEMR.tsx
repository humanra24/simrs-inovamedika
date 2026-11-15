import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Dispatch, SetStateAction } from "react";
import {
  AlertCircle,
  Activity,
  ClipboardList,
  HeartPulse,
  Stethoscope,
  Save,
  Loader2,
} from "lucide-react";

export interface EMRFormData {
  anamnesis?: string;
  physical_exam?: string;
  primary_diagnosis?: string;
  secondary_diagnosis?: string;
  blood_pressure?: string;
  temperature?: string | number | null;
  pulse?: string | number | null;
  respiratory_rate?: string | number | null;
  weight?: string | number | null;
  height?: string | number | null;
}

// Komponen Input dengan Validasi
const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  fieldErrors,
}: {
  label: string;
  name: string;
  value?: string | number | null;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  fieldErrors: Record<string, string>;
}) => (
  <div className="space-y-1.5">
    <Label className={fieldErrors[name] ? "text-red-500" : "text-slate-700"}>
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`h-11 bg-slate-50 focus-visible:bg-white border-slate-200 ${fieldErrors[name] ? "border-red-500 bg-red-50" : ""}`}
    />
    {fieldErrors[name] && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {fieldErrors[name]}
      </p>
    )}
  </div>
);

// Komponen Textarea (TANPA label, karena judul sudah di Card)
const FormTextarea = ({
  name,
  value,
  onChange,
  placeholder,
  fieldErrors,
}: {
  name: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fieldErrors: Record<string, string>;
}) => (
  <div className="space-y-1.5">
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`min-h-25 bg-slate-50 focus-visible:bg-white border-slate-200 resize-none ${fieldErrors[name] ? "border-red-500 bg-red-50" : ""}`}
    />
    {fieldErrors[name] && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {fieldErrors[name]}
      </p>
    )}
  </div>
);

interface FormEMRProps {
  emrData: EMRFormData;
  setEmrData: Dispatch<SetStateAction<EMRFormData>>;
  onSave: () => void;
  isSubmitting: boolean;
  hasEMR: boolean;
  fieldErrors?: Record<string, string>;
}

export default function FormEMR({
  emrData,
  setEmrData,
  onSave,
  isSubmitting,
  hasEMR,
  fieldErrors = {},
}: FormEMRProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {/* Kolom Kiri: Catatan Medis */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Anamnesis & Keluhan <span className="text-red-500">*</span>
            </h2>
          </div>
          <div className="p-5">
            <FormTextarea
              name="anamnesis"
              value={emrData.anamnesis}
              onChange={(v) => setEmrData({ ...emrData, anamnesis: v })}
              fieldErrors={fieldErrors}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Hasil Pemeriksaan Fisik <span className="text-red-500">*</span>
            </h2>
          </div>
          <div className="p-5">
            <FormTextarea
              name="physical_exam"
              value={emrData.physical_exam}
              onChange={(v) => setEmrData({ ...emrData, physical_exam: v })}
              fieldErrors={fieldErrors}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Diagnosis
            </h2>
          </div>
          <div className="p-5 space-y-5">
            <FormInput
              label="Diagnosis Utama (ICD-10)"
              name="primary_diagnosis"
              value={emrData.primary_diagnosis}
              onChange={(v) => setEmrData({ ...emrData, primary_diagnosis: v })}
              required
              fieldErrors={fieldErrors}
            />
            <FormInput
              label="Diagnosis Sekunder"
              name="secondary_diagnosis"
              value={emrData.secondary_diagnosis}
              onChange={(v) =>
                setEmrData({ ...emrData, secondary_diagnosis: v })
              }
              fieldErrors={fieldErrors}
            />
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Tanda Vital + Tombol Simpan */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-semibold text-slate-900">
              Tanda Vital
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <FormInput
              label="Tekanan Darah"
              name="blood_pressure"
              value={emrData.blood_pressure}
              onChange={(v) => setEmrData({ ...emrData, blood_pressure: v })}
              placeholder="120/80 mmHg"
              fieldErrors={fieldErrors}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Suhu (°C)"
                name="temperature"
                type="number"
                value={emrData.temperature}
                onChange={(v) => setEmrData({ ...emrData, temperature: v })}
                placeholder="36.5"
                fieldErrors={fieldErrors}
              />
              <FormInput
                label="Nadi (bpm)"
                name="pulse"
                type="number"
                value={emrData.pulse}
                onChange={(v) => setEmrData({ ...emrData, pulse: v })}
                placeholder="80"
                fieldErrors={fieldErrors}
              />
            </div>
            <FormInput
              label="Respirasi (x/mnt)"
              name="respiratory_rate"
              type="number"
              value={emrData.respiratory_rate}
              onChange={(v) => setEmrData({ ...emrData, respiratory_rate: v })}
              placeholder="20"
              fieldErrors={fieldErrors}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Berat (kg)"
                name="weight"
                type="number"
                value={emrData.weight}
                onChange={(v) => setEmrData({ ...emrData, weight: v })}
                placeholder="60"
                fieldErrors={fieldErrors}
              />
              <FormInput
                label="Tinggi (cm)"
                name="height"
                type="number"
                value={emrData.height}
                onChange={(v) => setEmrData({ ...emrData, height: v })}
                placeholder="170"
                fieldErrors={fieldErrors}
              />
            </div>
          </div>
        </div>

        {/* Tombol Simpan Sticky */}
        <div className="sticky bottom-6 lg:top-28 z-10">
          <Button
            onClick={onSave}
            disabled={isSubmitting}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-600/20 rounded-xl transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />{" "}
                {hasEMR ? "Perbarui EMR" : "Simpan EMR"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
