/* ───────────── TALLER PMV ───────────── */

let state = {
  clientes: [],
  vehiculos: [],
  citas: [],
  ordenes: [],
  usuario: null,
  csrfToken: ''
};

let currentTab = 'clientes';

// ───────────── AUTH ─────────────
async function checkSession() {
  const r = await fetch('auth/me.php').then(r => r.json());
  if (r.ok) {
    state.usuario = { username: r.username, rol: r.rol };
    state.csrfToken = r.csrf_token || '';
    showApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('user-badge').innerHTML =
    `<span class="badge-rol ${state.usuario.rol}">${state.usuario.rol}</span> ${esc(state.usuario.username)}`;
  init();
}

async function doLogin() {
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  btn.disabled = true;

  const fd = new FormData();
  fd.append('username', document.getElementById('login-user').value.trim());
  fd.append('password', document.getElementById('login-pass').value);

  const r = await fetch('auth/login.php', { method: 'POST', body: fd }).then(r => r.json());

  if (r.ok) {
    state.usuario = { username: r.username, rol: r.rol };
    state.csrfToken = r.csrf_token || '';
    errEl.classList.add('hidden');
    showApp();
  } else {
    errEl.textContent = r.error || 'Error al iniciar sesión';
    errEl.classList.remove('hidden');
    btn.disabled = false;
  }
}

async function doRegistro() {
  const btn = document.getElementById('reg-btn');
  const errEl = document.getElementById('login-error');
  btn.disabled = true;

  const fd = new FormData();
  fd.append('username', document.getElementById('reg-user').value.trim());
  fd.append('password', document.getElementById('reg-pass').value);
  fd.append('telefono', document.getElementById('reg-tel').value.trim());
  fd.append('correo', document.getElementById('reg-correo').value.trim());

  const r = await fetch('auth/registro.php', { method: 'POST', body: fd }).then(r => r.json());

  if (r.ok) {
    state.usuario = { username: r.username, rol: r.rol };
    state.csrfToken = r.csrf_token || '';
    errEl.classList.add('hidden');
    showApp();
  } else {
    errEl.textContent = r.error || 'Error al registrarse';
    errEl.classList.remove('hidden');
    btn.disabled = false;
  }
}

async function doLogout() {
  await fetch('auth/logout.php', { method: 'POST' });
  state.usuario = null;
  state.csrfToken = '';
  showLogin();
}

function toggleAuth(mode) {
  document.getElementById('form-login').classList.toggle('hidden', mode !== 'login');
  document.getElementById('form-registro').classList.toggle('hidden', mode !== 'registro');
  document.getElementById('login-error').classList.add('hidden');
}

// Permitir login/registro con Enter
document.getElementById('login-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'reg-pass') doRegistro();
});

function isAdmin() { return state.usuario?.rol === 'admin'; }

// ───────────── API ─────────────
async function api(url) {
  const res = await fetch(url);
  return res.json();
}

async function post(url, data) {
  const fd = new FormData();
  Object.keys(data).forEach(k => fd.append(k, data[k]));
  fd.append('csrf_token', state.csrfToken);
  const res = await fetch(url, { method: 'POST', body: fd });
  return res.json();
}

async function loadAll() {
  const [clientes, vehiculos, citas, ordenes] = await Promise.all([
    api('clientes/index.php'),
    api('vehiculos/index.php'),
    api('citas/index.php'),
    api('ordenes/index.php')
  ]);
  state.clientes = clientes;
  state.vehiculos = vehiculos;
  state.citas = citas;
  state.ordenes = ordenes;
  updateHeaderStats();
}

// ───────────── INIT ─────────────
async function init() {
  await loadAll();
  renderTab('clientes');
}

checkSession();

// ───────────── HEADER ─────────────
function updateHeaderStats() {
  document.getElementById('header-stats').innerHTML = `
    <span class="stat-chip">${state.clientes.length} clientes</span>
    <span class="stat-chip">${state.vehiculos.length} vehículos</span>
    <span class="stat-chip">${state.ordenes.length} órdenes</span>
  `;
}

// ───────────── TABS ─────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    renderTab(currentTab);
  });
});

function renderTab(tab) {
  const el = document.getElementById('tab-content');
  el.innerHTML = `<div class="loading"><div class="spinner"></div> Cargando...</div>`;
  switch (tab) {
    case 'clientes':  renderClientes();  break;
    case 'vehiculos': renderVehiculos(); break;
    case 'citas':     renderCitas();     break;
    case 'ordenes':   renderOrdenes();   break;
    case 'historial': renderHistorial(); break;
  }
}

