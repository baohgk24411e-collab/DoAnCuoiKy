// js/admin.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Guard check: Must be Admin
  if (window.AuthService) {
    const user = window.AuthService.getCurrentUser();
    if (!user || !user.isAdmin) {
      window.location.href = "login.html";
      return;
    }
  }

  // 2. Dispatch to specific page controllers
  const pathname = window.location.pathname;

  if (pathname.includes("admin-dashboard.html")) {
    initAdminDashboard();
  } else if (pathname.includes("admin-products.html")) {
    initAdminProducts();
  } else if (pathname.includes("admin-orders.html")) {
    initAdminOrders();
  }
});

// Logout handler
window.handleAdminLogout = function() {
  if (window.AuthService) {
    window.AuthService.logout();
    window.showToast("Đăng xuất quản trị viên thành công.", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  }
};

// Reset mockup data
window.resetAdminDataMockup = function() {
  window.showConfirmModal("Bạn có chắc chắn muốn khôi phục toàn bộ Dữ liệu gốc sản phẩm và đơn hàng mẫu?", () => {
    localStorage.removeItem("tqg_products");
    localStorage.removeItem("tqg_orders");
    window.showToast("Đã khôi phục dữ liệu gốc thành công!", "success");
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  });
};

/* ==========================================================================
   ADMIN DASHBOARD SECTION
   ========================================================================== */
function initAdminDashboard() {
  if (!window.OrderService) return;

  const kpis = window.OrderService.getAdminKPIs();
  
  // Update KPI counters
  const rev = document.getElementById("kpi-revenue");
  const ords = document.getElementById("kpi-orders");
  const custs = document.getElementById("kpi-customers");

  if (rev) rev.innerText = (window.formatVND ? window.formatVND(kpis.revenue) : kpis.revenue.toLocaleString() + "đ");
  if (ords) ords.innerText = kpis.totalOrders;
  if (custs) custs.innerText = kpis.totalCustomers;

  // Render bestsellers in dashboard
  const bestBody = document.getElementById("bestsellers-list-body");
  if (bestBody) {
    if (kpis.bestSellers.length === 0) {
      bestBody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:var(--color-text-light);">Chưa có dữ liệu</td></tr>`;
    } else {
      bestBody.innerHTML = kpis.bestSellers.map(p => `
        <tr>
          <td>
            <div style="display:flex; gap:10px; align-items:center;">
              <img src="${p.image}" alt="" style="width:30px; height:30px; object-fit:contain; background:white; border:1px solid var(--color-gray-border); border-radius:4px;">
              <strong>${p.name}</strong>
            </div>
          </td>
          <td style="text-align: right; font-weight:700; color:var(--color-primary);">${p.sales} <span class="lang-vi">đã bán</span><span class="lang-en">sold</span></td>
        </tr>
      `).join("");
    }
  }

  // Render low stock alerts
  const lowBody = document.getElementById("lowstock-list-body");
  if (lowBody) {
    if (kpis.lowStock.length === 0) {
      lowBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--color-success); font-weight:600;">Mọi sản phẩm đều có tồn kho an toàn!</td></tr>`;
    } else {
      lowBody.innerHTML = kpis.lowStock.map(p => `
        <tr>
          <td>#${p.id}</td>
          <td><img src="${p.image}" alt="" style="width:35px; height:35px; object-fit:contain; background:white; border:1px solid var(--color-gray-border); border-radius:4px;"></td>
          <td><strong>${p.name}</strong></td>
          <td>${window.formatVND ? window.formatVND(p.price) : p.price + 'đ'}</td>
          <td style="text-align: right;" class="stock-critical">${p.stock}</td>
        </tr>
      `).join("");
    }
  }

  // Animate css bar heights based on sales from orders
  const orders = window.OrderService.getOrders();
  let salesRegion = { "Cái Bè": 0, "Mộc Châu": 0, "Tây Nguyên": 0, "Bến Tre": 0 };
  
  orders.forEach(order => {
    if (order.status !== "Đã hủy") {
      order.items.forEach(item => {
        const prod = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
        if (prod) {
          if (prod.region.includes("Cái Bè") || prod.region.includes("Tiền Giang")) salesRegion["Cái Bè"] += item.price * item.quantity;
          else if (prod.region.includes("Mộc Châu") || prod.region.includes("Sơn La")) salesRegion["Mộc Châu"] += item.price * item.quantity;
          else if (prod.region.includes("Tây Nguyên") || prod.region.includes("Đắk Lắk") || prod.region.includes("Gia Lai")) salesRegion["Tây Nguyên"] += item.price * item.quantity;
          else if (prod.region.includes("Bến Tre")) salesRegion["Bến Tre"] += item.price * item.quantity;
        }
      });
    }
  });

  const maxVal = Math.max(100000, salesRegion["Cái Bè"], salesRegion["Mộc Châu"], salesRegion["Tây Nguyên"], salesRegion["Bến Tre"]);
  const animateBar = (id, val) => {
    const el = document.getElementById(id);
    if (el) {
      const hPercent = Math.max(8, Math.round((val / maxVal) * 85));
      el.style.height = hPercent + "%";
      const tooltip = el.querySelector(".chart-bar-tooltip");
      if (tooltip) {
        const valText = (val / 1000000).toFixed(1) + "Mđ";
        tooltip.innerText = `${el.parentElement.querySelector(".chart-label").innerText}: ${valText}`;
      }
    }
  };

  animateBar("chart-cai-be", salesRegion["Cái Bè"]);
  animateBar("chart-moc-chau", salesRegion["Mộc Châu"]);
  animateBar("chart-tay-nguyen", salesRegion["Tây Nguyên"]);
  animateBar("chart-ben-tre", salesRegion["Bến Tre"]);
}


