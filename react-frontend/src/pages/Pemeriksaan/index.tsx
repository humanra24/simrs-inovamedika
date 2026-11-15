import { useState, useEffect, type ComponentProps } from "react";
import api from "../../api/axios";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Stethoscope,
  Loader2,
  ChevronRight,
  FileText,
  ClipboardList,
  Activity,
  Pill,
  TestTube,
} from "lucide-react";
import { toast } from "sonner";
import FormEMR from "./FormEMR";
import FormTindakan from "./FormTindakan";
import FormFarmasi from "./FormFarmasi";
import FormLab from "./FormLab";
import type {
  Visit,
  MedicalRecordHistory,
  ActionMaster,
  Medicine,
  SelectedAction,
  PrescriptionItem,
  LabOrder,
} from "../../types";

export default function Pemeriksaan() {
  const [activeTab, setActiveTab] = useState<"waiting" | "history">("waiting");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [history, setHistory] = useState<MedicalRecordHistory[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasEMR, setHasEMR] = useState(false);
  const [formTab, setFormTab] = useState<
    "emr" | "tindakan" | "farmasi" | "lab"
  >("emr");

  const [initialActions, setInitialActions] = useState<SelectedAction[]>([]);

  // Loading States per Tab
  const [isSubmittingEMR, setIsSubmittingEMR] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [isSubmittingPrescription, setIsSubmittingPrescription] =
    useState(false);
  const [isSubmittingLab, setIsSubmittingLab] = useState(false);
  const [isFetchingTab, setIsFetchingTab] = useState(false); // <-- Loading saat fetch tab

  // State EMR
  const [emrData, setEmrData] = useState<
    ComponentProps<typeof FormEMR>["emrData"]
  >({
    anamnesis: "",
    physical_exam: "",
    primary_diagnosis: "",
    secondary_diagnosis: "",
    blood_pressure: "",
    temperature: "",
    pulse: "",
    respiratory_rate: "",
    weight: "",
    height: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // State Master Data
  const [actionsMaster, setActionsMaster] = useState<ActionMaster[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // State Tindakan
  const [selectedActions, setSelectedActions] = useState<SelectedAction[]>([]);
  const [selectedActionId, setSelectedActionId] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // State Farmasi
  const [prescriptionItems, setPrescriptionItems] = useState<
    PrescriptionItem[]
  >([]);
  const [prescriptionStatus, setPrescriptionStatus] = useState("");
  const [prescriptionId, setPrescriptionId] = useState<number | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [qty, setQty] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);

  // State Lab
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [testName, setTestName] = useState("");
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  // Fetch Master Data
  const fetchMasterData = async () => {
    try {
      const [resAction, resMed] = await Promise.all([
        api.get("/master/actions"),
        api.get("/master/medicines"),
      ]);
      setActionsMaster(resAction.data.data || []);
      setMedicines(resMed.data.data || []);
    } catch (err) {
      console.error("Gagal memuat master data", err);
    }
  };

  const fetchData = async () => {
    try {
      const resVisit = await api.get("/medical-records/waiting");
      setVisits(resVisit.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/medical-records/history");
      setHistory(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
      fetchHistory();
      fetchMasterData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // --- EFFECT KHUSUS UNTUK FETCH DATA PER TAB ---
  useEffect(() => {
    if (!selectedVisit) return;

    const fetchTabData = async () => {
      setIsFetchingTab(true);
      try {
        if (formTab === "tindakan") {
          const res = await api.get(`/visit-actions/${selectedVisit.id}`);
          if (res.data.data) {
            const mappedActions = res.data.data.map(
              (a: {
                medical_action_id: number;
                medicalAction?: { name?: string | null } | null;
                price?: number | null;
              }) => ({
                medical_action_id: a.medical_action_id,
                name: a.medicalAction?.name || "Tindakan",
                price: a.price || 0,
              }),
            );
            setSelectedActions(mappedActions);
            setInitialActions(mappedActions); // <-- Simpan data awal
          } else {
            setSelectedActions([]);
            setInitialActions([]);
          }
        } else if (formTab === "farmasi") {
          const res = await api.get(`/prescriptions/${selectedVisit.id}`);
          if (res.data.data) {
            setPrescriptionStatus(res.data.data.status);
            setPrescriptionId(res.data.data.id);
            if (res.data.data.items) {
              setPrescriptionItems(
                res.data.data.items.map(
                  (item: {
                    medicine_id: number;
                    quantity: number;
                    dosage: string;
                    frequency: string;
                    medicine?: { name: string };
                  }) => ({
                    medicine_id: item.medicine_id,
                    name: item.medicine?.name || "Obat",
                    quantity: item.quantity,
                    dosage: item.dosage,
                    frequency: item.frequency,
                  }),
                ),
              );
            }
          }
        }
        // Lab belum ada endpoint GET by visit_id, jadi kita biarkan kosong dulu (opsional)
      } catch {
        // Abaikan error 404 (belum ada data)
      } finally {
        setIsFetchingTab(false);
      }
    };

    fetchTabData();
  }, [formTab, selectedVisit]);

  const handleSelectVisit = async (
    visit: Visit | undefined,
    emrDataFromHistory?: MedicalRecordHistory,
  ) => {
    if (!visit) return toast.error("Data kunjungan tidak ditemukan.");
    setSelectedVisit(visit);
    setFormTab("emr"); // Kembali ke tab EMR
    setFieldErrors({});
    setSelectedActions([]);
    setPrescriptionItems([]);
    setLabOrders([]);
    setPrescriptionStatus("");
    setPrescriptionId(null);

    setEmrData({
      anamnesis: "",
      physical_exam: "",
      primary_diagnosis: "",
      secondary_diagnosis: "",
      blood_pressure: "",
      temperature: "",
      pulse: "",
      respiratory_rate: "",
      weight: "",
      height: "",
    });

    try {
      const resEmr = await api.get(`/medical-records/${visit.id}`);
      const emr = resEmr.data.data || emrDataFromHistory;
      if (emr) {
        setEmrData({
          anamnesis: emr.anamnesis || "",
          physical_exam: emr.physical_exam || "",
          primary_diagnosis: emr.primary_diagnosis || "",
          secondary_diagnosis: emr.secondary_diagnosis || "",
          blood_pressure: emr.blood_pressure || "",
          temperature: emr.temperature || "",
          pulse: emr.pulse || "",
          respiratory_rate: emr.respiratory_rate || "",
          weight: emr.weight || "",
          height: emr.height || "",
        });
        setHasEMR(true);
      } else {
        setHasEMR(false);
      }
    } catch {
      if (emrDataFromHistory) {
        setEmrData({
          anamnesis: emrDataFromHistory.anamnesis || "",
          physical_exam: emrDataFromHistory.physical_exam || "",
          primary_diagnosis: emrDataFromHistory.primary_diagnosis || "",
          secondary_diagnosis: emrDataFromHistory.secondary_diagnosis || "",
          blood_pressure: emrDataFromHistory.blood_pressure || "",
          temperature: emrDataFromHistory.temperature || "",
          pulse: emrDataFromHistory.pulse || "",
          respiratory_rate: emrDataFromHistory.respiratory_rate || "",
          weight: emrDataFromHistory.weight || "",
          height: emrDataFromHistory.height || "",
        });
        setHasEMR(true);
      } else {
        setHasEMR(false);
      }
    }
  };

  // --- SUBMIT HANDLERS ---
  const handleSaveEMR = async () => {
    if (!selectedVisit) return;
    const newErrors: Record<string, string> = {};
    if (!emrData.anamnesis?.trim())
      newErrors.anamnesis = "Anamnesis wajib diisi.";
    if (!emrData.physical_exam?.trim())
      newErrors.physical_exam = "Hasil pemeriksaan fisik wajib diisi.";
    if (!emrData.primary_diagnosis?.trim())
      newErrors.primary_diagnosis = "Diagnosis utama wajib diisi.";
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error("Harap lengkapi field wajib.");
      return;
    }

    setIsSubmittingEMR(true);
    setFieldErrors({});
    try {
      if (!hasEMR)
        await api.post(`/medical-records/${selectedVisit.id}`, emrData);
      else await api.put(`/medical-records/${selectedVisit.id}`, emrData);
      toast.success(
        hasEMR ? "Rekam medis diperbarui!" : "Rekam medis disimpan!",
      );
      setHasEMR(true);
    } catch (err: unknown) {
      const apiError = err as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      if (apiError.response?.data?.errors) {
        const formatted: Record<string, string> = {};
        Object.keys(apiError.response.data.errors).forEach((key) => {
          formatted[key] = apiError.response!.data!.errors![key][0];
        });
        setFieldErrors(formatted);
      } else {
        toast.error(apiError.response?.data?.message || "Gagal menyimpan EMR.");
      }
    } finally {
      setIsSubmittingEMR(false);
    }
  };

  const handleSaveAction = async () => {
    if (!selectedVisit) return;
    setIsSubmittingAction(true);
    try {
      // 1. Ambil data tindakan yang sudah ada di DB
      const resAct = await api.get(`/visit-actions/${selectedVisit.id}`);
      const existingActions: { id: number; medical_action_id: number }[] =
        resAct.data.data || [];

      // 2. Buat Set ID untuk pengecekan cepat
      const existingActIds = existingActions.map((a) => a.medical_action_id);
      const selectedActIds = selectedActions.map((a) => a.medical_action_id);

      // 3. HAPUS tindakan yang ada di DB tapi tidak ada di UI
      for (const existing of existingActions) {
        if (!selectedActIds.includes(existing.medical_action_id)) {
          await api.delete(`/visit-actions/${existing.id}`);
        }
      }

      // 4. TAMBAH tindakan yang ada di UI tapi belum ada di DB
      for (const act of selectedActions) {
        if (!existingActIds.includes(act.medical_action_id)) {
          await api.post(`/visit-actions/${selectedVisit.id}`, {
            medical_action_id: act.medical_action_id,
          });
        }
      }

      toast.success("Tindakan berhasil disimpan!");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Gagal menyimpan tindakan.",
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!selectedVisit) return;
    setIsSubmittingPrescription(true);
    try {
      if (!prescriptionId && prescriptionItems.length > 0) {
        const payload = prescriptionItems.map((i) => ({
          medicine_id: i.medicine_id,
          quantity: i.quantity,
          dosage: i.dosage,
          frequency: i.frequency,
        }));
        const res = await api.post(`/prescriptions/${selectedVisit.id}`, {
          items: payload,
        });
        if (res.data.data) {
          setPrescriptionId(res.data.data.id);
          setPrescriptionStatus(res.data.data.status);
        }
        toast.success("Resep berhasil disimpan!");
      } else if (prescriptionId) {
        toast.info(
          "Resep sudah tersimpan. Klik 'Batalkan Resep' untuk mengubah.",
        );
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Gagal menyimpan resep.");
    } finally {
      setIsSubmittingPrescription(false);
    }
  };

  const handleSaveLab = async () => {
    if (!selectedVisit) return;
    setIsSubmittingLab(true);
    try {
      for (const lab of labOrders) {
        await api.post(`/lab/orders/${selectedVisit.id}`, {
          test_name: lab.test_name,
        });
      }
      toast.success("Order Lab berhasil disimpan!");
      setLabOrders([]);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Gagal menyimpan order lab.",
      );
    } finally {
      setIsSubmittingLab(false);
    }
  };

  // --- ADD HANDLERS ---
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    const action = actionsMaster.find(
      (a) => a.id.toString() === selectedActionId,
    );
    if (!action) return;
    if (selectedActions.some((a) => a.medical_action_id === action.id))
      return toast.error("Tindakan sudah ada.");
    setSelectedActions([
      ...selectedActions,
      { medical_action_id: action.id, name: action.name, price: action.price },
    ]);
    setIsActionModalOpen(false);
    setSelectedActionId("");
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medicines.find((m) => m.id.toString() === selectedMedicine);
    if (!med || !qty) return;
    if (Number(qty) > med.stock)
      return toast.error(`Stok ${med.name} tidak cukup.`);
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicine_id: med.id,
        name: med.name,
        quantity: Number(qty),
        dosage,
        frequency,
      },
    ]);
    setIsMedicineModalOpen(false);
    setSelectedMedicine("");
    setQty("");
    setDosage("");
    setFrequency("");
  };

  const handleAddLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName) return;
    setLabOrders([...labOrders, { test_name: testName }]);
    setIsLabModalOpen(false);
    setTestName("");
  };

  // Di dalam render, sebelum return
  const hasChanges =
    selectedActions.length !== initialActions.length ||
    selectedActions.some(
      (act, idx) =>
        act.medical_action_id !== initialActions[idx]?.medical_action_id,
    );

  // ================= TAMPILAN FORM (JIKA PASIEN DIPILIH) =================
  if (selectedVisit) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        {/* Header Pasien */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setSelectedVisit(null)}
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-slate-900">
                  {selectedVisit.patient?.full_name || "Pasien"}
                </h1>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">
                  Antrean {selectedVisit.queue_number}
                </span>
                {hasEMR && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md">
                    Sudah Diperiksa
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" /> RM:{" "}
                  {selectedVisit.patient?.medical_record_number || "-"}
                </span>
                <span className="flex items-center gap-1">
                  <Stethoscope className="w-4 h-4" />{" "}
                  {selectedVisit.polyclinic?.name || "Poli"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigasi */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFormTab("emr")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${formTab === "emr" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
          >
            <ClipboardList className="w-4 h-4" /> Pemeriksaan (EMR)
          </button>
          <button
            onClick={() => setFormTab("tindakan")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${formTab === "tindakan" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
          >
            <Activity className="w-4 h-4" /> Tindakan Medis
          </button>
          <button
            onClick={() => setFormTab("farmasi")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${formTab === "farmasi" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
          >
            <Pill className="w-4 h-4" /> Resep Obat
          </button>
          <button
            onClick={() => setFormTab("lab")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${formTab === "lab" ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
          >
            <TestTube className="w-4 h-4" /> Order Lab
          </button>
        </div>

        {/* Konten Tab */}
        {isFetchingTab ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {formTab === "emr" && (
              <FormEMR
                emrData={emrData}
                setEmrData={setEmrData}
                onSave={handleSaveEMR}
                isSubmitting={isSubmittingEMR}
                hasEMR={hasEMR}
                fieldErrors={fieldErrors}
              />
            )}

            {formTab === "tindakan" && (
              <div className="space-y-6">
                <FormTindakan
                  actionsMaster={actionsMaster}
                  selectedActions={selectedActions}
                  setSelectedActions={setSelectedActions}
                  isModalOpen={isActionModalOpen}
                  setIsModalOpen={setIsActionModalOpen}
                  selectedActionId={selectedActionId}
                  setSelectedActionId={setSelectedActionId}
                  handleAddAction={handleAddAction}
                  isReadOnly={false}
                />
                <Button
                  onClick={handleSaveAction}
                  disabled={isSubmittingAction || !hasChanges}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md rounded-xl"
                >
                  {isSubmittingAction ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                      Menyimpan Tindakan...
                    </>
                  ) : (
                    "Simpan Tindakan"
                  )}
                </Button>
              </div>
            )}

            {formTab === "farmasi" && (
              <div className="space-y-6">
                <FormFarmasi
                  medicines={medicines}
                  prescriptionItems={prescriptionItems}
                  setPrescriptionItems={setPrescriptionItems}
                  isModalOpen={isMedicineModalOpen}
                  setIsModalOpen={setIsMedicineModalOpen}
                  selectedMedicine={selectedMedicine}
                  setSelectedMedicine={setSelectedMedicine}
                  qty={qty}
                  setQty={setQty}
                  dosage={dosage}
                  setDosage={setDosage}
                  frequency={frequency}
                  setFrequency={setFrequency}
                  handleAddMedicine={handleAddMedicine}
                  prescriptionStatus={prescriptionStatus}
                />
                {prescriptionStatus !== "dispensed" &&
                  prescriptionStatus !== "cancelled" && (
                    <Button
                      onClick={handleSavePrescription}
                      disabled={
                        isSubmittingPrescription ||
                        (prescriptionItems.length === 0 && !prescriptionId)
                      }
                      className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md rounded-xl"
                    >
                      {isSubmittingPrescription ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                          Menyimpan Resep...
                        </>
                      ) : (
                        "Simpan Resep"
                      )}
                    </Button>
                  )}
              </div>
            )}

            {formTab === "lab" && (
              <div className="space-y-6">
                <FormLab
                  labOrders={labOrders}
                  setLabOrders={setLabOrders}
                  isModalOpen={isLabModalOpen}
                  setIsModalOpen={setIsLabModalOpen}
                  testName={testName}
                  setTestName={setTestName}
                  handleAddLab={handleAddLab}
                />
                <Button
                  onClick={handleSaveLab}
                  disabled={isSubmittingLab || labOrders.length === 0}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md rounded-xl"
                >
                  {isSubmittingLab ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                      Menyimpan Lab...
                    </>
                  ) : (
                    "Simpan Order Lab"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ================= TAMPILAN DAFTAR TUNGGU & RIWAYAT =================
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Pemeriksaan Pasien
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola antrean, EMR, Tindakan, Farmasi, dan Lab.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("waiting")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "waiting" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5" : "text-slate-500"}`}
          >
            Daftar Tunggu
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "history" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5" : "text-slate-500"}`}
          >
            Riwayat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (activeTab === "waiting" ? visits : history).length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-lg font-medium text-slate-700">
              Tidak ada data.
            </p>
          </div>
        ) : (
          (activeTab === "waiting" ? visits : history).map(
            (v: Visit | MedicalRecordHistory) => {
              const isHistory = "visit" in v;
              const visitData: Visit | undefined = isHistory
                ? (v as MedicalRecordHistory).visit
                : (v as Visit);
              if (!visitData) return null;
              return (
                <div
                  key={v.id}
                  onClick={() =>
                    handleSelectVisit(
                      visitData,
                      isHistory ? (v as MedicalRecordHistory) : undefined,
                    )
                  }
                  className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer overflow-hidden flex flex-col"
                >
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                        Antrean {visitData.queue_number || "-"}
                      </span>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {visitData.polyclinic?.name || "Poli Umum"}
                      </span>
                    </div>
                    {isHistory && (
                      <FileText className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="p-5 flex-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                      {visitData.patient?.full_name || "Nama Tidak Diketahui"}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                      RM:{" "}
                      <span className="text-slate-700">
                        {visitData.patient?.medical_record_number || "-"}
                      </span>
                    </p>
                    {isHistory && (
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        Diagnosis:{" "}
                        <span className="text-slate-800">
                          {(v as MedicalRecordHistory).primary_diagnosis || "-"}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
                    <span className="text-sm font-semibold text-blue-600">
                      {activeTab === "waiting"
                        ? "Mulai Pemeriksaan"
                        : "Lihat Rekam Medis"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              );
            },
          )
        )}
      </div>
    </div>
  );
}
