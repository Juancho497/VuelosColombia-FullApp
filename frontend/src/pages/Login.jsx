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
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.rol);

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
    <div className="container">
      <h2>Iniciar Sesión</h2>

      {/* 🚫 Evita que Chrome autocomplete o valide contraseñas */}
      <form
        className="form-container"
        onSubmit={(e) => e.preventDefault()}
        autoComplete="off" // 👈 Desactiva autocompletar a nivel de formulario
      >
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          name="fake-user" // 👈 Cambia el nombre para que Chrome no lo asocie a credenciales
          autoComplete="off"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="fake-pass" // 👈 Evita que Chrome lo detecte como campo real de login
          autoComplete="new-password" // 👈 Desactiva el aviso de contraseña comprometida
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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
  );
}

export default Login;
