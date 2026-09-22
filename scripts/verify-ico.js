const fs = require('fs');
const path = require('path');

const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
const buf = fs.readFileSync(icoPath);

console.log('=== ICO File Analysis ===');
console.log('Total size:', buf.length, 'bytes');
console.log('');

// Header
const reserved = buf.readUInt16LE(0);
const type = buf.readUInt16LE(2);
const count = buf.readUInt16LE(4);
console.log('Header:');
console.log('  Reserved:', reserved, '(should be 0)');
console.log('  Type:', type, '(should be 1 for ICO)');
console.log('  Image count:', count);
console.log('');

// Each image entry
for (let i = 0; i < count; i++) {
  const off = 6 + i * 16;
  const w = buf[off] === 0 ? 256 : buf[off];
  const h = buf[off+1] === 0 ? 256 : buf[off+1];
  const colors = buf[off+2];
  const reserved2 = buf[off+3];
  const planes = buf.readUInt16LE(off + 4);
  const bpp = buf.readUInt16LE(off + 6);
  const imgSize = buf.readUInt32LE(off + 8);
  const imgOffset = buf.readUInt32LE(off + 12);
  
  console.log(`Image ${i}: ${w}x${h}`);
  console.log(`  Colors: ${colors}, Reserved: ${reserved2}`);
  console.log(`  Planes: ${planes}, BPP: ${bpp}`);
  console.log(`  Data size: ${imgSize} bytes`);
  console.log(`  Data offset: ${imgOffset}`);
  
  // Check image data format
  const sig = buf.slice(imgOffset, imgOffset + 4);
  const hex = sig.toString('hex');
  if (hex === '89504e47') {
    console.log('  Format: PNG ✓');
  } else if (hex === '28000000') {
    console.log('  Format: BMP (BITMAPINFOHEADER) ✓');
    // Check BMP header
    const bmpW = buf.readInt32LE(imgOffset + 4);
    const bmpH = buf.readInt32LE(imgOffset + 8) / 2; // Doubled for ICO
    const bmpBpp = buf.readUInt16LE(imgOffset + 14);
    console.log(`  BMP dimensions: ${bmpW}x${bmpH}, ${bmpBpp}bpp`);
  } else {
    console.log('  Format: UNKNOWN (' + hex + ') ❌');
  }
  console.log('');
}

// Check if the ICO has proper PNG entries (which Windows 7+ supports)
let hasPng = false;
let hasBmp = false;
for (let i = 0; i < count; i++) {
  const off = 6 + i * 16;
  const imgOffset = buf.readUInt32LE(off + 12);
  const hex = buf.slice(imgOffset, imgOffset + 4).toString('hex');
  if (hex === '89504e47') hasPng = true;
  if (hex === '28000000') hasBmp = true;
}
console.log('Summary:');
console.log('  Has PNG entries:', hasPng);
console.log('  Has BMP entries:', hasBmp);
console.log('  Windows compatible:', hasPng || hasBmp ? 'YES' : 'NO');
