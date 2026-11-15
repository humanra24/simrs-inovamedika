const express = require("express");
const cors = require("cors");
const labRoutes = require("./src/routes/labRoutes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/lab", labRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Node.js Lab Service berjalan di port ${process.env.PORT}`);
});
