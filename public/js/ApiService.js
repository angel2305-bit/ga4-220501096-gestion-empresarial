/**
 * ApiService.js
 * Clase base para comunicarse con el servidor
 * Incluye el token JWT en cada peticion automaticamente
 * Angel De La Rosa - GA4-220501096-AA1-EV02
 */

class ApiService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl || window.location.origin;
  }

  // Armo los headers incluyendo el token si existe
  _getHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  }

  // Reviso si la respuesta fue exitosa o hubo error
  async _manejarRespuesta(response) {
    const datos = await response.json();

    // Si el servidor dice que no esta autorizado, cierro sesion
    if (response.status === 401 || response.status === 403) {
      App.cerrarSesion();
      throw new Error('Sesion expirada. Por favor inicia sesion nuevamente.');
    }

    if (!response.ok) {
      throw new Error(datos.message || 'Error en el servidor');
    }
    return datos;
  }

  // GET — obtener todos los registros
  async getAll(endpoint) {
    const res = await fetch(this.baseUrl + endpoint, {
      method: 'GET',
      headers: this._getHeaders()
    });
    return this._manejarRespuesta(res);
  }

  // GET por ID — obtener un registro
  async getById(endpoint, id) {
    const res = await fetch(this.baseUrl + endpoint + '/' + id, {
      method: 'GET',
      headers: this._getHeaders()
    });
    return this._manejarRespuesta(res);
  }

  // POST — crear un nuevo registro
  async create(endpoint, body) {
    const res = await fetch(this.baseUrl + endpoint, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(body)
    });
    return this._manejarRespuesta(res);
  }

  // PUT — actualizar un registro existente
  async update(endpoint, id, body) {
    const res = await fetch(this.baseUrl + endpoint + '/' + id, {
      method: 'PUT',
      headers: this._getHeaders(),
      body: JSON.stringify(body)
    });
    return this._manejarRespuesta(res);
  }

  // DELETE — eliminar un registro
  async delete(endpoint, id) {
    const res = await fetch(this.baseUrl + endpoint + '/' + id, {
      method: 'DELETE',
      headers: this._getHeaders()
    });
    return this._manejarRespuesta(res);
  }
}
