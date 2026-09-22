const fs = require('fs');
const path = require('path');

// Check icon.ico
const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
const ico = fs.readFileSync(icoPath);
console.log('=== icon.ico ===');
console.log('File size:', ico.length, 'bytes');
console.log('Header hex:', ico.slice(0, 6).toString('hex'));
console.log('Reserved:', ico.readUInt16LE(0));
console.log('Type:', ico.readUInt16LE(2), '(1=ICO)');
console.log('Image count:', ico.readUInt16LE(4));

for (let i = 0; i < ico.readUInt16LE(4); i++) {
  const off = 6 + i * 16;
  const w = ico[off] || 256;
  const h = ico[off + 1] || 256;
  const bpp = ico.readUInt16LE(off + 6);
  const size = ico.readUInt32LE(off + 8);
  const offset = ico.readUInt32LE(off + 12);
  console.log(`  Image ${i}: ${w}x${h}, ${bpp}bpp, ${size} bytes at offset ${offset}`);
  
  // Check first 4 bytes of image data to identify format
  const imgStart = offset;
  const sig = ico.slice(imgStart, imgStart + 4).toString('hex');
  if (sig === '89504e47') {
    console.log(`    Format: PNG`);
  } else if (sig === '28000000') {
    console.log(`    Format: BMP`);
  } else {
    console.log(`    Format: Unknown (${sig})`);
  }
}

// Check icon.png
const pngPath = path.join(__dirname, '..', 'assets', 'icon.png');
const png = fs.readFileSync(pngPath);
console.log('\n=== icon.png ===');
console.log('File size:', png.length, 'bytes');
console.log('PNG signature:', png.slice(0, 8).toString('hex'));

// Check if the exe has the icon embedded
const exePath = path.join(__dirname, '..', 'release', 'win-unpacked', 'Antriksh Typing Master.exe');
if (fs.existsSync(exePath)) {
  const exe = fs.readFileSync(exePath);
  console.log('\n=== Antriksh Typing Master.exe ===');
  console.log('EXE size:', exe.length, 'bytes');
  // Search for icon data in exe
  const iconSearch = exe.indexOf('icon.ico');
  console.log('icon.ico reference in exe:', iconSearch > -1 ? 'Found at ' + iconSearch : 'NOT FOUND');
}
