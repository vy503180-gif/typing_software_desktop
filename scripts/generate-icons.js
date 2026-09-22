const fs = require('fs');
const path = require('path');

function createPNG(size) {
  // Create a simple PNG file with a teal "T" icon
  // This creates a minimal PNG manually
  
  const width = size;
  const height = size;
  
  // Raw pixel data (RGBA)
  const pixels = Buffer.alloc(width * height * 4);
  
  const margin = Math.floor(size * 0.06);
  const cornerR = Math.floor(size * 0.18);
  const tTopY = Math.floor(height * 0.15);
  const tBotY = Math.floor(height * 0.82);
  const tCrossLeft = Math.floor(width * 0.2);
  const tCrossRight = Math.floor(width * 0.8);
  const tCrossY = Math.floor(height * 0.35);
  const tCrossThick = Math.max(2, Math.floor(height * 0.12));
  const tStemX = Math.floor(width / 2);
  const tStemThick = Math.max(2, Math.floor(width * 0.12));
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      const inside = isInRoundedRect(x, y, width, height, margin, cornerR);
      
      if (inside) {
        const onT = isOnT(x, y, width, height, tTopY, tBotY, tCrossLeft, tCrossRight, tCrossY, tCrossThick, tStemX, tStemThick);
        
        if (onT) {
          // White T
          pixels[idx] = 255;
          pixels[idx + 1] = 255;
          pixels[idx + 2] = 255;
          pixels[idx + 3] = 255;
        } else {
          // Teal background
          pixels[idx] = 13;      // R
          pixels[idx + 1] = 148;  // G
          pixels[idx + 2] = 136;  // B
          pixels[idx + 3] = 255;  // A
        }
      } else {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      }
    }
  }
  
  return encodePNG(width, height, pixels);
}

function isInRoundedRect(x, y, w, h, margin, r) {
  if (x < margin || x >= w - margin || y < margin || y >= h - margin) return false;
  
  const corners = [
    [margin + r, margin + r],
    [w - margin - r, margin + r],
    [margin + r, h - margin - r],
    [w - margin - r, h - margin - r],
  ];
  
  for (const [cx, cy] of corners) {
    const dx = x - cx;
    const dy = y - cy;
    if ((dx < 0 && dy < 0) || (dx > 0 && dy < 0) || (dx < 0 && dy > 0) || (dx > 0 && dy > 0)) {
      if (Math.abs(dx) > r || Math.abs(dy) > r) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > r) return false;
      }
    }
  }
  
  return true;
}

function isOnT(x, y, w, h, tTopY, tBotY, tCrossLeft, tCrossRight, tCrossY, tCrossThick, tStemX, tStemThick) {
  if (y >= tCrossY && y <= tCrossY + tCrossThick && x >= tCrossLeft && x <= tCrossRight) {
    return true;
  }
  
  const stemHalf = Math.floor(tStemThick / 2);
  if (x >= tStemX - stemHalf && x <= tStemX + stemHalf && y >= tCrossY + tCrossThick && y <= tBotY) {
    return true;
  }
  
  return false;
}

// Minimal PNG encoder
function encodePNG(width, height, rgbaPixels) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace
  
  // IDAT - raw image data with zlib
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    rawRows.push(0); // filter: none
    rawRows.push(...rgbaPixels.slice(y * width * 4, (y + 1) * width * 4));
  }
  const rawData = Buffer.from(rawRows);
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  
  // IEND
  const iend = Buffer.alloc(0);
  
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeB = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeB, data]);
    const crc = crc32(crcData);
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeB, data, crcB]);
  }
  
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', iend);
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate files
const assetsDir = path.join(__dirname, '..', 'assets');

// icon.png - 1024x1024
const icon1024 = createPNG(1024);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon1024);
console.log(`Created: assets/icon.png (${icon1024.length} bytes)`);

// favicon.png - 48x48
const favicon48 = createPNG(48);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favicon48);
console.log(`Created: assets/favicon.png (${favicon48.length} bytes)`);

// adaptive-icon.png - 1024x1024 (same as icon)
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), icon1024);
console.log(`Created: assets/adaptive-icon.png (${icon1024.length} bytes)`);
