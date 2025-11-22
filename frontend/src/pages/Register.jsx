import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // 👈 nuevo CSS visual

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("user");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      alert("⚠️ Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch(
        "https://vueloscolombia-backend.onrender.comapi/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, rol }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("✅ Usuario registrado correctamente");
        navigate("/login");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("❌ Error al conectar con el servidor");
    }
  };

  return (
    <div className="register-page">
      <div className="register-banner">
        🌍 <span>Encuentra tu próximo destino soñado ✈️</span>
      </div>

      <div className="register-card">
        <h2>Registro de Usuario</h2>

        <div className="form-container">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>

          <button onClick={handleRegister}>Registrar</button>
          <button className="secondary" onClick={() => navigate("/login")}>
            Volver al Login
          </button>
        </div>

        <p className="register-footer">
          Explora Colombia y el mundo con nuestras mejores ofertas de vuelo.
        </p>
      </div>
    </div>
  );
}

export default Register;
