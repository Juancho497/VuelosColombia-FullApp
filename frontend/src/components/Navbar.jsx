import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", backgroundColor: "#f0f0f0" }}>
      <Link to="/" style={{ marginRight: "10px" }}>
        Buscar Vuelos
      </Link>
      <Link to="/register" style={{ marginRight: "10px" }}>
        Registro
      </Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}

export default Navbar;
