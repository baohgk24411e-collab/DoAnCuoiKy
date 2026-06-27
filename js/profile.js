// js/profile.js

document.addEventListener("DOMContentLoaded", () => {
  if (!window.AuthService) return;

  const currentUser = window.AuthService.getCurrentUser();
  if (!currentUser) {
    // If not logged in, redirect to login
    window.location.href = "login.html";
    return;
  }

  // Admin should be on dashboard
  if (currentUser.isAdmin) {
    window.location.href = "admin-dashboard.html";
    return;
  }

  // 1. Setup user displays
  const sideName = document.getElementById("profile-sidebar-name");
  const sideEmail = document.getElementById("profile-sidebar-email");
  const avatarChar = document.getElementById("profile-avatar-char");

  if (sideName) sideName.innerText = currentUser.name;
  if (sideEmail) sideEmail.innerText = currentUser.email;
  if (avatarChar) avatarChar.innerText = currentUser.name.charAt(0);

  // 2. Prefill Form inputs
  const editForm = document.getElementById("profile-edit-form");
  if (editForm) {
    document.getElementById("profile-name").value = currentUser.name;
    document.getElementById("profile-email").value = currentUser.email;
    document.getElementById("profile-phone").value = currentUser.phone || "";
    document.getElementById("profile-goal").value = currentUser.healthGoal || "Eat Clean";

    editForm.addEventListener("submit", handleProfileSave);
  }

  // 3. Check hash or query param for tab
  const tab = window.getUrlParam ? window.getUrlParam("tab") : "";
  if (tab === "orders") {
    switchProfileTab("orders");
  } else if (tab === "wishlist") {
    switchProfileTab("wishlist");
  } else {
    switchProfileTab("info");
  }
});

// Profile Tab Switcher
window.switchProfileTab = function(tabName) {
  // Find all tab buttons
  const tabs = ["info", "orders", "wishlist"];
  tabs.forEach(t => {
    const btn = document.getElementById(`menu-tab-${t}`);
    const panel = document.getElementById(`panel-${t}`);
    if (btn) btn.classList.remove("active");
    if (panel) panel.style.display = "none";
  });

  const activeBtn = document.getElementById(`menu-tab-${tabName}`);
  const activePanel = document.getElementById(`panel-${tabName}`);

  if (activeBtn) activeBtn.classList.add("active");
  if (activePanel) {
    activePanel.style.display = "block";
    
    // Lazy render listings
    if (tabName === "orders") {
      renderOrderHistory();
    } else if (tabName === "wishlist") {
      renderWishlist();
    }
  }
};

// Handle Profile Save
function handleProfileSave(e) {
  e.preventDefault();

  const name = document.getElementById("profile-name").value.trim();
  const phone = document.getElementById("profile-phone").value.trim();
  const goal = document.getElementById("profile-goal").value;

  if (!window.AuthService) return;

  const result = window.AuthService.updateProfile(name, phone, goal);
  
  if (result.success) {
    window.showToast(result.message, "success");
    // Update sidebar displays
    const sideName = document.getElementById("profile-sidebar-name");
    if (sideName) sideName.innerText = name;
    
    const avatarChar = document.getElementById("profile-avatar-char");
    if (avatarChar) avatarChar.innerText = name.charAt(0);
    
    // Update header name display
    if (window.updateHeaderState) window.updateHeaderState();
  } else {
    window.showToast(result.message, "error");
  }
}

