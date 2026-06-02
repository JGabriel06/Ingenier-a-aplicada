// === DOM Elements ===
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const navItems = document.querySelectorAll('.nav-item');
const contentScreens = document.querySelectorAll('.content-screen');
let ventaCarrito = [];

function saveVentaCarrito() {
  localStorage.setItem('ventaCarrito', JSON.stringify(ventaCarrito));
}

function loadVentaCarrito() {
  return JSON.parse(localStorage.getItem('ventaCarrito') || '[]');
}

// === Login Handler ===
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Simulate login
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (email && password) {
    // Hide login, show app
    loginScreen.classList.remove('active');
    loginScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
  }
});

// === Logout Handler ===
logoutBtn.addEventListener('click', function() {
  // Show login, hide app
  appContainer.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  loginScreen.classList.add('active');
  
  // Reset form
  loginForm.reset();
  
  // Reset to dashboard
  navigateTo('dashboard');
});

// === Navigation ===
function navigateTo(screenId) {
  // Update nav items
  navItems.forEach(item => {
    if (item.dataset.screen === screenId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update screens
  contentScreens.forEach(screen => {
    if (screen.id === `${screenId}-screen`) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });
}

navItems.forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const screenId = this.dataset.screen;
    navigateTo(screenId);
  });
});

// === Modal Functions ===
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
  if (modalId === 'venta-modal') {
    renderVentaCart();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('active');
    }
  });
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});

// === Form Submissions ===
document.querySelectorAll('.modal-form').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const modal = this.closest('.modal');
    const modalId = modal ? modal.id : null;

    // Collect form values (use input/select/textarea 'name' attributes)
    const data = {};
    this.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.name) data[el.name] = el.value;
    });

    // Persist depending on modal
    if (modalId === 'producto-modal') {
      const productos = JSON.parse(localStorage.getItem('productos') || '[]');
      productos.push(data);
      localStorage.setItem('productos', JSON.stringify(productos));
      renderProductos();
      alert('Producto guardado correctamente');
    } else if (modalId === 'lote-modal') {
      const lotes = JSON.parse(localStorage.getItem('lotes') || '[]');
      lotes.push(data);
      localStorage.setItem('lotes', JSON.stringify(lotes));
      renderLotes();
      alert('Lote guardado correctamente');
    } else if (modalId === 'venta-modal') {
      registerVenta();
    } else {
      // generic save
      alert('Datos guardados exitosamente');
    }

    // Close modal and reset
    if (modal) modal.classList.remove('active');
    this.reset();
  });
});

