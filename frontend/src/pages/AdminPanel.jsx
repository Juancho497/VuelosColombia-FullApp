import React, { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";

function AdminPanel() {
  const [flights, setFlights] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Cargar vuelos y reservas (ejemplo)
  useEffect(() => {
    fetch("http://localhost:4000/api/flights")
      .then((res) => res.json())
      .then((data) => setFlights(data))
      .catch((err) => console.error("Error cargando vuelos:", err));

    fetch("http://localhost:4000/api/reservations")
      .then((res) => res.json())
      .then((data) => setReservations(data))
      .catch((err) => console.error("Error cargando reservas:", err));
  }, []);

  return (
    <div className="container">
      {/* 🔴 Botón de cierre de sesión (reutilizable) */}
      <LogoutButton />

      <h1 className="logo">🧭 Panel de Administración</h1>
      <p>Bienvenido, administrador. Aquí puedes revisar vuelos y reservas.</p>

      <h2>✈️ Vuelos Registrados</h2>
      {flights.length === 0 ? (
        <p>No hay vuelos disponibles.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Salida</th>
              <th>Llegada</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f) => (
              <tr key={f.id}>
                <td>{f.code}</td>
                <td>{f.origin}</td>
                <td>{f.destination}</td>
                <td>{new Date(f.departure_time).toLocaleString()}</td>
                <td>{new Date(f.arrival_time).toLocaleString()}</td>
                <td>${f.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>📋 Reservas Realizadas</h2>
      {reservations.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID Reserva</th>
              <th>Cliente</th>
              <th>Correo</th>
              <th>Vuelo ID</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.customer_name}</td>
                <td>{r.customer_email}</td>
                <td>{r.flight_id}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPanel;
