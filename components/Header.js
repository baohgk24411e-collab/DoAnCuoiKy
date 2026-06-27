// components/Header.js
window.Components = window.Components || {};

window.Components.Header = function() {
  const cartCount = window.CartService.getCartCount();
  const currentUser = window.AuthService.getCurrentUser();
  
  // Determine profile link/text
  let accountLink = "#login";
  let accountText = "Tài khoản";
  let accountIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>`;

  if (currentUser) {
    if (currentUser.isAdmin) {
      accountLink = "#admin-dashboard";
      accountText = "Quản trị";
      accountIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>`;
    } else {
      accountLink = "#profile";
      accountText = currentUser.name.split(" ").pop(); // Show first name
    }
  }

  return `
    <header class="main-header">
      <div class="header-container container">
        <!-- Logo -->
        <a href="#home" class="logo">
          <img src="images/logo/logo ngang.png" alt="Tứ Quý Garden Logo" class="logo-img">
        </a>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle Navigation">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <!-- Navigation Menu -->
        <nav class="main-nav" id="main-nav">
          <ul class="nav-list">
            <li><a href="#home" class="nav-link">Trang chủ</a></li>
            <li><a href="#about" class="nav-link">Về chúng tôi</a></li>
            <li class="dropdown">
              <a href="#products" class="nav-link dropdown-toggle">
                Sản phẩm
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-chevron">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </a>
              <ul class="dropdown-menu">
                <li><a href="#products?category=all">Tất cả sản phẩm</a></li>
                <li><a href="#products?category=Fruits">Trái cây tươi ngon</a></li>
                <li><a href="#products?category=Nutritional%20Seeds">Hạt dinh dưỡng</a></li>
                <li><a href="#products?category=Granola">Granola ngũ cốc</a></li>
                <li><a href="#products?category=Combo%20Healthy">Combo sống khỏe</a></li>
                <li><a href="#products?filter=seasonal">Sản phẩm theo mùa</a></li>
              </ul>
            </li>
            <li><a href="#traceability" class="nav-link">Truy xuất nguồn gốc</a></li>
          </ul>
        </nav>

        <!-- Right Icons Group -->
        <div class="header-actions">
          <!-- Search Bar -->
          <div class="search-bar">
            <input type="text" placeholder="Tìm sản phẩm..." id="header-search-input">
            <button class="search-btn" id="header-search-btn" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <!-- Account -->
          <a href="${accountLink}" class="action-icon-btn profile-btn" title="${accountText}">
            ${accountIcon}
            <span class="btn-text">${accountText}</span>
          </a>

          <!-- Cart -->
          <a href="#cart" class="action-icon-btn cart-btn" title="Giỏ hàng">
            <div class="cart-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ""}
            </div>
            <span class="btn-text">Giỏ hàng</span>
          </a>
        </div>
      </div>
    </header>
  `;
};
