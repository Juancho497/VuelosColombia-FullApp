import "../styles/App.css";
import React, { useState } from "react";
import LogoutButton from "../components/LogoutButton";

function SearchFlights() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [formData, setFormData] = useState({ name: "", document: "" });
  const [seatNumber, setSeatNumber] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReservation, setShowReservation] = useState(false);

  // Buscar vuelos
  async function searchFlights() {
    try {
      setLoading(true);
      setMessage("");
      setFlights([]);

      const query = new URLSearchParams();
      if (origin) query.append("origin", origin);
      if (destination) query.append("destination", destination);
      if (from) query.append("from", from);
      if (to) query.append("to", to);
      if (sort) query.append("sort", sort);

      const res = await fetch(
        `http://localhost:4000/api/flights?${query.toString()}`
      );
      const data = await res.json();

      if (data.length === 0) {
        setMessage("⚠️ No se encontraron vuelos con esos criterios.");
      } else {
        setMessage(`✈️ Se encontraron ${data.length} vuelo(s).`);
      }

      setFlights(data);
    } catch (error) {
      setMessage("❌ Error al buscar vuelos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Confirmar reserva con asiento
  async function handleReservationSubmitWithSeat(reservationData) {
    if (
      !reservationData.name ||
      !reservationData.document ||
      !reservationData.seat
    ) {
      return alert("❗ Todos los campos son obligatorios");
    }

    const body = {
      flight_id: selectedFlight.id,
      customer_name: reservationData.name,
      customer_email: `${reservationData.document}@vueloscolombia.com`,
      passengers: [
        {
          name: reservationData.name,
          document: reservationData.document,
          seat: reservationData.seat,
        },
      ],
    };

    try {
      const res = await fetch("http://localhost:4000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Reserva exitosa. Código de tiquete: ${data.ticketCode}`);
        setSelectedFlight(null);
        setFormData({ name: "", document: "" });
        setSeatNumber("");
        setShowReservation(false);
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("❌ Error al conectar con el servidor");
      console.error(error);
    }
  }

  return (
    <div className="container">
      {/* 🔴 Solo un botón de logout */}
      <LogoutButton />

      <h1 className="logo">✈️ Vuelos Colombia</h1>
      <h2>Buscar Vuelos</h2>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Origen"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        <input
          type="text"
          placeholder="Destino"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Ordenar por precio</option>
          <option value="asc">Menor a mayor</option>
          <option value="desc">Mayor a menor</option>
        </select>
        <button onClick={searchFlights}>Buscar</button>
      </div>

      {message && <p className="message">{message}</p>}
      {loading && (
        <div style={{ marginTop: "30px" }}>
          <div className="spinner"></div>
          <p>🕓 Buscando vuelos disponibles...</p>
        </div>
      )}

      {/* Tabla de vuelos */}
      {!showReservation && flights.length > 0 && !selectedFlight && (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Salida</th>
              <th>Llegada</th>
              <th>Precio</th>
              <th>Acción</th>
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
                <td>
                  <button onClick={() => setSelectedFlight(f)}>Reservar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Botón para abrir la pantalla de reserva */}
      {selectedFlight && !showReservation && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => setShowReservation(true)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Reservar vuelo {selectedFlight.code}
          </button>
          <button
            onClick={() => setSelectedFlight(null)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: "gray",
              marginLeft: "10px",
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Pantalla de reserva */}
      {showReservation && selectedFlight && (
        <div className="form-container">
          <h3>Reserva para vuelo {selectedFlight.code}</h3>
          <p>
            <strong>Origen:</strong> {selectedFlight.origin} |{" "}
            <strong>Destino:</strong> {selectedFlight.destination} |{" "}
            <strong>Fecha:</strong>{" "}
            {new Date(selectedFlight.departure_time).toLocaleDateString()}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleReservationSubmitWithSeat({
                ...formData,
                seat: seatNumber,
              });
            }}
          >
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Documento"
              value={formData.document}
              onChange={(e) =>
                setFormData({ ...formData, document: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Número de asiento"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
            />
            <button type="submit">Confirmar Reserva</button>
            <button
              type="button"
              onClick={() => setShowReservation(false)}
              style={{ backgroundColor: "gray", marginLeft: "10px" }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SearchFlights;