// Render User Order History
function renderOrderHistory() {
  const container = document.getElementById("order-history-container");
  if (!container || !window.OrderService || !window.AuthService) return;

  const currentUser = window.AuthService.getCurrentUser();
  const orders = window.OrderService.getUserOrders(currentUser.id);

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 0; color: var(--color-text-light);">
        <p><span class="lang-vi">Bạn chưa đặt đơn hàng nào.</span><span class="lang-en">You have not placed any orders yet.</span></p>
        <a href="products.html" class="btn btn-outline" style="margin-top: 15px; display:inline-block;"><span class="lang-vi">Mua sắm ngay</span><span class="lang-en">Shop Now</span></a>
      </div>
    `;
    return;
  }

  const isEn = document.body.classList.contains("lang-en");

  container.innerHTML = orders.map(order => {
    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    const itemsHTML = order.items.map(item => `
      <div class="order-item-row">
        <img src="${item.image}" alt="${item.name}" class="order-item-thumb">
        <div style="flex:1;">
          <h5 style="margin:0; font-size:13px; color:var(--color-text-dark);">${item.name}</h5>
          <span style="font-size:11px; color:var(--color-text-light);">${window.formatVND ? window.formatVND(item.price) : item.price + 'đ'} x ${item.quantity}</span>
        </div>
        <strong>${window.formatVND ? window.formatVND(item.price * item.quantity) : (item.price * item.quantity) + 'đ'}</strong>
      </div>
    `).join("");

    // Setup class based on status
    let statusClass = "status-cho-xac-nhan";
    if (order.status === "Đang xử lý") statusClass = "status-dang-xu-ly";
    if (order.status === "Đang giao") statusClass = "status-dang-giao";
    if (order.status === "Hoàn thành") statusClass = "status-hoan-thanh";
    if (order.status === "Đã hủy") statusClass = "status-da-huy";

    // Translate status for EN
    let statusLabel = order.status;
    if (isEn) {
      const trans = {
        "Chờ xác nhận": "Pending Confirmation",
        "Đang xử lý": "Processing",
        "Đang giao": "Shipping",
        "Hoàn thành": "Completed",
        "Đã hủy": "Cancelled"
      };
      statusLabel = trans[order.status] || order.status;
    }

    return `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <strong>#${order.id}</strong>
            <span style="margin: 0 10px; color: var(--color-gray-border);">|</span>
            <span>${new Date(order.date).toLocaleString()}</span>
          </div>
          <span class="order-status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="order-card-body">
          ${itemsHTML}
        </div>
        <div class="order-card-footer">
          <div style="font-size:13px; color: var(--color-text-light);">
            <span>${totalQty} <span class="lang-vi">sản phẩm</span><span class="lang-en">items</span></span>
          </div>
          <div>
            <span class="lang-vi">Tổng tiền:</span><span class="lang-en">Total:</span>
            <strong style="color:var(--color-primary); font-size:16px; margin-left: 5px;">
              ${window.formatVND ? window.formatVND(order.total) : order.total + 'đ'}
            </strong>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Render User Wishlist
function renderWishlist() {
  const container = document.getElementById("wishlist-items-container");
  if (!container || !window.AuthService || !window.Components.ProductCard) return;

  const wishlistIds = window.AuthService.getWishlist();

  if (wishlistIds.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 0; color: var(--color-text-light); grid-column: 1 / -1;">
        <p><span class="lang-vi">Chưa có sản phẩm yêu thích nào.</span><span class="lang-en">Your wishlist is empty.</span></p>
        <a href="products.html" class="btn btn-outline" style="margin-top: 15px; display:inline-block;"><span class="lang-vi">Khám phá sản phẩm</span><span class="lang-en">Browse Products</span></a>
      </div>
    `;
    return;
  }

  // Get matching products from MOCK_PRODUCTS
  const wishlistProducts = wishlistIds.map(id => window.MOCK_PRODUCTS.find(p => p.id === id)).filter(Boolean);

  container.innerHTML = wishlistProducts.map(p => window.Components.ProductCard(p)).join("");
}

// Log out click handler
window.handleLogoutClick = function() {
  if (!window.AuthService) return;

  const confirmMsg = document.body.classList.contains("lang-en") 
    ? "Are you sure you want to log out?" 
    : "Bạn có chắc chắn muốn đăng xuất tài khoản?";

  window.showConfirmModal(confirmMsg, () => {
    window.AuthService.logout();
    window.showToast(
      document.body.classList.contains("lang-en") ? "Logged out successfully" : "Đã đăng xuất tài khoản", 
      "success"
    );
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  });
};
