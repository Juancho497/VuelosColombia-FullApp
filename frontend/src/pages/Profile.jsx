import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName"); // el usuario logueado

  useEffect(() => {
    async function loadReservations() {
      try {
        const res = await fetch(
          `https://vueloscolombia-backend.onrender.comapi/reservations?username=${userName}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Error cargando reservas");

        // Ordenamos de la más nueva a la más vieja
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setReservations(sorted);
      } catch (err) {
        console.error("❌ Error cargando reservas:", err);
      } finally {
        setLoading(false);
      }
    }

    if (userName) loadReservations();
  }, [userName]);

  if (loading) return <div className="profile-loading">⏳ Cargando...</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>👤 Perfil de usuario</h2>
        <p>
          Bienvenido, <strong>{userName}</strong>
        </p>

        <button
          className="back-button"
          onClick={() => navigate("/search-flights")}
        >
          🔙 Volver a buscar vuelos
        </button>

        <h3 className="section-title">✈️ Tus reservas</h3>

        {reservations.length === 0 ? (
          <p className="no-reservations">No tienes reservas registradas.</p>
        ) : (
          <div className="reservas-section">
            {reservations.map((r) => (
              <div key={r.id} className="reserva-card">
                <h4>🧾 Reserva #{r.id}</h4>
                <p>
                  <strong>Pasajero:</strong> {r.customer_name}
                </p>
                <p>
                  <strong>Origen:</strong> {r.origin} →{" "}
                  <strong>Destino:</strong> {r.destination}
                </p>
                <p>
                  <strong>Salida:</strong>{" "}
                  {new Date(r.departure_time).toLocaleString()}
                </p>
                <p>
                  <strong>Precio:</strong>{" "}
                  {Number(r.price).toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </p>
                <p>
                  <strong>Código vuelo:</strong> {r.flight_code}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
