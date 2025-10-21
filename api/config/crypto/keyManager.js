import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateKeyPairSync,
  randomBytes,
  privateEncrypt,
  publicDecrypt,
  constants
} from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYS_DIR = process.env.CRYPTO_DIR
  ? path.resolve(process.env.CRYPTO_DIR)
  : path.join(__dirname, 'keys');

  // Rutas de los archivos de llaves y de la AES envuelta
const PUB_PATH = path.join(KEYS_DIR, 'public.pem');
const PRIV_PATH = path.join(KEYS_DIR, 'private.pem');
const SYM_ENC_PATH = path.join(KEYS_DIR, 'symkey.enc');

let _symKeyCache = null;

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// Se llama al iniciar el servidor. Si faltan llaves o symkey.enc, los genera.
export function ensureKeysOnBoot() {
  ensureDir(KEYS_DIR);

  const hasAll =
    fs.existsSync(PUB_PATH) &&
    fs.existsSync(PRIV_PATH) &&
    fs.existsSync(SYM_ENC_PATH);

  if (hasAll) return;

  const passphrase = process.env.PRIVATE_KEY_PASSPHRASE || '';
  if (!passphrase) {
    throw new Error('Falta PRIVATE_KEY_PASSPHRASE en .env para encriptar la llave privada');
  }

  //Genera par de llaves RSA-4096
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase
    }
  });

  fs.writeFileSync(PUB_PATH, publicKey, { mode: 0o600 });
  fs.writeFileSync(PRIV_PATH, privateKey, { mode: 0o600 });

  //Genera la llave simétrica AES-256 (32 bytes aleatorios)
  const aesKey = randomBytes(32);

  //Envuelve la AES usando la LLAVE PRIVADA
  const symEnc = privateEncrypt(
    {
      key: privateKey,
      passphrase,
      padding: constants.RSA_PKCS1_PADDING
    },
    aesKey
  );
  fs.writeFileSync(SYM_ENC_PATH, symEnc.toString('base64'), { mode: 0o600 });
}

// Devuelve el PEM de la llave pública
export function getPublicKeyPem() {
  return fs.readFileSync(PUB_PATH, 'utf8');
}

// Obtiene la AES-256
export function getSymKey() {
  if (_symKeyCache) return _symKeyCache;

  const publicPem = getPublicKeyPem();
  const encB64 = fs.readFileSync(SYM_ENC_PATH, 'utf8').trim();
  const encBuf = Buffer.from(encB64, 'base64');

  const aesKey = publicDecrypt(
    {
      key: publicPem,
      padding: constants.RSA_PKCS1_PADDING
    },
    encBuf
  );
  if (aesKey.length !== 32) {
    throw new Error('La llave simétrica no es de 32 bytes (AES-256)');
  }
  _symKeyCache = aesKey;
  return _symKeyCache;
}