// ───────────── HELPERS ─────────────
const esc = s => (s || '').replace(/</g, "&lt;");
function val(id) { return document.getElementById(id).value; }

const COLORS = ['c0','c1','c2','c3','c4'];
function avatarColor(str) { return COLORS[(str||'').charCodeAt(0) % COLORS.length]; }

const SVG = {
  search: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  edit:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  del:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>`,
  bolt:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  car:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h10l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>`,
  cal:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  wrench: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  empty:  `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  save:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  plus:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
};

function openModal(title, body) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }

document.getElementById('modal-close').onclick = closeModal;
document.getElementById('modal-overlay').onclick = e => {
  if (e.target.id === 'modal-overlay') closeModal();
};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2800);
}

function btnDel(onclick) {
  return isAdmin()
    ? `<button class="btn-card del" onclick="${onclick}">${SVG.del} Eliminar</button>`
    : '';
}

function filterList(items, q, fields) {
  if (!q) return items;
  const lq = q.toLowerCase();
  return items.filter(i => fields.some(f => (i[f]||'').toLowerCase().includes(lq)));
}

function emptyState(msg) {
  return `<div class="empty-state">${SVG.empty}<p>${msg}</p></div>`;
}

function searchBar(id, placeholder, oninput) {
  return `<div class="search-wrap">${SVG.search}<input id="${id}" placeholder="${placeholder}" oninput="${oninput}()"></div>`;
}

// ───────────── CLIENTES ─────────────
function renderClientes() {
  const q = document.getElementById('q-clientes')?.value || '';
  const list = filterList(state.clientes, q, ['nombre','telefono','correo']);

  const cards = list.length ? list.map(c => `
    <div class="item-card">
      <div class="card-top">
        <div class="avatar ${avatarColor(c.nombre)}">${c.nombre.charAt(0).toUpperCase()}</div>
        <div class="card-info">
          <div class="card-name">${esc(c.nombre)}</div>
          <div class="card-detail">${esc(c.telefono)}</div>
          <div class="card-detail">${esc(c.correo)}</div>
        </div>
      </div>
      <div class="card-footer">
        ${isAdmin() ? `<button class="btn-card edit" onclick="editCliente(${c.id})">${SVG.edit} Editar</button>` : ''}
        ${btnDel(`deleteCliente(${c.id})`)}
      </div>
    </div>`).join('') : emptyState('No hay clientes registrados');

  document.getElementById('tab-content').innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Clientes</div>
        <div class="section-sub">${state.clientes.length} registrados</div>
      </div>
    </div>
    <div class="toolbar">
      ${searchBar('q-clientes', 'Buscar cliente...', 'renderClientes')}
      <button class="btn-new" onclick="openCliente()">${SVG.plus} Nuevo cliente</button>
    </div>
    <div class="cards-grid">${cards}</div>`;
}

function openCliente(id, nombre, telefono, correo) {
  openModal(id ? 'Editar cliente' : 'Nuevo cliente', `
    <input type="hidden" id="cliente_edit_id" value="${id||''}">
    <div class="form-group"><label>Nombre completo</label>
      <input id="nombre" placeholder="Ej: Juan Pérez" value="${esc(nombre||'')}"></div>
    <div class="form-row">
      <div class="form-group"><label>Teléfono</label>
        <input id="telefono" placeholder="7777-1234" value="${esc(telefono||'')}"></div>
      <div class="form-group"><label>Correo electrónico</label>
        <input id="correo" type="email" placeholder="correo@ejemplo.com" value="${esc(correo||'')}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="saveCliente()">${SVG.save} Guardar</button>
    </div>`);
}

function editCliente(id) {
  const c = state.clientes.find(x => x.id == id);
  if (c) openCliente(c.id, c.nombre, c.telefono, c.correo);
}

async function saveCliente() {
  const id = val('cliente_edit_id');
  const r = await post('clientes/guardar.php', { id: id||0, nombre: val('nombre'), telefono: val('telefono'), correo: val('correo') });
  if (r.ok) { closeModal(); await loadAll(); renderTab('clientes'); toast('Cliente guardado correctamente'); }
  else toast(r.error || 'Error al guardar');
}

async function deleteCliente(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  const r = await post('clientes/eliminar.php', { id });
  if (r.ok) { await loadAll(); renderTab('clientes'); toast('Cliente eliminado'); }
  else toast(r.error || 'Sin permisos');
}

