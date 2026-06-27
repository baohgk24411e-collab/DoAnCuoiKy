// components/Footer.js
window.Components = window.Components || {};

window.Components.Footer = function() {
  return `
    <footer class="main-footer">
      <div class="footer-top container">
        <!-- Brand Block -->
        <div class="footer-block brand-block">
          <a href="#home" class="footer-logo">
            <img src="images/logo/logo_white.png" alt="Tứ Quý Garden Logo" class="footer-logo-img">
          </a>
          <p class="footer-tagline">“Trái tươi bốn mùa, hạt lành mỗi ngày”</p>
          <p class="footer-desc">
            Tứ Quý Garden cam kết mang đến nông sản hữu cơ theo mùa tươi ngon, hạt dinh dưỡng chọn lọc và granola lành mạnh nhằm chăm sóc sức khỏe gia đình bạn mỗi ngày.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" title="Facebook" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" class="social-link" title="Instagram" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" class="social-link" title="Zalo" aria-label="Zalo">
              <span class="zalo-text-icon">Z</span>
            </a>
            <a href="#" class="social-link" title="Youtube" aria-label="Youtube">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>

        <!-- Catalog Links -->
        <div class="footer-block">
          <h3 class="footer-title">Danh mục</h3>
          <ul class="footer-links">
            <li><a href="#products?category=Fruits">Trái cây theo mùa</a></li>
            <li><a href="#products?category=Nutritional%20Seeds">Hạt dinh dưỡng</a></li>
            <li><a href="#products?category=Granola">Granola ngũ cốc</a></li>
            <li><a href="#products?category=Combo%20Healthy">Combo sống khỏe</a></li>
            <li><a href="#traceability">Tra cứu nguồn gốc</a></li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div class="footer-block">
          <h3 class="footer-title">Hỗ trợ khách hàng</h3>
          <ul class="footer-links">
            <li><a href="#about">Giới thiệu cửa hàng</a></li>
            <li><a href="#about">Chính sách đổi trả</a></li>
            <li><a href="#about">Chính sách giao nhận</a></li>
            <li><a href="#about">Câu hỏi thường gặp</a></li>
            <li><a href="#about">Điều khoản & Điều kiện</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="footer-block contact-block">
          <h3 class="footer-title">Kết nối với chúng tôi</h3>
          <ul class="contact-info-list">
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>Hotline: <strong>1900 633 123</strong></span>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>Email: <a href="mailto:info@tuquygarden.vn">info@tuquygarden.vn</a></span>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>Địa chỉ: Vườn Sinh Thái Tứ Quý, Cái Bè, Tiền Giang</span>
            </li>
          </ul>
          
          <!-- Newsletter Sub -->
          <div class="footer-newsletter">
            <p class="newsletter-txt">Đăng ký để nhận ưu đãi & tin mới nhất:</p>
            <form class="newsletter-form" id="footer-newsletter-form">
              <input type="email" placeholder="Nhập email của bạn..." required>
              <button type="submit" class="btn btn-secondary">Đăng ký</button>
            </form>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-content">
          <p class="copyright-txt">&copy; 2026 Tứ Quý Garden. Tất cả quyền được bảo lưu.</p>
          <div class="footer-bottom-links">
            <a href="#about">Điều khoản sử dụng</a>
            <span class="divider">|</span>
            <a href="#about">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  `;
};
