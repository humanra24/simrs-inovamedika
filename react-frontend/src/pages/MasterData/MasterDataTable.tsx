import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import type { MasterEntity, MasterItem } from "../../types";

/* eslint-disable react-refresh/only-export-components */
// Konstanta & helper kecil ini dipakai juga oleh MasterData.tsx
export const DAY_NAMES: Record<string, string> = {
  "1": "Senin",
  "2": "Selasa",
  "3": "Rabu",
  "4": "Kamis",
  "5": "Jumat",
  "6": "Sabtu",
  "7": "Minggu",
};

/** Stok <= LOW_STOCK dianggap menipis */
export const LOW_STOCK = 10;

/** Ambil properti dari item tanpa bergantung pada bentuk tipe MasterItem */
export const getField = (item: unknown, key: string): unknown =>
  (item as Record<string, unknown> | null | undefined)?.[key];
/* eslint-enable react-refresh/only-export-components */

interface MasterDataTableProps {
  entity: MasterEntity;
  data: MasterItem[];
  /** Nomor urut baris pertama (untuk paginasi) */
  startIndex?: number;
  polyclinicMap?: Record<string, string>;
  doctorMap?: Record<string, string>;
  onEdit: (item: MasterItem) => void;
  onDelete: (item: MasterItem) => void;
}

export function MasterDataTable({
  entity,
  data,
  startIndex = 0,
  polyclinicMap = {},
  doctorMap = {},
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

  const renderStock = (stock: unknown) => {
    const n = Number(stock || 0);
    const cls =
      n <= 0
        ? "bg-red-50 text-red-700"
        : n <= LOW_STOCK
          ? "bg-amber-50 text-amber-700"
          : "bg-blue-50 text-blue-700";
    return (
      <span className={`${cls} px-2.5 py-1 rounded-full text-xs font-semibold`}>
        {n <= 0 ? "Habis" : n}
      </span>
    );
  };

  const renderHeaders = () => {
    switch (entity) {
      case "patients":
        return (
          <>
            <th className="px-6 py-4">No. RM</th>
            <th className="px-6 py-4">Nama Pasien</th>
            <th className="px-6 py-4">NIK</th>
            <th className="px-6 py-4">Gender</th>
            <th className="px-6 py-4">Telepon</th>
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
            <th className="px-6 py-4">Poli</th>
          </>
        );
      case "medicines":
        return (
          <>
            <th className="px-6 py-4">Kode</th>
            <th className="px-6 py-4">Nama Obat</th>
            <th className="px-6 py-4">Satuan</th>
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
            <th className="px-6 py-4">Dokter</th>
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
      case "patients": {
        const gender = String(getField(item, "gender") ?? "");
        return (
          <>
            <td className="px-6 py-4 font-medium text-slate-900">
              {safeString(item.medical_record_number)}
            </td>
            <td className="px-6 py-4">{safeString(item.full_name)}</td>
            <td className="px-6 py-4 text-slate-500">{safeString(item.nik)}</td>
            <td className="px-6 py-4">
              {gender === "L" || gender === "P" ? (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    gender === "L"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-pink-50 text-pink-700"
                  }`}
                >
                  {gender === "L" ? "Laki-laki" : "Perempuan"}
                </span>
              ) : (
                "-"
              )}
            </td>
            <td className="px-6 py-4 text-slate-500">
              {safeString(getField(item, "phone_number"))}
            </td>
          </>
        );
      }
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
              {safeString(
                getField(item, "polyclinic_name") ??
                  polyclinicMap[String(item.polyclinic_id)] ??
                  item.polyclinic_id,
              )}
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
            <td className="px-6 py-4 text-slate-500">
              {safeString(getField(item, "unit"))}
            </td>
            <td className="px-6 py-4 text-slate-600">
              {formatPrice(item.price)}
            </td>
            <td className="px-6 py-4">{renderStock(item.stock)}</td>
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
              {safeString(
                item.doctor_name ??
                  doctorMap[String(getField(item, "doctor_id"))] ??
                  getField(item, "doctor_id"),
              )}
            </td>
            <td className="px-6 py-4">
              {DAY_NAMES[String(item.day_of_week)] ??
                `Hari ke-${safeString(item.day_of_week)}`}
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
            <th className="px-6 py-4 w-14">No</th>
            {renderHeaders()}
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, idx) => (
            <tr
              key={item.id}
              className="hover:bg-slate-50/80 transition-colors"
            >
              <td className="px-6 py-4 text-slate-400">
                {startIndex + idx + 1}
              </td>
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
                  onClick={() => onDelete(item)}
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
