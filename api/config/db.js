import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar', err);
    return;
  } else {
    console.log('Conectado');
    db.query('SET NAMES utf8mb4');
  }
});

export default db;
