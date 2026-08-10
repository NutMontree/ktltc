const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const apiKey = envConfig.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No GEMINI_API_KEY found in .env");
  process.exit(1);
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

listModels();
