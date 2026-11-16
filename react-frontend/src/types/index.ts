export interface User {
  id: number;
  username: string;
  role: string;
  roles: string[];
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
  queue_number: string;
  status: string; // Wajib ada
  patient?: {
    full_name: string;
    medical_record_number: string;
  };
  polyclinic?: {
    name: string;
  };
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
  id: number;
  prescription_id: number;
  medicine_id: number;
  quantity: number;
  dosage: string | null;
  frequency: string | null;
  price: string | number;

  // Relasi dari Yii2: items.medicine
  medicine?: {
    id: number;
    code: string;
    name: string;
    unit: string;
    price: string | number;
    stock: number;
    created_at?: string;
  } | null;

  // Kompatibilitas jika ada data lama
  name?: string;
}

export interface PrescriptionDetail {
  id: number;
  visit_id: number;
  status: "pending" | "dispensed" | "cancelled";
  items: PrescriptionItem[];
  created_at?: string;

  visit?: {
    id: number;
    queue_number: string | number;

    patient?: {
      full_name: string;
      medical_record_number: string;
    };

    doctor?: {
      name: string;
    };

    polyclinic?: {
      name: string;
    };
  };
}

export interface LabOrder {
  id?: number;
  test_name: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  result?: string | null;
  notes?: string | null;
  visit_id?: number;
  created_at?: string;
  visit?: {
    id: number;
    queue_number: string;
    patient?: {
      full_name: string;
      medical_record_number: string;
    };
    doctor?: { name: string };
    polyclinic?: { name: string };
  };
}

export interface BillItem {
  id: number;
  description: string;
  quantity: number;
  amount: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  created_at: string;
}

export interface Bill {
  id: number;
  visit_id: number;
  status: "unpaid" | "paid" | "partial" | "cancelled";
  total_amount: number;
  paid_amount: number;
  created_at: string;
  paid_at?: string | null;
  payment_method?: string | null;
  visit?: Visit;
  items?: BillItem[];
  payments?: Payment[];
}

export interface DashboardSummary {
  total_visits: string;
  total_revenue: string;
  total_paid: string;
  unpaid_bills: string;
  partial_bills: string;
  paid_bills: string;
}

export interface VisitsByPolyclinic {
  polyclinic_name: string;
  total_visits: string;
}

export interface ActionStat {
  action_name: string;
  total_performed: string;
}

export interface MedicineStat {
  medicine_name: string;
  total_used: string; // Menggunakan total_used sesuai backend
}

// Tipe untuk MasterDataTable & Form
export type MasterEntity =
  | "patients"
  | "polyclinics"
  | "doctors"
  | "schedules"
  | "actions"
  | "medicines";