// Render helpers
function renderProductos() {
  const tbody = document.getElementById('productos-tbody');
  if (!tbody) return;
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  // Clear existing rows
  tbody.innerHTML = '';

  productos.forEach(p => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-generated', 'true');
    tr.innerHTML = `
      <td>${escapeHtml(p.codigo || '')}</td>
      <td>${escapeHtml(p.nombre || '')}</td>
      <td>${escapeHtml(p.categoria || '')}</td>
      <td>$${parseFloat(p.precio || 0).toFixed(2)}</td>
      <td>${escapeHtml((p.stock_min || '0') + ' unidades')}</td>
      <td>
        <div class="action-buttons">
          <button type="button" class="btn-icon" title="Editar">...</button>
          <button type="button" class="btn-icon danger" title="Eliminar">...</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Populate select options for lote modal and quick product list
  populateProductoOptions();
  renderQuickProducts();

  computeDashboardStats();
  renderInventario();
  renderVentas();
  renderPedidos();
  renderRiesgoTable();
  renderTopProductos();
}

function populateProductoOptions() {
  const select = document.getElementById('lote-product-select');
  if (!select) return;
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  // keep the default option
  select.innerHTML = '<option value="">Seleccionar producto</option>';
  productos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.codigo || '';
    opt.textContent = `${p.codigo || ''} - ${p.nombre || ''}`;
    select.appendChild(opt);
  });
}

function renderQuickProducts() {
  const container = document.getElementById('producto-quick-list');
  if (!container) return;
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  container.innerHTML = '';
  productos.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'producto-quick-item';
    btn.dataset.codigo = p.codigo || '';
    btn.dataset.nombre = p.nombre || '';
    btn.dataset.precio = parseFloat(p.precio || 0).toFixed(2);
    btn.innerHTML = `<span>${escapeHtml(p.nombre || '')}</span><span>$${parseFloat(p.precio||0).toFixed(2)}</span>`;
    btn.addEventListener('click', function() {
      addProductoToCarrito(this.dataset.codigo);
    });
    container.appendChild(btn);
  });
}

function renderLotes() {
  const tbody = document.getElementById('lotes-tbody');
  if (!tbody) return;
  const lotes = JSON.parse(localStorage.getItem('lotes') || '[]');
  // Remove defaults
  tbody.innerHTML = '';
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');

  lotes.forEach(l => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-generated', 'true');
    // find product by code
    const prod = productos.find(p => (p.codigo || '') === (l.producto || ''));
    const productoText = prod ? `${prod.codigo} - ${prod.nombre}` : l.producto || '';
    tr.innerHTML = `
      <td>${escapeHtml(l.codigo || '')}</td>
      <td>${escapeHtml(productoText)}</td>
      <td>${escapeHtml((l.cantidad || '0') + ' unidades')}</td>
      <td>${escapeHtml(l.fecha_ingreso || '')}</td>
      <td>${escapeHtml(l.fecha_caducidad || '')}</td>
      <td><span class="badge badge-info">Registrado</span></td>
      <td>
        <div class="action-buttons">
          <button type="button" class="btn-icon" title="Ver detalles">...</button>
          <button type="button" class="btn-icon" title="Editar">...</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  computeDashboardStats();
  renderAlertas();
  renderInventario();
  renderPriorityList();
  renderVentas();
  renderPedidos();
  renderRiesgoTable();
  renderTopProductos();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// === Dashboard & Derived Renders ===
function computeDashboardStats() {
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  const lotes = JSON.parse(localStorage.getItem('lotes') || '[]');
  const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');

  // Productos totales
  const elProductos = document.getElementById('stat-productos');
  if (elProductos) elProductos.textContent = productos.length;

  // Ventas del mes (sum total field if present)
  const elVentas = document.getElementById('stat-ventas-mes');
  let totalVentas = 0;
  ventas.forEach(v => { if (v.total) totalVentas += Number(v.total) || 0; });
  if (elVentas) elVentas.textContent = `$${totalVentas.toFixed(2)}`;

  const elVentasHoy = document.getElementById('stat-ventas-hoy');
  const elTransacciones = document.getElementById('stat-transacciones');
  const elPromedioVenta = document.getElementById('stat-promedio-venta');
  const today = new Date();
  let ventasHoy = 0;
  ventas.forEach(v => {
    if (v.fecha) {
      const saleDate = new Date(v.fecha);
      if (saleDate.toDateString() === today.toDateString()) {
        ventasHoy += Number(v.total) || 0;
      }
    }
  });
  if (elVentasHoy) elVentasHoy.textContent = `$${ventasHoy.toFixed(2)}`;
  if (elTransacciones) elTransacciones.textContent = ventas.length;
  const promedio = ventas.length ? totalVentas / ventas.length : 0;
  if (elPromedioVenta) elPromedioVenta.textContent = `$${promedio.toFixed(2)}`;

  // Por caducar y riesgo crítico computed from lotes
  const elPorCaducar = document.getElementById('stat-por-caducar');
  const elRiesgoCritico = document.getElementById('stat-riesgo-critico');
  const elRiesgoCriticoScreen = document.getElementById('stat-riesgo-critico-screen');
  const elRiesgoAltoScreen = document.getElementById('stat-riesgo-alto-screen');
  const elRiesgoModeradoScreen = document.getElementById('stat-riesgo-moderado-screen');
  let porCaducar = 0, riesgoCritico = 0, riesgoAlto = 0, riesgoModerado = 0;
  const now = new Date();
  lotes.forEach(l => {
    if (!l.fecha_caducidad) return;
    const d = new Date(l.fecha_caducidad);
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (diff <= 7 && diff >= 0) {
      porCaducar++;
      riesgoCritico++;
    } else if (diff <= 30 && diff > 7) {
      riesgoAlto++;
    } else if (diff > 30) {
      riesgoModerado++;
    }
  });
  if (elPorCaducar) elPorCaducar.textContent = porCaducar;
  if (elRiesgoCritico) elRiesgoCritico.textContent = riesgoCritico;
  if (elRiesgoCriticoScreen) elRiesgoCriticoScreen.textContent = riesgoCritico;
  if (elRiesgoAltoScreen) elRiesgoAltoScreen.textContent = riesgoAlto;
  if (elRiesgoModeradoScreen) elRiesgoModeradoScreen.textContent = riesgoModerado;
}

function renderAlertas() {
  const tbody = document.getElementById('alertas-tbody');
  if (!tbody) return;
  const lotes = JSON.parse(localStorage.getItem('lotes') || '[]');
  tbody.innerHTML = '';
  const now = new Date();
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  lotes.forEach(l => {
    if (!l.fecha_caducidad) return;
    const d = new Date(l.fecha_caducidad);
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff <= 30) {
      const tr = document.createElement('tr');
      let estado = 'info';
      if (diff <= 7) estado = 'danger';
      else if (diff <= 30) estado = 'warning';
      const prod = productos.find(p => (p.codigo || '') === (l.producto || ''));
      const productoText = prod ? `${prod.codigo} - ${prod.nombre}` : (l.producto || '');
      tr.innerHTML = `
        <td>${escapeHtml(productoText)}</td>
        <td>${escapeHtml(l.codigo || '')}</td>
        <td>${diff} días</td>
        <td><span class="badge badge-${estado}">${estado === 'danger' ? 'Crítico' : 'Alto'}</span></td>
      `;
      tbody.appendChild(tr);
    }
  });
  // update badges in header if present
  const badge = document.querySelector('.card-header .badge-warning');
  if (badge) badge.textContent = `${tbody.querySelectorAll('tr').length} productos`;
}

function renderInventario() {
  const tbody = document.getElementById('inventario-tbody');
  if (!tbody) return;
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  const lotes = JSON.parse(localStorage.getItem('lotes') || '[]');
  tbody.innerHTML = '';
  // compute stock per product from lotes
  productos.forEach(p => {
    const codigo = (p.codigo || '').toLowerCase();
    let stock = 0;
    lotes.forEach(l => { if ((l.producto || '').toLowerCase().includes(codigo) || (l.producto || '').toLowerCase() === codigo) stock += Number(l.cantidad) || 0; });
    const nivel = stock <= (Number(p.stock_min) || 0) ? 'low' : (stock <= (Number(p.stock_min || 0) * 2) ? 'medium' : 'high');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(p.codigo || '')}</td>
      <td>${escapeHtml(p.nombre || '')}</td>
      <td>${escapeHtml(p.categoria || '')}</td>
      <td>${stock} unidades</td>
      <td>${escapeHtml(p.stock_min || '0')} unidades</td>
      <td>
        <div class="stock-bar"><div class="stock-fill ${nivel}" style="width: ${Math.min(100, (stock / (Number(p.stock_min || 1) || 1)) * 50)}%"></div></div>
        <span class="stock-label ${nivel === 'low' ? 'warning' : ''}">${nivel === 'low' ? 'Bajo' : (nivel === 'medium' ? 'Normal' : 'Alto')}</span>
      </td>
      <td>$0.00</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPriorityList() {
  const container = document.getElementById('priority-list');
  if (!container) return;
  container.innerHTML = '';
  const lotes = JSON.parse(localStorage.getItem('lotes') || '[]');
  const now = new Date();
  // Sort by nearest caducidad
  const items = lotes.map(l => ({...l, diff: l.fecha_caducidad ? Math.ceil((new Date(l.fecha_caducidad) - now)/(1000*60*60*24)) : Infinity})).sort((a,b)=>a.diff-b.diff);
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  items.slice(0,6).forEach((it, idx) => {
    const nivel = it.diff <= 7 ? 'badge-danger' : (it.diff <= 30 ? 'badge-warning' : 'badge-info');
    const div = document.createElement('div');
    div.className = `priority-item priority-${idx+1}`;
    const prod = productos.find(p => (p.codigo || '') === (it.producto || ''));
    const title = prod ? `${prod.codigo} - ${prod.nombre}` : (it.producto || it.codigo || 'Item');
    div.innerHTML = `
      <div class="priority-number">${idx+1}</div>
      <div class="priority-content">
        <div class="priority-header">
          <h4>${escapeHtml(title)}</h4>
          <span class="badge ${nivel}">Prioridad</span>
        </div>
        <div class="priority-details">
          <span>Lote: ${escapeHtml(it.codigo || '')}</span>
          <span>Stock: ${escapeHtml(it.cantidad || '0')} unidades</span>
          <span>Caduca: ${escapeHtml(it.fecha_caducidad || '')} (${it.diff} días)</span>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderTopProductos() {
  const container = document.getElementById('top-productos');
  if (!container) return;
  container.innerHTML = '';
  const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
  if (ventas.length === 0) return;
  // simple aggregate by product name
  const counts = {};
  ventas.forEach(v => { (v.items || []).forEach(it => { counts[it.nombre] = (counts[it.nombre] || 0) + (Number(it.cantidad) || 0); }); });
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  sorted.forEach(([nombre, qty]) => {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `<div class="product-info"><span class="product-name">${escapeHtml(nombre)}</span></div><div class="product-sales"><span class="sales-value">${qty}</span><span class="sales-label">unidades</span></div>`;
    container.appendChild(div);
  });
}

function getProductByCode(codigo) {
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  return productos.find(p => (p.codigo || '') === codigo);
}

function getStockForProduct(codigo) {
  const lotes = JSON.parse(localStorage.getItem('lotes') || '[]');
  return lotes.reduce((total, lote) => {
    return total + (((lote.producto || '') === codigo) ? (Number(lote.cantidad) || 0) : 0);
  }, 0);
}

function promptQuantity(maxQuantity) {
  const value = prompt(`Ingrese la cantidad a vender (máximo ${maxQuantity})`, '1');
  if (value === null) return null;
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    alert('Ingrese un número válido mayor a cero.');
    return null;
  }
  if (quantity > maxQuantity) {
    alert(`No hay suficiente stock disponible. Stock máximo: ${maxQuantity}`);
    return null;
  }
  return quantity;
}

function renderVentaCart() {
  const container = document.getElementById('venta-carrito-items');
  const totalEl = document.getElementById('venta-total-value');
  if (!container || !totalEl) return;
  container.innerHTML = '';
  if (ventaCarrito.length === 0) {
    container.innerHTML = `<div class="carrito-item"><div class="carrito-info"><span class="carrito-nombre">Carrito vacío</span></div></div>`;
    totalEl.textContent = '$0.00';
    return;
  }

  let total = 0;
  ventaCarrito.forEach((item, index) => {
    const tr = document.createElement('div');
    tr.className = 'carrito-item';
    tr.innerHTML = `
      <div class="carrito-info">
        <span class="carrito-nombre">${escapeHtml(item.nombre)}</span>
        <span class="carrito-precio">$${(Number(item.precio) || 0).toFixed(2)} x ${item.cantidad}</span>
      </div>
      <div class="carrito-actions">
        <span class="carrito-subtotal">$${item.subtotal.toFixed(2)}</span>
        <button type="button" class="btn-icon danger small" data-index="${index}" title="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
    tr.querySelector('button')?.addEventListener('click', function() {
      const indexToRemove = Number(this.dataset.index);
      ventaCarrito.splice(indexToRemove, 1);
      saveVentaCarrito();
      renderVentaCart();
    });
    container.appendChild(tr);
    total += item.subtotal;
  });
  totalEl.textContent = `$${total.toFixed(2)}`;
}

function addProductoToCarrito(codigo) {
  const product = getProductByCode(codigo);
  if (!product) {
    alert('Producto no encontrado.');
    return;
  }
  const stock = getStockForProduct(codigo);
  if (stock <= 0) {
    alert('No hay stock disponible para este producto.');
    return;
  }

  const quantity = promptQuantity(stock);
  if (quantity === null) return;

  const existing = ventaCarrito.find(item => item.codigo === codigo);
  if (existing) {
    if (existing.cantidad + quantity > stock) {
      alert('No hay suficiente stock para la cantidad solicitada.');
      return;
    }
    existing.cantidad += quantity;
    existing.subtotal = existing.cantidad * Number(existing.precio || 0);
  } else {
    ventaCarrito.push({
      codigo,
      nombre: product.nombre || 'Producto',
      precio: Number(product.precio) || 0,
      cantidad,
      subtotal: quantity * (Number(product.precio) || 0)
    });
  }
  saveVentaCarrito();
  renderVentaCart();
}

function saveVentas(ventas) {
  localStorage.setItem('ventas', JSON.stringify(ventas));
}

function loadVentas() {
  return JSON.parse(localStorage.getItem('ventas') || '[]');
}

function applySaleToLotes(items) {
  const lotes = JSON.parse(localStorage.getItem('lotes') || '[]');
  items.forEach(item => {
    let remaining = Number(item.cantidad) || 0;
    const productLotes = lotes
      .filter(l => (l.producto || '') === item.codigo)
      .sort((a, b) => new Date(a.fecha_caducidad) - new Date(b.fecha_caducidad));

    for (const lote of productLotes) {
      if (remaining <= 0) break;
      const available = Number(lote.cantidad) || 0;
      if (available <= 0) continue;
      const removed = Math.min(available, remaining);
      lote.cantidad = String(available - removed);
      remaining -= removed;
    }
  });
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

function registerVenta() {
  if (ventaCarrito.length === 0) {
    alert('Agrega al menos un producto al carrito antes de registrar la venta.');
    return;
  }

  const total = ventaCarrito.reduce((sum, item) => sum + item.subtotal, 0);
  const ventas = loadVentas();
  const nuevaVenta = {
    id: `VNT-${Date.now()}`,
    fecha: new Date().toISOString(),
    total: total.toFixed(2),
    items: ventaCarrito.map(item => ({ ...item })),
    status: 'Completada'
  };
  ventas.push(nuevaVenta);
  saveVentas(ventas);
  applySaleToLotes(ventaCarrito);
  ventaCarrito = [];
  saveVentaCarrito();
  renderVentaCart();
  renderProductos();
  renderLotes();
  renderTopProductos();
  renderVentas();
  renderPedidos();
  renderRiesgoTable();
  computeDashboardStats();
  alert('Venta registrada correctamente.');
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderVentas() {
  const tbody = document.getElementById('ventas-tbody');
  if (!tbody) return;
  const ventas = loadVentas();
  tbody.innerHTML = '';
  if (ventas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No hay ventas registradas.</td></tr>';
    return;
  }
  ventas.slice().reverse().forEach(venta => {
    const tr = document.createElement('tr');
    const productosVendidos = (venta.items || []).reduce((count, item) => count + (Number(item.cantidad) || 0), 0);
    tr.innerHTML = `
      <td>${escapeHtml(venta.id)}</td>
      <td>${escapeHtml(formatDateTime(venta.fecha))}</td>
      <td>${productosVendidos} productos</td>
      <td>$${Number(venta.total || 0).toFixed(2)}</td>
      <td><span class="badge badge-success">${escapeHtml(venta.status || 'Completada')}</span></td>
      <td>
        <button type="button" class="btn-icon" title="Ver detalle">...</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function calculateProductDemand(days) {
  const ventas = loadVentas();
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  const demand = {};
  ventas.forEach(venta => {
    if (!venta.fecha) return;
    const fecha = new Date(venta.fecha);
    if (fecha < cutoff) return;
    (venta.items || []).forEach(item => {
      demand[item.codigo] = (demand[item.codigo] || 0) + (Number(item.cantidad) || 0);
    });
  });
  return { demand, days: Math.max(days, 1) };
}

function renderPedidos() {
  const tbody = document.getElementById('pedidos-tbody');
  if (!tbody) return;
  const interval = Number(document.getElementById('pedido-interval-select')?.value || 7);
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  const demandData = calculateProductDemand(30);
  tbody.innerHTML = '';

  productos.forEach(p => {
    const codigo = p.codigo || '';
    const stock = getStockForProduct(codigo);
    const totalSold = demandData.demand[codigo] || 0;
    const avgDaily = totalSold / demandData.days;
    const demandaEstimada = Math.ceil(avgDaily * interval);
    const coverageDays = avgDaily > 0 ? (stock / avgDaily).toFixed(1) : '∞';

    let sugerido = 0;
    let urgency = 'Suficiente';
    let badgeClass = 'badge-success';
    let actionHtml = '<span class="text-muted">Sin acción</span>';

    if (avgDaily > 0) {
      sugerido = Math.max(0, Math.ceil(demandaEstimada - stock));
      if (sugerido > 0 && Number(coverageDays) <= 2) {
        urgency = 'Urgente';
        badgeClass = 'badge-danger';
      } else if (sugerido > 0) {
        urgency = 'Pronto';
        badgeClass = 'badge-warning';
      }
    } else if (stock <= Number(p.stock_min || 0)) {
      sugerido = Math.max(0, Number(p.stock_min || 0) - stock + 1);
      urgency = 'Pronto';
      badgeClass = 'badge-warning';
    }

    if (sugerido > 0) {
      actionHtml = `<button type="button" class="btn btn-sm btn-primary">Crear Pedido</button>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(p.nombre || '')}</td>
      <td>${stock} unidades</td>
      <td>${Math.ceil(avgDaily * 7)} und/semana</td>
      <td>${coverageDays}</td>
      <td>${sugerido > 0 ? `${sugerido} unidades` : '-'}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(urgency)}</span></td>
      <td>${actionHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderRiesgoTable() {
  const tbody = document.getElementById('riesgo-tbody');
  if (!tbody) return;
  const lotes = JSON.parse(localStorage.getItem('lotes') || '[]');
  const productos = JSON.parse(localStorage.getItem('productos') || '[]');
  const demandData = calculateProductDemand(30);
  const now = new Date();
  tbody.innerHTML = '';

  lotes.forEach(lote => {
    const cantidad = Number(lote.cantidad) || 0;
    if (cantidad <= 0) return;
    const fechaCad = lote.fecha_caducidad ? new Date(lote.fecha_caducidad) : null;
    const diff = fechaCad ? Math.ceil((fechaCad - now) / (1000 * 60 * 60 * 24)) : Infinity;
    const prod = productos.find(p => (p.codigo || '') === (lote.producto || ''));
    const nombre = prod ? prod.nombre : lote.producto || 'Sin producto';
    const velocidadSemanal = Math.ceil((demandData.demand[lote.producto] || 0) / demandData.days * 7);
    let riesgo = 'Moderado';
    let badgeClass = 'badge-info';
    let sugerencia = 'Revisar rotación';

    if (diff <= 7 && diff >= 0) {
      riesgo = 'Crítico';
      badgeClass = 'badge-danger';
      sugerencia = 'Vender inmediatamente';
    } else if (diff <= 30 && diff > 7) {
      riesgo = 'Alto';
      badgeClass = 'badge-warning';
      sugerencia = 'Promover oferta';
    } else if (diff > 30) {
      riesgo = 'Moderado';
      badgeClass = 'badge-info';
      sugerencia = 'Planificar venta';
    } else {
      riesgo = 'Normal';
      badgeClass = 'badge-secondary';
      sugerencia = 'Control estándar';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(nombre)}</td>
      <td>${escapeHtml(lote.codigo || '')}</td>
      <td>${diff === Infinity ? 'N/A' : `${diff} días`}</td>
      <td>${cantidad} unidades</td>
      <td>${velocidadSemanal} und/semana</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(riesgo)}</span></td>
      <td>${escapeHtml(sugerencia)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// === Calculate Risk Button ===
const calcularRiesgoBtn = document.getElementById('calcular-riesgo-btn');
if (calcularRiesgoBtn) {
  calcularRiesgoBtn.addEventListener('click', function() {
    // Simulate calculation
    this.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Calculando...
    `;
    this.disabled = true;
    
    setTimeout(() => {
      this.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        Calcular Índice de Riesgo
      `;
      this.disabled = false;
      alert('Índice de riesgo actualizado exitosamente');
    }, 2000);
  });
}

// === Initialize ===
document.addEventListener('DOMContentLoaded', function() {
  // Add animation class for loading spinner
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `;
  document.head.appendChild(style);
  
  // Ensure buttons without explicit type do not behave as submit by default
  document.querySelectorAll('button:not([type])').forEach(btn => btn.setAttribute('type', 'button'));

  // Restore any in-progress sale cart
  ventaCarrito = loadVentaCarrito();

  // Render any saved data
  renderProductos();
  renderLotes();
  renderVentas();
  renderPedidos();
  renderRiesgoTable();
  renderTopProductos();
  renderPriorityList();
  renderAlertas();

  const pedidoSelect = document.getElementById('pedido-interval-select');
  if (pedidoSelect) {
    pedidoSelect.addEventListener('change', renderPedidos);
  }

  const recalcularPedidosBtn = document.getElementById('recalcular-pedidos-btn');
  if (recalcularPedidosBtn) {
    recalcularPedidosBtn.addEventListener('click', renderPedidos);
  }
});
