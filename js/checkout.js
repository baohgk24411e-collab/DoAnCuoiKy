// js/checkout.js

let placedOrderId = "";

document.addEventListener("DOMContentLoaded", () => {
  placedOrderId = ""; // Reset
  renderCheckoutPage();
});

function renderCheckoutPage() {
  const root = document.getElementById("checkout-root");
  if (!root) return;

  if (placedOrderId) {
    renderSuccessScreen(root);
    return;
  }

  if (!window.CartService) return;
  const cart = window.CartService.getCart();

  if (cart.length === 0) {
    root.innerHTML = `
      <div class="checkout-page-container container text-center" style="padding: 100px 0;">
        <h2 class="font-serif"><span class="lang-vi">Giỏ hàng của bạn đang trống</span><span class="lang-en">Your Cart is empty</span></h2>
        <p><span class="lang-vi">Không có sản phẩm nào để thanh toán. Vui lòng quay lại mua sắm.</span><span class="lang-en">There are no items to checkout. Please shop first.</span></p>
        <a href="products.html" class="btn btn-primary" style="margin-top: 20px;"><span class="lang-vi">Quay lại cửa hàng</span><span class="lang-en">Return to Shop</span></a>
      </div>
    `;
    return;
  }

  const totals = window.CartService.getCartTotals();
  const currentUser = window.AuthService ? window.AuthService.getCurrentUser() || {} : {};
  
  const cartItems = cart.map(item => {
    const product = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(i => i.product !== undefined);

  root.innerHTML = `
    <div class="checkout-page-container container" style="margin-top: 20px; margin-bottom: 50px;">
      <!-- Breadcrumbs -->
      <ul class="breadcrumb" style="display:flex; list-style:none; gap:10px; font-size:14px; margin-bottom:25px; padding:0;">
        <li><a href="index.html" style="color:var(--color-text-light);"><span class="lang-vi">Trang chủ</span><span class="lang-en">Home</span></a></li>
        <li><span style="color:var(--color-text-light);">/</span></li>
        <li><a href="cart.html" style="color:var(--color-text-light);"><span class="lang-vi">Giỏ hàng</span><span class="lang-en">Cart</span></a></li>
        <li><span style="color:var(--color-text-light);">/</span></li>
        <li style="color:var(--color-primary); font-weight:600;"><span class="lang-vi">Thanh toán</span><span class="lang-en">Checkout</span></li>
      </ul>

      <h1 class="page-title font-serif" style="font-size:32px; color:var(--color-text-dark); margin-bottom:20px;">
        <span class="lang-vi">Thanh Toán Đơn Hàng</span><span class="lang-en">Checkout Order</span>
      </h1>

      <div class="checkout-layout-grid" style="display:grid; grid-template-columns: 1fr 380px; gap:30px; align-items:start;">
        <!-- Left: Forms -->
        <form class="checkout-form" id="checkout-form-submit" onsubmit="handlePlaceOrder(event)">
          
          <!-- Receipient details -->
          <div class="checkout-form-section bg-cream-light" style="background-color:var(--color-cream-light); padding:25px; border-radius:12px; border:1px solid var(--color-gray-border); margin-bottom:25px;">
            <h3 class="section-form-title font-serif" style="font-size:18px; margin-bottom:20px; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span class="lang-vi">Thông tin người nhận</span><span class="lang-en">Receiver Details</span>
            </h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
              <div class="form-group">
                <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;"><span class="lang-vi">Họ và tên *</span><span class="lang-en">Full Name *</span></label>
                <input type="text" id="checkout-name" required value="${currentUser.name || ""}" placeholder="Ví dụ: Nguyễn Hoàng Anh" style="width:100%; padding:10px 15px; border-radius:6px; border:1px solid var(--color-gray-border); outline:none;">
              </div>
              <div class="form-group">
                <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;"><span class="lang-vi">Số điện thoại *</span><span class="lang-en">Phone Number *</span></label>
                <input type="tel" id="checkout-phone" required value="${currentUser.phone || ""}" placeholder="Ví dụ: 0912345678" style="width:100%; padding:10px 15px; border-radius:6px; border:1px solid var(--color-gray-border); outline:none;">
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;">Email</label>
              <input type="email" id="checkout-email" value="${currentUser.email || ""}" placeholder="anhnguyen@gmail.com" style="width:100%; padding:10px 15px; border-radius:6px; border:1px solid var(--color-gray-border); outline:none;">
            </div>
          </div>

          <!-- Address details -->
          <div class="checkout-form-section bg-cream-light" style="background-color:var(--color-cream-light); padding:25px; border-radius:12px; border:1px solid var(--color-gray-border); margin-bottom:25px;">
            <h3 class="section-form-title font-serif" style="font-size:18px; margin-bottom:20px; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span class="lang-vi">Địa chỉ giao hàng</span><span class="lang-en">Delivery Address</span>
            </h3>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; margin-bottom:15px;">
              <div class="form-group">
                <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;"><span class="lang-vi">Tỉnh / Thành phố *</span><span class="lang-en">Province *</span></label>
                <select id="checkout-province" required onchange="handleProvinceChange(this.value)" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--color-gray-border); outline:none; height:41px;">
                  <option value=""><span class="lang-vi">Chọn Tỉnh/Thành</span><span class="lang-en">Select Province</span></option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Tiền Giang">Tiền Giang</option>
                </select>
              </div>
              
              <div class="form-group">
                <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;"><span class="lang-vi">Quận / Huyện *</span><span class="lang-en">District *</span></label>
                <select id="checkout-district" required onchange="handleDistrictChange(this.value)" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--color-gray-border); outline:none; height:41px;">
                  <option value=""><span class="lang-vi">Chọn Quận/Huyện</span><span class="lang-en">Select District</span></option>
                </select>
              </div>

              <div class="form-group">
                <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;"><span class="lang-vi">Phường / Xã *</span><span class="lang-en">Ward *</span></label>
                <select id="checkout-ward" required style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--color-gray-border); outline:none; height:41px;">
                  <option value=""><span class="lang-vi">Chọn Phường/Xã</span><span class="lang-en">Select Ward</span></option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:15px;">
              <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;"><span class="lang-vi">Địa chỉ chi tiết (Số nhà, tên đường...) *</span><span class="lang-en">Street Address *</span></label>
              <input type="text" id="checkout-address-detail" required placeholder="Ví dụ: 123 Nguyễn Đình Chiểu, Phường Võ Thị Sáu" style="width:100%; padding:10px 15px; border-radius:6px; border:1px solid var(--color-gray-border); outline:none;">
            </div>

            <div class="form-group">
              <label style="font-size:13px; font-weight:600; display:block; margin-bottom:6px;"><span class="lang-vi">Ghi chú đơn hàng</span><span class="lang-en">Order Notes</span></label>
              <textarea id="checkout-note" placeholder="Nhập ghi chú giao hàng nếu có" rows="3" maxlength="255" style="width:100%; padding:10px 15px; border-radius:6px; border:1px solid var(--color-gray-border); outline:none; font-family:inherit;"></textarea>
            </div>
          </div>

          <!-- Payment -->
          <div class="checkout-form-section bg-cream-light" style="background-color:var(--color-cream-light); padding:25px; border-radius:12px; border:1px solid var(--color-gray-border); margin-bottom:25px;">
            <h3 class="section-form-title font-serif" style="font-size:18px; margin-bottom:20px; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span class="lang-vi">Phương thức thanh toán</span><span class="lang-en">Payment Methods</span>
            </h3>
            
            <div style="display:flex; flex-direction:column; gap:12px;">
              <!-- COD -->
              <label id="method-card-COD" style="display:flex; align-items:center; gap:15px; padding:15px; border:2px solid var(--color-primary); border-radius:8px; cursor:pointer; background:white;">
                <input type="radio" name="paymentMethod" value="COD" checked onclick="selectPaymentMethod('COD')">
                <div style="font-size:24px;">💵</div>
                <div>
                  <strong style="display:block; font-size:14px;"><span class="lang-vi">Thanh toán khi nhận hàng (COD)</span><span class="lang-en">Cash on Delivery (COD)</span></strong>
                  <span style="font-size:12px; color:var(--color-text-light);"><span class="lang-vi">Thanh toán bằng tiền mặt khi nhận hàng tận nhà</span><span class="lang-en">Pay cash at your doorstep</span></span>
                </div>
              </label>

              <!-- Wallet -->
              <label id="method-card-E-wallet" style="display:flex; align-items:center; gap:15px; padding:15px; border:2px solid var(--color-gray-border); border-radius:8px; cursor:pointer; background:white;">
                <input type="radio" name="paymentMethod" value="E-wallet" onclick="selectPaymentMethod('E-wallet')">
                <div style="font-size:24px;">📱</div>
                <div>
                  <strong style="display:block; font-size:14px;"><span class="lang-vi">Ví điện tử MoMo / ZaloPay</span><span class="lang-en">E-Wallets (MoMo/ZaloPay)</span></strong>
                  <span style="font-size:12px; color:var(--color-text-light);"><span class="lang-vi">Thanh toán bằng cách quét mã QR ví điện tử</span><span class="lang-en">Pay securely with QR code scan</span></span>
                </div>
              </label>

              <!-- Bank -->
              <label id="method-card-Bank" style="display:flex; align-items:center; gap:15px; padding:15px; border:2px solid var(--color-gray-border); border-radius:8px; cursor:pointer; background:white;">
                <input type="radio" name="paymentMethod" value="Bank transfer" onclick="selectPaymentMethod('Bank')">
                <div style="font-size:24px;">🏦</div>
                <div>
                  <strong style="display:block; font-size:14px;"><span class="lang-vi">Chuyển khoản ngân hàng</span><span class="lang-en">Direct Bank Transfer</span></strong>
                  <span style="font-size:12px; color:var(--color-text-light);"><span class="lang-vi">Chuyển khoản nhanh qua quét mã VietQR</span><span class="lang-en">Transfer via banking app or VietQR</span></span>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" style="padding:15px 0; font-size:16px;">
            <span class="lang-vi">Đặt Hàng Ngay (${totals.total.toLocaleString()}đ)</span>
            <span class="lang-en">Place Order Now (${totals.total.toLocaleString()}đ)</span>
          </button>
        </form>

        <!-- Right Summary Preview -->
        <div class="checkout-summary-column">
          <div class="summary-card" style="background-color:var(--color-cream-light); padding:25px; border-radius:12px; border:1px solid var(--color-gray-border);">
            <h3 style="font-size:18px; color:var(--color-text-dark); margin:0 0 20px 0; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px;">
              <span class="lang-vi">Đơn hàng của bạn</span><span class="lang-en">Your Order</span>
            </h3>

            <!-- Items -->
            <div class="checkout-preview-items" style="display:flex; flex-direction:column; gap:15px; max-height:260px; overflow-y:auto; margin-bottom:20px; padding-right:5px;">
              ${cartItems.map(item => `
                <div style="display:flex; gap:12px; align-items:center; font-size:13px;">
                  <img src="${item.product.image}" alt="${item.product.name}" style="width:45px; height:45px; border-radius:6px; object-fit:contain; background-color:white; border:1px solid var(--color-gray-border); flex-shrink:0;">
                  <div style="flex:1;">
                    <h4 style="margin:0; font-size:13px; font-weight:600; color:var(--color-text-dark);">${item.product.name}</h4>
                    <span style="font-size:11px; color:var(--color-text-light);">${item.product.price.toLocaleString()}đ x ${item.quantity}</span>
                  </div>
                  <strong>${(item.product.price * item.quantity).toLocaleString()}đ</strong>
                </div>
              `).join("")}
            </div>

            <hr style="border:none; border-top:1px solid var(--color-gray-border); margin:15px 0;">

            <div style="display:flex; flex-direction:column; gap:10px; font-size:14px;">
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
                  <span><span class="lang-vi">Mã giảm giá (${totals.voucherCode}):</span><span class="lang-en">Voucher Discount:</span></span>
                  <span>-${totals.discount.toLocaleString()}đ</span>
                </div>
              ` : ""}

              <hr style="border:none; border-top:1px solid var(--color-gray-border); margin:10px 0;">

              <div style="display:flex; justify-content:space-between; font-size:17px; font-weight:800; color:var(--color-primary);">
                <span><span class="lang-vi">Tổng thanh toán:</span><span class="lang-en">Grand Total:</span></span>
                <span>${totals.total.toLocaleString()}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSuccessScreen(root) {
  if (!window.OrderService) return;
  const order = window.OrderService.getOrderById(placedOrderId);
  if (!order) return;

  root.innerHTML = `
    <div class="checkout-success-container container text-center" style="max-width: 600px; padding: 60px 20px;">
      <div style="width: 80px; height: 80px; background-color: rgba(111, 175, 58, 0.1); color: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 20px auto; font-weight:700;">
        ✓
      </div>
      
      <h1 class="font-serif" style="color: var(--color-text-dark); margin-bottom: 10px;">
        <span class="lang-vi">Đặt Hàng Thành Công!</span><span class="lang-en">Order Placed Successfully!</span>
      </h1>
      <p style="color: var(--color-text-light); font-size: 15px; margin-bottom: 30px; line-height:1.6;">
        <span class="lang-vi">Cảm ơn bạn đã lựa chọn Tứ Quý Garden. Đơn hàng của bạn đã được tiếp nhận và đang được đóng gói giao ngay.</span>
        <span class="lang-en">Thank you for shopping at Tứ Quý Garden. Your order has been received and is being prepared for dispatch.</span>
      </p>

      <div class="order-receipt-card bg-cream-light" style="background-color:var(--color-cream-light); border:1px solid var(--color-gray-border); text-align:left; padding: 25px; border-radius: 12px; margin-bottom: 35px; box-shadow: var(--shadow-sm);">
        <h3 style="border-bottom: 1px dashed var(--color-gray-border); padding-bottom: 12px; margin-bottom: 15px; font-size: 16px; color: var(--color-text-dark);"><span class="lang-vi">Chi tiết đơn hàng</span><span class="lang-en">Receipt Details</span></h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
          <span><span class="lang-vi">Mã đơn hàng:</span><span class="lang-en">Order ID:</span></span>
          <strong>#${order.id}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
          <span><span class="lang-vi">Ngày đặt:</span><span class="lang-en">Order Date:</span></span>
          <strong>${new Date(order.date).toLocaleString()}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
          <span><span class="lang-vi">Người nhận:</span><span class="lang-en">Recipient:</span></span>
          <strong>${order.customerName} - ${order.customerPhone}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
          <span><span class="lang-vi">Địa chỉ giao:</span><span class="lang-en">Delivery to:</span></span>
          <strong style="text-align: right; max-width: 60%;">${order.address}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
          <span><span class="lang-vi">Thanh toán:</span><span class="lang-en">Payment:</span></span>
          <strong>${translatePayment(order.paymentMethod)}</strong>
        </div>
        <hr style="border: none; border-top: 1px dashed var(--color-gray-border); margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 16px;">
          <strong><span class="lang-vi">Tổng thanh toán:</span><span class="lang-en">Total amount:</span></strong>
          <strong style="color: var(--color-primary); font-size: 18px;">${order.total.toLocaleString()}đ</strong>
        </div>
      </div>

      <div style="display: flex; gap: 15px; justify-content: center;">
        <a href="products.html" class="btn btn-outline"><span class="lang-vi">Tiếp tục mua sắm</span><span class="lang-en">Continue Shopping</span></a>
        <a href="profile.html" class="btn btn-primary"><span class="lang-vi">Lịch sử đơn hàng</span><span class="lang-en">View Order History</span></a>
      </div>
    </div>
  `;
}

function translatePayment(m) {
  const t = {
    "COD": "Tiền mặt khi giao hàng (COD)",
    "E-wallet": "Ví điện tử MoMo/ZaloPay",
    "Bank transfer": "Chuyển khoản Internet Banking"
  };
  return t[m] || m;
}

window.handleProvinceChange = function(prov) {
  const distSelect = document.getElementById("checkout-district");
  const wardSelect = document.getElementById("checkout-ward");
  
  if (!distSelect) return;
  
  distSelect.innerHTML = `<option value="">Chọn Quận/Huyện</option>`;
  wardSelect.innerHTML = `<option value="">Chọn Phường/Xã</option>`;

  if (!prov) return;

  const mockDistricts = {
    "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận Bình Thạnh", "TP. Thủ Đức"],
    "Hà Nội": ["Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Cầu Giấy", "Quận Tây Hồ"],
    "Đà Nẵng": ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà"],
    "Tiền Giang": ["Huyện Cái Bè", "Huyện Châu Thành", "Thành phố Mỹ Tho"]
  };

  const list = mockDistricts[prov] || [];
  list.forEach(d => {
    distSelect.innerHTML += `<option value="${d}">${d}</option>`;
  });
};

window.handleDistrictChange = function(dist) {
  const wardSelect = document.getElementById("checkout-ward");
  if (!wardSelect) return;

  wardSelect.innerHTML = `<option value="">Chọn Phường/Xã</option>`;
  if (!dist) return;

  const mockWards = {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao"],
    "Quận 3": ["Phường Võ Thị Sáu", "Phường 12", "Phường 14"],
    "Quận Bình Thạnh": ["Phường 15", "Phường 25", "Phường Trường Thọ"],
    "TP. Thủ Đức": ["Phường Thảo Điền", "Phường An Phú", "Phường Linh Trung"],
    "Quận Hoàn Kiếm": ["Phường Tràng Tiền", "Phường Hàng Đào", "Phường Phan Chu Trinh"],
    "Quận Ba Đình": ["Phường Trúc Bạch", "Phường Kim Mã", "Phường Giảng Võ"],
    "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Nghĩa Tân", "Phường Yên Hòa"],
    "Quận Tây Hồ": ["Phường Quảng An", "Phường Xuân La", "Phường Bưởi"],
    "Quận Hải Châu": ["Phường Thuận Phước", "Phường Thạch Thang", "Phường Hòa Thuận Tây"],
    "Quận Thanh Khê": ["Phường Vĩnh Trung", "Phường Thạc Gián", "Phường Xuân Hà"],
    "Quận Sơn Trà": ["Phường An Hải Bắc", "Phường Phước Mỹ", "Phường Thọ Quang"],
    "Huyện Cái Bè": ["Thị trấn Cái Bè", "Xã Đông Hòa Hiệp", "Xã An Hữu", "Xã Hòa Khánh"],
    "Huyện Châu Thành": ["Thị trấn Tầm Vu", "Xã Tân Hương", "Xã Dưỡng Điềm"],
    "Thành phố Mỹ Tho": ["Phường 1", "Phường 5", "Phường Tân Long"]
  };

  const list = mockWards[dist] || ["Phường Trung tâm", "Xã Trung tâm"];
  list.forEach(w => {
    wardSelect.innerHTML += `<option value="${w}">${w}</option>`;
  });
};

