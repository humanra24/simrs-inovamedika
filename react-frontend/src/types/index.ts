export interface User {
  id: number;
  username: string;
  role?: string;
}

export interface Patient {
  id: number;
  full_name: string;
  medical_record_number: string;
  nik: string;
}

export interface Polyclinic {
  id: number;
  name: string;
}
export interface Doctor {
  id: number;
  name: string;
  polyclinic_id: number;
}
export interface VisitResult {
  id: number;
  queue_number: number;
  visit_date: string;
  status: string;
}
export interface VisitHistory {
  id: number;
  queue_number: number;
  visit_date: string;
  status: string;
  patient?: { full_name: string; medical_record_number: string };
  doctor?: { name: string };
  polyclinic?: { name: string };
}
export interface Visit {
  id: number;
  queue_number: number;
  patient?: { full_name: string; medical_record_number: string };
  polyclinic?: { name: string };
  status: string;
}

export interface MedicalRecordHistory {
  id: number;
  primary_diagnosis: string;
  visit?: Visit;
  anamnesis?: string;
  physical_exam?: string;
  secondary_diagnosis?: string;
  blood_pressure?: string;
  temperature?: string;
  pulse?: string;
  respiratory_rate?: string;
  weight?: string;
  height?: string;
}

// --- MASTER DATA ---
export interface Polyclinic {
  id: number;
  name: string;
  description?: string;
}

export interface Doctor {
  id: number;
  polyclinic_id: number;
  name: string;
  specialization?: string;
  phone_number?: string;
}

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  quota: number;
}

export interface MedicalAction {
  id: number;
  code: string;
  name: string;
  price: number;
}

export interface Medicine {
  id: number;
  code: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
}

export type MasterItem = {
  id: number;
  [key: string]: unknown;
};

export interface Polyclinic {
  id: number;
  name: string;
}

export interface ActionMaster {
  id: number;
  name: string;
  price: number;
}
export interface Medicine {
  id: number;
  name: string;
  unit: string;
  stock: number;
}
export interface SelectedAction {
  medical_action_id: number;
  name: string;
  price: number;
}
export interface PrescriptionItem {
  medicine_id: number;
  name: string;
  quantity: number;
  dosage: string;
  frequency: string;
}
export interface LabOrder {
  test_name: string;
}

// Tipe untuk MasterDataTable & Form
export type MasterEntity =
  | "patients"
  | "polyclinics"
  | "doctors"
  | "schedules"
  | "actions"
  | "medicines";
