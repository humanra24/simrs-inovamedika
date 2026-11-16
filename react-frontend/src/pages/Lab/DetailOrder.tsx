import { useState } from "react";
import nodeApi from "@/api/nodeApi";
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
  TestTube,
  User,
  Stethoscope,
  Loader2,
  XCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import type { LabOrder } from "@/types";

interface DetailOrderProps {
  order: LabOrder;
  onClose: () => void;
  onSuccess: (updatedOrder: LabOrder) => void;
}

export default function DetailOrder({
  order,
  onClose,
  onSuccess,
}: DetailOrderProps) {
  const [resultData, setResultData] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resultData.trim()) {
      return toast.error("Hasil pemeriksaan wajib diisi.");
    }

    setIsSubmitting(true);
    try {
      await nodeApi.post(`/lab/integration/send/${order.id}`, {
        result_data: resultData,
        notes: notes || null,
      });

      toast.success("Hasil lab berhasil disimpan.");
      onSuccess({ ...order, status: "completed", result: resultData });
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        apiError.response?.data?.message || "Gagal menyimpan hasil lab.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="sm:max-w-[600px] bg-white shadow-2xl border-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-2">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-orange-600" />
            Proses Order Lab #{order.id}
          </DialogTitle>
        </DialogHeader>

        {/* Info Pasien */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-1">PASIEN</p>
          <p className="font-bold text-slate-900">
            {order.visit?.patient?.full_name || "Pasien"}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> RM:{" "}
              {order.visit?.patient?.medical_record_number || "-"}
            </span>
            <span className="flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" />{" "}
              {order.visit?.polyclinic?.name || "Poli"}
            </span>
            {order.visit?.queue_number && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                Antrean {order.visit.queue_number}
              </span>
            )}
          </div>
        </div>

        {/* Info Pemeriksaan */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-orange-600 mb-1">
            JENIS PEMERIKSAAN
          </p>
          <p className="font-bold text-lg text-orange-700">{order.test_name}</p>
        </div>

        {/* Form Input Hasil */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="result">
              Hasil Pemeriksaan <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="result"
              value={resultData}
              onChange={(e) => setResultData(e.target.value)}
              placeholder="Contoh: Hb: 14 g/dL, WBC: 7000, PLT: 250000"
              rows={4}
              required
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none"
            />
            <p className="text-xs text-slate-400">
              Tuliskan hasil lengkap dengan satuan dan nilai normal jika perlu.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Catatan Tambahan (opsional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Normal / perlu pemeriksaan lanjutan"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <XCircle className="w-4 h-4 mr-1" /> Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !resultData.trim()}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" /> Simpan Hasil
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
