const express = require("express");
const db = require("../db");
const router = express.Router();

// 🔹 Obtener todos los orígenes únicos
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT origin FROM flights");
    const origins = rows.map((r) => r.origin);
    res.json({ origins });
  } catch (error) {
    console.error("❌ Error al obtener orígenes:", error);
    res.status(500).json({ error: "Error al obtener orígenes" });
  }
});

// 🔹 Obtener destinos según el origen
router.get("/:origin", async (req, res) => {
  const { origin } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT destination FROM flights WHERE origin = ?",
      [origin]
    );
    const destinations = rows.map((r) => r.destination);
    res.json({ destinations });
  } catch (error) {
    console.error("❌ Error al obtener destinos:", error);
    res.status(500).json({ error: "Error al obtener destinos" });
  }
});

module.exports = router;
