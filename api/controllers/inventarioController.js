import db from '../config/db.js';


export const obtenerInventario = (req, res) => {
    const sql = "SELECT id_producto, nombre, descripcion, precio, cantidad, imagen FROM producto WHERE vigente = 1 ORDER BY id_producto";
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los productos' });
        }
        console.log(results);
        res.json(results);
    });
};

export const agregarProducto = (req, res) => {
    try {
        const { imagen, nombre, descripcion, precio, cantidad } = req.body || {};

        if (!nombre || !precio) {
            return res.status(400).json({ error: 'Nombre y precio son obligatorios.' });
        }

        const sql = `
      INSERT INTO producto (imagen, nombre, descripcion, precio, cantidad)
      VALUES (?, ?, ?, ?, ?)
    `;
        db.query(sql, [imagen || '', nombre, descripcion, precio, cantidad || 0,], (err, result) => {
            if (err) {
                console.error('[agregarProducto] Error en base de datos:', err);
                return res.status(500).json({ error: 'Error al insertar el producto.' });
            }

            return res.status(201).json({
                ok: true,
                message: 'Producto agregado correctamente.',
                id_producto: result.insertId
            });
        });
    } catch (e) {
        console.error('[agregarProducto] Fatal:', e);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};


export const editarProducto = (req, res) => {
    try {
        const { id_producto, imagen, nombre, descripcion, precio, cantidad } = req.body || {};

        if (!id_producto) return res.status(400).json({ error: 'ID del producto es requerido.' });

        const sql = `
      UPDATE producto
      SET imagen = ?, nombre = ?, descripcion = ?, precio = ?, cantidad = ?
      WHERE id_producto = ?
    `;
        db.query(sql, [imagen, nombre, descripcion, precio, cantidad, id_producto], (err, result) => {
            if (err) {
                console.error('[editarProducto] Error actualizando:', err);
                return res.status(500).json({ error: 'Error al actualizar producto.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Producto no encontrado.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Producto actualizado correctamente.'
            });
        });
    } catch (e) {
        console.error('[editarProducto] Fatal:', e);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};


export const eliminarProducto = (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'ID del producto es requerido.' });

        const sql = 'DELETE FROM producto WHERE id_producto = ?';
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('[eliminarProducto] Error eliminando:', err);
                return res.status(500).json({ error: 'Error al eliminar producto.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Producto no encontrado.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Producto eliminado correctamente.'
            });
        });
    } catch (e) {
        console.error('[eliminarProducto] Fatal:', e);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};