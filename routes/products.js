/**
 * routes/products.js
 * Rutas REST para el módulo de Productos/Servicios
 * CRUD completo: GET, POST, PUT, DELETE
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

// ─── GET /api/productos ─── Obtener todos
router.get('/', (req, res) => {
  try {
    let products = db.getAllProducts();

    // Filtros opcionales por query params
    const { categoria, activo, search } = req.query;
    if (categoria) {
      products = products.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }
    if (activo !== undefined) {
      products = products.filter(p => p.activo === (activo === 'true'));
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      total: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener productos', error: error.message });
  }
});

// ─── GET /api/productos/:id ─── Obtener por ID
router.get('/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: `Producto con ID ${req.params.id} no encontrado` });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener producto', error: error.message });
  }
});

// ─── POST /api/productos ─── Crear nuevo
router.post('/', (req, res) => {
  try {
    const { nombre, descripcion, categoria, precio, stock } = req.body;

    // Validaciones
    if (!nombre || !descripcion || !categoria || precio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, descripción, categoría y precio son obligatorios'
      });
    }

    if (isNaN(precio) || parseFloat(precio) < 0) {
      return res.status(400).json({ success: false, message: 'El precio debe ser un número válido mayor o igual a 0' });
    }

    const newProduct = db.createProduct({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria.trim(),
      precio: parseFloat(precio),
      stock: parseInt(stock) || 0
    });

    res.status(201).json({
      success: true,
      message: 'Producto/Servicio creado exitosamente',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear producto', error: error.message });
  }
});

// ─── PUT /api/productos/:id ─── Actualizar
router.put('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Producto con ID ${id} no encontrado` });
    }

    const { nombre, descripcion, categoria, precio, stock, activo } = req.body;

    if (precio !== undefined && (isNaN(precio) || parseFloat(precio) < 0)) {
      return res.status(400).json({ success: false, message: 'El precio debe ser un número válido mayor o igual a 0' });
    }

    const updated = db.updateProduct(id, {
      nombre: nombre || existing.nombre,
      descripcion: descripcion || existing.descripcion,
      categoria: categoria || existing.categoria,
      precio: precio !== undefined ? parseFloat(precio) : existing.precio,
      stock: stock !== undefined ? parseInt(stock) : existing.stock,
      activo: activo !== undefined ? activo : existing.activo
    });

    res.json({
      success: true,
      message: 'Producto/Servicio actualizado exitosamente',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar producto', error: error.message });
  }
});

// ─── DELETE /api/productos/:id ─── Eliminar
router.delete('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Producto con ID ${id} no encontrado` });
    }

    db.deleteProduct(id);
    res.json({
      success: true,
      message: `Producto/Servicio "${existing.nombre}" eliminado exitosamente`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar producto', error: error.message });
  }
});

module.exports = router;