// ───────────── VEHÍCULOS ─────────────
function renderVehiculos() {
  const q = document.getElementById('q-vehiculos')?.value || '';
  const list = filterList(state.vehiculos, q, ['marca','modelo','placa']);
  const clienteNombre = id => (state.clientes.find(c => c.id == id)||{}).nombre || 'N/A';

  const cards = list.length ? list.map(v => `
    <div class="item-card">
      <div class="card-top">
        <div class="avatar auto">${SVG.car}</div>
        <div class="card-info">
          <div class="card-name">${esc(v.marca)} ${esc(v.modelo)}</div>
          <div class="card-detail">Placa: ${esc(v.placa)}</div>
          <div class="card-detail">Cliente: ${esc(clienteNombre(v.cliente_id))}</div>
        </div>
      </div>
      <div class="card-footer">
        ${btnDel(`deleteVehiculo(${v.id})`)}
      </div>
    </div>`).join('') : emptyState('No hay vehículos registrados');

  document.getElementById('tab-content').innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Vehículos</div>
        <div class="section-sub">${state.vehiculos.length} registrados</div>
      </div>
    </div>
    <div class="toolbar">
      ${searchBar('q-vehiculos', 'Buscar vehículo...', 'renderVehiculos')}
      <button class="btn-new" onclick="openVehiculo()">${SVG.plus} Nuevo vehículo</button>
    </div>
    <div class="cards-grid">${cards}</div>`;
}

function openVehiculo() {
  const opts = state.clientes.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
  openModal('Nuevo vehículo', `
    <div class="form-group"><label>Propietario</label>
      <select id="v_cliente_id"><option value="">Selecciona un cliente</option>${opts}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Marca</label><input id="v_marca" placeholder="Toyota"></div>
      <div class="form-group"><label>Modelo</label><input id="v_modelo" placeholder="Corolla 2022"></div>
    </div>
    <div class="form-group"><label>Número de placa</label><input id="v_placa" placeholder="ABC-123"></div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="saveVehiculo()">${SVG.save} Guardar</button>
    </div>`);
}

async function saveVehiculo() {
  const r = await post('vehiculos/guardar.php', { cliente_id: val('v_cliente_id'), marca: val('v_marca'), modelo: val('v_modelo'), placa: val('v_placa') });
  if (r.ok) { closeModal(); await loadAll(); renderTab('vehiculos'); toast('Vehículo guardado correctamente'); }
  else toast(r.error || 'Error al guardar');
}

async function deleteVehiculo(id) {
  if (!confirm('¿Eliminar este vehículo?')) return;
  const r = await post('vehiculos/eliminar.php', { id });
  if (r.ok) { await loadAll(); renderTab('vehiculos'); toast('Vehículo eliminado'); }
  else toast(r.error || 'Sin permisos');
}

// ───────────── CITAS ─────────────
function renderCitas() {
  const q = document.getElementById('q-citas')?.value || '';
  const list = filterList(state.citas, q, ['motivo','fecha']);
  const clienteNombre = id => (state.clientes.find(c => c.id == id)||{}).nombre || 'N/A';
  const vehiculoLabel = id => { const v = state.vehiculos.find(x => x.id == id); return v ? `${v.marca} ${v.modelo} (${v.placa})` : 'N/A'; };

  const cards = list.length ? list.map(c => `
    <div class="item-card">
      <div class="card-top">
        <div class="avatar cita">${SVG.cal}</div>
        <div class="card-info">
          <div class="card-name">${esc(c.fecha)} — ${esc(c.hora)}</div>
          <div class="card-detail">${esc(c.motivo)}</div>
          <div class="card-detail">Cliente: ${esc(clienteNombre(c.cliente_id))}</div>
          <div class="card-detail">Vehículo: ${esc(vehiculoLabel(c.vehiculo_id))}</div>
        </div>
      </div>
      <div class="card-footer">
        ${btnDel(`deleteCita(${c.id})`)}
      </div>
    </div>`).join('') : emptyState('No hay citas registradas');

  document.getElementById('tab-content').innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Citas</div>
        <div class="section-sub">${state.citas.length} registradas</div>
      </div>
    </div>
    <div class="toolbar">
      ${searchBar('q-citas', 'Buscar por motivo o fecha...', 'renderCitas')}
      <button class="btn-new" onclick="openCita()">${SVG.plus} Nueva cita</button>
    </div>
    <div class="cards-grid">${cards}</div>`;
}

