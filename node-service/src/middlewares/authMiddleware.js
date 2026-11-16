const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Cek apakah ada header Authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Akses ditolak. Harap login terlebih dahulu.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Validasi JWT menggunakan secret yang SAMA dengan Yii2
    // Pastikan JWT_SECRET di .env Node.js sama dengan di Yii2 User.php
    const secret = process.env.JWT_SECRET || "RAHASIAKU_1234567890";

    const decoded = jwt.verify(token, secret);

    // 3. Simpan data user ke request agar bisa dipakai di controller
    req.user = decoded;

    // 4. Lanjutkan ke controller
    next();
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Token tidak valid atau sudah kadaluarsa.",
    });
  }
};

module.exports = authMiddleware;
