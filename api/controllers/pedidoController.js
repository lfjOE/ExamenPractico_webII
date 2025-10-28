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

export const crearPedido = (req, res) => {
  const { user_id, productos, repartidor_id } = req.body || {};
  if (!user_id || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'user_id y productos son requeridos' });
  }

  const lineas = normalizarLineas(productos);
  if (lineas.length === 0) return res.status(400).json({ error: 'Sin productos válidos' });

  const repId = Number(repartidor_id ?? 1);

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: 'No se pudo iniciar la transacción' });

    const sqlPedido = 'INSERT INTO pedido (fk_usuario, fk_repartidor) VALUES (?, ?)';
    db.query(sqlPedido, [user_id, repId], (e1, r1) => {
      if (e1) return db.rollback(() => res.status(500).json({ error: 'Error al crear el pedido' }));

      const pedidoId = r1.insertId;
      const values = lineas.map(l => [pedidoId, l.cantidad, l.id_producto]);
      const sqlLineas = 'INSERT INTO productopedido (fk_pedido, cantprod, fk_producto) VALUES ?';

      db.query(sqlLineas, [values], (e2) => {
        if (e2) return db.rollback(() => res.status(500).json({ error: 'Error al crear líneas del pedido' }));

        let pendientes = lineas.length;
        if (pendientes === 0) {
          return db.commit(e3 => {
            if (e3) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la transacción' }));
            res.status(201).json({ ok: true, id_pedido: pedidoId });
          });
        }

        const sqlUpd = 'UPDATE producto SET cantidad = GREATEST(cantidad - ?, 0) WHERE id_producto = ?';
        for (const l of lineas) {
          db.query(sqlUpd, [l.cantidad, l.id_producto], (e4) => {
            if (e4) return db.rollback(() => res.status(500).json({ error: 'Error al actualizar inventario' }));
            pendientes -= 1;
            if (pendientes === 0) {
              db.commit(e5 => {
                if (e5) return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la transacción' }));
                res.status(201).json({ ok: true, id_pedido: pedidoId });
              });
            }
          });
        }
      });
    });
  });
};
