import "../styles/App.css";
import React, { useState } from "react";
import LogoutButton from "../components/LogoutButton";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // estilos base
import "react-date-range/dist/theme/default.css"; // tema por defecto

function SearchFlights() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [formData, setFormData] = useState({ name: "", document: "" });
  const [seatNumber, setSeatNumber] = useState("");
  const [message, setMessage] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  // 🔹 Estados para los orígenes y destinos dinámicos
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  // 🔹 Estado del rango de fechas seleccionado
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // 🔹 Controla si el calendario está visible o no
  const [showCalendar, setShowCalendar] = useState(false);

  // 🔹 Fechas disponibles según el origen/destino
  const [availableDates, setAvailableDates] = useState([]);
  // 🔧 Normalizar las fechas disponibles a 'YYYY-MM-DD' y guardarlas en un Set
  const availableDatesSet = React.useMemo(() => {
    const toKey = (d) => {
      const dt = new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const da = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${da}`;
    };
    return new Set((availableDates || []).map(toKey));
  }, [availableDates]);

  // 🔹 Cargar fechas disponibles cuando cambian origen o destino
  React.useEffect(() => {
    if (!origin || !destination) {
      setAvailableDates([]);
      return;
    }

    async function fetchAvailableDates() {
      try {
        const res = await fetch(
          `http://localhost:4000/api/available-dates?origin=${origin}&destination=${destination}`
        );
        const data = await res.json();
        setAvailableDates(data.dates || []);
      } catch (error) {
        console.error("❌ Error obteniendo fechas disponibles:", error);
      }
    }

    fetchAvailableDates();
  }, [origin, destination]);
  // 📅 Al tener fechas disponibles, mover el calendario al primer día válido
  React.useEffect(() => {
    if (availableDates && availableDates.length > 0) {
      const first = new Date(availableDates[0]);
      setDateRange([{ startDate: first, endDate: first, key: "selection" }]);
    }
  }, [availableDates]);

  // 🔹 Cargar orígenes y destinos desde la base de datos al iniciar
  React.useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("http://localhost:4000/api/locations");
        const data = await res.json();
        setOrigins(data.origins || []);
        setDestinations(data.destinations || []);
      } catch (error) {
        console.error("❌ Error al cargar ubicaciones:", error);
      }
    }
    fetchLocations();
  }, []);
  // 🔹 Cargar destinos según el origen seleccionado
  React.useEffect(() => {
    if (!origin) return; // si no hay origen, no hace nada

    async function fetchDestinationsByOrigin() {
      try {
        const res = await fetch(
          `http://localhost:4000/api/locations/${origin}`
        );
        const data = await res.json();
        setDestinations(data.destinations || []);
      } catch (error) {
        console.error("❌ Error al cargar destinos por origen:", error);
      }
    }

    fetchDestinationsByOrigin();
  }, [origin]);

  // Buscar vuelos
  // Buscar vuelos
  // Buscar vuelos
  async function searchFlights() {
    try {
      setLoading(true);
      setMessage("");
      setFlights([]);

      const query = new URLSearchParams();
      if (origin) query.append("origin", origin);
      if (destination) query.append("destination", destination);
      if (dateRange[0]?.startDate)
        query.append(
          "from",
          dateRange[0].startDate.toISOString().split("T")[0]
        );
      if (dateRange[0]?.endDate)
        query.append("to", dateRange[0].endDate.toISOString().split("T")[0]);
      if (sort) query.append("sort", sort);

      const res = await fetch(
        `http://localhost:4000/api/flights?${query.toString()}`
      );
      const data = await res.json();

      // 🧠 Maneja ambos casos: un solo vuelo o varios
      const flightsArray = Array.isArray(data) ? data : data ? [data] : [];

      if (flightsArray.length === 0) {
        setMessage("⚠️ No se encontraron vuelos con esos criterios.");
      } else {
        setMessage(`✈️ Se encontraron ${flightsArray.length} vuelo(s).`);
      }

      setFlights(flightsArray);
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
      {availableDates.length > 0 && (
        <p
          style={{ color: "#007bff", fontWeight: "bold", marginBottom: "10px" }}
        >
          ✈️ {availableDates.length} fecha(s) disponible(s) para esta ruta
        </p>
      )}

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
          <option value="">Seleccionar origen</option>
          {origins.map((o, i) => (
            <option key={i} value={o}>
              {o}
            </option>
          ))}
        </select>

        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        >
          <option value="">Seleccionar destino</option>
          {destinations
            .filter((d) => d !== origin) // evita mostrar el mismo lugar como destino
            .map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
        </select>
        {/* 📅 Campo visual para abrir el calendario con las fechas seleccionadas */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            readOnly
            value={`${dateRange[0].startDate.toISOString().split("T")[0]} → ${
              dateRange[0].endDate.toISOString().split("T")[0]
            }`}
            onClick={() => setShowCalendar(!showCalendar)}
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
              textAlign: "center",
              fontWeight: "500",
              color: "#333",
              width: "200px",
            }}
          />
          {showCalendar && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                left: "0",
                zIndex: 1000,
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <DateRange
                ranges={dateRange}
                onChange={(item) => setDateRange([item.selection])}
                moveRangeOnFirstSelection={false}
                months={1}
                direction="horizontal"
                rangeColors={["#007bff"]}
                disabledDay={(day) => {
                  const y = day.getFullYear();
                  const m = String(day.getMonth() + 1).padStart(2, "0");
                  const da = String(day.getDate()).padStart(2, "0");
                  const key = `${y}-${m}-${da}`;
                  return !availableDatesSet.has(key);
                }}
                dayContentRenderer={(day) => {
                  const y = day.getFullYear();
                  const m = String(day.getMonth() + 1).padStart(2, "0");
                  const da = String(day.getDate()).padStart(2, "0");
                  const key = `${y}-${m}-${da}`;
                  const isAvailable = availableDatesSet.has(key);
                  return (
                    <div
                      style={{
                        textAlign: "center",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        lineHeight: "28px",
                        backgroundColor: isAvailable ? "#007bff" : "#f0f0f0",
                        color: isAvailable ? "white" : "#ccc",
                        margin: "0 auto",
                        cursor: isAvailable ? "pointer" : "not-allowed",
                      }}
                      title={isAvailable ? "Disponible" : "No disponible"}
                    >
                      {day.getDate()}
                    </div>
                  );
                }}
              />

              {/* ✅ Botón para confirmar selección */}
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <button
                  onClick={() => {
                    setShowCalendar(false);
                  }}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 14px",
                    cursor: "pointer",
                  }}
                >
                  Confirmar fecha
                </button>
              </div>
            </div>
          )}
        </div>

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
