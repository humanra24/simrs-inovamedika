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
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import type { LabOrder } from "../../types";

interface FormLabProps {
  labOrders: LabOrder[];
  setLabOrders: (orders: LabOrder[]) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  testName: string;
  setTestName: (name: string) => void;
  handleAddLab: (e: React.FormEvent) => void;
  onCancelOrder?: (orderId: number) => void;
}

export default function FormLab({
  labOrders,
  setLabOrders,
  isModalOpen,
  setIsModalOpen,
  testName,
  setTestName,
  handleAddLab,
  onCancelOrder,
}: FormLabProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Order Pemeriksaan Lab
          </h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-orange-600 border-orange-200 hover:bg-orange-50"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Tambah
        </Button>
      </div>
      <div className="p-5">
        {labOrders.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-6">
            Belum ada order lab.
          </p>
        ) : (
          <ul className="space-y-3">
            {labOrders.map((item, idx) => {
              const itemKey = item.id ? `saved-${item.id}` : `draft-${idx}`;
              const isCompleted = item.status === "completed";

              return (
                <li
                  key={itemKey}
                  className={`p-4 rounded-lg border ${
                    isCompleted
                      ? "bg-green-50/40 border-green-200"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Nama Pemeriksaan */}
                      <p className="font-semibold text-slate-900">
                        {item.test_name}
                      </p>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mt-2">
                        {(!item.status || item.status === "pending") && (
                          <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Menunggu Hasil
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Selesai
                          </span>
                        )}
                        {item.status === "cancelled" && (
                          <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-md flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Dibatalkan
                          </span>
                        )}
                      </div>

                      {/* HASIL LAB — tampil jika completed & result ada */}
                      {isCompleted && item.result && (
                        <div className="mt-3 bg-white p-3 rounded-lg border border-green-200">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <FileText className="w-3.5 h-3.5 text-green-600" />
                            <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                              Hasil Pemeriksaan
                            </p>
                          </div>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">
                            {item.result}
                          </p>
                          {item.notes && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              <p className="text-xs text-slate-500">
                                <span className="font-semibold">Catatan:</span>{" "}
                                {item.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* HASIL ADA TAPI STATUS BUKAN COMPLETED (fallback) */}
                      {!isCompleted && item.result && (
                        <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <p className="text-xs font-semibold text-slate-500 uppercase">
                              Hasil
                            </p>
                          </div>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">
                            {item.result}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* TOMBOL AKSI */}
                    {!item.id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 shrink-0"
                        onClick={() =>
                          setLabOrders(labOrders.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    {item.id && item.status === "pending" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-red-600 border-red-200 hover:bg-red-50 shrink-0"
                        onClick={() => {
                          if (onCancelOrder) {
                            onCancelOrder(item.id!);
                          } else {
                            setLabOrders(
                              labOrders.filter((o) => o.id !== item.id),
                            );
                          }
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Batal
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-106.25 bg-white shadow-2xl border-slate-200">
          <DialogHeader className="border-b pb-4 mb-2">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Tambah Order Lab
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLab} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nama Pemeriksaan Lab</Label>
              <Input
                placeholder="Contoh: Darah Lengkap"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                required
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
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
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
