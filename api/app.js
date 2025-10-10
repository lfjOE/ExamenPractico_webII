import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogoRoutes from './routes/catalogoRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => res.send('ok'));
app.use('/api/catalogo', catalogoRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
