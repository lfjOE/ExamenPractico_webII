// controllers/usuarioController.js
import db from '../config/db.js';
import { encryptPassword, decryptPassword } from '../config/crypto/cryptoService.js';
import { timingSafeEqual, createHash } from 'crypto';
import { sha512 } from 'js-sha512';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';


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

export const registrarCliente = (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      apellido,
      telefono,
      direccion,
      ciudad,
      fecha_nacimiento
    } = req.body || {};

    // Validación básica
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }

    const hashedPass = sha512(String(password));

    // 1️⃣ Verificar si el email ya existe
    const sqlCheck = 'SELECT user_id FROM usuario WHERE email = ? LIMIT 1';
    db.query(sqlCheck, [email], (errCheck, rowsCheck) => {
      if (errCheck) {
        console.error('Error verificando email:', errCheck);
        return res.status(500).json({ error: 'Error en base de datos al verificar el email.' });
      }
      if (rowsCheck.length > 0) {
        return res.status(409).json({ error: 'El correo ya está registrado.' });
      }

      // 2️⃣ Obtener el siguiente user_id manualmente (porque usuario no es autoincrement)
      const sqlNext = 'SELECT COALESCE(MAX(user_id), 0) + 1 AS nextId FROM usuario';
      db.query(sqlNext, [], (errNext, rowsNext) => {
        if (errNext) {
          console.error('Error obteniendo siguiente user_id:', errNext);
          return res.status(500).json({ error: 'Error al obtener el siguiente ID de usuario.' });
        }

        const nextUserId = rowsNext[0].nextId;

        // 3️⃣ Insertar usuario
        const sqlUser = `
          INSERT INTO usuario (user_id, email, password, tipo_usuario)
          VALUES (?, ?, ?, 'cliente')
        `;
        db.query(sqlUser, [nextUserId, email, hashedPass], (errUser) => {
          if (errUser) {
            console.error('Error insertando usuario:', errUser);
            return res.status(500).json({ error: 'Error insertando datos del usuario.' });
          }

          // 4️⃣ Insertar cliente (cliente_id se autoincrementa)
          const sqlCliente = `
            INSERT INTO cliente (user_id, nombre, apellido, telefono, direccion, ciudad, fecha_nacimiento)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          db.query(
            sqlCliente,
            [
              nextUserId,
              nombre,
              apellido,
              telefono,
              direccion,
              ciudad,
              fecha_nacimiento || null
            ],
            (errCliente) => {
              if (errCliente) {
                console.error('Error insertando cliente:', errCliente);
                return res.status(500).json({ error: 'Error insertando datos del cliente.' });
              }

              return res.status(201).json({
                ok: true,
                message: 'Cliente registrado correctamente.',
                user_id: nextUserId,
                email,
                tipo_usuario: 'cliente'
              });
            }
          );
        });
      });
    });
  } catch (e) {
    console.error('[registrarCliente] Fatal:', e);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const registrarRepartidor = (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      email,
      codigo_pais,
      telefono,
      municipio,
      fecha_nacimiento,
      contrasena_provisional
    } = req.body || {};

    if (!nombre || !apellidos || !email || !contrasena_provisional) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const hashedPass = sha512(String(contrasena_provisional));

    // 1) Validar si el email ya existe
    const sqlCheck = 'SELECT user_id FROM usuario WHERE email = ? LIMIT 1';
    db.query(sqlCheck, [email], (errC, rowsC) => {
      if (errC) return res.status(500).json({ error: 'Error en base de datos (check)' });
      if (rowsC.length > 0) return res.status(409).json({ error: 'Email ya registrado' });

      // 2) Obtener el siguiente ID
      const sqlNext = 'SELECT COALESCE(MAX(user_id), 0) + 1 AS nextId FROM usuario';
      db.query(sqlNext, [], (errN, rowsN) => {
        if (errN) return res.status(500).json({ error: 'Error al obtener ID' });
        const nextUserId = rowsN[0].nextId;

        // 3) Insertar en usuario
        const sqlUser = `
          INSERT INTO usuario (user_id, email, password, tipo_usuario)
          VALUES (?, ?, ?, 'repartidor')
        `;
        db.query(sqlUser, [nextUserId, email, hashedPass], (errU) => {
          if (errU) return res.status(500).json({ error: 'Error insertando usuario' });

          // 4) Insertar en tabla repartidor
          const sqlRep = `
            INSERT INTO repartidor (repartidor_id, user_id, nombre, apellidos, email, codigo_pais, telefono, municipio, fecha_nacimiento, contrasena_provisional)
            VALUES ((SELECT COALESCE(MAX(repartidor_id), 0) + 1 FROM repartidor), ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          db.query(
            sqlRep,
            [
              nextUserId,
              nombre,
              apellidos,
              email,
              codigo_pais,
              telefono,
              municipio,
              fecha_nacimiento || null,
              hashedPass
            ],
            (errR) => {
              if (errR) {
                console.error('Error insertando repartidor:', errR);
                return res.status(500).json({ error: 'Error insertando datos del repartidor' });
              }

              return res.status(201).json({
                ok: true,
                user_id: nextUserId,
                email,
                tipo_usuario: 'repartidor'
              });
            }
          );
        });
      });
    });
  } catch (e) {
    console.error('[registrarRepartidor] fatal:', e);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const loginUsuario = (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body || {};
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }

    const sql = `
      SELECT user_id, email, password, tipo_usuario
      FROM usuario
      WHERE email = ?
      LIMIT 1
    `;

    db.query(sql, [usernameOrEmail], (err, rows) => {
      if (err) {
        console.error('[loginUsuario] select error:', err);
        return res.status(500).json({ error: 'Error de base de datos' });
      }
      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = rows[0];
      const hashedPass = sha512(String(password));
      const ok = user.password === hashedPass;

      if (!ok) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      res.json({
        ok: true,
        user_id: user.user_id,
        email: user.email,
        tipo: user.tipo_usuario
      });
      console.log(`Usuario ${user.email} (ID ${user.user_id}) ha iniciado sesión con tipo ${user.tipo_usuario}`);
    });
  } catch (e) {
    console.error('[loginUsuario] fatal:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
};


export const recoverPassword = async (req, res) => {
  try {
    // Con GET, los datos vienen en req.query (desde la URL)
    const { email } = req.query;


    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    // Buscar usuario en base de datos

    const sql = 'SELECT user_id, email FROM usuario WHERE email = ? LIMIT 1'

    db.query(sql, [email], (err, rows) => {
      if (err) {
        console.error('[loginUsuario] select error:', err);
        return res.status(500).json({ error: 'Error de base de datos' });
      }
      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = rows[0];

      console.log('Usuario encontrado:', user.email);

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = sha512(resetToken);
      const expiry = new Date(Date.now() + 3600000);


      console.log('hashedToken:', hashedToken);
      console.log('expiry:', expiry);


      db.query(
        `INSERT INTO password_resets (user_id, token, expiry, created_at) 
          VALUES (?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE token = ?, expiry = ?, created_at = NOW()`,
        [user.user_id, hashedToken, expiry, hashedToken, expiry],
        (err, result) => {
          if (err) {
            console.error('[recoverPassword] insert error:', err);
            return res.status(500).json({ error: 'Error al guardar token de recuperación' });
          }

          console.log('Insert password_resets response:', result);

          // Aquí puedes continuar con el envío del correo si todo salió bien
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'luisfelipeosorioe@gmail.com',
              pass: process.env.EMAIL_PASSWORD
            }
          });

          const resetLink = `http://localhost:4200/reset-password?token=${resetToken}&email=${email}`;

          transporter.sendMail({
            from: '"MaterialHub"',
            to: email,
            subject: 'Recuperación de Contraseña',
            html: `
        <h2>Recuperación de Contraseña</h2>
        <p>Hola usuario, has solicitado una recuperacion de contraseña</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este enlace expira en 1 hora.</p>
      `
          }, (err, info) => {
            if (err) {
              console.error('[recoverPassword] email error:', err);
              return res.status(500).json({ error: 'Error al enviar correo de recuperación' });
            }

            console.log('Correo enviado:', info.messageId);
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

            res.json({
              success: true,
              message: 'Correo de recuperación enviado',
              previewUrl: nodemailer.getTestMessageUrl(info)
            });
          });
        }
      );



    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar solicitud'
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      console.log('Faltan datos en el cuerpo:', req.body);
      return res.status(400).json({
        success: false,
        message: 'Token, email y nueva contraseña son requeridos'
      });
    }

    // Buscar el registro del token de reseteo y validar que no haya expirado
    const sql = `
      SELECT pr.*, u.user_id, u.email 
      FROM password_resets pr 
      INNER JOIN usuario u ON pr.user_id = u.user_id 
      WHERE u.email = ? AND pr.expiry > NOW()
      LIMIT 1
    `;

    db.query(sql, [email], (err, rows) => {
      if (err) {
        console.error('[resetPassword] select error:', err);
        return res.status(500).json({ success: false, message: 'Error de base de datos' });
      }

      if (!rows || rows.length === 0) {
        console.log('No se encontró token válido para el email:', email);
        return res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }

      const resetRecord = rows[0];
      const hashedToken = sha512(token);

      // Verificar que el token coincida (comparación por hash)
      if (hashedToken !== resetRecord.token) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido'
        });
      }

      // Hashear la nueva contraseña
      const hashedNewPassword = sha512(String(newPassword));

      // Actualizar contraseña
      const updateQuery = 'UPDATE usuario SET password = ? WHERE user_id = ?';
      db.query(updateQuery, [hashedNewPassword, resetRecord.user_id], (err) => {
        if (err) {
          console.error('[resetPassword] update error:', err);
          return res.status(500).json({ success: false, message: 'Error al actualizar contraseña' });
        }

        // Eliminar el token usado
        const deleteQuery = 'DELETE FROM password_resets WHERE user_id = ?';
        db.query(deleteQuery, [resetRecord.user_id], (err) => {
          if (err) {
            console.error('[resetPassword] delete token error:', err);
            return res.status(500).json({ success: false, message: 'Error al limpiar token' });
          }

          console.log(`Token eliminado y contraseña actualizada para usuario ID ${resetRecord.user_id}`);

          return res.json({
            success: true,
            message: 'Contraseña restablecida correctamente'
          });
        });
      });
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al restablecer la contraseña'
    });
  }
};
