/* ───────────── TALLER PMV FULL FIX ───────────── */

let state = {
  clientes: [],
  vehiculos: [],
  citas: [],
  ordenes: [],
  historial: null
};

let currentTab = 'clientes';

// ───────────── API ─────────────
async function api(url) {
  const res = await fetch(url);
  return res.json();
}

async function post(url, data) {
  const fd = new FormData();
  Object.keys(data).forEach(k => fd.append(k, data[k]));

  const res = await fetch(url, {
    method: 'POST',
    body: fd
  });

  return res.json();
}

// ───────────── LOAD DATA ─────────────
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

init();

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
  el.innerHTML = `<div class="loading">Cargando...</div>`;

  switch (tab) {
    case 'clientes': renderClientes(); break;
    case 'vehiculos': renderVehiculos(); break;
    case 'citas': renderCitas(); break;
    case 'ordenes': renderOrdenes(); break;
    case 'historial': renderHistorial(); break;
  }
}

// ───────────── HELPERS ─────────────
const esc = s => (s || '').replace(/</g, "&lt;");

function val(id) {
  return document.getElementById(id).value;
}

function openModal(title, body) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

document.getElementById('modal-close').onclick = closeModal;
document.getElementById('modal-overlay').onclick = e => {
  if (e.target.id === 'modal-overlay') closeModal();
};

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2000);
}

// ───────────── CLIENTES ─────────────
function renderClientes() {
  let html = `
    <div class="section-header">
      <div>
        <h2>Clientes</h2>
        <p>${state.clientes.length} registrados</p>
      </div>
      <button onclick="openCliente()">+ Nuevo cliente</button>
    </div>

    <div class="grid-clientes">
  `;

  if (!state.clientes.length) {
    html += `<div class="empty">No hay clientes registrados</div>`;
  }

  state.clientes.forEach(c => {
    html += `
      <div class="cliente-card">
        
        <div class="cliente-info">
          <div class="avatar">
            ${c.nombre.charAt(0).toUpperCase()}
          </div>

          <div>
            <div class="nombre">${esc(c.nombre)}</div>
            <div class="subinfo">📞 ${esc(c.telefono)}</div>
            <div class="subinfo">✉ ${esc(c.correo)}</div>
          </div>
        </div>

        <div class="acciones">
          <button onclick="editCliente(${c.id})">Editar</button>
          <button onclick="deleteCliente(${c.id})" class="danger">Eliminar</button>
        </div>

      </div>
    `;
  });

  html += `</div>`;

  document.getElementById('tab-content').innerHTML = html;
}

function openCliente(id, nombre, telefono, correo) {
  openModal(id ? 'Editar Cliente' : 'Nuevo Cliente', `
    <input type="hidden" id="cliente_edit_id" value="${id || ''}">
    <input id="nombre" placeholder="Nombre" value="${esc(nombre || '')}"><br>
    <input id="telefono" placeholder="Teléfono" value="${esc(telefono || '')}"><br>
    <input id="correo" placeholder="Correo" value="${esc(correo || '')}"><br>
    <button onclick="saveCliente()">Guardar</button>
  `);
}

function editCliente(id) {
  const c = state.clientes.find(x => x.id == id);
  if (c) openCliente(c.id, c.nombre, c.telefono, c.correo);
}

async function saveCliente() {
  const id = val('cliente_edit_id');
  const r = await post('clientes/guardar.php', {
    id: id || 0,
    nombre: val('nombre'),
    telefono: val('telefono'),
    correo: val('correo')
  });

  if (r.ok) {
    closeModal();
    await loadAll();
    renderTab('clientes');
    toast('Cliente guardado');
  } else {
    toast(r.error || 'Error al guardar');
  }
}

async function deleteCliente(id) {
  await post('clientes/eliminar.php', { id });
  await loadAll();
  renderTab('clientes');
}

// ───────────── VEHÍCULOS ─────────────
function renderVehiculos() {
  let html = `
    <div class="section-header">
      <h2>Vehículos</h2>
      <button onclick="openVehiculo()">+ Nuevo</button>
    </div>
  `;

  if (!state.vehiculos.length) {
    html += `<div class="empty">No hay vehículos registrados</div>`;
  }

  state.vehiculos.forEach(v => {
    html += `
      <div>
        ${esc(v.marca)} ${esc(v.modelo)} - ${esc(v.placa)}
        <button onclick="deleteVehiculo(${v.id})">Eliminar</button>
      </div>
    `;
  });

  document.getElementById('tab-content').innerHTML = html;
}

function openVehiculo() {
  const opts = state.clientes.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
  openModal('Nuevo Vehículo', `
    <select id="v_cliente_id"><option value="">-- Selecciona cliente --</option>${opts}</select><br>
    <input id="v_marca" placeholder="Marca"><br>
    <input id="v_modelo" placeholder="Modelo"><br>
    <input id="v_placa" placeholder="Placa"><br>
    <button onclick="saveVehiculo()">Guardar</button>
  `);
}

async function saveVehiculo() {
  const r = await post('vehiculos/guardar.php', {
    cliente_id: val('v_cliente_id'),
    marca: val('v_marca'),
    modelo: val('v_modelo'),
    placa: val('v_placa')
  });

  if (r.ok) {
    closeModal();
    await loadAll();
    renderTab('vehiculos');
    toast('Vehículo guardado');
  } else {
    toast(r.error || 'Error al guardar');
  }
}

async function deleteVehiculo(id) {
  await post('vehiculos/eliminar.php', { id });
  await loadAll();
  renderTab('vehiculos');
}

