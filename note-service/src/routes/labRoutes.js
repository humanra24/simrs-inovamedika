const express = require("express");
const router = express.Router();
const LabController = require("../controllers/LabController");

router.get("/pending", LabController.getPending);
router.post("/integration/send/:orderId", LabController.sendResult);

module.exports = router;
