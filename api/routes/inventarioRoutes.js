import express from 'express';
import { obtenerInventario, agregarProducto, editarProducto, eliminarProducto } from '../controllers/inventarioController.js';
const router = express.Router();

router.get('/inventario', obtenerInventario)
router.post('/agregar', agregarProducto)
router.post("/editar", editarProducto)
router.post("/eliminar", eliminarProducto)

export default router;
