import { useState, useEffect } from "react";
import api from "@/api/axios";
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
  Receipt,
  CheckCircle2,
  Loader2,
  Printer,
  History,
  FileWarning,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Bill, Payment } from "@/types";

interface DetailBillProps {
  visitId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DetailBill({
  visitId,
  onClose,
  onSuccess,
}: DetailBillProps) {
  const [detail, setDetail] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amount, setAmount] = useState("");
  const [idempotencyKey] = useState(
    () => `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  );

  const fetchBill = async () => {
    try {
      const res = await api.get(`/bills/${visitId}`);
      setDetail(res.data.data);
      const remaining =
        res.data.data.total_amount - (res.data.data.paid_amount || 0);
      setAmount(remaining.toString());
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat detail tagihan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await api.get(`/bills/${visitId}`);
        if (!ignore) {
          setDetail(res.data.data);
          const remaining =
            res.data.data.total_amount - (res.data.data.paid_amount || 0);
          setAmount(remaining.toString());
        }
      } catch (err) {
        console.error(err);
        if (!ignore) toast.error("Gagal memuat detail tagihan.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [visitId]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;

    const remaining = detail.total_amount - (detail.paid_amount || 0);
    if (Number(amount) > remaining) {
      return toast.error(
        `Nominal melebihi sisa tagihan (Rp ${remaining.toLocaleString("id-ID")})`,
      );
    }

    setIsPaying(true);
    try {
      await api.post(`/bills/${detail.id}/pay`, {
        amount: Number(amount),
        payment_method: paymentMethod,
        idempotency_key: idempotencyKey,
      });
      toast.success("Pembayaran berhasil dicatat!");

      if (Number(amount) === remaining) {
        onSuccess();
      } else {
        fetchBill();
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(
        apiError.response?.data?.message || "Gagal memproses pembayaran.",
      );
    } finally {
      setIsPaying(false);
    }
  };

  const handlePreviewInvoice = async () => {
    setShowPreview(true);
    setPdfError(null);
    if (pdfUrl) return;

    setIsLoadingPdf(true);
    try {
      const response = await api.get(`/bills/${visitId}/invoice`, {
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];

      // Perbaikan TypeScript: Pastikan contentType berupa string
      if (
        typeof contentType === "string" &&
        !contentType.includes("application/pdf")
      ) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || "Respons bukan file PDF.");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const localPdfUrl = URL.createObjectURL(blob);
      setPdfUrl(localPdfUrl);
    } catch (err: unknown) {
      console.error(err);
      const apiError = err as { message?: string };
      const msg =
        apiError.message ||
        "Gagal memuat file PDF. Periksa koneksi atau hak akses Anda.";
      setPdfError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-125 flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </DialogContent>
      </Dialog>
    );
  }

  if (!detail) return null;

  const remaining = detail.total_amount - (detail.paid_amount || 0);
  const isPaid = detail.status === "paid" || remaining <= 0;

  return (
    <>
      <Dialog
        open={true}
        onOpenChange={(open) => !open && !isPaying && onClose()}
      >
        <DialogContent className="sm:max-w-162.5 bg-white shadow-2xl border-slate-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4 mb-4">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" /> Detail Tagihan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Info Pasien & Tombol Preview */}
            <div className="bg-slate-50 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  PASIEN
                </p>
                <p className="font-bold text-slate-900 text-lg">
                  {detail.visit?.patient?.full_name || "Pasien"}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  RM: {detail.visit?.patient?.medical_record_number || "-"}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviewInvoice}
                className="gap-2 bg-white"
              >
                <Printer className="w-4 h-4" /> Preview Invoice
              </Button>
            </div>

            {/* Rincian Biaya */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Rincian Biaya Pelayanan
              </p>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-slate-600">
                        Deskripsi
                      </th>
                      <th className="px-4 py-2 font-semibold text-slate-600 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-800">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-800 font-medium">
                          Rp {Number(item.amount).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-blue-50 px-4 py-3 border-t border-blue-100 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Total Tagihan</span>
                    <span className="font-semibold text-slate-800">
                      Rp {Number(detail.total_amount).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {detail.paid_amount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Telah Dibayar</span>
                      <span className="font-semibold">
                        - Rp{" "}
                        {Number(detail.paid_amount).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-blue-200 mt-2 pt-2">
                    <span className="font-bold text-blue-900">
                      Sisa Tagihan
                    </span>
                    <span className="font-bold text-xl text-blue-700">
                      Rp {remaining.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Pembayaran */}
            {detail.payments && detail.payments.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <History className="w-4 h-4" /> Riwayat Pembayaran
                </p>
                <div className="space-y-2">
                  {detail.payments.map((p: Payment, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded border border-slate-100"
                    >
                      <div>
                        <span className="font-medium text-slate-700 capitalize">
                          {p.payment_method}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          {new Date(p.created_at).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <span className="font-semibold text-green-600">
                        Rp {Number(p.amount).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Pembayaran */}
            {!isPaid && (
              <form
                onSubmit={handlePay}
                className="bg-slate-50 p-4 rounded-lg border border-slate-200"
              >
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Proses Pembayaran Baru
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Metode</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Tunai (Cash)</option>
                      <option value="debit">Kartu Debit</option>
                      <option value="qris">QRIS</option>
                      <option value="transfer">Transfer Bank</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nominal Bayar (Rp)</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={1}
                      max={remaining}
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isPaying}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />{" "}
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Konfirmasi
                        Pembayaran
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {isPaid && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2 font-bold border border-green-200">
                <CheckCircle2 className="w-5 h-5" /> Tagihan Lunas
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL POPUP PREVIEW PDF */}
      {showPreview && (
        <Dialog open={true} onOpenChange={() => setShowPreview(false)}>
          <DialogContent className="m:max-w-200 h-[85vh] p-0 flex flex-col bg-slate-100 border-none [&>button]:hidden">
            <DialogHeader className="px-4 py-3 bg-white border-b flex flex-row items-center justify-between rounded-t-lg">
              <DialogTitle className="text-lg font-bold text-slate-800">
                Preview Invoice
              </DialogTitle>
              <div className="flex items-center gap-2">
                {pdfUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(pdfUrl, "_blank")}
                  >
                    Buka di Tab Baru
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                  className="h-8 w-8 text-slate-500 hover:bg-slate-200 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>
            <div className="flex-1 w-full h-full flex items-center justify-center bg-slate-200 overflow-hidden">
              {isLoadingPdf ? (
                <div className="flex flex-col items-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
                  <p>Memuat dokumen PDF...</p>
                </div>
              ) : pdfError ? (
                <div className="flex flex-col items-center text-red-500 p-6 bg-white rounded-lg shadow-sm">
                  <FileWarning className="w-12 h-12 mb-2 text-red-400" />
                  <p className="font-semibold">Gagal Memuat PDF</p>
                  <p className="text-sm text-center mt-1">{pdfError}</p>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-none rounded-b-lg bg-white"
                  title="Preview Invoice PDF"
                />
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
