import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
dotenv.config();

// Initialize GoogleGenerativeAI with your API_KEY.
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  // Choose a Gemini model.
  model: "gemini-1.5-flash",
});

// Upload the file and specify a display name.
const uploadResponse = await fileManager.uploadFile("uploads/modul.pdf", {
  mimeType: "application/pdf",
  displayName: "Gemini 1.5 PDF",
});

// View the response.
console.log(
  `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`,
);

// Generate content using text and the URI reference for the uploaded file.
const result = await model.generateContent([
  {
    fileData: {
      mimeType: uploadResponse.file.mimeType,
      fileUri: uploadResponse.file.uri,
    },
  },
  { text: "Bisakah kamu mernagkum dokumen ini sebagai daftar poin, pastikan jawabannya menggunakan bahasa indonesia" },
]);

// Output the generated text to the console
console.log(result.response.text());