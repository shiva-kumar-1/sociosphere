const bidRoutes = require("./routes/bid.routes");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user.routes");
const providerRoutes = require("./routes/provider.routes");
const serviceRoutes = require("./routes/service.routes");
const serviceRequestRoutes = require("./routes/serviceRequest.routes");





const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- MONGODB CONNECTION ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error.message);
  });

/* ---------- TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.send("SocioSphere API is running 🚀");
});

app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", serviceRequestRoutes);
app.use("/api/bids", bidRoutes);





module.exports = app;
