import { createWorker } from "tesseract.js";
import path from "path";
import fs from "fs";

async function main() {
  const imagePath = path.join(process.cwd(), "public", "dve_evidence", "1779701489291-9gq4fbkum.png");
  if (!fs.existsSync(imagePath)) {
    console.error("Test image not found:", imagePath);
    return;
  }
  
  console.log("Image found at:", imagePath);
  console.log("Creating worker...");
  
  try {
    const langPath = path.join(process.cwd(), "tessdata");
    console.log("Using langPath:", langPath);
    
    const worker = await createWorker("tha+eng", 1, {
      langPath,
      gzip: false,
      logger: (m) => console.log("[OCR LOG]", m.status, Math.round(m.progress * 100) + "%"),
    });
    
    console.log("Worker created! Running recognize...");
    const { data } = await worker.recognize(imagePath);
    
    console.log("\n--- OCR OUTPUT ---");
    console.log(data.text);
    console.log("------------------\n");
    
    await worker.terminate();
  } catch (err) {
    console.error("OCR Test Error:", err);
  }
}

main();
