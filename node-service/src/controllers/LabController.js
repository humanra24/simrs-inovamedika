const LabService = require("../services/LabService");

class LabController {
  static async getOrders(req, res) {
    try {
      const status = req.query.status || null; // Ambil query ?status=
      const data = await LabService.getOrders(status);
      res.json({ status: "success", total: data.length, data });
    } catch (err) {
      console.error("Error getOrders:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const data = await LabService.getOrderById(id);
      if (!data) {
        return res
          .status(404)
          .json({ status: "error", message: "Order lab tidak ditemukan." });
      }
      res.json({ status: "success", data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getOrdersByVisit(req, res) {
    try {
      const { visitId } = req.params;
      const data = await LabService.getOrdersByVisitId(visitId);
      res.json({ status: "success", total: data.length, data });
    } catch (err) {
      console.error("Error getOrdersByVisit:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async sendResult(req, res) {
    try {
      const { orderId } = req.params;
      const { result_data, notes } = req.body;

      const data = await LabService.sendResult(
        orderId,
        { result_data, notes },
        req.headers.authorization,
      );

      res.json({
        status: "success",
        message: "Hasil berhasil dikirim ke SIMRS",
        data: data,
      });
    } catch (err) {
      if (err.response) {
        const statusCode = err.response.status;
        const errorData = err.response.data;

        console.error(`Yii2 Error [${statusCode}]:`, errorData);

        return res.status(statusCode).json({
          status: "error",
          message: errorData?.message || "Terjadi kesalahan pada sistem SIMRS.",
          errors: errorData?.errors || null,
        });
      }

      // Jika Yii2 mati / jaringan error
      console.error("Network Error:", err.message);
      return res.status(503).json({
        status: "error",
        message:
          "Gagal terhubung ke layanan SIMRS. Silakan coba beberapa saat lagi.",
      });
    }
  }
}

module.exports = LabController;
