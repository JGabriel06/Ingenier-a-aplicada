// =====================================================
// SRPI APP - VERSION MEJORADA Y FUNCIONAL
// =====================================================

// ======================
// DOM ELEMENTS
// ======================

const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const navItems = document.querySelectorAll('.nav-item');
const contentScreens = document.querySelectorAll('.content-screen');

// ======================
// STORAGE
// ======================

let productos = JSON.parse(localStorage.getItem('productos')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || [];
let ventas = JSON.parse(localStorage.getItem('ventas')) || [];

// ======================
// LOGIN
// ======================

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showAlert('Debe completar todos los campos', 'error');
    return;
  }

  loginScreen.classList.remove('active');
  loginScreen.classList.add('hidden');

  appContainer.classList.remove('hidden');

  showAlert('Bienvenido al sistema', 'success');
});

// ======================
// LOGOUT
// ======================

logoutBtn.addEventListener('click', function () {

  appContainer.classList.add('hidden');

  loginScreen.classList.remove('hidden');
  loginScreen.classList.add('active');

  loginForm.reset();

  navigateTo('dashboard');
});

// ======================
// NAVEGACIÓN
// ======================

function navigateTo(screenId) {

  navItems.forEach(item => {

    item.classList.remove('active');

    if (item.dataset.screen === screenId) {
      item.classList.add('active');
    }
  });

  contentScreens.forEach(screen => {

    screen.classList.remove('active');

    if (screen.id === `${screenId}-screen`) {
      screen.classList.add('active');
    }
  });
}

navItems.forEach(item => {

  item.addEventListener('click', function (e) {

    e.preventDefault();

    navigateTo(this.dataset.screen);
  });
});

// ======================
// MODALES
// ======================

