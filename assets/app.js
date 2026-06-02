/* ── app.js — Taller PMV ─────────────────────────────── */

// ── State ─────────────────────────────────────────────
let state = { clientes: [], vehiculos: [], citas: [], ordenes: [] };
let currentTab = 'clientes';

// ── API helper ─────────────────────────────────────────
async function api(url, opts = {}) {
  const res = await fetch(url, opts);
  return res.json();
}

async function loadAll() {
  const [clientes, vehiculos, citas, ordenes] = await Promise.all([
    api('clientes/index.php'),
    api('vehiculos/index.php'),
    api('citas/index.php'),
    api('ordenes/index.php'),
  ]);
  state.clientes = clientes;
  state.vehiculos = vehiculos;
  state.citas = citas;
  state.ordenes = ordenes;
  updateHeaderStats();
}

function updateHeaderStats() {
  document.getElementById('header-stats').innerHTML =
    `<span class="stat-chip"><span>${state.clientes.length}</span> clientes</span>
     <span class="stat-chip"><span>${state.vehiculos.length}</span> vehículos</span>
     <span class="stat-chip"><span>${state.ordenes.length}</span> órdenes</span>`;
}

// ── Toast ──────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2500);
}

// ── Modal ──────────────────────────────────────────────
function openModal(title, bodyHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ── Tabs ───────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    renderTab(currentTab);
  });
});

async function renderTab(tab) {
  await loadAll();
  const content = document.getElementById('tab-content');
  content.innerHTML = '<div class="loading-spinner">Cargando...</div>';
  switch (tab) {
    case 'clientes':  renderClientes(); break;
    case 'vehiculos': renderVehiculos(); break;
    case 'citas':     renderCitas(); break;
    case 'ordenes':   renderOrdenes(); break;
    case 'historial': renderHistorial(); break;
  }
}

// ── Helpers ────────────────────────────────────────────
function clienteNombre(id) {
  const c = state.clientes.find(c => c.id == id);
  return c ? c.nombre : '—';
}
function vehiculoInfo(id) {
  const v = state.vehiculos.find(v => v.id == id);
  return v ? `${v.marca} ${v.modelo} (${v.placa})` : '—';
}
function statusBadge(estado) {
  const map = {
    pendiente:  ['badge-pendiente',  'Pendiente'],
    en_proceso: ['badge-en_proceso', 'En proceso'],
    finalizado: ['badge-finalizado', 'Finalizado'],
  };
  const [cls, label] = map[estado] || ['badge-pendiente', estado];
  return `<span class="badge ${cls}">${label}</span>`;
}
function clienteOptions(selected = '') {
  return state.clientes.map(c =>
    `<option value="${c.id}" ${c.id == selected ? 'selected' : ''}>${esc(c.nombre)}</option>`
  ).join('');
}
function vehiculoOptions(clienteId, selected = '') {
  const vehs = state.vehiculos.filter(v => v.cliente_id == clienteId);
  if (!vehs.length) return '<option value="">Sin vehículos</option>';
  return vehs.map(v =>
    `<option value="${v.id}" ${v.id == selected ? 'selected' : ''}>${esc(v.marca)} ${esc(v.modelo)} — ${esc(v.placa)}</option>`
  ).join('');
}
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}
async function postForm(url, data) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.append(k, v ?? '');
  return api(url, { method: 'POST', body: fd });
}

// ══════════════════════════════════════════════════════
// CLIENTES
// ══════════════════════════════════════════════════════
function renderClientes() {
  const c = state.clientes;
  let html = `
    <div class="section-header">
      <div>
        <div class="section-eyebrow">Registro</div>
        <div class="section-title">Clientes</div>
        <div class="section-sub">${c.length} registrados</div>
      </div>
      <button class="btn btn-primary" onclick="openNuevoCliente()">+ Nuevo cliente</button>
    </div>`;
  if (!c.length) {
    html += emptyState('Sin clientes registrados aún');
  } else {
    html += '<div class="card-grid">';
    c.forEach(cl => {
      html += `
        <div class="card card-row">
          <div>
            <div class="info-name">${esc(cl.nombre)}</div>
            <div class="info-sub">📞 ${esc(cl.telefono) || '—'} &nbsp;✉ ${esc(cl.correo) || '—'}</div>
          </div>
          <div class="card-actions">
            <button class="btn btn-secondary" onclick="openEditarCliente(${cl.id})">Editar</button>
            <button class="btn btn-danger"    onclick="eliminarCliente(${cl.id})">Eliminar</button>
          </div>
        </div>`;
    });
    html += '</div>';
  }
  document.getElementById('tab-content').innerHTML = html;
}

