import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

nav_subs = [
    ('<li><a href="index.html" class="nav-link">Trang chủ</a></li>', '<li><a href="index.html" class="nav-link"><span class="lang-vi">Trang chủ</span><span class="lang-en">Home</span></a></li>'),
    ('<li><a href="about.html" class="nav-link">Về chúng tôi</a></li>', '<li><a href="about.html" class="nav-link"><span class="lang-vi">Về chúng tôi</span><span class="lang-en">About Us</span></a></li>'),
    ('<li><a href="index.html#footer-contact" class="nav-link">Liên hệ</a></li>', '<li><a href="index.html#footer-contact" class="nav-link"><span class="lang-vi">Liên hệ</span><span class="lang-en">Contact</span></a></li>'),
    ('<li><a href="nutrition.html" class="nav-link">Dinh dưỡng cá nhân</a></li>', '<li><a href="nutrition.html" class="nav-link"><span class="lang-vi">Dinh dưỡng cá nhân</span><span class="lang-en">Personal Nutrition</span></a></li>'),
    ('<li><a href="traceability.html" class="nav-link">Truy xuất nguồn gốc</a></li>', '<li><a href="traceability.html" class="nav-link"><span class="lang-vi">Truy xuất nguồn gốc</span><span class="lang-en">Traceability</span></a></li>'),
    ('<li><a href="about.html" class="nav-link">Giới thiệu</a></li>', '<li><a href="about.html" class="nav-link"><span class="lang-vi">Giới thiệu</span><span class="lang-en">About Us</span></a></li>'),
    ('<span class="btn-text">Yêu thích</span>', '<span class="btn-text"><span class="lang-vi">Yêu thích</span><span class="lang-en">Wishlist</span></span>'),
    ('<span class="btn-text">Giỏ hàng</span>', '<span class="btn-text"><span class="lang-vi">Giỏ hàng</span><span class="lang-en">Cart</span></span>'),
    ('<span class="btn-text" id="header-profile-txt-vi">Tài khoản</span>', '<span class="btn-text" id="header-profile-txt-vi"><span class="lang-vi">Tài khoản</span><span class="lang-en">Account</span></span>'),
    ('<li><a href="index.html" style="color: white; text-decoration: none;">Trang chủ</a></li>', '<li><a href="index.html" style="color: white; text-decoration: none;"><span class="lang-vi">Trang chủ</span><span class="lang-en">Home</span></a></li>'),
    ('<li style="color: rgba(255,255,255,0.6);">Cửa hàng</li>', '<li style="color: rgba(255,255,255,0.6);"><span class="lang-vi">Cửa hàng</span><span class="lang-en">Shop</span></li>')
]

for filename in html_files:
    print(f"Translating nav in {filename}...")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for src, dest in nav_subs:
        content = content.replace(src, dest)
        
    if content != original:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"No changes in {filename}")

print("Nav translation complete!")
