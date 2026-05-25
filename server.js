/**
 * server.js
 * Servidor principal de la aplicacion
 * Angel De La Rosa - GA4-220501096-AA1-EV02
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Importo las rutas
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');

// Importo el middleware de autenticacion
const { verificarToken } = require('./middleware/auth');

const app = express();
const PUERTO = process.env.PORT || 3000;

// ── MIDDLEWARES ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Servir los archivos del frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ── RUTAS PUBLICAS (no requieren login) ───────────────────────
app.use('/api/auth', authRouter);

// Ruta de verificacion del servidor
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    version: '2.0.0',
    nota: 'Las rutas de usuarios y productos requieren autenticacion'
  });
});

// ── RUTAS PROTEGIDAS (requieren token JWT) ────────────────────
// El middleware verificarToken se ejecuta antes de cada ruta
app.use('/api/usuarios',  verificarToken, usersRouter);
app.use('/api/productos', verificarToken, productsRouter);

// Todas las demas rutas muestran el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── MANEJO DE ERRORES ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ── INICIAR SERVIDOR ──────────────────────────────────────────
app.listen(PUERTO, () => {
  console.log('================================================');
  console.log('  Servidor iniciado correctamente');
  console.log(`  URL: http://localhost:${PUERTO}`);
  console.log(`  API: http://localhost:${PUERTO}/api`);
  console.log('  Rutas publicas:   POST /api/auth/login');
  console.log('  Rutas protegidas: /api/usuarios, /api/productos');
  console.log('================================================');
});

module.exports = app;
