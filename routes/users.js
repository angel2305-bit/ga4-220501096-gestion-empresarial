/**
 * routes/users.js
 * Rutas REST para el módulo de Gestión de Usuarios
 * CRUD completo: GET, POST, PUT, DELETE
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

// ─── GET /api/usuarios ─── Obtener todos los usuarios
router.get('/', (req, res) => {
  try {
    const users = db.getAllUsers();
    res.json({
      success: true,
      total: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
  }
});

// ─── GET /api/usuarios/:id ─── Obtener usuario por ID
router.get('/:id', (req, res) => {
  try {
    const user = db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: `Usuario con ID ${req.params.id} no encontrado` });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuario', error: error.message });
  }
});

// ─── POST /api/usuarios ─── Crear nuevo usuario
router.post('/', (req, res) => {
  try {
    const { nombre, apellido, email, rol, telefono } = req.body;

    // Validaciones
    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, apellido y email son obligatorios'
      });
    }

    // Verificar email único
    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese email' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'El formato del email no es válido' });
    }

    const newUser = db.createUser({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.toLowerCase().trim(),
      rol: rol || 'usuario',
      telefono: telefono || ''
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear usuario', error: error.message });
  }
});

// ─── PUT /api/usuarios/:id ─── Actualizar usuario
router.put('/:id', (req, res) => {
  try {
    const { nombre, apellido, email, rol, telefono, activo } = req.body;
    const id = req.params.id;

    // Verificar que existe
    const existing = db.getUserById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Usuario con ID ${id} no encontrado` });
    }

    // Si cambia el email, verificar que no esté en uso
    if (email && email !== existing.email) {
      const emailUser = db.getUserByEmail(email);
      if (emailUser && emailUser.id !== parseInt(id)) {
        return res.status(409).json({ success: false, message: 'Ese email ya está en uso por otro usuario' });
      }
    }

    const updated = db.updateUser(id, {
      nombre: nombre || existing.nombre,
      apellido: apellido || existing.apellido,
      email: email ? email.toLowerCase().trim() : existing.email,
      rol: rol || existing.rol,
      telefono: telefono !== undefined ? telefono : existing.telefono,
      activo: activo !== undefined ? activo : existing.activo
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: error.message });
  }
});

// ─── DELETE /api/usuarios/:id ─── Eliminar usuario
router.delete('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.getUserById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Usuario con ID ${id} no encontrado` });
    }

    db.deleteUser(id);
    res.json({
      success: true,
      message: `Usuario "${existing.nombre} ${existing.apellido}" eliminado exitosamente`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar usuario', error: error.message });
  }
});

module.exports = router;