function openCita() {
  const cOpts = state.clientes.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
  const vOpts = state.vehiculos.map(v => `<option value="${v.id}">${esc(v.marca)} ${esc(v.modelo)} — ${esc(v.placa)}</option>`).join('');
  openModal('Nueva cita', `
    <div class="form-group"><label>Cliente</label>
      <select id="c_cliente_id"><option value="">Selecciona un cliente</option>${cOpts}</select></div>
    <div class="form-group"><label>Vehículo</label>
      <select id="c_vehiculo_id"><option value="">Selecciona un vehículo</option>${vOpts}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Fecha</label><input id="c_fecha" type="date"></div>
      <div class="form-group"><label>Hora</label><input id="c_hora" type="time"></div>
    </div>
    <div class="form-group"><label>Motivo de la cita</label>
      <input id="c_motivo" placeholder="Ej: Cambio de aceite, revisión general..."></div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="saveCita()">${SVG.save} Guardar</button>
    </div>`);
}

async function saveCita() {
  const r = await post('citas/guardar.php', { cliente_id: val('c_cliente_id'), vehiculo_id: val('c_vehiculo_id'), fecha: val('c_fecha'), hora: val('c_hora'), motivo: val('c_motivo') });
  if (r.ok) { closeModal(); await loadAll(); renderTab('citas'); toast('Cita guardada correctamente'); }
  else toast(r.error || 'Error al guardar');
}

async function deleteCita(id) {
  if (!confirm('¿Eliminar esta cita?')) return;
  const r = await post('citas/eliminar.php', { id });
  if (r.ok) { await loadAll(); renderTab('citas'); toast('Cita eliminada'); }
  else toast(r.error || 'Sin permisos');
}

// ───────────── ÓRDENES ─────────────
const ESTADO_LABEL = { pendiente: 'Pendiente', en_proceso: 'En proceso', finalizado: 'Finalizado' };

function renderOrdenes() {
  const q = document.getElementById('q-ordenes')?.value || '';
  const list = filterList(state.ordenes, q, ['descripcion','estado']);
  const clienteNombre = id => (state.clientes.find(c => c.id == id)||{}).nombre || 'N/A';
  const vehiculoLabel = id => { const v = state.vehiculos.find(x => x.id == id); return v ? `${v.marca} ${v.modelo} (${v.placa})` : 'N/A'; };

  const cards = list.length ? list.map(o => `
    <div class="item-card">
      <div class="card-top">
        <div class="avatar orden">${SVG.wrench}</div>
        <div class="card-info">
          <div class="card-name">${esc(o.descripcion)}</div>
          <div class="card-detail">Cliente: ${esc(clienteNombre(o.cliente_id))}</div>
          <div class="card-detail">Vehículo: ${esc(vehiculoLabel(o.vehiculo_id))}</div>
          <div style="margin-top:8px">
            <span class="badge dot ${o.estado}">${ESTADO_LABEL[o.estado]||o.estado}</span>
          </div>
        </div>
      </div>
      <div class="card-footer">
        ${isAdmin() ? `<button class="btn-card estado" onclick="cambiarEstado(${o.id},'${o.estado}')">${SVG.bolt} Estado</button>` : ''}
        ${btnDel(`deleteOrden(${o.id})`)}
      </div>
    </div>`).join('') : emptyState('No hay órdenes registradas');

  document.getElementById('tab-content').innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Órdenes de trabajo</div>
        <div class="section-sub">${state.ordenes.length} registradas</div>
      </div>
    </div>
    <div class="toolbar">
      ${searchBar('q-ordenes', 'Buscar por descripción o estado...', 'renderOrdenes')}
      <button class="btn-new" onclick="openOrden()">${SVG.plus} Nueva orden</button>
    </div>
    <div class="cards-grid">${cards}</div>`;
}

function openOrden() {
  const cOpts = state.clientes.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
  const vOpts = state.vehiculos.map(v => `<option value="${v.id}">${esc(v.marca)} ${esc(v.modelo)} — ${esc(v.placa)}</option>`).join('');
  openModal('Nueva orden de trabajo', `
    <div class="form-group"><label>Cliente</label>
      <select id="o_cliente_id"><option value="">Selecciona un cliente</option>${cOpts}</select></div>
    <div class="form-group"><label>Vehículo</label>
      <select id="o_vehiculo_id"><option value="">Selecciona un vehículo</option>${vOpts}</select></div>
    <div class="form-group"><label>Descripción del servicio</label>
      <textarea id="o_descripcion" placeholder="Detalla el trabajo a realizar..."></textarea></div>
    <div class="form-group"><label>Estado inicial</label>
      <select id="o_estado">
        <option value="pendiente">Pendiente</option>
        <option value="en_proceso">En proceso</option>
        <option value="finalizado">Finalizado</option>
      </select></div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="saveOrden()">${SVG.save} Guardar</button>
    </div>`);
}

function cambiarEstado(id, estadoActual) {
  const estados = ['pendiente','en_proceso','finalizado'];
  openModal('Cambiar estado de orden', `
    <div class="form-group"><label>Nuevo estado</label>
      <select id="nuevo_estado">
        ${estados.map(e => `<option value="${e}" ${e===estadoActual?'selected':''}>${ESTADO_LABEL[e]}</option>`).join('')}
      </select></div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="guardarEstado(${id})">${SVG.save} Aplicar</button>
    </div>`);
}

async function guardarEstado(id) {
  const r = await post('ordenes/cambiar_estado.php', { id, estado: val('nuevo_estado') });
  if (r.ok) { closeModal(); await loadAll(); renderTab('ordenes'); toast('Estado actualizado'); }
  else toast(r.error || 'Error');
}

async function saveOrden() {
  const r = await post('ordenes/guardar.php', { cliente_id: val('o_cliente_id'), vehiculo_id: val('o_vehiculo_id'), descripcion: val('o_descripcion'), estado: val('o_estado') });
  if (r.ok) { closeModal(); await loadAll(); renderTab('ordenes'); toast('Orden guardada correctamente'); }
  else toast(r.error || 'Error al guardar');
}

async function deleteOrden(id) {
  if (!confirm('¿Eliminar esta orden?')) return;
  const r = await post('ordenes/eliminar.php', { id });
  if (r.ok) { await loadAll(); renderTab('ordenes'); toast('Orden eliminada'); }
  else toast(r.error || 'Sin permisos');
}

// ───────────── HISTORIAL ─────────────
async function renderHistorial() {
  document.getElementById('tab-content').innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Historial por placa</div>
        <div class="section-sub">Consulta el historial completo de un vehículo</div>
      </div>
    </div>
    <div class="historial-search">
      <input id="h_placa" placeholder="Ingresa la placa del vehículo..." onkeydown="if(event.key==='Enter')buscarHistorial()">
      <button class="btn-new" onclick="buscarHistorial()">${SVG.search} Buscar</button>
    </div>
    <div id="historial-result"></div>`;
}

