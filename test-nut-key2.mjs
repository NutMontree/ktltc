import 'dotenv/config';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import axios from 'axios';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "default_fallback_secret_key_12345";

function decrypt(text) {
  if (!text) return null;
  try {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption error", error);
    return null;
  }
}

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("ktltc_db");
  const user = await db.collection("users").findOne({ username: "nut" });
  if (!user) {
    console.log("User nut not found");
    process.exit(1);
  }
  const decKey = decrypt(user.geminiApiKey);
  console.log("Decrypted Key:", decKey);
  
  if (!decKey) {
    console.log("Failed to decrypt");
    process.exit(1);
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${decKey}`;
  try {
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: "Hi" }] }]
    });
    console.log("Success:", res.status);
  } catch (err) {
    console.log("Error:", err.response ? err.response.status + " " + JSON.stringify(err.response.data) : err.message);
  }
  
  await client.close();
}

run();
