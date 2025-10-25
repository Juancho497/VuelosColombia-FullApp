const express = require("express");
const router = express.Router();
const pool = require("../db");

// Obtener vuelos (filtrados y ordenados)
router.get("/", async (req, res) => {
  try {
    const { origin, destination, from, to, sort } = req.query;
    let query = "SELECT * FROM flights WHERE 1=1";
    const params = [];

    // Filtros dinámicos
    if (origin) {
      query += " AND LOWER(origin) LIKE ?";
      params.push(`%${origin.toLowerCase()}%`);
    }

    if (destination) {
      query += " AND LOWER(destination) LIKE ?";
      params.push(`%${destination.toLowerCase()}%`);
    }

    if (from && to) {
      query += " AND departure_time BETWEEN ? AND ?";
      params.push(from, to);
    }

    // Ordenamiento
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
