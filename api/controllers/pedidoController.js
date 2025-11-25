import db from '../config/db.js';

function normalizarLineas(productos) {
  const m = new Map();
  for (const p of productos || []) {
    const id = Number(p.id_producto ?? p.fk_producto ?? p.id);
    const cant = Number(p.cantidad ?? 1);
    if (!id || !cant) continue;
    m.set(id, (m.get(id) || 0) + cant);
  }
  return Array.from(m.entries()).map(([id_producto, cantidad]) => ({ id_producto, cantidad }));
}

export const crearPedido = async (req, res) => {
  const { user_id, productos, repartidor_id } = req.body || {};

  if (!user_id || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'user_id y productos son requeridos' });
  }

  const lineas = normalizarLineas(productos);
  if (lineas.length === 0) return res.status(400).json({ error: 'Sin productos válidos' });

  const repId = 2;

  // Obtenemos una conexión dedicada para la transacción
  // Usamos .promise() para poder usar async/await, lo cual simplifica enormemente el manejo de errores
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // 1. Crear el pedido
    const sqlPedido = 'INSERT INTO pedido (fk_usuario, fk_repartidor) VALUES (?, ?)';
    const [resultPedido] = await connection.query(sqlPedido, [user_id, repId]);
    const pedidoId = resultPedido.insertId;

    // 2. Insertar líneas de pedido
    const values = lineas.map(l => [pedidoId, l.cantidad, l.id_producto]);
    const sqlLineas = 'INSERT INTO productopedido (fk_pedido, cantprod, fk_producto) VALUES ?';
    await connection.query(sqlLineas, [values]);

    // 3. Actualizar inventario (secuencialmente para evitar condiciones de carrera)
    const sqlUpd = 'UPDATE producto SET cantidad = GREATEST(cantidad - ?, 0) WHERE id_producto = ?';
    for (const l of lineas) {
      await connection.query(sqlUpd, [l.cantidad, l.id_producto]);
    }

    // Si todo salió bien, confirmamos la transacción
    await connection.commit();

    res.status(201).json({ ok: true, id_pedido: pedidoId });

  } catch (error) {
    console.error('Error en crearPedido:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }
    res.status(500).json({ error: 'Error al procesar el pedido' });
  } finally {
    if (connection) connection.release();
  }
};
