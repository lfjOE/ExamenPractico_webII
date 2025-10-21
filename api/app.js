import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogoRoutes from './routes/catalogoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import { ensureKeysOnBoot } from './config/crypto/keyManager.js';

dotenv.config();
const app = express();

ensureKeysOnBoot();

app.use(cors());
app.use(express.json());
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/usuarios', usuarioRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
