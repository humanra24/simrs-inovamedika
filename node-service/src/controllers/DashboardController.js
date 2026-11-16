const DashboardService = require("../services/DashboardService");

class DashboardController {
  static async getSummary(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const startDate = start_date || "1970-01-01";
      const endDate = end_date || "2099-12-31";

      const data = await DashboardService.getSummary(startDate, endDate);
      res.json({ status: "success", data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getVisitsByPolyclinic(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const startDate = start_date || "1970-01-01";
      const endDate = end_date || "2099-12-31";

      const data = await DashboardService.getVisitsByPolyclinic(
        startDate,
        endDate,
      );
      res.json({ status: "success", data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getActionsCount(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const startDate = start_date || "1970-01-01";
      const endDate = end_date || "2099-12-31";

      const data = await DashboardService.getActionsCount(startDate, endDate);
      res.json({ status: "success", data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getMedicineUsage(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const startDate = start_date || "1970-01-01";
      const endDate = end_date || "2099-12-31";

      const data = await DashboardService.getMedicineUsage(startDate, endDate);
      res.json({ status: "success", data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getVisitsDetail(req, res) {
    try {
      const { start_date, end_date, polyclinic_id } = req.query;
      const startDate = start_date || "1970-01-01";
      const endDate = end_date || "2099-12-31";

      const data = await DashboardService.getVisitsDetail(
        polyclinic_id,
        startDate,
        endDate,
      );
      res.json({ status: "success", total: data.length, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }

  static async getBillsDetail(req, res) {
    try {
      const { start_date, end_date, status } = req.query;
      const startDate = start_date || "1970-01-01";
      const endDate = end_date || "2099-12-31";

      const data = await DashboardService.getBillsDetail(
        status,
        startDate,
        endDate,
      );
      res.json({ status: "success", total: data.length, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: "error", message: err.message });
    }
  }
}

module.exports = DashboardController;