/* ==========================================================================
   ADMIN PRODUCTS (CRUD) SECTION
   ========================================================================== */
let productSearchQuery = "";
let productCategoryFilter = "all";

function initAdminProducts() {
  renderProductsList();
}

function renderProductsList() {
  const tbody = document.getElementById("inventory-table-body");
  const countTxt = document.getElementById("inventory-total-txt");
  if (!tbody) return;

  let products = window.MOCK_PRODUCTS || [];

  // Apply search filtering
  if (productSearchQuery) {
    const q = productSearchQuery.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q));
  }

  // Apply category filtering
  if (productCategoryFilter !== "all") {
    products = products.filter(p => p.category === productCategoryFilter);
  }

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px 0; color:var(--color-text-light);">Không tìm thấy sản phẩm nào khớp bộ lọc.</td></tr>`;
    if (countTxt) countTxt.innerText = "Đang hiển thị 0 sản phẩm";
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr id="prod-row-${p.id}">
      <td>#${p.id}</td>
      <td>
        <img src="${p.image}" alt="" class="prod-thumb" onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Fruit'">
      </td>
      <td>
        <strong>${p.name}</strong><br>
        <span style="font-size:11px; color:var(--color-text-light);">${p.nameEn || p.name}</span>
      </td>
      <td style="font-weight:500;">${translateCategoryName(p.category)}</td>
      <td style="font-weight:700; color:var(--color-primary);">${window.formatVND ? window.formatVND(p.price) : p.price + 'đ'}</td>
      <td style="text-align: center; font-weight:600;" class="${p.stock < 15 ? "stock-critical" : ""}">${p.stock}</td>
      <td>
        <div class="action-btn-group">
          <button class="action-btn btn-edit" onclick="openEditProductModal(${p.id})">Sửa</button>
          <button class="action-btn btn-delete" onclick="deleteProduct(${p.id})">Xóa</button>
        </div>
      </td>
    </tr>
  `).join("");

  if (countTxt) {
    countTxt.innerText = `Đang hiển thị ${products.length} trên tổng số ${window.MOCK_PRODUCTS.length} sản phẩm`;
  }
}

function translateCategoryName(cat) {
  const trans = {
    "Fruits": "Trái cây tươi",
    "Nutritional Seeds": "Hạt dinh dưỡng",
    "Granola": "Granola ngũ cốc",
    "Combo Healthy": "Combo sống khỏe"
  };
  return trans[cat] || cat;
}

window.handleInventorySearch = function(val) {
  productSearchQuery = val.trim();
  renderProductsList();
};

window.handleInventoryCategoryFilter = function(val) {
  productCategoryFilter = val;
  renderProductsList();
};

// OPEN ADD PRODUCT MODAL
window.openAddProductModal = function() {
  const formHTML = `
    <h3 style="font-size:18px; margin-bottom:20px; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px; color:var(--color-primary);">Thêm sản phẩm mới</h3>
    <form id="add-product-form" onsubmit="saveNewProduct(event)">
      <div class="admin-form-row">
        <div class="auth-form-group">
          <label>Tên sản phẩm (Tiếng Việt) *</label>
          <input type="text" id="add-p-name-vi" class="auth-input" required placeholder="Ví dụ: Dưa lưới Huỳnh Long">
        </div>
        <div class="auth-form-group">
          <label>Tên sản phẩm (Tiếng Anh) *</label>
          <input type="text" id="add-p-name-en" class="auth-input" required placeholder="Huynh Long Cantaloupe">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="auth-form-group">
          <label>Danh mục *</label>
          <select id="add-p-category" class="auth-select" style="height:41px;">
            <option value="Fruits">Trái cây tươi</option>
            <option value="Nutritional Seeds">Hạt dinh dưỡng</option>
            <option value="Granola">Granola ngũ cốc</option>
            <option value="Combo Healthy">Combo sống khỏe</option>
          </select>
        </div>
        <div class="auth-form-group">
          <label>Vùng trồng / Xuất xứ *</label>
          <input type="text" id="add-p-region" class="auth-input" required placeholder="Đồng Tháp">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="auth-form-group">
          <label>Đơn giá (VND) *</label>
          <input type="number" id="add-p-price" class="auth-input" required placeholder="85000">
        </div>
        <div class="auth-form-group">
          <label>Giá cũ (Không bắt buộc)</label>
          <input type="number" id="add-p-oldprice" class="auth-input" placeholder="105000">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="auth-form-group">
          <label>Số lượng tồn kho *</label>
          <input type="number" id="add-p-stock" class="auth-input" required placeholder="50">
        </div>
        <div class="auth-form-group">
          <label>Đường dẫn hình ảnh *</label>
          <input type="text" id="add-p-image" class="auth-input" required value="images/fruits/Mận.png" placeholder="images/fruits/fileName.png">
        </div>
      </div>

      <div class="admin-form-row" style="margin-bottom: 20px;">
        <label class="auth-checkbox-label">
          <input type="checkbox" id="add-p-seasonal">
          <span>Sản phẩm theo mùa</span>
        </label>
        <label class="auth-checkbox-label">
          <input type="checkbox" id="add-p-bestseller">
          <span>Sản phẩm bán chạy (Bestseller)</span>
        </label>
      </div>

      <div class="auth-form-group" style="margin-bottom:20px;">
        <label>Mô tả chi tiết sản phẩm *</label>
        <textarea id="add-p-description" rows="3" class="auth-input" required style="font-family:inherit; padding:10px;" placeholder="Dưa lưới Huỳnh Long trồng công nghệ cao, cơm vàng giòn, ngọt thanh..."></textarea>
      </div>

      <div style="display:flex; justify-content: flex-end; gap:10px;">
        <button type="button" class="btn btn-outline" onclick="window.closeCustomModal()">Hủy</button>
        <button type="submit" class="btn btn-primary">Lưu sản phẩm</button>
      </div>
    </form>
  `;
  window.showCustomModal(formHTML);
};

// SAVE NEW PRODUCT
window.saveNewProduct = function(e) {
  e.preventDefault();

  const nameVi = document.getElementById("add-p-name-vi").value.trim();
  const nameEn = document.getElementById("add-p-name-en").value.trim();
  const category = document.getElementById("add-p-category").value;
  const region = document.getElementById("add-p-region").value.trim();
  const price = parseInt(document.getElementById("add-p-price").value);
  const oldPriceVal = document.getElementById("add-p-oldprice").value;
  const oldPrice = oldPriceVal ? parseInt(oldPriceVal) : null;
  const stock = parseInt(document.getElementById("add-p-stock").value);
  const image = document.getElementById("add-p-image").value.trim();
  const isSeasonal = document.getElementById("add-p-seasonal").checked;
  const isBestSeller = document.getElementById("add-p-bestseller").checked;
  const descriptionVi = document.getElementById("add-p-description").value.trim();

  // Create new product
  const nextId = window.MOCK_PRODUCTS.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;

  const newProd = {
    id: nextId,
    name: nameVi,
    nameEn: nameEn,
    category,
    region,
    price,
    oldPrice,
    stock,
    image,
    isSeasonal,
    isBestSeller,
    rating: 4.8, // Default rating
    description: descriptionVi,
    storageVi: "Bảo quản ngăn mát tủ lạnh từ 4°C - 8°C.",
    storageEn: "Keep refrigerated between 4°C - 8°C.",
    nutrition: {
      calories: "45 kcal",
      sugar: "9.8g",
      vitaminC: "15%",
      potassium: "5%"
    }
  };

  window.MOCK_PRODUCTS.push(newProd);
  localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
  window.closeCustomModal();
  window.showToast("Đã thêm sản phẩm mới thành công!", "success");
  renderProductsList();
};

// OPEN EDIT PRODUCT MODAL
window.openEditProductModal = function(id) {
  const p = window.MOCK_PRODUCTS.find(prod => prod.id === id);
  if (!p) return;

  const formHTML = `
    <h3 style="font-size:18px; margin-bottom:20px; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px; color:var(--color-primary);">Chỉnh sửa thông tin sản phẩm #${p.id}</h3>
    <form id="edit-product-form" onsubmit="saveEditedProduct(event, ${p.id})">
      <div class="admin-form-row">
        <div class="auth-form-group">
          <label>Tên sản phẩm (Tiếng Việt) *</label>
          <input type="text" id="edit-p-name-vi" class="auth-input" required value="${p.name}">
        </div>
        <div class="auth-form-group">
          <label>Tên sản phẩm (Tiếng Anh) *</label>
          <input type="text" id="edit-p-name-en" class="auth-input" required value="${p.nameEn || p.name}">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="auth-form-group">
          <label>Danh mục *</label>
          <select id="edit-p-category" class="auth-select" style="height:41px;">
            <option value="Fruits" ${p.category === "Fruits" ? "selected" : ""}>Trái cây tươi</option>
            <option value="Nutritional Seeds" ${p.category === "Nutritional Seeds" ? "selected" : ""}>Hạt dinh dưỡng</option>
            <option value="Granola" ${p.category === "Granola" ? "selected" : ""}>Granola ngũ cốc</option>
            <option value="Combo Healthy" ${p.category === "Combo Healthy" ? "selected" : ""}>Combo sống khỏe</option>
          </select>
        </div>
        <div class="auth-form-group">
          <label>Vùng trồng / Xuất xứ *</label>
          <input type="text" id="edit-p-region" class="auth-input" required value="${p.region}">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="auth-form-group">
          <label>Đơn giá (VND) *</label>
          <input type="number" id="edit-p-price" class="auth-input" required value="${p.price}">
        </div>
        <div class="auth-form-group">
          <label>Giá cũ (Không bắt buộc)</label>
          <input type="number" id="edit-p-oldprice" class="auth-input" value="${p.oldPrice || ""}">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="auth-form-group">
          <label>Số lượng tồn kho *</label>
          <input type="number" id="edit-p-stock" class="auth-input" required value="${p.stock}">
        </div>
        <div class="auth-form-group">
          <label>Đường dẫn hình ảnh *</label>
          <input type="text" id="edit-p-image" class="auth-input" required value="${p.image}">
        </div>
      </div>

      <div class="admin-form-row" style="margin-bottom: 20px;">
        <label class="auth-checkbox-label">
          <input type="checkbox" id="edit-p-seasonal" ${p.isSeasonal ? "checked" : ""}>
          <span>Sản phẩm theo mùa</span>
        </label>
        <label class="auth-checkbox-label">
          <input type="checkbox" id="edit-p-bestseller" ${p.isBestSeller ? "checked" : ""}>
          <span>Sản phẩm bán chạy (Bestseller)</span>
        </label>
      </div>

      <div class="auth-form-group" style="margin-bottom:20px;">
        <label>Mô tả chi tiết sản phẩm *</label>
        <textarea id="edit-p-description" rows="3" class="auth-input" required style="font-family:inherit; padding:10px;">${p.description || ""}</textarea>
      </div>

      <div style="display:flex; justify-content: flex-end; gap:10px;">
        <button type="button" class="btn btn-outline" onclick="window.closeCustomModal()">Hủy</button>
        <button type="submit" class="btn btn-primary">Cập nhật sản phẩm</button>
      </div>
    </form>
  `;
  window.showCustomModal(formHTML);
};

// SAVE EDITED PRODUCT
window.saveEditedProduct = function(e, id) {
  e.preventDefault();

  const idx = window.MOCK_PRODUCTS.findIndex(prod => prod.id === id);
  if (idx === -1) return;

  const nameVi = document.getElementById("edit-p-name-vi").value.trim();
  const nameEn = document.getElementById("edit-p-name-en").value.trim();
  const category = document.getElementById("edit-p-category").value;
  const region = document.getElementById("edit-p-region").value.trim();
  const price = parseInt(document.getElementById("edit-p-price").value);
  const oldPriceVal = document.getElementById("edit-p-oldprice").value;
  const oldPrice = oldPriceVal ? parseInt(oldPriceVal) : null;
  const stock = parseInt(document.getElementById("edit-p-stock").value);
  const image = document.getElementById("edit-p-image").value.trim();
  const isSeasonal = document.getElementById("edit-p-seasonal").checked;
  const isBestSeller = document.getElementById("edit-p-bestseller").checked;
  const descriptionVi = document.getElementById("edit-p-description").value.trim();

  // Update object
  window.MOCK_PRODUCTS[idx].name = nameVi;
  window.MOCK_PRODUCTS[idx].nameEn = nameEn;
  window.MOCK_PRODUCTS[idx].category = category;
  window.MOCK_PRODUCTS[idx].region = region;
  window.MOCK_PRODUCTS[idx].price = price;
  window.MOCK_PRODUCTS[idx].oldPrice = oldPrice;
  window.MOCK_PRODUCTS[idx].stock = stock;
  window.MOCK_PRODUCTS[idx].image = image;
  window.MOCK_PRODUCTS[idx].isSeasonal = isSeasonal;
  window.MOCK_PRODUCTS[idx].isBestSeller = isBestSeller;
  window.MOCK_PRODUCTS[idx].description = descriptionVi;

  localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
  window.closeCustomModal();
  window.showToast("Cập nhật thông tin sản phẩm thành công!", "success");
  renderProductsList();
};

// DELETE PRODUCT
window.deleteProduct = function(id) {
  const p = window.MOCK_PRODUCTS.find(prod => prod.id === id);
  if (!p) return;

  window.showConfirmModal(`Bạn có chắc chắn muốn xóa sản phẩm "${p.name}"? Hành động này không thể khôi phục.`, () => {
    window.MOCK_PRODUCTS = window.MOCK_PRODUCTS.filter(prod => prod.id !== id);
    localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
    window.showToast("Đã xóa sản phẩm khỏi kho hàng.", "success");
    renderProductsList();
  });
};


/* ==========================================================================
   ADMIN ORDERS SECTION
   ========================================================================== */
let orderSearchQuery = "";
let orderStatusFilter = "all";

function initAdminOrders() {
  renderOrdersList();
}

function renderOrdersList() {
  const tbody = document.getElementById("orders-table-body");
  const countTxt = document.getElementById("orders-total-txt");
  if (!tbody) return;

  if (!window.OrderService) return;
  let orders = window.OrderService.getOrders();

  // Apply search query (ID or customer name)
  if (orderSearchQuery) {
    const q = orderSearchQuery.toLowerCase();
    orders = orders.filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
  }

  // Apply status filter
  if (orderStatusFilter !== "all") {
    orders = orders.filter(o => o.status === orderStatusFilter);
  }

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px 0; color:var(--color-text-light);">Không tìm thấy đơn hàng nào.</td></tr>`;
    if (countTxt) countTxt.innerText = "Đang hiển thị 0 đơn hàng";
    return;
  }

  tbody.innerHTML = orders.map(o => {
    // Select status select tag background
    let statusClass = "status-cho-xac-nhan";
    if (o.status === "Đang xử lý") statusClass = "status-dang-xu-ly";
    if (o.status === "Đang giao") statusClass = "status-dang-giao";
    if (o.status === "Hoàn thành") statusClass = "status-hoan-thanh";
    if (o.status === "Đã hủy") statusClass = "status-da-huy";

    const dateText = new Date(o.date).toLocaleString();

    return `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>
          <strong>${o.customerName}</strong><br>
          <span style="font-size:11px; color:var(--color-text-light);">${o.customerPhone}</span>
        </td>
        <td>${dateText}</td>
        <td>💵 ${translatePaymentMethod(o.paymentMethod)}</td>
        <td style="font-weight:700; color:var(--color-primary);">${window.formatVND ? window.formatVND(o.total) : o.total.toLocaleString() + 'đ'}</td>
        <td>
          <select class="status-select ${statusClass}" onchange="changeOrderStatus('${o.id}', this.value)">
            <option value="Chờ xác nhận" ${o.status === "Chờ xác nhận" ? "selected" : ""}>Chờ xác nhận</option>
            <option value="Đang xử lý" ${o.status === "Đang xử lý" ? "selected" : ""}>Đang xử lý</option>
            <option value="Đang giao" ${o.status === "Đang giao" ? "selected" : ""}>Đang giao</option>
            <option value="Hoàn thành" ${o.status === "Hoàn thành" ? "selected" : ""}>Hoàn thành</option>
            <option value="Đã hủy" ${o.status === "Đã hủy" ? "selected" : ""}>Đã hủy</option>
          </select>
        </td>
        <td style="text-align: center;">
          <button class="action-btn btn-edit" onclick="openOrderDetailsModal('${o.id}')">Chi tiết</button>
        </td>
      </tr>
    `;
  }).join("");

  if (countTxt) {
    countTxt.innerText = `Đang hiển thị ${orders.length} đơn hàng`;
  }
}

