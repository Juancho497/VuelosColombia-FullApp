const express = require("express");
const db = require("../db");
const router = express.Router();

// Retorna las fechas únicas disponibles por origen/destino
router.get("/", async (req, res) => {
  const { origin, destination } = req.query;

  try {
    let query = "SELECT DISTINCT DATE(departure_time) AS date FROM flights";
    const params = [];

    if (origin && destination) {
      query += " WHERE origin = ? AND destination = ?";
      params.push(origin, destination);
    }

    const [rows] = await db.query(query, params);
    const dates = rows.map((r) => r.date);

    res.json({ dates });
  } catch (error) {
    console.error("❌ Error obteniendo fechas disponibles:", error);
    res.status(500).json({ error: "Error al obtener fechas" });
  }
});

module.exports = router;
