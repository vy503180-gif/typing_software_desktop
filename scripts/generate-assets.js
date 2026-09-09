// scripts/generate-assets.js
// यह script छोटी-छोटी placeholder images बनाती है
// ताकि app बिना missing asset के चले।
// (बाद में इन्हें real app icon से बदला जा सकता है।)

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// सबसे सरल valid PNG बनाने वाली मदद
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(size, r, g, b) {
  const w = size, h = size;
  // header
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  // raw scanlines (each has filter byte 0)
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const rowStart = y * (1 + w * 3);
    raw[rowStart] = 0;
    for (let x = 0; x < w; x++) {
      const p = rowStart + 1 + x * 3;
      raw[p] = r; raw[p + 1] = g; raw[p + 2] = b;
    }
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const assetsDir = path.join(__dirname, '..', 'assets');

// आइकन: dark navy background के साथ
const icon = makePng(1024, 26, 26, 46);      // #1a1a2e
const splash = makePng(1024, 26, 26, 46);
const adaptive = makePng(1024, 233, 69, 96); // #e94560 accent
const favicon = makePng(48, 233, 69, 96);

fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splash);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptive);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favicon);

console.log('Assets generated successfully!');