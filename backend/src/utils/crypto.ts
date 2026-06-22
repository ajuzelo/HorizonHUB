import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Helper to get a 32 byte key from JWT_SECRET or fallback
const getKey = () => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_that_is_long_enough_32bytes!!';
  return crypto.createHash('sha256').update(secret).digest();
};

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedText: string): string => {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    if (!ivHex || !encryptedHex) return '';
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return '';
  }
};
