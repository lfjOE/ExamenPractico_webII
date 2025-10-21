import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { createHash, scryptSync } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYS_DIR = process.env.CRYPTO_DIR
  ? path.resolve(process.env.CRYPTO_DIR)
  : path.join(__dirname, 'keys');

const P12_PATH = path.join(KEYS_DIR, 'keystore.p12');

let _symKeyCache = null;

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function requirePassphrase() {
  const passphrase = process.env.PRIVATE_KEY_PASSPHRASE || '';
  if (!passphrase) {
    throw new Error('Falta PRIVATE_KEY_PASSPHRASE en .env para proteger el PKCS#12');
  }
  return passphrase;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'pipe', ...opts });
  if (r.status !== 0) {
    const out = (r.stdout || '').toString();
    const err = (r.stderr || '').toString();
    throw new Error(`Error al ejecutar "${cmd} ${args.join(' ')}":\n${out}\n${err}`);
  }
  return r;
}

export function ensureKeysOnBoot() {
  ensureDir(KEYS_DIR);
  if (fs.existsSync(P12_PATH)) return;

  const passphrase = requirePassphrase();

  const TMP_PRIV = path.join(KEYS_DIR, '.tmp_priv.pem');
  const TMP_CERT = path.join(KEYS_DIR, '.tmp_cert.pem');

  try {

    run('openssl', ['genrsa', '-out', TMP_PRIV, '4096']);

    run('openssl', [
      'req', '-new', '-x509',
      '-key', TMP_PRIV,
      '-subj', '/CN=MaterialHub/',
      '-days', '3650',
      '-out', TMP_CERT
    ]);

    run('openssl', [
      'pkcs12', '-export',
      '-inkey', TMP_PRIV,
      '-in', TMP_CERT,
      '-out', P12_PATH,
      '-name', 'materialhub',
      '-passout', `pass:${passphrase}`
    ]);

    //Asegurar permisos estrictos
    fs.chmodSync(P12_PATH, 0o600);
  } finally {
    //Limpiar temporales
    try { fs.unlinkSync(TMP_PRIV); } catch {}
    try { fs.unlinkSync(TMP_CERT); } catch {}
  }
}

export function getSymKey() {
  if (_symKeyCache) return _symKeyCache;

  const passphrase = requirePassphrase();
  if (!fs.existsSync(P12_PATH)) {
    throw new Error('PKCS#12 no existe. Llama ensureKeysOnBoot() temprano.');
  }
  const p12Bytes = fs.readFileSync(P12_PATH);
  const salt = createHash('sha256').update(p12Bytes).digest();

  _symKeyCache = scryptSync(passphrase, salt, 32);
  return _symKeyCache;
}

export function getPkcs12Path() {
  return P12_PATH;
}
