// config/crypto/cryptoService.js
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { getSymKey } from './keyManager.js';

export function encryptPassword(plaintext) {
  const key = getSymKey();              // AES-256 derivada en memoria
  const iv = randomBytes(12);           // GCM nonce de 96 bits
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const out = Buffer.concat([iv, ct, tag]).toString('base64'); // [IV||CT||TAG]
  return out;
}

export function decryptPassword(b64) {
  const key = getSymKey();
  const buf = Buffer.from(String(b64), 'base64');
  if (buf.length < 12 + 16) throw new Error('Criptograma inválido');

  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const ct = buf.subarray(12, buf.length - 16);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString('utf8');
}
