const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/DashboardController");
const authMiddleware = require("../middlewares/authMiddleware"); // <-- Tambahkan

// Pasang middleware untuk SEMUA route di bawah ini
router.use(authMiddleware);

router.get("/summary", DashboardController.getSummary);
router.get("/visits-by-polyclinic", DashboardController.getVisitsByPolyclinic);
router.get("/actions", DashboardController.getActionsCount);
router.get("/medicines", DashboardController.getMedicineUsage);
router.get("/visits-detail", DashboardController.getVisitsDetail);
router.get("/bills-detail", DashboardController.getBillsDetail);

module.exports = router;
