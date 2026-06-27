// js/cart.js

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
});

function translateCategory(cat) {
  const mapping = {
    "Fruits": "Trái cây tươi ngon",
    "Nutritional Seeds": "Hạt dinh dưỡng",
    "Granola": "Granola ngũ cốc",
    "Combo Healthy": "Combo sống khỏe"
  };
  return mapping[cat] || cat;
}

function renderCartPage() {
  const root = document.getElementById("cart-root");
  if (!root) return;

  if (!window.CartService) return;

  const cart = window.CartService.getCart();
  const totals = window.CartService.getCartTotals();
  const progress = window.CartService.getFreeshipProgress();

  const cartItems = cart.map(item => {
    const product = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product !== undefined);

  if (cartItems.length === 0) {
    renderEmptyCart(root);
    return;
  }

  const crossSell = window.MOCK_PRODUCTS
    .filter(p => p.isBestSeller && !cart.some(item => item.productId === p.id))
    .slice(0, 4);

  root.innerHTML = `
    <div class="cart-page-container container" style="margin-top: 20px; margin-bottom: 50px;">
      <!-- Breadcrumb -->
      <ul class="breadcrumb" style="display:flex; list-style:none; gap:10px; font-size:14px; margin-bottom:25px; padding:0;">
        <li><a href="index.html" style="color:var(--color-text-light);"><span class="lang-vi">Trang chủ</span><span class="lang-en">Home</span></a></li>
        <li><span style="color:var(--color-text-light);">/</span></li>
        <li style="color:var(--color-primary); font-weight:600;"><span class="lang-vi">Giỏ hàng của bạn</span><span class="lang-en">Your Cart</span></li>
      </ul>

      <h1 class="page-title font-serif" style="font-size:32px; color:var(--color-text-dark); margin-bottom:20px;">
        <span class="lang-vi">Giỏ Hàng Của Bạn</span><span class="lang-en">Your Shopping Cart</span>
      </h1>
      
      <!-- Freeship progress -->
      <div class="freeship-progress-banner bg-cream-light" style="background-color:var(--color-cream-light); padding:15px 20px; border-radius:12px; border:1px solid var(--color-gray-border); margin-bottom:30px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
          <span>
            <span class="lang-vi">
              ${progress.isFree 
                ? "🎉 Chúc mừng! Bạn đã được <strong>Miễn phí vận chuyển toàn quốc</strong>!" 
                : `Bạn cần mua thêm <strong>${progress.needed.toLocaleString()}đ</strong> nữa để được Freeship toàn quốc.`}
            </span>
            <span class="lang-en">
              ${progress.isFree 
                ? "🎉 Congratulations! You qualify for <strong>Free Shipping nationwide</strong>!" 
                : `Add <strong>${progress.needed.toLocaleString()}đ</strong> more to qualify for Free Shipping.`}
            </span>
          </span>
          <strong>${Math.round(progress.percentage)}%</strong>
        </div>
        <div class="progress-bar-bg" style="width: 100%; height: 8px; background-color: var(--color-gray-border); border-radius: 4px; overflow: hidden;">
          <div class="progress-bar-fill" style="width: ${progress.percentage}%; height: 100%; background-color: var(--color-primary); border-radius: 4px; transition: width 0.3s;"></div>
        </div>
      </div>

      <div class="cart-layout-grid" style="display:grid; grid-template-columns: 1fr 380px; gap:30px; align-items:start;">
        
        <!-- Left: Items list -->
        <div class="cart-items-column">
          <div class="cart-table-header" style="display:grid; grid-template-columns: 2fr 1fr 1fr 1fr 50px; padding:12px 15px; border-bottom:2px solid var(--color-gray-border); font-weight:700; font-size:14px; color:var(--color-text-dark);">
            <span><span class="lang-vi">Sản phẩm</span><span class="lang-en">Product</span></span>
            <span style="text-align:center;"><span class="lang-vi">Đơn giá</span><span class="lang-en">Price</span></span>
            <span style="text-align:center;"><span class="lang-vi">Số lượng</span><span class="lang-en">Qty</span></span>
            <span style="text-align:center;"><span class="lang-vi">Thành tiền</span><span class="lang-en">Subtotal</span></span>
            <span></span>
          </div>

          <div class="cart-items-list" style="margin-bottom:20px;">
            ${cartItems.map(item => `
              <div class="cart-item-row" style="display:grid; grid-template-columns: 2fr 1fr 1fr 1fr 50px; padding:20px 15px; border-bottom:1px solid var(--color-gray-border); align-items:center; font-size:14px;">
                <div class="col-product" style="display:flex; gap:15px; align-items:center;">
                  <img src="${item.product.image}" alt="${item.product.name}" style="width:65px; height:65px; border-radius:8px; object-fit:contain; background-color:var(--color-cream-light);">
                  <div>
                    <h4 style="margin:0 0 4px 0; font-size:15px; font-weight:700;"><a href="detail.html?id=${item.productId}" style="color:var(--color-text-dark);">${item.product.name}</a></h4>
                    <span style="font-size:11px; color:var(--color-text-light); display:block;">${translateCategory(item.product.category)}</span>
                    <span style="font-size:11px; color:var(--color-primary); display:block; font-weight:600;"><span class="lang-vi">Còn lại: ${item.product.stock}</span><span class="lang-en">Stock: ${item.product.stock}</span></span>
                  </div>
                </div>

                <div style="text-align:center;">
                  <span>${item.product.price.toLocaleString()}đ</span>
                </div>

                <div style="display:flex; justify-content:center;">
                  <div class="qty-adjuster-sm" style="display:flex; align-items:center; border:1px solid var(--color-gray-border); border-radius:4px; overflow:hidden; background:white;">
                    <button style="border:none; padding:4px 8px; background:none; cursor:pointer;" onclick="adjustQty(${item.productId}, -1)">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="${item.product.stock}" style="border:none; width:30px; text-align:center; outline:none; font-weight:600;" onchange="setQty(${item.productId}, this.value)">
                    <button style="border:none; padding:4px 8px; background:none; cursor:pointer;" onclick="adjustQty(${item.productId}, 1)">+</button>
                  </div>
                </div>

                <div style="text-align:center; font-weight:700; color:var(--color-text-dark);">
                  <span>${(item.product.price * item.quantity).toLocaleString()}đ</span>
                </div>

                <div style="text-align:center;">
                  <button style="border:none; background:none; cursor:pointer; color:var(--color-text-light);" onclick="removeItem(${item.productId})" title="Xóa">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;">
            <a href="products.html" class="btn btn-outline btn-sm">&larr; <span class="lang-vi">Tiếp tục mua sắm</span><span class="lang-en">Continue shopping</span></a>
            <button class="btn btn-secondary btn-xs" style="background-color:var(--color-danger); color:white; border:none;" onclick="clearCart()"><span class="lang-vi">Xóa sạch giỏ hàng</span><span class="lang-en">Clear Cart</span></button>
          </div>
        </div>

        <!-- Right: Summary cards -->
        <div class="cart-summary-column">
          <div class="summary-card" style="background-color:var(--color-cream-light); padding:25px; border-radius:12px; border:1px solid var(--color-gray-border);">
            <h3 style="font-size:18px; color:var(--color-text-dark); margin:0 0 20px 0; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px;">
              <span class="lang-vi">Tổng đơn hàng</span><span class="lang-en">Order Summary</span>
            </h3>
            
            <div style="display:flex; flex-direction:column; gap:12px; font-size:14px; margin-bottom:20px;">
              <div style="display:flex; justify-content:space-between;">
                <span><span class="lang-vi">Tạm tính:</span><span class="lang-en">Subtotal:</span></span>
                <span>${totals.subtotal.toLocaleString()}đ</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span><span class="lang-vi">Phí giao hàng:</span><span class="lang-en">Shipping:</span></span>
                <span>${totals.shipping === 0 ? "Freeship" : `${totals.shipping.toLocaleString()}đ`}</span>
              </div>

              ${totals.shippingDiscount > 0 ? `
                <div style="display:flex; justify-content:space-between; color:var(--color-primary); font-weight:600;">
                  <span><span class="lang-vi">Vận chuyển (Mã giảm):</span><span class="lang-en">Ship Promo:</span></span>
                  <span>-${totals.shippingDiscount.toLocaleString()}đ</span>
                </div>
              ` : ""}

              ${totals.discount > 0 ? `
                <div style="display:flex; justify-content:space-between; color:var(--color-primary); font-weight:600;">
                  <span><span class="lang-vi">Giảm giá mã (${totals.voucherCode}):</span><span class="lang-en">Voucher Discount:</span></span>
                  <span>-${totals.discount.toLocaleString()}đ</span>
                </div>
              ` : ""}

              <hr style="border:none; border-top:1px solid var(--color-gray-border); margin:5px 0;">

              <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; color:var(--color-primary);">
                <span><span class="lang-vi">Tổng cộng:</span><span class="lang-en">Total cost:</span></span>
                <span>${totals.total.toLocaleString()}đ</span>
              </div>
            </div>

            <!-- Voucher Box -->
            <div style="background:white; padding:15px; border-radius:8px; border:1px solid var(--color-gray-border); margin-bottom:20px;">
              <label style="font-weight:600; font-size:13px; display:block; margin-bottom:8px;"><span class="lang-vi">Nhập mã giảm giá:</span><span class="lang-en">Discount code:</span></label>
              <div style="display:flex; gap:8px;">
                <input type="text" id="cart-voucher-input" placeholder="Ví dụ: TUQUYGARDEN10" style="flex:1; padding:8px 10px; border-radius:6px; border:1px solid var(--color-gray-border); font-size:13px; outline:none;" value="${totals.voucherCode || ""}" ${totals.voucherCode ? "disabled" : ""}>
                ${totals.voucherCode 
                  ? `<button class="btn btn-danger" style="padding:8px 12px; font-size:13px;" onclick="removeVoucher()"><span class="lang-vi">Gỡ</span><span class="lang-en">Remove</span></button>`
                  : `<button class="btn btn-primary" style="padding:8px 12px; font-size:13px;" onclick="applyVoucher()"><span class="lang-vi">Áp dụng</span><span class="lang-en">Apply</span></button>`
                }
              </div>
              ${totals.voucherCode 
                ? `<p style="font-size:11px; color:var(--color-primary); margin-top:8px; font-weight:600;">✓ ${totals.voucherDescription}</p>` 
                : `<p style="font-size:10px; color:var(--color-text-light); margin-top:6px;">* Thử mã: <strong>TUQUYGARDEN10</strong> (giảm 10%) hoặc <strong>FREESHIP50</strong></p>`
              }
            </div>

            <a href="checkout.html" class="btn btn-primary btn-block btn-lg" style="font-size:15px; padding:12px 0;">
              <span class="lang-vi">Tiến hành thanh toán</span><span class="lang-en">Proceed to Checkout</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Cross sell -->
      ${crossSell.length === 0 ? "" : `
        <div class="cross-sell-section" style="margin-top: 50px; border-top:1px solid var(--color-gray-border); padding-top:40px;">
          <h2 class="section-title font-serif" style="font-size: 24px; margin-bottom:25px;">
            <span class="lang-vi">Bạn có thể thích thêm</span><span class="lang-en">You might also like</span>
          </h2>
          <div class="products-grid-4" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:20px;">
            ${crossSell.map(item => window.Components.ProductCard(item)).join("")}
          </div>
        </div>
      `}
    </div>
  `;
}

function renderEmptyCart(root) {
  root.innerHTML = `
    <div class="cart-page-container container text-center" style="padding: 100px 0;">
      <div class="empty-icon-circle" style="width:80px; height:80px; background-color:var(--color-cream-light); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px auto; color:var(--color-text-light);">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
      </div>
      <h2 class="font-serif" style="font-size:24px; margin-bottom:10px;">
        <span class="lang-vi">Giỏ hàng của bạn đang trống</span>
        <span class="lang-en">Your Cart is empty</span>
      </h2>
      <p style="color: var(--color-text-light); max-width: 500px; margin: 10px auto 25px auto; font-size:14px;">
        <span class="lang-vi">Hãy ghé thăm cửa hàng của chúng tôi để lựa chọn các loại trái cây chín ngọt và hạt dinh dưỡng cao cấp nhất.</span>
        <span class="lang-en">Visit our catalog to add ripe fruits and delicious seeds to your order.</span>
      </p>
      <a href="products.html" class="btn btn-primary btn-lg"><span class="lang-vi">Mua sắm ngay</span><span class="lang-en">Shop Now</span></a>
    </div>
  `;
}

window.adjustQty = function(productId, amount) {
  if (!window.CartService) return;
  const cart = window.CartService.getCart();
  const item = cart.find(i => i.productId === productId);
  if (item) {
    const nextVal = item.quantity + amount;
    const result = window.CartService.updateQuantity(productId, nextVal);
    if (result.success) {
      renderCartPage();
      if (window.updateHeaderState) window.updateHeaderState();
    } else {
      window.showToast(result.message, "error");
    }
  }
};

window.setQty = function(productId, val) {
  if (!window.CartService) return;
  const intVal = parseInt(val) || 1;
  const result = window.CartService.updateQuantity(productId, intVal);
  if (result.success) {
    renderCartPage();
    if (window.updateHeaderState) window.updateHeaderState();
  } else {
    window.showToast(result.message, "error");
  }
};

window.removeItem = function(productId) {
  if (!window.CartService) return;
  const result = window.CartService.removeFromCart(productId);
  if (result.success) {
    window.showToast(result.message, "success");
    renderCartPage();
    if (window.updateHeaderState) window.updateHeaderState();
  }
};

window.clearCart = function() {
  if (!window.CartService) return;
  if (confirm("Xóa toàn bộ giỏ hàng?")) {
    window.CartService.clearCart();
    window.showToast("Đã xóa sạch giỏ hàng.", "success");
    renderCartPage();
    if (window.updateHeaderState) window.updateHeaderState();
  }
};

window.applyVoucher = function() {
  if (!window.CartService) return;
  const input = document.getElementById("cart-voucher-input");
  if (!input || !input.value.trim()) {
    window.showToast("Vui lòng nhập mã.", "error");
    return;
  }
  const result = window.CartService.applyVoucher(input.value.trim());
  if (result.success) {
    window.showToast(result.message, "success");
    renderCartPage();
  } else {
    window.showToast(result.message, "error");
  }
};

window.removeVoucher = function() {
  if (!window.CartService) return;
  window.CartService.removeVoucher();
  window.showToast("Đã gỡ mã giảm giá.", "success");
  renderCartPage();
};
