import express from 'express';
import {
    listarRepartidores,
    agregarRepartidor,
    editarRepartidor,
    eliminarRepartidor
} from '../controllers/repartidorController.js';

const router = express.Router();

// Ruta para listar todos los repartidores
router.post('/listar', listarRepartidores);

// Ruta para agregar un nuevo repartidor
router.post('/agregar', agregarRepartidor);

// Ruta para editar un repartidor existente
router.post('/editar', editarRepartidor);

// Ruta para eliminar (desactivar) un repartidor
router.post('/eliminar', eliminarRepartidor);

export default router;
