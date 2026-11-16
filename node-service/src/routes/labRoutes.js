const express = require("express");
const router = express.Router();
const LabController = require("../controllers/LabController");

router.get("/orders/visit/:visitId", LabController.getOrdersByVisit);
router.get("/orders/:id", LabController.getOrderById);
router.get("/orders", LabController.getOrders);
router.post("/integration/send/:orderId", LabController.sendResult);

module.exports = router;
