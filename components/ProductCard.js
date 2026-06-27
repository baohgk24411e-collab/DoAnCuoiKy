// components/ProductCard.js
window.Components = window.Components || {};

window.Components.ProductCard = function(product) {
  const isWishlisted = window.AuthService.isInWishlist(product.id);
  const discountPercent = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  
  let badgeHTML = "";
  if (product.isBestSeller) {
    badgeHTML = `
      <span class="card-badge bestseller-badge">
        <span class="lang-vi">Bán chạy</span>
        <span class="lang-en">Bestseller</span>
      </span>`;
  } else if (product.isSeasonal) {
    badgeHTML = `
      <span class="card-badge seasonal-badge">
        <span class="lang-vi">Theo mùa</span>
        <span class="lang-en">Seasonal</span>
      </span>`;
  }

  let starsHTML = "";
  const fullStars = Math.floor(product.rating);
  const hasHalf = product.rating % 1 >= 0.5;
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHTML += `<span class="star fill">&#9733;</span>`;
    } else if (i === fullStars + 1 && hasHalf) {
      starsHTML += `<span class="star half">&#9733;</span>`;
    } else {
      starsHTML += `<span class="star">&#9733;</span>`;
    }
  }

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="card-img-wrapper">
        ${badgeHTML}
        ${discountPercent > 0 ? `<span class="discount-badge">-${discountPercent}%</span>` : ""}
        
        <button class="wishlist-toggle-btn ${isWishlisted ? "active" : ""}" 
                onclick="event.preventDefault(); event.stopPropagation(); window.handleCardWishlistToggle(${product.id})"
                title="${isWishlisted ? "Bỏ yêu thích" : "Yêu thích"}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" 
               fill="${isWishlisted ? "var(--color-primary)" : "none"}" 
               stroke="${isWishlisted ? "var(--color-primary)" : "currentColor"}" 
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <a href="detail.html?id=${product.id}" class="card-link">
          <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy" 
               onerror="this.onerror=null; this.src='https://placehold.co/300x300?text=${encodeURIComponent(product.name)}'">
        </a>
      </div>

      <div class="card-body">
        <span class="card-category-tag">${translateCategory(product.category)}</span>
        <h3 class="card-title">
          <a href="detail.html?id=${product.id}">${product.name}</a>
        </h3>
        
        <p class="card-origin-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>${product.region}</span>
        </p>

        <div class="card-rating-row">
          <div class="card-stars">${starsHTML}</div>
          <span class="card-rating-num">${product.rating.toFixed(1)}</span>
        </div>

        <div class="card-bottom-row">
          <div class="card-price-box">
            <span class="current-price">${product.price.toLocaleString()}đ</span>
            ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()}đ</span>` : ""}
          </div>
          
          <button class="circle-cart-btn" onclick="event.preventDefault(); window.handleCardAddToCart(${product.id})" title="Thêm giỏ hàng">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
};

function translateCategory(cat) {
  const currentLang = localStorage.getItem("tqg_lang") || "vi";
  if (currentLang === "en") {
    const trans = {
      "Fruits": "Fruits",
      "Nutritional Seeds": "Seeds",
      "Granola": "Granola",
      "Combo Healthy": "Healthy Combos"
    };
    return trans[cat] || cat;
  } else {
    const trans = {
      "Fruits": "Trái cây",
      "Nutritional Seeds": "Hạt dinh dưỡng",
      "Granola": "Granola ngũ cốc",
      "Combo Healthy": "Combo sống khỏe"
    };
    return trans[cat] || cat;
  }
}

window.handleCardAddToCart = function(productId) {
  const result = window.CartService.addToCart(productId, 1);
  const currentLang = localStorage.getItem("tqg_lang") || "vi";
  if (result.success) {
    const msg = currentLang === "en" ? "Added to cart successfully!" : result.message;
    window.showToast(msg, "success");
    // Update cart badge dynamically
    const badge = document.getElementById("header-cart-badge");
    if (badge) {
      const count = window.CartService.getCartCount();
      badge.style.display = "flex";
      badge.innerText = count;
    }
  } else {
    const msg = currentLang === "en" ? "Out of stock!" : result.message;
    window.showToast(msg, "error");
  }
};

window.handleCardWishlistToggle = function(productId) {
  const result = window.AuthService.toggleWishlist(productId);
  const currentLang = localStorage.getItem("tqg_lang") || "vi";
  if (result.success) {
    const msg = currentLang === "en" 
      ? (result.isAdded ? "Added to wishlist!" : "Removed from wishlist!") 
      : result.message;
    window.showToast(msg, "success");
    // Reload if we are on wishlist view to refresh it
    if (window.location.pathname.includes("profile.html")) {
      window.location.reload();
    }
  } else {
    const msg = currentLang === "en" ? "Please login first!" : result.message;
    window.showToast(msg, "error");
  }
};