function formCliente(cl = {}) {
  return `
    <div class="form-grid">
      <div class="field"><label class="field-label">Nombre *</label>
        <input id="f-nombre" value="${esc(cl.nombre||'')}" placeholder="Juan Pérez" /></div>
      <div class="field"><label class="field-label">Teléfono</label>
        <input id="f-telefono" value="${esc(cl.telefono||'')}" placeholder="7777-8888" /></div>
      <div class="field"><label class="field-label">Correo</label>
        <input id="f-correo" type="email" value="${esc(cl.correo||'')}" placeholder="juan@email.com" /></div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="guardarCliente(${cl.id||0})">Guardar</button>
      </div>
    </div>`;
}

function openNuevoCliente() { openModal('Nuevo cliente', formCliente()); }
function openEditarCliente(id) {
  const cl = state.clientes.find(c => c.id == id);
  openModal('Editar cliente', formCliente(cl));
}
async function guardarCliente(id) {
  const nombre = document.getElementById('f-nombre').value.trim();
  if (!nombre) return alert('El nombre es requerido');
  const data = {
    id,
    nombre,
    telefono: document.getElementById('f-telefono').value,
    correo:   document.getElementById('f-correo').value,
  };
  const res = await postForm('clientes/guardar.php', data);
  if (res.ok) { showToast(id ? 'Cliente actualizado' : 'Cliente registrado'); closeModal(); renderTab('clientes'); }
  else alert(res.error || 'Error al guardar');
}
async function eliminarCliente(id) {
  if (!confirm('¿Eliminar cliente?')) return;
  const res = await postForm('clientes/eliminar.php', { id });
  if (res.ok) { showToast('Cliente eliminado'); renderTab('clientes'); }
  else alert(res.error || 'Error');
}

// ══════════════════════════════════════════════════════
// VEHÍCULOS
// ══════════════════════════════════════════════════════
function renderVehiculos() {
  const v = state.vehiculos;
  const noClientes = !state.clientes.length;
  let html = `
    <div class="section-header">
      <div>
        <div class="section-eyebrow">Flota</div>
        <div class="section-title">Vehículos</div>
        <div class="section-sub">${v.length} registrados</div>
      </div>
      <button class="btn btn-primary ${noClientes ? 'btn-disabled' : ''}" onclick="openNuevoVehiculo()">+ Nuevo vehículo</button>
    </div>`;
  if (noClientes) html += `<div class="warn-card">⚠ Primero registra al menos un cliente.</div>`;
  if (!v.length) {
    html += emptyState('Sin vehículos registrados aún');
  } else {
    html += '<div class="card-grid">';
    v.forEach(veh => {
      html += `
        <div class="card card-row">
          <div>
            <div class="info-name">
              <span class="placa-tag">${esc(veh.placa)}</span>${esc(veh.marca)} ${esc(veh.modelo)}
            </div>
            <div class="info-sub">👤 ${esc(clienteNombre(veh.cliente_id))}</div>
          </div>
          <div class="card-actions">
            <button class="btn btn-secondary" onclick="openEditarVehiculo(${veh.id})">Editar</button>
            <button class="btn btn-danger"    onclick="eliminarVehiculo(${veh.id})">Eliminar</button>
          </div>
        </div>`;
    });
    html += '</div>';
  }
  document.getElementById('tab-content').innerHTML = html;
}

