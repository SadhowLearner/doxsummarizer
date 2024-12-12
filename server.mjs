import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

// Define routes (if necessary)
app.use("/upload", (req, res) => {
  res.send("Upload endpoint placeholder");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
