import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!usuario || !password)
      return alert("Todos los campos son obligatorios");

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.rol);

        alert(`¡Bienvenido ${data.rol.toUpperCase()}!`);

        setTimeout(() => {
          if (data.rol === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/search-flights";
          }
        }, 200);
      } else {
        alert(data.message || "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="container">
      <h2>Iniciar Sesión</h2>
      <div className="form-container">
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button onClick={handleLogin}>Iniciar Sesión</button>
          <button className="secondary" onClick={handleRegisterRedirect}>
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