function formVehiculo(veh = {}) {
  const clienteId = veh.cliente_id || state.clientes[0]?.id || '';
  return `
    <div class="form-grid">
      <div class="field"><label class="field-label">Cliente *</label>
        <select id="f-cliente_id" onchange="updateVehiculoClienteSelect()">${clienteOptions(clienteId)}</select></div>
      <div class="field"><label class="field-label">Marca *</label>
        <input id="f-marca" value="${esc(veh.marca||'')}" placeholder="Toyota" /></div>
      <div class="field"><label class="field-label">Modelo</label>
        <input id="f-modelo" value="${esc(veh.modelo||'')}" placeholder="Corolla 2019" /></div>
      <div class="field"><label class="field-label">Placa *</label>
        <input id="f-placa" value="${esc(veh.placa||'')}" placeholder="P123ABC" /></div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="guardarVehiculo(${veh.id||0})">Guardar</button>
      </div>
    </div>`;
}

function openNuevoVehiculo() { openModal('Nuevo vehículo', formVehiculo()); }
function openEditarVehiculo(id) {
  const veh = state.vehiculos.find(v => v.id == id);
  openModal('Editar vehículo', formVehiculo(veh));
}
async function guardarVehiculo(id) {
  const marca = document.getElementById('f-marca').value.trim();
  const placa = document.getElementById('f-placa').value.trim();
  if (!marca || !placa) return alert('Marca y placa son requeridos');
  const data = {
    id,
    cliente_id: document.getElementById('f-cliente_id').value,
    marca,
    modelo: document.getElementById('f-modelo').value,
    placa,
  };
  const res = await postForm('vehiculos/guardar.php', data);
  if (res.ok) { showToast(id ? 'Vehículo actualizado' : 'Vehículo registrado'); closeModal(); renderTab('vehiculos'); }
  else alert(res.error || 'Error al guardar');
}
async function eliminarVehiculo(id) {
  if (!confirm('¿Eliminar vehículo?')) return;
  const res = await postForm('vehiculos/eliminar.php', { id });
  if (res.ok) { showToast('Vehículo eliminado'); renderTab('vehiculos'); }
  else alert(res.error || 'Error');
}

// ══════════════════════════════════════════════════════
// CITAS
// ══════════════════════════════════════════════════════
function renderCitas() {
  const sorted = [...state.citas].sort((a, b) => (a.fecha + a.hora) > (b.fecha + b.hora) ? 1 : -1);
  const noClientes = !state.clientes.length;
  let html = `
    <div class="section-header">
      <div>
        <div class="section-eyebrow">Agenda</div>
        <div class="section-title">Citas</div>
        <div class="section-sub">${sorted.length} registradas</div>
      </div>
      <button class="btn btn-primary ${noClientes ? 'btn-disabled' : ''}" onclick="openNuevaCita()">+ Agendar cita</button>
    </div>`;
  if (!sorted.length) {
    html += emptyState('Sin citas agendadas aún');
  } else {
    html += '<div class="card-grid">';
    sorted.forEach(c => {
      html += `
        <div class="card">
          <div class="card-row" style="align-items:flex-start">
            <div>
              <div class="cita-date">📅 ${esc(c.fecha)} &nbsp; 🕐 ${esc(c.hora)}</div>
              <div class="info-sub" style="margin:4px 0 2px">👤 ${esc(clienteNombre(c.cliente_id))}</div>
              <div class="info-sub">🚗 ${esc(vehiculoInfo(c.vehiculo_id))}</div>
              <div class="motivo-tag">🔧 ${esc(c.motivo)}</div>
            </div>
            <div class="card-actions">
              <button class="btn btn-secondary" onclick="openEditarCita(${c.id})">Editar</button>
              <button class="btn btn-danger"    onclick="eliminarCita(${c.id})">Eliminar</button>
            </div>
          </div>
        </div>`;
    });
    html += '</div>';
  }
  document.getElementById('tab-content').innerHTML = html;
}

