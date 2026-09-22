const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function makeIcon(size) {
  const padding = Math.round(size * 0.06);
  const cornerRadius = Math.round(size * 0.18);
  const innerSize = size - padding * 2;

  const bgSvg = `<svg width="${size}" height="${size}">
    <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" 
      rx="${cornerRadius}" ry="${cornerRadius}" fill="#0d9488"/>
  </svg>`;

  const tCrossLeft = Math.round(size * 0.2);
  const tCrossTop = Math.round(size * 0.15);
  const tCrossW = Math.round(size * 0.6);
  const tCrossH = Math.round(size * 0.12);
  const tStemW = Math.round(size * 0.12);
  const tStemTop = tCrossTop + tCrossH;
  const tStemH = Math.round(size * 0.55);
  const tStemLeft = Math.round((size - tStemW) / 2);

  const tSvg = `<svg width="${size}" height="${size}">
    <rect x="${tCrossLeft}" y="${tCrossTop}" width="${tCrossW}" height="${tCrossH}" rx="${Math.round(size*0.02)}" fill="white"/>
    <rect x="${tStemLeft}" y="${tStemTop}" width="${tStemW}" height="${tStemH}" rx="${Math.round(size*0.02)}" fill="white"/>
  </svg>`;

  return await sharp(Buffer.from(bgSvg))
    .resize(size, size)
    .composite([{ input: Buffer.from(tSvg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

function buildICOfromPNG(pngBuffers, sizes) {
  const count = pngBuffers.length;
  
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);  // ICO type
  header.writeUInt16LE(count, 4);
  
  const dirEntrySize = 16;
  const dirSize = 6 + count * dirEntrySize;
  let dataOffset = dirSize;
  
  const entries = [];
  for (let i = 0; i < count; i++) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(sizes[i] < 256 ? sizes[i] : 0, 0);  // width
    entry.writeUInt8(sizes[i] < 256 ? sizes[i] : 0, 1);  // height
    entry.writeUInt8(0, 2);   // color palette
    entry.writeUInt8(0, 3);   // reserved
    entry.writeUInt16LE(1, 4);   // color planes
    entry.writeUInt16LE(32, 6);  // bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8);  // data size
    entry.writeUInt32LE(dataOffset, 12);  // data offset
    entries.push(entry);
    dataOffset += pngBuffers[i].length;
  }
  
  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

async function generateAllIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  
  // Generate icon.png (1024x1024)
  const icon1024 = await makeIcon(1024);
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon1024);
  console.log('icon.png: ' + icon1024.length + ' bytes');
  
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), icon1024);
  console.log('adaptive-icon.png: OK');
  
  // favicon.png
  const fav48 = await makeIcon(48);
  fs.writeFileSync(path.join(assetsDir, 'favicon.png'), fav48);
  console.log('favicon.png: ' + fav48.length + ' bytes');
  
  // icon.ico - PNG format inside (guaranteed Windows compatible)
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngs = [];
  for (const size of sizes) {
    const buf = await makeIcon(size);
    pngs.push(buf);
    console.log('  PNG ' + size + 'x' + size + ': ' + buf.length + ' bytes');
  }
  
  const ico = buildICOfromPNG(pngs, sizes);
  fs.writeFileSync(path.join(assetsDir, 'icon.ico'), ico);
  console.log('icon.ico: ' + ico.length + ' bytes (PNG format)');
  
  // favicon.ico - just 16x16 PNG
  const fav16 = await makeIcon(16);
  const favIco = buildICOfromPNG([fav16], [16]);
  fs.writeFileSync(path.join(assetsDir, 'favicon.ico'), favIco);
  console.log('favicon.ico: ' + favIco.length + ' bytes');
  
  console.log('\nDone!');
}

generateAllIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