function translatePaymentMethod(p) {
  const trans = {
    "COD": "COD",
    "E-wallet": "Ví điện tử",
    "Bank transfer": "Chuyển khoản"
  };
  return trans[p] || p;
}

window.handleOrdersSearch = function(val) {
  orderSearchQuery = val.trim();
  renderOrdersList();
};

window.filterOrdersByStatus = function(val) {
  orderStatusFilter = val;
  
  // Update active tab styles
  const statuses = ["all", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"];
  const ids = ["all", "pending", "processing", "shipping", "completed", "cancelled"];
  
  statuses.forEach((s, idx) => {
    const tabEl = document.getElementById(`tab-status-${ids[idx]}`);
    if (tabEl) {
      if (s === val) tabEl.classList.add("active");
      else tabEl.classList.remove("active");
    }
  });

  renderOrdersList();
};

// CHANGE ORDER STATUS IN SELECT
window.changeOrderStatus = function(id, newStatus) {
  if (!window.OrderService) return;

  const result = window.OrderService.updateOrderStatus(id, newStatus);
  if (result.success) {
    window.showToast(result.message, "success");
    renderOrdersList();
  } else {
    window.showToast(result.message, "error");
  }
};

// VIEW DETAILED ORDER MODAL
window.openOrderDetailsModal = function(id) {
  if (!window.OrderService) return;
  const o = window.OrderService.getOrderById(id);
  if (!o) return;

  const itemsHTML = o.items.map(item => `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-gray-light); padding:10px 0; font-size:13px;">
      <div style="display:flex; gap:10px; align-items:center;">
        <img src="${item.image}" alt="" style="width:40px; height:40px; object-fit:contain; border:1px solid var(--color-gray-border); border-radius:4px; background:white;">
        <div>
          <strong style="color:var(--color-text-dark);">${item.name}</strong><br>
          <span style="font-size:11px; color:var(--color-text-light);">${window.formatVND ? window.formatVND(item.price) : item.price + 'đ'} x ${item.quantity}</span>
        </div>
      </div>
      <strong>${window.formatVND ? window.formatVND(item.price * item.quantity) : (item.price * item.quantity) + 'đ'}</strong>
    </div>
  `).join("");

  const detailsHTML = `
    <h3 style="font-size:18px; margin-bottom:20px; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px; color:var(--color-primary);">Đơn hàng #${o.id}</h3>
    <div style="max-height: 480px; overflow-y: auto; padding-right:10px;">
      <div style="font-size:13px; line-height:1.6; margin-bottom:20px; background-color:var(--color-cream-light); padding:15px; border-radius:8px; border:1px solid var(--color-gray-border);">
        <h4 style="margin:0 0 10px 0; color:var(--color-text-dark); border-bottom:1px solid var(--color-gray-border); padding-bottom:5px;">Thông tin khách giao nhận</h4>
        <strong>Tên người nhận:</strong> ${o.customerName}<br>
        <strong>Điện thoại:</strong> ${o.customerPhone}<br>
        <strong>Email:</strong> ${o.customerEmail || 'Trống'}<br>
        <strong>Địa chỉ nhận hàng:</strong> ${o.address}<br>
        <strong>Ghi chú:</strong> ${o.note || 'Trống'}
      </div>

      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 10px 0; font-size:14px; color:var(--color-text-dark); border-bottom:1px solid var(--color-gray-border); padding-bottom:5px;">Sản phẩm đặt hàng</h4>
        ${itemsHTML}
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; font-size:13.5px; border-top:1px solid var(--color-gray-border); padding-top:15px;">
        <div style="display:flex; justify-content:space-between;">
          <span>Tạm tính:</span>
          <span>${window.formatVND ? window.formatVND(o.subtotal) : o.subtotal + 'đ'}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Phí giao hàng:</span>
          <span>${o.shipping === 0 ? "Freeship" : (window.formatVND ? window.formatVND(o.shipping) : o.shipping + 'đ')}</span>
        </div>
        ${o.discount > 0 ? `
        <div style="display:flex; justify-content:space-between; color:var(--color-primary); font-weight:600;">
          <span>Mã giảm giá áp dụng:</span>
          <span>-${window.formatVND ? window.formatVND(o.discount) : o.discount + 'đ'}</span>
        </div>` : ""}
        <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:800; color:var(--color-primary); margin-top:5px; border-top:1px dashed var(--color-gray-border); padding-top:8px;">
          <span>Tổng thanh toán:</span>
          <span>${window.formatVND ? window.formatVND(o.total) : o.total + 'đ'}</span>
        </div>
      </div>
    </div>
    <div style="display:flex; justify-content: flex-end; gap:10px; margin-top:20px; border-top:1px solid var(--color-gray-border); padding-top:15px;">
      <button class="btn btn-primary" onclick="window.closeCustomModal()">Đóng cửa sổ</button>
    </div>
  `;

  window.showCustomModal(detailsHTML);
};
