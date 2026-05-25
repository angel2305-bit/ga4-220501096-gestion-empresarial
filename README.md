# Evidencia GA4-220501096-AA1-EV02
## Aplicación Web Funcional — Gestión Empresarial

---

## 📋 Descripción

Aplicación web full-stack con dos módulos principales:
- **Módulo de Gestión de Usuarios** — CRUD completo
- **Módulo de Productos & Servicios** — CRUD completo

Construida con programación orientada a objetos (POO) en el frontend, API REST en el backend, y persistencia en JSON (simula base de datos).

---

## 🏗️ Arquitectura

```
ga4-app/
├── server.js           ← Servidor Express (Backend)
├── database.js         ← Capa de datos (JSON)
├── routes/
│   ├── users.js        ← Endpoints /api/usuarios
│   └── products.js     ← Endpoints /api/productos
├── public/             ← Frontend (SPA)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── ApiService.js   ← Clase base OOP para HTTP
│       ├── UserModule.js   ← Módulo usuarios (hereda ApiService)
│       ├── ProductModule.js← Módulo productos (hereda ApiService)
│       └── App.js          ← Controlador principal
├── tests/
│   └── test.js         ← Suite de pruebas de integración
├── data/
│   └── database.json   ← Base de datos (se crea automáticamente)
└── package.json
```

---

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js v14 o superior

### Pasos

```bash
# 1. Entrar a la carpeta del proyecto
cd ga4-app

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor
node server.js

# 4. Abrir en el navegador
# http://localhost:3000
```

---

## 🔌 Endpoints de la API

### Usuarios `/api/usuarios`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/usuarios` | Listar todos los usuarios |
| GET    | `/api/usuarios/:id` | Obtener usuario por ID |
| POST   | `/api/usuarios` | Crear nuevo usuario |
| PUT    | `/api/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Eliminar usuario |

### Productos `/api/productos`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/productos` | Listar todos los productos |
| GET    | `/api/productos/:id` | Obtener producto por ID |
| POST   | `/api/productos` | Crear nuevo producto/servicio |
| PUT    | `/api/productos/:id` | Actualizar producto/servicio |
| DELETE | `/api/productos/:id` | Eliminar producto/servicio |

---

## 🧪 Pruebas

```bash
# Con el servidor corriendo en otra terminal:
node tests/test.js
```

Ejecuta 25 pruebas de integración que validan todos los endpoints CRUD.

---

## 🎯 POO Aplicada (Frontend)

- **`ApiService`** — Clase base con métodos genéricos HTTP (GET, POST, PUT, DELETE)
- **`UserService`** — Hereda de `ApiService`, especializada en usuarios
- **`ProductService`** — Hereda de `ApiService`, especializada en productos
- **`UserModule`** — Módulo con estado (patrón IIFE/Singleton)
- **`ProductModule`** — Módulo con estado (patrón IIFE/Singleton)
- **`Toast`** — Clase utilitaria para notificaciones
- **`Modal`** — Clase utilitaria para diálogos

---

## 👤 Autor
Evidencia individual — Programa: Análisis y Desarrollo de Software — SENA
