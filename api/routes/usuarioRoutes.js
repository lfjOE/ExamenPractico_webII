import express from 'express';
import { registrarCliente, loginUsuario, recoverPassword, resetPassword, registrarRepartidor } from '../controllers/usuarioController.js';

const router = express.Router();

router.post('/registrar-cliente', registrarCliente);
router.post('/registrar-repartidor', registrarRepartidor);
router.post('/login', loginUsuario);
router.get('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);

export default router;