window.selectPaymentMethod = function(method) {
  document.querySelectorAll('[id^="method-card-"]').forEach(card => {
    card.style.borderColor = "var(--color-gray-border)";
  });
  
  const selectedCard = document.getElementById(`method-card-${method}`);
  if (selectedCard) {
    selectedCard.style.borderColor = "var(--color-primary)";
  }
};

window.handlePlaceOrder = function(e) {
  e.preventDefault();

  const fullName = document.getElementById("checkout-name").value;
  const phone = document.getElementById("checkout-phone").value;
  const email = document.getElementById("checkout-email").value;

  const province = document.getElementById("checkout-province").value;
  const district = document.getElementById("checkout-district").value;
  const ward = document.getElementById("checkout-ward").value;
  const address = document.getElementById("checkout-address-detail").value;
  const note = document.getElementById("checkout-note").value;

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (!window.CartService || !window.OrderService) return;
  const totals = window.CartService.getCartTotals();

  const result = window.OrderService.createOrder(
    { fullName, phone, email },
    { province, district, ward, address, note },
    paymentMethod,
    totals
  );

  if (result.success) {
    placedOrderId = result.orderId;
    window.CartService.clearCart(); // clear cart on success!
    window.showToast(result.message, "success");
    // Update badge in common
    if (window.updateHeaderState) window.updateHeaderState();
    
    renderCheckoutPage();
  } else {
    window.showToast(result.message, "error");
  }
};
