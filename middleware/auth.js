/**
 * middleware/auth.js
 * Middleware de autenticacion con JWT
 * Verifica que el usuario haya iniciado sesion antes de acceder a las rutas
 * Angel De La Rosa - GA4-220501096-AA1-EV02
 */

const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (en produccion iria en variable de entorno)
const CLAVE_SECRETA = 'clave_secreta_angel_ga4_2024';

/**
 * verificarToken - funcion middleware
 * Se ejecuta antes de cada ruta protegida
 * Si el token es valido, deja pasar la peticion
 * Si no hay token o es invalido, responde con error 401 o 403
 */
function verificarToken(req, res, next) {
  // El token llega en el header asi: "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Si no hay token, acceso denegado
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Debes iniciar sesion primero.'
    });
  }

  // Verificar que el token sea valido y no haya expirado
  try {
    const usuarioDecodificado = jwt.verify(token, CLAVE_SECRETA);
    req.usuario = usuarioDecodificado; // adjunto los datos del usuario a la peticion
    next(); // todo bien, continuar con la ruta
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token invalido o expirado. Por favor inicia sesion nuevamente.'
    });
  }
}

module.exports = { verificarToken, CLAVE_SECRETA };
