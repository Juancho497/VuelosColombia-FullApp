const express = require("express");
const db = require("../db");
const router = express.Router();

// ===============================
// 🔹 Fechas únicas disponibles
// ===============================
router.get("/", async (req, res) => {
  let { origin, destination } = req.query;

  try {
    let query = `
      SELECT DISTINCT DATE(departure_time) AS date
      FROM flights
      WHERE 1=1
    `;

    const params = [];

    // Filtro por origen
    if (origin) {
      query += " AND LOWER(origin) = ?";
      params.push(origin.trim().toLowerCase());
    }

    // Filtro por destino
    if (destination) {
      query += " AND LOWER(destination) = ?";
      params.push(destination.trim().toLowerCase());
    }

    // Orden por fecha
    query += " ORDER BY date ASC";

    const [rows] = await db.query(query, params);
    const dates = rows.map((r) => r.date);

    return res.json({ dates });
  } catch (error) {
    console.error("❌ Error obteniendo fechas disponibles:", error);
    return res.status(500).json({ error: "Error al obtener fechas" });
  }
});

module.exports = router;