// ───────────── CITAS ─────────────
function renderCitas() {
  let html = `
    <div class="section-header">
      <h2>Citas</h2>
      <button onclick="openCita()">+ Nueva</button>
    </div>
  `;

  if (!state.citas.length) {
    html += `<div class="empty">No hay citas registradas</div>`;
  }

  state.citas.forEach(c => {
    html += `
      <div>
        ${esc(c.fecha)} ${esc(c.hora)} - ${esc(c.motivo)}
        <button onclick="deleteCita(${c.id})">Eliminar</button>
      </div>
    `;
  });

  document.getElementById('tab-content').innerHTML = html;
}

function openCita() {
  const cOpts = state.clientes.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
  const vOpts = state.vehiculos.map(v => `<option value="${v.id}">${esc(v.marca)} ${esc(v.modelo)} — ${esc(v.placa)}</option>`).join('');
  openModal('Nueva Cita', `
    <select id="c_cliente_id"><option value="">-- Selecciona cliente --</option>${cOpts}</select><br>
    <select id="c_vehiculo_id"><option value="">-- Selecciona vehículo --</option>${vOpts}</select><br>
    <input id="c_fecha" type="date"><br>
    <input id="c_hora" type="time"><br>
    <input id="c_motivo" placeholder="Motivo"><br>
    <button onclick="saveCita()">Guardar</button>
  `);
}

async function saveCita() {
  const r = await post('citas/guardar.php', {
    cliente_id: val('c_cliente_id'),
    vehiculo_id: val('c_vehiculo_id'),
    fecha: val('c_fecha'),
    hora: val('c_hora'),
    motivo: val('c_motivo')
  });

  if (r.ok) {
    closeModal();
    await loadAll();
    renderTab('citas');
    toast('Cita guardada');
  } else {
    toast(r.error || 'Error al guardar');
  }
}

async function deleteCita(id) {
  await post('citas/eliminar.php', { id });
  await loadAll();
  renderTab('citas');
}

// ───────────── ÓRDENES ─────────────
function renderOrdenes() {
  let html = `
    <div class="section-header">
      <h2>Órdenes</h2>
      <button onclick="openOrden()">+ Nueva</button>
    </div>
  `;

  if (!state.ordenes.length) {
    html += `<div class="empty">No hay órdenes registradas</div>`;
  }

  state.ordenes.forEach(o => {
    html += `
      <div>
        ${esc(o.descripcion)} - ${esc(o.estado)}
        <button onclick="deleteOrden(${o.id})">Eliminar</button>
      </div>
    `;
  });

  document.getElementById('tab-content').innerHTML = html;
}

function openOrden() {
  const cOpts = state.clientes.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
  const vOpts = state.vehiculos.map(v => `<option value="${v.id}">${esc(v.marca)} ${esc(v.modelo)} — ${esc(v.placa)}</option>`).join('');
  openModal('Nueva Orden', `
    <select id="o_cliente_id"><option value="">-- Selecciona cliente --</option>${cOpts}</select><br>
    <select id="o_vehiculo_id"><option value="">-- Selecciona vehículo --</option>${vOpts}</select><br>
    <input id="o_descripcion" placeholder="Descripción"><br>
    <select id="o_estado">
      <option>pendiente</option>
      <option>en_proceso</option>
      <option>finalizado</option>
    </select><br>
    <button onclick="saveOrden()">Guardar</button>
  `);
}

async function saveOrden() {
  const r = await post('ordenes/guardar.php', {
    cliente_id: val('o_cliente_id'),
    vehiculo_id: val('o_vehiculo_id'),
    descripcion: val('o_descripcion'),
    estado: val('o_estado')
  });

  if (r.ok) {
    closeModal();
    await loadAll();
    renderTab('ordenes');
    toast('Orden guardada');
  } else {
    toast(r.error || 'Error al guardar');
  }
}

async function deleteOrden(id) {
  await post('ordenes/eliminar.php', { id });
  await loadAll();
  renderTab('ordenes');
}

// ───────────── HISTORIAL ─────────────
async function renderHistorial() {
  const el = document.getElementById('tab-content');

  el.innerHTML = `
    <div class="section-header">
      <h2>Historial por placa</h2>
    </div>
    <div style="margin-bottom:20px">
      <input id="h_placa" placeholder="Placa del vehículo">
      <button onclick="buscarHistorial()">Buscar</button>
    </div>
    <div id="historial-result"></div>
  `;
}

async function buscarHistorial() {
  const placa = document.getElementById('h_placa').value.trim();
  if (!placa) return;

  const res = await api(`historial/index.php?placa=${encodeURIComponent(placa)}`);
  const el = document.getElementById('historial-result');

  if (res.error) {
    el.innerHTML = `<div class="empty">${esc(res.error)}</div>`;
    return;
  }

  const { vehiculo, cliente, ordenes } = res;

  let html = `
    <p><strong>Vehículo:</strong> ${esc(vehiculo.marca)} ${esc(vehiculo.modelo)} — ${esc(vehiculo.placa)}</p>
    <p><strong>Cliente:</strong> ${esc(cliente ? cliente.nombre : 'N/A')}</p>
    <h3 style="margin-top:15px">Órdenes (${ordenes.length})</h3>
  `;

  if (!ordenes.length) {
    html += `<div class="empty">Sin órdenes registradas</div>`;
  } else {
    ordenes.forEach(o => {
      html += `<div>${esc(o.descripcion)} — <em>${esc(o.estado)}</em></div>`;
    });
  }

  el.innerHTML = html;
}
