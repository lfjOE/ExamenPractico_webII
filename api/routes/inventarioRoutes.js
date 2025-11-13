import express from 'express';
import { obtenerInventario, agregarProducto, editarProducto } from '../controllers/inventarioController.js';
const router = express.Router();

router.get('/inventario', obtenerInventario)
router.post('/agregar', agregarProducto)
router.post("/editar", editarProducto)
export default router;
