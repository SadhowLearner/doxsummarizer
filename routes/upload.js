const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI, GoogleAIFileManager } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Inisialisasi API
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

// Endpoint untuk upload file
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Upload file ke Gemini API
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: fileName,
    });

    console.log(`File uploaded as: ${uploadResponse.file.uri}`);

    // Hapus file lokal setelah upload
    fs.unlinkSync(filePath);

    // Generate content menggunakan Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "application/pdf",
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: "Summarize this document as a bulleted list." },
    ]);

    // Kirim hasil ke client
    res.json({ summary: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process the document." });
  }
});

module.exports = router;
