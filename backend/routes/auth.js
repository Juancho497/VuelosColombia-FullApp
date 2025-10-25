const express = require("express");
const router = express.Router();
const pool = require("../db");

// Registro simple
router.post("/register", async (req, res) => {
  const { username, password, rol } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Faltan datos obligatorios" });

  try {
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (exists.length)
      return res.status(400).json({ message: "El usuario ya existe" });

    await pool.query(
      "INSERT INTO users (username, password, rol) VALUES (?, ?, ?)",
      [username, password, rol || "user"]
    );
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Login simple
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!rows.length)
      return res.status(401).json({ message: "Usuario no encontrado" });

    const user = rows[0];
    if (user.password !== password)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    // token ficticio por ahora (luego lo cambiamos a JWT real)
    res.json({
      message: "OK",
      rol: user.rol,
      username: user.username,
      token: "fake-jwt",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
