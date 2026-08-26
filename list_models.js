const fs = require('fs');
const https = require('https');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, (resp) => {
  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
    const models = JSON.parse(data);
    if (models.models) {
      console.log(models.models.map(m => m.name).join('\n'));
    } else {
      console.log('Error fetching models:', data);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
