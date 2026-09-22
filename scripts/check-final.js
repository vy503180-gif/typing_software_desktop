const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if icon.ico is valid by reading its PNG signature
const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
const ico = fs.readFileSync(icoPath);

// Verify PNG signatures in ICO
const count = ico.readUInt16LE(4);
let allPng = true;
for (let i = 0; i < count; i++) {
  const offset = ico.readUInt32LE(6 + i * 16 + 12);
  const sig = ico.slice(offset, offset + 4).toString('hex');
  if (sig !== '89504e47') {
    allPng = false;
    console.log('Image ' + i + ': NOT PNG (' + sig + ')');
  }
}
console.log('All ICO entries are PNG:', allPng ? 'YES ✓' : 'NO ❌');

// Check exe has icon resource embedded  
const exePath = path.join(__dirname, '..', 'release', 'win-unpacked', 'Antriksh Typing Master.exe');
if (fs.existsSync(exePath)) {
  const exe = fs.readFileSync(exePath);
  // Search for RT_ICON resource signatures
  const hasIconRes = exe.includes('icon.ico');
  console.log('Exe contains icon.ico reference:', hasIconRes ? 'YES ✓' : 'NO ❌');
  
  // Check for common icon patterns in PE header
  const peOffset = exe.readUInt32LE(0x3C);
  console.log('PE header offset:', peOffset);
}

// Check icon.png is valid PNG
const pngPath = path.join(__dirname, '..', 'assets', 'icon.png');
const png = fs.readFileSync(pngPath);
const pngSig = png.slice(0, 8).toString('hex');
console.log('icon.png signature:', pngSig === '89504e470d0a1a0a' ? 'VALID PNG ✓' : 'INVALID (' + pngSig + ')');
console.log('icon.png size:', png.length, 'bytes');

// Check setup file exists
const setupPath = path.join(__dirname, '..', 'release', 'AntrikshTypingMaster-Setup-1.0.0-win.exe');
if (fs.existsSync(setupPath)) {
  console.log('\nSetup file:', setupPath);
  console.log('Setup size:', Math.round(fs.statSync(setupPath).size / 1024 / 1024 * 10) / 10, 'MB');
}
