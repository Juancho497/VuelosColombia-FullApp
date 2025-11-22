import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!usuario || !password)
      return Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Todos los campos son obligatorios",
        confirmButtonColor: "#3085d6",
      });

    try {
      const res = await fetch(
        "https://vueloscolombia-backend.onrender.com/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: usuario, password }),
        }
      );

      const data = await res.json();
      console.log("🧾 Datos del login:", data);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.rol);
        localStorage.setItem("userName", data.username);

        await Swal.fire({
          icon: "success",
          title: `¡Bienvenido ${data.rol.toUpperCase()}!`,
          showConfirmButton: false,
          timer: 1500,
        });

        setTimeout(() => {
          if (data.rol === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/search-flights";
          }
        }, 200);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: data.message || "Usuario o contraseña incorrectos",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "No se pudo conectar con el backend",
      });
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <div className="welcome-banner">
        <h1>
          ✈️ ¡Bienvenido a <span>Vuelos Colombia</span>!
        </h1>
        <p>
          "Viajar no solo te lleva a lugares, sino a nuevas versiones de ti
          mismo."
        </p>
      </div>

      <div className="login-card">
        <h2>Iniciar Sesión</h2>

        <form
          className="form-container"
          onSubmit={(e) => e.preventDefault()}
          autoComplete="off"
        >
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            name="fake-user"
            autoComplete="off"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="fake-pass"
            autoComplete="new-password"
          />

          <div className="button-group">
            <button type="button" onClick={handleLogin}>
              Iniciar Sesión
            </button>
            <button
              type="button"
              className="secondary"
              onClick={handleRegisterRedirect}
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
