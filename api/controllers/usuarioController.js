import db from '../config/db.js';
import { encryptPassword, decryptPassword } from '../config/crypto/cryptoService.js';
import { timingSafeEqual, createHash } from 'crypto';

function timingSafeEqStr(a, b) {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) {
    const ha = createHash('sha256').update(aBuf).digest();
    const hb = createHash('sha256').update(bBuf).digest();
    return timingSafeEqual(ha, hb) && false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export const registrarUsuario = (req, res) => {
  const { username, email, lastname, password, birthdate } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email y password son obligatorios' });
  }

  let password_enc;
  try {
    password_enc = encryptPassword(password);
  } catch (e) {
    return res.status(500).json({ error: 'Error al cifrar la contraseña' });
  }

  const sql =
    'INSERT INTO usuario (username, email, lastname, password, birthdate) VALUES (?, ?, ?, ?, ?)';
  const params = [username, email, lastname || null, password_enc, birthdate || null];

  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
    res.status(201).json({ ok: true, user_id: result.insertId });
  });
};

export const loginUsuario = (req, res) => {
  const { usernameOrEmail, password } = req.body || {};
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'usernameOrEmail y password son obligatorios' });
  }

  const sql = 'SELECT user_id, username, email, password FROM usuario WHERE username = ? OR email = ? LIMIT 1';
  db.query(sql, [usernameOrEmail, usernameOrEmail], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al consultar usuario' });
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    let storedPlain;
    try {
      storedPlain = decryptPassword(user.password);
    } catch (e) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const ok = timingSafeEqStr(storedPlain, String(password));
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    res.json({ ok: true, user_id: user.user_id, username: user.username, email: user.email });
  });
};