function formCita(c = {}) {
  const clienteId = c.cliente_id || state.clientes[0]?.id || '';
  return `
    <div class="form-grid">
      <div class="field"><label class="field-label">Cliente *</label>
        <select id="f-cliente_id" onchange="refreshVehiculos('f-vehiculo_id','f-cliente_id')">${clienteOptions(clienteId)}</select></div>
      <div class="field"><label class="field-label">Vehículo *</label>
        <select id="f-vehiculo_id">${vehiculoOptions(clienteId, c.vehiculo_id)}</select></div>
      <div class="form-row-2">
        <div class="field"><label class="field-label">Fecha *</label>
          <input id="f-fecha" type="date" value="${esc(c.fecha||'')}" /></div>
        <div class="field"><label class="field-label">Hora *</label>
          <input id="f-hora" type="time" value="${esc(c.hora||'')}" /></div>
      </div>
      <div class="field"><label class="field-label">Motivo del servicio *</label>
        <input id="f-motivo" value="${esc(c.motivo||'')}" placeholder="Cambio de aceite, frenos, etc." /></div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="guardarCita(${c.id||0})">Guardar</button>
      </div>
    </div>`;
}

function openNuevaCita()    { openModal('Agendar cita', formCita()); }
function openEditarCita(id) { openModal('Editar cita', formCita(state.citas.find(c => c.id == id))); }

async function guardarCita(id) {
  const fecha  = document.getElementById('f-fecha').value;
  const hora   = document.getElementById('f-hora').value;
  const motivo = document.getElementById('f-motivo').value.trim();
  if (!fecha || !hora || !motivo) return alert('Fecha, hora y motivo son requeridos');
  const data = {
    id,
    cliente_id:  document.getElementById('f-cliente_id').value,
    vehiculo_id: document.getElementById('f-vehiculo_id').value,
    fecha, hora, motivo,
  };
  const res = await postForm('citas/guardar.php', data);
  if (res.ok) { showToast(id ? 'Cita actualizada' : 'Cita agendada'); closeModal(); renderTab('citas'); }
  else alert(res.error || 'Error al guardar');
}
async function eliminarCita(id) {
  if (!confirm('¿Eliminar cita?')) return;
  const res = await postForm('citas/eliminar.php', { id });
  if (res.ok) { showToast('Cita eliminada'); renderTab('citas'); }
  else alert(res.error || 'Error');
}

// ══════════════════════════════════════════════════════
// ÓRDENES
// ══════════════════════════════════════════════════════
let ordenFilter = 'todos';

function renderOrdenes(filter) {
  if (filter !== undefined) ordenFilter = filter;
  const counts = {
    pendiente:  state.ordenes.filter(o => o.estado === 'pendiente').length,
    en_proceso: state.ordenes.filter(o => o.estado === 'en_proceso').length,
    finalizado: state.ordenes.filter(o => o.estado === 'finalizado').length,
  };
  const filtered = ordenFilter === 'todos' ? state.ordenes : state.ordenes.filter(o => o.estado === ordenFilter);
  const noVeh = !state.vehiculos.length;

  let html = `
    <div class="section-header">
      <div>
        <div class="section-title">Órdenes de trabajo</div>
        <div class="section-sub">${state.ordenes.length} en total</div>
      </div>
      <button class="btn btn-primary ${noVeh ? 'btn-disabled' : ''}" onclick="openNuevaOrden()">+ Nueva orden</button>
    </div>
    <div class="stats-grid">
      ${['pendiente','en_proceso','finalizado'].map(k => {
        const labels = { pendiente: 'Pendiente', en_proceso: 'En proceso', finalizado: 'Finalizado' };
        const active = ordenFilter === k ? `active-${k}` : '';
        return `<div class="stat-card ${active}" onclick="renderOrdenes('${ordenFilter===k?'todos':k}')">
          <div class="stat-num stat-num-${k}">${counts[k]}</div>
          <div class="stat-label">${labels[k]}</div>
        </div>`;
      }).join('')}
    </div>`;

  if (!filtered.length) {
    html += emptyState('Sin órdenes con ese filtro');
  } else {
    html += '<div class="card-grid">';
    filtered.forEach(o => {
      html += `
        <div class="card">
          <div class="card-row" style="align-items:flex-start;gap:12px">
            <div style="flex:1">
              <div class="order-meta">
                <span class="order-id">#${o.id}</span>
                ${statusBadge(o.estado)}
                ${o.fecha_creacion ? `<span class="order-date">${esc(o.fecha_creacion)}</span>` : ''}
              </div>
              <div class="info-sub" style="margin-bottom:2px">👤 ${esc(clienteNombre(o.cliente_id))}</div>
              <div class="info-sub" style="margin-bottom:6px">🚗 ${esc(vehiculoInfo(o.vehiculo_id))}</div>
              <div style="font-size:13px;margin-bottom:${o.observaciones?'4px':'0'}">🔧 ${esc(o.descripcion)}</div>
              ${o.observaciones ? `<div class="info-sub">📝 ${esc(o.observaciones)}</div>` : ''}
            </div>
            <div class="order-actions">
              <select onchange="cambiarEstadoOrden(${o.id}, this.value)">
                <option value="pendiente"  ${o.estado==='pendiente'?'selected':''}>Pendiente</option>
                <option value="en_proceso" ${o.estado==='en_proceso'?'selected':''}>En proceso</option>
                <option value="finalizado" ${o.estado==='finalizado'?'selected':''}>Finalizado</option>
              </select>
              <button class="btn btn-secondary" onclick="openEditarOrden(${o.id})">Editar</button>
              <button class="btn btn-danger"    onclick="eliminarOrden(${o.id})">Eliminar</button>
            </div>
          </div>
        </div>`;
    });
    html += '</div>';
  }
  document.getElementById('tab-content').innerHTML = html;
}

