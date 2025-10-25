import React, { useState } from "react";

function Reservation({ flight, passengerData, onConfirm, onCancel }) {
  const [formData, setFormData] = useState({
    name: passengerData?.name || "",
    document: passengerData?.document || "",
    seatNumber: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.document || !formData.seatNumber) {
      return alert("❗Todos los campos son obligatorios");
    }
    onConfirm(formData);
  };

  return (
    <div className="container">
      <h2>Confirmar Reserva</h2>
      <div className="form-container">
        <h3>Vuelo seleccionado: {flight.code}</h3>
        <p>
          <strong>Origen:</strong> {flight.origin}
        </p>
        <p>
          <strong>Destino:</strong> {flight.destination}
        </p>
        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(flight.departure_time).toLocaleDateString()}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Identificación"
            value={formData.document}
            onChange={(e) =>
              setFormData({ ...formData, document: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Número de asiento"
            value={formData.seatNumber}
            onChange={(e) =>
              setFormData({ ...formData, seatNumber: e.target.value })
            }
          />
          <button type="submit" style={{ marginTop: "10px" }}>
            Confirmar Reserva
          </button>
          <button
            type="button"
            style={{ marginTop: "10px", backgroundColor: "gray" }}
            onClick={onCancel}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Reservation;
