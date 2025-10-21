// controllers/usuarioController.js
import db from '../config/db.js';
import { encryptPassword, decryptPassword } from '../config/crypto/cryptoService.js';
import { timingSafeEqual, createHash } from 'crypto';

function limitLen(s, n) { return (s ?? '').toString().trim().slice(0, n); }
function parseBirthdate(d) {
  if (!d) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d).trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
function timingSafeEqStr(a, b) {
  const A = Buffer.from(String(a || ''), 'utf8');
  const B = Buffer.from(String(b || ''), 'utf8');
  if (A.length !== B.length) {
    const ha = createHash('sha256').update(A).digest();
    const hb = createHash('sha256').update(B).digest();
    return timingSafeEqual(ha, hb) && false;
  }
  return timingSafeEqual(A, B);
}

export const registrarUsuario = (req, res) => {
  try {
    let { username, email, password, lastname, birthdate } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email y password son obligatorios' });
    }

    username = limitLen(username, 30);
    email    = limitLen(email, 50);
    lastname = lastname ? limitLen(lastname, 50) : null;
    const bdate = parseBirthdate(birthdate); // NULL si vacío o formato inválido
    const encPass = encryptPassword(password); // almacena cifrado (varchar(512))

    // 1) ¿email o username ya usado?
    const sqlCheck = 'SELECT user_id FROM usuario WHERE email = ? OR username = ? LIMIT 1';
    db.query(sqlCheck, [email, username], (errC, rowsC) => {
      if (errC) {
        console.error('[registrarUsuario] check error:', errC);
        return res.status(500).json({ error: 'Error de base de datos (check)' });
      }
      if (rowsC && rowsC.length > 0) {
        return res.status(409).json({ error: 'Email o username ya registrados' });
      }

      // 2) Obtener nextId porque user_id NO es AUTO_INCREMENT en tu SQL
      const sqlNext = 'SELECT COALESCE(MAX(user_id), 0) + 1 AS nextId FROM usuario';
      db.query(sqlNext, [], (errN, rowsN) => {
        if (errN) {
          console.error('[registrarUsuario] nextId error:', errN);
          return res.status(500).json({ error: 'Error de base de datos (id)' });
        }
        const nextId = (rowsN && rowsN[0] && rowsN[0].nextId) ? rowsN[0].nextId : 1;

        // 3) Insert acorde al esquema adjunto
        const sqlIns = `
          INSERT INTO usuario (user_id, username, email, lastname, password, birthdate)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(sqlIns, [nextId, username, email, lastname, encPass, bdate], (errI, r) => {
          if (errI) {
            console.error('[registrarUsuario] insert error:', errI);
            return res.status(500).json({ error: 'Error de base de datos (insert)' });
          }
          return res.status(201).json({ ok: true, user_id: nextId, username, email });
        });
      });
    });
  } catch (e) {
    console.error('[registrarUsuario] fatal:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
};

export const loginUsuario = (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body || {};
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }

    const sql = `
      SELECT user_id, username, email, password
      FROM usuario
      WHERE email = ? OR username = ?
      LIMIT 1
    `;
    db.query(sql, [usernameOrEmail, usernameOrEmail], (err, rows) => {
      if (err) {
        console.error('[loginUsuario] select error:', err);
        return res.status(500).json({ error: 'Error de base de datos' });
      }
      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = rows[0];
      let storedPlain;
      try {
        storedPlain = decryptPassword(user.password);
      } catch (e) {
        console.error('[loginUsuario] decrypt error:', e);
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const ok = timingSafeEqStr(storedPlain, String(password));
      if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

      res.json({ ok: true, user_id: user.user_id, username: user.username, email: user.email });
    });
  } catch (e) {
    console.error('[loginUsuario] fatal:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
};
