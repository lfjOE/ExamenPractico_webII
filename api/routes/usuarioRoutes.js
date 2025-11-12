import express from 'express';
import { registrarUsuario, loginUsuario, recoverPassword, resetPassword } from '../controllers/usuarioController.js';

const router = express.Router();

router.post('/registrar', registrarUsuario);
router.post('/login', loginUsuario);
router.get('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);

export default router;
