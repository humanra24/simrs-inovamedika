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
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import type { Medicine, PrescriptionItem } from "../../types";

interface FormFarmasiProps {
  medicines: Medicine[];
  prescriptionItems: PrescriptionItem[];
  setPrescriptionItems: (items: PrescriptionItem[]) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedMedicine: string;
  setSelectedMedicine: (id: string) => void;
  qty: string;
  setQty: (qty: string) => void;
  dosage: string;
  setDosage: (dosage: string) => void;
  frequency: string;
  setFrequency: (freq: string) => void;
  handleAddMedicine: (e: React.FormEvent) => void;
  prescriptionStatus?: string;
  /** ID resep — jika ada, berarti resep sudah tersimpan di DB */
  prescriptionId?: number | null;
  onCancelPrescription?: () => void;
  isCancelling?: boolean;
}

export default function FormFarmasi({
  medicines,
  prescriptionItems,
  setPrescriptionItems,
  isModalOpen,
  setIsModalOpen,
  selectedMedicine,
  setSelectedMedicine,
  qty,
  setQty,
  dosage,
  setDosage,
  frequency,
  setFrequency,
  handleAddMedicine,
  prescriptionStatus,
  prescriptionId,
  onCancelPrescription,
  isCancelling = false,
}: FormFarmasiProps) {
  // Resep sudah tersimpan di DB?
  const isSaved = !!prescriptionId;
  // Read-only total: sudah diserahkan atau dibatalkan
  const isReadOnly =
    prescriptionStatus === "dispensed" || prescriptionStatus === "cancelled";
  // Masih bisa edit draft: belum tersimpan & belum read-only
  const canEditDraft = !isSaved && !isReadOnly;
  // Masih bisa batalkan: sudah tersimpan, status pending
  const canCancel = isSaved && prescriptionStatus === "pending";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-semibold text-slate-900">Resep Obat</h2>
        </div>
        {canEditDraft && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-purple-600 border-purple-200 hover:bg-purple-50"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Tambah
          </Button>
        )}
      </div>
      <div className="p-5">
        {/* Badge Status */}
        {prescriptionStatus && (
          <div className="mb-4 flex items-center gap-2">
            {prescriptionStatus === "pending" && (
              <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" /> Menunggu Diserahkan
              </span>
            )}
            {prescriptionStatus === "dispensed" && (
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sudah Diserahkan
              </span>
            )}
            {prescriptionStatus === "cancelled" && (
              <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Dibatalkan
              </span>
            )}
          </div>
        )}

        {prescriptionStatus === "dispensed" && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Obat sudah diserahkan
            oleh petugas farmasi.
          </div>
        )}

        {prescriptionStatus === "cancelled" && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
            <XCircle className="w-4 h-4 shrink-0" /> Resep ini telah dibatalkan.
          </div>
        )}

        {prescriptionItems.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-6">
            Belum ada obat diresepkan.
          </p>
        ) : (
          <ul className="space-y-3">
            {prescriptionItems.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.name}{" "}
                    <span className="text-purple-600">x{item.quantity}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.dosage} | {item.frequency}
                  </p>
                </div>
                {/* Tombol Trash HANYA muncul saat draft (belum tersimpan) */}
                {canEditDraft && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={() =>
                      setPrescriptionItems(
                        prescriptionItems.filter((_, i) => i !== idx),
                      )
                    }
                    title="Hapus obat dari draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Tombol Batalkan Resep — muncul saat sudah tersimpan & pending */}
        {canCancel && onCancelPrescription && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-red-600 border-red-200 hover:bg-red-50 font-semibold"
              onClick={onCancelPrescription}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Membatalkan
                  Resep...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" /> Batalkan Resep
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-106.25 bg-white shadow-2xl border-slate-200">
          <DialogHeader className="border-b pb-4 mb-2">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Tambah Obat
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMedicine} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Pilih Obat</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
                required
              >
                <option value="">-- Pilih Obat --</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                    {m.name} (Stok: {m.stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Jumlah</Label>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Dosis</Label>
                <Input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Aturan Pakai</Label>
              <Input
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              />
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
              >
                Tambahkan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
