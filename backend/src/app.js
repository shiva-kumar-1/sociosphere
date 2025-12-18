const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

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

module.exports = app;
