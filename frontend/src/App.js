import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchFlights from "./pages/SearchFlights";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

// 🔥 Componente que limpia sesión y redirige siempre al login al iniciar
function ForceLoginOnStart() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear(); // 🧹 borra cualquier sesión anterior
    navigate("/login"); // 👈 redirige siempre al login
  }, [navigate]);

  return null;
}

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Router>
      {/* ✅ Navbar visible solo si hay sesión iniciada */}
      {token && role && <Navbar />}

      <Routes>
        {/* Limpieza forzada al cargar */}
        <Route path="/" element={<ForceLoginOnStart />} />

        {/* Página de login */}
        <Route path="/login" element={<Login />} />

        {/* Página de registro */}
        <Route path="/register" element={<Register />} />

        {/* Página de búsqueda de vuelos */}
        <Route
          path="/search-flights"
          element={token && role ? <SearchFlights /> : <Navigate to="/login" />}
        />

        {/* Panel de administrador */}
        <Route
          path="/admin"
          element={
            token && role === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ✅ Nueva página de perfil */}
        <Route
          path="/profile"
          element={token && role ? <Profile /> : <Navigate to="/login" />}
        />

        {/* Cualquier otra ruta → login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
