import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* 🔹 Sección izquierda */}
      <div className="navbar-left">
        {token && userName ? (
          <Link to="/profile">👤 Mi perfil</Link>
        ) : (
          <>
            <Link to="/register">📝 Registro</Link>
            <Link to="/login">🔒 Login</Link>
          </>
        )}
      </div>

      {/* 🔹 Sección derecha */}
      {token && userName && (
        <div className="navbar-right">
          <span>
            🟢 Sesión: <strong>{userName}</strong>
          </span>
          <button onClick={handleLogout}>🔴 Cerrar sesión</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
