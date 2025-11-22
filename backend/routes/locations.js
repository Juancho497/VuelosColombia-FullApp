const express = require("express");
const db = require("../db");
const router = express.Router();

// ===============================
// 🔹 Obtener todos los orígenes únicos
// ===============================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT origin FROM flights");

    const origins = rows.map((r) => r.origin);

    return res.json({ origins });
  } catch (error) {
    console.error("❌ Error al obtener orígenes:", error);
    return res.status(500).json({ error: "Error al obtener orígenes" });
  }
});

// ===============================
// 🔹 Obtener destinos según origen
// ===============================
router.get("/:origin", async (req, res) => {
  const origin = req.params.origin.trim().toLowerCase();

  try {
    const [rows] = await db.query(
      "SELECT DISTINCT destination FROM flights WHERE LOWER(origin) = ?",
      [origin]
    );

    const destinations = rows.map((r) => r.destination);

    return res.json({ destinations });
  } catch (error) {
    console.error("❌ Error al obtener destinos:", error);
    return res.status(500).json({ error: "Error al obtener destinos" });
  }
});

module.exports = router;
