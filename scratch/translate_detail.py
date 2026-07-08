import re

# ─── detail.js ──────────────────────────────────────────────────────
subs_js = [
    # translateCategory mapping
    ('"Fruits": "Trái cây tươi ngon"', '"Fruits": "Fresh Fruits"'),
    ('"Nutritional Seeds": "Hạt dinh dưỡng"', '"Nutritional Seeds": "Nutritional Seeds"'),
    ('"Granola": "Granola ngũ cốc"', '"Granola": "Granola Cereal"'),
    ('"Combo Healthy": "Combo sống khỏe"', '"Combo Healthy": "Healthy Combos"'),

    # renderUrgencyRow
    ('Chỉ còn ${product.stock} sản phẩm', 'Only ${product.stock} left in stock'),
    ('${getViewerCount(product)} người đang xem sản phẩm này', '${getViewerCount(product)} people viewing this right now'),

    # renderNotFound
    ('<h2 class="font-serif">Không tìm thấy sản phẩm</h2>', '<h2 class="font-serif">Product Not Found</h2>'),
    ('<p>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.</p>', '<p>The product you are looking for does not exist or has been discontinued.</p>'),
    ('"Về cửa hàng"', '"Back to Shop"'),

    # breadcrumb
    ('<li><a href="index.html">Trang chủ</a></li>', '<li><a href="index.html">Home</a></li>'),

    # gallery nav aria-labels
    ('aria-label="Ảnh trước">‹</button>', 'aria-label="Previous Image">‹</button>'),
    ('aria-label="Ảnh sau">›</button>', 'aria-label="Next Image">›</button>'),

    # trust/shipping info card
    ('<h4>Giao hàng</h4>', '<h4>Shipping</h4>'),
    ('<p>Giao nhanh toàn quốc<br>Miễn phí đơn từ 499K</p>', '<p>Fast nationwide delivery<br>Free for orders over 499K</p>'),
    ('<h4>Miễn phí giao hàng</h4>', '<h4>Free Shipping</h4>'),
    ('<p>Cho đơn từ 499.000đ</p>', '<p>On orders from 499,000đ</p>'),
    ('"Xem chính sách giao hàng ›"', '"View shipping policy ›"'),

    # commitment card
    ('<h4>Cam kết từ Tứ Quý Garden</h4>', '<h4>Our Commitment</h4>'),
    ('<li>Sản phẩm 100% tự nhiên</li>', '<li>100% natural products</li>'),
    ('<li>Không chất bảo quản</li>', '<li>No preservatives</li>'),
    ('<li>Nguyên liệu tuyển chọn</li>', '<li>Premium selected ingredients</li>'),
    ('<li>Sản xuất &amp; đóng gói tại Việt Nam</li>', '<li>Made & packaged in Vietnam</li>'),
    ('"Tìm hiểu thêm về cam kết của chúng tôi ›"', '"Learn more about our commitments ›"'),

    # QR card
    ('<h4>Truy xuất nguồn gốc</h4>', '<h4>Origin Traceability</h4>'),
    ('<p>Quét mã QR để xem hành trình sản phẩm &amp; phân tích dữ liệu chuẩn</p>', '<p>Scan QR code to view the product journey & certified data</p>'),
    ('"Quét QR"', '"Scan QR"'),

    # product buy column
    ('<span class="brand-text">Thương hiệu: Tứ Quý Garden</span>', '<span class="brand-text">Brand: Tứ Quý Garden</span>'),
    ('(${reviewCount} đánh giá)', '(${reviewCount} reviews)'),
    ('Đã bán ${soldCount.toLocaleString("vi-VN")}+', '${soldCount.toLocaleString("en-US")}+ sold'),

    # price — vi-VN locale → en-US, with đ → VND
    ('${p.price.toLocaleString("vi-VN")}đ', '${p.price.toLocaleString("en-US")} VND'),
    ('${p.oldPrice.toLocaleString("vi-VN")}đ', '${p.oldPrice.toLocaleString("en-US")} VND'),
    ('${p.price.toLocaleString("vi-VN")}đ', '${p.price.toLocaleString("en-US")} VND'),  # sticky bar

    # quantity label
    ('<span class="label">Số lượng:</span>', '<span class="label">Quantity:</span>'),
    ('aria-label="Giảm"', 'aria-label="Decrease"'),
    ('aria-label="Tăng"', 'aria-label="Increase"'),

    # buy buttons
    ('<span>Thêm vào giỏ hàng</span>', '<span>Add to Cart</span>'),
    ('<span>Mua ngay</span>', '<span>Buy Now</span>'),

    # mini benefits
    ('<span>100% tự nhiên</span>', '<span>100% Natural</span>'),
    ('<span>Truy xuất rõ ràng</span>', '<span>Clear Traceability</span>'),
    ('<span>Giao hàng nhanh</span>', '<span>Fast Shipping</span>'),
    ('<span>Đổi trả 7 ngày</span>', '<span>7-Day Returns</span>'),

    # social action buttons
    ('Yêu thích\n            </button>', 'Wishlist\n            </button>'),
    ('Chia sẻ\n            </button>', 'Share\n            </button>'),

    # tabs nav
    ('onclick="switchTab(\'description\')">Mô tả</button>', "onclick=\"switchTab('description')\">Description</button>"),
    ('onclick="switchTab(\'ingredients\')">Thành phần</button>', "onclick=\"switchTab('ingredients')\">Ingredients</button>"),
    ('onclick="switchTab(\'nutrition\')">Dinh dưỡng</button>', "onclick=\"switchTab('nutrition')\">Nutrition</button>"),
    ('onclick="switchTab(\'trace\')">Truy xuất nguồn gốc</button>', "onclick=\"switchTab('trace')\">Origin Trace</button>"),
    ('onclick="switchTab(\'reviews\')">Đánh giá (${reviewCount})</button>', "onclick=\"switchTab('reviews')\">Reviews (${reviewCount})</button>"),

    # traceability timeline
    ('<h3 class="section-title text-center">Hành trình minh bạch của sản phẩm</h3>', '<h3 class="section-title text-center">Transparent Product Journey</h3>'),
    ('<h5>Vùng nguyên liệu</h5>', '<h5>Source Region</h5>'),
    ('<p>Đạt chuẩn &amp; ổn định</p>', '<p>Certified & stable</p>'),
    ('<h5>Thu hoạch &amp; Sơ chế</h5>', '<h5>Harvest & Processing</h5>'),
    ('<p>Đúng thời điểm</p>', '<p>At the perfect moment</p>'),
    ('<h5>Tuyển chọn &amp; Kiểm định</h5>', '<h5>Selection & Inspection</h5>'),
    ('<p>Công nghệ hiện đại</p>', '<p>Modern technology</p>'),
    ('<h5>Đóng gói</h5>', '<h5>Packaging</h5>'),
    ('<p>An toàn vệ sinh thực phẩm</p>', '<p>Food safety compliant</p>'),
    ('<h5>Giao hàng</h5>', '<h5>Delivery</h5>'),
    ('<p>Tươi ngon trọn vẹn</p>', '<p>Fresh and intact</p>'),

    # related / combo sections
    ('<h2 class="section-title">Sản phẩm liên quan</h2>', '<h2 class="section-title">Related Products</h2>'),
    ('"Xem tất cả ›"', '"View All ›"'),
    ('aria-label="Cuộn tiếp"', 'aria-label="Scroll next"'),
    ('<h2 class="section-title">Combo tốt cho bạn</h2>', '<h2 class="section-title">Combos For You</h2>'),

    # sticky buy bar
    ('"Mua ngay"', '"Buy Now"'),

    # lightbox aria labels
    ('aria-label="Đóng"', 'aria-label="Close"'),

    # tab – description
    ('được chọn lọc kỹ lưỡng từ nông sản chất lượng cao tại vùng <strong style="color: #8b5e3c;">${p.region}</strong>. \n            Tứ Quý Garden cam kết quy trình thu hoạch khép kín, giữ trọn vẹn hương vị mộc mạc tự nhiên cùng hàm lượng dưỡng chất cao nhất.',
     'is carefully selected from premium produce in the <strong style="color: #8b5e3c;">${p.region}</strong> region. \n            Tứ Quý Garden commits to a closed-loop harvest process, preserving the natural rustic flavor and highest nutrient content.'),
    ('Sản phẩm cam kết không chất bảo quản độc hại, không dùng chất làm chín nhân tạo và không pha tạp phụ gia.\n            Phù hợp cho người ăn Eat Clean, người tập luyện thể thao, dân văn phòng và gia đình hiện đại đang hướng tới lối sống xanh.',
     'No harmful preservatives, no artificial ripening agents, no additives added.\n            Perfect for Eat Clean enthusiasts, athletes, office workers, and modern families embracing a green lifestyle.'),
    ('🌿 Hướng dẫn bảo quản &amp; sử dụng:', '🌿 Storage & Usage Guide:'),
    ('<li>Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.</li>', '<li>Store in a cool, dry place away from direct sunlight.</li>'),
    ('<li>Đậy kín nắp/miệng túi sau khi sử dụng để giữ độ giòn thơm tự nhiên.</li>', '<li>Seal tightly after opening to preserve natural crispness.</li>'),
    ('<li>Dùng trực tiếp hoặc kết hợp cùng sữa chua, sinh tố, salad.</li>', '<li>Enjoy directly or combine with yogurt, smoothies, or salads.</li>'),

    # tab – ingredients
    ('<h4 style="color: var(--color-text-dark); margin-bottom: 15px; font-weight: 700;">Thành phần chính sạch lành:</h4>', '<h4 style="color: var(--color-text-dark); margin-bottom: 15px; font-weight: 700;">Clean & Natural Ingredients:</h4>'),
    ('<li><strong>100% Trái cây chín cây tự nhiên</strong>, thu hoạch trực tiếp tại vườn đối tác đạt chuẩn VietGAP.</li>', '<li><strong>100% naturally tree-ripened fruits</strong>, harvested directly from VietGAP-certified partner orchards.</li>'),
    ('<li><strong>Không tồn dư hóa chất bảo vệ thực vật</strong> vượt ngưỡng quy định.</li>', '<li><strong>No pesticide residues</strong> exceeding regulatory limits.</li>'),
    ('<li>Không dùng chất phủ sáp giữ tươi nhân tạo.</li>', '<li>No artificial wax coatings used.</li>'),
    ('<li><strong>Hạt dinh dưỡng cao cấp</strong> (Hạnh nhân, óc chó, macca, hạt điều...) sấy lạnh giữ trọn tinh dầu.</li>', '<li><strong>Premium nutritional seeds</strong> (Almonds, walnuts, macadamia, cashews...) cold-dried to retain natural oils.</li>'),
    ('<li>Mật ong rừng tự nhiên và yến mạch hữu cơ nhập khẩu đối với các dòng Granola.</li>', '<li>Wild natural honey and imported organic oats for Granola products.</li>'),
    ('<li><strong>Hoàn toàn không đường tinh luyện</strong>, không chất tạo ngọt hóa học.</li>', '<li><strong>Completely free of refined sugar</strong> and chemical sweeteners.</li>'),

    # tab – nutrition
    ('<h4 style="color: var(--color-text-dark); margin-bottom: 8px; font-weight: 700;">Thông tin dinh dưỡng</h4>', '<h4 style="color: var(--color-text-dark); margin-bottom: 8px; font-weight: 700;">Nutrition Information</h4>'),
    ('<p style="font-size: 13.5px; color: var(--color-text-light); margin-bottom: 20px;">* Giá trị trung bình tính trên 100g sản phẩm</p>', '<p style="font-size: 13.5px; color: var(--color-text-light); margin-bottom: 20px;">* Average values per 100g serving</p>'),
    ('>Năng lượng<', '>Energy<'),
    ('>Chất đạm (Protein)<', '>Protein<'),
    ('>Carbohydrate<', '>Carbohydrate<'),
    ('>Chất béo (Lipid)<', '>Fat (Lipid)<'),
    ('>Chất xơ<', '>Dietary Fiber<'),

    # tab – trace
    ('<h4 style="color: var(--color-text-dark); margin-bottom: 18px; font-weight: 700;">Hồ sơ truy xuất nguồn gốc số hóa</h4>', '<h4 style="color: var(--color-text-dark); margin-bottom: 18px; font-weight: 700;">Digitized Origin Traceability Record</h4>'),
    ('>Nhà cung cấp:<', '>Supplier:<'),
    ('>Vùng trồng đạt chuẩn:<', '>Certified Growing Region:<'),
    ('>Ngày thu hoạch:<', '>Harvest Date:<'),
    ('>Mã lô sản phẩm:<', '>Batch Code:<'),
    ('>Tiêu chuẩn chứng nhận:<', '>Certification Standards:<'),

    # tab – reviews (no reviews)
    ('<p>Sản phẩm chưa có nhận xét nào từ khách hàng.</p>', '<p>This product has no customer reviews yet.</p>'),
    ('<p style="font-size: 13px; color: #999;">Hãy là người đầu tiên trải nghiệm và chia sẻ đánh giá của bạn!</p>', '<p style="font-size: 13px; color: #999;">Be the first to experience and share your review!</p>'),
    ('"Viết đánh giá của bạn"', '"Write a Review"'),

    # features array
    ('{ icon: "🌿", text: "100% tự nhiên, không chất bảo quản" }', '{ icon: "🌿", text: "100% natural, no preservatives" }'),
    ('{ icon: "🥗", text: "Giàu chất xơ, vitamin & khoáng chất" }', '{ icon: "🥗", text: "Rich in fiber, vitamins & minerals" }'),
    ('{ icon: "❤️", text: "Tốt cho tim mạch, tiêu hóa và làn da" }', '{ icon: "❤️", text: "Good for heart, digestion & skin" }'),
    ('{ icon: "💪", text: "Phù hợp Eat Clean, Keto, Healthy Lifestyle" }', '{ icon: "💪", text: "Ideal for Eat Clean, Keto, Healthy Lifestyle" }'),

    # toast messages
    ('"Đã sao chép link sản phẩm!"', '"Product link copied!"'),
    ('"Vui lòng đăng nhập để gửi nhận xét."', '"Please log in to submit a review."'),
    ('"Gửi nhận xét thành công!"', '"Review submitted successfully!"'),

    # description fallback line
    ('Sản phẩm <strong style="color: var(--color-primary);">${p.name}</strong>', '<strong style="color: var(--color-primary);">${p.name}</strong>'),
]

with open('js/detail.js', 'r', encoding='utf-8') as f:
    content = f.read()

for old, new in subs_js:
    if old in content:
        content = content.replace(old, new)
        print(f'  ✔ {old[:60]}')
    else:
        print(f'  ✗ NOT FOUND: {old[:60]}')

with open('js/detail.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('\ndetail.js done.')

# ─── detail.html ────────────────────────────────────────────────────
subs_html = [
    ('<title>Chi tiết sản phẩm | Tứ Quý Garden</title>', '<title>Product Detail | Tứ Quý Garden</title>'),
    ('<meta name="description" content="Chi tiết sản phẩm Tứ Quý Garden - dinh dưỡng minh bạch, nguồn gốc rõ ràng.">',
     '<meta name="description" content="Tứ Quý Garden Product Detail — transparent nutrition, clear origin.">'),
    ('<body class="lang-vi">', '<body class="lang-en">'),
]

with open('detail.html', 'r', encoding='utf-8') as f:
    content = f.read()

for old, new in subs_html:
    if old in content:
        content = content.replace(old, new)
        print(f'  ✔ {old[:60]}')
    else:
        print(f'  ✗ NOT FOUND: {old[:60]}')

with open('detail.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('\ndetail.html done.')
