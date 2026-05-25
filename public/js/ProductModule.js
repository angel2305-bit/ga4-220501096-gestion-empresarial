/**
 * ProductModule.js
 * Módulo de Gestión de Productos y Servicios
 * Hereda de ApiService — aplica POO (herencia, encapsulamiento)
 */

class ProductService extends ApiService {
  constructor() {
    super();
    this.endpoint = '/api/productos';
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
 * ProductModule — Controlador del módulo de productos/servicios
 */
const ProductModule = (() => {
  const service = new ProductService();
  let _data = [];
  let _editId = null;
  let _catFilter = '';

  // ─── Formatear precio ───────────────────────────────────────
  function _fmt(num) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
  }

  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── Render tabla ───────────────────────────────────────────
  function _renderTable(products) {
    const tbody = document.getElementById('productsBody');
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading-row">No se encontraron productos o servicios.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td><code>#${p.id}</code></td>
        <td><strong>${_esc(p.nombre)}</strong></td>
        <td><span class="badge badge--cat">${_esc(p.categoria)}</span></td>
        <td><strong style="color:var(--accent2)">${_fmt(p.precio)}</strong></td>
        <td>${p.stock >= 999 ? '<span style="color:var(--text2)">∞</span>' : p.stock}</td>
        <td><span class="badge badge--${p.activo ? 'active' : 'inactive'}">${p.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn--warning btn--sm" onclick="ProductModule.openForm(${p.id})">✎ Editar</button>
            <button class="btn btn--danger btn--sm" onclick="ProductModule.confirmDelete(${p.id}, '${_esc(p.nombre)}')">✕ Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ─── Cargar datos ───────────────────────────────────────────
  async function load() {
    try {
      _data = await service.fetchAll();
      _renderTable(_data);
      _updateDashboard();
    } catch (e) {
      document.getElementById('productsBody').innerHTML =
        `<tr><td colspan="7" class="loading-row" style="color:var(--danger)">Error al cargar productos: ${e.message}</td></tr>`;
    }
  }

  function _updateDashboard() {
    const elProd = document.getElementById('stat-products');
    const elCats = document.getElementById('stat-cats');
    if (elProd) elProd.textContent = _data.length;
    if (elCats) {
      const cats = new Set(_data.map(p => p.categoria));
      elCats.textContent = cats.size;
    }
  }

  // ─── Filtrar por texto ──────────────────────────────────────
  function filter(query) {
    const q = query.toLowerCase();
    _applyFilters(q, _catFilter);
  }

  // ─── Filtrar por categoría ──────────────────────────────────
  function filterCat(cat) {
    _catFilter = cat;
    const search = document.getElementById('searchProducts').value.toLowerCase();
    _applyFilters(search, cat);
  }

  function _applyFilters(query, cat) {
    let filtered = _data;
    if (query) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query)
      );
    }
    if (cat) {
      filtered = filtered.filter(p => p.categoria === cat);
    }
    _renderTable(filtered);
  }

  // ─── Formulario ─────────────────────────────────────────────
  async function openForm(id = null) {
    _editId = id;
    let p = { nombre:'', descripcion:'', categoria:'Producto', precio:'', stock:0, activo:true };

    if (id) {
      try {
        const res = await service.fetchById(id);
        p = res.data;
      } catch (e) {
        Toast.error('No se pudo cargar el producto');
        return;
      }
    }

    const title = id ? `Editar Ítem #${id}` : 'Nuevo Producto / Servicio';
    const html = `
      <div class="form-grid">
        <div class="form-group full">
          <label>Nombre *</label>
          <input id="pNombre" type="text" value="${_esc(p.nombre)}" placeholder="Nombre del producto o servicio" />
        </div>
        <div class="form-group full">
          <label>Descripción *</label>
          <textarea id="pDescripcion" placeholder="Descripción detallada...">${_esc(p.descripcion)}</textarea>
        </div>
        <div class="form-group">
          <label>Categoría *</label>
          <select id="pCategoria">
            <option value="Producto" ${p.categoria==='Producto'?'selected':''}>Producto</option>
            <option value="Servicio" ${p.categoria==='Servicio'?'selected':''}>Servicio</option>
          </select>
        </div>
        <div class="form-group">
          <label>Precio (COP) *</label>
          <input id="pPrecio" type="number" min="0" step="1000" value="${p.precio}" placeholder="0" />
        </div>
        <div class="form-group">
          <label>Stock</label>
          <input id="pStock" type="number" min="0" value="${p.stock}" placeholder="0" />
        </div>
        ${id ? `
        <div class="form-group">
          <label>Estado</label>
          <select id="pActivo">
            <option value="true"  ${p.activo?'selected':''}>Activo</option>
            <option value="false" ${!p.activo?'selected':''}>Inactivo</option>
          </select>
        </div>` : ''}
      </div>
      <div class="form-actions">
        <button class="btn btn--ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn--primary" onclick="ProductModule.save()">
          ${id ? '💾 Guardar Cambios' : '✚ Crear Ítem'}
        </button>
      </div>
    `;
    Modal.open(title, html);
  }

  // ─── Guardar ────────────────────────────────────────────────
  async function save() {
    const nombre      = document.getElementById('pNombre').value.trim();
    const descripcion = document.getElementById('pDescripcion').value.trim();
    const categoria   = document.getElementById('pCategoria').value;
    const precio      = parseFloat(document.getElementById('pPrecio').value);
    const stock       = parseInt(document.getElementById('pStock').value) || 0;
    const activoEl    = document.getElementById('pActivo');
    const activo      = activoEl ? activoEl.value === 'true' : true;

    if (!nombre || !descripcion || isNaN(precio)) {
      Toast.error('Nombre, descripción y precio son obligatorios');
      return;
    }

    const payload = { nombre, descripcion, categoria, precio, stock, activo };

    try {
      if (_editId) {
        await service.modify(_editId, payload);
        Toast.success('Producto/Servicio actualizado');
      } else {
        await service.save(payload);
        Toast.success('Producto/Servicio creado exitosamente');
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
        ¿Está seguro de que desea eliminar <strong style="color:var(--text)">${_esc(nombre)}</strong>?
        Esta acción no se puede deshacer.
      </p>
      <div class="form-actions">
        <button class="btn btn--ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn--danger" onclick="ProductModule.remove(${id})">Eliminar</button>
      </div>
    `;
    Modal.open('Confirmar Eliminación', html);
  }

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

  return { load, filter, filterCat, openForm, save, confirmDelete, remove };
})();
