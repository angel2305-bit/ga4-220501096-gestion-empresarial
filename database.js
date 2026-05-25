/**
 * database.js
 * Manejo de datos con un archivo JSON como base de datos
 * Angel De La Rosa - GA4-220501096-AA1-EV02
 */

const fs = require('fs');
const path = require('path');

// Ruta donde se guarda el archivo de la base de datos
const DB_PATH = path.join(__dirname, 'data', 'database.json');

// Datos iniciales cuando la base de datos no existe
const DATOS_INICIALES = {
  usuarios: [
    {
      id: 1,
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@empresa.com',
      password: 'admin123',
      rol: 'admin',
      telefono: '3001234567',
      activo: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    },
    {
      id: 2,
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan@empresa.com',
      password: 'juan123',
      rol: 'usuario',
      telefono: '3109876543',
      activo: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    }
  ],
  productos: [
    {
      id: 1,
      nombre: 'Desarrollo Web',
      descripcion: 'Creacion de aplicaciones web a medida',
      categoria: 'Servicio',
      precio: 2500000,
      stock: 999,
      activo: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    },
    {
      id: 2,
      nombre: 'Consultoria TI',
      descripcion: 'Asesoria en infraestructura tecnologica',
      categoria: 'Servicio',
      precio: 1800000,
      stock: 999,
      activo: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    },
    {
      id: 3,
      nombre: 'Laptop HP Pavilion',
      descripcion: 'Portatil HP Pavilion 15, Intel Core i5, 8GB RAM, 512GB SSD',
      categoria: 'Producto',
      precio: 3200000,
      stock: 15,
      activo: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    }
  ],
  meta: {
    ultimoIdUsuario: 2,
    ultimoIdProducto: 3
  }
};

class BaseDeDatos {
  constructor() {
    this._crearCarpetaData();
    this._inicializarDB();
  }

  // Crea la carpeta data/ si no existe
  _crearCarpetaData() {
    const carpeta = path.join(__dirname, 'data');
    if (!fs.existsSync(carpeta)) {
      fs.mkdirSync(carpeta, { recursive: true });
    }
  }

  // Si el archivo no existe, lo crea con los datos iniciales
  _inicializarDB() {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DATOS_INICIALES, null, 2));
      console.log('Base de datos creada con datos de ejemplo');
    }
  }

  // Lee el archivo JSON y lo devuelve como objeto
  _leer() {
    const contenido = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(contenido);
  }

  // Guarda el objeto como JSON en el archivo
  _guardar(datos) {
    fs.writeFileSync(DB_PATH, JSON.stringify(datos, null, 2));
  }

  // ── USUARIOS ──────────────────────────────────────────────────

  getAllUsers() {
    // No devuelve el campo password por seguridad
    return this._leer().usuarios.map(u => {
      const { password, ...sinPassword } = u;
      return sinPassword;
    });
  }

  getUserById(id) {
    const usuario = this._leer().usuarios.find(u => u.id === parseInt(id));
    if (!usuario) return null;
    const { password, ...sinPassword } = usuario;
    return sinPassword;
  }

  getUserByEmail(email) {
    // Esta funcion si devuelve el password, para verificarlo en el login
    return this._leer().usuarios.find(u => u.email === email) || null;
  }

  createUser(datos) {
    const db = this._leer();
    db.meta.ultimoIdUsuario += 1;
    const nuevoUsuario = {
      id: db.meta.ultimoIdUsuario,
      ...datos,
      password: datos.password || '123456',
      activo: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };
    db.usuarios.push(nuevoUsuario);
    this._guardar(db);
    // devuelvo sin password
    const { password, ...sinPassword } = nuevoUsuario;
    return sinPassword;
  }

  updateUser(id, datos) {
    const db = this._leer();
    const indice = db.usuarios.findIndex(u => u.id === parseInt(id));
    if (indice === -1) return null;
    db.usuarios[indice] = {
      ...db.usuarios[indice],
      ...datos,
      id: parseInt(id),
      actualizadoEn: new Date().toISOString()
    };
    this._guardar(db);
    const { password, ...sinPassword } = db.usuarios[indice];
    return sinPassword;
  }

  deleteUser(id) {
    const db = this._leer();
    const indice = db.usuarios.findIndex(u => u.id === parseInt(id));
    if (indice === -1) return false;
    db.usuarios.splice(indice, 1);
    this._guardar(db);
    return true;
  }

  // ── PRODUCTOS ─────────────────────────────────────────────────

  getAllProducts() {
    return this._leer().productos;
  }

  getProductById(id) {
    return this._leer().productos.find(p => p.id === parseInt(id)) || null;
  }

  createProduct(datos) {
    const db = this._leer();
    db.meta.ultimoIdProducto += 1;
    const nuevoProducto = {
      id: db.meta.ultimoIdProducto,
      ...datos,
      activo: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };
    db.productos.push(nuevoProducto);
    this._guardar(db);
    return nuevoProducto;
  }

  updateProduct(id, datos) {
    const db = this._leer();
    const indice = db.productos.findIndex(p => p.id === parseInt(id));
    if (indice === -1) return null;
    db.productos[indice] = {
      ...db.productos[indice],
      ...datos,
      id: parseInt(id),
      actualizadoEn: new Date().toISOString()
    };
    this._guardar(db);
    return db.productos[indice];
  }

  deleteProduct(id) {
    const db = this._leer();
    const indice = db.productos.findIndex(p => p.id === parseInt(id));
    if (indice === -1) return false;
    db.productos.splice(indice, 1);
    this._guardar(db);
    return true;
  }
}

module.exports = new BaseDeDatos();
