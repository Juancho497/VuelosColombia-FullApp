import React from "react";

function LogoutButton() {
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        padding: "8px 16px",
        backgroundColor: "#d9534f",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Cerrar sesión
    </button>
  );
}

export default LogoutButton;
