require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const uploadRoutes = require("./routes/upload");

const app = express();

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));

// Routes
app.use("/upload", uploadRoutes);

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
