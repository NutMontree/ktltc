const https = require('https');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;

const data = JSON.stringify({
  contents: [{ parts: [{ text: "สวัสดี" }] }]
});

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\nRESPONSE:', responseData));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
