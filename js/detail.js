// js/detail.js

let activeProduct = null;
let activeImage = "";
let quantity = 1;
let activeTab = "description";

document.addEventListener("DOMContentLoaded", () => {
  const productId = parseInt(getUrlParam("id"));
  activeProduct = window.MOCK_PRODUCTS.find(p => p.id === productId);

  const root = document.getElementById("product-detail-root");
  if (!root) return;

  if (!activeProduct) {
    renderNotFound(root);
    return;
  }

  activeImage = activeProduct.image;
  quantity = 1;
  activeTab = "description";

  renderDetails(root);
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

function renderNotFound(root) {
  root.innerHTML = `
    <div class="container text-center" style="padding: 100px 0;">
      <h2 class="font-serif">Không tìm thấy sản phẩm</h2>
      <p>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.</p>
      <a href="products.html" class="btn btn-primary" style="margin-top: 20px;">Về cửa hàng</a>
    </div>
  `;
}

function renderDetails(root) {
  const p = activeProduct;
  const discountPercent = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  const isWishlisted = window.AuthService ? window.AuthService.isInWishlist(p.id) : false;

  // Stars HTML
  let starsHTML = "";
  const fullStars = Math.floor(p.rating);
  const hasHalf = p.rating % 1 >= 0.5;
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHTML += `<span class="star fill">&#9733;</span>`;
    } else if (i === fullStars + 1 && hasHalf) {
      starsHTML += `<span class="star half">&#9733;</span>`;
    } else {
      starsHTML += `<span class="star">&#9734;</span>`;
    }
  }

  // Get related products (same category, excluding current product)
  const related = window.MOCK_PRODUCTS
    .filter(item => item.category === p.category && item.id !== p.id)
    .slice(0, 4);

  root.innerHTML = `
    <div class="product-detail-container container" style="margin-top: 20px; margin-bottom: 50px;">
      <!-- Breadcrumb -->
      <ul class="breadcrumb" style="display:flex; list-style:none; gap:10px; font-size:14px; margin-bottom:25px; padding:0;">
        <li><a href="index.html" style="color:var(--color-text-light);"><span class="lang-vi">Trang chủ</span><span class="lang-en">Home</span></a></li>
        <li><span style="color:var(--color-text-light);">/</span></li>
        <li><a href="products.html?category=${p.category}" style="color:var(--color-text-light);">${translateCategory(p.category)}</a></li>
        <li><span style="color:var(--color-text-light);">/</span></li>
        <li style="color:var(--color-primary); font-weight:600;">${p.name}</li>
      </ul>

      <!-- Main Product Block -->
      <div class="detail-layout-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:40px; margin-bottom:40px;">
        
        <!-- Column 1: Image Gallery -->
        <div class="gallery-wrapper">
          <div class="main-image-container" style="position:relative; background-color:var(--color-cream-light); border-radius:16px; overflow:hidden; display:flex; justify-content:center; align-items:center; height:450px;">
            ${discountPercent > 0 ? `<span class="discount-badge-large" style="position:absolute; top:15px; left:15px; background-color:var(--color-danger); color:white; padding:4px 10px; border-radius:4px; font-weight:700; font-size:14px;">-${discountPercent}%</span>` : ""}
            <img src="${activeImage}" alt="${p.name}" id="main-product-img" style="max-height:90%; max-width:90%; object-fit:contain;">
          </div>
          
          <!-- Gallery Thumbnails -->
          <div class="gallery-thumbnails" style="display:flex; gap:10px; margin-top:15px;">
            ${p.gallery.map(img => `
              <div class="thumb-img ${activeImage === img ? "active" : ""}" style="width:80px; height:80px; background-color:var(--color-cream-light); border:2px solid ${activeImage === img ? "var(--color-primary)" : "transparent"}; border-radius:8px; cursor:pointer; display:flex; justify-content:center; align-items:center; overflow:hidden;" onclick="switchImage('${img}')">
                <img src="${img}" alt="${p.name}" style="max-width:90%; max-height:90%; object-fit:contain;">
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Column 2: Buy Details -->
        <div class="product-buy-details">
          <span class="detail-category" style="color:var(--color-secondary); text-transform:uppercase; font-size:12px; font-weight:700; display:block; margin-bottom:5px;">${translateCategory(p.category)}</span>
          <h1 class="detail-title font-serif" style="font-size:32px; color:var(--color-text-dark); margin-bottom:15px;">${p.name}</h1>
          
          <!-- Rating Row -->
          <div class="detail-rating-row" style="display:flex; align-items:center; gap:12px; font-size:14px; margin-bottom:20px; flex-wrap:wrap;">
            <div class="detail-stars" style="color:var(--color-yellow); display:flex; gap:2px;">${starsHTML}</div>
            <span class="rating-num" style="color:var(--color-text-light);">(${p.rating.toFixed(1)} / 5)</span>
            <span class="divider" style="color:var(--color-gray-border);">|</span>
            <span class="reviews-count" style="color:var(--color-text-light);"><span class="lang-vi">${p.reviews.length} đánh giá</span><span class="lang-en">${p.reviews.length} reviews</span></span>
            <span class="divider" style="color:var(--color-gray-border);">|</span>
            <span class="stock-status ${p.stock > 0 ? "in-stock" : "out-of-stock"}" style="color:${p.stock > 0 ? "var(--color-primary)" : "var(--color-danger)"}; font-weight:600;">
              <span class="lang-vi">${p.stock > 0 ? `Còn hàng (Kho: ${p.stock})` : "Tạm hết hàng"}</span>
              <span class="lang-en">${p.stock > 0 ? `In Stock (Qty: ${p.stock})` : "Out of stock"}</span>
            </span>
          </div>

          <!-- Price Box -->
          <div class="detail-price-box" style="margin-bottom:20px; display:flex; align-items:center; gap:15px;">
            <span class="current-price" style="font-size:28px; font-weight:800; color:var(--color-primary);">${p.price.toLocaleString()}đ</span>
            ${p.oldPrice ? `<span class="old-price" style="font-size:18px; text-decoration:line-through; color:var(--color-text-light);">${p.oldPrice.toLocaleString()}đ</span>` : ""}
          </div>

          <!-- Short description -->
          <p class="detail-short-desc" style="color:var(--color-text-light); margin-bottom:25px; font-size:14px; line-height:1.6;">${p.description}</p>

          <!-- Buy Action Box -->
          <div class="detail-actions-box" style="background-color:var(--color-cream-light); padding:20px; border-radius:12px; margin-bottom:25px; border:1px solid var(--color-gray-border);">
            <div class="quantity-control-row" style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
              <span class="label" style="font-size:14px; font-weight:600;"><span class="lang-vi">Số lượng:</span><span class="lang-en">Quantity:</span></span>
              <div class="quantity-adjuster" style="display:flex; align-items:center; border:1px solid var(--color-gray-border); background:white; border-radius:6px; overflow:hidden; width:120px; justify-content:space-between;">
                <button style="border:none; background:none; padding:8px 12px; cursor:pointer; font-weight:700;" onclick="adjustQuantity(-1)">-</button>
                <input type="number" id="detail-qty-input" value="${quantity}" min="1" max="${p.stock}" style="border:none; width:40px; text-align:center; outline:none; font-weight:600;" onchange="setQuantity(this.value)">
                <button style="border:none; background:none; padding:8px 12px; cursor:pointer; font-weight:700;" onclick="adjustQuantity(1)">+</button>
              </div>
            </div>

            <div class="buy-buttons-row" style="display:flex; gap:12px; flex-wrap:wrap;">
              <button class="btn btn-outline" style="flex:1; padding:12px 20px; font-size:14px; gap:8px;" onclick="addToCart()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <span class="lang-vi">Thêm vào giỏ</span><span class="lang-en">Add to Cart</span>
              </button>
              <button class="btn btn-primary" style="flex:1; padding:12px 20px; font-size:14px;" onclick="buyNow()">
                <span class="lang-vi">Mua ngay</span><span class="lang-en">Buy Now</span>
              </button>
              <button class="btn btn-secondary wishlist-btn-round ${isWishlisted ? "active" : ""}" style="width:45px; height:45px; border-radius:50%; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; background-color:${isWishlisted ? "var(--color-primary)" : "var(--color-yellow)"}; color:${isWishlisted ? "white" : "var(--color-text-dark)"}; border:none; cursor:pointer;" onclick="toggleWishlist()" title="${isWishlisted ? "Bỏ yêu thích" : "Yêu thích"}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="${isWishlisted ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
          </div>

          <!-- Tags -->
          <div class="detail-health-goals" style="margin-bottom:20px; font-size:14px;">
            <strong style="color:var(--color-text-dark); margin-right:10px;"><span class="lang-vi">Phù hợp cho:</span><span class="lang-en">Good for:</span></strong>
            <div class="health-tags" style="display:inline-flex; gap:8px; flex-wrap:wrap; margin-top:5px;">
              ${p.healthGoals.map(goal => `<span class="health-tag-badge" style="background-color:rgba(111, 175, 58, 0.1); color:var(--color-primary); padding:3px 10px; border-radius:15px; font-size:12px; font-weight:600;">${goal}</span>`).join("")}
            </div>
          </div>

          <!-- Commitments -->
          <div class="detail-commitments" style="display:flex; flex-direction:column; gap:8px; border-top:1px solid var(--color-gray-border); padding-top:15px; font-size:13px; color:var(--color-text-light);">
            <div class="commit-item" style="display:flex; align-items:center; gap:8px;">
              <span class="commit-icon" style="color:var(--color-primary); font-weight:700;">✓</span>
              <span><span class="lang-vi">Thanh toán khi nhận hàng (COD)</span><span class="lang-en">Cash on delivery available</span></span>
            </div>
            <div class="commit-item" style="display:flex; align-items:center; gap:8px;">
              <span class="commit-icon" style="color:var(--color-primary); font-weight:700;">✓</span>
              <span><span class="lang-vi">Bao bù 1 đổi 1 trong 24h</span><span class="lang-en">1-to-1 compensation within 24h</span></span>
            </div>
            <div class="commit-item" style="display:flex; align-items:center; gap:8px;">
              <span class="commit-icon" style="color:var(--color-primary); font-weight:700;">✓</span>
              <span><span class="lang-vi">Miễn phí vận chuyển cho đơn từ 1.000.000đ</span><span class="lang-en">Free ship for orders over 1,000,000đ</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle Block: Nutrition & Traceability -->
      <div class="info-blocks-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-bottom:40px;">
        <div class="nutrition-block bg-cream-light" style="background-color:var(--color-cream-light); padding:30px; border-radius:12px; border:1px solid var(--color-gray-border);">
          <h3 class="info-block-title font-serif" style="font-size:18px; color:var(--color-text-dark); margin-bottom:20px; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px;">
            <span class="lang-vi">Bảng giá trị dinh dưỡng (trong 100g)</span>
            <span class="lang-en">Nutrition Facts (per 100g)</span>
          </h3>
          <div class="nutrition-table" style="display:flex; flex-direction:column; gap:10px;">
            <div class="nutri-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Năng lượng</span><span class="lang-en">Calories</span></span>
              <strong>${p.nutrition.calories || "N/A"}</strong>
            </div>
            <div class="nutri-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Chất đạm (Protein)</span><span class="lang-en">Protein</span></span>
              <strong>${p.nutrition.protein || "N/A"}</strong>
            </div>
            <div class="nutri-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Chất bột đường (Carbs)</span><span class="lang-en">Carbohydrates</span></span>
              <strong>${p.nutrition.carbs || "N/A"}</strong>
            </div>
            <div class="nutri-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Chất béo (Fat)</span><span class="lang-en">Fats</span></span>
              <strong>${p.nutrition.fat || "N/A"}</strong>
            </div>
            <div class="nutri-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Chất xơ (Fiber)</span><span class="lang-en">Fiber</span></span>
              <strong>${p.nutrition.fiber || "N/A"}</strong>
            </div>
          </div>
        </div>

        <div class="traceability-block bg-cream-light" style="background-color:var(--color-cream-light); padding:30px; border-radius:12px; border:1px solid var(--color-gray-border);">
          <h3 class="info-block-title font-serif" style="font-size:18px; color:var(--color-text-dark); margin-bottom:20px; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px;">
            <span class="lang-vi">Truy xuất nguồn gốc sản phẩm</span>
            <span class="lang-en">Traceability & Trust Info</span>
          </h3>
          <div class="traceability-data-table" style="display:flex; flex-direction:column; gap:10px;">
            <div class="trace-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Nhà cung cấp:</span><span class="lang-en">Orchard:</span></span>
              <strong>${p.origin}</strong>
            </div>
            <div class="trace-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Vùng trồng:</span><span class="lang-en">Region:</span></span>
              <strong>${p.region}</strong>
            </div>
            <div class="trace-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Ngày thu hoạch:</span><span class="lang-en">Harvest Date:</span></span>
              <strong>${p.harvestDate}</strong>
            </div>
            <div class="trace-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Mã lô hàng (Batch):</span><span class="lang-en">Batch ID:</span></span>
              <strong style="color:var(--color-primary);">#TQG-${p.slug.substring(0,3).toUpperCase()}-${p.id}</strong>
            </div>
            <div class="trace-row" style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--color-gray-border); padding-bottom:6px; font-size:14px;">
              <span><span class="lang-vi">Chứng nhận:</span><span class="lang-en">Certifications:</span></span>
              <div style="display:inline-flex; gap:6px;">
                ${p.certification.map(c => `<span style="background-color:var(--color-primary); color:white; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px;">${c}</span>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lower block: Tabs -->
      <div class="detail-tabs-section" style="margin-bottom:50px;">
        <div class="tabs-nav-header" style="display:flex; gap:10px; border-bottom:2px solid var(--color-gray-border); padding-bottom:0; margin-bottom:20px;">
          <button class="tab-nav-btn ${activeTab === "description" ? "active" : ""}" style="border:none; background:none; padding:12px 20px; font-weight:700; cursor:pointer; border-bottom:3px solid ${activeTab === "description" ? "var(--color-primary)" : "transparent"}; color:${activeTab === "description" ? "var(--color-primary)" : "var(--color-text-light)"}; font-size:15px;" onclick="switchTab('description')">
            <span class="lang-vi">Mô tả sản phẩm</span><span class="lang-en">Description</span>
          </button>
          <button class="tab-nav-btn ${activeTab === "storage" ? "active" : ""}" style="border:none; background:none; padding:12px 20px; font-weight:700; cursor:pointer; border-bottom:3px solid ${activeTab === "storage" ? "var(--color-primary)" : "transparent"}; color:${activeTab === "storage" ? "var(--color-primary)" : "var(--color-text-light)"}; font-size:15px;" onclick="switchTab('storage')">
            <span class="lang-vi">Hướng dẫn bảo quản</span><span class="lang-en">Storage Guidelines</span>
          </button>
          <button class="tab-nav-btn ${activeTab === "reviews" ? "active" : ""}" style="border:none; background:none; padding:12px 20px; font-weight:700; cursor:pointer; border-bottom:3px solid ${activeTab === "reviews" ? "var(--color-primary)" : "transparent"}; color:${activeTab === "reviews" ? "var(--color-primary)" : "var(--color-text-light)"}; font-size:15px;" onclick="switchTab('reviews')">
            <span class="lang-vi">Đánh giá (${p.reviews.length})</span><span class="lang-en">Reviews (${p.reviews.length})</span>
          </button>
        </div>

        <div class="tab-content-body" style="font-size:14px; line-height:1.7; color:var(--color-text-dark);">
          ${renderTabContent()}
        </div>
      </div>

      <!-- Related Products -->
      ${related.length === 0 ? "" : `
        <div class="related-products-section" style="border-top:1px solid var(--color-gray-border); padding-top:40px;">
          <h2 class="section-title font-serif" style="font-size:24px; margin-bottom:25px;">
            <span class="lang-vi">Sản phẩm liên quan</span><span class="lang-en">Related Products</span>
          </h2>
          <div class="products-grid-4" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:20px;">
            ${related.map(item => window.Components.ProductCard(item)).join("")}
          </div>
        </div>
      `}
    </div>
  `;
}

function renderTabContent() {
  const p = activeProduct;
  if (activeTab === "description") {
    return `
      <div class="tab-pane">
        <p style="margin-bottom:15px;">
          <span class="lang-vi">Sản phẩm <strong>${p.name}</strong> được chọn lọc từ nông sản chất lượng cao tại vùng ${p.region}. Chúng tôi luôn áp dụng kỹ thuật thu hoạch đúng vụ để quả và hạt đạt được độ chín ngon, giữ được hàm lượng vitamin cao nhất.</span>
          <span class="lang-en">Our <strong>${p.name}</strong> is hand-picked at premium farms in ${p.region}. We apply standard harvest techniques to guarantee optimal ripeness and high vitamin content.</span>
        </p>
        <p>
          <span class="lang-vi">Dòng sản phẩm thuộc Tứ Quý Garden cam kết 3 KHÔNG: Không chất bảo quản thực vật độc hại, Không dùng chất làm chín nhân tạo, Không pha tạp phụ gia. Đảm bảo an toàn sức khỏe tuyệt đối cho người tiêu dùng văn phòng, tập luyện thể thao và trẻ em gia đình.</span>
          <span class="lang-en">Tứ Quý Garden products guarantee 3 flags: No artificial ripening, No chemical preservatives, No additives. Pure safe foods suitable for athletes, children and office workers.</span>
        </p>
      </div>
    `;
  }
  
  if (activeTab === "storage") {
    return `
      <div class="tab-pane">
        <h4 style="margin-bottom:10px;"><span class="lang-vi">Bảo quản sản phẩm ${p.category === "Fruits" ? "trái cây tươi" : "hạt khô"}:</span><span class="lang-en">Storage for ${p.category === "Fruits" ? "fruits" : "seeds"}:</span></h4>
        <ul style="padding-left: 20px; list-style-type: disc;">
          ${p.category === "Fruits" ? `
            <li><span class="lang-vi">Bảo quản ngăn mát tủ lạnh (8-12°C).</span><span class="lang-en">Keep in refrigerator crisp drawer (8-12°C).</span></li>
            <li><span class="lang-vi">Để nguyên vỏ cuống, tránh rửa nước khi chưa ăn ngay.</span><span class="lang-en">Leave peel intact, avoid washing before storage.</span></li>
            <li><span class="lang-vi">Thời gian bảo quản ngon nhất từ 3-5 ngày.</span><span class="lang-en">Best enjoyed within 3-5 days of delivery.</span></li>
          ` : `
            <li><span class="lang-vi">Bảo quản trong hũ kín nắp hoặc túi zip khóa chặt.</span><span class="lang-en">Store in airtight glass container or zip pouch.</span></li>
            <li><span class="lang-vi">Đặt nơi khô ráo, tránh nắng trực tiếp.</span><span class="lang-en">Place in dry cool cupboard, avoid direct sunlight.</span></li>
            <li><span class="lang-vi">Có thể trữ ngăn mát tủ lạnh duy trì độ giòn tan lâu hơn.</span><span class="lang-en">Can refrigerate to preserve crispy texture for months.</span></li>
          `}
        </ul>
      </div>
    `;
  }

  if (activeTab === "reviews") {
    return `
      <div class="tab-pane">
        <div class="reviews-list-container">
          ${p.reviews.length === 0 ? `
            <p style="color: var(--color-text-light); text-align: center; padding: 20px 0;">Sản phẩm chưa có đánh giá nào. Hãy là người đầu tiên mua và nhận xét!</p>
          ` : p.reviews.map(r => `
            <div class="review-item" style="border-bottom: 1px solid #EAEAEA; padding: 15px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>${r.name}</strong>
                <div style="color: var(--color-yellow); font-size: 14px;">
                  ${"&#9733;".repeat(r.rating)}${"&#9734;".repeat(5 - r.rating)}
                </div>
              </div>
              <p style="color: var(--color-text-light); font-size: 14px; line-height: 1.5;">${r.comment}</p>
            </div>
          `).join("")}

          <div style="margin-top: 25px; text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="showAddReviewModal()"><span class="lang-vi">Viết đánh giá của bạn</span><span class="lang-en">Write a review</span></button>
          </div>
        </div>
      </div>
    `;
  }
}

// Global functions for inline DOM click hooks
window.switchImage = function(img) {
  activeImage = img;
  const mainImg = document.getElementById("main-product-img");
  if (mainImg) mainImg.src = img;

  const thumbs = document.querySelectorAll(".thumb-img");
  thumbs.forEach(t => {
    const isMatch = t.querySelector("img").getAttribute("src") === img;
    if (isMatch) t.style.borderColor = "var(--color-primary)";
    else t.style.borderColor = "transparent";
  });
};

window.switchTab = function(tabName) {
  activeTab = tabName;
  const root = document.getElementById("product-detail-root");
  if (root) renderDetails(root);
};

window.adjustQuantity = function(amount) {
  const nextVal = quantity + amount;
  if (nextVal >= 1 && nextVal <= activeProduct.stock) {
    quantity = nextVal;
    const input = document.getElementById("detail-qty-input");
    if (input) input.value = nextVal;
  }
};

window.setQuantity = function(val) {
  let intVal = parseInt(val) || 1;
  intVal = Math.max(1, Math.min(activeProduct.stock, intVal));
  quantity = intVal;
  const input = document.getElementById("detail-qty-input");
  if (input) input.value = intVal;
};

window.addToCart = function() {
  if (!window.CartService) return;
  const result = window.CartService.addToCart(activeProduct.id, quantity);
  if (result.success) {
    window.showToast(result.message, "success");
    // Update badge in common
    if (window.updateHeaderState) window.updateHeaderState();
  } else {
    window.showToast(result.message, "error");
  }
};

window.buyNow = function() {
  if (!window.CartService) return;
  const result = window.CartService.addToCart(activeProduct.id, quantity);
  if (result.success) {
    window.location.href = "cart.html";
  } else {
    window.showToast(result.message, "error");
  }
};

window.toggleWishlist = function() {
  if (!window.AuthService) return;
  const result = window.AuthService.toggleWishlist(activeProduct.id);
  if (result.success) {
    window.showToast(result.message, "success");
    const root = document.getElementById("product-detail-root");
    if (root) renderDetails(root);
  } else {
    window.showToast(result.message, "error");
    window.location.href = "login.html";
  }
};

window.showAddReviewModal = function() {
  if (!window.AuthService) return;
  const currentUser = window.AuthService.getCurrentUser();
  if (!currentUser) {
    window.showToast("Vui lòng đăng nhập để gửi nhận xét.", "error");
    window.location.href = "login.html";
    return;
  }

  const comment = prompt("Nhập nhận xét đánh giá của bạn:");
  if (comment === null) return;
  if (comment.trim() === "") {
    window.showToast("Nội dung không được bỏ trống.", "error");
    return;
  }

  const ratingStr = prompt("Nhập số sao (1 đến 5):", "5");
  const ratingVal = parseInt(ratingStr) || 5;
  if (ratingVal < 1 || ratingVal > 5) {
    window.showToast("Số sao từ 1 đến 5.", "error");
    return;
  }

  activeProduct.reviews.push({
    name: currentUser.name,
    rating: ratingVal,
    comment: comment
  });

  // Save back to localStorage products
  localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
  window.showToast("Gửi nhận xét thành công!", "success");
  
  activeTab = "reviews";
  const root = document.getElementById("product-detail-root");
  if (root) renderDetails(root);
};
