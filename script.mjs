import { GoogleGenerativeAI } from "@google/generative-ai";
import Base64 from "base64-js";
import MarkdownIt from "markdown-it";

const API_KEY = 'AIzaSyBS4AYembwDoND75gdAyfYFcC5bg1NJpyE';  // Gantilah dengan API key Anda
const promptInput = document.querySelector("#promptInput");
const output = document.querySelector("#output");
const wordCountElement = document.querySelector("#wordCount");
const languageInputs = document.querySelectorAll("input[name='language']");
const wordMinInput = document.querySelector("#wordMin");
const wordMaxInput = document.querySelector("#wordMax");

// Inisialisasi Dropzone
const dropzone = new Dropzone("#dropzone", {
  url: "/", // URL palsu karena kita akan menangani pengunggahan secara manual
  autoProcessQueue: false,
  init: function () {
    this.on("addedfile", (file) => {
      // File ditambahkan ke Dropzone
    });
  }
});

document.querySelector("#uploadForm").onsubmit = async (e) => {
  e.preventDefault();
  output.innerHTML = "Proccessing...";
  wordCountElement.textContent = "0";

  try {
    // Validate file input
    if (dropzone.files.length === 0) {
      throw new Error("Please upload a document.");
    }

    const file = dropzone.files[0];

    // Get selected language
    let selectedLanguage;
    languageInputs.forEach((input) => {
      if (input.checked) {
        selectedLanguage = input.value;
      }
    });

    // Get word range (optional)
    const wordMin = wordMinInput.value ? parseInt(wordMinInput.value, 10) : null;
    const wordMax = wordMaxInput.value ? parseInt(wordMaxInput.value, 10) : null;

    // Convert file to Base64
    const validMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/html",
    ];

    if (!validMimeTypes.includes(file.type)) {
      throw new Error(`File type "${file.type}" is not supported.`);
    }

    const fileBase64 = await file.arrayBuffer().then((buffer) => Base64.fromByteArray(new Uint8Array(buffer)));

    // Prepare content for API
    let additionalInstructions = promptInput.value.trim() || "Summarize this document.";
    if (selectedLanguage) {
      additionalInstructions += ` Please summarize in ${selectedLanguage}.`;
    }
    if (wordMin !== null && wordMax !== null) {
      additionalInstructions += ` Word range: ${wordMin}-${wordMax}.`;
    } else if (wordMin !== null) {
      additionalInstructions += ` Minimum word count: ${wordMin}.`;
    } else if (wordMax !== null) {
      additionalInstructions += ` Maximum word count: ${wordMax}.`;
    }

    const contents = [
      {
        role: "user",
        parts: [
          { inline_data: { mime_type: file.type, data: fileBase64 } },
          { text: additionalInstructions },
        ],
      },
    ];

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Call the API and stream output
    const result = await model.generateContentStream({ contents });
    const md = new MarkdownIt();
    let outputBuffer = [];
    for await (let response of result.stream) {
      outputBuffer.push(response.text());
      const summaryText = outputBuffer.join("");
      output.innerHTML = md.render(summaryText);
      const wordCount = summaryText.split(/\s+/).length;
      wordCountElement.textContent = wordCount;
    }
  } catch (error) {
    output.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
};