function formOrden(o = {}) {
  const clienteId = o.cliente_id || state.clientes[0]?.id || '';
  return `
    <div class="form-grid">
      <div class="field"><label class="field-label">Cliente *</label>
        <select id="f-cliente_id" onchange="refreshVehiculos('f-vehiculo_id','f-cliente_id')">${clienteOptions(clienteId)}</select></div>
      <div class="field"><label class="field-label">Vehículo *</label>
        <select id="f-vehiculo_id">${vehiculoOptions(clienteId, o.vehiculo_id)}</select></div>
      <div class="field"><label class="field-label">Descripción del servicio *</label>
        <textarea id="f-descripcion" rows="3" placeholder="Describe el problema o servicio...">${esc(o.descripcion||'')}</textarea></div>
      <div class="field"><label class="field-label">Estado</label>
        <select id="f-estado">
          <option value="pendiente"  ${(o.estado||'pendiente')==='pendiente'?'selected':''}>Pendiente</option>
          <option value="en_proceso" ${o.estado==='en_proceso'?'selected':''}>En proceso</option>
          <option value="finalizado" ${o.estado==='finalizado'?'selected':''}>Finalizado</option>
        </select></div>
      <div class="field"><label class="field-label">Observaciones</label>
        <textarea id="f-observaciones" rows="2" placeholder="Notas adicionales...">${esc(o.observaciones||'')}</textarea></div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="guardarOrden(${o.id||0})">Guardar</button>
      </div>
    </div>`;
}

function openNuevaOrden()    { openModal('Nueva orden de trabajo', formOrden()); }
function openEditarOrden(id) { openModal('Editar orden', formOrden(state.ordenes.find(o => o.id == id))); }

