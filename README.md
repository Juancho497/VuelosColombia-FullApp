Juan Manuel Bustos - Código 200290
José Alexander Carrero - Código 200097
Pedro Andrés Vélez Perdomo - Código 200320

Vuelos Colombia — Full App

Aplicación web desarrollada como proyecto académico para la gestión de vuelos, reservas y usuarios.  
El sistema permite buscar vuelos, realizar reservas de ida y vuelta, visualizar historial de reservas y administrar vuelos mediante un panel de control para el administrador.

---

Tecnologías Utilizadas

🔹 Frontend
- React.js — Framework para construir la interfaz de usuario.
- CSS Modules — Estilos personalizados por componente.
- React Router DOM — Navegación entre pantallas.
- Fetch API — Comunicación con el backend a través de solicitudes HTTP.

🔹 Backend
- Node.js + Express.js — Servidor web y definición de rutas RESTful.
- MySQL — Base de datos relacional para persistencia de la información.
- mysql2/promise — Conexión y consultas seguras hacia MySQL.
- CORS y dotenv — Configuración y seguridad del entorno.

---

Estructura del Proyecto
VuelosColombia-FullApp/
│
├── backend/
│ ├── routes/
│ │ ├── flights.js
│ │ ├── reservations.js
│ │ ├── locations.js
│ │ └── availableDates.js
│ ├── db.js
│ └── server.js
│
└── frontend/
└── src/
├── components/
│ ├── Navbar.jsx
│ ├── Navbar.css
│ └── LogoutButton.jsx
│
├── pages/
│ ├── Login.jsx
│ ├── Register.jsx
│ ├── SearchFlights.jsx
│ ├── Reservation.jsx
│ ├── Profile.jsx
│ └── AdminPanel.jsx
│
├── styles/
│ └── App.css
│
├── App.js
└── index.js


---
Funcionalidades Principales

👤 Usuario
- Registro e inicio de sesión.
- Búsqueda de vuelos por origen, destino y fecha.
- Reserva de vuelos (ida o ida/vuelta) con validación de datos.
- Visualización del historial de reservas desde el perfil.

🧑‍💼 Administrador
- Visualización de todos los vuelos y reservas.
- Eliminación de vuelos o reservas con confirmación.
- Búsqueda y filtrado de reservas.
- Modal de detalle con información completa del pasajero y vuelo.

---
🗄️ Base de Datos

Modelo implementado en **MySQL** con las tablas:
`users`, `flights`, `reservations`, `passengers`, `tickets`.

Relaciones:
users (1) ───< reservations (N)
flights (1) ───< reservations (N)
reservations (1) ───< passengers (N)
reservations (1) ───< tickets (N)


---

Ejecución del Proyecto

▶️ Backend
```bash
cd backend
npm install
node server.js

💻 Frontend
cd frontend
npm install
npm start

Aplicación disponible en:
Frontend: http://localhost:3000
Backend:  http://localhost:4000


