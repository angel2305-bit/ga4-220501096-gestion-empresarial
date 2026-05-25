/**
 * App.js
 * Controlador principal de la aplicacion
 * Maneja la navegacion entre modulos y la autenticacion
 * Angel De La Rosa - GA4-220501096-AA1-EV02
 */

const App = (() => {

  // Modulos disponibles en la aplicacion
  const MODULOS = {
    dashboard: { titulo: 'Dashboard',             cargar: null },
    usuarios:  { titulo: 'Gestion de Usuarios',   cargar: () => UserModule.load() },
    productos: { titulo: 'Productos & Servicios', cargar: () => ProductModule.load() }
  };

  // ── INICIO DE SESION ────────────────────────────────────────

  async function iniciarSesion(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const datos = await res.json();

      if (!datos.success) {
        mostrarErrorLogin(datos.message);
        return;
      }

      // Guardo el token y los datos del usuario
      localStorage.setItem('token', datos.token);
      localStorage.setItem('usuario', JSON.stringify(datos.usuario));

      // Muestro la app principal
      mostrarApp(datos.usuario);

    } catch (error) {
      mostrarErrorLogin('Error de conexion con el servidor');
    }
  }

  // ── CIERRE DE SESION ────────────────────────────────────────

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    mostrarLogin();
  }

  // ── NAVEGACION ENTRE MODULOS ────────────────────────────────

  function navegar(modulo) {
    if (!MODULOS[modulo]) return;

    // Marco el boton activo en el menu
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === modulo);
    });

    // Cambio el titulo del header
    document.getElementById('pageTitle').textContent = MODULOS[modulo].titulo;

    // Muestro la seccion correspondiente
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + modulo).classList.add('active');

    // Cargo los datos del modulo si tiene funcion de carga
    if (MODULOS[modulo].cargar) {
      MODULOS[modulo].cargar();
    }
  }

  // ── MOSTRAR PANTALLA DE LOGIN ───────────────────────────────

  function mostrarLogin() {
    document.getElementById('pantallaLogin').style.display = 'flex';
    document.getElementById('appPrincipal').style.display = 'none';
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  }

  // ── MOSTRAR APP PRINCIPAL ───────────────────────────────────

  async function mostrarApp(usuario) {
    document.getElementById('pantallaLogin').style.display = 'none';
    document.getElementById('appPrincipal').style.display = 'flex';

    // Muestro el nombre del usuario logueado
    document.getElementById('nombreUsuario').textContent =
      usuario.nombre + ' (' + usuario.rol + ')';

    // Cargo las estadisticas del dashboard
    await _cargarDashboard();

    navegar('dashboard');
  }

  // ── ESTADISTICAS DEL DASHBOARD ──────────────────────────────

  async function _cargarDashboard() {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': 'Bearer ' + token };

      const [resUsuarios, resProductos] = await Promise.all([
        fetch('/api/usuarios',  { headers }).then(r => r.json()),
        fetch('/api/productos', { headers }).then(r => r.json())
      ]);

      document.getElementById('stat-users').textContent    = resUsuarios.total ?? '0';
      document.getElementById('stat-products').textContent = resProductos.total ?? '0';

      if (resProductos.data) {
        const categorias = new Set(resProductos.data.map(p => p.categoria));
        document.getElementById('stat-cats').textContent = categorias.size;
      }
    } catch (e) {
      console.warn('No se pudo cargar el dashboard:', e.message);
    }
  }

  // ── HELPERS ─────────────────────────────────────────────────

  function mostrarErrorLogin(mensaje) {
    document.getElementById('loginError').textContent = mensaje;
  }

  // ── INICIALIZACION ───────────────────────────────────────────

  async function init() {
    // Reviso si ya hay una sesion guardada
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (token && usuarioGuardado) {
      // Verifico que el token siga siendo valido
      const res = await fetch('/api/auth/verificar', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const datos = await res.json();

      if (datos.success) {
        mostrarApp(JSON.parse(usuarioGuardado));
        return;
      }
    }

    // Si no hay sesion valida, muestro el login
    mostrarLogin();
  }

  // Arranco cuando el DOM este listo
  document.addEventListener('DOMContentLoaded', init);

  // Expongo las funciones que necesitan los otros modulos y el HTML
  return { navegar, iniciarSesion, cerrarSesion };

})();
// Manejo de sesion y token JWT - Angel De La Rosa
