const express = require("express");
const router = express.Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// ===============================
// 🧩 CREAR RESERVA SENCILLA
// ===============================
router.post("/", async (req, res) => {
  const { flight_id, customer_name, customer_email, passengers, created_by } =
    req.body;

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
      "INSERT INTO reservations (flight_id, customer_name, customer_email, created_by) VALUES (?, ?, ?, ?)",
      [flight_id, customer_name, customer_email, created_by || null]
    );

    const reservationId = result.insertId;

    // Insertar pasajeros
    for (const p of passengers) {
      await conn.query(
        "INSERT INTO passengers (reservation_id, name, document, seat) VALUES (?, ?, ?, ?)",
        [reservationId, p.name, p.document || null, p.seat || null]
      );
    }

    // Crear tiquete
    const ticketCode = "T-" + uuidv4().slice(0, 8).toUpperCase();
    const [[flightRow]] = await conn.query(
      "SELECT price FROM flights WHERE id = ?",
      [flight_id]
    );

    await conn.query(
      "INSERT INTO tickets (reservation_id, code, price) VALUES (?, ?, ?)",
      [reservationId, ticketCode, flightRow.price]
    );

    await conn.commit();

    return res.status(201).json({
      message: "Reserva creada correctamente ✅",
      reservationId,
      ticketCode,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error creando reserva:", err);
    return res.status(500).json({ message: "Error al crear la reserva" });
  } finally {
    conn.release();
  }
});

// ===============================
// 🧩 CREAR RESERVA IDA Y VUELTA
// ===============================
router.post("/roundtrip", async (req, res) => {
  const {
    outbound_flight_id,
    return_flight_id,
    customer_name,
    customer_email,
    passengers,
    created_by,
  } = req.body;

  if (
    !outbound_flight_id ||
    !return_flight_id ||
    !customer_name ||
    !customer_email ||
    !Array.isArray(passengers)
  ) {
    return res
      .status(400)
      .json({ message: "Datos incompletos para la reserva." });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [outboundResult] = await conn.query(
      "INSERT INTO reservations (flight_id, customer_name, customer_email, created_by) VALUES (?, ?, ?, ?)",
      [outbound_flight_id, customer_name, customer_email, created_by || null]
    );

    const [returnResult] = await conn.query(
      "INSERT INTO reservations (flight_id, customer_name, customer_email, created_by) VALUES (?, ?, ?, ?)",
      [return_flight_id, customer_name, customer_email, created_by || null]
    );

    for (const p of passengers) {
      await conn.query(
        "INSERT INTO passengers (reservation_id, name, document, seat) VALUES (?, ?, ?, ?)",
        [outboundResult.insertId, p.name, p.document || null, p.seat || null]
      );

      await conn.query(
        "INSERT INTO passengers (reservation_id, name, document, seat) VALUES (?, ?, ?, ?)",
        [returnResult.insertId, p.name, p.document || null, p.seat || null]
      );
    }

    // Tickets
    const ticketCodeOutbound = "T-" + uuidv4().slice(0, 8).toUpperCase();
    const ticketCodeReturn = "T-" + uuidv4().slice(0, 8).toUpperCase();

    const [[outboundFlight]] = await conn.query(
      "SELECT price FROM flights WHERE id = ?",
      [outbound_flight_id]
    );
    const [[returnFlight]] = await conn.query(
      "SELECT price FROM flights WHERE id = ?",
      [return_flight_id]
    );

    await conn.query(
      "INSERT INTO tickets (reservation_id, code, price) VALUES (?, ?, ?)",
      [outboundResult.insertId, ticketCodeOutbound, outboundFlight.price]
    );

    await conn.query(
      "INSERT INTO tickets (reservation_id, code, price) VALUES (?, ?, ?)",
      [returnResult.insertId, ticketCodeReturn, returnFlight.price]
    );

    await conn.commit();

    return res.status(201).json({
      message: "Reserva ida y vuelta creada correctamente ✅",
      outbound_reservation: outboundResult.insertId,
      return_reservation: returnResult.insertId,
      ticketCodes: [ticketCodeOutbound, ticketCodeReturn],
    });
  } catch (error) {
    await conn.rollback();
    console.error("❌ Error creando reserva ida y vuelta:", error);
    return res
      .status(500)
      .json({ message: "Error creando reserva ida y vuelta" });
  } finally {
    conn.release();
  }
});

// ===============================
// 🧩 OBTENER RESERVAS
// ===============================
router.get("/", async (req, res) => {
  const { username } = req.query;

  try {
    let query = `
      SELECT 
        r.id AS id,
        r.customer_name,
        r.customer_email,
        r.created_by,
        r.flight_id,
        r.created_at,
        f.code AS flight_code,
        f.origin,
        f.destination,
        f.departure_time,
        f.price
      FROM reservations r
      JOIN flights f ON r.flight_id = f.id
    `;
    const params = [];

    if (username) {
      query +=
        " WHERE LOWER(r.created_by) = LOWER(?) OR LOWER(r.customer_email) LIKE LOWER(?)";
      params.push(username.trim(), `${username.trim()}@%`);
    }

    query += " ORDER BY r.created_at DESC";

    const [rows] = await pool.query(query, params);

    return res.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo reservas:", error);
    return res.status(500).json({ message: "Error obteniendo reservas" });
  }
});

// ===============================
// 🧩 OBTENER UNA RESERVA
// ===============================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [reservationRows] = await pool.query(
      `
      SELECT 
        r.id AS reservation_id,
        r.customer_name,
        r.customer_email,
        r.created_by,
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

    const [passengers] = await pool.query(
      "SELECT id, name, document, seat FROM passengers WHERE reservation_id = ?",
      [id]
    );

    const [tickets] = await pool.query(
      "SELECT id, code, price FROM tickets WHERE reservation_id = ?",
      [id]
    );

    return res.json({
      ...reservation,
      passengers,
      ticket: tickets.length > 0 ? tickets[0] : null,
    });
  } catch (error) {
    console.error("❌ Error obteniendo detalles de reserva:", error);
    return res
      .status(500)
      .json({ message: "Error obteniendo detalles de la reserva" });
  }
});

// ===============================
// 🗑️ ELIMINAR RESERVA
// ===============================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM passengers WHERE reservation_id = ?", [id]);
    await pool.query("DELETE FROM tickets WHERE reservation_id = ?", [id]);

    const [result] = await pool.query(
      "DELETE FROM reservations WHERE id = ? LIMIT 1",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    return res.json({ message: "Reserva eliminada correctamente ✔" });
  } catch (err) {
    console.error("❌ Error eliminando reserva:", err);
    return res.status(500).json({ message: "Error eliminando reserva" });
  }
});

module.exports = router;
