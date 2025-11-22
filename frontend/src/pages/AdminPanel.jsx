import React, { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";
import "./AdminPanel.css";

function AdminPanel() {
  const [flights, setFlights] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [flightsRes, reservationsRes] = await Promise.all([
          fetch("https://vueloscolombia-backend.onrender.comapi/flights"),
          fetch("https://vueloscolombia-backend.onrender.comapi/reservations"),
        ]);

        const flightsData = await flightsRes.json();
        const reservationsData = await reservationsRes.json();

        setFlights(Array.isArray(flightsData) ? flightsData : []);
        setReservations(
          Array.isArray(reservationsData) ? reservationsData : []
        );
      } catch (err) {
        console.error("❌ Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 🔍 Filtrar reservas por texto
  const filteredReservations = reservations.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.customer_name?.toLowerCase().includes(term) ||
      r.origin?.toLowerCase().includes(term) ||
      r.destination?.toLowerCase().includes(term)
    );
  });

  // 🗑️ Eliminar vuelo o reserva
  async function handleDelete(type, id) {
    if (!window.confirm(`¿Seguro que deseas eliminar este ${type}?`)) return;
    const endpoint =
      type === "vuelo"
        ? `https://vueloscolombia-backend.onrender.comapi/flights/${id}`
        : `https://vueloscolombia-backend.onrender.comapi/reservations/${id}`;

    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        alert(`${type === "vuelo" ? "Vuelo" : "Reserva"} eliminada ✅`);
        if (type === "vuelo")
          setFlights((prev) => prev.filter((f) => f.id !== id));
        else setReservations((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("❌ Error al eliminar.");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  }

  // 👁️ Ver detalles de reserva
  async function viewDetails(id) {
    try {
      const res = await fetch(
        `https://vueloscolombia-backend.onrender.comapi/reservations/${id}`
      );
      const data = await res.json();
      setSelectedReservation(data);
    } catch (err) {
      console.error("Error obteniendo detalles:", err);
    }
  }

  if (loading) return <div className="admin-loading">⏳ Cargando datos...</div>;

  return (
    <div className="admin-container">
      <div className="admin-card">
        <LogoutButton />
        <h1 className="logo">🧭 Panel de Administración</h1>
        <p>Administra vuelos y reservas registradas en el sistema.</p>

        {/* 🔍 BUSCADOR */}
        <input
          type="text"
          placeholder="🔍 Buscar reserva por pasajero, origen o destino"
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* ✈️ TABLA DE VUELOS */}
        <h2>✈️ Vuelos Registrados</h2>
        {flights.length === 0 ? (
          <p>No hay vuelos registrados.</p>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Salida</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.code}</td>
                    <td>{f.origin}</td>
                    <td>{f.destination}</td>
                    <td>{new Date(f.departure_time).toLocaleString()}</td>
                    <td>
                      {Number(f.price).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete("vuelo", f.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 📋 TABLA DE RESERVAS */}
        <h2>📋 Reservas Realizadas</h2>
        {filteredReservations.length === 0 ? (
          <p>No hay reservas que coincidan con la búsqueda.</p>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pasajero</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Salida</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.customer_name}</td>
                    <td>{r.origin}</td>
                    <td>{r.destination}</td>
                    <td>{new Date(r.departure_time).toLocaleString()}</td>
                    <td>
                      {Number(r.price).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => viewDetails(r.id)}
                      >
                        👁️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete("reserva", r.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL DETALLES */}
        {selectedReservation && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedReservation(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>
                🧾 Detalles de la Reserva #{selectedReservation.reservation_id}
              </h3>
              <p>
                <strong>Pasajero:</strong> {selectedReservation.customer_name}
              </p>
              <p>
                <strong>Correo:</strong> {selectedReservation.customer_email}
              </p>
              <p>
                <strong>Origen:</strong> {selectedReservation.origin}
              </p>
              <p>
                <strong>Destino:</strong> {selectedReservation.destination}
              </p>
              <p>
                <strong>Salida:</strong>{" "}
                {new Date(selectedReservation.departure_time).toLocaleString()}
              </p>
              <p>
                <strong>Precio:</strong>{" "}
                {Number(selectedReservation.price).toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>

              {selectedReservation.passengers?.length > 0 && (
                <>
                  <h4>👥 Pasajeros:</h4>
                  <ul>
                    {selectedReservation.passengers.map((p) => (
                      <li key={p.id}>
                        {p.name} — Documento: {p.document} — Asiento: {p.seat}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <button
                className="close-btn"
                onClick={() => setSelectedReservation(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
