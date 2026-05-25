/**
 * UserModule.js
 * Módulo de Gestión de Usuarios
 * Hereda de ApiService — aplica POO (herencia, encapsulamiento)
 */

class UserService extends ApiService {
  constructor() {
    super();
    this.endpoint = '/api/usuarios';
    this._cache = [];
  }

  async fetchAll() {
    const res = await this.getAll(this.endpoint);
    this._cache = res.data;
    return this._cache;
  }

  async fetchById(id)        { return this.getById(this.endpoint, id); }
  async save(data)           { return this.create(this.endpoint, data); }
  async modify(id, data)     { return this.update(this.endpoint, id, data); }
  async remove(id)           { return this.delete(this.endpoint, id); }
  getCache()                 { return this._cache; }
}

/**
 * UserModule — Controlador del módulo de usuarios
 * Patrón: Módulo con estado local
 */
const UserModule = (() => {
  const service = new UserService();
  let _data = [];
  let _editId = null;

  // ─── Render tabla ───────────────────────────────────────────
  function _renderTable(users) {
    const tbody = document.getElementById('usersBody');
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading-row">No se encontraron usuarios.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td><code>#${u.id}</code></td>
        <td><strong>${_esc(u.nombre)} ${_esc(u.apellido)}</strong></td>
        <td>${_esc(u.email)}</td>
        <td><span class="badge badge--${u.rol}">${u.rol}</span></td>
        <td>${_esc(u.telefono || '—')}</td>
        <td><span class="badge badge--${u.activo ? 'active' : 'inactive'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn--warning btn--sm" onclick="UserModule.openForm(${u.id})">✎ Editar</button>
            <button class="btn btn--danger btn--sm" onclick="UserModule.confirmDelete(${u.id}, '${_esc(u.nombre)}')">✕ Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Helper escape HTML
  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── Cargar datos ───────────────────────────────────────────
  async function load() {
    try {
      _data = await service.fetchAll();
      _renderTable(_data);
      _updateDashboard();
    } catch (e) {
      document.getElementById('usersBody').innerHTML =
        `<tr><td colspan="7" class="loading-row" style="color:var(--danger)">Error al cargar usuarios: ${e.message}</td></tr>`;
    }
  }

  function _updateDashboard() {
    const el = document.getElementById('stat-users');
    if (el) el.textContent = _data.length;
  }

  // ─── Filtrar ────────────────────────────────────────────────
  function filter(query) {
    const q = query.toLowerCase();
    const filtered = q
      ? _data.filter(u =>
          u.nombre.toLowerCase().includes(q) ||
          u.apellido.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.rol.toLowerCase().includes(q)
        )
      : _data;
    _renderTable(filtered);
  }

  // ─── Formulario ─────────────────────────────────────────────
  async function openForm(id = null) {
    _editId = id;
    let user = { nombre:'', apellido:'', email:'', rol:'usuario', telefono:'', activo:true };

    if (id) {
      try {
        const res = await service.fetchById(id);
        user = res.data;
      } catch (e) {
        Toast.error('No se pudo cargar el usuario');
        return;
      }
    }

    const title = id ? `Editar Usuario #${id}` : 'Nuevo Usuario';
    const html = `
      <div class="form-grid">
        <div class="form-group">
          <label>Nombre *</label>
          <input id="uNombre" type="text" value="${_esc(user.nombre)}" placeholder="Nombre" required />
        </div>
        <div class="form-group">
          <label>Apellido *</label>
          <input id="uApellido" type="text" value="${_esc(user.apellido)}" placeholder="Apellido" required />
        </div>
        <div class="form-group full">
          <label>Email *</label>
          <input id="uEmail" type="email" value="${_esc(user.email)}" placeholder="correo@ejemplo.com" required />
        </div>
        <div class="form-group">
          <label>Rol</label>
          <select id="uRol">
            <option value="usuario" ${user.rol==='usuario'?'selected':''}>Usuario</option>
            <option value="admin"   ${user.rol==='admin'  ?'selected':''}>Admin</option>
          </select>
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input id="uTelefono" type="text" value="${_esc(user.telefono)}" placeholder="Ej: 3001234567" />
        </div>
        ${id ? `
        <div class="form-group">
          <label>Estado</label>
          <select id="uActivo">
            <option value="true"  ${user.activo?'selected':''}>Activo</option>
            <option value="false" ${!user.activo?'selected':''}>Inactivo</option>
          </select>
        </div>` : ''}
      </div>
      <div class="form-actions">
        <button class="btn btn--ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn--primary" onclick="UserModule.save()">
          ${id ? '💾 Guardar Cambios' : '✚ Crear Usuario'}
        </button>
      </div>
    `;
    Modal.open(title, html);
  }

  // ─── Guardar (Create / Update) ──────────────────────────────
  async function save() {
    const nombre   = document.getElementById('uNombre').value.trim();
    const apellido = document.getElementById('uApellido').value.trim();
    const email    = document.getElementById('uEmail').value.trim();
    const rol      = document.getElementById('uRol').value;
    const telefono = document.getElementById('uTelefono').value.trim();
    const activoEl = document.getElementById('uActivo');
    const activo   = activoEl ? activoEl.value === 'true' : true;

    if (!nombre || !apellido || !email) {
      Toast.error('Nombre, apellido y email son obligatorios');
      return;
    }

    const payload = { nombre, apellido, email, rol, telefono, activo };

    try {
      if (_editId) {
        await service.modify(_editId, payload);
        Toast.success(`Usuario actualizado exitosamente`);
      } else {
        await service.save(payload);
        Toast.success('Usuario creado exitosamente');
      }
      Modal.close();
      await load();
    } catch (e) {
      Toast.error(e.message);
    }
  }

  // ─── Confirmar eliminación ──────────────────────────────────
  function confirmDelete(id, nombre) {
    const html = `
      <p style="margin-bottom:20px;color:var(--text2)">
        ¿Está seguro de que desea eliminar al usuario <strong style="color:var(--text)">${_esc(nombre)}</strong>?
        Esta acción no se puede deshacer.
      </p>
      <div class="form-actions">
        <button class="btn btn--ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn--danger" onclick="UserModule.remove(${id})">Eliminar</button>
      </div>
    `;
    Modal.open('Confirmar Eliminación', html);
  }

  // ─── Eliminar ───────────────────────────────────────────────
  async function remove(id) {
    try {
      const res = await service.remove(id);
      Toast.success(res.message);
      Modal.close();
      await load();
    } catch (e) {
      Toast.error(e.message);
    }
  }

  // API pública del módulo
  return { load, filter, openForm, save, confirmDelete, remove };
})();
