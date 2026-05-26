// === DOM Elements ===
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const navItems = document.querySelectorAll('.nav-item');
const contentScreens = document.querySelectorAll('.content-screen');

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
    
    // Get the modal
    const modal = this.closest('.modal');
    
    // Show success message (in a real app, this would save data)
    alert('Datos guardados exitosamente');
    
    // Close modal
    if (modal) {
      modal.classList.remove('active');
    }
    
    // Reset form
    this.reset();
  });
});

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

// === Quick Product Add (Venta Modal) ===
document.querySelectorAll('.producto-quick-item').forEach(item => {
  item.addEventListener('click', function() {
    const name = this.querySelector('span:first-child').textContent;
    const price = this.querySelector('span:last-child').textContent;
    
    // In a real app, this would add to cart
    alert(`Producto agregado: ${name} - ${price}`);
  });
});

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
});
