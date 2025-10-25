const express = require("express");
const cors = require("cors");
require("dotenv").config();

const flightsRouter = require("./routes/flights");
const reservationsRouter = require("./routes/reservations");
const authRouter = require("./routes/auth");
const locationsRouter = require("./routes/locations");
const availableDatesRouter = require("./routes/availableDates");

const app = express();

// 🧩 CONFIGURACIÓN CORS
const corsOptions = {
  origin: "http://localhost:3000", // Permite peticiones solo desde tu frontend React
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

// 🧠 Middleware para interpretar JSON
app.use(express.json());

// 🚀 Rutas principales
app.use("/api/flights", flightsRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api", authRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/available-dates", availableDatesRouter);

// ⚙️ Puerto y arranque del servidor
const PORT = process.env.PORT || 4000;
// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor Vuelos Colombia activo 🚀" });
});
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
