import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

substitutions = [
    # Footer taglines and address
    ('“Trái tươi bốn mùa, hạt lành mỗi ngày”', '“Fresh fruits seasonal, healthy seeds daily”'),
    ('<span>Địa chỉ: Cái Bè, Tiền Giang</span>', '<span>Address: Cai Be, Tien Giang</span>'),
    ('Địa chỉ: Cái Bè, Tiền Giang', 'Address: Cai Be, Tien Giang'),
    
    # Search placeholder
    ('placeholder="Tìm sản phẩm..."', 'placeholder="Search products..."'),
    ('placeholder="Mã đơn hàng, tên khách hàng..."', 'placeholder="Order ID, customer name..."'),
    ('placeholder="Tìm theo tên sản phẩm..."', 'placeholder="Search by product name..."'),
    
    # Icon titles in headers
    ('title="Tài khoản"', 'title="Account"'),
    ('title="Giỏ hàng"', 'title="Cart"'),
    ('title="Yêu thích"', 'title="Wishlist"'),
    
    # checkout.html specifics
    ('Quay về giỏ hàng', 'Back to cart'),
    ('<b>Giỏ hàng</b>', '<b>Cart</b>'),
    ('<b>Thanh toán</b>', '<b>Checkout</b>'),
    ('<b>Hoàn tất</b>', '<b>Completed</b>'),
    ('Thanh toán an toàn<br>Bảo mật thông tin', 'Secure Payment<br>Data Protection'),
    ('<html lang="vi">', '<html lang="en">'),
    ('<title>Thanh toán đơn hàng | Tứ Quý Garden</title>', '<title>Checkout | Tứ Quý Garden</title>'),
    ('Thanh toán đơn hàng Tứ Quý Garden của bạn an toàn, nhanh chóng.', 'Secure checkout for your Tứ Quý Garden order.'),
    
    # contact.html alert
    ('alert("Vui lòng điền đầy đủ các trường thông tin có dấu *");', 'alert("Please fill in all required fields marked with *");'),
    
    # index.html testimonials
    ('"Nhà tôi hay ăn granola của cửa hàng, giòn tan nhiều hạt không ngọt đường hoá học mà thơm mật hoa dừa tự nhiên. Trái cây tươi ngọt."', 
     '"Our family regularly enjoys the granola from this store. It is super crunchy, packed with nuts, and naturally sweetened with coconut flower nectar instead of artificial sugar. The fresh fruits are also extremely sweet and delicious."'),
    ('Chị Lê Khánh Ly', 'Mrs. Le Khanh Ly'),
    ('"Tứ Quý Garden làm rất tốt việc minh bạch hàm lượng calo, protein, carbs trên từng sản phẩm. Rất phù hợp cho người tập gym cân đối cân nặng."',
     '"Tứ Quý Garden does a wonderful job of providing full transparency on calories, protein, and carbs for every single product. This is incredibly helpful for gym-goers to keep track of their nutrition."'),
    ('Anh Nguyễn Hoàng Quân', 'Mr. Nguyen Hoang Quan'),
    ('"Tôi đã thử quét mã truy xuất nguồn gốc lô xoài cát của vườn, thấy rõ ngày hái và cơ sở đóng gói ở Cái Bè. Sự minh bạch này làm gia đình cực kỳ an tâm."',
     '"I scanned the traceability QR code on the Hoa Loc mango package and could clearly see the exact harvest date and the packaging facility in Cai Be. This transparency gives my family complete peace of mind."'),
    ('Cô Bùi Thị Mai', 'Mrs. Bui Thi Mai'),
    
    # index.html blogs
    ('Chế độ ăn Eat Clean đơn giản cho người bận rộn', 'Simple Eat Clean Diet for Busy People'),
    ('Khám phá các thực đơn dinh dưỡng kết hợp trái cây tươi và hạt chỉ với 15 phút chuẩn bị mỗi ngày...', 
     'Discover simple nutritional meal plans combining fresh tropical fruits and organic seeds with just 15 minutes of daily prep time...'),
    ('Hạt dinh dưỡng - Kho báu vi chất của não bộ', "Nutritional Seeds - A Brain's Micronutrient Treasure"),
    ('Các nghiên cứu chỉ ra việc ăn 30g hạt hạnh nhân, óc chó mỗi ngày giúp giảm 20% nguy cơ tim mạch...',
     'Scientific studies indicate that eating 30g of almonds and walnuts daily reduces cardiovascular risk factors by 20%...'),
    ('Bí quyết ủ hồng giòn tự nhiên không hóa chất', 'Secrets of Natural, Chemical-Free Persimmon Ripening'),
    ('Bí quyết ủ hơi bằng nước ấm và túi giấy giữ trọn vẹn lớp đường mịn thơm ngọt của hồng giòn Đà Lạt...',
     'The traditional secret of warm water and paper bag ripening that preserves the crisp, sweet sugar layer of Da Lat persimmons...'),
    ('placeholder="Nhập địa chỉ email của bạn..."', 'placeholder="Enter your email address..."'),
    
    # index.html scroll text
    ('<span>🍊 Trái tươi bốn mùa</span>', '<span>🍊 Seasonal Fresh Fruits</span>'),
    ('<span>🌿 Hạt lành mỗi ngày</span>', '<span>🌿 Healthy Organic Seeds</span>')
]

for filename in html_files:
    print(f"Translating {filename}...")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for src, dest in substitutions:
        content = content.replace(src, dest)
        
    if content != original_content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"No changes in {filename}")

print("Translation completed successfully!")
