import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("user"); // rol por defecto
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      alert("⚠️ Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rol }),
      });

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
    <div className="container">
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

        {/* Si quieres poder crear admin manualmente */}
        <select value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>

        <button onClick={handleRegister}>Registrar</button>
        <button
          className="secondary"
          onClick={() => navigate("/login")}
          style={{ marginLeft: "10px" }}
        >
          Volver al Login
        </button>
      </div>
    </div>
  );
}

export default Register;
