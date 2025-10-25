const express = require("express");
const router = express.Router();
const pool = require("../db");

// Obtener vuelos (filtrados y ordenados)
router.get("/", async (req, res) => {
  try {
    const { origin, destination, from, to, sort } = req.query;
    let query = "SELECT * FROM flights WHERE 1=1";
    const params = [];

    // Filtro por origen
    if (origin) {
      query += " AND LOWER(origin) LIKE ?";
      params.push(`%${origin.toLowerCase()}%`);
    }

    // Filtro por destino
    if (destination) {
      query += " AND LOWER(destination) LIKE ?";
      params.push(`%${destination.toLowerCase()}%`);
    }

    // ✅ Filtros de fecha (solo compara la parte de la fecha)
    if (from && !to) {
      query += " AND DATE(departure_time) = ?";
      params.push(from);
    } else if (from && to) {
      query += " AND DATE(departure_time) BETWEEN ? AND ?";
      params.push(from, to);
    }

    // Ordenar por precio (si se solicita)
    if (sort === "asc") {
      query += " ORDER BY price ASC";
    } else if (sort === "desc") {
      query += " ORDER BY price DESC";
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo vuelos:", error);
    res.status(500).json({ message: "Error obteniendo vuelos" });
  }
});

module.exports = router;
