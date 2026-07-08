const fs = require('fs');
const path = require('path');

// 1. Read data/data.js
const dataFilePath = path.join(__dirname, '..', 'data', 'data.js');
let content = fs.readFileSync(dataFilePath, 'utf8');

// 2. Eval in mock context to get the data
const mockWindow = {};
const cleanedContent = content.replace(/window\./g, 'mockWindow.');
eval(cleanedContent);

const products = mockWindow.MOCK_PRODUCTS;
const users = mockWindow.MOCK_USERS;

const fruitFolders = [
  "1-Cam xoàn Lai Vung", "10-Măng cụt Lái Thiêu", "11-Dừa xiêm", "12-Dứa mật MD2",
  "13-Sầu riêng Musang King", "14-Ổi giống Đài Loan", "15-Xoài cát chu da vàng",
  "16-Dưa hấu có hạt", "17-Xoài cát Hòa Lộc", "18-Vú sữa tím BT",
  "19-Thanh long ruột tím hồng", "2-Ổi Ruby", "20-Dứa Queen", "21-Chôm chôm giống thái",
  "22-Nhãn tiêu", "23-Mít tố nữ", "24-Hồng giòn ĐL", "25-Na dai ĐT", "26-Chanh dây tím",
  "27-Dâu tây ĐL", "28-Quýt đường miền tây", "29-Nho Bình Thuận", "3-Mận hậu Người Hmong",
  "30-Sapoche TG", "31-Thanh long ruột trắng", "32-Sầu riêng Ri6", "33-Cóc bao tử",
  "34-Roi mận An Phước", "35-Mận HN", "36-Khế ngọt", "37-Nhãn xuồng cơm vàng",
  "38-Chôm chôm nhãn", "39-Bưởi năm roi", "4-Dưa lưới hoàng kim", "40-Na hoàng hậu",
  "41-Dưa lê hoàng kim", "42-Vú sữa lò rèn", "43-Mắc cọp", "44-Chuối Laba",
  "5-Bơ ĐăkLak", "6-Vải thiều BG", "7-Dưa hấu ko hạt", "8-Xoài tứ quý", "9-Bưởi da xanh"
];

products.forEach(p => {
  if (p.category === "Fruits") {
    // Determine the folder name based on product ID
    let folderName = null;
    if (p.id === 1) {
      folderName = "17-Xoài cát Hòa Lộc";
    } else if (p.id >= 2 && p.id <= 17) {
      const prefix = (p.id - 1) + "-";
      folderName = fruitFolders.find(f => f.startsWith(prefix));
    } else if (p.id >= 18 && p.id <= 44) {
      const prefix = p.id + "-";
      folderName = fruitFolders.find(f => f.startsWith(prefix));
    }
    
    if (folderName) {
      const relativeFolder = `images/Product_Images/03. Hình ảnh/Trái cây/${folderName}`;
      const fullFolder = path.join(__dirname, '..', relativeFolder);
      if (fs.existsSync(fullFolder)) {
        const files = fs.readdirSync(fullFolder);
        const imgFiles = files
          .filter(f => ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(f).toLowerCase()))
          .map(f => `${relativeFolder}/${f}`.replace(/\\/g, '/'))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        
        if (imgFiles.length > 0) {
          p.image = imgFiles[0]; // Set main image to high-fidelity first file
          p.gallery = imgFiles;   // Set gallery to all files in subfolder
          console.log(`Fruit ID ${p.id} (${p.name}): Synced ${imgFiles.length} images`);
        }
      }
    } else {
      p.gallery = [p.image];
    }
  } else {
    // For Seeds, Granola, and Combos
    if (!p.image) return;
    
    const imgDir = path.dirname(p.image);
    const parentName = path.basename(imgDir);
    
    // If it points directly to root category folders, do not pad
    if (parentName === "granola" || parentName === "Trái cây" || parentName === "combo" || parentName === "fruits") {
      p.gallery = [p.image];
      console.log(`Product ID ${p.id} (${p.name}): Direct root image, skipped gallery scan.`);
    } else {
      const fullImgDir = path.join(__dirname, '..', imgDir);
      if (fs.existsSync(fullImgDir)) {
        const files = fs.readdirSync(fullImgDir);
        const imgFiles = files
          .filter(f => ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(f).toLowerCase()))
          .map(f => `${imgDir}/${f}`.replace(/\\/g, '/'))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        
        if (imgFiles.length > 0) {
          p.gallery = imgFiles;
          console.log(`Product ID ${p.id} (${p.name}): Synced ${imgFiles.length} images`);
        }
      } else {
        p.gallery = [p.image];
      }
    }
  }
});

// Write it back to data/data.js
const newContent = `// data/data.js
window.MOCK_PRODUCTS = ${JSON.stringify(products, null, 2)};

window.MOCK_USERS = ${JSON.stringify(users, null, 2)};
`;

fs.writeFileSync(dataFilePath, newContent, 'utf8');
console.log("Database data.js successfully updated and synced with disk folders!");
