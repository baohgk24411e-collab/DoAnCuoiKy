// js/common.js

// Shared initialization on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lang
  const currentLang = localStorage.getItem("tqg_lang") || "vi";
  document.body.className = "lang-" + currentLang;

  // 1b. Update search placeholder based on language
  const searchInput = document.getElementById("header-search-input");
  if (searchInput) {
    searchInput.placeholder = currentLang === "en" ? "Search products..." : "Tìm sản phẩm...";
  }

  // 2. Initialize database if not exists
  if (!localStorage.getItem("tqg_products")) {
    // If window.MOCK_PRODUCTS is loaded via script tag first
    if (window.MOCK_PRODUCTS) {
      localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
    }
  } else {
    window.MOCK_PRODUCTS = JSON.parse(localStorage.getItem("tqg_products"));
  }

  // 3. Initialize mock users if not exists
  if (!localStorage.getItem("tqg_users")) {
    if (window.MOCK_USERS) {
      localStorage.setItem("tqg_users", JSON.stringify(window.MOCK_USERS));
    }
  } else {
    window.MOCK_USERS = JSON.parse(localStorage.getItem("tqg_users"));
  }

  // 4. Setup roots
  setupCommonRoots();

  // 5. Update header dynamic displays (Cart, Account, active styles)
  updateHeaderState();

  // 6. Bind global event listeners
  bindCommonEvents();
});

// Setup toast container & modal overlay dynamically
function setupCommonRoots() {
  if (!document.getElementById("toast-container")) {
    const toastCont = document.createElement("div");
    toastCont.id = "toast-container";
    toastCont.className = "toast-container";
    document.body.appendChild(toastCont);
  }

  if (!document.getElementById("modal-overlay")) {
    const modalOver = document.createElement("div");
    modalOver.id = "modal-overlay";
    modalOver.className = "modal-overlay";
    modalOver.innerHTML = `
      <div class="modal-content-card">
        <button class="modal-close-btn" onclick="window.closeCustomModal()">&times;</button>
        <div id="modal-body-content"></div>
      </div>
    `;
    modalOver.addEventListener("click", (e) => {
      if (e.target === modalOver) window.closeCustomModal();
    });
    document.body.appendChild(modalOver);
  }
}

// Update header cart badge and user profile links
function updateHeaderState() {
  // Update cart badge
  const cartBadge = document.getElementById("header-cart-badge");
  if (cartBadge && window.CartService) {
    const count = window.CartService.getCartCount();
    if (count > 0) {
      cartBadge.style.display = "flex";
      cartBadge.innerText = count;
    } else {
      cartBadge.style.display = "none";
    }
  }

  // Update profile button
  const profileBtn = document.getElementById("header-profile-btn");
  const profileTxtVi = document.getElementById("header-profile-txt-vi");
  const profileTxtEn = document.getElementById("header-profile-txt-en");
  
  if (profileBtn && window.AuthService) {
    const currentUser = window.AuthService.getCurrentUser();
    if (currentUser) {
      if (currentUser.isAdmin) {
        profileBtn.setAttribute("href", "admin-dashboard.html");
        if (profileTxtVi) profileTxtVi.innerText = "Quản trị";
        if (profileTxtEn) profileTxtEn.innerText = "Admin";
      } else {
        profileBtn.setAttribute("href", "profile.html");
        const firstName = currentUser.name.split(" ").pop();
        if (profileTxtVi) profileTxtVi.innerText = firstName;
        if (profileTxtEn) profileTxtEn.innerText = firstName;
      }
    } else {
      profileBtn.setAttribute("href", "login.html");
      if (profileTxtVi) profileTxtVi.innerText = "Tài khoản";
      if (profileTxtEn) profileTxtEn.innerText = "Account";
    }
  }
}

// Event listeners for static pages
function bindCommonEvents() {
  // Language switcher trigger
  const langToggle = document.getElementById("lang-toggle-btn");
  if (langToggle) {
    langToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const current = localStorage.getItem("tqg_lang") || "vi";
      const nextLang = current === "vi" ? "en" : "vi";
      localStorage.setItem("tqg_lang", nextLang);
      document.body.className = "lang-" + nextLang;
      window.location.reload();
    });
  }

  // Mobile menu drawer
  const mobileToggle = document.getElementById("mobile-toggle");
  const mainNav = document.getElementById("main-nav");
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  // Header Search Input
  const searchInput = document.getElementById("header-search-input");
  const searchBtn = document.getElementById("header-search-btn");

  const executeSearch = () => {
    if (!searchInput) return;
    const q = searchInput.value.trim();
    if (q) {
      window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    }
  };

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") executeSearch();
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", executeSearch);
  }
}

// TOAST NOTIFICATIONS
window.showToast = function(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-primary);"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-danger);"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};

// CUSTOM MODAL
window.showCustomModal = function(htmlContent) {
  const overlay = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-body-content");
  
  if (overlay && content) {
    content.innerHTML = htmlContent;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
};

window.closeCustomModal = function() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
};

// CUSTOM CONFIRMATION MODAL (Bypasses native alerts for custom look)
window.showConfirmModal = function(message, onConfirm) {
  const isEn = document.body.classList.contains("lang-en");
  const yesText = isEn ? "Confirm" : "Đồng ý";
  const noText = isEn ? "Cancel" : "Hủy bỏ";
  
  const content = `
    <div style="text-align: center; padding: 15px 10px;">
      <h3 style="margin-bottom: 15px; font-size: 16px; color: var(--color-text-dark); line-height: 1.5;">${message}</h3>
      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
        <button class="btn btn-outline" onclick="window.closeCustomModal()" style="padding: 8px 20px; font-size: 13.5px;">${noText}</button>
        <button class="btn btn-primary" id="confirm-modal-yes-btn" style="padding: 8px 20px; font-size: 13.5px;">${yesText}</button>
      </div>
    </div>
  `;
  window.showCustomModal(content);
  
  const yesBtn = document.getElementById("confirm-modal-yes-btn");
  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      window.closeCustomModal();
      onConfirm();
    });
  }
};

// Parse URL search parameters helper
window.getUrlParam = function(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Global helper to format prices
window.formatVND = function(price) {
  return price.toLocaleString() + "đ";
};
