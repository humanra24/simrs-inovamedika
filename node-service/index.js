const express = require("express");
const cors = require("cors");
const labRoutes = require("./src/routes/labRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes"); // <-- Tambahkan
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/lab", labRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan internal pada server.",
    errors: process.env.NODE_ENV === "development" ? err.message : null,
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Endpoint ${req.originalUrl} tidak ditemukan.`,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Node.js Lab Service berjalan di port ${process.env.PORT}`);
});
