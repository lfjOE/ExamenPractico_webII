import db from '../config/db.js';

/**
 * Listar todos los repartidores activos
 */
export const listarRepartidores = (req, res) => {
    const sql = `
        SELECT 
            repartidor_id as id,
            nombre,
            apellidos,
            email,
            codigo_pais as codigoPais,
            telefono,
            municipio,
            fecha_nacimiento as fechaNacimiento,
            contrasena_provisional as contrasenaProvisional
        FROM repartidor
        ORDER BY repartidor_id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('[listarRepartidores] Error en base de datos:', err);
            return res.status(500).json({ error: 'Error al obtener los repartidores' });
        }
        console.log(`[listarRepartidores] ${results.length} repartidores encontrados`);
        res.json(results);
    });
};

/**
 * Agregar un nuevo repartidor
 */
export const agregarRepartidor = (req, res) => {
    try {
        const {
            nombre,
            apellidos,
            email,
            codigoPais,
            telefono,
            municipio,
            fechaNacimiento,
            contrasenaProvisional
        } = req.body || {};

        // Validaciones básicas
        if (!nombre || !apellidos || !email || !telefono || !municipio || !fechaNacimiento || !contrasenaProvisional) {
            return res.status(400).json({
                error: 'Todos los campos son requeridos',
                campos: { nombre, apellidos, email, telefono, municipio, fechaNacimiento, contrasenaProvisional }
            });
        }

        // Verificar si ya existe un repartidor con ese email
        const sqlCheckEmail = 'SELECT repartidor_id, email FROM repartidor WHERE email = ? LIMIT 1';

        db.query(sqlCheckEmail, [email], (err, results) => {
            if (err) {
                console.error('[agregarRepartidor] Error al verificar email:', err);
                return res.status(500).json({ error: 'Error al verificar el email' });
            }

            // Si ya existe un repartidor con ese email
            if (results && results.length > 0) {
                console.log(`[agregarRepartidor] Email ya existe: ${email}`);
                return res.status(409).json({
                    error: 'Ya existe un repartidor registrado con este email',
                    email: email
                });
            }

            // Si no existe, proceder a crear el usuario y repartidor
            const sqlUsuario = `
                INSERT INTO usuario (email, password, tipo_usuario)
                VALUES (?, ?, 'repartidor')
            `;

            db.query(sqlUsuario, [email, contrasenaProvisional], (err, resultUsuario) => {
                if (err) {
                    console.error('[agregarRepartidor] Error al crear usuario:', err);
                    // Verificar si el error es por email duplicado en tabla usuario
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ error: 'El email ya está registrado en el sistema' });
                    }
                    return res.status(500).json({ error: 'Error al crear el usuario del repartidor' });
                }

                const userId = resultUsuario.insertId;

                // Ahora insertar el repartidor
                const sqlRepartidor = `
                    INSERT INTO repartidor (
                        user_id,
                        nombre,
                        apellidos,
                        email,
                        codigo_pais,
                        telefono,
                        municipio,
                        fecha_nacimiento,
                        contrasena_provisional
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(
                    sqlRepartidor,
                    [userId, nombre, apellidos, email, codigoPais || '+52', telefono, municipio, fechaNacimiento, contrasenaProvisional],
                    (err, result) => {
                        if (err) {
                            console.error('[agregarRepartidor] Error al insertar repartidor:', err);
                            return res.status(500).json({ error: 'Error al insertar el repartidor' });
                        }

                        console.log(`[agregarRepartidor] Repartidor creado exitosamente: ${email}`);
                        return res.status(201).json({
                            ok: true,
                            message: 'Repartidor agregado correctamente',
                            repartidor_id: result.insertId
                        });
                    }
                );
            });
        });
    } catch (e) {
        console.error('[agregarRepartidor] Fatal:', e);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};


/**
 * Editar un repartidor existente
 */
export const editarRepartidor = (req, res) => {
    try {
        const {
            id,
            nombre,
            apellidos,
            email,
            codigoPais,
            telefono,
            municipio,
            fechaNacimiento,
            contrasenaProvisional
        } = req.body || {};

        if (!id) {
            return res.status(400).json({ error: 'ID del repartidor es requerido' });
        }

        const sql = `
            UPDATE repartidor
            SET 
                nombre = ?,
                apellidos = ?,
                email = ?,
                codigo_pais = ?,
                telefono = ?,
                municipio = ?,
                fecha_nacimiento = ?,
                contrasena_provisional = ?
            WHERE repartidor_id = ?
        `;

        db.query(
            sql,
            [nombre, apellidos, email, codigoPais, telefono, municipio, fechaNacimiento, contrasenaProvisional, id],
            (err, result) => {
                if (err) {
                    console.error('[editarRepartidor] Error actualizando:', err);
                    return res.status(500).json({ error: 'Error al actualizar repartidor' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Repartidor no encontrado' });
                }

                return res.status(200).json({
                    ok: true,
                    message: 'Repartidor actualizado correctamente'
                });
            }
        );
    } catch (e) {
        console.error('[editarRepartidor] Fatal:', e);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Eliminar un repartidor (soft delete - marca como inactivo)
 */
export const eliminarRepartidor = (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID del repartidor es requerido' });
        }

        // Soft delete - solo marcamos como inactivo
        const sql = 'delete from repartidor WHERE repartidor_id = ?';

        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('[eliminarRepartidor] Error eliminando:', err);
                return res.status(500).json({ error: 'Error al eliminar repartidor' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Repartidor no encontrado' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Repartidor eliminado correctamente'
            });
        });
    } catch (e) {
        console.error('[eliminarRepartidor] Fatal:', e);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
