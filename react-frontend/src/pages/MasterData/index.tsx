import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MasterDataTable } from "./MasterDataTable";
import MasterDataForm from "./MasterDataForm";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MasterEntity, MasterItem } from "../../types";

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

export default function MasterData() {
  const [activeTab, setActiveTab] = useState<MasterEntity>("patients");
  const [data, setData] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchData = async (entity: MasterEntity) => {
    try {
      const res = await api.get(`/master/${entity}`);
      setData(res.data.data || []);
    } catch {
      toast.error("Gagal memuat data master.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/master/${activeTab}`)
      .then((res) => {
        if (!cancelled) setData(res.data.data || []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Gagal memuat data master.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleSave = async (formData: Partial<MasterItem>) => {
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      if (editingItem && editingItem.id) {
        await api.put(`/master/${activeTab}/${editingItem.id}`, formData);
        toast.success("Data berhasil diperbarui!");
      } else {
        await api.post(`/master/${activeTab}`, formData);
        toast.success("Data berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setLoading(true);
      fetchData(activeTab);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.response?.data?.errors) {
        const formattedErrors: Record<string, string> = {};
        Object.keys(apiError.response.data.errors).forEach((key) => {
          formattedErrors[key] = apiError.response!.data!.errors![key][0];
        });
        setFieldErrors(formattedErrors);
      } else {
        toast.error(
          apiError.response?.data?.message || "Gagal menyimpan data.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await api.delete(`/master/${activeTab}/${id}`);
      toast.success("Data berhasil dihapus!");
      setLoading(true);
      fetchData(activeTab);
    } catch {
      toast.error("Gagal menghapus data.");
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleEditClick = (item: MasterItem) => {
    setEditingItem(item);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Master Data
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola data referensi operasional SIMRS.
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl px-5"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Data
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setLoading(true);
          setActiveTab(v as MasterEntity);
        }}
      >
        <TabsList className="mb-6 border-b border-slate-200 w-full justify-start rounded-none bg-transparent p-0 h-auto gap-6">
          <TabsTrigger
            value="patients"
            className="px-1 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-800 transition-all"
          >
            Pasien
          </TabsTrigger>
          <TabsTrigger
            value="polyclinics"
            className="px-1 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-800 transition-all"
          >
            Poli
          </TabsTrigger>
          <TabsTrigger
            value="doctors"
            className="px-1 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-800 transition-all"
          >
            Dokter
          </TabsTrigger>
          <TabsTrigger
            value="schedules"
            className="px-1 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-800 transition-all"
          >
            Jadwal
          </TabsTrigger>
          <TabsTrigger
            value="actions"
            className="px-1 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-800 transition-all"
          >
            Tindakan
          </TabsTrigger>
          <TabsTrigger
            value="medicines"
            className="px-1 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-slate-500 hover:text-slate-800 transition-all"
          >
            Obat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" />
        <TabsContent value="polyclinics" />
        <TabsContent value="doctors" />
        <TabsContent value="schedules" />
        <TabsContent value="actions" />
        <TabsContent value="medicines" />

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <MasterDataTable
                entity={activeTab}
                data={data}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-125 bg-white shadow-2xl border-slate-200">
          <DialogHeader className="border-b pb-4 mb-2">
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingItem ? "Edit Data" : "Tambah Data Baru"}
            </DialogTitle>
          </DialogHeader>
          <MasterDataForm
            entity={activeTab}
            initialData={editingItem}
            onSubmit={handleSave}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isSubmitting}
            fieldErrors={fieldErrors}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
