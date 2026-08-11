import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'default-insecure-secret-key-123456';

// Helper to get a 32-byte key from the secret
function getKey(): Buffer {
  return Buffer.from(crypto.createHash('sha256').update(String(SECRET_KEY)).digest('base64').substring(0, 32));
}

export function encrypt(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return "";
  }
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return "";
  try {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedData = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    
    // cast to any to suppress typescript signature error for update
    let decrypted = decipher.update(encryptedData as any, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return "";
  }
}
