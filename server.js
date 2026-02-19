console.log("Starting server...");

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const productroutes= require('./routes/productRoutes')

const cors = require("cors");

app.use(
  cors({
    origin: [
      "https://barcode-app-app.netlify.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);
app.use(express.json());

console.log("Connecting to DB...");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

const PORT = process.env.PORT || 5000;

app.use('/api/products',productroutes)

app.get("/test", (req, res) => {
  res.send("Server Working");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
