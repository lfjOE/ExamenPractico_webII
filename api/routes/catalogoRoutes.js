import express from 'express';
import { obtenerProductos } from '../controllers/catalogoController';

const router = express.Router();

router.get('/productos', obtenerProductos);
export default router;