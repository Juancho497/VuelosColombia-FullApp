// backend/routes/reservations.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// 🧩 Crear reserva
router.post("/", async (req, res) => {
  const { flight_id, customer_name, customer_email, passengers } = req.body;

  if (
    !flight_id ||
    !customer_name ||
    !customer_email ||
    !Array.isArray(passengers)
  ) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Crear reserva principal
    const [result] = await conn.query(
      "INSERT INTO reservations (flight_id, customer_name, customer_email) VALUES (?, ?, ?)",
      [flight_id, customer_name, customer_email]
    );
    const reservationId = result.insertId;

    // Insertar pasajeros
    for (const p of passengers) {
      await conn.query(
        "INSERT INTO passengers (reservation_id, name, document, seat) VALUES (?, ?, ?, ?)",
        [reservationId, p.name, p.document || null, p.seat || null]
      );
    }

    // Crear tiquete (1 por reserva)
    const ticketCode = "T-" + uuidv4().slice(0, 8).toUpperCase();
    const [flightRows] = await conn.query(
      "SELECT price FROM flights WHERE id = ?",
      [flight_id]
    );
    const price = flightRows[0].price;

    await conn.query(
      "INSERT INTO tickets (reservation_id, code, price) VALUES (?, ?, ?)",
      [reservationId, ticketCode, price]
    );

    await conn.commit();

    res.status(201).json({
      message: "Reserva creada correctamente",
      reservationId,
      ticketCode,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Error creando reserva:", err);
    res.status(500).json({ message: "Error al crear la reserva" });
  } finally {
    conn.release();
  }
});

// 🧩 Obtener todas las reservas (para el panel de administración)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.id AS id,
        r.customer_name,
        r.customer_email,
        r.flight_id,
        r.created_at,
        f.code AS flight_code,
        f.origin,
        f.destination
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      ORDER BY r.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo reservas:", error);
    res.status(500).json({ message: "Error obteniendo reservas" });
  }
});

// 🧩 Obtener una reserva específica con pasajeros y tiquete
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener la reserva con su vuelo
    const [reservationRows] = await pool.query(
      `
      SELECT 
        r.id AS reservation_id,
        r.customer_name,
        r.customer_email,
        r.flight_id,
        r.created_at,
        f.code AS flight_code,
        f.origin,
        f.destination,
        f.departure_time,
        f.arrival_time,
        f.price
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
      WHERE r.id = ?
      `,
      [id]
    );

    if (reservationRows.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    const reservation = reservationRows[0];

    // Obtener pasajeros
    const [passengers] = await pool.query(
      "SELECT id, name, document, seat FROM passengers WHERE reservation_id = ?",
      [id]
    );

    // Obtener tiquete
    const [tickets] = await pool.query(
      "SELECT id, code, price FROM tickets WHERE reservation_id = ?",
      [id]
    );

    res.json({
      ...reservation,
      passengers,
      ticket: tickets.length > 0 ? tickets[0] : null,
    });
  } catch (error) {
    console.error("Error obteniendo detalles de reserva:", error);
    res
      .status(500)
      .json({ message: "Error obteniendo detalles de la reserva" });
  }
});

module.exports = router;
