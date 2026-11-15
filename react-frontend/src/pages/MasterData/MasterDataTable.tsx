import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import type { MasterEntity, MasterItem } from "../../types";

interface MasterDataTableProps {
  entity: MasterEntity;
  data: MasterItem[];
  onEdit: (item: MasterItem) => void;
  onDelete: (id: number) => void;
}

export function MasterDataTable({
  entity,
  data,
  onEdit,
  onDelete,
}: MasterDataTableProps) {
  const safeString = (value: unknown): string => {
    return value !== null && value !== undefined && value !== ""
      ? String(value)
      : "-";
  };

  const formatPrice = (price: unknown) => {
    return `Rp ${Number(price || 0).toLocaleString("id-ID")}`;
  };

  const renderHeaders = () => {
    switch (entity) {
      case "patients":
        return (
          <>
            <th className="px-6 py-4">No. RM</th>
            <th className="px-6 py-4">Nama Pasien</th>
            <th className="px-6 py-4">NIK</th>
          </>
        );
      case "polyclinics":
        return (
          <>
            <th className="px-6 py-4">Nama Poli</th>
            <th className="px-6 py-4">Deskripsi</th>
          </>
        );
      case "doctors":
        return (
          <>
            <th className="px-6 py-4">Nama Dokter</th>
            <th className="px-6 py-4">Spesialisasi</th>
            <th className="px-6 py-4">ID Poli</th>
          </>
        );
      case "medicines":
        return (
          <>
            <th className="px-6 py-4">Kode</th>
            <th className="px-6 py-4">Nama Obat</th>
            <th className="px-6 py-4">Harga</th>
            <th className="px-6 py-4">Stok</th>
          </>
        );
      case "actions":
        return (
          <>
            <th className="px-6 py-4">Kode</th>
            <th className="px-6 py-4">Nama Tindakan</th>
            <th className="px-6 py-4">Tarif</th>
          </>
        );
      case "schedules":
        return (
          <>
            <th className="px-6 py-4">ID Dokter</th>
            <th className="px-6 py-4">Hari</th>
            <th className="px-6 py-4">Jam Mulai</th>
            <th className="px-6 py-4">Jam Selesai</th>
          </>
        );
      default:
        return null;
    }
  };

  const renderRow = (item: MasterItem) => {
    switch (entity) {
      case "patients":
        return (
          <>
            <td className="px-6 py-4 font-medium text-slate-900">
              {safeString(item.medical_record_number)}
            </td>
            <td className="px-6 py-4">{safeString(item.full_name)}</td>
            <td className="px-6 py-4 text-slate-500">{safeString(item.nik)}</td>
          </>
        );
      case "polyclinics":
        return (
          <>
            <td className="px-6 py-4 font-medium text-slate-900">
              {safeString(item.name)}
            </td>
            <td className="px-6 py-4 text-slate-500">
              {safeString(item.description)}
            </td>
          </>
        );
      case "doctors":
        return (
          <>
            <td className="px-6 py-4 font-medium text-slate-900">
              {safeString(item.name)}
            </td>
            <td className="px-6 py-4 text-slate-500">
              {safeString(item.specialization)}
            </td>
            <td className="px-6 py-4 text-slate-500">
              {safeString(item.polyclinic_id)}
            </td>
          </>
        );
      case "medicines":
        return (
          <>
            <td className="px-6 py-4 font-medium text-slate-900">
              {safeString(item.code)}
            </td>
            <td className="px-6 py-4">{safeString(item.name)}</td>
            <td className="px-6 py-4 text-slate-600">
              {formatPrice(item.price)}
            </td>
            <td className="px-6 py-4">
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {safeString(item.stock)}
              </span>
            </td>
          </>
        );
      case "actions":
        return (
          <>
            <td className="px-6 py-4 font-medium text-slate-900">
              {safeString(item.code)}
            </td>
            <td className="px-6 py-4">{safeString(item.name)}</td>
            <td className="px-6 py-4 text-slate-600">
              {formatPrice(item.price)}
            </td>
          </>
        );
      case "schedules":
        return (
          <>
            <td className="px-6 py-4 font-medium text-slate-900">
              {safeString(item.doctor_id)}
            </td>
            <td className="px-6 py-4">
              Hari ke-{safeString(item.day_of_week)}
            </td>
            <td className="px-6 py-4">{safeString(item.start_time)}</td>
            <td className="px-6 py-4">{safeString(item.end_time)}</td>
          </>
        );
      default:
        return null;
    }
  };

  if (data.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500">Belum ada data.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
          <tr>
            {renderHeaders()}
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-slate-50/80 transition-colors"
            >
              {renderRow(item)}
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                  aria-label="Edit data"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                  aria-label="Hapus data"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
