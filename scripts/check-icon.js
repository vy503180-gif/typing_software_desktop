const sharp = require('sharp');
const path = require('path');

async function check() {
  const meta = await sharp(path.join(__dirname, '..', 'assets', 'icon.png')).metadata();
  console.log('icon.png metadata:', JSON.stringify(meta, null, 2));
  
  const icoMeta = await sharp(path.join(__dirname, '..', 'assets', 'icon.ico')).metadata();
  console.log('icon.ico metadata:', JSON.stringify(icoMeta, null, 2));
  
  const favMeta = await sharp(path.join(__dirname, '..', 'assets', 'favicon.ico')).metadata();
  console.log('favicon.ico metadata:', JSON.stringify(favMeta, null, 2));
}
check();
