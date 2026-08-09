const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('app/admin', function(file) {
  if (!file.endsWith('.tsx')) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('<img')) {
    if (file.includes('users\\\\page.tsx') || file.includes('users/page.tsx') || file.includes('users\\page.tsx')) {
      content = content.replace(/<img src=\{r\.avatar\} alt="" className="h-8 w-8 rounded-full object-cover border" \/>/g, '<Image src={r.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover border" />');
      content = content.replace(/<img src=\{viewItem\.avatar\} alt="" className="h-16 w-16 rounded-full object-cover" \/>/g, '<Image src={viewItem.avatar} alt="" width={64} height={64} className="h-16 w-16 rounded-full object-cover" />');
      changed = true;
    }
    
    if (file.includes('products\\\\page.tsx') || file.includes('products/page.tsx') || file.includes('products\\page.tsx')) {
      content = content.replace(/<img src=\{r\.images\[0\]\} alt="" className="h-10 w-10 rounded object-cover" \/>/g, '<Image src={r.images[0]} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" />');
      content = content.replace(/<img\s+src=\{img\}\s+alt="[^"]*"\s+className="w-full h-full object-cover"\s+\/>/g, '<Image src={img} alt="Product Image" fill className="object-cover" />');
      changed = true;
    }
    
    if (file.includes('orders\\\\page.tsx') || file.includes('orders/page.tsx') || file.includes('orders\\page.tsx')) {
      content = content.replace(/<img src=\{item\.productImage\} alt="" className="h-10 w-10 rounded object-cover" \/>/g, '<Image src={item.productImage} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" />');
      changed = true;
    }
    
    if (file.includes('categories\\\\page.tsx') || file.includes('categories/page.tsx') || file.includes('categories\\page.tsx')) {
      content = content.replace(/<img src=\{r\.image\} alt="" className="h-10 w-10 rounded object-cover" \/>/g, '<Image src={r.image} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" />');
      content = content.replace(/<img src=\{viewItem\.image\} alt="" className="h-20 w-20 rounded-lg object-cover" \/>/g, '<Image src={viewItem.image} alt="" width={80} height={80} className="h-20 w-20 rounded-lg object-cover" />');
      changed = true;
    }
    
    if (file.includes('banners\\\\page.tsx') || file.includes('banners/page.tsx') || file.includes('banners\\page.tsx')) {
      content = content.replace(/<img src=\{r\.image\} alt="" className="h-10 w-16 rounded object-cover" \/>/g, '<Image src={r.image} alt="" width={64} height={40} className="h-10 w-16 rounded object-cover" />');
      content = content.replace(/<img src=\{viewItem\.image\} alt="" className="h-32 w-full rounded-lg object-cover" \/>/g, '<div className="relative h-32 w-full"><Image src={viewItem.image} alt="" fill className="rounded-lg object-cover" /></div>');
      changed = true;
    }

    if (changed) {
      if (!content.includes("import Image from 'next/image';") && !content.includes('import Image from "next/image";')) {
        content = "import Image from 'next/image';\n" + content;
      }
      fs.writeFileSync(file, content);
      console.log('Updated ' + file);
    }
  }
});
