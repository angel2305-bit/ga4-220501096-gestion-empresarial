/**
 * tests/test.js
 * Suite de Pruebas — Evidencia GA4-220501096-AA1-EV02
 * Pruebas de integración para la API REST
 *
 * Ejecutar: node tests/test.js
 * (El servidor debe estar corriendo en puerto 3000)
 */

const http = require('http');

// ─── CONFIGURACIÓN ────────────────────────────────────────────
const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;
let createdUserId = null;
let createdProductId = null;

// ─── HELPERS ──────────────────────────────────────────────────
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const opts = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(opts, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS — ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL — ${testName}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

// ─── TESTS ────────────────────────────────────────────────────
async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  🧪 SUITE DE PRUEBAS — GA4-220501096-AA1-EV02');
  console.log('═══════════════════════════════════════════════════════\n');

  // ── 1. API Health ──────────────────────────────────────────
  console.log('📡 [1] Prueba de conexión a la API');
  try {
    const res = await request('GET', '/api');
    assert(res.status === 200, 'GET /api responde con 200');
    assert(res.body.success === true, 'Respuesta tiene success: true');
    assert(typeof res.body.endpoints === 'object', 'Respuesta incluye endpoints');
  } catch (e) {
    console.log('  ❌ FAIL — No se pudo conectar al servidor. ¿Está corriendo?');
    failed += 3;
    return _summary();
  }

  // ── 2. USUARIOS — GET ALL ──────────────────────────────────
  console.log('\n👤 [2] Módulo de Usuarios — GET ALL');
  const usersAll = await request('GET', '/api/usuarios');
  assert(usersAll.status === 200, 'GET /api/usuarios → 200');
  assert(Array.isArray(usersAll.body.data), 'Respuesta.data es un arreglo');
  assert(typeof usersAll.body.total === 'number', 'Respuesta incluye total');

  // ── 3. USUARIOS — CREATE ───────────────────────────────────
  console.log('\n👤 [3] Módulo de Usuarios — CREATE');
  const newUser = {
    nombre: 'María',
    apellido: 'Gómez',
    email: `test.${Date.now()}@sena.edu.co`,
    rol: 'usuario',
    telefono: '3155555555'
  };

  const created = await request('POST', '/api/usuarios', newUser);
  assert(created.status === 201, 'POST /api/usuarios → 201');
  assert(created.body.data?.id !== undefined, 'Usuario creado tiene ID');
  assert(created.body.data?.nombre === newUser.nombre, 'Nombre guardado correctamente');
  createdUserId = created.body.data?.id;

  // ── 4. USUARIOS — GET BY ID ───────────────────────────────
  console.log('\n👤 [4] Módulo de Usuarios — GET BY ID');
  const getOne = await request('GET', `/api/usuarios/${createdUserId}`);
  assert(getOne.status === 200, `GET /api/usuarios/${createdUserId} → 200`);
  assert(getOne.body.data?.email === newUser.email, 'Email coincide con el creado');

  // ── 5. USUARIOS — UPDATE ──────────────────────────────────
  console.log('\n👤 [5] Módulo de Usuarios — UPDATE');
  const updated = await request('PUT', `/api/usuarios/${createdUserId}`, { telefono: '3209999999', rol: 'admin' });
  assert(updated.status === 200, `PUT /api/usuarios/${createdUserId} → 200`);
  assert(updated.body.data?.telefono === '3209999999', 'Teléfono actualizado correctamente');
  assert(updated.body.data?.rol === 'admin', 'Rol actualizado correctamente');

  // ── 6. USUARIOS — Validación email duplicado ───────────────
  console.log('\n👤 [6] Módulo de Usuarios — Validaciones');
  const dupEmail = await request('POST', '/api/usuarios', { ...newUser });
  assert(dupEmail.status === 409, 'Email duplicado retorna 409 Conflict');

  const missingFields = await request('POST', '/api/usuarios', { nombre: 'Solo' });
  assert(missingFields.status === 400, 'Campos faltantes retornan 400 Bad Request');

  const notFound = await request('GET', '/api/usuarios/999999');
  assert(notFound.status === 404, 'ID inexistente retorna 404 Not Found');

  // ── 7. USUARIOS — DELETE ──────────────────────────────────
  console.log('\n👤 [7] Módulo de Usuarios — DELETE');
  const deleted = await request('DELETE', `/api/usuarios/${createdUserId}`);
  assert(deleted.status === 200, `DELETE /api/usuarios/${createdUserId} → 200`);
  assert(deleted.body.success === true, 'Respuesta confirma eliminación');

  const afterDelete = await request('GET', `/api/usuarios/${createdUserId}`);
  assert(afterDelete.status === 404, 'Usuario eliminado ya no existe (404)');

  // ══════════════════════════════════════════════════════════
  // ── 8. PRODUCTOS — GET ALL ─────────────────────────────────
  console.log('\n📦 [8] Módulo de Productos — GET ALL');
  const prodsAll = await request('GET', '/api/productos');
  assert(prodsAll.status === 200, 'GET /api/productos → 200');
  assert(Array.isArray(prodsAll.body.data), 'Respuesta.data es un arreglo');

  // ── 9. PRODUCTOS — CREATE ──────────────────────────────────
  console.log('\n📦 [9] Módulo de Productos — CREATE');
  const newProd = {
    nombre: 'Soporte Técnico',
    descripcion: 'Servicio de soporte técnico remoto y presencial',
    categoria: 'Servicio',
    precio: 150000,
    stock: 999
  };

  const prodCreated = await request('POST', '/api/productos', newProd);
  assert(prodCreated.status === 201, 'POST /api/productos → 201');
  assert(prodCreated.body.data?.id !== undefined, 'Producto creado tiene ID');
  assert(prodCreated.body.data?.precio === 150000, 'Precio guardado correctamente');
  createdProductId = prodCreated.body.data?.id;

  // ── 10. PRODUCTOS — GET BY ID ──────────────────────────────
  console.log('\n📦 [10] Módulo de Productos — GET BY ID');
  const getProd = await request('GET', `/api/productos/${createdProductId}`);
  assert(getProd.status === 200, `GET /api/productos/${createdProductId} → 200`);
  assert(getProd.body.data?.nombre === newProd.nombre, 'Nombre del producto correcto');

  // ── 11. PRODUCTOS — UPDATE ─────────────────────────────────
  console.log('\n📦 [11] Módulo de Productos — UPDATE');
  const updProd = await request('PUT', `/api/productos/${createdProductId}`, { precio: 200000 });
  assert(updProd.status === 200, `PUT /api/productos/${createdProductId} → 200`);
  assert(updProd.body.data?.precio === 200000, 'Precio actualizado correctamente');

  // ── 12. PRODUCTOS — Validaciones ───────────────────────────
  console.log('\n📦 [12] Módulo de Productos — Validaciones');
  const missingProd = await request('POST', '/api/productos', { nombre: 'Incompleto' });
  assert(missingProd.status === 400, 'Producto con campos faltantes → 400');

  const invalidPrice = await request('POST', '/api/productos', { ...newProd, nombre:'X', precio: -100 });
  assert(invalidPrice.status === 400, 'Precio negativo → 400');

  const notFoundProd = await request('GET', '/api/productos/888888');
  assert(notFoundProd.status === 404, 'Producto ID inexistente → 404');

  // ── 13. PRODUCTOS — DELETE ─────────────────────────────────
  console.log('\n📦 [13] Módulo de Productos — DELETE');
  const delProd = await request('DELETE', `/api/productos/${createdProductId}`);
  assert(delProd.status === 200, `DELETE /api/productos/${createdProductId} → 200`);

  const afterDelProd = await request('GET', `/api/productos/${createdProductId}`);
  assert(afterDelProd.status === 404, 'Producto eliminado → 404');

  _summary();
}

function _summary() {
  const total = passed + failed;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  📊 RESULTADO FINAL`);
  console.log(`  ✅ Pasadas: ${passed} / ${total}`);
  console.log(`  ❌ Fallidas: ${failed} / ${total}`);
  console.log(`  📈 Porcentaje de éxito: ${pct}%`);
  if (pct === 100) {
    console.log('\n  🎉 ¡Todas las pruebas pasaron exitosamente!');
  } else if (pct >= 80) {
    console.log('\n  ⚠️  La mayoría de pruebas pasaron. Revise las fallidas.');
  } else {
    console.log('\n  🔴 Varias pruebas fallaron. Verifique que el servidor esté corriendo.');
  }
  console.log('═══════════════════════════════════════════════════════\n');
}

runTests().catch(err => {
  console.error('\n❌ Error crítico al ejecutar las pruebas:', err.message);
  console.error('   Asegúrese de que el servidor esté corriendo: node server.js\n');
});
