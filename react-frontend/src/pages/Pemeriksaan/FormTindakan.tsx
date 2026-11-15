import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity, Plus, Trash2 } from "lucide-react";
import type { ActionMaster, SelectedAction } from "../../types";

interface FormTindakanProps {
  actionsMaster: ActionMaster[];
  selectedActions: SelectedAction[];
  setSelectedActions: (actions: SelectedAction[]) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedActionId: string;
  setSelectedActionId: (id: string) => void;
  handleAddAction: (e: React.FormEvent) => void;
  isReadOnly?: boolean;
}

export default function FormTindakan({
  actionsMaster,
  selectedActions,
  setSelectedActions,
  isModalOpen,
  setIsModalOpen,
  selectedActionId,
  setSelectedActionId,
  handleAddAction,
  isReadOnly = false,
}: FormTindakanProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Tindakan Medis
          </h2>
        </div>
        {!isReadOnly && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Tambah
          </Button>
        )}
      </div>
      <div className="p-5">
        {selectedActions.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-6">
            Belum ada tindakan ditambahkan.
          </p>
        ) : (
          <ul className="space-y-3">
            {selectedActions.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-emerald-600 font-medium mt-1">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={() =>
                      setSelectedActions(
                        selectedActions.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-106.25 bg-white shadow-2xl border-slate-200">
          <DialogHeader className="border-b pb-4 mb-2">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Tambah Tindakan
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAction} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Pilih Tindakan</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
                value={selectedActionId}
                onChange={(e) => setSelectedActionId(e.target.value)}
                required
              >
                <option value="">-- Pilih Tindakan --</option>
                {actionsMaster.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} - Rp {a.price.toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
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
