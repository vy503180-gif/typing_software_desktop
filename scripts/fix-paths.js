const fs = require('fs');
const path = require('path');

// Fix dist/index.html - convert absolute paths to relative for Electron file:// protocol
const distDir = path.join(__dirname, '..', 'dist');
const htmlPath = path.join(distDir, 'index.html');

if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf-8');
  
  // Convert absolute paths to relative
  html = html.replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"');
  html = html.replace(/src="\/_expo\//g, 'src="./_expo/');
  html = html.replace(/href="\/_expo\//g, 'href="./_expo/');
  
  fs.writeFileSync(htmlPath, html);
  console.log('Fixed: dist/index.html - absolute paths converted to relative');
}

// Also check and fix any .js files that might have absolute asset paths
const jsDir = path.join(distDir, '_expo', 'static', 'js', 'web');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix absolute font paths in the bundle
    const original = content;
    content = content.replace(/"\/node_modules\//g, '"./node_modules/');
    content = content.replace(/"\/_expo\//g, '"./_expo/');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${file} - asset paths converted to relative`);
    }
  }
}

console.log('Post-export fixes complete!');
