import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  Pill,
  User,
  Stethoscope,
  CheckCircle2,
  Loader2,
  XCircle,
  Package,
  ClipboardList,
  Hash,
  Wallet,
} from "lucide-react";

import type { PrescriptionDetail } from "@/types";

interface DetailResepProps {
  prescription: PrescriptionDetail;
  onClose: () => void;
  onDispense: () => void;
  onCancel: () => void;
  isDispensing: boolean;
  isCancelling: boolean;
}

const formatRupiah = (value: number | string | null | undefined) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

export default function DetailResep({
  prescription,
  onClose,
  onDispense,
  onCancel,
  isDispensing,
  isCancelling,
}: DetailResepProps) {
  const isBusy = isDispensing || isCancelling;
  const items = prescription.items ?? [];

  const totalItems = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const totalPrice = items.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open && !isBusy) onClose();
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[700px] bg-white shadow-2xl border-slate-200 max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        {/* Header */}
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-600" />
            Detail Resep #{prescription.id}
          </DialogTitle>
        </DialogHeader>

        {/* Informasi Pasien */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              INFORMASI PASIEN
            </p>

            <p className="font-bold text-base text-slate-900">
              {prescription.visit?.patient?.full_name || "Pasien"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              RM: {prescription.visit?.patient?.medical_record_number || "-"}
            </span>

            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-slate-400" />
              {prescription.visit?.polyclinic?.name || "Poli"}
            </span>

            {prescription.visit?.queue_number && (
              <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <Hash className="w-3.5 h-3.5" />
                Antrean {prescription.visit.queue_number}
              </span>
            )}
          </div>
        </div>

        {/* Daftar Obat */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-purple-600" />

              <p className="text-sm font-bold text-slate-700">DAFTAR OBAT</p>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              {items.length} jenis obat
            </span>
          </div>

          {items.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center">
              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />

              <p className="text-sm font-medium text-slate-600">
                Belum ada item obat.
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Data obat tidak ditemukan pada resep ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const medicineName =
                  item.medicine?.name ||
                  item.name ||
                  `Obat #${item.medicine_id}`;

                const subtotal =
                  Number(item.price || 0) * Number(item.quantity || 0);

                return (
                  <div
                    key={item.id ?? index}
                    className="border border-slate-200 rounded-xl p-4 hover:border-purple-200 transition-colors"
                  >
                    {/* Nama dan jumlah */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">
                          {medicineName}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {item.medicine?.code || "-"}
                          {item.medicine?.unit
                            ? ` • ${item.medicine.unit}`
                            : ""}
                        </p>
                      </div>

                      <span className="shrink-0 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold">
                        x{item.quantity}
                      </span>
                    </div>

                    {/* Dosis */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Dosis</p>

                        <p className="text-sm font-medium text-slate-700">
                          {item.dosage || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-1">
                          Aturan Pakai
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          {item.frequency || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Harga */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        {formatRupiah(item.price)} × {item.quantity}
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ringkasan */}
        {items.length > 0 && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total kuantitas obat
              </span>

              <span className="font-semibold text-slate-800">
                {totalItems} item
              </span>
            </div>

            <div className="border-t border-purple-200 pt-3 flex justify-between items-center gap-3">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Total Harga
              </span>

              <span className="text-lg font-bold text-purple-700">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Status Resep</span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-600 px-3 py-1 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Menunggu Penyerahan
          </span>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isBusy}
            className="w-full sm:w-auto"
          >
            Tutup
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isBusy}
            className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Membatalkan...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-1" />
                Batalkan Resep
              </>
            )}
          </Button>

          <Button
            onClick={onDispense}
            disabled={isBusy || items.length === 0}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isDispensing ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Serahkan Obat
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
