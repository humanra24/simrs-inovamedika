import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TestTube, Plus, Trash2 } from "lucide-react";
import type { LabOrder } from "../../types";

interface FormLabProps {
  labOrders: LabOrder[];
  setLabOrders: (orders: LabOrder[]) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  testName: string;
  setTestName: (name: string) => void;
  handleAddLab: (e: React.FormEvent) => void;
}

export default function FormLab({
  labOrders,
  setLabOrders,
  isModalOpen,
  setIsModalOpen,
  testName,
  setTestName,
  handleAddLab,
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
            {labOrders.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100"
              >
                <p className="font-semibold text-slate-900">{item.test_name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:bg-red-50"
                  onClick={() =>
                    setLabOrders(labOrders.filter((_, i) => i !== idx))
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
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