async function buscarHistorial() {
  const placa = document.getElementById('h_placa').value.trim();
  if (!placa) return;

  const el = document.getElementById('historial-result');
  el.innerHTML = `<div class="loading"><div class="spinner"></div> Buscando...</div>`;

  const res = await api(`historial/index.php?placa=${encodeURIComponent(placa)}`);

  if (res.error) {
    el.innerHTML = `<div class="empty-state">${SVG.empty}<p>${esc(res.error)}</p></div>`;
    return;
  }

  const { vehiculo, cliente, ordenes } = res;
  const timeline = ordenes.length
    ? ordenes.map(o => `
      <div class="timeline-item">
        <div class="tl-left"><div class="tl-dot"></div><div class="tl-line"></div></div>
        <div class="tl-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px">
            <h4>${esc(o.descripcion)}</h4>
            <span class="badge dot ${o.estado}">${ESTADO_LABEL[o.estado]||o.estado}</span>
          </div>
          ${o.observaciones ? `<p>${esc(o.observaciones)}</p>` : ''}
          ${o.fecha_creacion ? `<p style="margin-top:6px;font-size:12px;opacity:.55">${esc(o.fecha_creacion)}</p>` : ''}
        </div>
      </div>`).join('')
    : `<div class="empty-state">${SVG.empty}<p>Sin órdenes registradas para este vehículo</p></div>`;

  el.innerHTML = `
    <div class="hist-vehicle-card">
      <div class="big-avatar">${SVG.car}</div>
      <div>
        <h3>${esc(vehiculo.marca)} ${esc(vehiculo.modelo)}</h3>
        <p>Placa: <strong>${esc(vehiculo.placa)}</strong></p>
        <p>Cliente: <strong>${esc(cliente ? cliente.nombre : 'N/A')}</strong></p>
        ${cliente?.telefono ? `<p>${esc(cliente.telefono)}</p>` : ''}
      </div>
    </div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase">
      Historial de órdenes — ${ordenes.length} registro(s)
    </div>
    <div class="timeline">${timeline}</div>`;
}
