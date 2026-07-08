import os

files_to_translate = [
    'js/common.js',
    'components/Footer.js',
    'components/Header.js',
    'index.html',
    'products.html',
    'login.html'
]

subs = [
    ('Địa chỉ: Vườn Sinh Thái Tứ Quý, Cái Bè, Tiền Giang', 'Address: Tu Quy Eco-Farm, Cai Be, Tien Giang'),
    ('“Trái tươi bốn mùa, hạt lành mỗi ngày”', '“Fresh fruits seasonal, healthy seeds daily”'),
    ('“Trái tươi bốn mùa, hạt lành mỗi ngày”', '“Fresh fruits seasonal, healthy seeds daily”'),
    ('Trái tươi bốn mùa,<br>hạt lành mỗi ngày', 'Fresh fruits seasonal,<br>healthy seeds daily'),
    ('Trái tươi bốn mùa<br>hạt lành mỗi ngày', 'Fresh fruits seasonal<br>healthy seeds daily'),
    ('placeholder="Tìm sản phẩm..."', 'placeholder="Search products..."'),
    ('placeholder=\\"Tìm sản phẩm...\\"', 'placeholder=\\"Search products...\\"')
]

for filepath in files_to_translate:
    if os.path.exists(filepath):
        print(f"Translating components in {filepath}...")
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for src, dest in subs:
            content = content.replace(src, dest)
            
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
        else:
            print(f"No changes in {filepath}")

print("Component translation finished!")
