import db from '../config/db.js';

export const obtenerProductos = (req, res) => {
  const sql = "SELECT id_producto, nombre, descripcion, precio, imagen FROM producto WHERE vigente = 1 ORDER BY id_producto";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }
    console.log(results);
    res.json(results);
  });
};