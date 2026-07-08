const fs = require('fs');
const path = require('path');

const dirs = [
  'images/Product_Images/03. Hình ảnh/Trái cây',
  'images/Product_Images/03. Hình ảnh/granola',
  'images/Product_Images/03. Hình ảnh/combo'
];

dirs.forEach(d => {
  const full = path.join(__dirname, '..', d);
  if (fs.existsSync(full)) {
    console.log(`Directory: ${d}`);
    const items = fs.readdirSync(full, { withFileTypes: true });
    items.forEach(item => {
      if (item.isDirectory()) {
        const subFiles = fs.readdirSync(path.join(full, item.name));
        console.log(`  Subfolder: "${item.name}" -> ${subFiles.length} files`);
      } else {
        console.log(`  File: "${item.name}"`);
      }
    });
  } else {
    console.log(`Directory does not exist: ${d}`);
  }
});
