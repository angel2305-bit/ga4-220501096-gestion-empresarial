/**
 * routes/auth.js
 * Ruta de autenticacion: login y logout
 * Genera un token JWT cuando las credenciales son correctas
 * Angel De La Rosa - GA4-220501096-AA1-EV02
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database');
const { CLAVE_SECRETA } = require('../middleware/auth');

// POST /api/auth/login — iniciar sesion
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Verifico que llegaron email y password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'El email y la contraseña son obligatorios'
    });
  }

  // Busco el usuario en la base de datos por email
  const usuario = db.getUserByEmail(email);

  // Si no existe o la contraseña no coincide, rechazo
  if (!usuario || usuario.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Email o contraseña incorrectos'
    });
  }

  // Si el usuario esta desactivado, tampoco puede entrar
  if (!usuario.activo) {
    return res.status(401).json({
      success: false,
      message: 'Tu cuenta esta desactivada. Contacta al administrador.'
    });
  }

  // Todo bien: genero el token JWT con duracion de 2 horas
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    },
    CLAVE_SECRETA,
    { expiresIn: '2h' }
  );

  // Respondo con el token y los datos basicos del usuario
  res.json({
    success: true,
    message: `Bienvenido, ${usuario.nombre}!`,
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol
    }
  });
});

// GET /api/auth/verificar — verificar si el token sigue activo
router.get('/verificar', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.json({ success: false, message: 'No hay token' });
  }

  try {
    const datos = jwt.verify(token, CLAVE_SECRETA);
    res.json({ success: true, usuario: datos });
  } catch {
    res.json({ success: false, message: 'Token invalido o expirado' });
  }
});

module.exports = router;
