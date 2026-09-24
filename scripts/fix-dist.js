const fs = require("fs");
const path = require("path");

const index = path.join(__dirname, "..", "dist", "index.html");
const html = fs.readFileSync(index, "utf8");
const fixed = html
  .replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"')
  .replace(/src="\/_expo\//g, 'src="./_expo/');
fs.writeFileSync(index, fixed);
console.log("dist/index.html paths fixed to relative");