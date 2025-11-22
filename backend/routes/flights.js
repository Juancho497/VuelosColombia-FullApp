const express = require("express");
const router = express.Router();
const pool = require("../db");

// ===============================
// 📌 OBTENER VUELOS (con filtros)
// ===============================
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

    // Filtros de fecha
    if (from && !to) {
      query += " AND DATE(departure_time) = ?";
      params.push(from);
    } else if (from && to) {
      query += " AND DATE(departure_time) BETWEEN ? AND ?";
      params.push(from, to);
    }

    // Ordenamiento
    if (sort === "asc") query += " ORDER BY price ASC";
    else if (sort === "desc") query += " ORDER BY price DESC";

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo vuelos:", error);
    return res.status(500).json({ message: "Error obteniendo vuelos" });
  }
});

// ===============================
// 🗑️ ELIMINAR VUELO
// ===============================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener reservas asociadas
    const [reservations] = await pool.query(
      "SELECT id FROM reservations WHERE flight_id = ?",
      [id]
    );

    // Eliminar dependencias
    for (const r of reservations) {
      await pool.query("DELETE FROM passengers WHERE reservation_id = ?", [
        r.id,
      ]);
      await pool.query("DELETE FROM tickets WHERE reservation_id = ?", [r.id]);
    }

    // Eliminar reservas
    await pool.query("DELETE FROM reservations WHERE flight_id = ?", [id]);

    // Eliminar vuelo
    const [result] = await pool.query(
      "DELETE FROM flights WHERE id = ? LIMIT 1",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Vuelo no encontrado" });
    }

    return res.json({ message: "Vuelo eliminado correctamente ✅" });
  } catch (err) {
    console.error("❌ Error eliminando vuelo:", err);
    return res.status(500).json({ message: "Error eliminando vuelo" });
  }
});

module.exports = router;
