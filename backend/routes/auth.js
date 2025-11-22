const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs"); // 🔐 Seguridad

// ===============================
// 🧩 REGISTRO
// ===============================
router.post("/register", async (req, res) => {
  const { username, password, rol } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  try {
    const normalized = username.trim().toLowerCase();

    const [exists] = await pool.query(
      "SELECT id FROM users WHERE LOWER(username) = ?",
      [normalized]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // 🔐 Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password, rol) VALUES (?, ?, ?)",
      [normalized, hashedPassword, rol || "user"]
    );

    return res
      .status(201)
      .json({ message: "Usuario registrado correctamente" });
  } catch (e) {
    console.error("❌ Error en register:", e);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// ===============================
// 🧩 LOGIN
// ===============================
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const normalized = username.trim().toLowerCase();

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE LOWER(username) = ?",
      [normalized]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // 🔐 Comparar contraseña hashed
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Token ficticio (igual que en tu versión)
    return res.json({
      message: "OK",
      rol: user.rol,
      username: user.username,
      token: "fake-jwt",
    });
  } catch (e) {
    console.error("❌ Error en login:", e);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