async function guardarOrden(id) {
  const descripcion = document.getElementById('f-descripcion').value.trim();
  const vehiculo_id = document.getElementById('f-vehiculo_id').value;
  if (!descripcion) return alert('La descripción es requerida');
  if (!vehiculo_id) return alert('Selecciona un vehículo');
  const data = {
    id,
    cliente_id:    document.getElementById('f-cliente_id').value,
    vehiculo_id,
    descripcion,
    estado:        document.getElementById('f-estado').value,
    observaciones: document.getElementById('f-observaciones').value,
  };
  const res = await postForm('ordenes/guardar.php', data);
  if (res.ok) { showToast(id ? 'Orden actualizada' : 'Orden creada'); closeModal(); renderOrdenes(); }
  else alert(res.error || 'Error al guardar');
}
async function cambiarEstadoOrden(id, estado) {
  await postForm('ordenes/cambiar_estado.php', { id, estado });
  const labels = { pendiente: 'Pendiente', en_proceso: 'En proceso', finalizado: 'Finalizado' };
  showToast(`Estado → ${labels[estado]}`);
  await loadAll();
  renderOrdenes();
}
async function eliminarOrden(id) {
  if (!confirm('¿Eliminar orden?')) return;
  const res = await postForm('ordenes/eliminar.php', { id });
  if (res.ok) { showToast('Orden eliminada'); renderOrdenes(); }
  else alert(res.error || 'Error');
}

// ══════════════════════════════════════════════════════
// HISTORIAL
// ══════════════════════════════════════════════════════
function renderHistorial() {
  document.getElementById('tab-content').innerHTML = `
    <h2 class="section-title" style="margin-bottom:4px">Historial por placa</h2>
    <p class="section-sub" style="margin-bottom:20px">Busca el historial de órdenes de un vehículo</p>
    <div class="search-row">
      <input id="hist-query" placeholder="Ej: P123ABC" onkeydown="if(event.key==='Enter')buscarHistorial()" />
      <button class="btn btn-primary btn-lg" onclick="buscarHistorial()">🔍 Buscar</button>
    </div>
    <div id="hist-result"></div>`;
}

async function buscarHistorial() {
  const q = document.getElementById('hist-query').value.trim().toUpperCase();
  if (!q) return;
  const res = await api(`historial/index.php?placa=${encodeURIComponent(q)}`);
  const el = document.getElementById('hist-result');
  if (res.error) {
    el.innerHTML = `<div class="error-card">❌ ${esc(res.error)}</div>`;
    return;
  }
  let html = `
    <div class="hist-vehicle-card">
      <div class="hist-section-label">Vehículo encontrado</div>
      <div class="hist-vehicle-grid">
        <div>
          <div class="hist-placa">${esc(res.vehiculo.placa)}</div>
          <div class="hist-model">${esc(res.vehiculo.marca)} ${esc(res.vehiculo.modelo)}</div>
        </div>
        <div>
          <div class="hist-section-label">Propietario</div>
          <div class="hist-owner-name">${esc(res.cliente?.nombre || '—')}</div>
          <div class="hist-owner-sub">${esc(res.cliente?.telefono||'')} ${esc(res.cliente?.correo||'')}</div>
        </div>
        <div>
          <div class="hist-section-label">Órdenes</div>
          <div>${res.ordenes.length} en total</div>
        </div>
      </div>
    </div>`;
  if (!res.ordenes.length) {
    html += emptyState('Este vehículo no tiene órdenes de trabajo');
  } else {
    html += '<div class="card-grid">';
    res.ordenes.forEach(o => {
      html += `
        <div class="card">
          <div class="order-meta">
            <span class="order-id">#${o.id}</span>
            ${statusBadge(o.estado)}
            ${o.fecha_creacion ? `<span class="order-date">${esc(o.fecha_creacion)}</span>` : ''}
          </div>
          <div style="font-size:13px;margin-bottom:${o.observaciones?'4px':'0'}">🔧 ${esc(o.descripcion)}</div>
          ${o.observaciones ? `<div class="info-sub">📝 ${esc(o.observaciones)}</div>` : ''}
        </div>`;
    });
    html += '</div>';
  }
  el.innerHTML = html;
}

// ── Shared: refresh vehicle select when client changes ─
function refreshVehiculos(vehSelectId, clienteSelectId) {
  const cid = document.getElementById(clienteSelectId).value;
  document.getElementById(vehSelectId).innerHTML = vehiculoOptions(cid);
}

// ── Empty state helper ─────────────────────────────────
function emptyState(msg) {
  return `<div class="empty"><div class="empty-icon">📋</div><div class="empty-msg">${msg}</div></div>`;
}

// ── Init ───────────────────────────────────────────────
renderTab('clientes');