function openModal(modalId) {

  const modal = document.getElementById(modalId);

  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {

  const modal = document.getElementById(modalId);

  if (modal) {
    modal.classList.remove('active');
  }
}

// Cerrar modal haciendo click afuera
document.querySelectorAll('.modal').forEach(modal => {

  modal.addEventListener('click', function (e) {

    if (e.target === this) {
      this.classList.remove('active');
    }
  });
});

// Cerrar modal con ESC
document.addEventListener('keydown', function (e) {

  if (e.key === 'Escape') {

    document.querySelectorAll('.modal.active').forEach(modal => {

      modal.classList.remove('active');
    });
  }
});

// ======================
// ALERTAS
// ======================

function showAlert(message, type = 'success') {

  const alert = document.createElement('div');

  alert.className = `custom-alert ${type}`;

  alert.textContent = message;

  document.body.appendChild(alert);

  setTimeout(() => {
    alert.classList.add('show');
  }, 100);

  setTimeout(() => {

    alert.classList.remove('show');

    setTimeout(() => {
      alert.remove();
    }, 300);

  }, 3000);
}

// ======================
// PRODUCTOS
// ======================

const productoForm = document.querySelector('#producto-modal .modal-form');
const productosTable = document.querySelector('#productos-screen tbody');

function renderProductos() {

  if (!productosTable) return;

  productosTable.innerHTML = '';

  productos.forEach((producto, index) => {

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${producto.codigo}</td>
      <td>${producto.nombre}</td>
      <td>${producto.categoria}</td>
      <td>$${producto.precio}</td>
      <td>${producto.stock} unidades</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon edit-product" data-index="${index}">
            ✏️
          </button>

          <button class="btn-icon danger delete-product" data-index="${index}">
            🗑️
          </button>
        </div>
      </td>
    `;

    productosTable.appendChild(row);
  });

  activarBotonesProductos();
}

function activarBotonesProductos() {

  document.querySelectorAll('.delete-product').forEach(btn => {

    btn.addEventListener('click', function () {

      const index = this.dataset.index;

      productos.splice(index, 1);

      guardarDatos();

      renderProductos();

      showAlert('Producto eliminado');
    });
  });
}

if (productoForm) {

  productoForm.addEventListener('submit', function (e) {

    e.preventDefault();

    const inputs = this.querySelectorAll('input, select');

    const producto = {
      codigo: inputs[0]?.value || '',
      nombre: inputs[1]?.value || '',
      categoria: inputs[2]?.value || '',
      precio: inputs[3]?.value || '',
      stock: inputs[4]?.value || ''
    };

    if (!producto.codigo || !producto.nombre) {
      showAlert('Complete todos los campos', 'error');
      return;
    }

    productos.push(producto);

    guardarDatos();

    renderProductos();

    this.reset();

    closeModal('producto-modal');

    showAlert('Producto guardado correctamente');
  });
}

// ======================
// LOTES
// ======================

const loteForm = document.querySelector('#lote-modal .modal-form');
const lotesTable = document.querySelector('#lotes-screen tbody');

function renderLotes() {

  if (!lotesTable) return;

  lotesTable.innerHTML = '';

  lotes.forEach((lote, index) => {

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${lote.codigo}</td>
      <td>${lote.producto}</td>
      <td>${lote.cantidad}</td>
      <td>${lote.ingreso}</td>
      <td>${lote.caducidad}</td>

      <td>
        <span class="badge badge-success">
          Activo
        </span>
      </td>

      <td>
        <div class="action-buttons">

          <button class="btn-icon danger delete-lote" data-index="${index}">
            🗑️
          </button>

        </div>
      </td>
    `;

    lotesTable.appendChild(row);
  });

  activarBotonesLotes();
}

function activarBotonesLotes() {

  document.querySelectorAll('.delete-lote').forEach(btn => {

    btn.addEventListener('click', function () {

      const index = this.dataset.index;

      lotes.splice(index, 1);

      guardarDatos();

      renderLotes();

      showAlert('Lote eliminado');
    });
  });
}

if (loteForm) {

  loteForm.addEventListener('submit', function (e) {

    e.preventDefault();

    const inputs = this.querySelectorAll('input, select');

    const lote = {
      codigo: inputs[0]?.value || '',
      producto: inputs[1]?.value || '',
      cantidad: inputs[2]?.value || '',
      ingreso: inputs[3]?.value || '',
      caducidad: inputs[4]?.value || ''
    };

    if (!lote.codigo || !lote.producto) {
      showAlert('Complete todos los campos', 'error');
      return;
    }

    lotes.push(lote);

    guardarDatos();

    renderLotes();

    this.reset();

    closeModal('lote-modal');

    showAlert('Lote guardado correctamente');
  });
}

// ======================
// RIESGO
// ======================

const calcularRiesgoBtn = document.getElementById('calcular-riesgo-btn');

if (calcularRiesgoBtn) {

  calcularRiesgoBtn.addEventListener('click', function () {

    this.disabled = true;

    const original = this.innerHTML;

    this.innerHTML = `
      <span class="animate-spin">🔄</span>
      Calculando...
    `;

    setTimeout(() => {

      this.innerHTML = original;

      this.disabled = false;

      showAlert('Índice de riesgo actualizado');

    }, 2000);
  });
}

// ======================
// VENTAS RÁPIDAS
// ======================

document.querySelectorAll('.producto-quick-item').forEach(item => {

  item.addEventListener('click', function () {

    const name = this.querySelector('span:first-child')?.textContent;

    const price = this.querySelector('span:last-child')?.textContent;

    showAlert(`Producto agregado: ${name} ${price}`);
  });
});

// ======================
// GUARDAR DATOS
// ======================

function guardarDatos() {

  localStorage.setItem('productos', JSON.stringify(productos));

  localStorage.setItem('lotes', JSON.stringify(lotes));

  localStorage.setItem('ventas', JSON.stringify(ventas));
}

// ======================
// BUSCADOR PRODUCTOS
// ======================

const buscadorProductos = document.querySelector(
  '#productos-screen .search-box input'
);

if (buscadorProductos) {

  buscadorProductos.addEventListener('input', function () {

    const texto = this.value.toLowerCase();

    const filas = productosTable.querySelectorAll('tr');

    filas.forEach(fila => {

      const contenido = fila.textContent.toLowerCase();

      fila.style.display = contenido.includes(texto)
        ? ''
        : 'none';
    });
  });
}

// ======================
// BUSCADOR LOTES
// ======================

const buscadorLotes = document.querySelector(
  '#lotes-screen .search-box input'
);

if (buscadorLotes) {

  buscadorLotes.addEventListener('input', function () {

    const texto = this.value.toLowerCase();

    const filas = lotesTable.querySelectorAll('tr');

    filas.forEach(fila => {

      const contenido = fila.textContent.toLowerCase();

      fila.style.display = contenido.includes(texto)
        ? ''
        : 'none';
    });
  });
}

// ======================
// INICIALIZACIÓN
// ======================

document.addEventListener('DOMContentLoaded', function () {

  renderProductos();

  renderLotes();

  const style = document.createElement('style');

  style.textContent = `

    .animate-spin{
      display:inline-block;
      animation: spin 1s linear infinite;
    }

    @keyframes spin{
      from{
        transform: rotate(0deg);
      }
      to{
        transform: rotate(360deg);
      }
    }

    .custom-alert{
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 14px 20px;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      opacity: 0;
      transform: translateY(-20px);
      transition: 0.3s;
      z-index: 9999;
    }

    .custom-alert.show{
      opacity: 1;
      transform: translateY(0);
    }

    .custom-alert.success{
      background: #16a34a;
    }

    .custom-alert.error{
      background: #dc2626;
    }
  `;

  document.head.appendChild(style);
});
