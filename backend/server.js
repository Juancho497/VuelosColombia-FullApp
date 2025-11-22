const express = require("express");
const cors = require("cors");
require("dotenv").config();

const flightsRouter = require("./routes/flights");
const reservationsRouter = require("./routes/reservations");
const authRouter = require("./routes/auth");
const locationsRouter = require("./routes/locations");
const availableDatesRouter = require("./routes/availableDates");

const app = express();

// ✅ CORS listo para Render / Vercel
const corsOptions = {
  origin: "*", // Puedes restringir luego a tu URL de Vercel cuando lo tengas
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

// 🧠 Middlewares JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 🚀 Rutas principales
app.use("/api/flights", flightsRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api", authRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/available-dates", availableDatesRouter);

// 🏁 Ruta raíz
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor Vuelos Colombia activo 🚀" });
});

// ⚙️ Puerto dinámico (Render usa process.env.PORT)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});
