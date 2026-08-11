import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import axios from 'axios';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "default_fallback_secret_key_12345";
const IV_LENGTH = 16;

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
    console.log("User 'nut' not found.");
    await client.close();
    return;
  }

  const key = decrypt(user.geminiApiKey);
  if (!key) {
    console.log(`User 'nut' has no valid API key (or decryption failed). Raw: ${user.geminiApiKey}`);
    await client.close();
    return;
  }
  console.log(`Testing key for user 'nut' (ends in ${key.slice(-4)})...`);
  
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
      { contents: [{ parts: [{ text: "Hi" }] }] }
    );
    console.log(`  -> SUCCESS (Status ${res.status})`);
  } catch (err) {
    console.log(`  -> ERROR: ${err.response ? err.response.status : err.message}`);
    if (err.response && err.response.data && err.response.data.error) {
      console.log(`     Details: ${JSON.stringify(err.response.data.error)}`);
    }
  }
  
  await client.close();
}

run();
